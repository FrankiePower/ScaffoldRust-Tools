# Cypress E2E Tests for Stellar Idea Forge

This directory contains End-to-End (E2E) tests for the chat flow functionality of Stellar Idea Forge.

## Test Structure

- `e2e/` - Contains E2E test specifications
- `support/` - Contains custom commands and support files
- `fixtures/` - Contains test data and mock responses

## Running Tests

### Prerequisites

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the frontend application:
   ```bash
   cd apps/frontend && npm start
   ```

3. Start the backend application (if available):
   ```bash
   cd apps/backend && npm run dev
   ```

### Test Commands

```bash
# Run tests in headless mode
npm run test:e2e

# Run tests in interactive mode
npm run test:e2e:open

# Run specific browser
npx cypress run --browser chrome
```

## Test Coverage

The E2E tests cover:

- ✅ Chat input functionality
- ✅ Visual mode toggle
- ✅ Emoji insertion
- ✅ Bot response rendering with visual cues
- ✅ Diagram/schema preview functionality
- ✅ Edge cases (empty input, long text, special characters)
- ✅ Error handling
- ✅ Responsive design
- ✅ Visual elements (emojis, styling, colors)

## Mock API Responses

Tests use `cy.intercept()` to mock backend responses for:
- Simple ideas (remesas app)
- Complex ideas (DAO governance)
- Edge cases (empty input)
- Visual previews (NFT marketplace)

## Custom Commands

- `cy.waitForChatInterface()` - Wait for chat UI to load
- `cy.submitChatInput(text)` - Submit text to chat
- `cy.mockChatAPI(idea, response)` - Mock backend API responses
- `cy.verifyVisualResponse()` - Check for visual elements in responses
- `cy.verifyVisualPreview()` - Check for diagram/schema previews

## Configuration

Tests are configured to:
- Run against `http://localhost:3000`
- Take screenshots on failure
- Record videos of test runs
- Support viewport testing for responsive design