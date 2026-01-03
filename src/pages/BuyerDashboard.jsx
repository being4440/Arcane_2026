import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Search, MapPin } from 'lucide-react';
import Navigation from '@/components/Navigation';
import MaterialCard from '@/components/MaterialCard';
import MapView from '@/components/MapView';

const BuyerDashboard = ({ onNavigate, onLogout, materials }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showMap, setShowMap] = useState(false);

  const categories = ['all', 'Wood', 'Metal', 'Ceramic', 'Plastic', 'Glass', 'Others'];

  const filteredMaterials = materials.filter(material => {
    const matchesSearch = material.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         material.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || material.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <>
      <Helmet>
        <title>Buyer Dashboard - UpCycle Connect</title>
        <meta name="description" content="Browse available surplus construction materials, find deals, and connect with sellers on UpCycle Connect." />
      </Helmet>

      <div className="min-h-screen bg-[#0F1A17]">
        <Navigation onNavigate={onNavigate} currentPage="buyer-dashboard" onLogout={onLogout} userRole="buyer" />
        
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">Browse Materials</h1>
            <p className="text-gray-300">Find sustainable materials for your next project</p>
          </div>

          {/* Search and Filters */}
          <div className="bg-[#1E2A26] rounded-xl p-6 mb-8">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search materials..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-[#0F1A17] text-white rounded-lg border border-gray-700 focus:border-[#3FA37C] focus:outline-none transition-colors"
                />
              </div>
              <div className="flex gap-2 overflow-x-auto">
                {categories.map(category => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
                      selectedCategory === category
                        ? 'bg-[#3FA37C] text-white'
                        : 'bg-[#0F1A17] text-gray-300 hover:bg-[#3FA37C] hover:text-white'
                    }`}
                  >
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setShowMap(!showMap)}
                className={`px-6 py-3 rounded-lg transition-all flex items-center gap-2 ${
                  showMap
                    ? 'bg-[#60A5FA] text-white'
                    : 'bg-[#0F1A17] text-gray-300 hover:bg-[#60A5FA] hover:text-white'
                }`}
              >
                <MapPin className="w-5 h-5" />
                Map View
              </button>
            </div>
          </div>

          {showMap ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <MapView materials={filteredMaterials} />
            </motion.div>
          ) : (
            <>
              <div className="mb-4">
                <p className="text-gray-300">
                  Showing {filteredMaterials.length} material{filteredMaterials.length !== 1 ? 's' : ''}
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredMaterials.map((material, index) => (
                  <motion.div
                    key={material.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                  >
                    <MaterialCard material={material} />
                  </motion.div>
                ))}
              </div>

              {filteredMaterials.length === 0 && (
                <div className="bg-[#1E2A26] rounded-xl p-12 text-center">
                  <p className="text-gray-300 text-lg">No materials found matching your criteria.</p>
                  <p className="text-gray-400 mt-2">Try adjusting your search or filters.</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default BuyerDashboard;