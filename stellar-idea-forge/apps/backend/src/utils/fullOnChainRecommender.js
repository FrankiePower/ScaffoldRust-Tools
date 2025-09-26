/**
 * Full On-Chain Recommender Module
 * Provides recommendations for full on-chain blockchain solutions
 */

/**
 * Recommends full on-chain approach for given parsed idea
 * @param {Object} parsedIdea - The parsed idea object containing keywords and metadata
 * @param {Array} parsedIdea.keywords - Array of keywords extracted from the idea
 * @param {string} parsedIdea.title - Title of the idea
 * @param {string} parsedIdea.description - Description of the idea
 * @returns {Object} Recommendation object with model type and reasons
 */
function recommendFullOnChain(parsedIdea) {
    if (!parsedIdea) {
        return {
            model: "full-on-chain",
            reasons: [
                "⛓️ Full decentralization by default",
                "🛡️ Maximum security and transparency",
                "⚠️ Consider potential latency implications"
            ]
        };
    }

    const { keywords = [], title = "", description = "" } = parsedIdea;
    const allText = `${title} ${description}`.toLowerCase();
    
    // Define keywords that favor full on-chain approach
    const onChainKeywords = [
        'dao', 'governance', 'voting', 'decentralized',
        'defi', 'protocol', 'consensus', 'treasury',
        'token', 'nft', 'collectible', 'ownership',
        'audit', 'transparency', 'immutable', 'trustless'
    ];

    const reasons = [];
    let hasLatencyWarning = false;
    
    // Check for on-chain-favoring keywords
    const foundOnChainKeywords = onChainKeywords.filter(keyword => 
        keywords.some(k => k.toLowerCase().includes(keyword)) ||
        allText.includes(keyword)
    );

    if (foundOnChainKeywords.length > 0) {
        reasons.push(`⛓️ Full on-chain ideal for ${foundOnChainKeywords.slice(0, 2).join(', ')} requirements`);
    }

    // Check for DAO-specific requirements (should include latency warning)
    if (allText.includes('dao') || allText.includes('governance') || allText.includes('voting')) {
        reasons.push("🗳️ Governance mechanisms require full on-chain transparency");
        reasons.push("⚠️ DAO operations may experience higher latency for consensus");
        hasLatencyWarning = true;
    }

    // Check for security/transparency requirements
    if (allText.includes('security') || allText.includes('transparent') || allText.includes('immutable')) {
        reasons.push("🛡️ Maximum security through full decentralization");
    }

    // Check for DeFi protocols
    if (allText.includes('defi') || allText.includes('protocol') || allText.includes('liquidity')) {
        reasons.push("💎 DeFi protocols benefit from full on-chain composability");
    }

    // Check for ownership/NFT requirements
    if (allText.includes('nft') || allText.includes('ownership') || allText.includes('collectible')) {
        reasons.push("🎨 Digital ownership requires full on-chain verification");
    }

    // Add latency warning if not already added and it's not a DAO
    if (!hasLatencyWarning && foundOnChainKeywords.length > 0) {
        reasons.push("⚠️ Consider potential latency trade-offs for better decentralization");
    }

    // Default reasons if no specific matches
    if (reasons.length === 0) {
        reasons.push(
            "⛓️ Full on-chain provides maximum decentralization",
            "🛡️ Complete transparency and immutability",
            "⚠️ Consider potential latency implications"
        );
    }

    return {
        model: "full-on-chain",
        reasons: reasons.slice(0, 3) // Limit to 3 reasons for clean display
    };
}

module.exports = {
    recommendFullOnChain
};