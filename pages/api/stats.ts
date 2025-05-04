import type { NextApiRequest, NextApiResponse } from 'next';
import { getGlobalStats, getPlayerStats, getBestPlayers, getTopHunters, getTopBounties, getTopHunterWinners, getTopBountyWinners } from '@/lib/data';
import { getJSONData } from '@/lib/clientData';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { type, playerId } = req.query;

    // Get stats for a specific player
    if (playerId) {
      try {
        const stats = await getPlayerStats(playerId as string);
        if (stats && Object.keys(stats).length > 0) {
          return res.status(200).json(stats);
        }
        
        // Fallback: Calculate player stats directly from match data
        console.log(`No stats found for player ${playerId}, calculating directly`);
        const matchesData = await getJSONData('matches.json');
        const playerMatches = matchesData.data?.filter((match: any) => 
          match.hunter === playerId || match.bounty === playerId
        ) || [];
        
        if (playerMatches.length === 0) {
          return res.status(200).json({});
        }
        
        // Basic stats calculation
        const hunterMatches = playerMatches.filter((match: any) => match.hunter === playerId);
        const bountyMatches = playerMatches.filter((match: any) => match.bounty === playerId);
        
        const hunterWins = hunterMatches.filter((match: any) => match.winner_is_hunter === 1).length;
        const bountyWins = bountyMatches.filter((match: any) => match.winner_is_hunter === 0).length;
        
        const totalMatches = playerMatches.length;
        const totalWins = hunterWins + bountyWins;
        const winRate = totalMatches > 0 ? totalWins / totalMatches : 0;
        
        return res.status(200).json({
          id: playerId,
          totalMatches,
          totalWins,
          winRate,
          hunterMatches: hunterMatches.length,
          bountyMatches: bountyMatches.length,
          hunterWins,
          bountyWins,
          matches: playerMatches
        });
      } catch (error) {
        console.error(`Error calculating stats for player ${playerId}:`, error);
        return res.status(200).json({});
      }
    }
    
    // Get specific type of stats
    if (type) {
      switch (type) {
        case 'global': {
          try {
            const globalStats = await getGlobalStats();
            return res.status(200).json(globalStats);
          } catch (error) {
            console.error('Error getting global stats:', error);
            
            // Fallback: Calculate global stats directly
            try {
              const matchesData = await getJSONData('matches.json');
              const matches = matchesData.data || [];
              
              if (matches.length === 0) {
                return res.status(200).json({
                  totalMatches: 0,
                  hunterWins: 0,
                  bountyWins: 0,
                  hunterWinRate: 0,
                  avgHunterTime: 0,
                  avgBountyTime: 0,
                  fastestHunterTime: 0,
                  fastestBountyTime: 0
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
            } catch (fallbackError) {
              console.error('Global stats fallback failed:', fallbackError);
              return res.status(200).json({});
            }
          }
        }
        
        case 'best': {
          try {
            const bestPlayers = await getBestPlayers();
            return res.status(200).json(bestPlayers);
          } catch (error) {
            console.error('Error getting best players:', error);
            try {
              const bestPlayersData = await getJSONData('best_players.json');
              return res.status(200).json(bestPlayersData.best_players || []);
            } catch (fallbackError) {
              console.error('Best players fallback failed:', fallbackError);
              return res.status(200).json([]);
            }
          }
        }
        
        case 'hunters': {
          try {
            const topHunters = await getTopHunters();
            return res.status(200).json(topHunters);
          } catch (error) {
            console.error('Error getting top hunters:', error);
            try {
              const topHuntersData = await getJSONData('top_hunters.json');
              return res.status(200).json(topHuntersData.top_hunters || []);
            } catch (fallbackError) {
              console.error('Top hunters fallback failed:', fallbackError);
              return res.status(200).json([]);
            }
          }
        }
        
        case 'bounties': {
          try {
            const topBounties = await getTopBounties();
            return res.status(200).json(topBounties);
          } catch (error) {
            console.error('Error getting top bounties:', error);
            try {
              const topBountiesData = await getJSONData('top_bounties.json');
              return res.status(200).json(topBountiesData.top_bounties || []);
            } catch (fallbackError) {
              console.error('Top bounties fallback failed:', fallbackError);
              return res.status(200).json([]);
            }
          }
        }
        
        case 'hunter-winners': {
          try {
            const hunterWinners = await getTopHunterWinners();
            return res.status(200).json(hunterWinners);
          } catch (error) {
            console.error('Error getting hunter winners:', error);
            
            // Calculate winners directly from matches and players data
            try {
              const [matchesData, playersData] = await Promise.all([
                getJSONData('matches.json'),
                getJSONData('players.json')
              ]);
              
              const matches = matchesData.data || [];
              const players = playersData.data || [];
              
              // Group matches by hunter
              const hunterStats: Record<string, any> = {};
              
              // Initialize stats for hunter players
              players.forEach((player: any) => {
                if (player.hunter === 1) {
                  hunterStats[player.id] = {
                    wins: 0,
                    matches: 0,
                    name: player.name,
                    id: player.id
                  };
                }
              });
              
              // Count matches and wins
              matches.forEach((match: any) => {
                if (hunterStats[match.hunter]) {
                  hunterStats[match.hunter].matches++;
                  if (match.winner_is_hunter === 1) {
                    hunterStats[match.hunter].wins++;
                  }
                }
              });
              
              // Convert to array and sort
              const topHunters = Object.values(hunterStats)
                .filter((stats: any) => stats.matches > 0)
                .sort((a: any, b: any) => b.wins - a.wins || (b.wins / b.matches) - (a.wins / a.matches));
              
              return res.status(200).json(topHunters);
            } catch (fallbackError) {
              console.error('Hunter winners fallback failed:', fallbackError);
              return res.status(200).json([]);
            }
          }
        }
        
        case 'bounty-winners': {
          try {
            const bountyWinners = await getTopBountyWinners();
            return res.status(200).json(bountyWinners);
          } catch (error) {
            console.error('Error getting bounty winners:', error);
            
            // Calculate winners directly from matches and players data
            try {
              const [matchesData, playersData] = await Promise.all([
                getJSONData('matches.json'),
                getJSONData('players.json')
              ]);
              
              const matches = matchesData.data || [];
              const players = playersData.data || [];
              
              // Group matches by bounty
              const bountyStats: Record<string, any> = {};
              
              // Initialize stats for bounty players
              players.forEach((player: any) => {
                if (player.hunter === 0) {
                  bountyStats[player.id] = {
                    wins: 0,
                    matches: 0,
                    name: player.name,
                    id: player.id
                  };
                }
              });
              
              // Count matches and wins
              matches.forEach((match: any) => {
                if (bountyStats[match.bounty]) {
                  bountyStats[match.bounty].matches++;
                  if (match.winner_is_hunter === 0) {
                    bountyStats[match.bounty].wins++;
                  }
                }
              });
              
              // Convert to array and sort
              const topBounties = Object.values(bountyStats)
                .filter((stats: any) => stats.matches > 0)
                .sort((a: any, b: any) => b.wins - a.wins || (b.wins / b.matches) - (a.wins / a.matches));
              
              return res.status(200).json(topBounties);
            } catch (fallbackError) {
              console.error('Bounty winners fallback failed:', fallbackError);
              return res.status(200).json([]);
            }
          }
        }
        
        default:
          return res.status(400).json({ error: 'Invalid stats type' });
      }
    }
    
    // Get global stats by default
    try {
      const globalStats = await getGlobalStats();
      return res.status(200).json(globalStats);
    } catch (error) {
      console.error('Error getting default global stats:', error);
      return res.status(200).json({});
    }
  } catch (error: any) {
    console.error('General error in stats API:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
} 