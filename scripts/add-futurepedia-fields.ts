/**
 * Appwrite Database Migration Script
 * Adds Futurepedia fields to the tools collection
 */

import { Client, Databases } from 'node-appwrite';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

// Initialize Appwrite client
const client = new Client();
client
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1')
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '')
    .setKey(process.env.APPWRITE_API_KEY || '');

const databases = new Databases(client);

// Get database and collection IDs from environment
const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || '';
const collectionId = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_TOOLS || '';

async function addFuturepediaFields() {
    console.log('🚀 Starting Appwrite migration...\n');
    console.log(`Endpoint: ${process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT}`);
    console.log(`Project: ${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}`);
    console.log(`Database ID: ${databaseId}`);
    console.log(`Collection ID: ${collectionId}\n`);

    try {
        // 1. Key Features (array of strings)
        console.log('Adding keyFeatures field...');
        await databases.createStringAttribute(
            databaseId,
            collectionId,
            'keyFeatures',
            500,
            false, // not required
            undefined,
            true // array
        );
        console.log('✅ keyFeatures added');

        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));

        // 2. Pros (array of strings)
        console.log('Adding pros field...');
        await databases.createStringAttribute(
            databaseId,
            collectionId,
            'pros',
            500,
            false,
            undefined,
            true
        );
        console.log('✅ pros added');

        await new Promise(resolve => setTimeout(resolve, 1000));

        // 3. Cons (array of strings)
        console.log('Adding cons field...');
        await databases.createStringAttribute(
            databaseId,
            collectionId,
            'cons',
            500,
            false,
            undefined,
            true
        );
        console.log('✅ cons added');

        await new Promise(resolve => setTimeout(resolve, 1000));

        // 4. Who Is Using (array of strings)
        console.log('Adding whoIsUsing field...');
        await databases.createStringAttribute(
            databaseId,
            collectionId,
            'whoIsUsing',
            500,
            false,
            undefined,
            true
        );
        console.log('✅ whoIsUsing added');

        await new Promise(resolve => setTimeout(resolve, 1000));

        // 5. Pricing Tiers (JSON string)
        console.log('Adding pricingTiers field...');
        await databases.createStringAttribute(
            databaseId,
            collectionId,
            'pricingTiers',
            5000,
            false
        );
        console.log('✅ pricingTiers added');

        await new Promise(resolve => setTimeout(resolve, 1000));

        // 6. What Makes Unique (string)
        console.log('Adding whatMakesUnique field...');
        await databases.createStringAttribute(
            databaseId,
            collectionId,
            'whatMakesUnique',
            2000,
            false
        );
        console.log('✅ whatMakesUnique added');

        await new Promise(resolve => setTimeout(resolve, 1000));

        // 7. Ratings (JSON string)
        console.log('Adding ratings field...');
        await databases.createStringAttribute(
            databaseId,
            collectionId,
            'ratings',
            1000,
            false
        );
        console.log('✅ ratings added');

        await new Promise(resolve => setTimeout(resolve, 1000));

        // 8. Data Source (string)
        console.log('Adding dataSource field...');
        await databases.createStringAttribute(
            databaseId,
            collectionId,
            'dataSource',
            50,
            false,
            'api' // default value
        );
        console.log('✅ dataSource added');

        await new Promise(resolve => setTimeout(resolve, 1000));

        // 9. Uncommon Use Cases (array of strings)
        console.log('Adding uncommonUseCases field...');
        await databases.createStringAttribute(
            databaseId,
            collectionId,
            'uncommonUseCases',
            500,
            false,
            undefined,
            true
        );
        console.log('✅ uncommonUseCases added');

        console.log('\n🎉 Migration completed successfully!');
        console.log('\nNew fields added:');
        console.log('- keyFeatures (array)');
        console.log('- pros (array)');
        console.log('- cons (array)');
        console.log('- whoIsUsing (array)');
        console.log('- pricingTiers (JSON string)');
        console.log('- whatMakesUnique (string)');
        console.log('- ratings (JSON string)');
        console.log('- dataSource (string)');
        console.log('- uncommonUseCases (array)');
        console.log('\nYou can now use auto-generate with Futurepedia data!');

    } catch (error: any) {
        if (error.code === 409) {
            console.log('\n⚠️ Some fields already exist. This is OK!');
            console.log('The migration will skip existing fields.');
        } else {
            console.error('\n❌ Migration failed:', error.message);
            console.error('Error details:', error);
        }
    }
}

// Run migration
addFuturepediaFields()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error('Unexpected error:', error);
        process.exit(1);
    });
