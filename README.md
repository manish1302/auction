# IPL Auction Simulator

A local-first React + Vite MVP for a solo IPL auction: you manage Coastal Kings against seven locally simulated AI franchises.

## Run it

```powershell
cd D:\auction
npm install
npm run dev
```

Open the local URL Vite prints (normally `http://localhost:5173`).

## Enable Claude team strategy

1. Copy `.env.example` to `.env`.
2. Add your personal `ANTHROPIC_API_KEY` inside `.env`.
3. Run `npm run dev` and click **Start Claude auction**.

The browser only calls the local `/api/ai/plan` route. That route calls Claude from `server/index.js`; the key is never included in the Vite bundle or sent to the browser. Each of the seven AI teams receives one full-auction planning request that returns a compact strategy, target list, and player valuation map. All bid increments remain local, fast, and dynamically adjusted.

## Verify it

```powershell
npm run build
npm test
npm run lint
```

## Included in this MVP

- 2.5D auction room with animated gavel, auctioneer, bidder seats, bid leader, and player podium.
- One human franchise and seven local AI franchises.
- Full visible player queue. Each AI sees the complete remaining queue when valuing a player.
- Claude-backed pre-auction strategy for all seven AI teams, with local bidding that combines Claude’s whole-auction valuation map with live role, alternative, purse, and roster changes.
- Enforced bidding increments, purse affordability, roster maximum, overseas maximum, and reserve for required squad places.
- Configurable purse, squad limits, and overseas limit. Applying a rules change starts a clean auction.
- Local save/resume using browser storage.
- Rule tests for bidding, budgets, roster constraints, and auction completion.

## Deliberately not connected yet

Claude is never called by the client. The included local server reads `ANTHROPIC_API_KEY` from `.env`; do not place an API key in Vite variables or browser code. The local decision engine handles ordinary bid increments without API calls.

## Next build phase

Replace the short demonstration pool with a complete IPL player dataset, add auction sets and RTM/card rules, then add an Express backend for optional higher-level Claude planning and real multi-session persistence.
