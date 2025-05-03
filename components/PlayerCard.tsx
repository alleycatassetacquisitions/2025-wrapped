import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface PlayerCardProps {
  id: string;
  name: string;
  faction?: string;
  isHunter: boolean;
  stats?: {
    totalMatches?: number;
    winRate?: number;
    avgTime?: number;
  };
  index?: number;
}

const PlayerCard: React.FC<PlayerCardProps> = ({ 
  id, 
  name, 
  faction = '', 
  isHunter, 
  stats,
  index = 0
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      className="relative bg-cyber-dark p-4 rounded-md border-2 border-neon-blue hover:shadow-neon-blue transition-all duration-300"
    >
      <Link href={`/player/${id}`} className="block group">
        <div className="absolute top-2 right-2 text-xs px-2 py-1 rounded-full bg-cyber-darkblue">
          <span className={isHunter ? "neon-text-green" : "neon-text-pink"}>
            {isHunter ? "HUNTER" : "BOUNTY"}
          </span>
        </div>
        
        <h3 className="text-xl font-display mb-2 group-hover:neon-text-blue transition-all duration-300">
          {name}
        </h3>
        
        <div className="flex items-center space-x-2 mb-2">
          <span className="text-cyber-text text-sm bg-cyber-black px-2 py-1 rounded">
            ID: <span className="neon-text-yellow">{id}</span>
          </span>
          {faction && (
            <span className="text-cyber-text text-sm bg-cyber-black px-2 py-1 rounded">
              Faction: <span className="neon-text-purple">{faction}</span>
            </span>
          )}
        </div>
        
        {stats && (
          <div className="grid grid-cols-3 gap-2 mt-3">
            {stats.totalMatches !== undefined && (
              <div className="text-center">
                <span className="text-xs text-cyber-text block">Matches</span>
                <span className="text-lg neon-text-blue">{stats.totalMatches}</span>
              </div>
            )}
            
            {stats.winRate !== undefined && (
              <div className="text-center">
                <span className="text-xs text-cyber-text block">Win Rate</span>
                <span className="text-lg neon-text-green">{(stats.winRate * 100).toFixed(0)}%</span>
              </div>
            )}
            
            {stats.avgTime !== undefined && (
              <div className="text-center">
                <span className="text-xs text-cyber-text block">Avg Time</span>
                <span className="text-lg neon-text-pink">{stats.avgTime.toFixed(0)}ms</span>
              </div>
            )}
          </div>
        )}
      </Link>
    </motion.div>
  );
};

export default PlayerCard; 