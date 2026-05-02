import React from 'react';
import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';

const NotFoundPage = () => {
  return (
    <div className="h-screen flex flex-col items-center justify-center text-center px-6">
      <h1 className="text-9xl font-bold text-primary mb-4">404</h1>
      <h2 className="text-3xl font-bold mb-6">Oops! Page not found</h2>
      <p className="text-gray-400 max-w-md mb-10">
        The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
      </p>
      <Link to="/" className="btn-neon-primary flex items-center gap-2">
        <Home size={20} /> Back to Home
      </Link>
    </div>
  );
};

export default NotFoundPage;
