/**
 * OpenZeppelin Detector Module
 * Detects smart-contract-related keywords and suggests OpenZeppelin Wizard presets
 */

/**
 * Detects contract-related intent and returns OpenZeppelin Wizard suggestion
 * Implements minimal required logic per issue:
 * - Detect keywords: token | contract | DAO | voting
 * - Simple scoring: if >1 match, suggest; else { suggest: false }
 * - Return JSON with suggest, type, wizardLink, previewData.flows, and non-technical reasons
 */
function detectAndSuggest(parsedIdea) {
  if (!parsedIdea) {
    return { suggest: false };
  }

  const { title = "", description = "", originalText = "", keywords = [] } = parsedIdea;
  const allText = `${title} ${description} ${originalText}`.toLowerCase();
  const lowerKeywords = Array.isArray(keywords) ? keywords.map(k => String(k).toLowerCase()) : [];

  const test = (re) => re.test(allText) || lowerKeywords.some(k => re.test(k));

  const reToken = /\btoken(s)?\b/i;
  const reDAO = /\bdao\b/i;
  const reVoting = /\bvot(e|ing)\b/i;
  const reContract = /(smart\s*contract|\bcontract\b)/i;

  const tokenHit = test(reToken);
  const daoHit = test(reDAO);
  const votingHit = test(reVoting);
  const contractHit = test(reContract);

  const hitCount = [tokenHit, daoHit, votingHit, contractHit].filter(Boolean).length;

  if (hitCount <= 1) {
    return { suggest: false };
  }

  // Determine type and link based on first applicable category in priority order
  let type = "Contract";
  let wizardLink = "https://wizard.openzeppelin.com/stellar?template=contract";
  let flows = ["Deploy", "Interact"];

  if (tokenHit) {
    type = "Token";
    wizardLink = "https://wizard.openzeppelin.com/stellar?template=erc20";
    flows = ["Mint", "Transfer"];
  } else if (daoHit || votingHit) {
    type = "DAO";
    wizardLink = "https://wizard.openzeppelin.com/stellar?template=governor";
    flows = ["Propose", "Vote"];
  }

  const reasons = ["Para contratos seguros como un kit blindado 🔒"];

  return {
    suggest: true,
    type,
    wizardLink,
    previewData: { flows },
    reasons
  };
}

module.exports = { detectAndSuggest };
-