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

In essence, EvenTide is where technology meets timeless celebration, providing the tools to turn every vision into a perfectly executed reality.

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

## Resources: "What is EvenTide?"

Located as the primary entry in the **Resources** dropdown of the landing page header, the "What is EvenTide" link serves as the platform's intellectual and philosophical anchor. 

### Visual Presentation
Within the header's navigation, this item is presented inside a modern popover component. It is visually context-mapped to a cinematic, wide-angle image of a decorated gala hall, signifying the high-quality, professional standards the platform upholds. This visual anchoring helps transition the user's mindset from simple utility to the "masterpiece" level of event planning.

### The Manifesto Page (`/resources/what-is-eventide`)
Clicking this link takes the user to a dedicated manifesto that defines the project's identity. The page is anchored by a central vision statement: *"To be Nigeria’s premier event ecosystem — where technology, creativity, and culture converge to create unforgettable experiences and world‑class storytelling."*

### The Four Pillars of the Mission
EvenTide's purpose is further defined through four strategic pillars:
*   **Empowerment**: Providing intuitive, high-performance tools that allow anyone to plan events with the precision of a professional.
*   **Storytelling**: Moving beyond logistics to transform events into rich, shareable digital narratives.
*   **Innovation**: Utilizing the platform's AI soul, Eni, to automate the tedious and elevate the creative aspects of celebration.
*   **Connection**: Building a secure, vetted network where hosts can find the perfect partners for their vision.

### Cultural Positioning
The resource emphasizes that EvenTide is not just a utility, but a **cultural archive**. It is designed to preserve the vibrancy of Nigerian celebrations, ensuring that the stories behind the moments are captured and archived for the future.

## Smart Authentication & Role-Based Dashboard Architecture

EvenTide employs a centralized, intelligent redirection system that ensures users are always in the correct workspace. This "smart login" logic is built on three core pillars:

### 1. The Global Auth Handler (`useAuthHandler`)
This is the "brain" of the redirection system. It resides in the root layout and listens continuously for changes in the user's authentication state via Firebase. 
- **Identity Resolution**: Upon login, it immediately fetches the user's comprehensive profile from the `/users` collection in Firestore.
- **Role Detection**: It extracts the `role` property (e.g., 'Planner', 'Hotelier', 'Super Admin').
- **Session Persistence**: It caches the role and name in `sessionStorage`. This allows for instantaneous, flicker-free UI changes during the same session without waiting for repeated database fetches.

### 2. The Role-Dashboard Mapping
The platform maintains a strict, centralized map (`ROLE_DASHBOARD_MAP`) that defines the relationship between a user's role and their destination URL. This ensures consistency—every "Hall Owner" is always routed to `/hall-owner-dashboard`, and every "Ticketier" to `/ticketier-dashboard`. This mapping is used for both initial login redirection and ongoing navigational protection.

### 3. Layout Security Guards (`DashboardRedirector`)
To prevent unauthorized "deep-linking" (e.g., a Vendor trying to manually access the Owner dashboard), every dashboard layout is wrapped in a `DashboardRedirector` component.
- **Validation**: It checks the user's Firestore role against the `expectedRole` defined for that specific layout.
- **Enforcement**: If a mismatch is detected, it automatically "ejects" the user and redirects them to their correct home dashboard.
- **Loading State**: It manages the "Auth Gap"—the brief moment during hydration when the user's identity is being verified—by displaying a centered loading spinner, preventing unauthorized content from flashing on screen.

## The Event Owner Dashboard: A Comprehensive Overview

The **Event Owner Dashboard** is the centralized command center for hosts, providing 360-degree oversight of their entire event portfolio. It is designed to balance high-level strategic data with deep-dive creative and operational tools.

### 1. The Command Center (Main Dashboard)
Upon entry, the owner is presented with a high-impact overview of their active events:
- **Event Switcher**: A persistent sidebar allows owners to toggle between different celebrations, instantly updating all dashboard metrics.
- **Real-Time KPIs**: A suite of visual cards provides immediate data on the "Health" of the selected event, including **Total Guest Capacity**, **RSVP Rates**, and **Live Check-in Progress**.
- **Dynamic Countdown**: A primary visual anchor that displays the time remaining until the event begins, keeping the timeline top-of-mind.
- **Planner Oversight**: A read-only feed of the planner's upcoming tasks, ensuring the owner is always aware of logistical progress without needing to micromanage.

### 2. Creative & Brand Management
The dashboard serves as the gateway to EvenTide's creative suite:
- **Stationery Hub**: The central location for finalising the event's visual identity, including the AI-powered Invitation Studio and previews for Gate Passes and Menus.
- **Media Library**: A curated repository where owners can review photos and videos uploaded by guests and vendors, and use Eni to create automated highlight galleries.
- **Mood Board**: A shared space to visualize the event's aesthetic theme, enhanced by AI-generated design suggestions.

### 3. People & Logistics Oversight
Owners maintain complete control over the "Who" and the "Where":
- **Guest Management**: A robust tool for building and categorising guest lists, monitoring RSVPs, and manually adjusting check-in statuses.
- **Team Roster**: The interface for assembling the professional team, allowing owners to search for and invite Planners, Co-hosts, and Security personnel.
- **Marketplace Hub**: Direct access to EvenTide's specialized marketplaces to find and vet Venues, Hotels, Car Hire services, and Fashion Designers.

### 4. Operational & Financial Monitoring
To ensure a stress-free celebration, the dashboard provides clear visibility into backend operations:
- **Contract Oversight**: A dedicated view to monitor the status of all vendor proposals and fashion commissions initiated by the planning team.
- **Expense Tracking**: A real-time log of the event's budget, categorised by status (Paid/Unpaid) to provide complete financial transparency.
- **Live Check-in Monitor**: A high-performance interface for use on the day of the event, showing a real-time manifest of guest arrivals.

## The Event Planner Dashboard: A Professional Workspace

The **Event Planner Dashboard** is a high-performance environment designed for tactical execution and logistical mastery. Unlike the Owner's strategic overview, this dashboard provides planners with the granular controls needed to manage multiple "gigs" simultaneously.

### 1. Gig Management & Intake
The dashboard serves as the planner's primary business interface:
- **Invitation Hub**: A centralized location to review, accept, or decline job offers from event owners. 
- **Conflict Detection**: The system intelligently flags date clashes when accepting new gigs, protecting the planner's professional schedule.
- **Active Gigs Portfolio**: A specialized sidebar allowing planners to jump between their accepted events, with each view tailored to that specific project's requirements.

### 2. AI-Assisted Creative Drafting
Planners leverage Eni to handle complex creative logic:
- **Program & Menu Architects**: Specialized builders that allow planners to generate intelligent first drafts of event programs and menus based on event type, cuisine style, and MC requirements.
- **Interactive Mood Board**: A visual workspace where planners can curate themes and receive AI-generated design suggestions to refine the event's aesthetic.
- **Stationery Hub**: Full access to the Invitation Studio to manage the event's branding on behalf of the owner.

### 3. Detailed Operational Control
The "engine room" of the dashboard includes precision tools for every stage of planning:
- **Interactive Seating Chart**: A drag-and-drop designer for arranging guests at tables, with real-time feedback on capacity and category placement.
- **The Task Board**: A full Kanban-style board for tracking the event's to-do list, allowing planners to assign tasks to team members and monitor progress.
- **Budget & Expense Logger**: The authoritative source for financial tracking, where planners log expenses and categorize payments to maintain transparency for the host.

### 4. Marketplace & Network Integration
The dashboard bridges the gap between discovery and contracting:
- **Vendor Marketplace Hub**: Advanced search tools to find, vet, and bookmark professionals.
- **Network Management**: A "My Network" contact repository for storing and managing trusted vendor relationships across different events.
- **Contract Management**: A specialized pipeline for sending formal proposals to vendors and tracking their acceptance status.

### 5. Live Event Execution
On the day of the event, the dashboard transforms into an operational monitor:
- **Security & Check-in Roster**: Management of the on-site security team, including the generation of unique scanner activation codes.
- **Manual Check-in Tool**: A search-and-verify interface for handling VIP arrivals or guests without digital passes.
- **Live Check-in Monitor**: A high-speed manifest showing real-time arrivals, sorted by category and arrival time.

In summary, the Event Planner Dashboard is a comprehensive "Event OS," providing the professional planner with every tool needed to transition from initial concept to a perfectly executed reality.

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

## The Marketplace: Hotel Accommodations

The **"Find a Hotel"** feature is a core logistical pillar of the EvenTide Marketplace, designed to provide seamless lodging solutions for event attendees and planning teams.

### Geographical Discovery
The Hotel Marketplace (`/resources/hotels`) is built for localized discovery. It features a robust search interface that allows users to filter accommodations by **Nigerian State and City**. This ensures that guests can find high-quality stays within minutes of their event venue, reducing travel friction and enhancing the overall celebration experience.

### The Hotel Storefront Experience
Each listing in the marketplace serves as a professional storefront for "Hoteliers." The hotel detail page provides:
- **Rich Media**: High-definition image carousels showcasing the property's exterior and interior.
- **Detailed Inventory**: A breakdown of specific room types (e.g., Standard Double, Executive Suite) with associated pricing and guest capacity.
- **Amenity Index**: Clear icons indicating essential services such as Wi-Fi, Air Conditioning, Pool, and Gym facilities.

### The Secure Booking Pipeline
The system employs a guided, secure booking request flow:
1.  **Selection**: The user identifies a desired room type and enters the booking dialog.
2.  **Date Validation**: An interactive calendar allows the user to select their check-in and check-out dates. The system prevents the selection of past dates and ensures a valid date range is provided.
3.  **Real-Time Pricing**: As dates are selected, the system automatically calculates the total rental price based on the number of nights, providing immediate financial transparency.
4.  **Request Submission**: Submitting the form creates a secure, non-blocking record in the `bookings` collection. This initiates a real-time notification to the property owner.

### Integrated Management
For property owners, this feature is tightly integrated with the **Hotelier Dashboard**. From there, they can manage their listings, view a unified booking calendar, and officially "Confirm" or "Decline" incoming requests, keeping the entire transactional lifecycle within the EvenTide ecosystem.

## The Marketplace: Venue Discovery & Booking

The **"Find a Venue"** feature is the cornerstone of EvenTide's event logistics, providing a centralized hub for discovering and securing high-quality spaces for any celebration.

### Smart Geographical Filtering
The Venue Marketplace (`/resources/venues`) leverages a robust filtering system. Users can search by **Nigerian State and City**, ensuring that planners can find the perfect hall or garden within their desired locale. This localized approach is created for managing guest logistics and coordinating with local vendors.

### The Venue Storefront Experience
Each venue listing acts as a comprehensive digital storefront for "Hall Owners." The detail page provides:
- **High-Fidelity Media**: A carousel of high-resolution images showcasing the venue's entrance, main hall, and unique architectural features.
- **Capacity & Scale**: A prominent badge indicates the venue's guest capacity, helping planners immediately vet spaces based on their event's scale.
- **Technical Index**: A detailed breakdown of available amenities (e.g., Parking, Power Backup, AC) and specific features (e.g., Built-in Stage, Sound System, VIP Lounge).

### The Guided Booking Request Flow
The platform facilitates a professional, multi-stage booking request process:
1.  **Event Context**: The user provides their event's name and estimated guest count.
2.  **Date Availability**: An interactive calendar allows the user to select their desired event date. The system automatically restricts selections to future dates.
3.  **Atomic Submission**: Submitting the request initiates a secure, non-blocking write to the `venueBookings` collection. This creates a unified record that is instantly visible to both the requester and the Hall Owner.
4.  **Real-Time Notification**: The Hall Owner receives an immediate notification, allowing them to review the request alongside their existing booking calendar.

### Hall Owner Integration
This marketplace is the primary revenue engine for Hall Owners. Through their dedicated **Hall Owner Dashboard**, they can manage their public listings, monitor incoming requests, and officially "Confirm" or "Decline" bookings, ensuring their calendar is always accurate and their business is managed efficiently.

## The Marketplace: Car Hire Services

The **"Find a Car"** feature is EvenTide's solution for premium event transportation, ensuring that hosts, VIPs, and attendees can arrange grand arrivals and seamless logistical support.

### The Fleet Discovery Hub
The Car Marketplace (`/resources/cars`) serves as a public gallery for "Car Hire Services" to showcase their available vehicles. It features a high-performance search interface that allows users to filter the fleet by **Make, Model, or Year**. This ensures that users can find the specific aesthetic or functional vehicle required for their occasion—from luxury sedans for bridal parties to robust SUVs for guest shuttles.

### The Vehicle Storefront Experience
Each vehicle listing provides a comprehensive overview designed to build trust and facilitate quick decision-making:
- **Multi-Angle Visuals**: High-resolution image carousels allowing users to inspect the vehicle's interior and exterior.
- **Feature Index**: A clear list of vehicle specifications such as Air Conditioning, Automatic Transmission, Bluetooth connectivity, and leather interiors.
- **Transparent Daily Rates**: A prominent badge displays the price per day, allowing for immediate budget assessment.

### The Secure Rental Pipeline
The system facilitates a professional, automated booking request flow:
1.  **Date Range Selection**: Using an interactive calendar, users select their required pickup and return dates. The system prevents the selection of past dates and ensures a valid rental duration.
2.  **Automated Price Calculation**: As dates are selected, the system instantly calculates the total rental cost based on the number of days, providing complete financial clarity before the request is sent.
3.  **Atomic Request Submission**: Submitting the request creates a secure record in the `carBookings` collection. This record includes the client's email, the specific vehicle, and the requested dates.
4.  **Real-Time Engagement**: The service provider receives an instant notification via their dashboard, allowing them to officially "Confirm" or "Decline" the request based on their current fleet availability.

### Service Provider Integration
This marketplace is the primary business interface for car hire companies. Through their dedicated **Car Hire Dashboard**, they can manage their public fleet listings, track incoming requests, and view a unified booking calendar, keeping their operations organized and professional within the EvenTide ecosystem.

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
Recognising the diverse ecosystem of event management, a specialized section details the specific benefits for every participant:
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

## Advertisement & Sponsorship Opportunities

EvenTide provides a professional avenue for brands, vendors, and service providers to showcase their offerings to a curated community of event owners and professionals.

### The Proposal Gateway
Prospective partners can access the **Advertise with Us** page (`/advertise`) to submit a formal sponsorship proposal. The system uses a dedicated, validated intake form to capture:
- **Partner Identity**: Business name and primary contact details.
- **Campaign Intent**: A concise subject line for the campaign.
- **Creative Concept**: A detailed description of the advertising idea, intended target audience, and desired placement.

### Administrative Vetting & Oversight
Submitting a proposal initiates a secure workflow in the **Firestore** database, creating a record in the `adRequests` collection with a `pending` status. 
- **Centralized Review**: These requests are instantly visible to **Content Admins** via their administrative dashboard.
- **Status Management**: Admins can review the detailed concepts and officially **Approve** or **Reject** the proposals.
- **Security & Integrity**: The system enforces strict security rules, ensuring that only authenticated users can submit requests and only authorized admins can modify their status.

### Integrated Placement
Once a proposal is approved, it becomes a candidate for strategic placement within the EvenTide ecosystem:
- **Magazine Integration**: Approved sponsors are featured in the "Internal Advertisement" section of the **EvenTide Community Magazine**, where Eni (the AI Editor-in-Chief) incorporates the brand concept into the magazine's poetic and sophisticated layout.
- **Dashboard Visibility**: Top-tier partners may be highlighted in specialized sections of the Owner and Planner dashboards, providing maximum visibility at the point of decision-making.

## Resources: Share Your Experience (Testimonials)

The **Submit a Testimonial** page (`/resources/submit-testimonial`) is a vital component of EvenTide’s community-building efforts, providing a space for users to voice their success stories and professional feedback.

### User Interaction
The page features a focused, validated form that collects:
- **Identity**: The user's name or brand name.
- **Platform Perspective**: A role selection (Owner, Planner, Vendor, or Guest) that provides context to the feedback.
- **The Narrative**: A detailed testimonial describing how EvenTide impacted their event or workflow.

### The Moderation Pipeline
Testimonials are not automatically published. Instead, they enter a structured moderation workflow:
1.  **Submission**: Data is written to the `testimonials` collection with an `isApproved` flag set to `false`.
2.  **Administrative Review**: **Content Admins** access these submissions through their dedicated dashboard (`/admin/content/testimonials`).
3.  **Validation & Approval**: Admins can vet the feedback for authenticity and tone. Approved testimonials are then dynamically surfaced in the social proof section of the platform’s landing page.

### Technical Integrity
The form uses **React Hook Form** and **Zod** for robust client-side validation, ensuring that all submissions are complete and meaningful. The integration with EvenTide’s global error-handling architecture ensures that any database issues are contextualized and surfaced for rapid resolution.

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
Once the "people" foundation is set, the system directs the user to the **Stationery Hub**. This is the creative center where the event's visual brand is finalised.
-   **Design Once, Apply Everywhere**: The user enters the **Invitation Studio**. Using the colors defined in the wizard, the user establishes a "Master Theme."
-   **Eni's Creative Input**: The user can choose from a gallery of templates or provide a text prompt to **Eni**, who uses AI to generate a unique, stunning background design.
-   **Global Synchronization**: Once the master invitation background and typography are saved, the system **automatically propagates** these design choices across all other event cards: the Digital Gate Pass, the Program Card, and the Menu.

### Phase 4: Final Previews & Completion
The journey concludes with a series of high-fidelity previews:
1.  **Gate Pass Preview**: Seeing the scannable digital ticket guests will use.
2.  **Program & Menu Previews**: Reviewing the layouts that will eventually be filled with content by the Planner.
3.  **Completion**: The cycle ends on a celebratory page with a visual "fireworks" effect, marking the transition from "Setup" to "Active Management."

This structured lifecycle ensures that every Event Owner, regardless of their technical or design background, can launch a professional, branded, and operationally ready event in minutes.
