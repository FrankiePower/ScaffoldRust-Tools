/**
 * Unit Tests for Data Recommendation Logic
 * Tests hybrid and full on-chain recommendation functions
 */

const { recommendHybrid } = require('../src/utils/hybridRecommender');
const { recommendFullOnChain } = require('../src/utils/fullOnChainRecommender');

describe('Hybrid Recommendation Logic', () => {
    describe('recommendHybrid', () => {
        test('should recommend hybrid for remesas app with proper emojis', () => {
            const parsedIdea = {
                title: "Remesas App",
                description: "A mobile app for fast remittance services",
                keywords: ["remesas", "mobile", "payment", "fast"]
            };

            const result = recommendHybrid(parsedIdea);

            expect(result.model).toBe("hybrid");
            expect(result.reasons).toBeDefined();
            expect(result.reasons.length).toBeGreaterThan(0);
            expect(result.reasons.length).toBeLessThanOrEqual(3);
            
            // Check for emojis in reasons
            const hasEmojis = result.reasons.some(reason => 
                /[\u{1F000}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u.test(reason)
            );
            expect(hasEmojis).toBe(true);

            // Should mention remesas/payment applications
            const mentionsRelevantKeywords = result.reasons.some(reason => 
                reason.toLowerCase().includes('remesas') || 
                reason.toLowerCase().includes('payment') ||
                reason.toLowerCase().includes('hybrid')
            );
            expect(mentionsRelevantKeywords).toBe(true);

            console.log('Remesas app recommendation:', result);
        });

        test('should handle edge case with no keywords', () => {
            const parsedIdea = {
                title: "",
                description: "",
                keywords: []
            };

            const result = recommendHybrid(parsedIdea);

            expect(result.model).toBe("hybrid");
            expect(result.reasons).toBeDefined();
            expect(result.reasons.length).toBe(3); // Default reasons
            
            // Should provide default reasons with emojis
            expect(result.reasons).toContain("🔄 Hybrid approach provides optimal balance");
            expect(result.reasons).toContain("🛡️ Maintains security while improving scalability");
            expect(result.reasons).toContain("⚡ Better performance for end-user applications");

            console.log('No keywords recommendation:', result);
        });

        test('should handle null/undefined input gracefully', () => {
            const result = recommendHybrid(null);

            expect(result.model).toBe("hybrid");
            expect(result.reasons).toBeDefined();
            expect(result.reasons.length).toBe(2);
            expect(result.reasons).toContain("🔄 Default hybrid approach recommended");
            expect(result.reasons).toContain("⚡ Balanced performance and decentralization");

            console.log('Null input recommendation:', result);
        });

        test('should recommend hybrid for fintech marketplace', () => {
            const parsedIdea = {
                title: "DeFi Marketplace",
                description: "User-friendly trading platform with fast transactions and low fees",
                keywords: ["fintech", "marketplace", "trading", "user", "fast", "cost"]
            };

            const result = recommendHybrid(parsedIdea);

            expect(result.model).toBe("hybrid");
            expect(result.reasons).toBeDefined();
            
            // Should mention relevant aspects
            const mentionsPerformance = result.reasons.some(reason => 
                reason.includes("⚡") || reason.toLowerCase().includes('fast')
            );
            const mentionsUser = result.reasons.some(reason => 
                reason.includes("👥") || reason.toLowerCase().includes('user')
            );
            const mentionsCost = result.reasons.some(reason => 
                reason.includes("💰") || reason.toLowerCase().includes('cost')
            );

            expect(mentionsPerformance || mentionsUser || mentionsCost).toBe(true);

            console.log('Fintech marketplace recommendation:', result);
        });
    });
});

describe('Full On-Chain Recommendation Logic', () => {
    describe('recommendFullOnChain', () => {
        test('should recommend full on-chain for DAO with latency warning', () => {
            const parsedIdea = {
                title: "Community DAO",
                description: "Decentralized governance platform for community voting and treasury management",
                keywords: ["dao", "governance", "voting", "decentralized", "treasury"]
            };

            const result = recommendFullOnChain(parsedIdea);

            expect(result.model).toBe("full-on-chain");
            expect(result.reasons).toBeDefined();
            expect(result.reasons.length).toBeGreaterThan(0);
            expect(result.reasons.length).toBeLessThanOrEqual(3);

            // Should include latency warning for DAO
            const hasLatencyWarning = result.reasons.some(reason => 
                reason.includes("latency") && reason.includes("⚠️")
            );
            expect(hasLatencyWarning).toBe(true);

            // Should mention governance/DAO aspects
            const mentionsGovernance = result.reasons.some(reason => 
                reason.toLowerCase().includes('governance') || 
                reason.toLowerCase().includes('dao') ||
                reason.includes("🗳️")
            );
            expect(mentionsGovernance).toBe(true);

            console.log('DAO recommendation:', result);
        });

        test('should handle edge case with no keywords', () => {
            const parsedIdea = {
                title: "",
                description: "",
                keywords: []
            };

            const result = recommendFullOnChain(parsedIdea);

            expect(result.model).toBe("full-on-chain");
            expect(result.reasons).toBeDefined();
            expect(result.reasons.length).toBe(3); // Default reasons

            // Should provide default reasons with latency warning
            expect(result.reasons).toContain("⛓️ Full on-chain provides maximum decentralization");
            expect(result.reasons).toContain("🛡️ Complete transparency and immutability");
            expect(result.reasons).toContain("⚠️ Consider potential latency implications");

            console.log('No keywords on-chain recommendation:', result);
        });

        test('should handle null/undefined input gracefully', () => {
            const result = recommendFullOnChain(null);

            expect(result.model).toBe("full-on-chain");
            expect(result.reasons).toBeDefined();
            expect(result.reasons.length).toBe(3);
            expect(result.reasons).toContain("⛓️ Full decentralization by default");
            expect(result.reasons).toContain("🛡️ Maximum security and transparency");
            expect(result.reasons).toContain("⚠️ Consider potential latency implications");

            console.log('Null input on-chain recommendation:', result);
        });

        test('should recommend full on-chain for DeFi protocol', () => {
            const parsedIdea = {
                title: "Liquidity Protocol",
                description: "DeFi protocol for decentralized liquidity provision with transparent audit trails",
                keywords: ["defi", "protocol", "liquidity", "decentralized", "transparent", "audit"]
            };

            const result = recommendFullOnChain(parsedIdea);

            expect(result.model).toBe("full-on-chain");
            expect(result.reasons).toBeDefined();

            // Should mention DeFi/protocol aspects
            const mentionsDefi = result.reasons.some(reason => 
                reason.toLowerCase().includes('defi') || 
                reason.toLowerCase().includes('protocol') ||
                reason.includes("💎")
            );
            
            const mentionsSecurity = result.reasons.some(reason => 
                reason.toLowerCase().includes('security') || 
                reason.toLowerCase().includes('transparent') ||
                reason.includes("🛡️")
            );

            expect(mentionsDefi || mentionsSecurity).toBe(true);

            console.log('DeFi protocol recommendation:', result);
        });

        test('should recommend full on-chain for NFT project', () => {
            const parsedIdea = {
                title: "Digital Art Collectibles",
                description: "NFT marketplace for unique digital ownership and collectible trading",
                keywords: ["nft", "collectible", "ownership", "digital", "art"]
            };

            const result = recommendFullOnChain(parsedIdea);

            expect(result.model).toBe("full-on-chain");
            expect(result.reasons).toBeDefined();

            // Should mention ownership/NFT aspects
            const mentionsOwnership = result.reasons.some(reason => 
                reason.toLowerCase().includes('ownership') || 
                reason.toLowerCase().includes('nft') ||
                reason.includes("🎨")
            );
            expect(mentionsOwnership).toBe(true);

            // Should have latency warning (but not DAO-specific)
            const hasGenericLatencyWarning = result.reasons.some(reason => 
                reason.includes("latency") && !reason.includes("DAO")
            );
            expect(hasGenericLatencyWarning).toBe(true);

            console.log('NFT project recommendation:', result);
        });
    });
});

describe('Recommendation Output Format', () => {
    test('both functions should return consistent structure', () => {
        const sampleIdea = {
            title: "Sample App",
            description: "A sample blockchain application",
            keywords: ["blockchain", "app"]
        };

        const hybridResult = recommendHybrid(sampleIdea);
        const onChainResult = recommendFullOnChain(sampleIdea);

        // Both should have model and reasons properties
        expect(hybridResult).toHaveProperty('model');
        expect(hybridResult).toHaveProperty('reasons');
        expect(onChainResult).toHaveProperty('model');
        expect(onChainResult).toHaveProperty('reasons');

        // Reasons should be arrays
        expect(Array.isArray(hybridResult.reasons)).toBe(true);
        expect(Array.isArray(onChainResult.reasons)).toBe(true);

        // Should have visual-friendly content (emojis)
        const hybridHasEmojis = hybridResult.reasons.some(reason => 
            /[\u{1F000}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u.test(reason)
        );
        const onChainHasEmojis = onChainResult.reasons.some(reason => 
            /[\u{1F000}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u.test(reason)
        );

        expect(hybridHasEmojis).toBe(true);
        expect(onChainHasEmojis).toBe(true);

        console.log('Output format validation passed');
    });
});