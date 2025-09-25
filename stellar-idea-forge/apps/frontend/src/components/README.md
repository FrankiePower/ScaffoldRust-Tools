# ChatInput Component 💬

A modern, responsive React component for chat input functionality with emoji support and clean visual design.

## Features ✨

- **Multi-line text support** - Expandable textarea with configurable height limits
- **Emoji support** - Full Unicode emoji support for expressive messaging
- **Keyboard shortcuts** - Ctrl+Enter (or Cmd+Enter) for quick submission
- **Modern styling** - Built with Tailwind CSS for responsive, beautiful design
- **Accessibility** - Proper focus states, keyboard navigation, and screen reader support
- **Customizable** - Configurable placeholder text and event handlers

## Usage 🚀

```jsx
import ChatInput from './components/ChatInput';

function App() {
  const handleInputChange = (e) => {
    console.log('Input changed:', e.target.value);
  };

  const handleInputSubmit = (e) => {
    const inputValue = e.target.querySelector('textarea').value;
    console.log('Input submitted:', inputValue);
    // Clear input after submission
    e.target.querySelector('textarea').value = '';
  };

  return (
    <ChatInput
      onChange={handleInputChange}
      onSubmit={handleInputSubmit}
      placeholder="Type your message here... 💬"
    />
  );
}
```

## Props 📋

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `onChange` | `function` | `undefined` | Callback fired when input value changes |
| `onSubmit` | `function` | `undefined` | Callback fired when form is submitted |
| `placeholder` | `string` | `"Type your project idea here... 💡"` | Placeholder text for the input field |

## Styling 🎨

The component uses Tailwind CSS classes for styling and includes:

- **Responsive design** - Adapts to different screen sizes
- **Focus states** - Beautiful focus rings and border colors
- **Hover effects** - Interactive button and input states
- **Gradient backgrounds** - Modern gradient button styling
- **Animations** - Smooth transitions and micro-interactions

## Keyboard Shortcuts ⌨️

- **Ctrl+Enter** (Windows/Linux) or **Cmd+Enter** (Mac) - Submit the form
- **Tab** - Navigate to submit button
- **Shift+Tab** - Navigate back to textarea

## Browser Support 🌐

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Dependencies 📦

- React 18+
- Tailwind CSS 3+

## Development Notes 🔧

- Component is stateless by design for flexibility
- Console logging included for development/testing
- Emoji support works out of the box with modern browsers
- Textarea auto-resizes vertically within defined limits
