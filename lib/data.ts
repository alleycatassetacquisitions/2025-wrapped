import fs from 'fs';
import path from 'path';
import getConfig from 'next/config';
import { getJSONData } from './clientData';

// Get the server runtime config
const { serverRuntimeConfig } = getConfig();

// Check if we're running on the server side
const isServer = typeof window === 'undefined';
const isDevelopment = process.env.NODE_ENV === 'development';

// Function to read JSON file
export async function readJsonFile(filePath: string) {
  // In development, use file system if on server
  if (isDevelopment && isServer) {
    try {
      const fullPath = path.join(process.cwd(), filePath);
      const fileContents = fs.readFileSync(fullPath, 'utf8');
      return JSON.parse(fileContents);
    } catch (error) {
      console.error(`Error reading file ${filePath}:`, error);
      return { data: [] };
    }
  }
  
  // In production or on client side, use fetch
  const filename = filePath.split('/').pop() || '';
  return getJSONData(filename);
}

// Get players data
export async function getPlayers() {
  try {
    const data = await readJsonFile('data/players.json');
    return data.data || [];
  } catch (error) {
    console.error('Error loading players data:', error);
    return [];
  }
}

// Get best players
export async function getBestPlayers() {
  try {
    const data = await readJsonFile('data/best_players.json');
    return data.best_players || [];
  } catch (error) {
    console.error('Error loading best players data:', error);
    return [];
  }
}

// Get top hunters
export async function getTopHunters() {
  try {
    const data = await readJsonFile('data/top_hunters.json');
    return data.top_hunters || [];
  } catch (error) {
    console.error('Error loading top hunters data:', error);
    return [];
  }
}

// Get top bounties
export async function getTopBounties() {
  try {
    const data = await readJsonFile('data/top_bounties.json');
    return data.top_bounties || [];
  } catch (error) {
    console.error('Error loading top bounties data:', error);
    return [];
  }
}

// Get matches
export async function getMatches() {
  try {
    const data = await readJsonFile('data/matches.json');
    return data.data || [];
  } catch (error) {
    console.error('Error loading matches data:', error);
    return [];
  }
}

// Get player by ID
export async function getPlayerById(id: string) {
  const players = await getPlayers();
  return players.find((player: any) => player.id === id) || null;
}

// Get all player IDs
export async function getAllPlayerIds() {
  const players = await getPlayers();
  return players.map((player: any) => player.id);
}

// Get player matches
export async function getPlayerMatches(playerId: string) {
  const matches = await getMatches();
  return matches.filter((match: any) => 
    match.hunter === playerId || match.bounty === playerId
  );
}

// Get player stats
export async function getPlayerStats(playerId: string) {
  const matches = await getPlayerMatches(playerId);
  
  const hunterMatches = matches.filter((match: any) => match.hunter === playerId);
  const bountyMatches = matches.filter((match: any) => match.bounty === playerId);
  
  const hunterWins = hunterMatches.filter((match: any) => match.winner_is_hunter === 1).length;
  const bountyWins = bountyMatches.filter((match: any) => match.winner_is_hunter === 0).length;
  
  const totalMatches = matches.length;
  const totalWins = hunterWins + bountyWins;
  const winRate = totalMatches > 0 ? totalWins / totalMatches : 0;
  
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
  
  const fastestHunterTime = hunterTimes.length > 0 
    ? Math.min(...hunterTimes) 
    : 0;
  
  const fastestBountyTime = bountyTimes.length > 0 
    ? Math.min(...bountyTimes) 
    : 0;
  
  // Calculate performance score
  const score = calculatePerformanceScore({
    totalMatches,
    winRate,
    avgHunterTime,
    avgBountyTime,
    fastestHunterTime,
    fastestBountyTime
  });
  
  return {
    id: playerId,
    hunterMatches: hunterMatches.length,
    bountyMatches: bountyMatches.length,
    hunterWins,
    bountyWins,
    totalMatches,
    totalWins,
    winRate,
    avgHunterTime,
    avgBountyTime,
    fastestHunterTime,
    fastestBountyTime,
    score,
    matches
  };
}

// Calculate performance score
function calculatePerformanceScore(stats: any) {
  const { totalMatches, winRate, avgHunterTime, avgBountyTime } = stats;
  
  // Basic formula: (win rate * 50) + (reaction time factor * 50)
  const winRateScore = winRate * 50;
  
  // For reaction time, lower is better
  // Use an inverse relationship - faster times = higher score
  const avgTimeScore = (avgHunterTime > 0 && avgBountyTime > 0)
    ? (1000 / (avgHunterTime + avgBountyTime) * 50)
    : (avgHunterTime > 0 
        ? (1000 / avgHunterTime * 25) 
        : (avgBountyTime > 0 
            ? (1000 / avgBountyTime * 25) 
            : 0));
  
  // Apply a multiplier based on number of matches (more matches = more reliable score)
  const matchCountFactor = Math.min(1, totalMatches / 10); // Max out at 10 matches
  
  return (winRateScore + avgTimeScore) * matchCountFactor;
}

// Search players by name or ID
export async function searchPlayers(query: string) {
  if (!query) return [];
  
  const players = await getPlayers();
  const lowerQuery = query.toLowerCase();
  
  return players.filter((player: any) => 
    player.id.includes(lowerQuery) || 
    player.name.toLowerCase().includes(lowerQuery)
  );
}

// Get all factions
export async function getAllFactions() {
  const players = await getPlayers();
  const factions = new Set<string>();
  
  players.forEach((player: any) => {
    if (player.faction && player.faction.trim() !== '') {
      factions.add(player.faction.toLowerCase());
    }
  });
  
  return Array.from(factions).sort();
}

// Get players by faction
export async function getPlayersByFaction(faction: string) {
  const players = await getPlayers();
  return players.filter((player: any) => 
    player.faction.toLowerCase() === faction.toLowerCase()
  );
}

// Get global stats
export async function getGlobalStats() {
  const matches = await getMatches();
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
  
  return {
    totalMatches,
    hunterWins,
    bountyWins,
    hunterWinRate,
    avgHunterTime,
    avgBountyTime,
    fastestHunterTime,
    fastestBountyTime
  };
}

// Get top hunter winners
export async function getTopHunterWinners() {
  try {
    const players = await getPlayers();
    const matches = await getMatches();
    
    // Group matches by hunter
    const hunterStats: { [key: string]: { wins: number, matches: number, name: string, id: string } } = {};
    
    // Initialize stats for all players
    players.forEach((player: any) => {
      if (player.hunter) {
        hunterStats[player.id] = {
          wins: 0,
          matches: 0,
          name: player.name,
          id: player.id
        };
      }
    });
    
    // Count matches and wins for each hunter
    matches.forEach((match: any) => {
      if (hunterStats[match.hunter]) {
        hunterStats[match.hunter].matches++;
        if (match.winner_is_hunter === 1) {
          hunterStats[match.hunter].wins++;
        }
      }
    });
    
    // Convert to array and sort by wins
    const topHunters = Object.values(hunterStats)
      .filter(stats => stats.matches > 0) // Only include hunters with matches
      .sort((a, b) => b.wins - a.wins || (b.wins / b.matches) - (a.wins / a.matches)); // Sort by wins, then by win rate
    
    return topHunters;
  } catch (error) {
    console.error('Error getting top hunter winners:', error);
    return [];
  }
}

// Get top bounty winners
export async function getTopBountyWinners() {
  try {
    const players = await getPlayers();
    const matches = await getMatches();
    
    // Group matches by bounty
    const bountyStats: { [key: string]: { wins: number, matches: number, name: string, id: string } } = {};
    
    // Initialize stats for all players
    players.forEach((player: any) => {
      if (!player.hunter) {
        bountyStats[player.id] = {
          wins: 0,
          matches: 0,
          name: player.name,
          id: player.id
        };
      }
    });
    
    // Count matches and wins for each bounty
    matches.forEach((match: any) => {
      if (bountyStats[match.bounty]) {
        bountyStats[match.bounty].matches++;
        if (match.winner_is_hunter === 0) {
          bountyStats[match.bounty].wins++;
        }
      }
    });
    
    // Convert to array and sort by wins
    const topBounties = Object.values(bountyStats)
      .filter(stats => stats.matches > 0) // Only include bounties with matches
      .sort((a, b) => b.wins - a.wins || (b.wins / b.matches) - (a.wins / a.matches)); // Sort by wins, then by win rate
    
    return topBounties;
  } catch (error) {
    console.error('Error getting top bounty winners:', error);
    return [];
  }
}

// Calculate player rankings
export async function calculatePlayerRankings() {
  try {
    const players = await getPlayers();
    const hunterRankings: { id: string; score: number }[] = [];
    const bountyRankings: { id: string; score: number }[] = [];
    const overallRankings: { id: string; score: number }[] = [];
    
    // Calculate scores for each player
    for (const player of players) {
      const stats = await getPlayerStats(player.id);
      
      if (stats.totalMatches === 0) continue; // Skip players with no matches
      
      // Add to overall rankings
      overallRankings.push({
        id: player.id,
        score: stats.score || 0
      });
      
      // Add to role-specific rankings
      if (player.hunter === 1 && stats.hunterMatches > 0) {
        const hunterScore = calculateRoleScore(stats, true);
        hunterRankings.push({
          id: player.id,
          score: hunterScore
        });
      }
      
      if (!player.hunter && stats.bountyMatches > 0) {
        const bountyScore = calculateRoleScore(stats, false);
        bountyRankings.push({
          id: player.id,
          score: bountyScore
        });
      }
    }
    
    // Sort all rankings by score (descending)
    overallRankings.sort((a, b) => b.score - a.score);
    hunterRankings.sort((a, b) => b.score - a.score);
    bountyRankings.sort((a, b) => b.score - a.score);
    
    return {
      overall: overallRankings,
      hunters: hunterRankings,
      bounties: bountyRankings
    };
  } catch (error) {
    console.error('Error calculating player rankings:', error);
    return {
      overall: [],
      hunters: [],
      bounties: []
    };
  }
}

// Calculate role-specific score
function calculateRoleScore(stats: any, isHunter: boolean) {
  // For hunter role
  if (isHunter) {
    const winRate = stats.hunterWins / stats.hunterMatches;
    const timeScore = stats.avgHunterTime > 0 ? 1000 / stats.avgHunterTime * 25 : 0;
    const matchCountFactor = Math.min(1, stats.hunterMatches / 5); // Max out at 5 matches
    
    return (winRate * 75 + timeScore) * matchCountFactor;
  }
  // For bounty role
  else {
    const winRate = stats.bountyWins / stats.bountyMatches;
    const timeScore = stats.avgBountyTime > 0 ? 1000 / stats.avgBountyTime * 25 : 0;
    const matchCountFactor = Math.min(1, stats.bountyMatches / 5); // Max out at 5 matches
    
    return (winRate * 75 + timeScore) * matchCountFactor;
  }
}

// Get player ranking by ID
export async function getPlayerRanking(playerId: string) {
  try {
    const rankings = await calculatePlayerRankings();
    const player = await getPlayerById(playerId);
    
    if (!rankings || !player) {
      return {
        overall: 0,
        hunter: 0,
        bounty: 0
      };
    }
    
    // Find player's position in each ranking list
    const overallRank = rankings.overall.findIndex(p => p.id === playerId) + 1;
    const hunterRank = player.hunter === 1 ? rankings.hunters.findIndex(p => p.id === playerId) + 1 : 0;
    const bountyRank = player.hunter === 0 ? rankings.bounties.findIndex(p => p.id === playerId) + 1 : 0;
    
    return {
      overall: overallRank || 0,
      hunter: hunterRank || 0,
      bounty: bountyRank || 0
    };
  } catch (error) {
    console.error('Error getting player ranking:', error);
    return {
      overall: 0,
      hunter: 0,
      bounty: 0
    };
  }
} 