const fs = require('fs');
const path = require('path');

// Ensure directories exist
const dirs = [
  'public/data',
  'public/data/player_stats',
  'public/data/player_matches'
];

dirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

console.log('Reading players data...');
const playersData = JSON.parse(fs.readFileSync('public/data/players.json', 'utf8'));
const players = playersData.data || [];

console.log('Reading matches data...');
const matchesData = JSON.parse(fs.readFileSync('public/data/matches.json', 'utf8'));
const matches = matchesData.data || [];

console.log('Calculating global stats...');
// Global statistics calculation
const validHunterTimes = matches
  .filter(match => match.hunter_time > 0)
  .map(match => match.hunter_time);

const validBountyTimes = matches
  .filter(match => match.bounty_time > 0)
  .map(match => match.bounty_time);

const hunterWins = matches.filter(match => match.winner_is_hunter === 1).length;
const bountyWins = matches.filter(match => match.winner_is_hunter === 0).length;
const totalMatches = matches.length;
const hunterWinRate = totalMatches > 0 ? hunterWins / totalMatches : 0;

const avgHunterTime = validHunterTimes.length > 0 
  ? validHunterTimes.reduce((sum, time) => sum + time, 0) / validHunterTimes.length 
  : 0;

const avgBountyTime = validBountyTimes.length > 0 
  ? validBountyTimes.reduce((sum, time) => sum + time, 0) / validBountyTimes.length 
  : 0;

const fastestHunterTime = validHunterTimes.length > 0 
  ? Math.min(...validHunterTimes) 
  : 0;

const fastestBountyTime = validBountyTimes.length > 0 
  ? Math.min(...validBountyTimes) 
  : 0;

const globalStats = {
  totalMatches,
  hunterWins,
  bountyWins,
  hunterWinRate,
  avgHunterTime,
  avgBountyTime,
  fastestHunterTime,
  fastestBountyTime
};

console.log('Saving global stats...');
fs.writeFileSync(
  path.join('public/data', 'global_stats.json'),
  JSON.stringify(globalStats, null, 2)
);

// Helper function for performance score calculation
function calculatePerformanceScore(stats) {
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

// Helper function for role-specific score
function calculateRoleScore(stats, isHunter) {
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

console.log('Processing player data...');
// Calculate player rankings first
const hunterRankings = [];
const bountyRankings = [];
const overallRankings = [];

// Additional ranking arrays
const winRatioRankings = [];
const reactionTimeRankings = [];
const totalPointsRankings = []; // New array for total points ranking based only on wins

// Process per-player data
console.log(`Processing ${players.length} players...`);
players.forEach((player, index) => {
  if (index % 10 === 0) {
    console.log(`Processing player ${index + 1}/${players.length}...`);
  }
  
  // Extract player ID
  const playerId = player.id;
  
  // Filter matches for this player
  const playerMatches = matches.filter(match => 
    match.hunter === playerId || match.bounty === playerId
  );
  
  // Calculate player statistics
  const hunterMatches = playerMatches.filter(match => match.hunter === playerId);
  const bountyMatches = playerMatches.filter(match => match.bounty === playerId);
  
  const hunterWins = hunterMatches.filter(match => match.winner_is_hunter === 1).length;
  const bountyWins = bountyMatches.filter(match => match.winner_is_hunter === 0).length;
  
  const totalMatches = playerMatches.length;
  const totalWins = hunterWins + bountyWins;
  const winRate = totalMatches > 0 ? totalWins / totalMatches : 0;
  
  const hunterTimes = hunterMatches
    .filter(match => match.hunter_time > 0)
    .map(match => match.hunter_time);
  
  const bountyTimes = bountyMatches
    .filter(match => match.bounty_time > 0)
    .map(match => match.bounty_time);
  
  const avgHunterTime = hunterTimes.length > 0 
    ? hunterTimes.reduce((sum, time) => sum + time, 0) / hunterTimes.length 
    : 0;
  
  const avgBountyTime = bountyTimes.length > 0 
    ? bountyTimes.reduce((sum, time) => sum + time, 0) / bountyTimes.length 
    : 0;
  
  const fastestHunterTime = hunterTimes.length > 0 
    ? Math.min(...hunterTimes) 
    : 0;
  
  const fastestBountyTime = bountyTimes.length > 0 
    ? Math.min(...bountyTimes) 
    : 0;
  
  // Calculate average reaction time (weighted by number of matches in each role)
  const totalRoleMatches = hunterTimes.length + bountyTimes.length;
  const avgReactionTime = totalRoleMatches > 0 
    ? ((avgHunterTime * hunterTimes.length) + (avgBountyTime * bountyTimes.length)) / totalRoleMatches 
    : 0;
  
  // Create player stats object
  const playerStats = {
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
    avgReactionTime
  };
  
  // Calculate performance score
  const score = calculatePerformanceScore(playerStats);
  playerStats.score = score;
  
  // Save player matches
  fs.writeFileSync(
    path.join('public/data/player_matches', `${playerId}.json`),
    JSON.stringify(playerMatches, null, 2)
  );
  
  // Save player stats
  fs.writeFileSync(
    path.join('public/data/player_stats', `${playerId}.json`),
    JSON.stringify(playerStats, null, 2)
  );
  
  // Add to rankings if they have matches
  if (totalMatches > 0) {
    overallRankings.push({
      id: playerId,
      score: score || 0
    });
    
    // Add to win ratio rankings
    winRatioRankings.push({
      id: playerId,
      winRate: winRate
    });
    
    // Add to total points rankings (based solely on total wins)
    totalPointsRankings.push({
      id: playerId,
      totalWins: totalWins
    });
    
    // Add to reaction time rankings (only if they have reaction time data)
    if (avgReactionTime > 0) {
      reactionTimeRankings.push({
        id: playerId,
        avgReactionTime: avgReactionTime
      });
    }
    
    // Add to role-specific rankings
    if (player.hunter === 1 && hunterMatches.length > 0) {
      const hunterScore = calculateRoleScore(playerStats, true);
      hunterRankings.push({
        id: playerId,
        score: hunterScore
      });
    }
    
    if (player.hunter === 0 && bountyMatches.length > 0) {
      const bountyScore = calculateRoleScore(playerStats, false);
      bountyRankings.push({
        id: playerId,
        score: bountyScore
      });
    }
  }
});

console.log('Sorting rankings...');
// Sort all rankings by score (descending)
overallRankings.sort((a, b) => b.score - a.score);
hunterRankings.sort((a, b) => b.score - a.score);
bountyRankings.sort((a, b) => b.score - a.score);

// Sort win ratio rankings (higher is better)
winRatioRankings.sort((a, b) => b.winRate - a.winRate);

// Sort total points rankings (higher is better)
totalPointsRankings.sort((a, b) => b.totalWins - a.totalWins);

// Log top players by total wins for debugging
console.log('Top 5 players by total wins:');
totalPointsRankings.slice(0, 5).forEach((player, index) => {
  console.log(`${index + 1}. Player ${player.id}: ${player.totalWins} wins`);
});

// Sort reaction time rankings (lower is better)
reactionTimeRankings.sort((a, b) => a.avgReactionTime - b.avgReactionTime);

// Save rankings to a separate file
const rankings = {
  overall: overallRankings,
  hunters: hunterRankings,
  bounties: bountyRankings,
  winRatio: winRatioRankings,
  totalPoints: totalPointsRankings, // Add the new ranking
  reactionTime: reactionTimeRankings
};

fs.writeFileSync(
  path.join('public/data', 'rankings.json'),
  JSON.stringify(rankings, null, 2)
);

console.log('Adding rankings to player stats...');
// Now that we have rankings, update each player's stats file with their rank
players.forEach(player => {
  const playerId = player.id;
  const statsFilePath = path.join('public/data/player_stats', `${playerId}.json`);
  
  // Skip if player has no stats file
  if (!fs.existsSync(statsFilePath)) {
    return;
  }
  
  const playerStats = JSON.parse(fs.readFileSync(statsFilePath, 'utf8'));
  
  // Find player's position in each ranking list
  const overallRank = overallRankings.findIndex(p => p.id === playerId) + 1;
  const hunterRank = player.hunter === 1 ? hunterRankings.findIndex(p => p.id === playerId) + 1 : 0;
  const bountyRank = player.hunter === 0 ? bountyRankings.findIndex(p => p.id === playerId) + 1 : 0;
  const winRatioRank = winRatioRankings.findIndex(p => p.id === playerId) + 1;
  const totalPointsRank = totalPointsRankings.findIndex(p => p.id === playerId) + 1;
  const reactionTimeRank = reactionTimeRankings.findIndex(p => p.id === playerId) + 1;
  
  // Add rankings to stats
  playerStats.rankings = {
    overall: overallRank || 0,
    hunter: hunterRank || 0,
    bounty: bountyRank || 0,
    winRatio: winRatioRank || 0,
    totalPoints: totalPointsRank || 0,
    reactionTime: reactionTimeRank || 0
  };
  
  // Save updated stats
  fs.writeFileSync(statsFilePath, JSON.stringify(playerStats, null, 2));
});

console.log('Data preparation complete!');
