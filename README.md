# TrafficJamz

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app). It powers the TrafficJamz media platform — a multi-device experience for real-time audio, music, and location sharing across active groups.

## 🚀 Getting Started

To run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
Then open http://localhost:3000 in your browser.

⚠️ Note: This project uses static export (output: 'export' in next.config.js). To preview the production build locally, use:

bash
npm run build
npm run export
npx serve out
🛠️ Editing Pages
Main entry point: app/page.tsx All components are modular and live under /components. Brand assets and media tiles are served from /public.

Fonts are optimized using next/font, with Geist as the default typeface.

📚 Learn More
Next.js Documentation — full API and feature reference

Learn Next.js — interactive tutorial

Next.js GitHub — contribute or explore issues

🚢 Deploying
Deploy via Vercel for seamless CI/CD and global edge delivery.

For deployment details, see Next.js deployment docs.

🧠 Notes for Future Contributors
All scripts and Dockerfiles include top-of-file usage comments for clarity

Static assets should be optimized and named consistently for brand fidelity

Layout components enforce spacing, typography, and gradient standards

Automation pipelines (e.g. n8n) are documented separately in /docs