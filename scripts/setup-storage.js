const { Client, Storage, Permission, Role } = require('node-appwrite');
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

const storage = new Storage(client);

const BUCKET_ID = 'tool-images';

async function setupStorage() {
    console.log('Setting up Storage...');

    try {
        await storage.getBucket(BUCKET_ID);
        console.log(`Bucket '${BUCKET_ID}' already exists.`);
    } catch (error) {
        if (error.code === 404) {
            console.log(`Creating bucket '${BUCKET_ID}'...`);
            await storage.createBucket(
                BUCKET_ID,
                'Tool Images',
                [
                    Permission.read(Role.any()),
                    Permission.create(Role.users()),
                    Permission.update(Role.users()),
                    Permission.delete(Role.users()),
                ],
                false, // fileSecurity
                true, // enabled
                undefined, // maxFileSize
                ['jpg', 'jpeg', 'png', 'webp', 'gif'] // allowedExtensions
            );
            console.log('Bucket created.');
        } else {
            throw error;
        }
    }
}

setupStorage().catch(console.error);
