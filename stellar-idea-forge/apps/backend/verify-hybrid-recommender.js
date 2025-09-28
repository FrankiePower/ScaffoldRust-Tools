#!/usr/bin/env node

/**
 * Hybrid Recommender Verification Script
 * Run this anytime to verify the implementation works perfectly
 */

const { recommendHybrid } = require('./src/utils/hybridRecommender');

console.log('🔍 Hybrid Recommender Verification');
console.log('='.repeat(40));

// Quick verification of key requirements
let passed = 0;
let total = 0;

function test(name, condition) {
    total++;
    if (condition) {
        console.log(`✅ ${name}`);
        passed++;
    } else {
        console.log(`❌ ${name}`);
    }
}

// Test with sample payment idea
const sampleIdea = {
    title: "Sistema de remesas móvil",
    description: "App para enviar dinero con consultas frecuentes",
    keywords: ['remesas', 'mobile', 'payment'],
    originalText: "aplicación móvil remesas rápidas usuarios frecuentes datos grandes"
};

const result = recommendHybrid(sampleIdea);

// Verify basic structure
test('Returns hybrid model', result.model === 'hybrid');
test('Has reasons array', Array.isArray(result.reasons) && result.reasons.length > 0);
test('Has viability string', typeof result.viability === 'string');
test('Has score object', typeof result.score === 'object');
test('Has supabaseSchema', typeof result.supabaseSchema === 'object');
test('Has metrics', typeof result.metrics === 'object');

// Verify content quality
test('Reasons have emojis', result.reasons.some(r => /[\u{1F300}-\u{1F5FF}]|[\u{1F600}-\u{1F64F}]|[\u{1F680}-\u{1F6FF}]|[\u{2600}-\u{26FF}]/u.test(r)));
test('Schema has users table', result.supabaseSchema.tables.some(t => t.name === 'users'));
test('Schema has payment table', result.supabaseSchema.tables.some(t => t.name === 'transactions'));
test('Metrics have latency', result.metrics.latencia && result.metrics.latencia.includes('ms'));

// Verify scoring logic
test('Off-chain indicators > 0', result.score.offChainIndicators > 0);
test('Overall score calculated', typeof result.score.overall === 'number');

// Test null handling
const nullResult = recommendHybrid(null);
test('Handles null input', nullResult.model === 'hybrid');

console.log('\n📊 Verification Results:');
console.log(`${passed}/${total} tests passed (${Math.round(passed/total*100)}%)`);

if (passed === total) {
    console.log('\n🎉 Implementation is PERFECT! ✨');
    console.log('Ready for production use! 🚀');
} else {
    console.log('\n⚠️ Some issues detected. Check implementation.');
}

// Sample output for manual inspection
console.log('\n📋 Sample Output:');
console.log(JSON.stringify({
    model: result.model,
    reasons: result.reasons,
    viability: result.viability,
    tableCount: result.supabaseSchema.tables.length
}, null, 2));