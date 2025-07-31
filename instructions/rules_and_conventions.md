# Rules and Conventions

## Code Style

### JavaScript/React
- Use functional components with hooks
- Use ES6+ syntax when possible
- Use destructuring for props and state
- Import React components and hooks at the top of files

### CSS/Styling
- Use Tailwind CSS for styling
- Follow the brand color scheme: #FF7A00 (brand orange)
- Use the Inter font family from Google Fonts
- Background colors: white, gray-50
- Text colors: gray-800 for regular text
- Components should have rounded corners (rounded-md or rounded-xl)
- Use shadow-md for card components

## File Structure
- All React components are in the `/src` directory
- Reusable UI components are in `/src/components`
- ShadCN-style components are in `/src/components/ui`
- Form step components are in `/src/components/appointment`
- Page components are in `/src/pages`
- Utility functions are in `/src/lib`
- Mock data is in `/src/data`

## Environment Configuration
- Use `.env` file for environment variables
- Environment variables should be prefixed with `VITE_`
- Configuration files use CommonJS format with `.cjs` extensions
  - `postcss.config.cjs`
  - `tailwind.config.cjs`

## UI/UX Guidelines
- Navigation is icon-based:
  - Desktop: fixed left sidebar
  - Mobile: bottom navigation bar
- Cards should be white with shadow-md and rounded corners
- Buttons should follow the shadcn style with appropriate variants
- Use Lucide React for icons throughout the application
- Form inputs should have proper labels and validation

## Multi-step Form Structure
- The appointment form follows a 3-step structure:
  1. Personal Information (name, address, contact details)
  2. Product Selection (window/door products)
  3. Date & Time (scheduling)
- Each step is implemented as a separate component in `/src/components/appointment`
- Parent component (`NewAppointment.jsx`) handles step navigation and state coordination
- Form validation uses Formik with Yup validation schemas
- Form state is synchronized with global AppContext in real-time
- Form data should ONLY be reset after form submission or when leaving the appointment page
- Form data should NOT be stored in localStorage, only use AppContext

## Data Management
- Always use DataContext instead of mockData for accessing server data
- Ensure proper data fetching with controlled behavior
- Use dataFetched flags to prevent repeated API calls
- Avoid infinite data fetching loops by:
  - Using useCallback for data fetch functions
  - Setting proper dependency arrays in useEffect
  - Implementing fetch control flags

## React Hooks Guidelines
- Always place all React hooks at the top level of components
- Never use hooks inside conditionals, loops, or nested functions
- Keep solutions simple and avoid overcomplicating component logic
- Use proper dependency arrays in useEffect, useCallback, and useMemo

## Authentication
- Admin page is protected with username/password
- Authentication state is stored in localStorage
- Default credentials are stored in environment variables:
  - `VITE_ADMIN_USERNAME`
  - `VITE_ADMIN_PASSWORD`

## Routing
- Use React Router v6 for navigation
- Define routes in App.jsx
- Protected routes require authentication

## Lessons Learned

### Data Fetching & State Management
- **Avoid Infinite Loops**: Non-memoized functions in dependency arrays cause infinite renders
- **Prevent Excessive API Calls**: Always implement fetch control flags (`dataFetched`) 
- **Consistent Error Handling**: Every data fetch operation should have proper loading and error states with user feedback
- **Variable Naming**: Use distinct variable names to avoid confusion (e.g., don't use `error` for both form and data fetch errors)

### React Hooks & Component Lifecycle
- **Hook Placement**: Placing hooks conditionally causes runtime errors and unpredictable behavior
- **Component Unmounting**: Be extremely careful with cleanup functions in useEffect to prevent premature state resets
- **Console Logging**: Add strategic console logs to trace component mounting/unmounting and data fetching

### Form State Management
- **Decoupled Reset Logic**: Form reset should be tied to specific events, not component lifecycle
- **State Synchronization**: When using both local state and context, update them consistently
- **Object References**: Converting IDs to objects requires careful error handling and fallback mechanisms
- **Avoid Overcomplicated Solutions**: Simple approaches are less error-prone than complex ones
- NotFound page for unmatched routes
