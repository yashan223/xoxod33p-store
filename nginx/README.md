# Production Deployment Guide (`/home/admin/xoxod33p-store`)

This directory contains the production configurations for running the store on your VPS at `/home/admin/xoxod33p-store`.

---

## 1. Running the Next.js App on Port 4000

From `/home/admin/xoxod33p-store`, install dependencies and build:
```bash
cd /home/admin/xoxod33p-store
npm install
npm run build
```

### Option A: Using PM2 (Recommended)
```bash
sudo npm install -g pm2
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup
```

### Option B: Using Systemd
```bash
sudo cp deploy/xoxod33p-store.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now xoxod33p-store
```

---

## 2. Nginx Setup

### Step 1: Copy virtual host files to Nginx
```bash
sudo cp /home/admin/xoxod33p-store/nginx/store.xoxod33p.tech.conf /etc/nginx/sites-available/
sudo cp /home/admin/xoxod33p-store/nginx/storerealtime.xoxod33p.tech.conf /etc/nginx/sites-available/
```

### Step 2: Enable both sites
```bash
sudo ln -s /etc/nginx/sites-available/store.xoxod33p.tech.conf /etc/nginx/sites-enabled/
sudo ln -s /etc/nginx/sites-available/storerealtime.xoxod33p.tech.conf /etc/nginx/sites-enabled/
```

### Step 3: Test and reload Nginx
```bash
sudo nginx -t
sudo systemctl reload nginx
```

---

## 3. Enable Free SSL Certificates with Certbot (When Ready)

Once your DNS A records (`store.xoxod33p.tech` and `storerealtime.xoxod33p.tech`) point to your VPS IP:

```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d store.xoxod33p.tech -d storerealtime.xoxod33p.tech
```

---

## 4. Port Mapping Summary

| Subdomain | Target Local Port | Service |
|---|---|---|
| `store.xoxod33p.tech` | `127.0.0.1:4000` | Next.js Frontend & API |
| `storerealtime.xoxod33p.tech` | `127.0.0.1:4001` | WebSocket / Realtime Server |
