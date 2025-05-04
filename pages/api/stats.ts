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
    const { type, playerId } = req.query;
    console.log(`Stats API request: ${req.url}`);

    // Get stats for a specific player
    if (playerId) {
      // Load match data
      const matchesData = await loadJsonFile('matches.json');
      const matches = matchesData.data || [];
      
      // Filter matches for this player
      const playerMatches = matches.filter((match: any) => 
        match.hunter.toString() === playerId.toString() || 
        match.bounty.toString() === playerId.toString()
      );
      
      if (playerMatches.length === 0) {
        return res.status(200).json({
          id: playerId,
          totalMatches: 0,
          totalWins: 0,
          winRate: 0,
          hunterMatches: 0,
          bountyMatches: 0,
          hunterWins: 0,
          bountyWins: 0
        });
      }
      
      // Calculate basic stats
      const hunterMatches = playerMatches.filter((match: any) => 
        match.hunter.toString() === playerId.toString()
      );
      const bountyMatches = playerMatches.filter((match: any) => 
        match.bounty.toString() === playerId.toString()
      );
      
      const hunterWins = hunterMatches.filter((match: any) => match.winner_is_hunter === 1).length;
      const bountyWins = bountyMatches.filter((match: any) => match.winner_is_hunter === 0).length;
      
      const totalMatches = playerMatches.length;
      const totalWins = hunterWins + bountyWins;
      const winRate = totalMatches > 0 ? totalWins / totalMatches : 0;
      
      // Calculate average times
      const hunterTimes = hunterMatches
        .filter((match: any) => match.hunter_time > 0)
        .map((match: any) => match.hunter_time);
      
      const bountyTimes = bountyMatches
        .filter((match: any) => match.bounty_time > 0)
        .map((match: any) => match.bounty_time);
      
      const avgHunterTime = hunterTimes.length > 0 
        ? hunterTimes.reduce((sum: number, time: number) => sum + time, 0) / hunterTimes.length 
        : 0;
      
      const avgBountyTime = bountyTimes.length > 0 
        ? bountyTimes.reduce((sum: number, time: number) => sum + time, 0) / bountyTimes.length 
        : 0;
      
      return res.status(200).json({
        id: playerId,
        totalMatches,
        totalWins,
        winRate,
        hunterMatches: hunterMatches.length,
        bountyMatches: bountyMatches.length,
        hunterWins,
        bountyWins,
        avgHunterTime,
        avgBountyTime,
        score: 0 // Simplified score
      });
    }
    
    // Get specific type of stats
    if (type) {
      switch (type) {
        case 'global': {
          // Calculate global stats directly from matches
          const matchesData = await loadJsonFile('matches.json');
          const matches = matchesData.data || [];
          
          if (matches.length === 0) {
            return res.status(200).json({
              totalMatches: 0,
              hunterWins: 0,
              bountyWins: 0,
              hunterWinRate: 0,
              avgHunterTime: 0,
              avgBountyTime: 0
            });
          }
          
          const totalMatches = matches.length;
          const hunterWins = matches.filter((match: any) => match.winner_is_hunter === 1).length;
          const bountyWins = matches.filter((match: any) => match.winner_is_hunter === 0).length;
          const hunterWinRate = totalMatches > 0 ? hunterWins / totalMatches : 0;
          
          const validHunterTimes = matches
            .filter((match: any) => match.hunter_time > 0)
            .map((match: any) => match.hunter_time);
          
          const validBountyTimes = matches
            .filter((match: any) => match.bounty_time > 0)
            .map((match: any) => match.bounty_time);
          
          const avgHunterTime = validHunterTimes.length > 0 
            ? validHunterTimes.reduce((sum: number, time: number) => sum + time, 0) / validHunterTimes.length 
            : 0;
          
          const avgBountyTime = validBountyTimes.length > 0 
            ? validBountyTimes.reduce((sum: number, time: number) => sum + time, 0) / validBountyTimes.length 
            : 0;
          
          const fastestHunterTime = validHunterTimes.length > 0 
            ? Math.min(...validHunterTimes) 
            : 0;
          
          const fastestBountyTime = validBountyTimes.length > 0 
            ? Math.min(...validBountyTimes) 
            : 0;
          
          return res.status(200).json({
            totalMatches,
            hunterWins,
            bountyWins,
            hunterWinRate,
            avgHunterTime,
            avgBountyTime,
            fastestHunterTime,
            fastestBountyTime
          });
        }
        
        case 'best': {
          // Return best players directly from file
          const data = await loadJsonFile('best_players.json');
          return res.status(200).json(data.best_players || []);
        }
        
        case 'hunters': {
          // Return top hunters directly from file
          const data = await loadJsonFile('top_hunters.json');
          return res.status(200).json(data.top_hunters || []);
        }
        
        case 'bounties': {
          // Return top bounties directly from file
          const data = await loadJsonFile('top_bounties.json');
          return res.status(200).json(data.top_bounties || []);
        }
        
        case 'hunter-winners': 
        case 'bounty-winners': {
          // Calculate winners directly from matches and players data
          const [matchesData, playersData] = await Promise.all([
            loadJsonFile('matches.json'),
            loadJsonFile('players.json')
          ]);
          
          const matches = matchesData.data || [];
          const players = playersData.data || [];
          
          const isHunterWinners = type === 'hunter-winners';
          // Filter players by role and create stats object
          const roleStats: Record<string, { wins: number, matches: number, name: string, id: string | number }> = {};
          
          players.forEach((player: any) => {
            // For hunter-winners we want hunter=1, for bounty-winners we want hunter=0
            if ((isHunterWinners && player.hunter === 1) || (!isHunterWinners && player.hunter === 0)) {
              roleStats[player.id] = {
                wins: 0,
                matches: 0,
                name: player.name,
                id: player.id
              };
            }
          });
          
          // Count matches and wins
          matches.forEach((match: any) => {
            if (isHunterWinners) {
              // For hunters
              if (roleStats[match.hunter]) {
                roleStats[match.hunter].matches++;
                if (match.winner_is_hunter === 1) {
                  roleStats[match.hunter].wins++;
                }
              }
            } else {
              // For bounties
              if (roleStats[match.bounty]) {
                roleStats[match.bounty].matches++;
                if (match.winner_is_hunter === 0) {
                  roleStats[match.bounty].wins++;
                }
              }
            }
          });
          
          // Convert to array and sort
          const topPlayers = Object.values(roleStats)
            .filter((stats: any) => stats.matches > 0)
            .sort((a: any, b: any) => b.wins - a.wins || (b.wins / b.matches) - (a.wins / a.matches));
          
          return res.status(200).json(topPlayers);
        }
        
        default:
          return res.status(400).json({ error: `Unknown stat type: ${type}` });
      }
    }
    
    // If no specific request was made, return a 400 error
    return res.status(400).json({ error: 'Missing required parameters' });
  } catch (error: any) {
    console.error('Error in stats API:', error);
    return res.status(500).json({ error: error.message || 'Error processing stats request' });
  }
} 