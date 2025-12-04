const { Client, Databases, Permission, Role } = require('node-appwrite');
const fs = require('fs');
const path = require('path');

// Load environment variables from .env.local
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
const CATEGORIES_ID = env.NEXT_PUBLIC_APPWRITE_COLLECTION_CATEGORIES || 'categories';
const TOOLS_ID = env.NEXT_PUBLIC_APPWRITE_COLLECTION_TOOLS || 'tools';

async function setup() {
    console.log('Starting Appwrite Setup...');

    // 1. Create Database
    try {
        await databases.get(DATABASE_ID);
        console.log(`Database '${DATABASE_ID}' already exists.`);
    } catch (error) {
        if (error.code === 404) {
            console.log(`Creating database '${DATABASE_ID}'...`);
            await databases.create(DATABASE_ID, 'AI Tool Hunter DB');
            console.log('Database created.');
        } else {
            throw error;
        }
    }

    // 2. Create Categories Collection
    try {
        await databases.getCollection(DATABASE_ID, CATEGORIES_ID);
        console.log(`Collection '${CATEGORIES_ID}' already exists.`);
    } catch (error) {
        if (error.code === 404) {
            console.log(`Creating collection '${CATEGORIES_ID}'...`);
            await databases.createCollection(
                DATABASE_ID,
                CATEGORIES_ID,
                'Categories',
                [
                    Permission.read(Role.any()),
                    Permission.create(Role.users()),
                    Permission.update(Role.users()),
                    Permission.delete(Role.users()),
                ]
            );
            console.log('Categories collection created.');

            // Create Attributes
            console.log('Creating attributes for Categories...');
            await databases.createStringAttribute(DATABASE_ID, CATEGORIES_ID, 'name', 128, true);
            console.log('Attributes created.');
        } else {
            throw error;
        }
    }

    // 3. Create Tools Collection
    try {
        await databases.getCollection(DATABASE_ID, TOOLS_ID);
        console.log(`Collection '${TOOLS_ID}' already exists.`);
    } catch (error) {
        if (error.code === 404) {
            console.log(`Creating collection '${TOOLS_ID}'...`);
            await databases.createCollection(
                DATABASE_ID,
                TOOLS_ID,
                'Tools',
                [
                    Permission.read(Role.any()),
                    Permission.create(Role.users()),
                    Permission.update(Role.users()),
                    Permission.delete(Role.users()),
                ]
            );
            console.log('Tools collection created.');

            // Create Attributes
            console.log('Creating attributes for Tools...');
            await databases.createStringAttribute(DATABASE_ID, TOOLS_ID, 'name', 128, true);
            await databases.createStringAttribute(DATABASE_ID, TOOLS_ID, 'category', 128, true);
            await databases.createStringAttribute(DATABASE_ID, TOOLS_ID, 'description', 500, true);
            await databases.createStringAttribute(DATABASE_ID, TOOLS_ID, 'tool_type', 128, true);
            await databases.createDatetimeAttribute(DATABASE_ID, TOOLS_ID, 'date_added', true);
            console.log('Attributes created.');
        } else {
            throw error;
        }
    }

    console.log('Setup complete!');
}

setup().catch(console.error);
