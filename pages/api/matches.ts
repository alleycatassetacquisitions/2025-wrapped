import type { NextApiRequest, NextApiResponse } from 'next';
import { getMatches, getPlayerMatches } from '@/lib/data';
import { getJSONData } from '@/lib/clientData';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { playerId } = req.query;

    // Get matches for a specific player
    if (playerId) {
      try {
        const matches = await getPlayerMatches(playerId as string);
        if (matches && matches.length > 0) {
          return res.status(200).json(matches);
        }
        
        // Fallback to direct access
        console.log(`No matches found for player ${playerId}, trying direct access`);
        const matchesData = await getJSONData('matches.json');
        const directMatches = matchesData.data?.filter((match: any) => 
          match.hunter === playerId || match.bounty === playerId
        ) || [];
        
        return res.status(200).json(directMatches);
      } catch (error) {
        console.error(`Error fetching matches for player ${playerId}:`, error);
        
        // Last resort fallback
        try {
          const matchesData = await getJSONData('matches.json');
          const directMatches = matchesData.data?.filter((match: any) => 
            match.hunter === playerId || match.bounty === playerId
          ) || [];
          
          return res.status(200).json(directMatches);
        } catch (fallbackError) {
          console.error('Matches fallback failed:', fallbackError);
          return res.status(200).json([]);
        }
      }
    }
    
    // Get all matches
    try {
      const matches = await getMatches();
      return res.status(200).json(matches);
    } catch (error) {
      // Fallback to direct access
      try {
        const matchesData = await getJSONData('matches.json');
        return res.status(200).json(matchesData.data || []);
      } catch (fallbackError) {
        console.error('Matches fallback failed:', fallbackError);
        return res.status(200).json([]);
      }
    }
  } catch (error: any) {
    console.error('General error in matches API:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
} 