const { Client, Databases, ID } = require('node-appwrite');
require('dotenv').config({ path: '.env.local' });

const client = new Client();
client
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);

async function setupQuotaCollection() {
    const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;
    const collectionId = 'api_quotas';

    try {
        console.log('🔍 Checking if api_quotas collection already exists...');

        try {
            await databases.getCollection(databaseId, collectionId);
            console.log('✅ Collection "api_quotas" already exists!');
            return;
        } catch (error) {
            if (error.code === 404) {
                console.log('📝 Collection does not exist. Creating...');
            } else {
                throw error;
            }
        }

        // Create the collection
        console.log('Creating collection "api_quotas"...');
        await databases.createCollection(
            databaseId,
            collectionId,
            'API Quotas',
            [
                // Public read/write permissions for authenticated users
                'read("any")',
                'create("any")',
                'update("any")',
                'delete("any")'
            ]
        );
        console.log('✅ Collection created successfully!');

        // Create attributes
        console.log('Adding attributes...');

        // service (string, required)
        await databases.createStringAttribute(
            databaseId,
            collectionId,
            'service',
            50,
            true
        );
        console.log('  ✓ Added: service (string)');

        // Wait a bit for attribute creation
        await new Promise(resolve => setTimeout(resolve, 1000));

        // used_daily (integer, default: 0)
        await databases.createIntegerAttribute(
            databaseId,
            collectionId,
            'used_daily',
            false,
            0
        );
        console.log('  ✓ Added: used_daily (integer)');

        await new Promise(resolve => setTimeout(resolve, 1000));

        // used_monthly (integer, default: 0)
        await databases.createIntegerAttribute(
            databaseId,
            collectionId,
            'used_monthly',
            false,
            0
        );
        console.log('  ✓ Added: used_monthly (integer)');

        await new Promise(resolve => setTimeout(resolve, 1000));

        // last_reset_daily (string)
        await databases.createStringAttribute(
            databaseId,
            collectionId,
            'last_reset_daily',
            100,
            false
        );
        console.log('  ✓ Added: last_reset_daily (string)');

        await new Promise(resolve => setTimeout(resolve, 1000));

        // last_reset_monthly (string)
        await databases.createStringAttribute(
            databaseId,
            collectionId,
            'last_reset_monthly',
            100,
            false
        );
        console.log('  ✓ Added: last_reset_monthly (string)');

        await new Promise(resolve => setTimeout(resolve, 1000));

        // limit_daily (integer)
        await databases.createIntegerAttribute(
            databaseId,
            collectionId,
            'limit_daily',
            true
        );
        console.log('  ✓ Added: limit_daily (integer)');

        await new Promise(resolve => setTimeout(resolve, 1000));

        // limit_monthly (integer)
        await databases.createIntegerAttribute(
            databaseId,
            collectionId,
            'limit_monthly',
            true
        );
        console.log('  ✓ Added: limit_monthly (integer)');

        // Create index on service field for faster queries
        console.log('Creating index on "service" field...');
        await new Promise(resolve => setTimeout(resolve, 2000));

        await databases.createIndex(
            databaseId,
            collectionId,
            'service_index',
            'key',
            ['service'],
            ['ASC']
        );
        console.log('  ✓ Added: index on service');

        console.log('\n✅ API Quotas collection setup complete!');
        console.log('\n📊 Collection Details:');
        console.log(`   Database ID: ${databaseId}`);
        console.log(`   Collection ID: ${collectionId}`);
        console.log('   Attributes: service, used_daily, used_monthly, last_reset_daily, last_reset_monthly, limit_daily, limit_monthly');
        console.log('   Index: service_index');

    } catch (error) {
        console.error('❌ Error setting up collection:', error.message);
        if (error.response) {
            console.error('Response:', error.response);
        }
        process.exit(1);
    }
}

setupQuotaCollection();
