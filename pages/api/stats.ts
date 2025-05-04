import type { NextApiRequest, NextApiResponse } from 'next';
import { getGlobalStats, getPlayerStats, getBestPlayers, getTopHunters, getTopBounties, getTopHunterWinners, getTopBountyWinners } from '@/lib/data';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { type, playerId } = req.query;

    // Get stats for a specific player
    if (playerId) {
      const stats = getPlayerStats(playerId as string);
      return res.status(200).json(stats);
    }
    
    // Get specific type of stats
    if (type) {
      switch (type) {
        case 'global':
          return res.status(200).json(getGlobalStats());
        case 'best':
          return res.status(200).json(getBestPlayers());
        case 'hunters':
          return res.status(200).json(getTopHunters());
        case 'bounties':
          return res.status(200).json(getTopBounties());
        case 'hunter-winners':
          return res.status(200).json(getTopHunterWinners());
        case 'bounty-winners':
          return res.status(200).json(getTopBountyWinners());
        default:
          return res.status(400).json({ error: 'Invalid stats type' });
      }
    }
    
    // Get global stats by default
    return res.status(200).json(getGlobalStats());
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
} 