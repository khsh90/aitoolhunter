/**
 * Test script for Futurepedia scraper
 * Run with: node --loader ts-node/esm scripts/test-scraper.ts
 */

import { scrapeFuturepediaTool } from '../lib/services/futurepedia-scraper';

async function testScraper() {
    console.log('='.repeat(60));
    console.log('Testing Futurepedia Scraper');
    console.log('='.repeat(60));

    const tools = ['CapCut', 'ChatGPT', 'Midjourney'];

    for (const toolName of tools) {
        console.log(`\n${'='.repeat(60)}`);
        console.log(`Testing: ${toolName}`);
        console.log('='.repeat(60));

        const result = await scrapeFuturepediaTool(toolName);

        if (result) {
            console.log('✅ SUCCESS!');
            console.log('\nData scraped:');
            console.log(`- Name: ${result.name}`);
            console.log(`- Description: ${result.description.substring(0, 100)}...`);
            console.log(`- Website: ${result.websiteUrl}`);
            console.log(`- Video: ${result.videoUrl || 'Not found'}`);
            console.log(`- Key Features: ${result.keyFeatures.length} items`);
            console.log(`- Pros: ${result.pros.length} items`);
            console.log(`- Cons: ${result.cons.length} items`);
            console.log(`- Who's Using: ${result.whoIsUsing.length} items`);
            console.log(`- Pricing Tiers: ${result.pricingTiers.length} tiers`);
            console.log(`- Ratings: ${result.ratings ? 'Available' : 'Not available'}`);

            if (result.ratings) {
                console.log(`  - Overall Score: ${result.ratings.overallScore}/5`);
            }
        } else {
            console.log('❌ FAILED - Tool not found on Futurepedia');
        }

        // Small delay to be respectful
        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log(`\n${'='.repeat(60)}`);
    console.log('Testing complete!');
    console.log('='.repeat(60));
}

testScraper().catch(console.error);
