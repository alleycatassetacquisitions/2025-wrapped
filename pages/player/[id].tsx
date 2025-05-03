import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { FaArrowLeft, FaBolt, FaCrosshairs, FaShieldAlt, FaTrophy, FaClock, FaSkull, FaInfoCircle, FaFire, FaBullseye } from 'react-icons/fa';
import StatCard from '@/components/StatCard';
import { usePlayer, usePlayerStats, usePlayerMatches } from '@/lib/clientData';

export default function PlayerDetail() {
  const router = useRouter();
  const { id } = router.query;
  
  const { player, rankings, isLoading: isLoadingPlayer } = usePlayer(id as string);
  const { stats, isLoading: isLoadingStats } = usePlayerStats(id as string);
  const { matches, isLoading: isLoadingMatches } = usePlayerMatches(id as string);
  
  const [ranking, setRanking] = useState({
    overall: 0,
    hunter: 0,
    bounty: 0
  });
  
  // State for opponent names cache
  const [opponentNames, setOpponentNames] = useState<{[key: string]: string}>({});
  const [showScoreInfo, setShowScoreInfo] = useState(false);
  
  // Fetch opponent names when matches change
  useEffect(() => {
    if (!matches || matches.length === 0) return;
    
    // Create a Set of unique opponent IDs
    const opponentIds = new Set<string>();
    
    matches.forEach((match: any) => {
      const isHunterInMatch = match.hunter === id || match.hunter_id === id;
      const opponentId = isHunterInMatch 
        ? (match.bounty || match.bounty_id) 
        : (match.hunter || match.hunter_id);
      
      if (opponentId) {
        opponentIds.add(opponentId);
      }
    });
    
    // Fetch opponent names
    async function fetchOpponentNames() {
      try {
        const promises = Array.from(opponentIds).map(async (opponentId) => {
          const response = await fetch(`/api/players?id=${opponentId}`);
          const data = await response.json();
          return { id: opponentId, name: data?.name || `Unknown #${opponentId}` };
        });
        
        const results = await Promise.all(promises);
        
        // Create a map of opponent IDs to names
        const namesMap: {[key: string]: string} = {};
        results.forEach((result) => {
          namesMap[result.id] = result.name;
        });
        
        setOpponentNames(namesMap);
      } catch (error) {
        console.error("Error fetching opponent names:", error);
      }
    }
    
    fetchOpponentNames();
  }, [matches, id]);
  
  // Calculate win streak from match history
  const calculateWinStreak = () => {
    if (!matches || matches.length === 0) return 0;
    
    // Sort matches by timestamp (newest first)
    const sortedMatches = [...matches].sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    
    let currentStreak = 0;
    let maxStreak = 0;
    
    for (const match of sortedMatches) {
      const isHunterInMatch = match.hunter === id || match.hunter_id === id;
      const winnerIsHunter = match.winner_is_hunter === 1 || match.winner === 'hunter';
      const isWin = (isHunterInMatch && winnerIsHunter) || (!isHunterInMatch && !winnerIsHunter);
      
      if (isWin) {
        currentStreak++;
        maxStreak = Math.max(maxStreak, currentStreak);
      } else {
        currentStreak = 0;
      }
    }
    
    return maxStreak;
  };
  
  // Calculate best time from match history
  const calculateBestTime = () => {
    if (!matches || matches.length === 0) return 0;
    
    const isHunter = player.hunter === 1;
    let bestTime = Infinity;
    
    matches.forEach((match: any) => {
      const isHunterInMatch = match.hunter === id || match.hunter_id === id;
      
      // Only consider matches where player's role matches their primary role
      if (isHunterInMatch === isHunter) {
        const time = isHunterInMatch ? match.hunter_time : match.bounty_time;
        if (time > 0 && time < bestTime) {
          bestTime = time;
        }
      }
    });
    
    return bestTime === Infinity ? 0 : bestTime;
  };
  
  // Default to loading state
  const isLoading = isLoadingPlayer || isLoadingStats || isLoadingMatches || !player;
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="text-neon-blue animate-pulse text-2xl">LOADING PLAYER DATA...</div>
      </div>
    );
  }
  
  // Handle player not found
  if (!player) {
    return (
      <div className="text-center py-20">
        <h1 className="text-2xl font-display neon-text-pink mb-4">Player Not Found</h1>
        <p className="mb-6">This player doesn't exist in our database.</p>
        <Link href="/" className="inline-flex items-center space-x-2 py-2 px-4 bg-cyber-dark border border-neon-blue rounded-md hover:shadow-neon-blue transition-all duration-300">
          <FaArrowLeft />
          <span>Return Home</span>
        </Link>
      </div>
    );
  }

  // Determine if player is a hunter based on the 'hunter' field in the player data
  // hunter: 1 = Hunter, hunter: 0 = Bounty
  const isHunter = player.hunter === 1;
  const heroColor = isHunter ? 'green' : 'pink';
  const roleLabel = isHunter ? 'Hunter' : 'Bounty';
  const roleIcon = isHunter ? <FaCrosshairs className="text-2xl" /> : <FaShieldAlt className="text-2xl" />;
  
  // Calculate win streak and best time
  const winStreak = calculateWinStreak();
  const bestTime = calculateBestTime();
  
  // Calculate total wins
  const totalWins = stats.totalWins || 0;
  const totalMatches = stats.totalMatches || 0;
  
  // Format rankings with appropriate text
  const formattedRankings = {
    overall: rankings.overall > 0 ? `#${rankings.overall}` : 'Unranked',
    hunter: rankings.hunter > 0 ? `#${rankings.hunter}` : 'Unranked',
    bounty: rankings.bounty > 0 ? `#${rankings.bounty}` : 'Unranked'
  };
  
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      {/* Back button */}
      <div className="mb-4">
        <Link href="/" className="inline-flex items-center space-x-2 text-cyber-text hover:neon-text-blue transition-colors duration-200">
          <FaArrowLeft />
          <span>Back to Home</span>
        </Link>
      </div>
      
      {/* Player hero section */}
      <div className={`bg-cyber-dark p-6 rounded-md border-2 border-neon-${heroColor} shadow-neon-${heroColor}`}>
        <div className="flex flex-col md:flex-row justify-between gap-6">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <h1 className={`text-3xl md:text-4xl font-display neon-text-${heroColor}`}>
                {player.name}
              </h1>
              <span className="text-cyber-text text-xl">#{player.id}</span>
            </div>
            
            {player.faction && (
              <div className="text-cyber-text mb-4">
                Faction: <span className="neon-text-blue">{player.faction}</span>
              </div>
            )}
            
            <div className="flex items-center space-x-2 mb-4">
              <span className={`neon-text-${heroColor} inline-flex items-center space-x-1`}>
                {roleIcon}
                <span>Primary Role: {roleLabel}</span>
              </span>
            </div>
            
            <div>
              <div className="text-cyber-text mb-1">Rankings:</div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-cyber-text">Overall:</span>{' '}
                  <span className="neon-text-yellow">{formattedRankings.overall}</span>
                </div>
                {isHunter ? (
                  <div>
                    <span className="text-cyber-text">As Hunter:</span>{' '}
                    <span className="neon-text-green">{formattedRankings.hunter}</span>
                  </div>
                ) : (
                  <div>
                    <span className="text-cyber-text">As Bounty:</span>{' '}
                    <span className="neon-text-pink">{formattedRankings.bounty}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex flex-col justify-center relative">
            <div 
              className="text-4xl md:text-6xl font-display neon-text-yellow text-center mb-2 relative"
              onMouseEnter={() => setShowScoreInfo(true)}
              onMouseLeave={() => setShowScoreInfo(false)}
            >
              {stats.score ? stats.score.toFixed(0) : '0'}
              <FaInfoCircle className="absolute -right-6 top-2 text-lg text-cyber-text cursor-help" />
              
              {showScoreInfo && (
                <div className="absolute top-full left-0 right-0 mt-2 p-3 bg-cyber-darkblue border border-neon-blue rounded-md text-base z-10 shadow-lg">
                  <p className="text-sm text-cyber-text mb-1">Performance Score Calculation:</p>
                  <ul className="text-xs text-left">
                    <li>• Win Rate (50%): Higher win rate = higher score</li>
                    <li>• Reaction Time (50%): Faster times = higher score</li>
                    <li>• Match Count: More matches = more reliable score</li>
                  </ul>
                </div>
              )}
            </div>
            <div className="text-center text-cyber-text">Performance Score</div>
          </div>
        </div>
      </div>
      
      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard 
          title="Match Record" 
          value={`${totalWins} / ${totalMatches}`} 
          icon={<FaBolt />} 
          color="blue"
          delay={0.1}
        />
        <StatCard 
          title="Win Rate" 
          value={`${((stats.winRate || 0) * 100).toFixed(1)}%`} 
          icon={<FaTrophy />} 
          color="yellow"
          delay={0.2}
        />
        <StatCard 
          title="Best Win Streak" 
          value={winStreak} 
          icon={<FaFire />} 
          color="purple"
          delay={0.3}
        />
      </div>
      
      {/* Time stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <StatCard 
          title={`Avg Time as ${roleLabel}`} 
          value={`${(isHunter ? (stats.avgHunterTime || 0) : (stats.avgBountyTime || 0)).toFixed(1)} ms`} 
          icon={roleIcon} 
          color={heroColor}
          delay={0.4}
        />
        <StatCard 
          title={`Best Time as ${roleLabel}`} 
          value={`${bestTime} ms`} 
          icon={<FaBullseye />} 
          color={heroColor}
          delay={0.5}
        />
      </div>
      
      {/* Match history */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-cyber-dark rounded-md border-2 border-neon-blue overflow-hidden"
      >
        <div className="p-4 border-b border-cyber-darkblue">
          <h2 className="text-xl font-display neon-text-blue">MATCH HISTORY</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-cyber-darkblue">
                <th className="py-2 px-4 text-left">Role</th>
                <th className="py-2 px-4 text-left">Opponent</th>
                <th className="py-2 px-4 text-right">Reaction Time</th>
                <th className="py-2 px-4 text-right">Result</th>
              </tr>
            </thead>
            <tbody>
              {matches && matches.length > 0 ? (
                matches.map((match: any, index: number) => {
                  // Determine if the player was the hunter in this match
                  const isHunterInMatch = match.hunter === player.id || match.hunter_id === player.id;
                  
                  const opponentId = isHunterInMatch 
                    ? (match.bounty || match.bounty_id) 
                    : (match.hunter || match.hunter_id);
                  
                  // Use the lookup map to get opponent name
                  const opponentName = opponentNames[opponentId] || 
                    (isHunterInMatch 
                      ? (match.bounty_name || 'Unknown Bounty') 
                      : (match.hunter_name || 'Unknown Hunter'));
                  
                  const playerTime = isHunterInMatch 
                    ? match.hunter_time 
                    : match.bounty_time;
                  
                  // Determine if player won
                  const winnerIsHunter = match.winner_is_hunter === 1 || match.winner === 'hunter';
                  const isWin = (isHunterInMatch && winnerIsHunter) || (!isHunterInMatch && !winnerIsHunter);
                  
                  return (
                    <motion.tr
                      key={match.id || index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="border-b border-cyber-darkblue hover:bg-cyber-darkblue"
                    >
                      <td className="py-3 px-4">
                        {isHunterInMatch ? (
                          <span className="inline-flex items-center space-x-1 neon-text-green">
                            <FaCrosshairs />
                            <span>Hunter</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center space-x-1 neon-text-pink">
                            <FaShieldAlt />
                            <span>Bounty</span>
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <Link href={`/player/${opponentId}`} className="hover:neon-text-blue transition-colors duration-200">
                          {opponentName}
                          <span className="ml-2 text-xs text-cyber-text">#{opponentId}</span>
                        </Link>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className={isWin ? 'neon-text-green' : 'neon-text-blue'}>
                          {playerTime} ms
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        {isWin ? (
                          <span className="inline-flex items-center justify-end space-x-1 neon-text-green">
                            <span>WIN</span>
                            <FaTrophy />
                          </span>
                        ) : (
                          <span className="inline-flex items-center justify-end space-x-1 text-cyber-text">
                            <span>LOSS</span>
                            <FaSkull />
                          </span>
                        )}
                      </td>
                    </motion.tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={4} className="py-4 text-center text-cyber-text">
                    No matches found for this player.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  );
} 