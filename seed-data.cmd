@echo off
setlocal

echo Seeding product data...
npx tsx scripts/seed-products.ts
exit /b %ERRORLEVEL%