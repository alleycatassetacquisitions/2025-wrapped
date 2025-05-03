import React from 'react';
import { motion } from 'framer-motion';
import { FaTrophy, FaBolt, FaCrosshairs, FaShieldAlt, FaHourglass, FaFire, FaUsers } from 'react-icons/fa';
import StatCard from '@/components/StatCard';
import { useGlobalStats } from '@/lib/clientData';

export default function StatsPage() {
  const { globalStats, isLoading } = useGlobalStats();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="text-neon-blue animate-pulse text-2xl">LOADING DATA...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl md:text-4xl font-display neon-text-blue mb-2">
          ALLEYCAT GLOBAL STATISTICS
        </h1>
        <p className="text-cyber-text mb-6">
          Overall performance metrics from Alleycat Asset Aquisitions contracts
        </p>
      </motion.div>

      <div className="cyber-card space-y-8">
        <div>
          <h2 className="text-xl font-display neon-text-green mb-6">MATCH OVERVIEW</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard 
              title="Total Matches" 
              value={globalStats.totalMatches} 
              icon={<FaUsers />}
              color="blue"
              delay={0.1}
            />
            <StatCard 
              title="Hunter Wins" 
              value={globalStats.hunterWins} 
              icon={<FaCrosshairs />}
              color="green"
              delay={0.2}
            />
            <StatCard 
              title="Bounty Wins" 
              value={globalStats.bountyWins} 
              icon={<FaShieldAlt />}
              color="pink"
              delay={0.3}
            />
            <StatCard 
              title="Hunter Win Rate" 
              value={`${(globalStats.hunterWinRate * 100).toFixed(1)}%`} 
              icon={<FaTrophy />}
              color="yellow"
              delay={0.4}
            />
          </div>
        </div>

        <div>
          <h2 className="text-xl font-display neon-text-pink mb-6">REACTION TIMES</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard 
              title="Avg Hunter Time" 
              value={`${globalStats.avgHunterTime.toFixed(0)}ms`} 
              icon={<FaHourglass />}
              color="green"
              delay={0.5}
            />
            <StatCard 
              title="Avg Bounty Time" 
              value={`${globalStats.avgBountyTime.toFixed(0)}ms`} 
              icon={<FaHourglass />}
              color="pink"
              delay={0.6}
            />
            <StatCard 
              title="Fastest Hunter" 
              value={`${globalStats.fastestHunterTime}ms`} 
              icon={<FaFire />}
              color="yellow"
              delay={0.7}
            />
            <StatCard 
              title="Fastest Bounty" 
              value={`${globalStats.fastestBountyTime}ms`} 
              icon={<FaFire />}
              color="purple"
              delay={0.8}
            />
          </div>
        </div>

        <div className="p-6 border-2 border-neon-blue bg-cyber-dark rounded-md">
          <h3 className="text-lg font-display neon-text-blue mb-4">ANALYSIS</h3>
          <div className="space-y-4 text-cyber-text">
            <p>
              The global statistics show that hunters win {(globalStats.hunterWinRate * 100).toFixed(1)}% of duels, 
              indicating {globalStats.hunterWinRate > 0.5 ? 'their advantage in' : 'a relatively balanced'} quickdraw scenarios.
            </p>
            <p>
              Average reaction time is {globalStats.avgHunterTime.toFixed(0)}ms for hunters and {globalStats.avgBountyTime.toFixed(0)}ms for bounties, 
              {globalStats.avgHunterTime < globalStats.avgBountyTime ? ' with hunters showing faster reflexes overall.' : ' with bounties showing faster reflexes overall.'}
            </p>
            <p>
              The fastest recorded times show the physical limits of human reaction: {globalStats.fastestHunterTime}ms for hunters and {globalStats.fastestBountyTime}ms for bounties.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 