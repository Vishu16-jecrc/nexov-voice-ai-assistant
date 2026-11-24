import React from 'react';
import { MapPin, Search } from 'lucide-react';

interface HeroSearchProps {
  location: string;
  setLocation: (loc: string) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

export const HeroSearch: React.FC<HeroSearchProps> = ({
  location,
  setLocation,
  searchTerm,
  setSearchTerm,
}) => {
  return (
    <div className="w-full max-w-4xl mx-auto my-6 px-4">
      <div className="bg-white border border-zinc-300 rounded-lg shadow-sm flex flex-col md:flex-row items-stretch divide-y md:divide-y-0 md:divide-x divide-zinc-200 overflow-hidden">
        
        {/* Location Box */}
        <div className="flex items-center px-4 py-3 md:w-1/3 bg-white">
          <MapPin className="w-4 h-4 text-zinc-500 mr-2 flex-shrink-0" />
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Select location"
            className="w-full text-sm text-zinc-800 placeholder-zinc-400 focus:outline-none bg-transparent"
          />
        </div>

        {/* Search Query Box */}
        <div className="flex items-center px-4 py-3 flex-1 bg-white">
          <Search className="w-4 h-4 text-zinc-400 mr-2 flex-shrink-0" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search doctors, clinics, specialties, or phone..."
            className="w-full text-sm text-zinc-800 placeholder-zinc-400 focus:outline-none bg-transparent"
          />
        </div>

      </div>
    </div>
  );
};
