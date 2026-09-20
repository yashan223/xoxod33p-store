# xoxod33p store

xoxod33p store is a COD4 services storefront for dedicated servers, mods, manual fulfillment, and post-order support.

## Local development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment files

`.env.example` documents every required variable. `.env.local` is ignored by Git and is provided as a local placeholder.

Current configuration groups:

- App and Socket.IO URLs
- MongoDB user/session storage and database name
- Resend verification email credentials
- Admin email allowlist
- Future payment provider credentials
- Realtime service port and internal secret

Add real credentials to `.env.local`. Never commit secrets.

Authentication uses MongoDB users and sessions. New accounts must verify their email through Resend before they can sign in. Configure these values:

```env
MONGODB_URI=mongodb://dropzone_admin:change-me-local@127.0.0.1:27017/dropzone?authSource=admin
MONGODB_DB=dropzone
APP_URL=http://localhost:3000
RESEND_API_KEY=re_your_key
RESEND_FROM_EMAIL=xoxod33p store <noreply@example.com>
ADMIN_EMAILS=admin@example.com
PRODUCT_FILES_ROOT=/var/lib/xoxod33p-store/product-files
```

Product files are stored on the VPS outside `public/`. Upload them from an admin order page; customers can download only when MongoDB confirms that their own order is paid and contains the product. The server streams the file after authorization, so there is no public file URL. Back up `PRODUCT_FILES_ROOT` with the VPS.

## Available scripts

```bash
npm run dev
npm run lint
npm run build
npm run start
npm run db:seed
```

## MongoDB with Docker

Docker Desktop is required. Start the latest MongoDB image with persistent volumes:

```bash
docker compose up -d mongodb
npm run db:up
```

On Windows, you can also run `docker-mongodb.cmd up`.

The container is named `xoxod33p-store-mongodb` and listens on port `27017`. Check its health with:

```bash
docker compose ps
npm run db:status
```

The Windows helper supports `up`, `down`, `logs`, `status`, and `restart`:

```text
docker-mongodb.cmd down
docker-mongodb.cmd logs
docker-mongodb.cmd restart
```

The default local credentials are placeholders in `.env.local`. Change `MONGO_ROOT_PASSWORD` before using this outside local development. The current root connection string for the app is:

```text
mongodb://dropzone_admin:change-me-local@127.0.0.1:27017/dropzone?authSource=admin
```

Stop the service with `docker compose stop mongodb`. Data remains in the named Docker volumes; use `docker compose down -v` only when you intentionally want to delete the database data.

## Payments.lk

Payments.lk is integrated through its hosted checkout. Add a sandbox secret key beginning with `sk_test_` and the webhook signing secret from the Payments.lk dashboard to `.env.local`:

```env
PAYMENTS_LK_SECRET_KEY=sk_test_your_key
PAYMENTS_LK_WEBHOOK_SECRET=whsec_your_secret
```

The storefront sends product IDs to `POST /api/payments/checkout`. The server calculates rupee prices from its catalog, creates an idempotent checkout, and redirects the browser to Payments.lk. Configure the dashboard webhook URL as:

```text
https://your-domain.com/api/payments/webhook
```

Only a verified `payment.succeeded` webhook can be used to mark an order paid. The current webhook logs the verified event; durable MongoDB order fulfillment will be connected in the order-service slice.

## Current product surface

- White editorial storefront redesign
- COD4 server and mod catalog
- Category tabs and catalog search
- Client-side loadout/cart drawer
- Payment-ready checkout placeholder
- Responsive desktop and mobile layout

The next backend slice will add Clerk authentication, MongoDB orders, admin operations, and the dedicated Socket.IO service for realtime order support.

## Clerk admin dashboard

Authentication pages are available at `/sign-in` and `/sign-up`. The protected admin dashboard is available at `/admin`.

In the Clerk Dashboard, open **User & Authentication > Email, phone, username** and enable the registration fields you need: first name, last name, phone number, email address, and password. Clerk will then render those fields on the branded `/sign-up` page and handle verification securely.

Set at least one server-side admin allowlist value in `.env.local`:

```env
ADMIN_USER_IDS=user_xxxxx
ADMIN_EMAILS=admin@xoxod33p.store
```

The admin layout checks the signed-in Clerk user on the server before loading dashboard data. The dashboard currently shows MongoDB product and order metrics plus the live product catalog.

## Database-backed catalog

The storefront no longer contains product mock data. Products are loaded from the MongoDB `products` collection and only active records are shown. After starting MongoDB, populate the initial catalog with:

```bash
npm run db:seed
```

When the database is empty or unavailable, the storefront intentionally shows an empty catalog instead of falling back to fake products.
