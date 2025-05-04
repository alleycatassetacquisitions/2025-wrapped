import type { NextApiRequest, NextApiResponse } from 'next';
import { getPlayers, getPlayerById, searchPlayers, getPlayersByFaction, getPlayerRanking } from '@/lib/data';
import { getJSONData } from '@/lib/clientData';
import { getCachedData } from '@/components/DataPreloader';

// Utility function to log and return player data
async function getPlayersData() {
  console.log('Attempting to load players data...');
  try {
    // Try cached/direct method first as it's most reliable in production
    const playersData = await getCachedData('players.json');
    
    if (playersData && playersData.data && playersData.data.length > 0) {
      console.log(`Successfully loaded ${playersData.data.length} players via cached/direct access`);
      return playersData.data;
    }
    
    // Fall back to server method
    console.log('Direct file access returned empty array, trying server method');
    const players = await getPlayers();
    
    if (players && players.length > 0) {
      console.log(`Successfully loaded ${players.length} players via server method`);
      return players;
    }
    
    console.error('All player loading methods failed');
    return [];
  } catch (error) {
    console.error('Failed to load players data:', error);
    return [];
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { id, search, faction } = req.query;
    
    console.log(`API Request: ${req.url}`);

    // Get specific player by ID
    if (id) {
      console.log(`Looking for player with ID: ${id}`);
      
      // Load all players and find the one we need
      const allPlayers = await getPlayersData();
      
      // Try to match the ID in various ways
      const player = allPlayers.find((p: any) => 
        p.id === id || 
        p.id === Number(id) || 
        p.id.toString() === id.toString()
      );
      
      if (player) {
        console.log(`Found player: ${player.name}`);
        // Add mock rankings since the real calculation might fail
        const rankings = { 
          overall: 1, 
          hunter: player.hunter === 1 ? 1 : 0, 
          bounty: player.hunter === 0 ? 1 : 0 
        };
        
        try {
          // Try to get real rankings if possible
          const realRankings = await getPlayerRanking(id as string);
          if (realRankings) {
            Object.assign(rankings, realRankings);
          }
        } catch (e) {
          console.error('Failed to get rankings, using mock data:', e);
        }
        
        return res.status(200).json({
          ...player,
          rankings
        });
      }
      
      console.error(`Player with ID ${id} not found in ${allPlayers.length} players`);
      
      // Log the first few players for debugging
      if (allPlayers.length > 0) {
        console.log('First few players:', allPlayers.slice(0, 3));
      }
      
      return res.status(404).json({ error: 'Player not found' });
    }
    
    // Search players
    if (search) {
      console.log(`Searching for players matching: ${search}`);
      try {
        const results = await searchPlayers(search as string);
        if (results && results.length > 0) {
          return res.status(200).json(results);
        }
        
        // Fallback to direct search
        const allPlayers = await getPlayersData();
        const query = (search as string).toLowerCase();
        const filtered = allPlayers.filter((player: any) => 
          player.id.includes(query) || 
          player.name.toLowerCase().includes(query)
        );
        
        return res.status(200).json(filtered);
      } catch (error) {
        console.error('Search failed:', error);
        return res.status(200).json([]);
      }
    }
    
    // Get players by faction
    if (faction) {
      console.log(`Getting players from faction: ${faction}`);
      try {
        const results = await getPlayersByFaction(faction as string);
        if (results && results.length > 0) {
          return res.status(200).json(results);
        }
        
        // Fallback to direct filtering
        const allPlayers = await getPlayersData();
        const factionLower = (faction as string).toLowerCase();
        const filtered = allPlayers.filter((player: any) => 
          player.faction && player.faction.toLowerCase() === factionLower
        );
        
        return res.status(200).json(filtered);
      } catch (error) {
        console.error('Faction filtering failed:', error);
        return res.status(200).json([]);
      }
    }
    
    // Get all players
    console.log('Getting all players');
    const allPlayers = await getPlayersData();
    return res.status(200).json(allPlayers);
  } catch (error: any) {
    console.error('General error in players API:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
} 