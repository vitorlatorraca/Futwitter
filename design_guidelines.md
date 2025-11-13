# Design Guidelines: Brasileirão Platform

## Design Approach

**Hybrid Reference Strategy**: Combining Instagram's engaging feed patterns with ESPN's sports authority and Linear's clean typography. This platform celebrates Brazilian football passion while maintaining professional credibility for news and statistics.

**Key Principle**: Honor team identity without visual chaos - let team colors accent strategically rather than dominate every surface.

---

## Core Design Elements

### A. Typography

**Font Stack**: Inter for UI, Poppins for headlines (both via Google Fonts CDN)

**Hierarchy**:
- Hero/Headlines: Poppins Bold, text-4xl to text-6xl (48-60px desktop)
- Section Headers: Poppins SemiBold, text-2xl to text-3xl (24-36px)
- Body Text: Inter Regular, text-base (16px), line-height relaxed
- Captions/Metadata: Inter Medium, text-sm (14px)
- Labels: Inter SemiBold, text-xs uppercase tracking-wide

### B. Layout System

**Spacing Primitives**: Tailwind units 2, 4, 6, 8, 12, 16 (p-2, m-4, gap-6, etc.)

**Grid Strategy**:
- Feed: Single column max-w-2xl centered
- Player Grid: grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6
- Team Selection: grid-cols-4 md:grid-cols-5 lg:grid-cols-10 (compact shield grid)

**Container Widths**:
- Feed/Forms: max-w-2xl
- Team Pages: max-w-6xl
- Full-width stats: w-full with inner max-w-7xl

---

## Component Library

### Navigation

**Top Bar (Fixed)**: 
- Logo left, main nav center (Feed | My Team | Profile), user avatar right
- Height: h-16, backdrop-blur-md with subtle border-b
- Mobile: Collapsed hamburger menu

**Team Badge Indicator**: Small team logo (w-8 h-8) next to user name in header

### Landing Page

**Hero Section** (min-h-screen):
- Large hero image: Stadium crowd with flares/passionate fans (full-bleed background)
- Centered content overlay with gradient backdrop
- Headline: "Your passion for Brasileirão in one platform"
- CTA buttons with blurred backgrounds over image
- Trust indicators: "20 Teams | 500+ Players | Thousands of Fans"

**Features Section** (3-column grid desktop, stack mobile):
- Icons: Heroicons via CDN
- Cards with subtle borders, no background fills
- Features: "Rate Players", "Exclusive News", "Connect with Fans"

**Footer**: Multi-column (About, Times, Legal, Social), newsletter signup optional

### Authentication

**Team Selection Screen**:
- Grid of 20 team shields (circular, border on hover)
- Shield size: w-20 h-20 (mobile), w-24 h-24 (desktop)
- Confirmation modal: Centered, max-w-md, team colors in header accent

### Feed (Dashboard)

**Filter Bar**: Sticky below header, horizontal scroll tabs
- Pills: "My Team" (accented with user's team color), "All", individual teams
- Active state: team color background with opacity-20

**News Card**:
- Structure: Team badge + Journalist name → Image (16:9 aspect) → Title → Content preview → Category tag + Like/Dislike counts
- Spacing: p-6, gap-4
- Border: border with hover shadow-lg transition
- Image treatment: rounded-lg, aspect-video
- Interaction buttons: Only active for own team (others have opacity-40 with tooltip)

**Empty States**: Centered icon + message (e.g., "No news from your team yet")

### My Team Page

**Team Header** (full-width):
- Large team shield left (w-32 h-32)
- Team name + position badge ("3rd Place")
- Stats row: grid-cols-4 (Points | Wins | Draws | Losses)
- Background: Subtle gradient using team's primaryColor at 10% opacity

**Player Cards** (grouped by position):
- Position headers: Uppercase tracking-wide with icon
- Grid: 2 cols mobile, 3 cols tablet, 4 cols desktop
- Card content: Photo (rounded-full or square), Number, Name, Rating (★★★★☆)
- "Rate" button: Outlined, team color on hover

**Rating Modal**:
- Max-w-3xl centered
- Match list: Last 5 matches with opponent logo, score, date
- Rating input: Custom star/slider UI (0-10 scale, 0.5 increments)
- Comment textarea: max-length indicator "200 characters"

### Journalist Panel

**Publishing Form** (max-w-3xl):
- Two-column: Form left (sticky), Live preview right
- Fields: Team selector (with shield), Category pills, Title counter, Content textarea
- Image upload: Drag-drop zone with preview
- Preview updates in real-time

**My Articles List**:
- Table/card hybrid with metrics (views, likes, dislikes)
- Edit/Delete actions with confirmation

### Profile

**Stats Dashboard**:
- Card-based metrics: "Ratings Made", "News Liked", "Days Active"
- Badge showcase: Grid of earned badges (locked/unlocked states)

---

## Images

**Required Images**:
1. **Landing Hero**: Brazilian stadium atmosphere, passionate crowd (suggested: Maracanã or Morumbi with fans), full-bleed, 1920x1080+
2. **Team Logos**: All 20 Brasileirão team shields, SVG preferred, circular treatment
3. **Player Photos**: Headshots or action shots, square format (400x400), placeholder: silhouette icon
4. **News Images**: 16:9 aspect ratio, minimum 800x450

**Image Strategy**: Heavy use of team logos as visual anchors throughout. Player photos personalize cards. News images add context and engagement.

---

## Accessibility

- Focus states: 2px ring in team color (or default blue if neutral context)
- Form labels: Always visible, never placeholder-only
- Interactive elements: Minimum 44x44px touch targets
- Alt text: Descriptive for all images ("Flamengo Shield", "News: [title]")
- Color contrast: WCAG AA minimum, especially with team colors on backgrounds

---

## Platform-Specific Patterns

**Team Color Usage**:
- Primary: Accent buttons, active states, selected filters
- Secondary: Borders, badges, subtle backgrounds (10-20% opacity)
- Never: Full backgrounds that reduce text readability

**Football Vernacular**:
- Use Brazilian terms where appropriate for authenticity: "Meu Time" (My Team), "Placar" (Score)
- Emoji sparingly: ⚽ 🏆 for emphasis, not decoration

**Responsive Priorities**:
- Mobile: Vertical feed, single-column player grids, hamburger nav
- Desktop: Multi-column players, sticky filters, expanded stats

**Performance**:
- Lazy load: Player photos, news images below fold
- Optimize: Team shields as SVG sprite or icon font

---

This design celebrates Brazilian football culture while maintaining modern web app standards. Team identity shines through strategic color use and prominent badge placement, creating emotional connection without sacrificing usability.