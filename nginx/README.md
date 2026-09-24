# Nginx Setup Guide for `store.xoxod33p.tech`

This folder contains the production-ready reverse proxy configuration for the Next.js store.

---

## 1. Quick Installation (Ubuntu / Debian)

### Step 1: Copy configuration to Nginx
```bash
sudo cp nginx/store.xoxod33p.tech.conf /etc/nginx/sites-available/store.xoxod33p.tech.conf
```

### Step 2: Enable the site
```bash
sudo ln -s /etc/nginx/sites-available/store.xoxod33p.tech.conf /etc/nginx/sites-enabled/
```

### Step 3: Obtain SSL Certificate with Certbot
If you don't already have certificates generated for `store.xoxod33p.tech`:

```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d store.xoxod33p.tech
```

> **Note**: Certbot will automatically verify the domain and ensure the SSL paths match `/etc/letsencrypt/live/store.xoxod33p.tech/`.

### Step 4: Test Nginx Configuration
```bash
sudo nginx -t
```

### Step 5: Reload Nginx
```bash
sudo systemctl reload nginx
```

---

## 2. Configuration Highlights

- **Automatic HTTP to HTTPS redirect** (301 redirect).
- **Next.js Upstream proxying** to `127.0.0.1:4000`.
- **WebSocket Upgrade support** for real-time connections and Next.js Fast Refresh.
- **Client Body Limit** set to `100M` to allow admin file and mod uploads.
- **Immutable Static Asset Caching** for `/_next/static/` (1 year max-age).
- **Gzip compression enabled** for JSON, JS, CSS, and SVG.
- **Security Headers**: HSTS, X-Content-Type-Options, X-Frame-Options, Referrer-Policy.
