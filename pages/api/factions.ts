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
    console.log('Factions API request');
    
    // Load players data directly
    const playersData = await loadJsonFile('players.json');
    const players = playersData.data || [];
    
    // Extract unique factions
    const factionSet = new Set<string>();
    
    players.forEach((player: any) => {
      if (player.faction && player.faction.trim() !== '') {
        factionSet.add(player.faction.toLowerCase());
      }
    });
    
    const factions = Array.from(factionSet).sort();
    return res.status(200).json(factions);
  } catch (error: any) {
    console.error('Error in factions API:', error);
    return res.status(500).json({ error: error.message || 'Error loading faction data' });
  }
} 