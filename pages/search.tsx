import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/router';
import SearchBox from '@/components/SearchBox';
import PlayerCard from '@/components/PlayerCard';
import { getAllFactions, getPlayersByFaction } from '@/lib/clientData';

export default function SearchPage() {
  const router = useRouter();
  const [selectedFaction, setSelectedFaction] = useState<string>('');
  const [players, setPlayers] = useState<any[]>([]);
  const [factions, setFactions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Fetch factions on component mount
  useEffect(() => {
    async function fetchFactions() {
      try {
        const data = await getAllFactions();
        setFactions(data as string[]);
      } catch (error) {
        console.error('Error fetching factions:', error);
      }
    }
    
    fetchFactions();
  }, []);
  
  const handleSearchResult = (playerId: string) => {
    router.push(`/player/${playerId}`);
  };
  
  const handleFactionChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const faction = e.target.value;
    setSelectedFaction(faction);
    
    if (faction) {
      setIsLoading(true);
      try {
        const factionPlayers = await getPlayersByFaction(faction);
        setPlayers(factionPlayers);
      } catch (error) {
        console.error('Error fetching players by faction:', error);
      } finally {
        setIsLoading(false);
      }
    } else {
      setPlayers([]);
    }
  };
  
  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl md:text-4xl font-display neon-text-blue mb-2">
          ALLEYCAT ASSET DATABASE
        </h1>
        <p className="text-cyber-text mb-6">
          Search for bounty hunters and targets in our corporate records
        </p>
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="cyber-card"
      >
        <h2 className="text-xl font-display neon-text-purple mb-4">SEARCH BY NAME OR ID</h2>
        <SearchBox onResultClick={handleSearchResult} autoFocus />
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="cyber-card"
      >
        <h2 className="text-xl font-display neon-text-green mb-4">BROWSE BY FACTION</h2>
        
        <select
          value={selectedFaction}
          onChange={handleFactionChange}
          disabled={factions.length === 0}
          className="w-full py-3 px-4 bg-cyber-darkblue border-2 border-neon-green rounded-md text-cyber-text focus:outline-none focus:shadow-neon-green transition-all duration-300"
        >
          <option value="">Select a faction</option>
          {factions.map((faction) => (
            <option key={faction} value={faction}>
              {faction.charAt(0).toUpperCase() + faction.slice(1)}
            </option>
          ))}
        </select>
        
        {isLoading && (
          <div className="mt-6 text-center">
            <p className="text-neon-blue animate-pulse">Loading faction members...</p>
          </div>
        )}
        
        {!isLoading && players.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-display text-cyber-text mb-4">
              {players.length} {players.length === 1 ? 'Member' : 'Members'} in {selectedFaction}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {players.map((player, index) => (
                <PlayerCard
                  key={player.id}
                  id={player.id}
                  name={player.name}
                  faction={player.faction}
                  isHunter={player.hunter === 1}
                  stats={player.stats || {
                    totalMatches: player.total_matches || 0,
                    winRate: player.win_rate || 0,
                    avgTime: player.avg_time || 0
                  }}
                  index={index}
                />
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
} 