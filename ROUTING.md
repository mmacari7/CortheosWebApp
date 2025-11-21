# Routing Guide

This document explains how routing works in both local development and production.

## Environment Detection

The middleware automatically detects the environment based on hostname:
- **Local Dev**: `localhost` or `127.0.0.1`
- **Production**: Everything else (including Vercel preview URLs)

## Local Development (`http://localhost:3000`)

In local development, **both marketing and chat routes are accessible from the same origin** for convenience:

### Marketing Pages (Public - No Auth)
- `http://localhost:3000/` → Landing page
- `http://localhost:3000/about` → About page
- `http://localhost:3000/login` → Login page
- `http://localhost:3000/register` → Registration page

### Chat Pages (Protected - Requires Auth)
- `http://localhost:3000/chat` → New chat
- `http://localhost:3000/chat/[id]` → Specific chat

### Behavior
- ✅ Root path (`/`) shows marketing page
- ✅ `/chat` routes redirect to `/login` if not authenticated
- ✅ After login, users are redirected back to where they tried to go
- ✅ Authenticated users on `/login` or `/register` are redirected to `/`

---

## Production (Subdomain-based Routing)

In production, **different content is served based on the subdomain**.

### Main Domain (`cortheos.com`)

Shows marketing site:
- `https://cortheos.com/` → Landing page
- `https://cortheos.com/about` → About page
- `https://cortheos.com/login` → Login page
- `https://cortheos.com/register` → Registration page

**What happens if someone tries to access chat?**
- `/chat` or `/api/chat/*` → Automatically redirected to `https://chat.cortheos.com`

### Chat Subdomain (`chat.cortheos.com`)

Shows chat application:
- `https://chat.cortheos.com/` → Chat interface (requires auth)
- `https://chat.cortheos.com/chat/[id]` → Specific chat (requires auth)
- `https://chat.cortheos.com/login` → Login page
- `https://chat.cortheos.com/register` → Registration page

**Authentication flow:**
1. User visits `chat.cortheos.com`
2. Not authenticated → Redirected to `/login`
3. After Auth0 login → Redirected back to chat
4. User can now access chat interface

---

## Testing Production Behavior Locally

If you want to test subdomain routing locally:

### 1. Update `/etc/hosts`
```bash
sudo nano /etc/hosts
```

Add these lines:
```
127.0.0.1 cortheos.local
127.0.0.1 chat.cortheos.local
```

### 2. Update Auth0 Settings

Add callback URLs:
- `http://cortheos.local:3000/api/auth/callback`
- `http://chat.cortheos.local:3000/api/auth/callback`

### 3. Update `.env.local`

```env
AUTH0_BASE_URL=http://cortheos.local:3000
```

### 4. Access the sites

- Marketing: `http://cortheos.local:3000`
- Chat: `http://chat.cortheos.local:3000`

---

## Middleware Logic Summary

```
┌─────────────────────────────────────────┐
│         Request comes in                │
└──────────────┬──────────────────────────┘
               │
               ▼
       Is it localhost?
               │
        ┌──────┴──────┐
        │             │
       YES           NO
        │             │
        │             ▼
        │     Is chat subdomain?
        │             │
        │      ┌──────┴──────┐
        │      │             │
        │     YES           NO
        │      │             │
        ▼      ▼             ▼
   LOCAL DEV  CHAT       MAIN DOMAIN
   ROUTING   SUBDOMAIN   (Marketing)
             (chat.*)
```

### Local Dev Logic
1. `/` → Marketing page
2. `/chat/*` → Protected, require auth
3. `/login`, `/register`, `/about` → Public

### Production - Chat Subdomain Logic
1. `/` → Chat app (require auth)
2. `/chat/*` → Protected, require auth
3. `/login`, `/register` → Public
4. Authenticated users on `/login` → Redirect to `/`

### Production - Main Domain Logic
1. `/` → Marketing page
2. `/about`, `/login`, `/register` → Public pages
3. `/chat/*` → Redirect to `chat.cortheos.com`

---

## Environment Variables

Make sure these are set correctly for each environment:

### Local Development (`.env.local`)
```env
AUTH0_BASE_URL=http://localhost:3000
# or for subdomain testing:
# AUTH0_BASE_URL=http://cortheos.local:3000
```

### Production (Vercel)
```env
AUTH0_BASE_URL=https://cortheos.com
# or
# AUTH0_BASE_URL=https://chat.cortheos.com
```

**Note:** Auth0 can handle multiple callback URLs, so both domains will work.

---

## Common Scenarios

### Scenario 1: User clicks "Chat" from marketing site

**Local Dev:**
- Clicks link to `/chat`
- Redirects to `/login` if not authenticated
- After login, goes to `/chat`

**Production:**
- On `cortheos.com`, clicks link to chat
- Middleware redirects to `chat.cortheos.com`
- Redirects to `/login` if not authenticated
- After login, shows chat interface

### Scenario 2: User types URL directly

**Local Dev:**
- `localhost:3000` → Marketing page
- `localhost:3000/chat` → Chat (or login if not authenticated)

**Production:**
- `cortheos.com` → Marketing page
- `chat.cortheos.com` → Chat (or login if not authenticated)
- `cortheos.com/chat` → Redirects to `chat.cortheos.com`

### Scenario 3: Authenticated user visits login

**Both environments:**
- Redirects to `/` (home/chat depending on subdomain)
- Prevents authenticated users from seeing login page unnecessarily

---

## Troubleshooting

### Issue: Infinite redirect loop
- Check Auth0 callback URLs match your domain exactly
- Ensure `AUTH0_BASE_URL` is set correctly
- Clear cookies and try again

### Issue: "/ shows chat instead of marketing"
- Verify you're not on `chat.` subdomain in production
- In local dev, verify middleware logic

### Issue: Can't access chat locally
- Make sure you're authenticated
- Check that Auth0 credentials are correct
- Verify middleware isn't blocking the route

### Issue: Subdomain redirect not working in production
- Ensure both domains are added in Vercel project settings
- Check DNS records are correct
- Verify middleware `isChatSubdomain` logic
