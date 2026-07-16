# DonaTech 🤝

Plataforma de crowdfunding social para Colombia con trazabilidad total. Donaciones con impacto real y administración directa de fondos.

> "Nosotros no entregamos el dinero, ejecutamos el cambio."

## Stack Tecnológico

- **Framework**: Next.js 14 (App Router)
- **Base de datos + Auth**: Supabase (PostgreSQL + Storage + Realtime)
- **Pagos**: Wompi (pasarela colombiana — PSE, tarjeta, Nequi)
- **Estilos**: Tailwind CSS + Framer Motion
- **Deploy**: Vercel

## Setup

### 1. Clonar e instalar dependencias

```bash
git clone <repo>
cd dona-tech
npm install
```

### 2. Variables de entorno

Copia `.env.example` a `.env.local` y completa los valores:

```bash
cp .env.example .env.local
```

| Variable | Descripción |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL del proyecto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Anon key de Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (solo servidor) |
| `NEXT_PUBLIC_WOMPI_PUBLIC_KEY` | Public key de Wompi |
| `WOMPI_PRIVATE_KEY` | Private key de Wompi |
| `WOMPI_EVENTS_SECRET` | Secret para validar webhooks de Wompi |
| `NEXT_PUBLIC_APP_URL` | URL pública de la app |

### 3. Configurar Supabase

1. Crea un proyecto en [supabase.com](https://supabase.com)
2. Ve a **SQL Editor** y ejecuta el archivo `supabase-schema.sql`
3. Configura **Google OAuth** en Authentication > Providers
4. Crea los **Storage buckets**:
   - `campaign-images` (público)
   - `campaign-documents` (privado)
   - `profile-avatars` (público)

### 4. Configurar Wompi

1. Registra tu cuenta en [wompi.co](https://wompi.co)
2. Obtén tus llaves de sandbox en el dashboard
3. Configura el webhook URL: `https://tu-dominio.com/api/wompi/webhook`

### 5. Ejecutar en desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000)

## Deploy en Vercel

```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
vercel

# Deploy a producción
vercel --prod
```

Asegúrate de configurar todas las variables de entorno en el dashboard de Vercel.

## Arquitectura

```
/app                    # Next.js App Router
  /page.tsx            # Home con hero + campañas activas
  /campaigns/          # Explorar + detalle de campañas
  /create-campaign/    # Wizard de 5 pasos
  /dashboard/          # Panel del creador
  /admin/              # Panel administrativo
  /auth/callback/      # OAuth callback
  /api/wompi/webhook/  # Webhook de pagos

/components
  /campaigns/          # Cards, grids, detalle
  /donation/           # Widget de donación, lista, éxito
  /forms/              # Wizard de creación
  /realtime/           # Contador en tiempo real, toasts
  /traceability/       # Timeline de hitos
  /comments/           # Sección de comentarios
  /admin/              # Panel de administración
  /dashboard/          # Panel del creador
  /layout/             # Header, Footer

/lib
  /supabase/           # Clientes y tipos
  /wompi/              # Cliente de pagos
  /utils/              # Formateo, slugify, etc.

/hooks                 # useAuth, useRealtimeDonations
```

## Flujo de Donación

1. Usuario elige monto en `/campaigns/[slug]`
2. Se crea registro `donations` con `status: 'pending'`
3. Redirección al checkout de Wompi con `reference = donation.id`
4. Wompi procesa el pago
5. Webhook en `/api/wompi/webhook` recibe la confirmación
6. Se actualiza `donations.status = 'approved'`
7. Trigger SQL actualiza `campaigns.collected_amount`
8. Supabase Realtime propaga el cambio a todos los viewers

## Roles de Usuario

| Rol | Permisos |
|---|---|
| `donor` | Leer campañas, donar, comentar |
| `creator` | Todo de donor + crear campañas, subir trazabilidad |
| `admin` | Todo + aprobar/rechazar campañas, ver KYC |
