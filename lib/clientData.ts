import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

// Function to get data from a JSON file in the public directory
export async function getJSONData(filename: string) {
  try {
    const response = await fetch(`/data/${filename}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch ${filename}`);
    }
    return response.json();
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
  const { data, error } = useSWR(id ? `/api/players?id=${id}` : null, fetcher);

  return {
    player: data || null,
    rankings: data?.rankings || { overall: 0, hunter: 0, bounty: 0 },
    isLoading: !error && !data,
    isError: error
  };
}

// Get player stats
export function usePlayerStats(id: string) {
  const { data, error } = useSWR(id ? `/api/stats?playerId=${id}` : null, fetcher);

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