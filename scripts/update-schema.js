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

const DATABASE_ID = env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'ai-tool-hunter';
const TOOLS_ID = env.NEXT_PUBLIC_APPWRITE_COLLECTION_TOOLS || 'tools';

async function updateSchema() {
    console.log('Updating Schema...');

    try {
        console.log('Adding image_url attribute...');
        await databases.createStringAttribute(DATABASE_ID, TOOLS_ID, 'image_url', 2048, false); // URL can be long, not required for old docs
        console.log('image_url added.');
    } catch (error) {
        console.log('image_url might already exist:', error.message);
    }

    try {
        console.log('Adding video_url attribute...');
        await databases.createStringAttribute(DATABASE_ID, TOOLS_ID, 'video_url', 2048, false);
        console.log('video_url added.');
    } catch (error) {
        console.log('video_url might already exist:', error.message);
    }

    console.log('Schema update complete.');
}

updateSchema().catch(console.error);
