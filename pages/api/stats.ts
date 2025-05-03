import type { NextApiRequest, NextApiResponse } from 'next';
import { getGlobalStats, getPlayerStats, getBestPlayers, getTopHunters, getTopBounties, getTopHunterWinners, getTopBountyWinners } from '@/lib/data';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { type, playerId } = req.query;

    // Get stats for a specific player
    if (playerId) {
      const stats = await getPlayerStats(playerId as string);
      return res.status(200).json(stats);
    }
    
    // Get specific type of stats
    if (type) {
      switch (type) {
        case 'global':
          return res.status(200).json(await getGlobalStats());
        case 'best':
          return res.status(200).json(await getBestPlayers());
        case 'hunters':
          return res.status(200).json(await getTopHunters());
        case 'bounties':
          return res.status(200).json(await getTopBounties());
        case 'hunter-winners':
          return res.status(200).json(await getTopHunterWinners());
        case 'bounty-winners':
          return res.status(200).json(await getTopBountyWinners());
        default:
          return res.status(400).json({ error: 'Invalid stats type' });
      }
    }
    
    // Get global stats by default
    return res.status(200).json(await getGlobalStats());
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
} 