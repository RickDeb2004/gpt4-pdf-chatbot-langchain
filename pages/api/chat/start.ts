// pages/api/chat/start.ts
import { v4 as uuidv4 } from 'uuid';
import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { assetId } = req.body;

    if (!assetId) {
      return res.status(400).json({ error: 'Asset ID is required.' });
    }

    // Generate a unique Chat Thread ID
    const chatThreadId = uuidv4();

    // Optionally, store the chatThreadId and assetId in your database

    return res.status(200).json({ chatThreadId });
  } else {
    res.status(405).json({ error: 'Method not allowed.' });
  }
}
