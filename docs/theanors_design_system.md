# TheAnors - Design System & UI Specification

**Version:** 1.0  
**Date:** August 9, 2026  
**Platform:** Web + Mobile (Mobile-first)

---

## 1. Design Principles

1. **Simplicity:** Remove all noise. One action per screen.
2. **Clarity:** Use clear hierarchy. User always knows what to do next.
3. **Compact:** Tight spacing. Mobile screens are real estate.
4. **Accessible:** High contrast. Crimson red accent on black/white for visibility.
5. **Professional:** No playful gradients. Serious tool for serious work.

---

## 2. Color Palette

**Primary Colors:**

```
Primary Black:    #000000
Primary White:    #FFFFFF
Accent Red:       #DC143C (Crimson)
```

**Secondary Colors:**

```
Light Gray:       #F5F5F5 (for backgrounds)
Medium Gray:      #E0E0E0 (for borders)
Dark Gray:        #333333 (for secondary text)
Red Light:        #E63946 (hover state for red)
```

**Usage:**
- **Black (#000000):** Text, headers, strong emphasis
- **White (#FFFFFF):** Page background, card backgrounds
- **Crimson (#DC143C):** Call-to-action buttons, active states, highlights, alerts
- **Light Gray (#F5F5F5):** Secondary backgrounds, inactive states
- **Medium Gray (#E0E0E0):** Borders, dividers, disabled states
- **Dark Gray (#333333):** Secondary text, captions, metadata

**Accessibility:**
- Crimson on white: Contrast ratio 5.5:1 ✓ (WCAG AA compliant)
- Black on white: Contrast ratio 21:1 ✓ (WCAG AAA compliant)
- Never use red alone to convey information (always pair with text/icon)

---

## 3. Typography

**Font Family:** Arial (system default, no web fonts to reduce load)

```css
font-family: Arial, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
```

**Font Sizes & Weights:**

```
Display 1 (Page Title):       28px, Bold (weight: 700)
Display 2 (Section Title):    20px, Bold (weight: 700)
Heading 1:                    16px, Bold (weight: 700)
Heading 2:                    14px, Bold (weight: 700)
Body Large:                   14px, Regular (weight: 400)
Body:                         13px, Regular (weight: 400)
Body Small:                   12px, Regular (weight: 400)
Caption:                      11px, Regular (weight: 400)
Button:                       13px, Bold (weight: 700)
Input:                        13px, Regular (weight: 400)
```

**Line Heights:**

```
Display:  1.2 (tight)
Heading:  1.3 (compact)
Body:     1.5 (readable)
Caption:  1.4 (readable)
```

**Letter Spacing:**

```
Display:  -0.02em (tight)
Heading:  0em (normal)
Body:     0em (normal)
Caption:  0.02em (slightly loose)
```

**Hierarchy Example:**

```
Page Title (28px bold)
  Section Title (20px bold)
    Heading (16px bold)
      Body text (14px regular)
        Caption (11px regular)
```

---

## 4. Spacing System

**Base Unit:** 4px

**Scale:**

```
XS:     4px   (1 unit)
SM:     8px   (2 units)
MD:    12px   (3 units)
LG:    16px   (4 units)
XL:    24px   (6 units)
2XL:   32px   (8 units)
3XL:   48px   (12 units)
```

**Compact Theme (Tight spacing for TheAnors):**

```
Padding:
  Components:       SM (8px)
  Cards:            MD (12px)
  Page margin:      LG (16px) on mobile, XL (24px) on desktop
  
Margins:
  Between sections: MD (12px)
  Between items:    SM (8px)
  Between text:     XS (4px)

Gap (flex/grid):    SM (8px)
```

**Example HTML with tight spacing:**

```html
<div class="page-padding">       <!-- 16px on mobile, 24px on desktop -->
  <h1>Dashboard</h1>             <!-- 28px font, 0 margin-bottom initially -->
  <p style="margin-top: 8px;">...</p>
  
  <div class="card">              <!-- 12px padding -->
    <h2>Section</h2>              <!-- 20px font -->
    <div class="card-content" style="margin-top: 12px;">
      <div class="item">...</div>  <!-- 8px gap between items -->
    </div>
  </div>
</div>
```

---

## 5. Components

### 5.1 Buttons

**Primary Button (Call-to-Action):**

```
Background:     Crimson (#DC143C)
Text:           White (#FFFFFF)
Font:           13px Bold
Padding:        8px 16px (SM top/bottom, LG left/right)
Border:         None
Border Radius:  2px (minimal)
Cursor:         pointer
Hover:          Background #E63946 (Red Light)
Active:         Background #B81228 (darker red)
Disabled:       Background #E0E0E0 (gray), cursor not-allowed
```

**Secondary Button:**

```
Background:     White (#FFFFFF)
Text:           Black (#000000)
Font:           13px Bold
Padding:        8px 16px
Border:         1px solid Medium Gray (#E0E0E0)
Border Radius:  2px
Hover:          Background Light Gray (#F5F5F5)
Active:         Background #E0E0E0
```

**Tertiary Button (Link-style):**

```
Background:     Transparent
Text:           Crimson (#DC143C)
Font:           13px Bold
Padding:        0
Border:         None
Hover:          Text-decoration: underline
```

**State Indicators on Buttons:**

```
Submitted ✓:    Text changes to "Done" or shows checkmark icon
Loading:        Shows spinner icon to right of text
Error:          Background becomes red, text becomes white, shows error icon
```

---

### 5.2 Input Fields

**Text Input / Textarea:**

```
Background:     White (#FFFFFF)
Text:           Black (#000000)
Font:           13px Regular
Border:         1px solid Medium Gray (#E0E0E0)
Border Radius:  2px
Padding:        8px 12px (SM vertical, MD horizontal)
Placeholder:    Dark Gray (#333333) at 60% opacity

Focus:          Border-color Crimson (#DC143C), outline none
Focus-ring:     2px crimson outset (accessibility)

Disabled:       Background Light Gray (#F5F5F5), cursor not-allowed
Error:          Border-color red, show error icon to right
```

**Label:**

```
Font:           13px Bold
Color:          Black (#000000)
Margin-bottom:  8px
```

**Help Text / Error Text:**

```
Font:           11px Regular
Color:          Dark Gray (#333333) for help, Crimson for error
Margin-top:     4px
```

---

### 5.3 Cards / Panels

**Card:**

```
Background:     White (#FFFFFF)
Border:         1px solid Medium Gray (#E0E0E0)
Border Radius:  2px
Padding:        12px (MD)
Box Shadow:     None (or minimal: 0 1px 3px rgba(0,0,0,0.1))
Margin-bottom:  12px (between cards)
```

**Card Header:**

```
Font:           16px Bold
Color:          Black (#000000)
Padding-bottom: 8px
Border-bottom:  1px solid Medium Gray (#E0E0E0)
Margin-bottom:  12px
```

**Card Body:**

```
Font:           13px Regular
Color:          Black (#000000)
Line-height:    1.5
```

---

### 5.4 Progress Bar

**Engagement Progress (e.g., 8/30 posts done):**

```
Container:      Full width, height 6px
Background:     Light Gray (#F5F5F5)
Filled:         Crimson (#DC143C)
Border:         1px solid Medium Gray (#E0E0E0)
Border Radius:  1px

Label Above:    "8 of 30 posts completed" (12px regular, dark gray)
```

**CSS:**

```css
.progress-bar {
  background-color: #F5F5F5;
  border: 1px solid #E0E0E0;
  height: 6px;
  border-radius: 1px;
  overflow: hidden;
}

.progress-fill {
  background-color: #DC143C;
  height: 100%;
  transition: width 0.3s ease;
}
```

---

### 5.5 Tabs / Navigation

**Tab Navigation:**

```
Background:     White (#FFFFFF)
Border-bottom:  1px solid Medium Gray (#E0E0E0)
Padding:        0

Tab Item:
  Padding:      12px 16px (MD vertical, LG horizontal)
  Font:         13px Bold
  Color:        Dark Gray (#333333)
  Border:       None
  Hover:        Background Light Gray (#F5F5F5)
  
Active Tab:
  Color:        Black (#000000)
  Border-bottom: 2px solid Crimson (#DC143C)
```

---

### 5.6 Modal / Dialog

**Overlay:**

```
Background:     Black (#000000) at 50% opacity
```

**Modal Box:**

```
Background:     White (#FFFFFF)
Border:         1px solid Medium Gray (#E0E0E0)
Border Radius:  2px
Padding:        20px (XL)
Box Shadow:     0 4px 12px rgba(0,0,0,0.15)
Max-width:      600px
Width:          90% on mobile
```

**Modal Header:**

```
Font:           20px Bold
Color:          Black (#000000)
Margin-bottom:  12px
```

**Modal Body:**

```
Font:           13px Regular
Margin-bottom:  16px (LG)
```

**Modal Footer:**

```
Padding-top:    16px (LG)
Border-top:     1px solid Medium Gray (#E0E0E0)
Text-align:     Right
Button gap:     8px (SM)
```

---

## 6. Layout

### 6.1 Mobile Layout (380px - 480px)

**Header:**

```
Height:         56px
Padding:        12px 16px
Display:        Flex, space-between, center-aligned
Background:     White (#FFFFFF)
Border-bottom:  1px solid Medium Gray (#E0E0E0)
```

**Content Area:**

```
Padding:        16px (LG)
Max-width:      100%
```

**Bottom Navigation (if used):**

```
Height:         56px
Padding:        8px 16px
Display:        Flex, space-around
Background:     White (#FFFFFF)
Border-top:     1px solid Medium Gray (#E0E0E0)
```

**Example Mobile Screen:**

```
┌─────────────────────┐
│ [Menu]   Dashboard  │  56px header
├─────────────────────┤
│                     │
│ [Card Content]      │  16px padding
│ Title               │
│ 12px spacing        │
│ [Button]            │
│                     │
│ [Card 2]            │
│                     │
├─────────────────────┤
│ [Tab1] [Tab2] [Tab3]│  Bottom nav
└─────────────────────┘
```

### 6.2 Desktop Layout (1024px+)

**Sidebar Navigation (optional):**

```
Width:          200px
Background:     Light Gray (#F5F5F5)
Padding:        16px (LG)
Items:          13px regular, 8px gap
```

**Main Content:**

```
Margin-left:    200px (if sidebar)
Padding:        24px (XL)
Max-width:      1200px
```

**Two-Column Layout (for comparison):**

```
Left Column:    50% width
Right Column:   50% width
Gutter:         16px (LG)
```

---

## 7. Color Usage Examples

**Engagement Workflow Screen:**

```
[Header (Black text on White)]
Dashboard

[Card - White background, gray border]
  [Heading (16px Bold Black)]
  Engagement Batch
  
  [Body (13px Regular Black)]
  Status: In Progress
  
  [Progress bar]
  ████████░░░  8 of 30
  
  [Button (Crimson, White text)]
  Generate Comments
```

**Comment Options Display:**

```
[Card]
  Post Content (13px)
  "Great insights on AI..."
  
  [Option 1 Heading (14px Bold Crimson)]
  ✓ Option 1
  "I completely agree..."
  [Button - Copy]
  
  [Option 2 Heading (14px)]
  Option 2
  "This is interesting..."
  [Button - Copy]
  
  [Option 3 Heading (14px)]
  Option 3
  "Thanks for sharing..."
  [Button - Copy]
```

**Navigation:**

```
[Tabs (White bg, gray bottom border)]
Engagement | Captions | Newsletter | Scripting | Comments

[Active tab - Bold Black, Crimson underline]
[Inactive - Dark Gray, Light Gray hover]
```

---

## 8. Responsive Design Breakpoints

```
Mobile:         320px - 480px
Mobile Large:   481px - 768px
Tablet:         769px - 1024px
Desktop:        1025px - 1440px
Desktop Large:  1441px+
```

**Media Queries (Tailwind or CSS):**

```css
/* Mobile-first approach */

/* Default: mobile styles at 380px */

@media (min-width: 481px) {
  /* Mobile Large adjustments */
  body { padding: 20px; }
}

@media (min-width: 769px) {
  /* Tablet adjustments */
  body { padding: 24px; }
  .sidebar { display: block; }
}

@media (min-width: 1025px) {
  /* Desktop adjustments */
  .container { max-width: 1200px; }
}
```

**Tailwind Config Override (for tight spacing):**

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    spacing: {
      xs: '4px',
      sm: '8px',
      md: '12px',
      lg: '16px',
      xl: '24px',
      '2xl': '32px',
      '3xl': '48px',
    },
    fontSize: {
      'display-1': ['28px', { lineHeight: '1.2', fontWeight: '700' }],
      'display-2': ['20px', { lineHeight: '1.3', fontWeight: '700' }],
      'h1': ['16px', { lineHeight: '1.3', fontWeight: '700' }],
      'h2': ['14px', { lineHeight: '1.3', fontWeight: '700' }],
      'base': ['13px', { lineHeight: '1.5', fontWeight: '400' }],
      'sm': ['12px', { lineHeight: '1.4', fontWeight: '400' }],
      'xs': ['11px', { lineHeight: '1.4', fontWeight: '400' }],
    },
    colors: {
      black: '#000000',
      white: '#FFFFFF',
      'crimson': '#DC143C',
      'crimson-dark': '#B81228',
      'crimson-light': '#E63946',
      'gray-light': '#F5F5F5',
      'gray-medium': '#E0E0E0',
      'gray-dark': '#333333',
    },
    borderRadius: {
      'none': '0',
      'sm': '2px',
      'base': '4px',
    }
  }
}
```

---

## 9. Component Library (React Examples)

### 9.1 Button Component

```typescript
// components/Button.tsx
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'tertiary'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  onClick?: () => void
  children: React.ReactNode
}

export function Button({
  variant = 'primary',
  size = 'md',
  disabled = false,
  onClick,
  children
}: ButtonProps) {
  const baseStyles = 'font-bold rounded transition-colors'
  
  const variantStyles = {
    primary: 'bg-crimson text-white hover:bg-crimson-light disabled:bg-gray-medium',
    secondary: 'bg-white text-black border border-gray-medium hover:bg-gray-light',
    tertiary: 'bg-transparent text-crimson hover:underline'
  }
  
  const sizeStyles = {
    sm: 'px-2 py-1 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-base'
  }
  
  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]}`}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  )
}
```

### 9.2 Card Component

```typescript
// components/Card.tsx
interface CardProps {
  title?: string
  children: React.ReactNode
  className?: string
}

export function Card({ title, children, className = '' }: CardProps) {
  return (
    <div className={`bg-white border border-gray-medium rounded-sm p-md mb-md ${className}`}>
      {title && (
        <h2 className="text-h1 font-bold border-b border-gray-medium pb-md mb-md">
          {title}
        </h2>
      )}
      <div className="text-base text-black">
        {children}
      </div>
    </div>
  )
}
```

### 9.3 ProgressBar Component

```typescript
// components/ProgressBar.tsx
interface ProgressBarProps {
  current: number
  total: number
  label?: string
}

export function ProgressBar({ current, total, label }: ProgressBarProps) {
  const percentage = (current / total) * 100
  
  return (
    <div>
      {label && (
        <p className="text-sm text-gray-dark mb-xs">
          {label}
        </p>
      )}
      <div className="w-full h-1.5 bg-gray-light border border-gray-medium rounded-sm overflow-hidden">
        <div
          className="h-full bg-crimson transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}
```

### 9.4 Input Component

```typescript
// components/Input.tsx
interface InputProps {
  label?: string
  error?: string
  placeholder?: string
  value?: string
  onChange?: (value: string) => void
  type?: 'text' | 'email' | 'url' | 'textarea'
  rows?: number
  disabled?: boolean
}

export function Input({
  label,
  error,
  placeholder,
  value,
  onChange,
  type = 'text',
  rows = 4,
  disabled = false
}: InputProps) {
  return (
    <div className="mb-lg">
      {label && (
        <label className="block text-h2 font-bold text-black mb-sm">
          {label}
        </label>
      )}
      {type === 'textarea' ? (
        <textarea
          className={`w-full border rounded-sm p-md text-base focus:outline-none focus:border-crimson focus:ring-2 focus:ring-crimson ${
            error ? 'border-crimson' : 'border-gray-medium'
          } ${disabled ? 'bg-gray-light cursor-not-allowed' : 'bg-white'}`}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          rows={rows}
          disabled={disabled}
        />
      ) : (
        <input
          type={type}
          className={`w-full border rounded-sm p-md text-base focus:outline-none focus:border-crimson focus:ring-2 focus:ring-crimson ${
            error ? 'border-crimson' : 'border-gray-medium'
          } ${disabled ? 'bg-gray-light cursor-not-allowed' : 'bg-white'}`}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          disabled={disabled}
        />
      )}
      {error && (
        <p className="text-xs text-crimson mt-xs">
          {error}
        </p>
      )}
    </div>
  )
}
```

---

## 10. Dark Mode (Future)

**For future implementation, invert colors:**

```
Primary White → Dark Gray (#1F1F1F)
Primary Black → Light Gray (#E8E8E8)
Light Gray → Dark Gray (#2D2D2D)
Crimson stays (#DC143C)
```

**Tailwind dark mode:**

```javascript
// tailwind.config.js
module.exports = {
  darkMode: 'class',
  // ...
}

// Usage in components:
<div className="bg-white dark:bg-gray-900">
  <p className="text-black dark:text-white">...</p>
</div>
```

---

## 11. Accessibility Checklist

- [ ] Color contrast ratios 4.5:1 minimum (WCAG AA)
- [ ] All buttons/links have visible focus state
- [ ] Form labels associated with inputs (htmlFor)
- [ ] Alt text on all images
- [ ] Keyboard navigation (Tab order, Enter to submit)
- [ ] ARIA labels for complex components
- [ ] Error messages linked to form fields
- [ ] Font size minimum 12px
- [ ] Line height minimum 1.4
- [ ] Touch targets minimum 48px (mobile)

---

## 12. Animation & Transitions

**Keep minimal. Defaults:**

```css
/* Hover transitions */
.button, .input {
  transition: all 0.2s ease;
}

/* Focus transitions */
input:focus {
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

/* Loading state */
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.spinner {
  animation: spin 1s linear infinite;
}

/* Fade in (default for new content) */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.fade-in {
  animation: fadeIn 0.3s ease-in-out;
}
```

**No:**
- Bounce animations
- Slide-in animations (on mobile, too slow)
- Multiple simultaneous animations
- Animations longer than 400ms

---

## 13. Implementation Checklist

### Before Coding:

- [ ] Set up Tailwind with custom config (tight spacing, colors, fonts)
- [ ] Create `/components` folder with base components
- [ ] Create `/styles/globals.css` with custom utilities
- [ ] Test color contrast ratios
- [ ] Test mobile layout at 380px width

### During Development:

- [ ] Use semantic HTML (`<button>`, `<label>`, `<form>`)
- [ ] All inputs have associated labels
- [ ] All interactive elements have focus states (visible)
- [ ] Test keyboard navigation (Tab, Enter, Escape)
- [ ] Test at mobile, tablet, desktop breakpoints
- [ ] Test with screen reader (NVDA, JAWS, or VoiceOver)

### Before Launch:

- [ ] Lighthouse audit (Accessibility 90+)
- [ ] WAVE accessibility scanner
- [ ] Manual accessibility review (keyboard only, screen reader)
- [ ] Mobile device testing (iOS Safari, Chrome Android)
- [ ] Performance testing (Lighthouse Performance 80+)

---

## 14. Design System File Structure

```
styles/
├── globals.css           (Global styles, resets, utilities)
├── variables.css         (CSS custom properties for colors, spacing)
├── typography.css        (Font families, sizes, weights)
└── tailwind.css          (Tailwind directives)

components/
├── ui/
│   ├── Button.tsx
│   ├── Input.tsx
│   ├── Card.tsx
│   ├── ProgressBar.tsx
│   ├── Modal.tsx
│   ├── Tabs.tsx
│   └── index.ts          (barrel export)
├── layouts/
│   ├── Header.tsx
│   ├── Sidebar.tsx
│   └── MainLayout.tsx
└── specific/
    ├── EngagementForm.tsx
    ├── CommentOptions.tsx
    ├── CaptionDisplay.tsx
    └── NewsletterBuilder.tsx

app/
├── page.tsx              (Dashboard)
├── engagement/
├── captions/
├── scripting/
├── newsletter/
├── comments/
├── settings/
└── layout.tsx            (Root layout)
```

---

## 15. CSS Custom Properties (Variables)

```css
/* styles/variables.css */

:root {
  /* Colors */
  --color-black: #000000;
  --color-white: #FFFFFF;
  --color-crimson: #DC143C;
  --color-crimson-dark: #B81228;
  --color-crimson-light: #E63946;
  --color-gray-light: #F5F5F5;
  --color-gray-medium: #E0E0E0;
  --color-gray-dark: #333333;

  /* Spacing */
  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 12px;
  --space-lg: 16px;
  --space-xl: 24px;
  --space-2xl: 32px;
  --space-3xl: 48px;

  /* Font Sizes */
  --font-display-1: 28px;
  --font-display-2: 20px;
  --font-h1: 16px;
  --font-h2: 14px;
  --font-base: 13px;
  --font-sm: 12px;
  --font-xs: 11px;

  /* Font Weights */
  --font-regular: 400;
  --font-bold: 700;

  /* Line Heights */
  --line-display: 1.2;
  --line-heading: 1.3;
  --line-body: 1.5;
  --line-caption: 1.4;

  /* Transitions */
  --transition-fast: 0.15s ease;
  --transition-normal: 0.2s ease;
  --transition-slow: 0.3s ease;
}
```

**Usage in CSS:**

```css
.button {
  background-color: var(--color-crimson);
  padding: var(--space-sm) var(--space-lg);
  font-size: var(--font-base);
  transition: all var(--transition-normal);
}
```

---

## 16. Print Styles (for exported documents)

```css
/* styles/print.css */
@media print {
  body {
    font-size: 11pt;
    line-height: 1.5;
    color: black;
    background: white;
  }

  button, .no-print {
    display: none;
  }

  h1, h2, h3 {
    page-break-after: avoid;
  }

  .card {
    border: 1px solid black;
    page-break-inside: avoid;
  }

  .progress-bar {
    display: none; /* Don't print progress */
  }
}
```

---

**Design System Status:** Ready for Implementation  
**Next Step:** Component Library Build + Storybook Setup (optional)

---

## Appendix A: Figma/Design Software Export

**If using Figma for mockups:**

1. Create frame at 390px (iPhone SE width)
2. Set colors to custom palette (black, white, crimson)
3. Use Arial font (system font)
4. Create components for Button, Card, Input
5. Build screens: Dashboard, Engagement, Captions, Newsletter
6. Export as PNG for documentation
7. Share Figma link with team for live feedback

---

## Appendix B: Quick Reference

| Element | Font | Color | Padding | Border |
|---------|------|-------|---------|--------|
| Display Title | 28px Bold | Black | - | - |
| Section Title | 20px Bold | Black | - | - |
| Heading | 16px Bold | Black | - | - |
| Body | 13px Regular | Black | - | - |
| Primary Button | 13px Bold | White on Crimson | 8px 16px | None |
| Secondary Button | 13px Bold | Black on White | 8px 16px | 1px Gray |
| Input | 13px Regular | Black | 8px 12px | 1px Gray |
| Card | 13px Regular | Black | 12px | 1px Gray |
| Progress Bar | 11px Regular | Crimson | - | 1px Gray |

---

**Design System Finalized:** August 9, 2026  
**Ready for Build:** ✓
