# EvenTide - Your Event, Reimagined

Welcome to the EvenTide platform documentation. This file provides an overview of the platform's purpose, core user experience, and technical architecture.

## What is EvenTide?

EvenTide is a sophisticated, AI-powered event management ecosystem designed to redefine how celebrations are planned, managed, and remembered. Rooted in Nigerian and African cultural richness, it combines high-performance technology with an elegant, user-centric interface to empower event owners, professional planners, and service providers.

At its core, EvenTide is driven by **Eni**, the platform's "AI soul," who acts as a poetic creative director and a meticulous logistical coordinator. Whether it's generating unique invitation designs, curating live photo galleries, or providing intelligent menu suggestions, Eni ensures that every detail reflects the elegance and importance of the occasion.

The platform serves as a complete lifecycle solution, offering:
*   **A Unified Marketplace**: A centralized hub for discovering and booking premium venues, hotels, car hire services, and vetted vendors.
*   **Public Event Commerce**: A specialized workspace for promoters (Ticketiers) to list shows and sell digital tickets to a wide audience.
*   **Collaborative Planning**: Real-time tools for team assembly, task tracking, budget management, and integrated communication.
*   **Secure Execution**: Modern on-site tools including QR-based digital gate passes, scanner activation for security teams, and live check-in monitors.
*   **Digital Storytelling**: An AI-curated community magazine that transforms the memories of public celebrations into a lasting digital archive.

## The EvenTide Logo: Technical Specification

The logo is a precise execution of the brand's core values, utilizing a specific combination of typography and color to create a memorable identity.

### 1. Typography (The Font)
- **Typeface**: **Playfair Display** (Serif).
- **Weight**: **Bold** (700).
- **Narrative Purpose**: Chosen for its classical elegance and high-contrast strokes, this font communicates the "masterpiece" quality of the events managed on the platform.

### 2. Color Palette (The Gradient)
The logo features a vibrant horizontal linear gradient that flows from left to right:
- **Start Color**: **Sky Blue** (Tailwind `blue-400` / `#60A5FA`). Represents clarity and technology.
- **End Color**: **Golden Yellow** (Tailwind `yellow-300` / `#FDE047`). Represents the warmth of celebration.
- **Execution**: Applied using `bg-clip-text`, making the colors live within the letterforms.

### 3. Sizing (The Scale)
- **Base Size**: **text-lg** (1.125rem / 18px).
- **Impact Scaling**: Scales up to **text-4xl** on high-impact landing sections.

## Hero Headline: Technical Specification

The headline *"Plan Your Event Effortlessly"* (and its rotating variations) is the primary visual hook of the landing page.

### 1. Primary Typography
- **Typeface**: **Space Grotesk** (Sans-serif).
- **Weight**: **Extrabold** (800).
- **Narrative Purpose**: A modern, technical typeface that balances the classical serif of the logo, representing the "high-performance technology" side of EvenTide.

### 2. The Dynamic Word ("Effortlessly", etc.)
The rotating word is treated with the signature brand gradient to draw the eye and emphasize the ease of use.
- **Implementation**: CSS `background-clip: text` with `text-color: transparent`.
- **Color Codes**:
    - **Primary (Sky Blue)**: `HSL(225, 73%, 57%)` (Hex `#4169E1`).
    - **Accent (Golden Yellow)**: `HSL(45, 100%, 51%)` (Hex `#FFD700`).
- **Logic**: A React `useEffect` hook cycles these words every 2500ms, using a CSS `transition` for smooth opacity and color shifts.

## Typography: A Multi-Layered Visual Language

EvenTide employs a carefully curated selection of typefaces beyond the logo to establish its unique brand identity.

### 1. The Anchor of Elegance: Playfair Display (Serif)
- **Role**: The primary brand typeface.
- **Usage**: Used exclusively for the EvenTide logo and high-impact section headings.

### 2. The Modern Interface: Space Grotesk (Sans-serif)
- **Role**: The headline and navigational anchor.
- **Usage**: Used for secondary headlines, dashboard category labels, and the main hero headline.

### 3. The Clarity Standard: Inter (Sans-serif)
- **Role**: The workhorse body font.
- **Usage**: The default typeface for all descriptive text, form fields, and data-heavy dashboard components.

### 4. The Human Touch: Caveat (Cursive)
- **Role**: The stylized "handwritten" accent.
- **Usage**: Used specifically for elements requiring a personal touch, such as the messages on the **Autograph Wall**.

## The Hero Experience: Vision & Dynamic Branding

The Hero section of the EvenTide landing page is engineered to create an immediate emotional and professional impact.

### 1. The Dynamic Headline Logic
The headline *"Plan Your Event Stylishly"* is part of a reactive cycle.
- **Functionality**: The system employs a React `useEffect` hook combined with a `setInterval` (cycling every 2500ms) to rotate through a curated list of descriptors: **Effortlessly**, **Stylishly**, **Beautifully**, and **Perfectly**.
- **Visual Feedback**: Each transition uses the same Sky Blue to Golden Yellow gradient treatment as the EvenTide logo, ensuring brand consistency.

### 2. The Narrative Anchor (Sub-headline)
*"Welcome to EvenTide, your AI-powered partner for flawless event management. From intimate gatherings to grand galas, we bring your vision to life with intuitive tools and expert assistance."*

### 3. Immediate Action Gateways
- **Create an Event**: The primary "Host" entry point.
- **Buy Tickets**: The "Marketplace" shortcut.
- **I am a Guest**: The "Attendee" portal.

## Personalized Successful Login: The User Experience

### 1. Identity Resolution & Data Fetching
Immediately upon Firebase Authentication success, the global **Auth Handler** fetches the user's comprehensive profile from the `/users` collection to resolve their **First Name** and **Role**.

### 2. Welcoming Visual Confirmation
The system provides immediate feedback through a personalized **Toast Notification** (e.g., *"Welcome back, Funke! Redirecting..."*).

### 3. Intelligent Workspace Routing
- **Event Owner**: Routed to the strategic oversight dashboard.
- **Professional Planner**: Taken to the gig management interface.
- **Guest**: Directed to their personalized invitation and digital asset wallet.

## Smart Authentication & Role-Based Dashboard Architecture

### 1. The Global Auth Handler (`useAuthHandler`)
Resides in the root layout and listens for changes in auth state. It extracts the `role` and caches it in `sessionStorage` for instantaneous UI updates.

### 2. The Role-Dashboard Mapping
The platform maintains a strict `ROLE_DASHBOARD_MAP` that defines the relationship between a user's role and their destination URL.

### 3. Layout Security Guards (`DashboardRedirector`)
Prevents unauthorized "deep-linking" by checking the user's Firestore role against the `expectedRole` defined for that specific layout.

## The Event Owner Dashboard: A Comprehensive Overview

The centralized command center for hosts, providing 360-degree oversight of their entire event portfolio.

### 1. The Command Center
- **Event Switcher**: Toggles between different celebrations.
- **Real-Time KPIs**: Data on Guest Capacity, RSVP Rates, and Live Check-ins.
- **Dynamic Countdown**: Displays time remaining until the event.
- **Planner Oversight**: Read-only feed of the planner's upcoming tasks.

## The Event Owner Dashboard Sidebar: A Detailed Breakdown

The sidebar uses a "Group & Flyout" navigation pattern to maximize screen real estate while keeping deep tools accessible via popover menus.

### 1. My Workspace (Icon: Home)
- **Dashboard**: Main command center.
- **Analytics**: Deep-dive guest engagement trends.
- **Calendar**: Unified view of dates and deadlines.

### 2. Event Planning (Icon: PartyPopper)
- **Stationery Hub**: Control for branding and AI Invitation Studio.
- **Program & Menu**: Monitoring schedule and culinary plans.
- **Seating Chart**: Visual layout of assigned guest placement.
- **Gift Registry**: Management of wishlist and monetary gift details.
- **Shot List**: Photographer's checklist.
- **Media Library**: Shared repository for photos.
- **Song Requests**: Guest-submitted music moderation.

## The Event Planner Dashboard: A Professional Workspace

Designed for high-performance job management, the planner dashboard provides the tactical tools necessary to deliver a world-class celebration.

### 1. Gig Management & Intake
- **Invitation Hub**: Review and respond to new job offers.
- **Conflict Detection**: Flags date clashes when accepting new gigs.

### 2. AI-Assisted Creative Drafting
- **Program & Menu Architects**: Generate intelligent first drafts based on cuisine or schedule needs.
- **Interactive Mood Board**: Visual workspace for theme curation with AI-suggested complementary items.

### 3. Detailed Operational Control
- **Interactive Seating Chart**: Drag-and-drop guest placement onto visual tables.
- **The Task Board**: Kanban-style board for tracking to-dos, synchronized with the host's view.
- **Budget Logger**: Authoritative source for financial tracking and expense management.

## The Marketplace: Show Tickets & Discovery

### 1. Discovery Hub
Clicking from the header leads to the **Shows Marketplace** (`/shows`), a public billboard for Ticketiers to showcase events.

### 2. The Purchase Pipeline
1. **Show Details**: Rich descriptions and previews.
2. **Tier Selection**: General, VIP, or Table selection with availability tracking.
3. **Secure Checkout**: Atomic write operations to generate unique tickets.

## The Marketplace: Hotel, Venue, and Car Hire

### 1. Geographical Discovery
Marketplaces for Hotels and Venues feature robust filtering by **Nigerian State and City** to ensure localized convenience.

### 2. Car Hire Services
Allows users to filter by **Make, Model, or Year**, facilitating premium arrivals and guest shuttles.

## Resources: "What is EvenTide?" & Manifesto

The **Manifesto** page is the philosophical home of the platform. It defines EvenTide as Nigeria’s premier event ecosystem where technology, creativity, and culture converge. Its four pillars are:
- **Empowerment**: Providing intuitive tools for creators.
- **Storytelling**: Transforming every event into a narrative.
- **Innovation**: Leveraging AI to redefine the possible.
- **Connection**: Building a community of hosts and vendors.

## Public Resources: Submit a Testimonial

The `/resources/submit-testimonial` page allows users to share their EvenTide experience.
- **The Form**: A validated interface collecting the user's name, role, and success story.
- **Moderation Pipeline**: Submissions are stored in a `testimonials` collection with a `pending` status, requiring administrative approval before appearing publicly.

## Advertisement & Sponsorship Opportunities

Prospective partners can submit formal proposals via the **Advertise with Us** page. Approved sponsors are integrated into the AI-curated magazine and high-visibility sections of platform dashboards.

## The Event Creation & Stationery Onboarding Lifecycle

### Phase 1: The Event Creation Wizard
A multi-step stepper for Core Details, Theme & Colors, and Planner Assignment.

### Phase 2: Building the Foundation
Contextual walkthroughs for building the Guest List and assembling the Team.

### Phase 3: The Stationery Hub
The creative center for "Design Once, Apply Everywhere," where AI generates master backgrounds that propagate to Gate Passes, Programs, and Menus.
