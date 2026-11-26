# VowInvite Studio

Aesthetic digital invitation studio built with React + Vite.

## Run locally
- Node.js LTS
- npm install
- npm run dev
- npm run build

## Vercel
Framework: Vite · Build command: npm run build · Output: dist

## V1.3 features
- Responsive dashboard and invitation editor
- Four themes: Ivory, Botanical, Noir Luxe, Soft Blush
- Draft auto-save in the current browser via localStorage
- Shareable invitation URL carrying encoded invitation details
- Dedicated public invitation landing page
- Event date countdown and Google Maps search link
- RSVP form opens WhatsApp with guest response prefilled
- Local photo gallery with IndexedDB storage in the current browser
- Background music upload and audio preview, stored locally with IndexedDB
- Photo and audio file size/type validation

## Important limitations
This version is frontend-only. Drafts are stored in the current browser and are not synced to a cloud database. RSVP is sent to the host through WhatsApp; it is not stored centrally. The share URL contains the invitation details in its query string. For multi-user accounts, cloud image/audio uploads, durable RSVP records, admin dashboard, and payment, connect a backend/database and storage service.
