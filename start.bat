@echo off
echo ===================================================
echo  MerchantMind: AI Growth & Agentic Commerce
echo  Razorpay Buildathon 2026 - Track 01
echo  Full-Stack Next.js & Node.js Platform
echo ===================================================
echo.

echo Installing dependencies (if needed)...
call npm install

echo.
echo Starting MerchantMind server on http://localhost:3000 ...
echo - App Dashboard:      http://localhost:3000
echo - Conversational Chat: http://localhost:3000/checkout
echo - Product Catalog:     http://localhost:3000/catalog
echo - Campaigns:          http://localhost:3000/campaigns
echo - Audit Trail:        http://localhost:3000/audit
echo ===================================================
npm run dev
pause
