# Kid-Friendly Tailwind CSS Theme Guide

This document outlines the Tailwind CSS configuration for the speech improvement application, which has been optimized for children aged 8-13 years.

## Color Palette

We've implemented a bright, engaging color scheme that appeals to children while maintaining good accessibility and readability:

### Primary Colors
- **Primary Blue** (`--primary: 221 83% 53%`): A vibrant blue that serves as the main brand color
- **Secondary Green** (`--secondary: 152 76% 44%`): A bright, engaging green for secondary actions
- **Accent Pink** (`--accent: 342 83% 58%`): A playful pink for highlighting and accents

### Speech-Specific Colors
- **Highlight Yellow** (`#FFD166`): For highlighting the current word during speech exercises
- **Correct Green** (`#06D6A0`): Indicates correctly pronounced words
- **Needs-Work Pink** (`#EF476F`): Indicates words that need improvement
- **Neutral Blue** (`#118AB2`): For general speech elements and indicators
- **Indicator Dark Blue** (`#073B4C`): For progress indicators and important elements

### Background & Text
- Light, soothing background (`--background: 210 40% 98%`) with dark, readable text
- Slightly rounded corners (`--radius: 0.8rem`) throughout the interface for a friendlier feel

## Kid-Friendly Animations

We've added several animations specifically designed to engage children:

| Animation Class | Purpose | Effect |
|----------------|---------|--------|
| `animate-bounce-gentle` | For avatars and interactive elements | Gentle up-and-down bouncing |
| `animate-pulse-soft` | For buttons and attention-grabbing elements | Subtle pulsing effect |
| `animate-wiggle` | For celebrations and feedback | Playful side-to-side wiggling |
| `animate-speaking` | For voice recording indicators | Pulsing circle that expands and contracts |
| `animate-word-highlight` | For highlighting current word | Fading highlight effect |

## Speech Practice Components

The theme includes specialized components for speech practice:

### Text Formatting
- Word highlighting with `.word-highlight`, `.word-correct`, `.word-incorrect`, and `.word-current`
- Dyslexia-friendly text formatting with `.dyslexia-friendly` and the OpenDyslexic font

### Progress Elements
- Speech pacing bar with `.speech-pacing-bar` and `.speech-pacing-progress`
- Progress indicators with `.speech-progress-bar` and `.speech-progress-value`

### Feedback Components
- Feedback containers with `.speech-feedback`, `.speech-feedback.correct`, and `.speech-feedback.needs-work`

## Usage Examples

### Basic Speech Container
```jsx
<div className="speech-container">
  <h2 className="speech-title">Repeat After Me</h2>
  <p className="speech-instruction">Listen to the phrase and try to repeat it</p>
  
  <div className="speech-text">
    <span className="word-highlight word-correct">The</span>
    <span className="word-highlight word-current">quick</span>
    <span className="word-highlight">brown</span>
    <span className="word-highlight">fox</span>
  </div>
  
  <div className="speech-pacing-bar">
    <div className="speech-pacing-progress" style={{ width: '50%' }}></div>
  </div>
  
  <button className="speech-button playing">
    <span>Playing...</span>
  </button>
</div>
```

### Dyslexia-Friendly Mode
```jsx
<div className="speech-container">
  <div className="flex justify-end mb-2">
    <button className="text-xs text-muted-foreground">
      Enable dyslexia-friendly mode
    </button>
  </div>
  
  <div className="speech-text dyslexia-friendly">
    <span className="word-highlight">Practice</span>
    <span className="word-highlight">your</span>
    <span className="word-highlight">speech</span>
  </div>
</div>
```

## Accessibility Considerations

The theme has been designed with accessibility in mind:

- **Color Contrast**: All color combinations meet WCAG AA standards for text readability
- **Animation Control**: All animations can be disabled for users with vestibular disorders
- **Font Options**: Includes OpenDyslexic font option for users with dyslexia
- **Focus States**: Clear focus indicators for keyboard navigation

## Dark Mode Support

The theme includes a kid-friendly dark mode that maintains vibrant colors while reducing eye strain in low-light environments.

To toggle dark mode, use the `dark` class on the HTML element or use the Next.js theme provider. 