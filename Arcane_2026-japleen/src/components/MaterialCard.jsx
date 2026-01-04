import React from 'react';
import { MapPin, ArrowUpRight, Star } from 'lucide-react';

const MaterialCard = ({ material, showActions = false, sellerStats }) => {
  const getBadgeColor = (type) => {
    switch(type) {
        case 'sell': return 'bg-[#3FA37C]/20 text-[#3FA37C] border-[#3FA37C]/30';
        case 'rent': return 'bg-[#60A5FA]/20 text-[#60A5FA] border-[#60A5FA]/30';
        case 'exchange': return 'bg-[#8B5E3C]/20 text-[#8B5E3C] border-[#8B5E3C]/30';
        default: return 'bg-gray-600';
    }
  };

  return (
    <div className="bg-[#1E2A26] rounded-xl overflow-hidden border border-gray-800 hover:border-gray-600 hover:shadow-2xl hover:shadow-black/50 transition-all group h-full flex flex-col">
      <div className="relative h-48 overflow-hidden">
        <img
          src={material.images[0]}
          alt={material.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-3 right-3">
             <span className={`px-2 py-1 rounded-md text-xs font-bold uppercase border backdrop-blur-sm ${getBadgeColor(material.availability)}`}>
                {material.availability}
            </span>
        </div>
        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors" />
      </div>

      <div className="p-5 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-2">
            <div className="flex-1 mr-2">
                 <p className="text-xs text-gray-500 mb-1">{material.category}</p>
                 <h3 className="text-lg font-bold text-white line-clamp-1">{material.name}</h3>
                 
                 {!showActions && sellerStats && (
                   <div className="flex items-center gap-1 mt-1">
                      <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                      <span className="text-xs font-medium text-gray-300">
                        {sellerStats.average > 0 ? sellerStats.average.toFixed(1) : 'New'} ({sellerStats.count})
                      </span>
                   </div>
                 )}
            </div>
            {showActions && <ArrowUpRight className="text-gray-500 w-5 h-5" />}
        </div>
        
        <p className="text-gray-400 text-sm mb-4 line-clamp-2 flex-1">{material.description}</p>

        <div className="pt-4 border-t border-gray-700/50 flex justify-between items-center">
             <div className="flex items-center text-gray-500 text-xs">
                <MapPin className="w-3 h-3 mr-1" />
                {material.city || 'Unknown City'}
             </div>
             <div className="font-semibold text-white">
                {material.availability === 'sell' && `₹${material.price}`}
                {material.availability === 'rent' && `₹${material.pricePerDay}/d`}
                {material.availability === 'exchange' && 'Exchange'}
             </div>
        </div>
      </div>
    </div>
  );
};

export default MaterialCard;