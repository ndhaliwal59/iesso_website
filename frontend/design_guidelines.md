# Ontario Energy Demand Forecasting Dashboard - Design Guidelines

## Design Approach & Philosophy

**Selected Approach:** Reference-Based (Utility-Focused Dashboard)
**Primary References:** Linear (typography/spacing), Stripe Dashboard (data visualization), Vercel Analytics (modern metrics)

This is a data-driven analytics dashboard where clarity, readability, and information hierarchy are paramount. The design should feel professional, trustworthy, and purposefully minimal—allowing the energy data to be the hero.

## Color System

**Foundation:**
- Background: `#0A2540` (deep navy blue) - primary canvas
- Card backgrounds: `#FFFFFF` with subtle shadow (`shadow-lg`)
- Text primary: `#FFFFFF`
- Text secondary: `#A0AEC0` (muted gray for labels, metadata)

**Data Visualization Accent Colors:**
- Predicted demand line: `#00FFFF` (electric cyan, dashed)
- Actual demand line: `#FF9800` (vibrant orange, solid)
- Nuclear: `#8B5CF6` (purple)
- Wind: `#10B981` (emerald)
- Hydro: `#3B82F6` (blue)
- Solar: `#FBBF24` (amber)
- Gas: `#EF4444` (red)
- Biofuel: `#84CC16` (lime)

**Functional Colors:**
- Imports indicator: `#10B981` (green)
- Exports indicator: `#EF4444` (red)
- Error/alert states: `#F59E0B` (amber warning)

## Typography

**Font Family:** Inter (primary), fallback to system fonts
**Hierarchy:**
- Page titles: `text-3xl md:text-4xl font-semibold` (36-48px)
- Section headers: `text-xl md:text-2xl font-medium` (24-32px)
- Card titles: `text-lg font-medium` (18px)
- Body text: `text-base` (16px)
- Table headers: `text-sm font-medium uppercase tracking-wide` (14px)
- Metadata/timestamps: `text-sm text-gray-400` (14px)
- Chart labels: `text-xs` (12px)

## Layout & Spacing System

**Container Strategy:**
- Max width: `max-w-7xl mx-auto` for main content
- Page padding: `px-4 md:px-6 lg:px-8`
- Vertical section spacing: `py-8 md:py-12`

**Tailwind Spacing Primitives (Standardized):**
Use consistent spacing units: `2, 4, 6, 8, 12, 16`
- Tight spacing (within cards): `p-4 md:p-6`
- Component gaps: `gap-4 md:gap-6`
- Section margins: `mb-8 md:mb-12`
- Between major sections: `space-y-8`

**Card Design:**
- Border radius: `rounded-xl` (12px) for all cards
- Card shadow: `shadow-lg` on white cards
- Card padding: `p-6 md:p-8`
- Card-to-card spacing: `gap-6` in grid layouts

## Component Library

### Navigation Header
- Fixed/sticky header: `sticky top-0 z-50 bg-[#0A2540]/95 backdrop-blur-sm`
- Height: `h-16 md:h-20`
- Logo + title left-aligned, navigation links right-aligned
- Active state: cyan underline `border-b-2 border-cyan-400`
- Layout: `flex items-center justify-between`

### Chart Components
**Line Chart (Forecast):**
- Height: `h-80 md:h-96` (320-384px)
- Grid: subtle dotted lines `stroke-gray-700`
- Legend: positioned top-right, horizontal layout
- Axes: white labels with gray grid lines
- Tooltip: dark background with white text, rounded corners

**Donut Chart (Supply Mix):**
- Size: `w-48 h-48 md:w-64 h-64` centered in card
- Legend: vertical list beside chart on desktop, below on mobile
- Segment labels: show percentage on hover

### Data Tables
**Structure:**
- Full-width within card container
- Header row: gray background `bg-gray-50` with medium weight text
- Alternating row colors: `even:bg-gray-50` for readability
- Cell padding: `px-4 py-3`
- Current hour highlight: `bg-cyan-50 border-l-4 border-l-cyan-400`
- Responsive: stack to cards on mobile (`md:table`)

### Metric Cards
**Peak Forecast Card:**
- Prominent number display: `text-5xl font-bold text-cyan-400`
- Label below: `text-sm text-gray-600`
- Optional sparkline: `h-12` positioned below metrics
- Icon/visual indicator: top-right corner

**Import/Export Card:**
- Two-column grid: `grid grid-cols-2 gap-6`
- Directional arrows: use icon fonts (Heroicons)
- Large metric numbers: `text-3xl font-semibold`
- Green/red color coding for direction

### Grid Layouts
**Dashboard Grid:**
- Main forecast: full width
- Supply + Imports/Exports: `grid md:grid-cols-2 gap-6`
- Table: full width
- Peak forecast: centered, max-width `md:max-w-md mx-auto`

**About Page:**
- Single column: `max-w-4xl mx-auto`
- Section spacing: `space-y-12`
- Content blocks: white cards with `p-8` padding

## Page-Specific Guidelines

### Analytics Dashboard
**Visual Flow:** Header → Forecast Chart → Hourly Table → Supply/Flow Cards → Peak Card → Footer

**Forecast Section:**
- Full-bleed chart within white card
- Title above chart: `mb-6`
- Timestamp note below: `mt-4 text-sm text-gray-500 text-center`

**Footer:**
- Simple centered text: `py-8 text-center text-sm text-gray-400`
- Subtle top border: `border-t border-gray-700`

### About the Model Page
**Section Pattern:**
- Heading: `text-2xl font-semibold mb-4`
- Body text: `text-gray-300 leading-relaxed max-w-prose`
- Lists: `list-disc list-inside space-y-2`
- Pipeline visualization: numbered steps with connecting lines

## Interactions & Micro-animations

**Minimize Animations:** Keep interface snappy and data-focused
**Allowed Interactions:**
- Chart tooltips: instant show on hover
- Table row hover: subtle background change `hover:bg-gray-100`
- Navigation links: instant underline on active state
- Card hover: none (cards are static containers)

**No Animations For:**
- Page transitions
- Chart rendering (instant load)
- Data updates

## Responsive Breakpoints

**Mobile (< 768px):**
- Single column layout throughout
- Stack supply/import cards vertically
- Horizontal scroll for wide tables (with visual scroll hint)
- Smaller chart heights: `h-64`

**Tablet (768px - 1024px):**
- Two-column grid for side-by-side cards
- Full-width charts and tables
- Moderate padding: `p-6`

**Desktop (> 1024px):**
- Full grid layouts as specified
- Maximum padding and spacing
- Optimal chart heights: `h-96`

## Images

**No Hero Images Required:** This is a data dashboard, not a marketing page. The forecast chart serves as the visual anchor.

**Optional Graphics:**
- About page: placeholder for model architecture diagram (simple flowchart visual)
- Future: small icons for energy source types (nuclear, wind, solar symbols)