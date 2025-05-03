import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { FaTrophy, FaBolt, FaCrosshairs, FaShieldAlt, FaMedal, FaCrown } from 'react-icons/fa';
import StatCard from '@/components/StatCard';
import SearchBox from '@/components/SearchBox';
import { useRouter } from 'next/router';
import { useGlobalStats, useTopHunters, useTopBounties } from '@/lib/clientData';

export default function Home() {
  const router = useRouter();
  const { globalStats, isLoading: isLoadingStats } = useGlobalStats();
  const { topHunters, isLoading: isLoadingHunters } = useTopHunters();
  const { topBounties, isLoading: isLoadingBounties } = useTopBounties();
  
  // Fetch top winners from API
  const [topHunterWinners, setTopHunterWinners] = React.useState([]);
  const [topBountyWinners, setTopBountyWinners] = React.useState([]);
  const [isLoadingWinners, setIsLoadingWinners] = React.useState(true);

  React.useEffect(() => {
    async function fetchWinners() {
      try {
        const [hunterResponse, bountyResponse] = await Promise.all([
          fetch('/api/stats?type=hunter-winners'),
          fetch('/api/stats?type=bounty-winners')
        ]);
        
        const hunterData = await hunterResponse.json();
        const bountyData = await bountyResponse.json();
        
        setTopHunterWinners(hunterData || []);
        setTopBountyWinners(bountyData || []);
      } catch (error) {
        console.error('Error fetching winners:', error);
      } finally {
        setIsLoadingWinners(false);
      }
    }
    
    fetchWinners();
  }, []);
  
  const handleSearchResult = (playerId: string) => {
    router.push(`/player/${playerId}`);
  };

  const isLoading = isLoadingStats || isLoadingHunters || isLoadingBounties || isLoadingWinners;
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="text-neon-blue animate-pulse text-2xl">LOADING DATA...</div>
      </div>
    );
  }
  
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
            value={globalStats.totalMatches} 
            icon={<FaCrosshairs />} 
            color="blue"
            delay={0.4}
          />
          <StatCard 
            title="Hunter Win Rate" 
            value={`${(globalStats.hunterWinRate * 100).toFixed(1)}%`} 
            icon={<FaTrophy />} 
            color="green"
            delay={0.5}
          />
          <StatCard 
            title="Avg Hunter Time" 
            value={`${globalStats.avgHunterTime.toFixed(0)}ms`} 
            icon={<FaBolt />} 
            color="yellow"
            delay={0.6}
          />
          <StatCard 
            title="Avg Bounty Time" 
            value={`${globalStats.avgBountyTime.toFixed(0)}ms`} 
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
                  {topHunterWinners.slice(0, 10).map((hunter: any, index: number) => (
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
                  {topBountyWinners.slice(0, 10).map((bounty: any, index: number) => (
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
              {topHunters.slice(0, 5).map((hunter: any, index: number) => (
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
              {topBounties.slice(0, 5).map((bounty: any, index: number) => (
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
    </div>
  );
} 