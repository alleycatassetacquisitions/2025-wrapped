import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

// Function to get data from a JSON file in the public directory
export async function getJSONData(filename: string) {
  try {
    console.log(`Fetching data from: /data/${filename}`);
    const response = await fetch(`/data/${filename}`);
    
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
      const response = await fetch(url);
      if (response.ok) {
        return response.json();
      }
      
      // If API fails, attempt direct data access
      console.log('API call failed, attempting direct data access for player', id);
      const players = await getJSONData('players.json');
      const player = players.data?.find((p: any) => p.id === id);
      
      if (!player) {
        throw new Error('Player not found');
      }
      
      return player;
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