import { NextApiRequest, NextApiResponse } from 'next';
import { run } from '@/scripts/ingest-data';
import path from 'path';
import { v4 as uuidv4 } from 'uuid'; // Import the 'uuidv4' function

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { directoryName } = req.body;

    if (!directoryName) {
      return res.status(400).json({ error: 'Directory name is required.' });
    }

    try {
      const directoryPath = path.join(process.cwd(), directoryName);
      await run(directoryPath);

      const assetId = uuidv4(); // Use the 'uuidv4' function
      res.status(200).json({ assetId });
    } catch (error) {
      console.error('Error processing document:', error);
      res.status(500).json({ error: 'Failed to process the documents.' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed.' });
  }
}
