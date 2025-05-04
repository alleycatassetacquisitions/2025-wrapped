import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

// Simple function to load JSON from the public directory
async function loadJsonFile(filename: string) {
  try {
    const filePath = path.join(process.cwd(), 'public', 'data', filename);
    console.log(`Loading ${filename} from: ${filePath}`);
    
    if (fs.existsSync(filePath)) {
      const fileContents = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(fileContents);
    } else {
      console.error(`File not found: ${filePath}`);
      return { data: [] };
    }
  } catch (error) {
    console.error(`Error loading ${filename}:`, error);
    return { data: [] };
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { id, search, faction } = req.query;
    
    console.log(`API Request: ${req.url}`);
    
    // Load all players directly
    const playersData = await loadJsonFile('players.json');
    const players = playersData.data || [];
    
    // Check if we have players data
    if (!players || players.length === 0) {
      console.error('Failed to load players data');
      return res.status(500).json({ error: 'Failed to load player data' });
    }

    // Get specific player by ID
    if (id) {
      console.log(`Looking for player with ID: ${id}`);
      
      // Find player by ID
      const player = players.find((p: any) => 
        p.id === id || 
        p.id === Number(id) || 
        p.id.toString() === id.toString()
      );
      
      if (player) {
        console.log(`Found player: ${player.name}`);
        
        // Add simple mock rankings
        const rankings = { 
          overall: 1, 
          hunter: player.hunter === 1 ? 1 : 0, 
          bounty: player.hunter === 0 ? 1 : 0 
        };
        
        return res.status(200).json({
          ...player,
          rankings
        });
      }
      
      console.error(`Player with ID ${id} not found in ${players.length} players`);
      return res.status(404).json({ error: 'Player not found' });
    }
    
    // Search players
    if (search) {
      console.log(`Searching for players matching: ${search}`);
      const query = (search as string).toLowerCase();
      
      const filtered = players.filter((player: any) => 
        player.id?.toString().includes(query) || 
        player.name?.toLowerCase().includes(query)
      );
      
      return res.status(200).json(filtered);
    }
    
    // Get players by faction
    if (faction) {
      console.log(`Getting players from faction: ${faction}`);
      const factionLower = (faction as string).toLowerCase();
      
      const filtered = players.filter((player: any) => 
        player.faction && player.faction.toLowerCase() === factionLower
      );
      
      return res.status(200).json(filtered);
    }
    
    // Get all players
    console.log('Returning all players');
    return res.status(200).json(players);
  } catch (error: any) {
    console.error('Error in players API:', error);
    return res.status(500).json({ error: error.message || 'Error loading player data' });
  }
} 