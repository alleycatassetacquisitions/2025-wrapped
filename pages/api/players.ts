import type { NextApiRequest, NextApiResponse } from 'next';
import { getPlayers, getPlayerById, searchPlayers, getPlayersByFaction, getPlayerRanking } from '@/lib/data';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { id, search, faction } = req.query;

    // Get specific player by ID
    if (id) {
      const player = getPlayerById(id as string);
      
      if (!player) {
        return res.status(404).json({ error: 'Player not found' });
      }
      
      // Include player rankings
      const rankings = getPlayerRanking(id as string);
      
      return res.status(200).json({
        ...player,
        rankings
      });
    }
    
    // Search players
    if (search) {
      const results = searchPlayers(search as string);
      return res.status(200).json(results);
    }
    
    // Get players by faction
    if (faction) {
      const results = getPlayersByFaction(faction as string);
      return res.status(200).json(results);
    }
    
    // Get all players
    const players = getPlayers();
    return res.status(200).json(players);
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
} 