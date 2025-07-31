# Event App - Project Overview

## Project Description
Event App is a React-based web application designed to manage appointment scheduling and event bookings. The app provides an intuitive interface for users to create appointments through a multi-step form, view their dashboard with metrics, and includes an admin section for management.

## Tech Stack
- **React**: v18.3.1
- **Vite**: Used as the build tool and development server
- **Tailwind CSS**: v3.3.5 (downgraded from v4.1.11 for compatibility)
- **React Router DOM**: For page routing and navigation
- **Lucide React**: For UI icons
- **ShadCN**: Component utilities and design system

## Project Structure
```
event-app/
├── public/              # Public assets
├── src/
│   ├── components/      # Reusable UI components
│   │   ├── ui/          # ShadCN style components
│   │   └── Sidebar.jsx  # Navigation sidebar component
│   ├── lib/             # Utility functions
│   │   └── utils.js     # Common utility functions
│   ├── pages/           # Application pages/routes
│   │   ├── Admin.jsx    # Admin dashboard with password protection
│   │   ├── Home.jsx     # Main dashboard
│   │   ├── NewAppointment.jsx  # Multi-step appointment form
│   │   └── NotFound.jsx # 404 page
│   ├── App.jsx          # Main application component with routing
│   ├── main.jsx         # Application entry point
│   └── index.css        # Global CSS with Tailwind directives
├── .env                 # Environment variables
├── index.html           # HTML entry point
├── postcss.config.cjs   # PostCSS configuration
├── tailwind.config.cjs  # Tailwind CSS configuration
├── vite.config.js       # Vite configuration
└── package.json         # Project dependencies
```

## Features
1. **Dashboard** (Home page):
   - Welcome section with CTA button
   - Metrics cards displaying event statistics

2. **Appointment Creation** (Multi-step form):
   - 3-step process with visual progress indicator
   - Step 1: Personal Information
   - Step 2: Product Selection (single product only)
   - Step 3: Date & Time Selection (with LeadPerfection API integration)
   - Sweepstakes-only option that bypasses date/time selection
   - Direct submission to LeadPerfection API upon completion
   - Success dialog with confirmation message
   - Form navigation controls (next/back)

3. **Admin Panel**:
   - Password-protected access
   - Login form with validation against environment variables
   - Admin dashboard view once authenticated

4. **Responsive Design**:
   - Desktop: Fixed sidebar navigation on left
   - Mobile: Bottom navigation bar
   - Responsive layout for all screen sizes

## LeadPerfection API Integration
The app integrates with LeadPerfection API for:
- **Authentication**: Token-based authentication using `/token` endpoint
- **Forward Lookup**: Fetching available appointment dates and time slots via `/api/Leads/GetLeadsForwardLook`
- **Lead Submission**: Sending appointment data via `/api/Leads/LeadAdd`
- **CORS Handling**: Vite proxy configuration to handle cross-origin requests
- **Error Handling**: Graceful fallback if API calls fail

### API Endpoints:
- `https://api.leadperfection.com/token` - Authentication
- `https://api.leadperfection.com/api/Leads/GetLeadsForwardLook` - Available slots
- `https://api.leadperfection.com/api/Leads/LeadAdd` - Submit appointment

## Environment Variables
- `VITE_ADMIN_USERNAME`: Username for admin access (defaults to 'admin')
- `VITE_ADMIN_PASSWORD`: Password for admin access (defaults to 'securepass')
