/**
 * Template Loader
 * Loads and matches predefined templates for common Stellar project types
 * Provides quick starts for chat flows with structured data for visual rendering
 */

const fs = require('fs');
const path = require('path');

// Cache for loaded templates to improve performance
let templateCache = null;
let cacheTimestamp = null;
const CACHE_EXPIRY = 5 * 60 * 1000; // 5 minutes

/**
 * Load all available templates from the templates directory
 * @returns {Array} Array of template objects
 */
function loadAllTemplates() {
    // Check if cache is still valid
    if (templateCache && cacheTimestamp && (Date.now() - cacheTimestamp < CACHE_EXPIRY)) {
        return templateCache;
    }

    console.log('📂 Loading templates from disk...');
    
    const templatesDir = path.join(__dirname, 'templates');
    const templates = [];
    
    try {
        // Read all JSON files in templates directory
        const templateFiles = fs.readdirSync(templatesDir)
            .filter(file => file.endsWith('.json'))
            .sort(); // Consistent ordering
        
        for (const file of templateFiles) {
            try {
                const filePath = path.join(templatesDir, file);
                const fileContent = fs.readFileSync(filePath, 'utf8');
                const template = JSON.parse(fileContent);
                
                // Add metadata about the template file
                template.metadata = {
                    ...template.metadata,
                    fileName: file,
                    loadedAt: new Date().toISOString(),
                    fileSize: fs.statSync(filePath).size
                };
                
                templates.push(template);
                console.log(`✅ Loaded template: ${template.name} (${file})`);
                
            } catch (parseError) {
                console.error(`❌ Error parsing template ${file}:`, parseError.message);
            }
        }
        
        // Update cache
        templateCache = templates;
        cacheTimestamp = Date.now();
        
        console.log(`📋 Successfully loaded ${templates.length} templates`);
        return templates;
        
    } catch (error) {
        console.error('❌ Error loading templates directory:', error.message);
        return [];
    }
}

/**
 * Match idea text against template keywords using intelligent scoring
 * @param {string} ideaText - The user's idea text to analyze
 * @param {Array} templates - Available templates to match against
 * @returns {Object} Best matching template with confidence score
 */
function matchTemplate(ideaText, templates) {
    if (!ideaText || typeof ideaText !== 'string') {
        return { template: null, confidence: 0, matchedKeywords: [] };
    }
    
    const normalizedIdea = ideaText.toLowerCase().trim();
    let bestMatch = { template: null, confidence: 0, matchedKeywords: [], scores: [] };
    
    for (const template of templates) {
        if (!template.ideaKeywords || !Array.isArray(template.ideaKeywords)) {
            continue;
        }
        
        const matchedKeywords = [];
        const keywordScores = [];
        let totalScore = 0;
        
        // Check each keyword for matches
        for (const keyword of template.ideaKeywords) {
            const normalizedKeyword = keyword.toLowerCase();
            
            if (normalizedIdea.includes(normalizedKeyword)) {
                matchedKeywords.push(keyword);
                
                // Score based on keyword length and position (exact matches score higher)
                let keywordScore = keyword.length; // Longer keywords are more specific
                
                // Bonus for exact word matches vs substring matches
                const wordRegex = new RegExp(`\\b${normalizedKeyword}\\b`, 'g');
                if (wordRegex.test(normalizedIdea)) {
                    keywordScore *= 1.5; // 50% bonus for whole word match
                }
                
                // Bonus for keywords at the beginning of the idea
                const position = normalizedIdea.indexOf(normalizedKeyword);
                if (position >= 0 && position < 50) { // Within first 50 characters
                    keywordScore *= 1.2; // 20% bonus for early position
                }
                
                keywordScores.push(keywordScore);
                totalScore += keywordScore;
            }
        }
        
        // Calculate confidence as percentage of matched keywords weighted by their scores
        const confidence = matchedKeywords.length > 0 
            ? (totalScore / template.ideaKeywords.length) / 10 // Normalize to 0-1 range
            : 0;
        
        // Track the best match
        if (confidence > bestMatch.confidence) {
            bestMatch = {
                template,
                confidence: Math.min(confidence, 1), // Cap at 100%
                matchedKeywords,
                scores: keywordScores,
                totalKeywords: template.ideaKeywords.length
            };
        }
    }
    
    return bestMatch;
}

/**
 * Enhance template data with dynamic content based on the idea
 * @param {Object} template - The matched template
 * @param {string} ideaText - Original idea text
 * @param {Array} matchedKeywords - Keywords that matched
 * @returns {Object} Enhanced template with personalized content
 */
function enhanceTemplate(template, ideaText, matchedKeywords = []) {
    const enhanced = { ...template };
    
    // Add dynamic personalization based on matched keywords
    enhanced.personalization = {
        originalIdea: ideaText,
        matchedKeywords,
        confidence: 'high', // Will be updated by caller
        suggestedFocus: generateSuggestedFocus(matchedKeywords, template.category),
        customizedQuestions: personalizeQuestions(template.defaultQuestions, matchedKeywords),
        relevantFeatures: filterRelevantFeatures(template.stellarFeatures || [], matchedKeywords)
    };
    
    // Add contextual tips based on the idea
    enhanced.contextualTips = generateContextualTips(ideaText, template.category);
    
    // Enhance schema with idea-specific suggestions
    if (enhanced.schemaMock && enhanced.schemaMock.tables) {
        enhanced.schemaMock = enhanceSchemaForIdea(enhanced.schemaMock, ideaText, matchedKeywords);
    }
    
    return enhanced;
}

/**
 * Generate suggested focus areas based on matched keywords
 * @param {Array} matchedKeywords - Keywords that matched the idea
 * @param {string} category - Template category
 * @returns {Array} Suggested focus areas
 */
function generateSuggestedFocus(matchedKeywords, category) {
    const focusMap = {
        'finance': ['User experience', 'Security', 'Compliance', 'Liquidity'],
        'payments': ['Speed', 'Cost efficiency', 'User verification', 'Cross-border regulations'],
        'governance': ['Token economics', 'Voting mechanisms', 'Community building', 'Transparency']
    };
    
    const baseFocus = focusMap[category] || ['User experience', 'Technical architecture'];
    
    // Add keyword-specific focus areas
    const keywordFocus = [];
    if (matchedKeywords.some(k => k.toLowerCase().includes('mobile'))) {
        keywordFocus.push('Mobile-first design');
    }
    if (matchedKeywords.some(k => k.toLowerCase().includes('security'))) {
        keywordFocus.push('Advanced security measures');
    }
    
    return [...baseFocus, ...keywordFocus];
}

/**
 * Personalize template questions based on matched keywords
 * @param {Array} questions - Default template questions
 * @param {Array} matchedKeywords - Keywords that matched
 * @returns {Array} Personalized questions
 */
function personalizeQuestions(questions, matchedKeywords) {
    if (!Array.isArray(questions)) return [];
    
    const personalized = [...questions];
    
    // Add keyword-specific questions
    const keywordText = matchedKeywords.join(', ').toLowerCase();
    
    if (keywordText.includes('mobile')) {
        personalized.unshift('¿Priorizarás la experiencia móvil? 📱');
    }
    
    if (keywordText.includes('international') || keywordText.includes('global')) {
        personalized.push('¿En qué países planeas lanzar primero? 🌍');
    }
    
    return personalized;
}

/**
 * Filter relevant Stellar features based on keywords
 * @param {Array} features - All available features
 * @param {Array} matchedKeywords - Keywords that matched
 * @returns {Array} Most relevant features
 */
function filterRelevantFeatures(features, matchedKeywords) {
    if (!Array.isArray(features)) return [];
    
    const keywordText = matchedKeywords.join(' ').toLowerCase();
    
    // Return all features for now, but could be filtered based on keywords
    // This allows for future enhancement without breaking existing functionality
    return features.slice(0, 5); // Limit to top 5 most relevant
}

/**
 * Generate contextual tips based on idea and category
 * @param {string} ideaText - Original idea text
 * @param {string} category - Template category  
 * @returns {Array} Contextual tips
 */
function generateContextualTips(ideaText, category) {
    const baseTips = {
        'finance': [
            '💡 Considera empezar con montos pequeños para testing',
            '🔒 La seguridad es crítica en aplicaciones financieras',
            '📊 Implementa analytics desde el día uno'
        ],
        'payments': [
            '⚡ La velocidad de transacción es clave para la UX',
            '💰 Sé transparente con las comisiones desde el inicio',
            '🌍 Considera regulaciones locales para cada mercado'
        ],
        'governance': [
            '👥 La participación comunitaria es esencial',
            '🗳️ Diseña incentivos para aumentar la participación en votaciones',
            '📈 Considera diferentes modelos de tokenomics'
        ]
    };
    
    return baseTips[category] || [
        '🚀 Comienza con un MVP y itera basado en feedback',
        '📱 Prioriza la experiencia del usuario',
        '🔄 Mantén la comunidad informada del progreso'
    ];
}

/**
 * Enhance schema mock with idea-specific suggestions
 * @param {Object} schema - Original schema mock
 * @param {string} ideaText - Original idea text
 * @param {Array} matchedKeywords - Keywords that matched
 * @returns {Object} Enhanced schema
 */
function enhanceSchemaForIdea(schema, ideaText, matchedKeywords) {
    const enhanced = { ...schema };
    
    // Add idea-specific metadata to schema
    enhanced.ideaContext = {
        originalIdea: ideaText,
        matchedKeywords,
        enhancedAt: new Date().toISOString()
    };
    
    // Could add field suggestions based on keywords
    // For now, return schema as-is with metadata
    return enhanced;
}

/**
 * Main function to load template based on idea text
 * @param {string} ideaText - The user's project idea text
 * @param {Object} options - Additional options for template loading
 * @returns {Object} Matched and enhanced template with metadata
 */
function loadTemplate(ideaText, options = {}) {
    console.log('🔍 Loading template for idea:', ideaText?.substring(0, 50) + '...');
    
    try {
        // Load all available templates
        const templates = loadAllTemplates();
        
        if (templates.length === 0) {
            console.warn('⚠️ No templates available');
            return {
                success: false,
                error: 'No templates found',
                fallback: generateFallbackTemplate(ideaText)
            };
        }
        
        // Find the best matching template
        const match = matchTemplate(ideaText, templates);
        
        if (!match.template) {
            console.log('🎯 No template matched, providing fallback');
            return {
                success: false,
                error: 'No suitable template found',
                confidence: 0,
                fallback: generateFallbackTemplate(ideaText),
                availableTemplates: templates.map(t => ({
                    id: t.templateId,
                    name: t.name,
                    category: t.category,
                    keywords: t.ideaKeywords?.slice(0, 5)
                }))
            };
        }
        
        console.log(`✅ Matched template: ${match.template.name} (confidence: ${(match.confidence * 100).toFixed(1)}%)`);
        console.log(`🎯 Matched keywords: ${match.matchedKeywords.join(', ')}`);
        
        // Enhance template with personalized content
        const enhancedTemplate = enhanceTemplate(match.template, ideaText, match.matchedKeywords);
        
        // Add matching metadata
        enhancedTemplate.matching = {
            confidence: match.confidence,
            matchedKeywords: match.matchedKeywords,
            totalKeywords: match.totalKeywords,
            matchingAlgorithm: 'keyword-based-scoring',
            processedAt: new Date().toISOString()
        };
        
        return {
            success: true,
            template: enhancedTemplate,
            confidence: match.confidence,
            matchedKeywords: match.matchedKeywords,
            alternatives: getAlternativeTemplates(templates, match.template.templateId, 2)
        };
        
    } catch (error) {
        console.error('❌ Error loading template:', error);
        
        return {
            success: false,
            error: error.message,
            fallback: generateFallbackTemplate(ideaText)
        };
    }
}

/**
 * Generate a basic fallback template when no match is found
 * @param {string} ideaText - Original idea text
 * @returns {Object} Basic fallback template
 */
function generateFallbackTemplate(ideaText) {
    return {
        templateId: 'generic-stellar',
        name: 'Generic Stellar Project',
        description: 'Basic template for Stellar blockchain projects',
        ideaKeywords: ['stellar', 'blockchain', 'crypto'],
        category: 'general',
        difficulty: 'beginner',
        
        defaultQuestions: [
            '¿Qué problema específico quieres resolver? 🎯',
            '¿Quién será tu usuario principal? 👤',
            '¿Usarás tokens existentes o crearás uno nuevo? 🪙',
            '¿Necesitas integraciones con servicios externos? 🔗'
        ],
        
        recommendedModel: 'hybrid',
        
        schemaMock: {
            tables: [{
                name: 'users',
                displayName: 'Users',
                description: 'Application users',
                fields: [
                    { name: 'id', type: 'UUID', isPrimaryKey: true },
                    { name: 'wallet_address', type: 'TEXT', description: 'Stellar wallet address' },
                    { name: 'email', type: 'TEXT' },
                    { name: 'created_at', type: 'TIMESTAMP' }
                ]
            }]
        },
        
        visualPreview: "flowchart TD\n    A[User] --> B[Connect Wallet]\n    B --> C[Use Application]\n    C --> D[Stellar Transaction]\n    D --> E[Success]",
        
        stellarFeatures: [
            'Basic payment operations',
            'Wallet connectivity',
            'Transaction history'
        ],
        
        metadata: {
            version: '1.0.0',
            lastUpdated: new Date().toISOString(),
            author: 'Stellar Idea Forge',
            isFallback: true
        }
    };
}

/**
 * Get alternative templates that might also be relevant
 * @param {Array} templates - All available templates
 * @param {string} excludeId - Template ID to exclude
 * @param {number} limit - Maximum number of alternatives
 * @returns {Array} Alternative templates
 */
function getAlternativeTemplates(templates, excludeId, limit = 2) {
    return templates
        .filter(t => t.templateId !== excludeId)
        .map(t => ({
            id: t.templateId,
            name: t.name,
            category: t.category,
            difficulty: t.difficulty,
            description: t.description
        }))
        .slice(0, limit);
}

/**
 * Get list of all available templates (metadata only)
 * @returns {Array} Template metadata
 */
function getAvailableTemplates() {
    const templates = loadAllTemplates();
    
    return templates.map(template => ({
        id: template.templateId,
        name: template.name,
        category: template.category,
        difficulty: template.difficulty,
        estimatedTime: template.estimatedTime,
        description: template.description,
        keywordCount: template.ideaKeywords?.length || 0,
        tableCount: template.schemaMock?.tables?.length || 0
    }));
}

/**
 * Clear the template cache (useful for development/testing)
 */
function clearTemplateCache() {
    templateCache = null;
    cacheTimestamp = null;
    console.log('🗑️ Template cache cleared');
}

/**
 * Demo function to show template loading with various inputs
 */
function demonstrateTemplateLoading() {
    console.log('\n🧪 Demonstrating Template Loading...\n');
    
    const testCases = [
        'Quiero crear una app de DeFi con yield farming',
        'Necesito hacer remesas a México con Stellar',
        'Vamos a crear un DAO para decisiones comunitarias',
        'App móvil para pagos internacionales',
        'Sistema de votación descentralizado'
    ];
    
    testCases.forEach((idea, index) => {
        console.log(`\n--- Test Case ${index + 1}: "${idea}" ---`);
        const result = loadTemplate(idea);
        
        if (result.success) {
            console.log(`✅ Template: ${result.template.name}`);
            console.log(`🎯 Confidence: ${(result.confidence * 100).toFixed(1)}%`);
            console.log(`📝 Keywords: ${result.matchedKeywords.join(', ')}`);
            console.log(`❓ Questions: ${result.template.defaultQuestions.length}`);
        } else {
            console.log(`❌ No match found: ${result.error}`);
            console.log(`🔄 Fallback: ${result.fallback.name}`);
        }
    });
    
    console.log('\n📊 Available templates:');
    getAvailableTemplates().forEach(t => {
        console.log(`  • ${t.name} (${t.category}, ${t.difficulty})`);
    });
}

// Export the main functions and utilities
module.exports = {
    loadTemplate,
    loadAllTemplates,
    getAvailableTemplates,
    clearTemplateCache,
    demonstrateTemplateLoading,
    matchTemplate,
    enhanceTemplate
};

// If this file is run directly, demonstrate the functionality
if (require.main === module) {
    demonstrateTemplateLoading();
}