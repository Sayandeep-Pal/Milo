import React from 'react';
import { Link } from 'react-router-dom';
import { Share2 } from 'lucide-react';

const Navbar = () => {
  const handleShare = () => {
    navigator.clipboard.writeText(window.location.origin);
    alert('Link copied to clipboard!');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4">
      <div className="container mx-auto flex justify-between items-center glass-card px-6 py-3">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center font-bold text-dark">
            M
          </div>
          <span className="text-2xl font-bold tracking-tight">MILO</span>
          <span className="bg-primary/20 text-primary text-[10px] px-2 py-0.5 rounded-full font-bold ml-2">BETA</span>
        </Link>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={handleShare}
            className="p-2 hover:bg-white/5 rounded-full transition-colors text-gray-400 hover:text-white"
          >
            <Share2 size={20} />
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
