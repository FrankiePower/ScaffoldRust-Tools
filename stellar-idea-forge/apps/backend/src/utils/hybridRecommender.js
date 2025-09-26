/**
 * Hybrid Recommender Module
 * Provides recommendations for hybrid blockchain solutions
 */

/**
 * Recommends hybrid approach for given parsed idea
 * @param {Object} parsedIdea - The parsed idea object containing keywords and metadata
 * @param {Array} parsedIdea.keywords - Array of keywords extracted from the idea
 * @param {string} parsedIdea.title - Title of the idea
 * @param {string} parsedIdea.description - Description of the idea
 * @returns {Object} Recommendation object with model type and reasons
 */
function recommendHybrid(parsedIdea) {
    if (!parsedIdea) {
        return {
            model: "hybrid",
            reasons: [
                "🔄 Default hybrid approach recommended",
                "⚡ Balanced performance and decentralization"
            ]
        };
    }

    const { keywords = [], title = "", description = "" } = parsedIdea;
    const allText = `${title} ${description}`.toLowerCase();
    
    // Define keywords that favor hybrid approach
    const hybridKeywords = [
        'remesas', 'remittance', 'payment', 'finance', 'fintech',
        'marketplace', 'commerce', 'trading', 'exchange',
        'mobile', 'app', 'user', 'consumer', 'b2c'
    ];

    const reasons = [];
    
    // Check for hybrid-favoring keywords
    const foundHybridKeywords = hybridKeywords.filter(keyword => 
        keywords.some(k => k.toLowerCase().includes(keyword)) ||
        allText.includes(keyword)
    );

    if (foundHybridKeywords.length > 0) {
        reasons.push(`🎯 Hybrid model ideal for ${foundHybridKeywords.slice(0, 2).join(', ')} applications`);
    }

    // Check for performance requirements
    if (allText.includes('fast') || allText.includes('instant') || allText.includes('real-time')) {
        reasons.push("⚡ Fast transaction processing through hybrid architecture");
    }

    // Check for user experience focus
    if (allText.includes('user') || allText.includes('consumer') || allText.includes('mobile')) {
        reasons.push("👥 Enhanced user experience with hybrid scalability");
    }

    // Check for cost efficiency
    if (allText.includes('cost') || allText.includes('fee') || allText.includes('cheap')) {
        reasons.push("💰 Cost-effective solution balancing on-chain security with off-chain efficiency");
    }

    // Default reasons if no specific matches
    if (reasons.length === 0) {
        reasons.push(
            "🔄 Hybrid approach provides optimal balance",
            "🛡️ Maintains security while improving scalability",
            "⚡ Better performance for end-user applications"
        );
    }

    return {
        model: "hybrid",
        reasons: reasons.slice(0, 3) // Limit to 3 reasons for clean display
    };
}

module.exports = {
    recommendHybrid
};