import type { NextApiRequest, NextApiResponse } from 'next';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { PineconeStore } from 'langchain/vectorstores/pinecone';
import { makeChain } from '@/utils/makechain';
import { pinecone } from '@/utils/pinecone-client';
import { PINECONE_INDEX_NAME, PINECONE_NAME_SPACE } from '@/config/pinecone';
import { Document } from 'langchain/document'; 

// In-memory store for chat history
export const chatHistoryStore: { [key: string]: [string, string][] } = {};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { chatThreadId, message } = req.body;

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!chatThreadId || !message) {
    return res.status(400).json({ error: 'Chat thread ID and message are required.' });
  }

  try {
    const sanitizedMessage = message.trim().replaceAll('\n', ' ');

    const index = pinecone.Index(PINECONE_INDEX_NAME);

    // Create vector store
    const vectorStore = await PineconeStore.fromExistingIndex(
      new OpenAIEmbeddings({}),
      {
        pineconeIndex: index,
        textKey: 'pageContent',
        namespace: PINECONE_NAME_SPACE,
      },
    );

    let resolveWithDocuments: (value: Document[]) => void;
    const documentPromise = new Promise<Document[]>((resolve) => {
      resolveWithDocuments = resolve;
    });

    const retriever = vectorStore.asRetriever({
      callbacks: [
        {
          handleRetrieverEnd(documents) {
            resolveWithDocuments(documents);
          },
        },
      ],
    });

    // Create the chain
    const chain = makeChain(retriever);

    // Retrieve the chat history from the in-memory store based on `chatThreadId`
    const chatHistory = chatHistoryStore[chatThreadId] || [];

    const pastMessages = chatHistory
      .map((msg: [string, string]) => `Human: ${msg[0]}\nAssistant: ${msg[1]}`)
      .join('\n');

    const response = await chain.invoke({
      question: sanitizedMessage,
      chat_history: pastMessages,
    });

    const sourceDocuments = await documentPromise;

    // Save chat history to in-memory store
    if (!chatHistoryStore[chatThreadId]) {
      chatHistoryStore[chatThreadId] = [];
    }
    chatHistoryStore[chatThreadId].push([sanitizedMessage, response]);

    return res.status(200).json({ text: response, sourceDocuments });
  } catch (error: any) {
    console.error('Error:', error);
    return res.status(500).json({ error: error.message || 'Something went wrong' });
  }
}
