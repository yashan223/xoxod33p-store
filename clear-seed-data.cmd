@echo off
setlocal

echo Clearing seeded product data...
npx tsx scripts/clear-seed-data.ts
exit /b %ERRORLEVEL%