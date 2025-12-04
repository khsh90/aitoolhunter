const { Client, Databases } = require('node-appwrite');
const fs = require('fs');
const path = require('path');

// Load environment variables
const envPath = path.resolve(__dirname, '../.env.local');
const envConfig = fs.readFileSync(envPath, 'utf8');
const env = {};
envConfig.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
        env[key.trim()] = value.trim();
    }
});

const client = new Client()
    .setEndpoint(env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
    .setProject(env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
    .setKey(env.APPWRITE_API_KEY);

const databases = new Databases(client);

const DATABASE_ID = env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;
const TOOLS_COLLECTION_ID = env.NEXT_PUBLIC_APPWRITE_COLLECTION_TOOLS;

async function updateSchema() {
    console.log('Adding website_url to tools collection...');
    try {
        await databases.createUrlAttribute(DATABASE_ID, TOOLS_COLLECTION_ID, 'website_url', false);
        console.log('Attribute website_url created.');
    } catch (error) {
        console.error('Error adding attribute:', error.message);
    }
}

updateSchema();
