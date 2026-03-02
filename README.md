# EvenTide - Your Event, Reimagined

Welcome to the EvenTide platform documentation. This file provides an overview of the platform's entry point, core user experience, and the comprehensive event creation lifecycle.

## The EvenTide Logo: A Visual Identity

The EvenTide logo is a masterclass in minimalist yet evocative branding, designed to represent the platform's core mission: the intersection of timeless celebration and modern technology.

### Visual Composition
The logo consists of the word **"EvenTide"** rendered in a bold, sophisticated serif typeface (**Playfair Display**). This choice of font communicates elegance, heritage, and the high-quality nature of the events managed on the platform. The capitalization of the "T" emphasizes the two halves of the name, suggesting the natural flow and rhythm of a perfectly timed celebration.

### Color and Gradient
The most striking feature of the logo is its dynamic color treatment. It employs a vibrant horizontal gradient that transitions seamlessly from a **bright sky blue** to a **warm, sun-kissed golden yellow**. 

*   **Blue**: Represents the calm, professional planning and the technological intelligence provided by Eni.
*   **Yellow**: Represents the warmth of community, the joy of celebration, and the "golden hour" of an unforgettable moment.

### Symbolic Meaning
The gradient itself is a visual metaphor for the "tide" mentioned in the platform's name. It suggests the transition of light during a day of festivities—moving from the crisp clarity of the planning phases into the warm, glowing success of the actual event.

### Digital Execution
The logo is implemented as a high-performance CSS element using a linear gradient background clipped to the text. This ensures the branding remains sharp, accessible, and vibrant on every screen, from mobile scanners to high-resolution desktop displays.

## The Landing Page Header: A Detailed Overview

The EvenTide landing page header is a sophisticated, highly functional navigation component designed to be both visually striking and intuitive. It serves as the primary gateway to the platform's diverse resources and marketplaces.

### Dynamic "Floating" Design
The header employs a modern, reactive layout. When the user is at the top of the page, the header "floats" with generous padding and a pill-shaped, fully rounded border. As the user scrolls down, it seamlessly transitions into a sleek, full-width fixed bar. This transition is enhanced by a backdrop blur effect and a semi-transparent background, ensuring it remains legible against any section of the landing page.

### Multi-Layered Navigation
The primary navigation is organized into four distinct, image-rich dropdowns using a sophisticated "popover" pattern:
- **Resources:** A gateway to educational content, including "How to Use EvenTide" and the "Meet Eni" feature showcase.
- **Community:** Centralizes access for different user roles, featuring login portals for Guests and Security, and search tools for Planners and Vendors.
- **Magazine:** Provides direct access to the latest and archived issues of the AI-curated community magazine.
- **Marketplace:** A hub for transactional features, allowing users to buy tickets for shows or find hotels, venues, and car hire services.

Each of these dropdowns is visually anchored by a high-quality preview image that reflects the section's theme, providing immediate visual context.

### Role-Specific Call-to-Actions
On the right side of the header, primary actions are clearly defined. In the desktop view, "Login" and "Sign Up" buttons are housed in a distinct, bordered pill container. For mobile users, a clean hamburger menu opens a dedicated sidebar ("Sheet") that presents the full navigation hierarchy and provides specialized login buttons for Owners, Guests, and Security personnel.

### Visual Branding
The header prominently features the EvenTide Logo, rendered with a vibrant gradient that mirrors the platform's "primary to accent" color palette. This branding remains consistent and centered in the mobile view, maintaining a premium feel across all devices.

## The Marketplace: Show Tickets & Discovery

The **"Show Tickets"** feature is the lead transactional service within the Marketplace. It is designed to transform casual visitors into event attendees through a seamless discovery-to-purchase pipeline.

### Header Integration & Visual Discovery
Within the landing page header, the **Marketplace** dropdown serves as the primary entry point. The "Show Tickets" link is prominently featured and is visually contextualized by a high-quality image of an active event venue. This visual anchoring is designed to trigger an immediate emotional connection with the user's desire for entertainment and community.

### The Discovery Hub
Clicking through from the header leads the user to the **Shows Marketplace** (`/shows`). This central hub acts as a public billboard for "Ticketiers" (Promoters) to showcase their upcoming events. It features:
- **Searchable Inventory**: A real-time search interface allowing users to find shows by name or location.
- **Show Cards**: High-impact visual cards that display the event date, venue, and a "Tickets Available" badge, ensuring key information is visible at a glance.

### The Purchase Pipeline
Once a show is selected, the system guides the user through a structured, secure selection process:
1.  **Show Details**: A deep-dive page providing rich descriptions and multiple image previews.
2.  **Tier Selection**: A dedicated widget where users can select quantities from various ticket tiers (e.g., General, VIP, Table) with real-time availability tracking.
3.  **Secure Checkout**: A summary view that calculates the grand total before initiating a secure, atomic write operation to the database to generate the tickets.
4.  **Instant Fulfillment**: Successful transactions culminate in a confirmation page where users can immediately view their unique, scannable digital tickets.

### Relationship to the Footer
The platform maintains a persistent **"Buy Tickets"** link in the "Marketplace" column of the site-wide footer. This provides a functional redundancy:
- While the **Header Dropdown** is designed for high-visibility discovery and "top-of-page" engagement, the **Footer Item** acts as a site-wide shortcut.
- This ensures that if a user has scrolled to the bottom of any informational page (like "Privacy" or "About Us") and decides they are ready to explore events, they have an immediate path back to the marketplace without needing to scroll back to the top.
- Both entry points converge on the same `/shows` discovery hub, maintaining a consistent and predictable user journey.

## The Landing Page: A Detailed Overview

The EvenTide landing page is a sophisticated, multi-layered experience designed to communicate the platform's unique blend of cultural richness and AI-driven intelligence.

### The Hero Experience
The journey begins with a high-impact visual section featuring a cinematic, wide-angle view of a grand event hall. Overlaid on this image are dynamic, rotating headlines that emphasize the platform's ability to help users plan their events effortlessly, stylishly, and perfectly. The tone is set immediately as one of premium quality and seamless ease.

### Strategic Narrative: How It Works
A dedicated section breaks down the complex process of event management into a simple, four-step narrative. This uses clean, modern iconography to guide the user through the lifecycle of an event: from initial creation and AI-powered design to guest list building and final, secure execution on the day of the celebration.

### Visual Manifesto
A striking, full-width section features a vibrant image of a celebratory gathering, serving as a visual manifesto for the platform’s core belief: bringing people together beautifully. It anchors the technology in its human and cultural purpose.

### Interactive AI Showcase: Meet Eni
The landing page features an interactive demonstration of Eni, the platform's AI soul. Users can select an event type and witness Eni’s poetic and celebratory writing style firsthand as she generates a personalized welcome message for a hypothetical guest. This section highlights the "soul" of the platform's intelligence.

### Social Validation: Testimonials
A grid of testimonials from event owners, professional planners, and security heads provides social proof. Each testimonial includes an avatar and a specific perspective on how the platform has transformed their professional workflow or event experience.

### Role-Based Value Propositions
Recognizing the diverse ecosystem of event management, a specialized section details the specific benefits for every participant:
- **Owners:** Master dashboard oversight and budget tracking.
- **Planners:** Seamless team collaboration and guest communication.
- **Vendors:** Portfolio showcasing and streamlined contracting.
- **Guests & Security:** Personalized digital assets and secure check-ins.

### Transparent Monetization: Pricing Tiers
The page concludes with a clear presentation of five distinct pricing tiers. Each card outlines the guest limits, included roles (planners, co-hosts, security), and key features, allowing users to find the package that perfectly fits the scale of your occasion.

### Aesthetic and Tone
The entire landing page employs a sophisticated dark theme with a palette of deep blues and vibrant accents. The typography is a blend of modern sans-serif for clarity and elegant serif for headlines, reflecting the platform's commitment to both technological innovation and timeless celebration.

## The Sign Up Page: A Detailed Overview

The **Sign Up** page (`/signup`) is the primary onboarding gateway for all user roles within the EvenTide ecosystem. It is designed to be both secure and adaptive, capturing specific information based on the user's intended role.

### Visual Architecture
The page adheres to EvenTide's "dark mode" aesthetic, centered within a professional **Card** component on a subtle secondary background. It prominently features the **EvenTide Logo**, anchoring the onboarding process in the platform's brand identity.

### Adaptive Registration Workflow
The heart of the page is a dynamic, multi-step form that intelligently adjusts to the user's selection:

- **Core Identity**: Every user provides their **First Name**, **Last Name**, **Email**, and a secure **Password** (minimum 8 characters).
- **Role Selection**: A critical step where users define their primary function on the platform. EvenTide supports nine distinct roles including Owners, Planners, Vendors, and specialized service providers like Hoteliers.
- **Conditional Logic**: The form dynamically expands based on the selected role. For instance, **Ticketiers** must provide a **Promoter Name**, while **Vendors** must select their professional **Specialty**.

### Technical Implementation & Security
- **Validation**: Real-time client-side validation is enforced via **Zod**, ensuring data integrity before account creation.
- **Authentication**: Account creation is handled securely through **Firebase Authentication**.
- **Data Synchronization**: Upon successful authentication, the system initializes the user's profile in **Firestore**. For marketplace roles, additional documents are created in specialized collections to populate their public storefronts.
- **Intelligent Redirection**: Once the account is created, the system automatically routes the user to their specific functional workspace based on their assigned role.

## The Login Page: A Detailed Overview

The **Login** page (`/login`) is the secure entry point for EvenTide's registered users, providing access to role-specific dashboards.

### Visual Architecture
The login experience is centered within a high-contrast **Card** component, set against a subtle secondary background to minimize distractions. The **EvenTide Logo** is prominently displayed at the top, immediately establishing brand authority.

### Authentication Mechanics
- **Credential Input**: Users provide their registered **Email** and **Password**.
- **Security Features**: The password field includes a dynamic **visibility toggle** (Eye icon), allowing users to verify their input before submission.
- **Non-Blocking Logic**: The page utilizes a non-blocking sign-in utility that relies on a global **Auth Listener** to handle results, ensuring the UI remains responsive during the authentication process.

### Intelligent Redirection
The login process is tightly integrated with EvenTide's role-based access control system:
- **Profile Retrieval**: Upon successful authentication, the system fetches the user's **Role** from **Firestore**.
- **Dynamic Routing**: The application automatically routes the user to their designated workspace (e.g., a Planner is sent to `/planner-dashboard`). 
- **Automatic Guards**: Authenticated users are automatically redirected away from the login page if they try to access it manually.

### User Experience Enhancements
- **Search Parameter Awareness**: The form can detect and pre-fill an email address passed via URL parameters.
- **Interactive Feedback**: The "Sign In" button includes a loading spinner to indicate processing.
- **Recovery Path**: Clear links are provided for **Password Reset** and new user **Registration**.

## The Contact Us Page: A Detailed Overview

The **Contact Us** page is the primary support gateway for EvenTide users, designed to facilitate clear communication between the community and the platform administrators.

### Visual Architecture
The page is set against a subtle, professional secondary background that provides visual separation from the high-energy landing page. The core of the experience is a centered, high-contrast Card component that employs a backdrop blur effect and a refined border, maintaining the platform's premium "dark mode" aesthetic.

### Functional Form Design
At the heart of the page is a robust, validated contact form. It captures four essential data points:
- **Identity:** The user's full name.
- **Connectivity:** A verified email address for correspondence.
- **Intent:** A concise subject line to categorize the inquiry.
- **Detail:** A multi-line message area allowing for deep contextual explanations of the user's needs.

The form employs real-time client-side validation (via **Zod** and **React Hook Form**), ensuring that all required information is present and correctly formatted before submission.

### Backend Intelligence: Support Tickets
Submitting the form initiates a secure, non-blocking write operation to the **Firestore** database. Each submission is transformed into a structured `supportTicket` document, which includes:
- **Priority Management:** Every ticket is automatically assigned a `medium` priority and an `open` status.
- **Temporal Tracking:** A precise `createdAt` timestamp is recorded for SLA monitoring.
- **Administrative Visibility:** These tickets are instantly surfaced in the **User Admin** dashboard, where administrators can track, update statuses (e.g., to "In Progress" or "Closed"), and manage resolutions.

### Error Resilience
The page is integrated with EvenTide's global error-handling architecture. In the rare event of a database permission issue, the system generates a rich, contextual **FirestorePermissionError**, ensuring that the incident is logged and surfaced correctly for rapid debugging by the technical team.

## The Landing Page Footer: A Detailed Overview

The EvenTide landing page footer is a comprehensive navigational hub designed to provide persistent access to all corners of the platform while reinforcing the brand's identity.

### Brand Presence
The footer begins with a clear statement of identity, featuring the **EvenTide Logo** alongside its core tagline: *"AI-powered event management for unforgettable moments."* This anchors the entire section in the platform's mission.

### Comprehensive Navigation
The footer organizes the platform's extensive resources into five logical, high-level columns:
- **Resources:** Links to educational content including "What is EvenTide," "How to Use," "Meet Eni," and the "About Us" page.
- **Community:** Role-specific portals including Guest and Security logins, search tools for Planners and Vendors, and avenues for engagement like submitting testimonials or advertising.
- **Magazine:** Direct access to the full archive of the Community Magazine and the "From the Editor" column.
- **Marketplace:** Entry points for all transactional services, from buying show tickets to finding hotels, venues, and car hire services.
- **Legal:** Essential compliance and support links, including the Privacy Policy, Terms of Service, and a direct "Contact Us" link.

### Footer Item Layout: Technical Specification
The footer is engineered with a responsive grid architecture to ensure clarity across all devices:

*   **Grid Structure**: The main container uses a 12-column grid on large screens. The brand identity block spans 4 columns, while the navigation matrix spans the remaining 8 columns.
*   **Navigation Matrix**: Within the navigation area, a nested grid displays 2 columns on mobile and expands to a 5-column layout on medium screens and above.
*   **Visual Hierarchy**: Category headers use the **Space Grotesk** typeface in a bold weight. Link items use a smaller, legible font size with a hover-active transition that changes the text color from a muted tone to the primary brand accent.
*   **Baseline Bar**: A final horizontal bar uses a flexible flex-box layout to separate the left-aligned copyright notice from the right-aligned social media icon suite.

### Aesthetic Consistency
Maintaining the platform's sophisticated look, the footer uses a subtle secondary background with a refined top border, ensuring it remains distinct from the main content while blending seamlessly into the overall dark-themed aesthetic.

## The Event Creation & Stationery Onboarding Lifecycle

EvenTide employs a meticulously designed, guided walkthrough that transforms the complex task of event planning into a structured, rewarding journey. This process ensures that every event is born with a clear identity and professional digital assets.

### Phase 1: The Event Creation Wizard
The journey begins at `/owner-dashboard/create-event`, a multi-step "Stepper" interface that breaks down initial setup into logical chunks:
1.  **Core Details**: Capturing the event's name and a rich description.
2.  **Theme & AI Identity**: Here, the user selects an event type (e.g., Wedding, Gala) and defines the **Primary and Secondary brand colors**. Simultaneously, Eni generates a unique **Event Code**, the master key for all future guest and team interactions.
3.  **Logistics**: Setting the date, time, and physical venue.
4.  **Team Initialization**: The user can immediately search for a professional Planner by email to invite them to the project.

### Phase 2: Building the Foundation (The "Walkthrough" Mode)
Upon finalizing the wizard, the system enters a specialized **Walkthrough Mode**. It redirects the user to the **Guest Management** dashboard with a `?walkthrough=true` parameter.
-   **Guided Guest Building**: A contextual alert explains the importance of the guest list. The user adds their first attendees, and the system automatically generates unique **Guest Codes** and scannable **QR identifiers** for each person.
-   **Team Assembly**: From Guest Management, the user is prompted to "Assemble Your Team," navigating to the **Team Roster** to manage co-hosts and security personnel.

### Phase 3: The Stationery Hub & Invitation Studio
Once the "people" foundation is set, the system directs the user to the **Stationery Hub**. This is the creative center where the event's visual brand is finalized.
-   **Design Once, Apply Everywhere**: The user enters the **Invitation Studio**. Using the colors defined in the wizard, the user establishes a "Master Theme."
-   **Eni's Creative Input**: The user can choose from a gallery of templates or provide a text prompt to **Eni**, who uses AI to generate a unique, stunning background design.
-   **Global Synchronization**: Once the master invitation background and typography are saved, the system **automatically propagates** these design choices across all other event cards: the Digital Gate Pass, the Program Card, and the Menu.

### Phase 4: Final Previews & Completion
The journey concludes with a series of high-fidelity previews:
1.  **Gate Pass Preview**: Seeing the scannable digital ticket guests will use.
2.  **Program & Menu Previews**: Reviewing the layouts that will eventually be filled with content by the Planner.
3.  **Completion**: The cycle ends on a celebratory page with a visual "fireworks" effect, marking the transition from "Setup" to "Active Management."

This structured lifecycle ensures that every Event Owner, regardless of their technical or design background, can launch a professional, branded, and operationally ready event in minutes.
