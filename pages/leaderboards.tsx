import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FaBolt, FaCrosshairs, FaShieldAlt, FaTrophy } from 'react-icons/fa';
import { useTopHunters, useTopBounties, useBestPlayers } from '@/lib/clientData';

type Tab = 'best' | 'hunters' | 'bounties';

export default function LeaderboardsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('best');
  
  const { bestPlayers, isLoading: isLoadingBest } = useBestPlayers();
  const { topHunters, isLoading: isLoadingHunters } = useTopHunters();
  const { topBounties, isLoading: isLoadingBounties } = useTopBounties();
  
  const isLoading = isLoadingBest || isLoadingHunters || isLoadingBounties;
  
  const renderTab = (tab: Tab, label: string, icon: React.ReactNode) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`flex items-center space-x-2 py-2 px-4 rounded-t-md border-b-2 transition-all duration-300 ${
        activeTab === tab
          ? 'border-neon-blue neon-text-blue'
          : 'border-transparent text-cyber-text hover:neon-text-blue'
      }`}
    >
      <span>{icon}</span>
      <span>{label}</span>
    </button>
  );
  
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
          ALLEYCAT LEADERBOARDS
        </h1>
        <p className="text-cyber-text mb-6">
          Top performers from the Alleycat Asset Aquisitions bounty contracts
        </p>
      </motion.div>
      
      <div className="bg-cyber-dark rounded-md border-2 border-neon-blue overflow-hidden shadow-neon-blue">
        <div className="flex border-b border-cyber-darkblue overflow-x-auto">
          {renderTab('best', 'Best Overall', <FaTrophy className="text-neon-yellow" />)}
          {renderTab('hunters', 'Fastest Hunters', <FaCrosshairs className="text-neon-green" />)}
          {renderTab('bounties', 'Fastest Bounties', <FaShieldAlt className="text-neon-pink" />)}
        </div>
        
        <div className="p-4">
          {activeTab === 'best' && (
            <motion.div
              key="best"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-display neon-text-yellow">BEST OVERALL PLAYERS</h2>
                <span className="text-cyber-text text-sm">Ranked by performance and win rate</span>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-cyber-darkblue">
                      <th className="py-2 px-4 text-left">Rank</th>
                      <th className="py-2 px-4 text-left">Name</th>
                      <th className="py-2 px-4 text-right">Win Rate</th>
                      <th className="py-2 px-4 text-right">Matches</th>
                      <th className="py-2 px-4 text-right">Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bestPlayers.map((player: any, index: number) => (
                      <motion.tr
                        key={player.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        className="border-b border-cyber-darkblue hover:bg-cyber-darkblue"
                      >
                        <td className="py-3 px-4 text-neon-yellow">{index + 1}</td>
                        <td className="py-3 px-4">
                          <Link href={`/player/${player.id}`} className="hover:neon-text-blue transition-colors duration-200">
                            {player.name}
                            <span className="ml-2 text-xs text-cyber-text">#{player.id}</span>
                          </Link>
                        </td>
                        <td className="py-3 px-4 text-right neon-text-green">{(player.win_rate * 100).toFixed(1)}%</td>
                        <td className="py-3 px-4 text-right text-cyber-text">{player.total_matches}</td>
                        <td className="py-3 px-4 text-right neon-text-blue">{player.performance_score.toFixed(2)}</td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}
          
          {activeTab === 'hunters' && (
            <motion.div
              key="hunters"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-display neon-text-green">FASTEST HUNTERS</h2>
                <span className="text-cyber-text text-sm">Ranked by reaction time</span>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-cyber-darkblue">
                      <th className="py-2 px-4 text-left">Rank</th>
                      <th className="py-2 px-4 text-left">Name</th>
                      <th className="py-2 px-4 text-right">Avg Time</th>
                      <th className="py-2 px-4 text-right">Fastest</th>
                      <th className="py-2 px-4 text-right">Matches</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topHunters.map((hunter: any, index: number) => (
                      <motion.tr
                        key={hunter.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        className="border-b border-cyber-darkblue hover:bg-cyber-darkblue"
                      >
                        <td className="py-3 px-4 text-neon-yellow">{index + 1}</td>
                        <td className="py-3 px-4">
                          <Link href={`/player/${hunter.id}`} className="hover:neon-text-green transition-colors duration-200">
                            {hunter.name}
                            <span className="ml-2 text-xs text-cyber-text">#{hunter.id}</span>
                          </Link>
                        </td>
                        <td className="py-3 px-4 text-right neon-text-green">{hunter.avg_time.toFixed(1)}ms</td>
                        <td className="py-3 px-4 text-right neon-text-blue">{hunter.fastest_time}ms</td>
                        <td className="py-3 px-4 text-right text-cyber-text">{hunter.total_matches}</td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}
          
          {activeTab === 'bounties' && (
            <motion.div
              key="bounties"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-display neon-text-pink">FASTEST BOUNTIES</h2>
                <span className="text-cyber-text text-sm">Ranked by reaction time</span>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-cyber-darkblue">
                      <th className="py-2 px-4 text-left">Rank</th>
                      <th className="py-2 px-4 text-left">Name</th>
                      <th className="py-2 px-4 text-right">Avg Time</th>
                      <th className="py-2 px-4 text-right">Fastest</th>
                      <th className="py-2 px-4 text-right">Matches</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topBounties.map((bounty: any, index: number) => (
                      <motion.tr
                        key={bounty.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        className="border-b border-cyber-darkblue hover:bg-cyber-darkblue"
                      >
                        <td className="py-3 px-4 text-neon-yellow">{index + 1}</td>
                        <td className="py-3 px-4">
                          <Link href={`/player/${bounty.id}`} className="hover:neon-text-pink transition-colors duration-200">
                            {bounty.name}
                            <span className="ml-2 text-xs text-cyber-text">#{bounty.id}</span>
                          </Link>
                        </td>
                        <td className="py-3 px-4 text-right neon-text-pink">{bounty.avg_time.toFixed(1)}ms</td>
                        <td className="py-3 px-4 text-right neon-text-blue">{bounty.fastest_time}ms</td>
                        <td className="py-3 px-4 text-right text-cyber-text">{bounty.total_matches}</td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
} 