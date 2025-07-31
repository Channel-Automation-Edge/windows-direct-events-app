import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Home } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)]">
      <h1 className="text-6xl font-bold text-gray-800 mb-4">404</h1>
      <p className="text-xl mb-8">Page not found</p>
      <Link to="/">
        <Button className="gap-2">
          <Home size={18} />
          Return Home
        </Button>
      </Link>
    </div>
  );
};

export default NotFound;
