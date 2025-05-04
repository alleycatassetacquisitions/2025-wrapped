import type { NextApiRequest, NextApiResponse } from 'next';
import { getPlayers, getPlayerById, searchPlayers, getPlayersByFaction, getPlayerRanking } from '@/lib/data';
import { getJSONData } from '@/lib/clientData';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { id, search, faction } = req.query;

    // Get specific player by ID
    if (id) {
      try {
        // First try the regular method
        const player = await getPlayerById(id as string);
        
        if (player) {
          // Include player rankings
          const rankings = await getPlayerRanking(id as string);
          return res.status(200).json({
            ...player,
            rankings
          });
        }
        
        // Fallback to direct access if player not found
        console.log(`Player ${id} not found via server method, trying direct access`);
        const playersData = await getJSONData('players.json');
        const directPlayer = playersData.data?.find((p: any) => p.id === id);
        
        if (directPlayer) {
          return res.status(200).json(directPlayer);
        }
        
        return res.status(404).json({ error: 'Player not found' });
      } catch (error) {
        console.error(`Error fetching player ${id}:`, error);
        
        // Last resort fallback
        try {
          const playersData = await getJSONData('players.json');
          const directPlayer = playersData.data?.find((p: any) => p.id === id);
          
          if (directPlayer) {
            return res.status(200).json(directPlayer);
          }
        } catch (fallbackError) {
          console.error('Fallback also failed:', fallbackError);
        }
        
        return res.status(404).json({ error: 'Player not found' });
      }
    }
    
    // Search players
    if (search) {
      try {
        const results = await searchPlayers(search as string);
        return res.status(200).json(results);
      } catch (error) {
        // Fallback to direct search
        try {
          const playersData = await getJSONData('players.json');
          const query = (search as string).toLowerCase();
          const filtered = playersData.data?.filter((player: any) => 
            player.id.includes(query) || 
            player.name.toLowerCase().includes(query)
          ) || [];
          return res.status(200).json(filtered);
        } catch (fallbackError) {
          console.error('Search fallback failed:', fallbackError);
          return res.status(200).json([]);
        }
      }
    }
    
    // Get players by faction
    if (faction) {
      try {
        const results = await getPlayersByFaction(faction as string);
        return res.status(200).json(results);
      } catch (error) {
        // Fallback to direct filtering
        try {
          const playersData = await getJSONData('players.json');
          const factionLower = (faction as string).toLowerCase();
          const filtered = playersData.data?.filter((player: any) => 
            player.faction && player.faction.toLowerCase() === factionLower
          ) || [];
          return res.status(200).json(filtered);
        } catch (fallbackError) {
          console.error('Faction fallback failed:', fallbackError);
          return res.status(200).json([]);
        }
      }
    }
    
    // Get all players
    try {
      const players = await getPlayers();
      return res.status(200).json(players);
    } catch (error) {
      // Fallback to direct access
      try {
        const playersData = await getJSONData('players.json');
        return res.status(200).json(playersData.data || []);
      } catch (fallbackError) {
        console.error('Players fallback failed:', fallbackError);
        return res.status(200).json([]);
      }
    }
  } catch (error: any) {
    console.error('General error in players API:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
} 