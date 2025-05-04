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
    const { playerId } = req.query;
    
    // Load matches data directly from the JSON file
    const matchesData = await loadJsonFile('matches.json');
    const matches = matchesData.data || [];
    
    // Filter by player ID if requested
    if (playerId) {
      console.log(`Filtering matches for player: ${playerId}`);
      const playerMatches = matches.filter((match: any) => 
        match.hunter.toString() === playerId.toString() || 
        match.bounty.toString() === playerId.toString()
      );
      
      return res.status(200).json(playerMatches);
    }
    
    // Return all matches
    return res.status(200).json(matches);
  } catch (error: any) {
    console.error('Error in matches API:', error);
    return res.status(500).json({ error: error.message || 'Error loading match data' });
  }
} 