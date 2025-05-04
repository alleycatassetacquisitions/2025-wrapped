# Alleycat 2025 Wrapped

A visualization dashboard for the bounty hunting game statistics, presented by Alleycat Asset Aquisitions. This app allows players to explore their personal stats, match history, and leaderboards for the quickdraw duels at 2025.

## About Alleycat Asset Aquisitions

Alleycat Asset Aquisitions is the premier provider of bounty hunting services. We maintain this dashboard to showcase the performance statistics of hunters and bounties throughout the city.

## Features

- **Global Statistics**: View overall game stats, win rates, and fastest times
- **Player Search**: Look up participants by name or ID
- **Personal Stats**: View detailed stats for individual players
- **Leaderboards**: Browse top performing hunters and bounties
- **Match History**: Review match details and outcomes

## Tech Stack

- Next.js
- React
- TypeScript
- Tailwind CSS
- Framer Motion for animations

## Getting Started

First, install the dependencies:

```bash
npm install
# or
yarn install
```

Then, run the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Data Structure

The app uses the following data files in the `data` folder:
- `players.json`: Player information and attributes
- `matches.json`: Match results and timing data
- `best_players.json`: Overall top performers
- `top_hunters.json`: Fastest hunters
- `top_bounties.json`: Fastest bounties

## Deployment

This app is designed to be deployed on Vercel.

## Branding

The app features Alleycat Asset Aquisitions' branding with:
- Red, gold, and orange color theme
- Custom typography
- Company logo and banner 