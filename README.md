# Crypto Wallet

A mobile-first cryptocurrency wallet interface built with React, TypeScript, and Vite. The application is designed for Persian-language content and right-to-left navigation, with layouts that adapt to different screen sizes.

## Features

- Wallet overview with Toman and USDT balance views
- Balance visibility control, asset allocation chart, and asset search and filtering
- Market overview and individual asset pages with price charts
- Asset trading, cryptocurrency and Toman deposit and withdrawal flows
- Transaction history and transaction details
- Account settings and payment card management
- Motion feedback for navigation and interactions, with support for reduced-motion preferences

## Requirements

Use a Node.js version supported by the `engines` field in `package.json` (22.22.2+, 24.15.0+, or 26.0.0+).

## Getting Started

```bash
npm install
npm run dev
```

Vite prints the local development URL after the server starts.

## Available Scripts

```bash
npm run dev      # Start the development server
npm test         # Run the test suite
npm run lint     # Run ESLint
npm run build    # Type-check and create a production build
npm run preview  # Serve the production build locally
```

## Deployment

The project can be deployed to Vercel. The included `vercel.json` rewrites application routes to the entry point so direct navigation and page refreshes work with React Router.

## Data and Integrations

The application currently runs without a backend. Balances, prices, cards, and transactions are initialized from local client-side data. Changes are held in memory and reset when the page reloads. Authentication, persistent storage, blockchain connectivity, and real-money transfers are not implemented.
