import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, ZoomIn, ZoomOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

const MapView = ({ materials, onMarkerClick }) => {
  const [zoom, setZoom] = useState(1);
  const centerLat = 28.6139;
  const centerLng = 77.2090;

  return (
    <div className="relative w-full h-full bg-[#0F1A17] overflow-hidden">
        {/* Map Grid Pattern */}
        <div className="absolute inset-0 opacity-20 pointer-events-none">
            <div className="w-full h-full" style={{ 
                backgroundImage: 'linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)', 
                backgroundSize: '40px 40px' 
            }}></div>
        </div>

        {/* Map Controls */}
        <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
            <Button size="icon" variant="secondary" onClick={() => setZoom(z => Math.min(z + 0.2, 2))} className="bg-[#1E2A26] border border-gray-700 text-white hover:bg-gray-800">
                <ZoomIn className="w-4 h-4" />
            </Button>
            <Button size="icon" variant="secondary" onClick={() => setZoom(z => Math.max(z - 0.2, 0.5))} className="bg-[#1E2A26] border border-gray-700 text-white hover:bg-gray-800">
                <ZoomOut className="w-4 h-4" />
            </Button>
        </div>

        {/* Map Content */}
        <motion.div
            className="w-full h-full absolute inset-0 flex items-center justify-center"
            style={{ scale: zoom }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
             {/* Center 'You' Marker */}
             <div className="absolute z-20 flex flex-col items-center">
                 <div className="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg animate-pulse" />
                 <span className="mt-1 text-xs font-bold text-white bg-black/50 px-2 rounded-full">You</span>
             </div>

             {/* Material Pins */}
             {materials.map((material) => {
                 const offsetX = ((material.sellerLocation?.lng || centerLng) - centerLng) * 8000;
                 const offsetY = ((material.sellerLocation?.lat || centerLat) - centerLat) * 8000;

                 return (
                     <div
                        key={material.id}
                        className="absolute cursor-pointer group"
                        style={{
                            transform: `translate(${offsetX}px, ${-offsetY}px)`
                        }}
                        onClick={() => onMarkerClick(material)}
                     >
                         {/* Approximate Area Circle */}
                         <div className="absolute -inset-8 bg-[#3FA37C]/10 rounded-full border border-[#3FA37C]/20 group-hover:bg-[#3FA37C]/20 transition-colors pointer-events-none" />
                         
                         {/* Pin */}
                         <div className="relative flex flex-col items-center">
                            <MapPin className={`w-8 h-8 drop-shadow-lg ${
                                material.availability === 'sell' ? 'text-[#3FA37C]' :
                                material.availability === 'rent' ? 'text-[#60A5FA]' : 'text-[#8B5E3C]'
                            }`} fill="currentColor" />
                            
                            {/* Tooltip */}
                            <div className="absolute bottom-full mb-2 bg-[#1E2A26] border border-gray-700 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                                {material.name}
                            </div>
                         </div>
                     </div>
                 );
             })}
        </motion.div>
        
        {/* Legend */}
        <div className="absolute bottom-4 left-4 bg-[#1E2A26]/90 backdrop-blur border border-gray-700 p-3 rounded-lg z-10">
            <div className="text-xs font-semibold text-white mb-2">Availability</div>
            <div className="flex gap-4">
                <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-[#3FA37C]" /><span className="text-xs text-gray-300">Sell</span></div>
                <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-[#60A5FA]" /><span className="text-xs text-gray-300">Rent</span></div>
                <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-[#8B5E3C]" /><span className="text-xs text-gray-300">Exchange</span></div>
            </div>
        </div>
    </div>
  );
};

export default MapView;