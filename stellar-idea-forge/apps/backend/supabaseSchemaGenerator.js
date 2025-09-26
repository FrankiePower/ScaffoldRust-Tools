/**
 * Supabase Schema Generator
 * Generates basic database schemas programmatically using Supabase SDK
 * Creates mock tables for hybrid recommendations and outputs schema JSON for visual previews
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

/**
 * Initialize Supabase client with environment variables
 * Uses test environment variables to avoid real database writes
 * @returns {object} Supabase client instance
 */
function initializeSupabaseClient() {
    const supabaseUrl = process.env.SUPABASE_URL || 'https://example.supabase.co';
    const supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.example';
    
    // For testing purposes, we'll create a client but won't actually write to DB
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    console.log('🔌 Supabase client initialized for schema generation');
    return supabase;
}

/**
 * Analyzes recommendation data to determine appropriate fields for schema
 * @param {object} recommendationData - The recommendation context and parsed idea
 * @returns {object} Field configuration based on the idea context
 */
function analyzeRecommendationFields(recommendationData = {}) {
    const ideaText = JSON.stringify(recommendationData).toLowerCase();
    
    // Base fields that all tables should have
    const baseFields = [
        { name: 'id', type: 'SERIAL PRIMARY KEY', description: 'Unique identifier' },
        { name: 'created_at', type: 'TIMESTAMP DEFAULT NOW()', description: 'Record creation time' },
        { name: 'updated_at', type: 'TIMESTAMP DEFAULT NOW()', description: 'Last update time' }
    ];
    
    // Context-specific fields based on idea content
    let contextFields = [];
    let tableName = 'users'; // default table name
    
    if (ideaText.includes('remesas') || ideaText.includes('remittance') || ideaText.includes('payment')) {
        tableName = 'users';
        contextFields = [
            { name: 'email', type: 'TEXT NOT NULL', description: 'User email address' },
            { name: 'wallet_address', type: 'TEXT', description: 'Stellar wallet address' },
            { name: 'full_name', type: 'TEXT', description: 'User full name' },
            { name: 'phone_number', type: 'TEXT', description: 'Contact phone number' },
            { name: 'country_code', type: 'TEXT', description: 'Country code for remittance' }
        ];
    } else if (ideaText.includes('trading') || ideaText.includes('exchange')) {
        tableName = 'traders';
        contextFields = [
            { name: 'email', type: 'TEXT NOT NULL', description: 'Trader email' },
            { name: 'wallet_address', type: 'TEXT', description: 'Trading wallet address' },
            { name: 'trading_level', type: 'TEXT DEFAULT \'beginner\'', description: 'Experience level' },
            { name: 'balance_xlm', type: 'DECIMAL(18,7) DEFAULT 0', description: 'XLM balance' }
        ];
    } else if (ideaText.includes('nft') || ideaText.includes('token') || ideaText.includes('collectible')) {
        tableName = 'collectors';
        contextFields = [
            { name: 'email', type: 'TEXT NOT NULL', description: 'Collector email' },
            { name: 'wallet_address', type: 'TEXT', description: 'NFT wallet address' },
            { name: 'username', type: 'TEXT UNIQUE', description: 'Display name' },
            { name: 'avatar_url', type: 'TEXT', description: 'Profile picture URL' }
        ];
    } else if (ideaText.includes('defi') || ideaText.includes('lending') || ideaText.includes('yield')) {
        tableName = 'investors';
        contextFields = [
            { name: 'email', type: 'TEXT NOT NULL', description: 'Investor email' },
            { name: 'wallet_address', type: 'TEXT', description: 'DeFi wallet address' },
            { name: 'risk_tolerance', type: 'TEXT DEFAULT \'medium\'', description: 'Investment risk level' },
            { name: 'total_invested', type: 'DECIMAL(18,7) DEFAULT 0', description: 'Total amount invested' }
        ];
    } else {
        // Default user table for general blockchain apps
        contextFields = [
            { name: 'email', type: 'TEXT NOT NULL', description: 'User email address' },
            { name: 'wallet_address', type: 'TEXT', description: 'Stellar wallet address' },
            { name: 'username', type: 'TEXT', description: 'Display name' }
        ];
    }
    
    return {
        tableName,
        fields: [...baseFields, ...contextFields]
    };
}

/**
 * Generates SQL CREATE TABLE statement from field configuration
 * @param {string} tableName - Name of the table
 * @param {array} fields - Array of field objects with name, type, and description
 * @returns {string} Complete SQL CREATE TABLE statement
 */
function generateCreateTableSQL(tableName, fields) {
    const fieldDefinitions = fields.map(field => {
        const comment = field.description ? ` -- ${field.description}` : '';
        return `    ${field.name} ${field.type}${comment}`;
    }).join(',\n');
    
    return `CREATE TABLE ${tableName} (\n${fieldDefinitions}\n);`;
}

/**
 * Main function to generate basic schema from recommendation data
 * Creates simple table structure and returns JSON schema for visualization
 * @param {object} recommendationData - Context data about the project idea
 * @returns {object} Schema JSON with tables, fields, and SQL for frontend rendering
 */
function generateBasicSchema(recommendationData = {}) {
    console.log('🗄️ Starting basic schema generation...');
    
    try {
        // Initialize Supabase client (for future real DB operations)
        const supabase = initializeSupabaseClient();
        
        // Analyze recommendation data to determine appropriate fields
        const { tableName, fields } = analyzeRecommendationFields(recommendationData);
        
        // Generate SQL for table creation
        const createSQL = generateCreateTableSQL(tableName, fields);
        
        // Prepare field list for JSON response (without SQL types for clean display)
        const displayFields = fields.map(field => ({
            name: field.name,
            description: field.description,
            isPrimaryKey: field.name === 'id',
            isRequired: field.type.includes('NOT NULL') || field.name === 'id',
            isTimestamp: field.name.includes('_at')
        }));
        
        // Generate the complete schema JSON
        const schemaJSON = {
            schema: {
                tables: [{
                    name: tableName,
                    displayName: tableName.charAt(0).toUpperCase() + tableName.slice(1),
                    fields: displayFields,
                    description: `Main ${tableName} table for the application`,
                    recordCount: 0, // Mock data - would be real in production
                    isGenerated: true
                }],
                sql: createSQL,
                metadata: {
                    generatedAt: new Date().toISOString(),
                    context: 'hybrid_recommendation',
                    supabaseConnected: true,
                    tableCount: 1,
                    fieldCount: fields.length
                }
            },
            recommendations: {
                nextSteps: [
                    'Add authentication table for user management',
                    'Consider adding indexes for frequently queried fields',
                    'Set up RLS (Row Level Security) policies',
                    'Create API endpoints for CRUD operations'
                ],
                bestPractices: [
                    'Always use UUID for primary keys in production',
                    'Add proper constraints and validations',
                    'Implement audit trails with triggers',
                    'Use proper data types for your use case'
                ]
            }
        };
        
        console.log('✅ Schema generation completed successfully');
        console.log(`📋 Generated table: ${tableName} with ${fields.length} fields`);
        
        return schemaJSON;
        
    } catch (error) {
        console.error('❌ Error generating schema:', error);
        
        // Return error schema for graceful handling
        return {
            schema: {
                tables: [],
                sql: '-- Schema generation failed',
                metadata: {
                    generatedAt: new Date().toISOString(),
                    context: 'hybrid_recommendation',
                    supabaseConnected: false,
                    error: error.message
                }
            },
            error: {
                message: error.message,
                type: 'schema_generation_error'
            }
        };
    }
}

/**
 * Helper function to validate schema JSON structure
 * @param {object} schemaJSON - Generated schema JSON
 * @returns {boolean} True if schema is valid
 */
function validateSchemaJSON(schemaJSON) {
    if (!schemaJSON || !schemaJSON.schema) return false;
    if (!schemaJSON.schema.tables || !Array.isArray(schemaJSON.schema.tables)) return false;
    if (!schemaJSON.schema.sql || typeof schemaJSON.schema.sql !== 'string') return false;
    
    return true;
}

/**
 * Demo function to show schema generation with sample data
 * Useful for testing and development
 */
function demonstrateSchemaGeneration() {
    console.log('\n🧪 Demonstrating Schema Generation...\n');
    
    const sampleRecommendations = [
        {
            idea: { text: 'Crear una app de remesas usando Stellar para enviar dinero internacional' },
            context: 'remittance_app'
        },
        {
            idea: { text: 'Build an NFT marketplace on Stellar for digital art collection' },
            context: 'nft_marketplace'
        },
        {
            idea: { text: 'DeFi lending platform with yield farming capabilities' },
            context: 'defi_platform'
        }
    ];
    
    sampleRecommendations.forEach((sample, index) => {
        console.log(`\n--- Sample ${index + 1}: ${sample.context} ---`);
        const schema = generateBasicSchema(sample);
        console.log('Generated Schema Preview:');
        console.log(`Table: ${schema.schema.tables[0]?.name || 'none'}`);
        console.log(`Fields: ${schema.schema.tables[0]?.fieldCount || 0}`);
        console.log('SQL Preview:', schema.schema.sql.substring(0, 100) + '...');
    });
}

// Export the main function and utilities
module.exports = {
    generateBasicSchema,
    validateSchemaJSON,
    demonstrateSchemaGeneration,
    initializeSupabaseClient
};

// If this file is run directly, demonstrate the functionality
if (require.main === module) {
    demonstrateSchemaGeneration();
}