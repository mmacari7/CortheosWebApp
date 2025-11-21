# Cortheos Setup Guide

This guide will help you set up the Cortheos application with Auth0 authentication and invite-only registration.

## Architecture Overview

- **Main Domain** (`cortheos.com`): Marketing website with landing page, about, login/register
- **Chat Subdomain** (`chat.cortheos.com`): Protected AI chat application

## Prerequisites

- Node.js 18+
- PostgreSQL database
- Redis instance
- Auth0 account
- Vercel account (for deployment)

## Local Development Setup

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Set Up Auth0

1. Go to [Auth0 Dashboard](https://manage.auth0.com/)
2. Create a new application (Regular Web Application)
3. Configure the following settings:
   - **Allowed Callback URLs**: `http://localhost:3000/api/auth/callback`
   - **Allowed Logout URLs**: `http://localhost:3000`
   - **Allowed Web Origins**: `http://localhost:3000`

4. Copy your credentials to `.env.local`:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your Auth0 credentials:

```env
AUTH0_SECRET=<generate-with-openssl-rand-hex-32>
AUTH0_BASE_URL=http://localhost:3000
AUTH0_ISSUER_BASE_URL=https://your-tenant.auth0.com
AUTH0_CLIENT_ID=<your-client-id>
AUTH0_CLIENT_SECRET=<your-client-secret>
```

### 3. Set Up Database

1. Create a PostgreSQL database
2. Add your database URL to `.env.local`:

```env
POSTGRES_URL=postgresql://user:password@host:port/database
```

3. Run migrations:

```bash
pnpm drizzle-kit push
```

### 4. Generate Invite Codes

You can generate invite codes using the API or directly in the database:

#### Option A: Via Database

```sql
INSERT INTO "InviteCode" (code, "maxUses", "isActive")
VALUES ('ALPHA2024', '100', true);
```

#### Option B: Via API (after starting the app)

```bash
curl -X POST http://localhost:3000/api/invite-code/create \
  -H "Content-Type: application/json" \
  -d '{"maxUses": "100"}'
```

### 5. Start Development Server

```bash
pnpm dev
```

Visit `http://localhost:3000` to see the marketing site.

## Deployment to Vercel

### 1. Deploy to Vercel

```bash
vercel
```

### 2. Configure Custom Domains

In your Vercel project settings:

1. Add `cortheos.com` as a domain
2. Add `chat.cortheos.com` as a domain

### 3. Update Auth0 Settings

Add production URLs to your Auth0 application:

- **Allowed Callback URLs**:
  - `https://cortheos.com/api/auth/callback`
  - `https://chat.cortheos.com/api/auth/callback`
- **Allowed Logout URLs**:
  - `https://cortheos.com`
  - `https://chat.cortheos.com`
- **Allowed Web Origins**:
  - `https://cortheos.com`
  - `https://chat.cortheos.com`

### 4. Set Environment Variables in Vercel

Go to your Vercel project settings and add all environment variables from `.env.local`:

```
AUTH0_SECRET=<your-secret>
AUTH0_BASE_URL=https://cortheos.com
AUTH0_ISSUER_BASE_URL=https://your-tenant.auth0.com
AUTH0_CLIENT_ID=<your-client-id>
AUTH0_CLIENT_SECRET=<your-client-secret>
POSTGRES_URL=<your-postgres-url>
REDIS_URL=<your-redis-url>
BLOB_READ_WRITE_TOKEN=<your-blob-token>
AI_GATEWAY_API_KEY=<your-ai-gateway-key>
```

## User Flow

### Registration (Alpha/Beta)

1. User visits `cortheos.com` and clicks "Sign Up"
2. User is prompted to enter an invite code
3. If valid, user is redirected to Auth0 signup
4. After signup, invite code is marked as used
5. User is redirected to `chat.cortheos.com`

### Login

1. User visits `cortheos.com/login` or `chat.cortheos.com`
2. User clicks "Sign In with Auth0"
3. After authentication, user is redirected to `chat.cortheos.com`

## Database Schema

### InviteCode Table

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| code | varchar(32) | Unique invite code |
| createdAt | timestamp | When code was created |
| usedAt | timestamp | When code was used |
| usedBy | uuid | User who used the code |
| createdBy | uuid | User who created the code |
| maxUses | varchar(10) | Maximum number of uses |
| currentUses | varchar(10) | Current number of uses |
| expiresAt | timestamp | Expiration date |
| isActive | boolean | Whether code is active |

## Middleware Protection

The middleware ([middleware.ts](middleware.ts)) handles:

- Subdomain routing (main vs chat subdomain)
- Authentication protection for chat routes
- Redirects unauthenticated users to login
- Redirects authenticated users away from login/register pages

## API Routes

### Invite Code APIs

- `POST /api/invite-code/validate` - Validate an invite code
- `POST /api/invite-code/create` - Create a new invite code (requires authentication)

### Auth0 APIs

- `GET /api/auth/login` - Initiate login
- `GET /api/auth/logout` - Logout
- `GET /api/auth/signup` - Initiate signup
- `GET /api/auth/callback` - Auth0 callback
- `GET /api/auth/me` - Get current user

## Troubleshooting

### "Invalid invite code" error

- Verify the code exists in the database
- Check if code has expired (`expiresAt`)
- Check if code is active (`isActive = true`)
- Check if max uses reached (`currentUses < maxUses`)

### Auth0 callback errors

- Verify all URLs in Auth0 settings match your domain exactly
- Check `AUTH0_BASE_URL` matches your deployed domain
- Ensure `AUTH0_SECRET` is set and consistent across deploys

### Subdomain routing not working locally

- For local testing, you can use `localhost:3000` (middleware treats it as chat subdomain)
- For true subdomain testing, update your `/etc/hosts` file:
  ```
  127.0.0.1 chat.localhost
  ```

## Next Steps

- [ ] Set up email templates in Auth0
- [ ] Configure Auth0 social connections (Google, GitHub, etc.)
- [ ] Set up monitoring and analytics
- [ ] Create admin dashboard for invite code management
- [ ] Implement user roles and permissions
