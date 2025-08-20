import { cn } from '../../lib/utils';

// Create a button variants function similar to what shadcn UI provides
export function buttonVariants({ variant = 'default', size = 'default', className = '' }) {
  const variants = {
    default: 'bg-brand text-white hover:bg-brand/90',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300',
    outline: 'border border-gray-200 bg-white hover:bg-gray-100 hover:text-gray-800',
    ghost: 'hover:bg-gray-100 hover:text-gray-800',
  };

  const sizes = {
    default: 'h-10 py-2 px-4 rounded-md',
    sm: 'h-8 py-1 px-3 text-sm rounded-md',
    lg: 'h-12 py-3 px-6 text-lg rounded-md',
    icon: 'h-10 w-10 rounded-full p-0',
  };

  return cn(
    'inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
    variants[variant],
    sizes[size],
    className
  );
}
