# Windows Direct Event App

A modern React-based appointment booking and event management application with LeadPerfection API integration.

## Features

### 🏠 Dashboard
- Clean, responsive homepage with Windows Direct USA branding
- Real-time active events counter from Supabase
- Quick appointment creation access

### 📅 Appointment Booking
- **3-step appointment flow**:
  1. Personal Information (name, contact details)
  2. Product Selection (single product selection)
  3. Date & Time Selection (LeadPerfection API integration)
- **Sweepstakes-only option** that bypasses date/time selection
- **Real-time availability** fetched from LeadPerfection API
- **Success confirmation** with custom dialog

### 🔗 LeadPerfection Integration
- **Token-based authentication** with LeadPerfection API
- **Forward lookup** for available appointment slots
- **Automatic lead submission** upon appointment completion
- **CORS handling** via Vite proxy configuration

### 👨‍💼 Admin Dashboard
- Password-protected admin access
- Event, product, and staff management
- Custom delete confirmation dialogs
- Responsive design for all screen sizes

### 📱 Mobile-First Design
- Floating mobile navigation dock
- Responsive layouts for all components
- Centered content on mobile, left-aligned on desktop
- Touch-friendly interface elements

## Tech Stack

- **React** 18.3.1 - Frontend framework
- **Vite** - Build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **React Router DOM** - Client-side routing
- **Supabase** - Backend database and authentication
- **LeadPerfection API** - Lead management integration
- **Lucide React** - Icon library
- **ShadCN/UI** - Component library

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd event-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   # Admin Credentials
   VITE_ADMIN_USERNAME=admin
   VITE_ADMIN_PASSWORD=securepass
   
   # Supabase Configuration
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_KEY=your_supabase_key
   
   # LeadPerfection Configuration
   VITE_LEAD_PERFECTION_APP_KEY=your_leadperfection_app_key
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Build for production**
   ```bash
   npm run build
   ```

## Project Structure

```
event-app/
├── public/                 # Static assets
├── src/
│   ├── components/         # Reusable UI components
│   │   ├── ui/            # ShadCN/UI components
│   │   ├── admin/         # Admin-specific components
│   │   └── appointment/   # Appointment flow components
│   ├── context/           # React context providers
│   ├── lib/               # Utility functions
│   ├── pages/             # Application pages
│   ├── services/          # API services
│   └── config/            # Configuration files
├── instructions/          # Project documentation
└── dist/                  # Production build output
```

## API Integration

### LeadPerfection Endpoints
- **Authentication**: `https://api.leadperfection.com/token`
- **Forward Lookup**: `https://api.leadperfection.com/api/Leads/GetLeadsForwardLook`
- **Lead Submission**: `https://api.leadperfection.com/api/Leads/LeadAdd`

### Supabase Integration
- Event management and storage
- Product and staff data
- Real-time active events counter

## Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Key Features Implementation
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **State Management**: React Context API for global state
- **API Integration**: Custom services for LeadPerfection and Supabase
- **Error Handling**: Comprehensive error boundaries and fallbacks
- **Loading States**: User-friendly loading indicators

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is proprietary software for Windows Direct USA.

## Support

For support and questions, please refer to the documentation in the `/instructions` folder or contact the development team.
