const { Client, Databases } = require('node-appwrite');
require('dotenv').config({ path: '.env.local' });

const client = new Client();
client
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);

async function addEnhancedFields() {
    const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;
    const collectionId = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_TOOLS;

    try {
        console.log('🔍 Adding enhanced fields to tools collection...\n');

        // Check if collection exists
        try {
            await databases.getCollection(databaseId, collectionId);
            console.log('✅ Collection "tools" found!\n');
        } catch (error) {
            console.error('❌ Collection not found. Please create it first.');
            process.exit(1);
        }

        // Add new fields (all optional for backward compatibility)
        const newFields = [
            { key: 'keyFeatures', type: 'string', array: true, label: 'Key Features' },
            { key: 'pros', type: 'string', array: true, label: 'Pros' },
            { key: 'cons', type: 'string', array: true, label: 'Cons' },
            { key: 'whoIsUsing', type: 'string', array: true, label: 'Who Is Using' },
            { key: 'pricingTiers', type: 'string', size: 10000, label: 'Pricing Tiers (JSON)' },
            { key: 'whatMakesUnique', type: 'string', size: 1000, label: 'What Makes Unique' },
            { key: 'ratings', type: 'string', size: 5000, label: 'Ratings (JSON)' },
            { key: 'uncommonUseCases', type: 'string', array: true, label: 'Uncommon Use Cases' },
            { key: 'dataSource', type: 'string', size: 50, label: 'Data Source' }
        ];

        for (const field of newFields) {
            try {
                console.log(`Adding field: ${field.label}...`);

                if (field.array) {
                    await databases.createStringAttribute(
                        databaseId,
                        collectionId,
                        field.key,
                        field.size || 500,
                        false, // not required
                        null, // no default
                        true // array
                    );
                } else {
                    await databases.createStringAttribute(
                        databaseId,
                        collectionId,
                        field.key,
                        field.size || 500,
                        false // not required
                    );
                }

                console.log(`  ✓ Added: ${field.label}`);

                // Wait between attribute creations
                await new Promise(resolve => setTimeout(resolve, 2000));
            } catch (error) {
                if (error.code === 409) {
                    console.log(`  ⚠ Field "${field.key}" already exists, skipping...`);
                } else {
                    console.error(`  ❌ Error adding ${field.label}:`, error.message);
                }
            }
        }

        console.log('\n✅ Enhanced fields added successfully!');
        console.log('\n📊 New Fields Added:');
        console.log('   - keyFeatures (array): Key features of the tool');
        console.log('   - pros (array): Advantages');
        console.log('   - cons (array): Disadvantages');
        console.log('   - whoIsUsing (array): Who is using the tool');
        console.log('   - pricingTiers (JSON string): Pricing information');
        console.log('   - whatMakesUnique (string): What makes the tool unique');
        console.log('   - ratings (JSON string): Tool ratings');
        console.log('   - uncommonUseCases (array): Uncommon use cases');
        console.log('   - dataSource (string): Where the data came from (futurepedia/api)');
        console.log('\n💡 All fields are optional and backward compatible!');

    } catch (error) {
        console.error('❌ Error:', error.message);
        if (error.response) {
            console.error('Response:', error.response);
        }
        process.exit(1);
    }
}

addEnhancedFields();
