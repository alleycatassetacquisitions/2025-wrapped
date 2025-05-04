import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

// Get all players
export function usePlayers() {
  const { data, error } = useSWR('/data/players.json', fetcher);

  return {
    players: data?.data || [],
    isLoading: !error && !data,
    isError: error
  };
}

// Search players (client-side implementation)
export function useSearchPlayers(query: string) {
  const { players, isLoading, isError } = usePlayers();
  
  // Only search when query is at least 2 characters
  const filteredPlayers = !isLoading && query && query.length >= 2 
    ? players.filter((player: any) => 
        player.id.includes(query.toLowerCase()) || 
        player.name.toLowerCase().includes(query.toLowerCase())
      )
    : [];
  
  return {
    results: filteredPlayers,
    isLoading,
    isError
  };
}

// Get global stats
export function useGlobalStats() {
  const { data, error } = useSWR('/data/global_stats.json', fetcher);

  return {
    globalStats: data || {},
    isLoading: !error && !data,
    isError: error
  };
}

// Get top hunters
export function useTopHunters() {
  const { data, error } = useSWR('/data/top_hunters.json', fetcher);

  return {
    topHunters: data?.top_hunters || [],
    isLoading: !error && !data,
    isError: error
  };
}

// Get top bounties
export function useTopBounties() {
  const { data, error } = useSWR('/data/top_bounties.json', fetcher);

  return {
    topBounties: data?.top_bounties || [],
    isLoading: !error && !data,
    isError: error
  };
}

// Get best players
export function useBestPlayers() {
  const { data, error } = useSWR('/data/best_players.json', fetcher);

  return {
    bestPlayers: data?.best_players || [],
    isLoading: !error && !data,
    isError: error
  };
}

// Get player by ID
export function usePlayer(id: string) {
  // Fetch basic player info from all players
  const { players, isLoading: isLoadingPlayers, isError: isErrorPlayers } = usePlayers();
  
  // Fetch player stats with rankings
  const { data: statsData, error: statsError, isLoading: isLoadingStats } = useSWR(
    id ? `/data/player_stats/${id}.json` : null, 
    fetcher,
    {
      // Handle 404s gracefully
      onErrorRetry: (error, key, config, revalidate, { retryCount }) => {
        // Don't retry on 404s
        if (error.status === 404) return;
        // Only retry up to 3 times
        if (retryCount >= 3) return;
      }
    }
  );
  
  // Find player in the players array
  const player = !isLoadingPlayers && id 
    ? players.find((p: any) => p.id === id) 
    : null;
  
  // Extract rankings from stats data
  const rankings = statsData?.rankings || { overall: 0, hunter: 0, bounty: 0 };
  
  return {
    player,
    rankings,
    isLoading: isLoadingPlayers || isLoadingStats,
    isError: isErrorPlayers || statsError
  };
}

// Get player stats
export function usePlayerStats(id: string) {
  const { data, error } = useSWR(
    id ? `/data/player_stats/${id}.json` : null, 
    fetcher,
    {
      // Handle 404s gracefully
      onErrorRetry: (error, key, config, revalidate, { retryCount }) => {
        // Don't retry on 404s
        if (error.status === 404) return;
        // Only retry up to 3 times
        if (retryCount >= 3) return;
      }
    }
  );

  return {
    stats: data || {},
    isLoading: !error && !data,
    isError: error
  };
}

// Get player matches
export function usePlayerMatches(id: string) {
  const { data, error } = useSWR(
    id ? `/data/player_matches/${id}.json` : null, 
    fetcher,
    {
      // Handle 404s gracefully
      onErrorRetry: (error, key, config, revalidate, { retryCount }) => {
        // Don't retry on 404s
        if (error.status === 404) return;
        // Only retry up to 3 times
        if (retryCount >= 3) return;
      }
    }
  );

  return {
    matches: data || [],
    isLoading: !error && !data,
    isError: error
  };
}

// Get all player rankings
export function useRankings() {
  const { data, error } = useSWR('/data/rankings.json', fetcher);

  return {
    rankings: data || { overall: [], hunters: [], bounties: [] },
    isLoading: !error && !data,
    isError: error
  };
}

// Get all factions (client-side implementation)
export function useFactions() {
  const { players, isLoading } = usePlayers();
  
  const factions = !isLoading && players
    ? Array.from(new Set(
        players
          .filter((p: any) => p.faction && p.faction.trim() !== '')
          .map((p: any) => p.faction.toLowerCase())
      )).sort()
    : [];
  
  return {
    factions,
    isLoading
  };
}

// Get players by faction (client-side implementation)
export function usePlayersByFaction(faction: string) {
  const { players, isLoading } = usePlayers();
  
  const filteredPlayers = !isLoading && faction
    ? players.filter((p: any) => 
        p.faction && p.faction.toLowerCase() === faction.toLowerCase()
      )
    : [];
  
  return {
    players: filteredPlayers,
    isLoading
  };
}

// These methods are kept for backward compatibility
// but implemented on the client side

export async function getAllFactions() {
  // Get the data from the static file
  const response = await fetch('/data/players.json');
  const playersData = await response.json();
  const players = playersData.data || [];
  
  // Extract unique factions
  const factions = Array.from(new Set(
    players
      .filter((p: any) => p.faction && p.faction.trim() !== '')
      .map((p: any) => p.faction.toLowerCase())
  )).sort();
  
  return factions;
}

export async function getPlayersByFaction(faction: string) {
  // Get the data from the static file
  const response = await fetch('/data/players.json');
  const playersData = await response.json();
  const players = playersData.data || [];
  
  // Filter players by faction
  return players.filter((p: any) => 
    p.faction && p.faction.toLowerCase() === faction.toLowerCase()
  );
} 