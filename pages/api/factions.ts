import type { NextApiRequest, NextApiResponse } from 'next';
import { getAllFactions } from '@/lib/data';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const factions = getAllFactions();
    return res.status(200).json(factions);
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
} 