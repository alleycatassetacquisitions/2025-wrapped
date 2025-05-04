import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { FaTrophy, FaBolt, FaCrosshairs, FaShieldAlt, FaMedal, FaCrown } from 'react-icons/fa';
import StatCard from '@/components/StatCard';
import SearchBox from '@/components/SearchBox';
import { useRouter } from 'next/router';
import { useGlobalStats, useTopHunters, useTopBounties } from '@/lib/clientData';
import { getCachedData } from '@/components/DataPreloader';

export default function Home() {
  const router = useRouter();
  const { globalStats, isLoading: isLoadingStats } = useGlobalStats();
  const { topHunters, isLoading: isLoadingHunters } = useTopHunters();
  const { topBounties, isLoading: isLoadingBounties } = useTopBounties();
  
  // Fetch top winners from API
  const [topHunterWinners, setTopHunterWinners] = React.useState<any[]>([]);
  const [topBountyWinners, setTopBountyWinners] = React.useState<any[]>([]);
  const [isLoadingWinners, setIsLoadingWinners] = React.useState(true);
  
  // Direct data loading as backup
  const [directStats, setDirectStats] = useState<any>({});
  const [directTopHunters, setDirectTopHunters] = useState<any[]>([]);
  const [directTopBounties, setDirectTopBounties] = useState<any[]>([]);
  const [directHunterWinners, setDirectHunterWinners] = useState<any[]>([]);
  const [directBountyWinners, setDirectBountyWinners] = useState<any[]>([]);
  const [isLoadingDirect, setIsLoadingDirect] = useState(true);
  const [usingDirectData, setUsingDirectData] = useState(false);

  // Load data directly as fallback
  useEffect(() => {
    async function loadDirectData() {
      try {
        setIsLoadingDirect(true);
        console.log('Loading direct data for home page');
        
        // Load global stats from matches
        const matchesData = await getCachedData('matches.json');
        const matches = matchesData.data || [];
        
        if (matches.length > 0) {
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
          
          setDirectStats({
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
        
        // Load top hunters/bounties
        const [topHuntersData, topBountiesData] = await Promise.all([
          getCachedData('top_hunters.json'),
          getCachedData('top_bounties.json')
        ]);
        
        setDirectTopHunters(topHuntersData.top_hunters || []);
        setDirectTopBounties(topBountiesData.top_bounties || []);
        
        // Calculate winners from matches and players data
        const playersData = await getCachedData('players.json');
        const players = playersData.data || [];
        
        // Group matches by hunter
        const hunterStats: Record<string, any> = {};
        const bountyStats: Record<string, any> = {};
        
        // Initialize stats for all players
        players.forEach((player: any) => {
          if (player.hunter === 1) {
            hunterStats[player.id] = {
              wins: 0,
              matches: 0,
              name: player.name,
              id: player.id
            };
          } else {
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
          if (hunterStats[match.hunter]) {
            hunterStats[match.hunter].matches++;
            if (match.winner_is_hunter === 1) {
              hunterStats[match.hunter].wins++;
            }
          }
          
          if (bountyStats[match.bounty]) {
            bountyStats[match.bounty].matches++;
            if (match.winner_is_hunter === 0) {
              bountyStats[match.bounty].wins++;
            }
          }
        });
        
        // Convert to arrays and sort
        const sortedHunters = Object.values(hunterStats)
          .filter((stats: any) => stats.matches > 0)
          .sort((a: any, b: any) => b.wins - a.wins || (b.wins / b.matches) - (a.wins / a.matches));
        
        const sortedBounties = Object.values(bountyStats)
          .filter((stats: any) => stats.matches > 0)
          .sort((a: any, b: any) => b.wins - a.wins || (b.wins / b.matches) - (a.wins / a.matches));
        
        setDirectHunterWinners(sortedHunters);
        setDirectBountyWinners(sortedBounties);
      } catch (error) {
        console.error('Error loading direct data:', error);
      } finally {
        setIsLoadingDirect(false);
      }
    }
    
    loadDirectData();
  }, []);

  // Load winners from API
  React.useEffect(() => {
    async function fetchWinners() {
      try {
        const [hunterResponse, bountyResponse] = await Promise.all([
          fetch('/api/stats?type=hunter-winners'),
          fetch('/api/stats?type=bounty-winners')
        ]);
        
        if (hunterResponse.ok && bountyResponse.ok) {
          const hunterData = await hunterResponse.json();
          const bountyData = await bountyResponse.json();
          
          setTopHunterWinners(hunterData || []);
          setTopBountyWinners(bountyData || []);
        } else {
          console.error('Error fetching winners:', hunterResponse.status, bountyResponse.status);
          // Fall back to direct data
          setTopHunterWinners(directHunterWinners);
          setTopBountyWinners(directBountyWinners);
        }
      } catch (error) {
        console.error('Error fetching winners:', error);
        // Fall back to direct data
        setTopHunterWinners(directHunterWinners);
        setTopBountyWinners(directBountyWinners);
      } finally {
        setIsLoadingWinners(false);
      }
    }
    
    fetchWinners();
  }, [directHunterWinners, directBountyWinners]);
  
  // Determine if we should use direct data
  useEffect(() => {
    const apiDataFailed = (
      (!globalStats || Object.keys(globalStats).length === 0) && !isLoadingStats ||
      (!topHunters || topHunters.length === 0) && !isLoadingHunters ||
      (!topBounties || topBounties.length === 0) && !isLoadingBounties ||
      (!topHunterWinners || topHunterWinners.length === 0 || !topBountyWinners || topBountyWinners.length === 0) && !isLoadingWinners
    );
    
    const directDataAvailable = (
      Object.keys(directStats).length > 0 && 
      directTopHunters.length > 0 && 
      directTopBounties.length > 0 &&
      directHunterWinners.length > 0 &&
      directBountyWinners.length > 0
    );
    
    if (apiDataFailed && directDataAvailable) {
      console.log('Using direct data for home page');
      setUsingDirectData(true);
    } else {
      setUsingDirectData(false);
    }
  }, [
    globalStats, isLoadingStats, 
    topHunters, isLoadingHunters, 
    topBounties, isLoadingBounties,
    topHunterWinners, topBountyWinners, isLoadingWinners,
    directStats, directTopHunters, directTopBounties, directHunterWinners, directBountyWinners
  ]);
  
  const handleSearchResult = (playerId: string) => {
    router.push(`/player/${playerId}`);
  };

  const isLoading = (isLoadingStats || isLoadingHunters || isLoadingBounties || isLoadingWinners) && isLoadingDirect;
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="text-neon-blue animate-pulse text-2xl">LOADING DATA...</div>
      </div>
    );
  }
  
  // Use appropriate data sources
  const statsToUse = usingDirectData ? directStats : globalStats;
  const huntersToUse = usingDirectData ? directTopHunters : topHunters;
  const bountiesToUse = usingDirectData ? directTopBounties : topBounties;
  const hunterWinnersToUse = usingDirectData ? directHunterWinners : topHunterWinners;
  const bountyWinnersToUse = usingDirectData ? directBountyWinners : topBountyWinners;
  
  return (
    <div className="space-y-12">
      <section className="pt-8 md:pt-16 pb-12 text-center">
        <div className="flex justify-center mb-6">
          <Image
            src="/images/branding/Site Banner.png"
            alt="Alleycat Asset Aquisitions"
            width={400}
            height={100}
            className="object-contain"
            priority
          />
        </div>
        <motion.h1 
          className="text-4xl md:text-6xl font-heading neon-text-blue mb-4 glitch"
          data-text="ALLEYCAT"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          ALLEYCAT
        </motion.h1>
        <motion.h2 
          className="text-2xl md:text-4xl font-heading neon-text-pink mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          2025 WRAPPED
        </motion.h2>
        
        <motion.div
          className="max-w-xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >          
          <div className="flex justify-center space-x-4 mt-6">
            <Link 
              href="/search" 
              className="bg-transparent border-2 border-neon-blue hover:shadow-neon-blue transition-all duration-300 text-cyber-text py-2 px-4 rounded"
            >
              Find Player
            </Link>
            <Link 
              href="/leaderboards" 
              className="bg-transparent border-2 border-neon-pink hover:shadow-neon-pink transition-all duration-300 text-cyber-text py-2 px-4 rounded"
            >
              Leaderboards
            </Link>
          </div>
        </motion.div>
      </section>
      
      {/* Data source indicator for debugging */}
      {usingDirectData && (
        <div className="bg-cyber-dark p-2 rounded-md border border-neon-blue text-center text-sm mb-4">
          Using directly loaded data (API bypass)
        </div>
      )}
      
      <section>
        <motion.h2 
          className="text-2xl font-heading neon-text-green mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          GLOBAL STATISTICS
        </motion.h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard 
            title="Total Matches" 
            value={statsToUse.totalMatches} 
            icon={<FaCrosshairs />} 
            color="blue"
            delay={0.4}
          />
          <StatCard 
            title="Hunter Win Rate" 
            value={`${(statsToUse.hunterWinRate * 100).toFixed(1)}%`} 
            icon={<FaTrophy />} 
            color="green"
            delay={0.5}
          />
          <StatCard 
            title="Avg Hunter Time" 
            value={`${statsToUse.avgHunterTime.toFixed(0)}ms`} 
            icon={<FaBolt />} 
            color="yellow"
            delay={0.6}
          />
          <StatCard 
            title="Avg Bounty Time" 
            value={`${statsToUse.avgBountyTime.toFixed(0)}ms`} 
            icon={<FaShieldAlt />} 
            color="pink"
            delay={0.7}
          />
        </div>
      </section>
      
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <motion.h2 
            className="text-xl font-heading neon-text-green mb-4 flex items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.8 }}
          >
            <FaCrown className="mr-2" /> TOP HUNTER WINNERS
          </motion.h2>
          
          <motion.div
            className="bg-cyber-dark p-4 rounded-md border border-neon-green shadow-neon-green"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.9 }}
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-cyber-darkblue">
                    <th className="py-2 px-3 text-left">Rank</th>
                    <th className="py-2 px-3 text-left">Hunter</th>
                    <th className="py-2 px-3 text-right">Wins</th>
                    <th className="py-2 px-3 text-right">Win Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {hunterWinnersToUse.slice(0, 10).map((hunter: any, index: number) => (
                    <tr key={hunter.id} className="border-b border-cyber-darkblue last:border-0 hover:bg-cyber-darkblue">
                      <td className="py-2 px-3">
                        <span className="text-neon-yellow">#{index + 1}</span>
                      </td>
                      <td className="py-2 px-3">
                        <Link href={`/player/${hunter.id}`} className="hover:neon-text-green transition-colors duration-200">
                          {hunter.name}
                        </Link>
                      </td>
                      <td className="py-2 px-3 text-right neon-text-green">{hunter.wins}</td>
                      <td className="py-2 px-3 text-right text-cyber-text">
                        {hunter.matches > 0 ? `${((hunter.wins / hunter.matches) * 100).toFixed(1)}%` : '0%'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 text-right">
              <Link href="/leaderboards" className="text-cyber-text hover:neon-text-green text-sm">
                View Full Leaderboard →
              </Link>
            </div>
          </motion.div>
        </div>
        
        <div>
          <motion.h2 
            className="text-xl font-heading neon-text-pink mb-4 flex items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 1.0 }}
          >
            <FaCrown className="mr-2" /> TOP BOUNTY WINNERS
          </motion.h2>
          
          <motion.div
            className="bg-cyber-dark p-4 rounded-md border border-neon-pink shadow-neon-pink"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 1.1 }}
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-cyber-darkblue">
                    <th className="py-2 px-3 text-left">Rank</th>
                    <th className="py-2 px-3 text-left">Bounty</th>
                    <th className="py-2 px-3 text-right">Wins</th>
                    <th className="py-2 px-3 text-right">Win Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {bountyWinnersToUse.slice(0, 10).map((bounty: any, index: number) => (
                    <tr key={bounty.id} className="border-b border-cyber-darkblue last:border-0 hover:bg-cyber-darkblue">
                      <td className="py-2 px-3">
                        <span className="text-neon-yellow">#{index + 1}</span>
                      </td>
                      <td className="py-2 px-3">
                        <Link href={`/player/${bounty.id}`} className="hover:neon-text-pink transition-colors duration-200">
                          {bounty.name}
                        </Link>
                      </td>
                      <td className="py-2 px-3 text-right neon-text-pink">{bounty.wins}</td>
                      <td className="py-2 px-3 text-right text-cyber-text">
                        {bounty.matches > 0 ? `${((bounty.wins / bounty.matches) * 100).toFixed(1)}%` : '0%'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 text-right">
              <Link href="/leaderboards" className="text-cyber-text hover:neon-text-pink text-sm">
                View Full Leaderboard →
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
      
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <motion.h2 
            className="text-xl font-heading neon-text-green mb-4 flex items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 1.2 }}
          >
            <FaBolt className="mr-2" /> FASTEST HUNTERS
          </motion.h2>
          
          <motion.div
            className="bg-cyber-dark p-4 rounded-md border border-neon-green shadow-neon-green"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 1.3 }}
          >
            <ul className="space-y-2">
              {huntersToUse.slice(0, 5).map((hunter: any, index: number) => (
                <li key={hunter.id} className="flex justify-between items-center py-2 border-b border-cyber-darkblue last:border-0">
                  <Link href={`/player/${hunter.id}`} className="flex items-center hover:neon-text-green transition-colors duration-200">
                    <span className="text-neon-yellow mr-2">#{index + 1}</span>
                    <span>{hunter.name}</span>
                  </Link>
                  <span className="neon-text-green">{hunter.avg_time.toFixed(0)}ms</span>
                </li>
              ))}
            </ul>
            <div className="mt-4 text-right">
              <Link href="/leaderboards" className="text-cyber-text hover:neon-text-green text-sm">
                View Full Leaderboard →
              </Link>
            </div>
          </motion.div>
        </div>
        
        <div>
          <motion.h2 
            className="text-xl font-heading neon-text-pink mb-4 flex items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 1.4 }}
          >
            <FaBolt className="mr-2" /> FASTEST BOUNTIES
          </motion.h2>
          
          <motion.div
            className="bg-cyber-dark p-4 rounded-md border border-neon-pink shadow-neon-pink"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 1.5 }}
          >
            <ul className="space-y-2">
              {bountiesToUse.slice(0, 5).map((bounty: any, index: number) => (
                <li key={bounty.id} className="flex justify-between items-center py-2 border-b border-cyber-darkblue last:border-0">
                  <Link href={`/player/${bounty.id}`} className="flex items-center hover:neon-text-pink transition-colors duration-200">
                    <span className="text-neon-yellow mr-2">#{index + 1}</span>
                    <span>{bounty.name}</span>
                  </Link>
                  <span className="neon-text-pink">{bounty.avg_time.toFixed(0)}ms</span>
                </li>
              ))}
            </ul>
            <div className="mt-4 text-right">
              <Link href="/leaderboards" className="text-cyber-text hover:neon-text-pink text-sm">
                View Full Leaderboard →
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
      
      {/* Footer section with debug link */}
      <section className="py-8 border-t border-cyber-darkblue">
        <div className="flex justify-center items-center">
          <div className="text-center text-sm text-cyber-text">
            <p>Alleycat Asset Acquisitions — Neotropolis 2025</p>
            <p className="mt-2">
              <Link href="/debug" className="text-neon-blue hover:underline">
                Debug Tools
              </Link>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
} 