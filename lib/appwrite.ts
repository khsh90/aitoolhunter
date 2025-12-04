import { Client, Account, Databases, Storage, Query } from 'appwrite';

export const client = new Client();

client
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1')
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '');

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);

export const APPWRITE_CONFIG = {
    databaseId: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'ai-tool-hunter',
    bucketId: 'tool-images',
    collections: {
        categories: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_CATEGORIES || 'categories',
        tools: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_TOOLS || 'tools',
    }
};

// Helper to list documents
export const getDocuments = async (collectionId: string, queries: any[] = []) => {
    try {
        return await databases.listDocuments(
            APPWRITE_CONFIG.databaseId,
            collectionId,
            queries
        );
    } catch (error) {
        console.error('Appwrite getDocuments error:', error);
        return { documents: [], total: 0 };
    }
};
