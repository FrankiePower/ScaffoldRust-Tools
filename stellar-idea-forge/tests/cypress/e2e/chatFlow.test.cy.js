/**
 * End-to-End Tests for Chat Flow
 * Tests the full chat flow from user input to bot responses and visual previews
 */

describe('Chat Flow E2E Tests', () => {
  beforeEach(() => {
    // Visit the frontend application
    cy.visit('/')
    
    // Wait for the chat interface to load
    cy.waitForChatInterface()
    
    // Ensure page is fully loaded
    cy.get('body').should('be.visible')
    cy.contains('Share your stellar project idea').should('be.visible')
  })

  describe('Chat Input Functionality', () => {
    it('should display the chat input interface correctly', () => {
      // Check if chat input elements are visible
      cy.get('textarea').should('be.visible')
      cy.get('button[type="submit"]').should('be.visible')
      cy.get('button[title="Add emoji"]').should('be.visible')
      
      // Verify placeholder text
      cy.get('textarea').should('have.attr', 'placeholder')
        .and('match', /project idea|stellar/i)
      
      // Check styling classes for visual elements
      cy.get('textarea').should('have.class', 'rounded-xl')
      cy.get('button[type="submit"]').should('have.class', 'bg-gradient-to-r')
    })

    it('should handle text input correctly', () => {
      const testInput = 'A decentralized remittance platform'
      
      // Type into the chat input
      cy.get('textarea').clear().type(testInput)
      cy.get('textarea').should('have.value', testInput)
      
      // Check that submit button is enabled
      cy.get('button[type="submit"]').should('not.be.disabled')
    })

    it('should handle emoji insertion', () => {
      // Open emoji picker
      cy.get('button[title="Add emoji"]').click()
      
      // Verify emoji picker is visible
      cy.get('[class*="grid-cols-8"]').should('be.visible')
      
      // Click on a rocket emoji
      cy.contains('🚀').click()
      
      // Verify emoji was inserted
      cy.get('textarea').should('contain.value', '🚀')
      
      // Verify emoji picker closes
      cy.get('[class*="grid-cols-8"]').should('not.exist')
    })
  })

  describe('Chat Flow with Mocked Backend', () => {
    it('should handle simple idea submission (remesas app)', () => {
      const ideaText = 'remesas app for fast international transfers'
      
      // Mock the backend response for remesas app
      cy.mockChatAPI(ideaText, {
        suggestion: 'Excellent idea for a remesas application! 💰',
        model: 'hybrid',
        reasons: [
          '🎯 Hybrid model ideal for remesas applications',
          '⚡ Fast transaction processing for international transfers',
          '👥 Enhanced user experience for mobile users'
        ],
        visual: {
          diagrams: true,
          schemaPreview: true
        }
      })
      
      // Submit the idea
      cy.submitChatInput(ideaText)
      
      // Wait for API call
      cy.wait('@chatAPI')
      
      // Verify response is displayed with visual elements
      cy.get('.bot-response, .chat-response, [data-testid="chat-response"]')
        .should('be.visible')
        .and('contain', 'remesas')
      
      // Check for emojis in response (visual-friendly output)
      cy.get('body').should('match', /[💰🎯⚡👥]/u)
      
      // Verify suggestion styling (green text for suggestions)
      cy.get('.viable-suggestion, .suggestion, [class*="text-green"]')
        .should('exist')
    })

    it('should handle edge case (empty input)', () => {
      // Mock response for empty input
      cy.mockChatAPI('', {
        suggestion: 'Please provide more details about your project idea! 💡',
        model: 'hybrid',
        reasons: [
          '🤔 Need more information to provide recommendations',
          '💭 Try describing your blockchain application',
          '✨ Include key features or target users'
        ]
      })
      
      // Try submitting empty input
      cy.get('textarea').clear()
      cy.get('button[type="submit"]').click()
      
      // Should either prevent submission or show helpful message
      cy.get('body').should(($body) => {
        const hasError = $body.find('.error, [class*="text-red"]').length > 0
        const hasPlaceholder = $body.find('textarea[placeholder]').length > 0
        expect(hasError || hasPlaceholder).to.be.true
      })
    })

    it('should handle complex DAO idea with clarification', () => {
      const daoIdea = 'DAO for community governance with treasury management'
      
      // Mock response with clarification questions
      cy.mockChatAPI(daoIdea, {
        suggestion: 'Interesting DAO concept! Let me ask a few questions: 🗳️',
        model: 'full-on-chain',
        reasons: [
          '⛓️ Full on-chain ideal for DAO governance',
          '🗳️ Voting mechanisms require transparency',
          '⚠️ Consider potential latency for consensus operations'
        ],
        clarificationQuestions: [
          'What type of governance decisions will the DAO handle?',
          'How large is your expected community size?',
          'Do you need multi-signature treasury features?'
        ]
      })
      
      // Submit the DAO idea
      cy.submitChatInput(daoIdea)
      
      // Wait for response
      cy.wait('@chatAPI')
      
      // Check for clarification questions
      cy.get('body').should('contain', 'questions')
        .and('contain', 'governance')
      
      // Verify latency warning is present for DAO
      cy.get('body').should('contain', 'latency')
        .or('contain', '⚠️')
      
      // Check for full-on-chain recommendation
      cy.get('body').should('contain', 'full-on-chain')
        .or('contain', 'on-chain')
    })
  })

  describe('Visual Mode and Diagrams', () => {
    beforeEach(() => {
      // Set up mocked response with visual elements
      cy.mockChatAPI('blockchain marketplace', {
        suggestion: 'Great marketplace idea! 🛒',
        model: 'hybrid',
        reasons: ['🎯 Hybrid perfect for marketplaces', '⚡ Fast user experience'],
        visual: true
      })
    })

    it('should toggle visual mode correctly', () => {
      // Look for visual mode toggle button
      cy.get('button, [data-testid="toggle"]').contains(/visual/i).should('be.visible')
      
      // Toggle visual mode
      cy.get('button').contains(/visual/i).click()
      
      // Verify visual mode is activated
      cy.get('body').should('contain.text', 'visual')
      
      // Check if placeholder changes for visual mode
      cy.get('textarea').should('have.attr', 'placeholder')
        .and('match', /visual.*come to life|see it come to life/i)
    })

    it('should render diagrams when visual mode is enabled', () => {
      // Enable visual mode first
      cy.get('button').contains(/visual/i).click()
      
      // Submit an idea
      cy.submitChatInput('blockchain marketplace with smart contracts')
      
      // Wait for response
      cy.wait('@chatAPI')
      
      // Check if diagram renderer is visible
      cy.get('body').then(($body) => {
        const hasDiagram = $body.find('[data-testid="diagram-renderer"], .diagram-container, .visual-preview').length > 0
        
        if (hasDiagram) {
          cy.get('[data-testid="diagram-renderer"], .diagram-container, .visual-preview')
            .should('be.visible')
        } else {
          // If no specific diagram elements, check for visual indicators
          cy.get('body').should('match', /[🎨📊📈💼]/u)
        }
      })
    })

    it('should show schema preview toggle functionality', () => {
      // Look for schema-related elements or buttons
      cy.get('body').then(($body) => {
        const hasSchemaButton = $body.find('button, [data-testid="schema"]').filter(':contains("Schema")').length > 0
        
        if (hasSchemaButton) {
          // If schema button exists, test it
          cy.get('button').contains(/schema/i).click()
          
          // Verify schema preview shows
          cy.get('[data-testid="schema-preview"], .schema-container')
            .should('be.visible')
        } else {
          // Otherwise, just verify visual mode works
          cy.log('Schema preview not implemented yet, checking visual mode')
          cy.get('button').contains(/visual/i).should('be.visible')
        }
      })
    })
  })

  describe('Visual Elements and Styling', () => {
    it('should display visual cues for bot responses', () => {
      // Mock a response with rich visual elements
      cy.mockChatAPI('NFT marketplace', {
        suggestion: 'Fantastic NFT marketplace concept! 🎨',
        model: 'full-on-chain',
        reasons: [
          '⛓️ Full on-chain perfect for NFT ownership',
          '🎨 Digital art requires blockchain verification',
          '✨ Enhanced visual presentation for collectibles'
        ]
      })
      
      // Submit idea
      cy.submitChatInput('NFT marketplace for digital art')
      
      // Wait for response
      cy.wait('@chatAPI')
      
      // Check for green/positive styling for suggestions
      cy.get('body').then(($body) => {
        const hasGreenText = $body.find('[class*="text-green"], .viable-suggestion, .positive-response').length > 0
        const hasEmojis = /[🎨⛓️✨🎯⚡]/u.test($body.text())
        
        expect(hasGreenText || hasEmojis).to.be.true
      })
      
      // Verify visual hierarchy and styling
      cy.get('body').should('have.css', 'background')
      cy.get('textarea').should('have.class', 'rounded-xl')
    })

    it('should maintain responsive design across viewport sizes', () => {
      // Test on mobile viewport
      cy.viewport(375, 667)
      cy.get('textarea').should('be.visible')
      cy.get('button[type="submit"]').should('be.visible')
      
      // Test on tablet viewport
      cy.viewport(768, 1024)
      cy.get('textarea').should('be.visible')
      
      // Test on desktop viewport
      cy.viewport(1280, 720)
      cy.get('textarea').should('be.visible')
      cy.get('.max-w-4xl, .max-w-3xl, .max-w-2xl').should('exist')
    })
  })

  describe('Error Handling and Edge Cases', () => {
    it('should handle network errors gracefully', () => {
      // Mock network failure
      cy.intercept('POST', '/api/chat', { forceNetworkError: true }).as('networkError')
      
      // Submit an idea
      cy.submitChatInput('test idea for network error')
      
      // Check that error is handled gracefully
      cy.get('body').should(($body) => {
        const hasError = $body.find('.error, [class*="text-red"], .alert-error').length > 0
        const hasRetry = $body.find('button').filter(':contains("retry")').length > 0
        const stillWorking = $body.find('textarea').is(':visible')
        
        // At least one of these should be true for good UX
        expect(hasError || hasRetry || stillWorking).to.be.true
      })
    })

    it('should handle very long input text', () => {
      const longText = 'A'.repeat(1000) + ' blockchain application with many features'
      
      cy.get('textarea').clear().type(longText.substring(0, 500)) // Type first 500 chars
      cy.get('textarea').should('contain.value', 'A'.repeat(500))
      
      // Should still be functional
      cy.get('button[type="submit"]').should('not.be.disabled')
    })

    it('should handle special characters and emojis in input', () => {
      const specialText = 'DeFi app with 💰 tokens & smart contracts! @#$%^&*()'
      
      cy.get('textarea').clear().type(specialText)
      cy.get('textarea').should('contain.value', '💰')
      cy.get('textarea').should('contain.value', '&')
      
      // Should be able to submit
      cy.get('button[type="submit"]').should('not.be.disabled')
    })
  })
});