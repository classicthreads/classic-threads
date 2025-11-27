# Render-Drive-Shop

## Run locally
1. `npm install`
2. `npm run dev` (or `npm start`)
3. Open http://localhost:3000

Admin UI: http://localhost:3000/admin.html

## Deploy to Render.com
- Create new **Web Service** on Render
- Connect your GitHub repo or upload the code
- Build command: none
- Start command: `npm start`
- Set environment `PORT` if needed (Render sets automatically)

Uploads and data files (`uploads/` and `data/products.json`) are stored in the web service filesystem. **Note:** For multi-instance scaling or long-term persistence, use external storage (S3 / Google Cloud Storage) or a real database.

## Notes
- This example is intentionally minimal for clarity.
- Do not use for sensitive production without adding authentication, validation, and sanitization.
