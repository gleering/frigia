# Frigia Perfumería — Contexto del Proyecto

## Stack
- **Framework**: Next.js 15 (App Router) + TypeScript
- **DB**: PostgreSQL + Prisma 6 (schema en `prisma/schema.prisma`, config en `prisma.config.ts`)
- **State**: Zustand para carrito (NO Redux)
- **Styles**: Tailwind CSS
- **Auth**: NextAuth.js v5 (`/admin` protegido)
- **Pagos**: MercadoPago (principal) — NO usar Stripe directamente sin consultar
- **Media**: Cloudinary (`/api/upload`)
- **Email**: Resend
- **AI/PIM**: Anthropic SDK (`src/lib/ai.ts`) — usar Batch API para >10 productos

## Comandos
- **Dev**: `npm run dev` → http://localhost:3000
- **DB (local)**: `docker run --name frigia_db -e POSTGRES_USER=frigia -e POSTGRES_PASSWORD=frigia_dev_password -e POSTGRES_DB=frigia_db -p 5432:5432 -d postgres:16-alpine`
- **DB stop**: `docker stop frigia_db && docker rm frigia_db`
- **Migrate**: `npx prisma migrate dev --name <descripcion>`
- **Generate**: `npx prisma generate`
- **Seed**: `npx prisma db seed`
- **Build**: `npm run build`
- **Test**: `npm test`

## Convenciones
- Atributos mandatorios de producto: `brand`, `concentration`, `ml`, `fragranceFamily`, `notes`
- `notes` tiene forma `{ top: string[], heart: string[], base: string[] }`
- Precios en ARS (pesos argentinos) — `Decimal` en DB
- Rutas admin: `/admin/*` — siempre verificar sesión con `auth()`
- Server Actions en `src/app/actions/` — NO crear API routes para operaciones CRUD internas
- Imágenes: siempre subir a Cloudinary antes de guardar URL en DB

## Mercado Argentina
- MercadoPago es el gateway principal — sandbox en `.env.local`
- WhatsApp link: `https://wa.me/${WHATSAPP_NUMBER}` con mensaje URL-encoded
- Precios pueden actualizarse masivamente desde `/admin/productos/precios`

## Hooks de Seguridad (Claude Code)
- NO editar `.env*` directamente — usar `.env.example` como referencia
- NO hardcodear credenciales en código
- NO commitear `.env`, `*.key`, `*.pem`

## Estructura de Carpetas
```
src/
  app/
    (store)/          # Rutas públicas de la tienda
    admin/            # Panel de administración (protegido)
    api/              # Solo webhooks y endpoints externos
    actions/          # Server Actions
  components/
    ui/               # Componentes base (botones, inputs, cards)
    store/            # Componentes de la tienda
    admin/            # Componentes del panel admin
  lib/
    prisma.ts         # Cliente Prisma singleton
    ai.ts             # Cliente Anthropic
    cloudinary.ts     # Upload helper
    mercadopago.ts    # MP SDK helper
    resend.ts         # Email helper
  store/
    cart.ts           # Zustand cart store
  types/
    index.ts          # Tipos globales
```
