import useSWR from 'swr';
import fs from 'fs';
import path from 'path';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

// Function to get data from a JSON file in the public directory
export async function getJSONData(filename: string) {
  try {
    // We need to use a different approach for server-side vs client-side
    const isServer = typeof window === 'undefined';
    
    // For server-side, try reading from filesystem first
    if (isServer) {
      try {
        const dataDir = path.join(process.cwd(), 'public', 'data');
        const fullPath = path.join(dataDir, filename);
        console.log(`Attempting to read file directly from filesystem: ${fullPath}`);
        
        if (fs.existsSync(fullPath)) {
          const fileContents = fs.readFileSync(fullPath, 'utf8');
          const data = JSON.parse(fileContents);
          console.log(`Successfully read ${filename} from filesystem`);
          return data;
        } else {
          console.log(`File not found at ${fullPath}, falling back to fetch`);
        }
      } catch (fsError) {
        console.error(`Filesystem access failed for ${filename}:`, fsError);
      }
    }
    
    // If filesystem access failed or we're on client-side, use fetch
    let url;
    
    if (isServer) {
      // In server environment, we need to use an absolute URL with the proper origin
      // For local development, use http://localhost:3000
      // For production, ideally use process.env.VERCEL_URL or a similar environment variable
      const baseUrl = process.env.VERCEL_URL 
        ? `https://${process.env.VERCEL_URL}`
        : process.env.NODE_ENV === 'development' 
          ? 'http://localhost:3000' 
          : '';
          
      url = `${baseUrl}/data/${filename}`;
      console.log(`Fetching data from (server-side): ${url}`);
    } else {
      // In client environment, we can use a relative URL
      url = `/data/${filename}`;
      console.log(`Fetching data from (client-side): ${url}`);
    }
    
    const response = await fetch(url);
    
    if (!response.ok) {
      console.error(`Failed to fetch ${filename}: ${response.status} ${response.statusText}`);
      throw new Error(`Failed to fetch ${filename}: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log(`Successfully fetched ${filename}`);
    return data;
  } catch (error) {
    console.error(`Error fetching ${filename}:`, error);
    return { data: [] };
  }
}

// Search players
export function useSearchPlayers(query: string) {
  const { data, error } = useSWR(
    query && query.length >= 2 ? `/api/players?search=${encodeURIComponent(query)}` : null,
    fetcher
  );

  return {
    results: data || [],
    isLoading: !error && !data,
    isError: error
  };
}

// Get global stats
export function useGlobalStats() {
  const { data, error } = useSWR('/api/stats?type=global', fetcher);

  return {
    globalStats: data || {},
    isLoading: !error && !data,
    isError: error
  };
}

// Get top hunters
export function useTopHunters() {
  const { data, error } = useSWR('/api/stats?type=hunters', fetcher);

  return {
    topHunters: data || [],
    isLoading: !error && !data,
    isError: error
  };
}

// Get top bounties
export function useTopBounties() {
  const { data, error } = useSWR('/api/stats?type=bounties', fetcher);

  return {
    topBounties: data || [],
    isLoading: !error && !data,
    isError: error
  };
}

// Get best players
export function useBestPlayers() {
  const { data, error } = useSWR('/api/stats?type=best', fetcher);

  return {
    bestPlayers: data || [],
    isLoading: !error && !data,
    isError: error
  };
}

// Get player by ID
export function usePlayer(id: string) {
  const { data, error } = useSWR(id ? `/api/players?id=${id}` : null, async (url) => {
    try {
      // First try the API
      console.log(`Fetching player ${id} from API`);
      const response = await fetch(url);
      
      if (response.ok) {
        const playerData = await response.json();
        console.log(`Successfully fetched player ${id} from API`);
        return playerData;
      }
      
      console.error(`API failed for player ${id}: ${response.status} ${response.statusText}`);
      
      // If API fails, try direct data access
      if (typeof window !== 'undefined' && window.__CACHED_DATA__) {
        console.log(`Trying to get player ${id} from cached data`);
        // Try to get from cache first
        if (window.__CACHED_DATA__['players.json']) {
          const players = window.__CACHED_DATA__['players.json'].data || [];
          const player = players.find((p: any) => 
            p.id === id || 
            p.id === Number(id) || 
            p.id.toString() === id.toString()
          );
          
          if (player) {
            console.log(`Found player ${id} in cached data`);
            return {
              ...player,
              rankings: { overall: 1, hunter: player.hunter === 1 ? 1 : 0, bounty: player.hunter === 0 ? 1 : 0 }
            };
          }
        }
      }
      
      // Final fallback - load data directly
      console.log(`Trying to load player ${id} directly from data file`);
      const playersData = await getJSONData('players.json');
      const players = playersData.data || [];
      const player = players.find((p: any) => 
        p.id === id || 
        p.id === Number(id) || 
        p.id.toString() === id.toString()
      );
      
      if (player) {
        console.log(`Found player ${id} in direct data access`);
        return {
          ...player,
          rankings: { overall: 1, hunter: player.hunter === 1 ? 1 : 0, bounty: player.hunter === 0 ? 1 : 0 }
        };
      }
      
      throw new Error(`Player ${id} not found`);
    } catch (error) {
      console.error(`Error fetching player ${id}:`, error);
      throw error;
    }
  });

  return {
    player: data || null,
    rankings: data?.rankings || { overall: 0, hunter: 0, bounty: 0 },
    isLoading: !error && !data,
    isError: error
  };
}

// Get player stats
export function usePlayerStats(id: string) {
  const { data, error } = useSWR(id ? `/api/stats?playerId=${id}` : null, async (url) => {
    try {
      const response = await fetch(url);
      if (response.ok) {
        return response.json();
      }
      
      // If API fails, attempt direct data calculation
      console.log('API call failed, attempting direct data access for player stats', id);
      const matches = await getJSONData('matches.json');
      
      // Filter matches for this player
      const playerMatches = matches.data?.filter((match: any) => 
        match.hunter === id || match.bounty === id
      ) || [];
      
      if (playerMatches.length === 0) {
        return {}; // No matches found
      }
      
      // Basic stats calculation
      const hunterMatches = playerMatches.filter((match: any) => match.hunter === id);
      const bountyMatches = playerMatches.filter((match: any) => match.bounty === id);
      
      const hunterWins = hunterMatches.filter((match: any) => match.winner_is_hunter === 1).length;
      const bountyWins = bountyMatches.filter((match: any) => match.winner_is_hunter === 0).length;
      
      const totalMatches = playerMatches.length;
      const totalWins = hunterWins + bountyWins;
      const winRate = totalMatches > 0 ? totalWins / totalMatches : 0;
      
      return {
        totalMatches,
        totalWins,
        winRate,
        hunterMatches: hunterMatches.length,
        bountyMatches: bountyMatches.length,
        hunterWins,
        bountyWins
      };
    } catch (error) {
      console.error(`Error fetching player stats ${id}:`, error);
      throw error;
    }
  });

  return {
    stats: data || {},
    isLoading: !error && !data,
    isError: error
  };
}

// Get player matches
export function usePlayerMatches(id: string) {
  const { data, error } = useSWR(id ? `/api/matches?playerId=${id}` : null, fetcher);

  return {
    matches: data || [],
    isLoading: !error && !data,
    isError: error
  };
}

// Get all factions - this requires specialized endpoint
export async function getAllFactions() {
  const response = await fetch('/api/factions');
  const data = await response.json();
  return data || [];
}

// Get players by faction - this requires specialized endpoint
export async function getPlayersByFaction(faction: string) {
  const response = await fetch(`/api/players?faction=${encodeURIComponent(faction)}`);
  const data = await response.json();
  return data || [];
} 