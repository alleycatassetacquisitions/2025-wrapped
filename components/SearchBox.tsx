import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSearchPlayers } from '@/lib/clientData';

interface PlayerResult {
  id: string;
  name: string;
  hunter: boolean;
}

interface SearchBoxProps {
  onResultClick?: (playerId: string) => void;
  autoFocus?: boolean;
}

const SearchBox: React.FC<SearchBoxProps> = ({ onResultClick, autoFocus = false }) => {
  const [query, setQuery] = useState('');
  const { results, isLoading } = useSearchPlayers(query);

  const handleResultClick = (playerId: string) => {
    if (onResultClick) {
      onResultClick(playerId);
    }
    setQuery('');
  };

  return (
    <div className="w-full relative">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name or ID..."
          autoFocus={autoFocus}
          className="w-full py-3 px-4 bg-cyber-darkblue border-2 border-neon-blue rounded-md text-cyber-text focus:outline-none focus:shadow-neon-blue transition-all duration-300"
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
          {isLoading ? (
            <span className="animate-pulse text-neon-blue">...</span>
          ) : (
            query.length > 0 && (
              <button 
                onClick={() => setQuery('')}
                className="text-cyber-text hover:text-white focus:outline-none"
              >
                ×
              </button>
            )
          )}
        </div>
      </div>

      {results.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.2 }}
          className="absolute z-10 mt-2 w-full bg-cyber-dark border-2 border-neon-purple rounded-md shadow-neon-purple overflow-hidden"
        >
          <ul className="max-h-60 overflow-y-auto">
            {results.map((player: PlayerResult) => (
              <li key={player.id}>
                <button
                  onClick={() => handleResultClick(player.id)}
                  className="w-full text-left px-4 py-2 hover:bg-cyber-darkblue transition-colors duration-150 flex items-center justify-between"
                >
                  <span className="text-cyber-text">
                    {player.name} 
                    <span className="ml-2 text-xs neon-text-yellow">#{player.id}</span>
                  </span>
                  <span className={player.hunter ? "text-xs neon-text-green" : "text-xs neon-text-pink"}>
                    {player.hunter ? "HUNTER" : "BOUNTY"}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </motion.div>
      )}
    </div>
  );
};

export default SearchBox; 