import React, { useState, useEffect } from 'react';
import { getJSONData } from '@/lib/clientData';

// Global cache for data files
declare global {
  interface Window {
    __CACHED_DATA__: Record<string, any>;
  }
}

// Initialize global cache
if (typeof window !== 'undefined') {
  window.__CACHED_DATA__ = window.__CACHED_DATA__ || {};
}

const dataFiles = [
  'players.json',
  'matches.json',
  'best_players.json',
  'top_hunters.json',
  'top_bounties.json'
];

// Function to get cached data or load it
export async function getCachedData(filename: string): Promise<any> {
  // Server-side has no cache
  if (typeof window === 'undefined') {
    return getJSONData(filename);
  }
  
  // Check if data is already cached
  if (window.__CACHED_DATA__[filename]) {
    console.log(`Using cached data for ${filename}`);
    return window.__CACHED_DATA__[filename];
  }
  
  // Load and cache data
  try {
    console.log(`Loading and caching data for ${filename}`);
    const data = await getJSONData(filename);
    window.__CACHED_DATA__[filename] = data;
    return data;
  } catch (error) {
    console.error(`Failed to load ${filename}:`, error);
    return { data: [] };
  }
}

const DataPreloader: React.FC = () => {
  const [loaded, setLoaded] = useState(false);
  
  useEffect(() => {
    async function preloadData() {
      try {
        console.log('Preloading data files...');
        
        // Attempt to load all data files in parallel
        const promises = dataFiles.map(file => 
          getCachedData(file)
            .then(() => console.log(`Successfully preloaded: ${file}`))
            .catch(error => console.error(`Failed to preload ${file}:`, error))
        );
        
        await Promise.all(promises);
        console.log('Data preloading complete');
        setLoaded(true);
      } catch (error) {
        console.error('Error during data preloading:', error);
      }
    }
    
    preloadData();
  }, []);
  
  // This is a hidden component that doesn't render anything visible
  return null;
};

export default DataPreloader; 