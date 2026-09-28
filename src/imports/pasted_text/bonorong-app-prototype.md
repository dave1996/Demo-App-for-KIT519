Act as a Senior UI/UX Designer and Frontend Engineer specializing in Human-Computer Interaction (HCI) and Mobile App Development.

Create a fully interactive, responsive, high-fidelity mobile application prototype for "Bonorong Wildlife Sanctuary" (Tasmania, Australia) in a single-file React + Tailwind CSS + Lucide Icons component (or standalone HTML/Tailwind/JS).

### 1. Context & User Workflow
- Target User: Emma (Mum with 2 kids, Lily 8 and Jack 5, medium tech ability).
- Scenario/Goal: Searching for the Wombat, checking feeding times/enclosure location, and generating an accessible visit route.
- Core Flow:
  [Home Dashboard] -> [Search / Explore Animals] -> [Wombat Detail Modal/Card with Feeding Times] -> [Interactive Map with Real-Time Route] -> [Plan Visit & Accessibility Customizer].

### 2. Design System & Visual Standards
- Platform: Mobile App (iPhone 15 Pro frame / 393px × 852px viewport).
- Brand Theme: Australian Wildlife & Nature Conservation:
  - Primary Brand Color: Deep Forest Green (#1B4D3E)
  - Secondary Accent: Warm Terracotta / Sand Ochre (#D97736 or #E28743)
  - Neutral Light Background: Cream Off-White (#F8F9FA / #F4F0E6)
  - Text: Slate 900 (#0F172A) for headings, Slate 600 (#475569) for body.
  - Alert/Status: Amber Yellow (#F59E0B) for Weather Alerts, Green (#10B981) for Active/Open Enclosures.
- Typography: Clean sans-serif (Inter or DM Sans), generous touch targets (min 44px for WCAG 2.1 AA mobile compliance).
- Visual Elements: Rounded modern cards (border-radius: 16px to 24px), subtle box shadows, badges for "Best Time to Visit" and "Step-free Route".

### 3. Required Screens & Interactive State Machine
Implement a seamless bottom navigation bar (`Home`, `Explore Map`, `Plan Visit`, `Info`) and the following synchronized states:

#### Screen 1: Home Dashboard (`state = 'home'`)
- Top Bar: Sanctuary greeting ("Welcome to Bonorong!"), Current Park Status ("Open Today: 9:00 AM - 5:00 PM"), Weather Widget ("Sunny 18°C • Light Breeze").
- Active Alert Banner: Dismissible/informative badge (e.g. "Daily Wildlife Talk starting in 20 mins").
- Quick Action Hero Cards:
  1. "Explore Interactive Map" (with preview thumbnail & icon) -> Clicking switches to Map screen.
  2. "Plan My Visit" (Personalized itinerary builder) -> Switches to Plan screen.
- Fast Animal Search Bar: Prominent search input with placeholder "Search animals (e.g. Wombat, Devil)..." and quick category chips (`Wombat`, `Tasmanian Devil`, `Koala`, `Kangaroos`).
- Secondary Grid: "Today's Schedule & Feeding Talks", "Conservation & Donate".

#### Screen 2: Interactive Park Map & Animal Locator (`state = 'map'`)
- Top Overlay: Live search bar with instant autocomplete filter + Filter buttons (`All`, `Mammals`, `Birds`, `Facilities/Cafe`, `Accessible`).
- Interactive Map View:
  - Stylized sanctuary layout with labeled zones (Entrance, Wombat Enclosure, Tasmanian Devil Den, Kangaroo Feeding Ground, Cafe/Restrooms).
  - Pulse pin on "You are here" (near Entrance).
  - Animal Enclosure Pins: Interactive clickable markers with animal avatars and names.
  - Active Route Overlay: When route is active, show an animated/dashed trail with walking time estimate ("4 min walk • 280m • Step-Free Path").
- Bottom Slide-Up Sheet / Animal Detail Modal (Triggers when clicking Wombat or searching Wombat):
  - High-res animal photo thumbnail & title: "Common Wombat (Vombatus ursinus)".
  - Next Feeding / Keeper Talk: "2:00 PM (In 25 mins)".
  - Location Info: "Enclosure B4 (Upper Grasslands)".
  - Accessibility Tags: "Pram Friendly", "Shaded Seating Available".
  - Action Button: "Start Guided Route to Wombat" (Draws active highlighted route on the map).

#### Screen 3: "Plan Your Visit" Customizer (`state = 'plan'`)
- Duration Selector: Interactive buttons / dropdown for available time (`1 Hour Express`, `2 Hours Recommended`, `Half Day`).
- Multi-Select Animal Checklist: Grid of animal cards with checkboxes (Wombat, Tasmanian Devil, Quokka, Koala, Tawny Frogmouth).
- Accessibility & Family Preferences (Checkboxes/Toggles):
  - [x] Step-free / Stroller & Wheelchair Accessible Route
  - [x] Shaded Rest Stops
  - [x] Shorter Walking Distance
- Primary CTA: "Generate Optimal Family Route" -> Generates the optimized itinerary and automatically transitions to Map view with sequential checkpoints (1 -> 2 -> 3).

### 4. HCI & Usability Principles to Explicitly Demonstrate
1. Visibility of System Status (Nielsen #1): Live breadcrumbs, active state highlighting on bottom navigation, walking time/distance indicators.
2. Match between System and Real World (Nielsen #2): Map orientation matching real-world sanctuary landmarks, clear iconography (Paw, Compass, Calendar, Stroller).
3. Flexibility and Efficiency of Use (Nielsen #7): Direct search from Home OR interactive exploration directly on Map.
4. Error Prevention & Clear Feedback (Nielsen #5): Empty search states offering recommended popular animals; confirmation toast notifications when routes are created.
5. Accessibility & Inclusivity (WCAG 2.1 AA): 4.5:1 text contrast ratio, clear labels, step-free navigation filter for families with prams.

### 5. Technical Output Requirements
- Ensure full interactive switching between tabs and interactive modal opening/closing without any page refresh.
- Map markers must be clickable to reveal bottom sheet details.
- Provide a responsive layout that looks like a real iOS mobile device with realistic mockup borders.
