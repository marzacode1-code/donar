-- =============================================
-- DONA TECH - Supabase Schema with RLS
-- =============================================

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- PROFILES TABLE
-- =============================================
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  avatar_url TEXT,
  email TEXT UNIQUE,
  role TEXT NOT NULL DEFAULT 'donor' CHECK (role IN ('donor', 'creator', 'admin')),
  department TEXT,
  city TEXT,
  kyc_verified BOOLEAN DEFAULT FALSE,
  kyc_document_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles readable" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, full_name, avatar_url, email, role)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url',
    NEW.email,
    'donor'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- =============================================
-- CAMPAIGNS TABLE
-- =============================================
CREATE TABLE campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  creator_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('bienestar_animal', 'ayuda_social', 'salud', 'deporte')),
  department TEXT NOT NULL,
  city TEXT NOT NULL,
  goal_amount INTEGER NOT NULL CHECK (goal_amount > 0),
  collected_amount INTEGER NOT NULL DEFAULT 0,
  cover_image_url TEXT,
  images TEXT[] DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'executing', 'finished', 'rejected')),
  deadline DATE NOT NULL,
  execution_deadline DATE,
  budget_breakdown JSONB DEFAULT '[]',
  rejection_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;

-- Anyone can read active campaigns
CREATE POLICY "Active campaigns readable" ON campaigns
  FOR SELECT USING (status IN ('active', 'executing', 'finished') OR auth.uid() = creator_id OR EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  ));

-- Creators can insert their own campaigns
CREATE POLICY "Creators can create campaigns" ON campaigns
  FOR INSERT WITH CHECK (auth.uid() = creator_id AND EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('creator', 'admin')
  ));

-- Creators can update their own campaigns (limited fields)
CREATE POLICY "Creators can update own campaigns" ON campaigns
  FOR UPDATE USING (auth.uid() = creator_id OR EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  ));

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER campaigns_updated_at
  BEFORE UPDATE ON campaigns
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =============================================
-- DONATIONS TABLE
-- =============================================
CREATE TABLE donations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE NOT NULL,
  donor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  amount INTEGER NOT NULL CHECK (amount > 0),
  wompi_transaction_id TEXT,
  wompi_reference TEXT UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'declined')),
  donor_name TEXT,
  donor_message TEXT,
  is_anonymous BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE donations ENABLE ROW LEVEL SECURITY;

-- Anyone can read approved donations (with anonymous masking handled at app level)
CREATE POLICY "Approved donations readable" ON donations
  FOR SELECT USING (status = 'approved' OR donor_id = auth.uid() OR EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  ));

-- Anyone can insert a donation (even anonymous)
CREATE POLICY "Anyone can donate" ON donations
  FOR INSERT WITH CHECK (true);

-- Only service role can update donation status (via webhook)
CREATE POLICY "Service role updates donations" ON donations
  FOR UPDATE USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  ));

-- Function to update campaign collected amount when donation approved
CREATE OR REPLACE FUNCTION update_campaign_collected()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'approved' AND (OLD.status IS NULL OR OLD.status != 'approved') THEN
    UPDATE campaigns
    SET collected_amount = collected_amount + NEW.amount
    WHERE id = NEW.campaign_id;
  END IF;
  IF OLD.status = 'approved' AND NEW.status != 'approved' THEN
    UPDATE campaigns
    SET collected_amount = GREATEST(0, collected_amount - OLD.amount)
    WHERE id = NEW.campaign_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER donation_approved_update_campaign
  AFTER UPDATE ON donations
  FOR EACH ROW EXECUTE FUNCTION update_campaign_collected();

-- =============================================
-- COMMENTS TABLE
-- =============================================
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL CHECK (length(content) > 0 AND length(content) <= 1000),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Comments readable" ON comments
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can comment" ON comments
  FOR INSERT WITH CHECK (auth.uid() = user_id AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete own comments" ON comments
  FOR DELETE USING (auth.uid() = user_id OR EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  ));

-- =============================================
-- TRACEABILITY UPDATES TABLE
-- =============================================
CREATE TABLE traceability_updates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE NOT NULL,
  stage TEXT NOT NULL CHECK (stage IN ('initial', 'execution', 'final')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  images TEXT[] DEFAULT '{}',
  receipt_urls TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE traceability_updates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Traceability updates readable" ON traceability_updates
  FOR SELECT USING (true);

CREATE POLICY "Creators can add traceability to own campaigns" ON traceability_updates
  FOR INSERT WITH CHECK (EXISTS (
    SELECT 1 FROM campaigns
    WHERE id = campaign_id AND creator_id = auth.uid()
  ) OR EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  ));

-- =============================================
-- PLATFORM STATS VIEW
-- =============================================
CREATE OR REPLACE VIEW platform_stats AS
SELECT
  (SELECT COALESCE(SUM(collected_amount), 0) FROM campaigns WHERE status IN ('active', 'executing', 'finished')) AS total_collected,
  (SELECT COUNT(*) FROM campaigns WHERE status = 'active') AS active_campaigns,
  (SELECT COUNT(*) FROM donations WHERE status = 'approved') AS total_donations,
  (SELECT COUNT(*) FROM profiles) AS total_users;

-- =============================================
-- STORAGE BUCKETS (run via Supabase dashboard or CLI)
-- =============================================
-- INSERT INTO storage.buckets (id, name, public) VALUES ('campaign-images', 'campaign-images', true);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('campaign-documents', 'campaign-documents', false);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('profile-avatars', 'profile-avatars', true);

-- Storage RLS for campaign-images (public read, auth write)
-- CREATE POLICY "Public read campaign images" ON storage.objects FOR SELECT USING (bucket_id = 'campaign-images');
-- CREATE POLICY "Auth upload campaign images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'campaign-images' AND auth.uid() IS NOT NULL);

-- Enable realtime for donations and campaigns
ALTER PUBLICATION supabase_realtime ADD TABLE donations;
ALTER PUBLICATION supabase_realtime ADD TABLE campaigns;
ALTER PUBLICATION supabase_realtime ADD TABLE traceability_updates;
