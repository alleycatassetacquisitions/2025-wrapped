import type { NextApiRequest, NextApiResponse } from 'next';
import { getMatches, getPlayerMatches } from '@/lib/data';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { playerId } = req.query;

    // Get matches for a specific player
    if (playerId) {
      const matches = await getPlayerMatches(playerId as string);
      return res.status(200).json(matches);
    }
    
    // Get all matches
    const matches = await getMatches();
    return res.status(200).json(matches);
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
} 