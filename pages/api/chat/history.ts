import type { NextApiRequest, NextApiResponse } from 'next';

// Import the in-memory chat history store
import { chatHistoryStore } from './message'; // Make sure to export chatHistoryStore in message.ts

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { chatThreadId } = req.query;

  if (req.method === 'GET') {
    if (!chatThreadId || typeof chatThreadId !== 'string') {
      return res.status(400).json({ error: 'Chat thread ID is required.' });
    }

    // Retrieve chat history from the in-memory store
    const history = chatHistoryStore[chatThreadId] || [];

    return res.status(200).json({ history });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
