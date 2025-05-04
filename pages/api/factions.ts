import type { NextApiRequest, NextApiResponse } from 'next';
import { getAllFactions } from '@/lib/data';
import { getJSONData } from '@/lib/clientData';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    try {
      const factions = await getAllFactions();
      return res.status(200).json(factions);
    } catch (error) {
      console.error('Error fetching factions:', error);
      
      // Fallback: Calculate factions directly from players data
      try {
        const playersData = await getJSONData('players.json');
        const players = playersData.data || [];
        
        const factionSet = new Set<string>();
        
        players.forEach((player: any) => {
          if (player.faction && player.faction.trim() !== '') {
            factionSet.add(player.faction.toLowerCase());
          }
        });
        
        const factions = Array.from(factionSet).sort();
        return res.status(200).json(factions);
      } catch (fallbackError) {
        console.error('Factions fallback failed:', fallbackError);
        return res.status(200).json([]);
      }
    }
  } catch (error: any) {
    console.error('General error in factions API:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
} 