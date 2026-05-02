import React from 'react';
import { Link } from 'react-router-dom';
import { Share2 } from 'lucide-react';

const Navbar = () => {
  const handleShare = () => {
    navigator.clipboard.writeText(window.location.origin);
    alert('Link copied to clipboard!');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-2 md:px-6 py-2 md:py-4">
      <div className="container mx-auto flex justify-between items-center glass-card px-4 md:px-6 py-2 md:py-3 border-white/5">
        <Link to="/" className="flex items-center gap-2">
          {/* <div className="w-7 h-7 md:w-8 md:h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center font-bold text-dark text-sm md:text-base shadow-[0_0_15px_rgba(0,212,255,0.3)]">
            M
          </div> */}
          <span className="text-xl md:text-2xl font-bold tracking-tight text-white">MILO</span>
          {/* <span className="hidden sm:inline-block bg-primary/20 text-primary text-[10px] px-2 py-0.5 rounded-full font-bold ml-1 border border-primary/20">BETA</span> */}
        </Link>
        
        <div className="flex items-center gap-2 md:gap-4">
          {/* <button 
            onClick={handleShare}
            className="p-2 hover:bg-white/5 rounded-full transition-colors text-gray-400 hover:text-white"
            title="Share"
          >
            <Share2 size={18} className="md:w-5 md:h-5" />
          </button> */}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
