# LoopMusic Backend — Guía de instalación y uso

Esta guía te ayuda a levantar el backend con NestJS, Prisma y MongoDB (Atlas o local), y a probar los endpoints de Autenticación y Canciones.

## Requisitos

- Node.js 18+
- NPM 9+ (o PNPM/Yarn si prefieres, adaptando comandos)
- MongoDB disponible de una de estas formas:
  - MongoDB Atlas (recomendado para nube)
  - MongoDB local (puedes usar Docker)

## Variables de entorno

Copia el ejemplo y configura tu conexión a MongoDB y el secreto JWT.

```bash
cp .env.example .env
```

Edita `.env` y define:

```env
# MongoDB Atlas (ejemplo)
DATABASE_URL="mongodb+srv://<USER>:<PASS>@<CLUSTER>.mongodb.net/loopmusic?retryWrites=true&w=majority&appName=<APP_NAME>"

# ó MongoDB local
# DATABASE_URL="mongodb://localhost:27017/loopmusic"

# JWT para firmar tokens (cámbialo en producción)
JWT_SECRET="change_this_in_production"
```

Notas para Atlas:
- En Atlas, habilita tu IP en Network Access.
- Verifica usuario/contraseña de Database Access.

## Instalación

```bash
npm install
```

## Prisma (MongoDB)

Regenera el cliente y sincroniza el esquema con la base de datos:

```bash
npm run prisma:generate
npm run prisma:push
```

Si quieres datos de ejemplo para la página de canciones:

```bash
npm run seed
```

## Ejecutar el backend

```bash
# desarrollo (watch)
npm run start:dev

# o una sola vez
npm run start
```

Por defecto, el backend usa `http://localhost:3000` y CORS está habilitado.

## Endpoints principales

- Auth
  - POST `/auth/register` — Body JSON: `{ "email": "a@b.com", "username": "user", "password": "Secret123!" }`
  - POST `/auth/login` — Body JSON: `{ "email": "a@b.com", "password": "Secret123!" }`
  - Respuesta: `{ user: { id, email, username, createdAt }, token }`

- Songs
  - GET `/songs` — Lista canciones (de `Song` en MongoDB). Requiere que la base esté accesible. Si no hay datos, usa `npm run seed`.

## Estructura relevante

- `src/auth/` — módulo de autenticación (bcrypt + JWT)
- `src/songs/` — módulo de canciones (`GET /songs`)
- `src/prisma/` — `PrismaService` y `PrismaModule`
- `prisma/schema.prisma` — modelos `User` y `Song` para MongoDB
- `scripts/seed.ts` — data de ejemplo para canciones

## Troubleshooting

- Error 500 en endpoints con mensaje "Internal server error":
  - Usualmente indica que la base de datos no está accesible. Revisa `.env` y la conexión a MongoDB.

- Error en `prisma db push` similar a "Server selection timeout" (Atlas):
  - Agrega tu IP en Network Access (Atlas) o habilita acceso desde cualquier IP temporalmente para pruebas.
  - Verifica `<USER>`, `<PASS>`, `<CLUSTER>` y `<APP_NAME>` en `DATABASE_URL`.
  - Si tu red bloquea TLS/puertos, prefiere MongoDB local para desarrollo.

- Usar MongoDB local con Docker:
  - `docker run -d --name loopmusic-mongo -p 27017:27017 mongo:6`
  - En `.env`: `DATABASE_URL=mongodb://localhost:27017/loopmusic`
  - Luego: `npm run prisma:generate && npm run prisma:push && npm run seed`

## Integración con Frontend

- El frontend debe apuntar a `REACT_APP_API_URL=http://localhost:3000` (o la URL donde corra el backend).
- Endpoints usados por el frontend actual: `/auth/register`, `/auth/login`, `/songs`.

---
