import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { PineconeStore } from 'langchain/vectorstores/pinecone';
import { pinecone } from '@/utils/pinecone-client';
import { PDFLoader } from 'langchain/document_loaders/fs/pdf';
import { PINECONE_INDEX_NAME, PINECONE_NAME_SPACE } from '@/config/pinecone';
import { DirectoryLoader } from 'langchain/document_loaders/fs/directory';

export const run = async (directoryPath: string) => {
  try {
    // Load all PDF files from the specified directory
    const directoryLoader = new DirectoryLoader(directoryPath, {
      '.pdf': (path) => new PDFLoader(path),
    });

    const rawDocs = await directoryLoader.load();
    console.log('Raw Documents:', rawDocs);

    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });

    const docs = rawDocs.filter(doc => doc.pageContent && doc.pageContent.trim() !== '');

    const splitDocs = await textSplitter.splitDocuments(docs);
    console.log('Split Documents:', splitDocs);

    console.log('Creating vector store...');
    const embeddings = new OpenAIEmbeddings();
    const index = pinecone.Index(PINECONE_INDEX_NAME);

    await PineconeStore.fromDocuments(splitDocs, embeddings, {
      pineconeIndex: index,
      namespace: PINECONE_NAME_SPACE,
      textKey: 'pageContent', // Ensure 'pageContent' field exists
    });

    console.log('Ingestion complete');
  } catch (error) {
    console.log('Error:', (error as Error).message);
    console.log((error as Error).stack);
    throw new Error('Failed to ingest your data');
  }
};

(async () => {
  const directoryPath = 'docs'; // The directory containing multiple PDFs
  await run(directoryPath);
})();
