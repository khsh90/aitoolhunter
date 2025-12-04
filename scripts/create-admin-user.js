const { Client, Users, ID } = require('node-appwrite');
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

const users = new Users(client);

const email = process.argv[2];
const password = process.argv[3];
const name = process.argv[4] || 'Admin';

if (!email || !password) {
    console.error('Usage: node scripts/create-admin-user.js <email> <password> [name]');
    process.exit(1);
}

async function createAdmin() {
    try {
        console.log(`Creating user: ${email}...`);
        const user = await users.create(ID.unique(), email, undefined, password, name);
        console.log('User created successfully!');
        console.log('ID:', user.$id);
        console.log('Email:', user.email);
        console.log('Name:', user.name);
    } catch (error) {
        console.error('Error creating user:', error.message);
    }
}

createAdmin();
