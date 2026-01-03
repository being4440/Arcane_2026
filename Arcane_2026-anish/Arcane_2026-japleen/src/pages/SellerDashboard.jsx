import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import Navigation from '@/components/Navigation';
import AddMaterialForm from '@/components/AddMaterialForm';
import MaterialCard from '@/components/MaterialCard';
import { Button } from '@/components/ui/button';

const SellerDashboard = ({ onNavigate, onLogout, onAddMaterial, materials }) => {
  const [showAddForm, setShowAddForm] = useState(false);

  const handleAddMaterial = (materialData) => {
    onAddMaterial({ ...materialData, seller: 'Current User' });
    setShowAddForm(false);
  };

  return (
    <>
      <Helmet>
        <title>Seller Dashboard - UpCycle Connect</title>
        <meta name="description" content="Manage your material listings, add new surplus materials, and track your sales on UpCycle Connect." />
      </Helmet>

      <div className="min-h-screen bg-[#0F1A17]">
        <Navigation onNavigate={onNavigate} currentPage="seller-dashboard" onLogout={onLogout} userRole="seller" />
        
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Seller Dashboard</h1>
              <p className="text-gray-300">Manage your material listings</p>
            </div>
            <Button
              onClick={() => setShowAddForm(!showAddForm)}
              className="bg-[#3FA37C] hover:bg-[#358F6A] text-white px-6 py-3 rounded-xl transition-all hover:scale-105 hover:shadow-lg"
            >
              <Plus className="mr-2" />
              {showAddForm ? 'Cancel' : 'Add Material'}
            </Button>
          </div>

          {showAddForm && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="mb-8"
            >
              <AddMaterialForm onSubmit={handleAddMaterial} onCancel={() => setShowAddForm(false)} />
            </motion.div>
          )}

          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white mb-4">Your Listings</h2>
            {materials.length === 0 ? (
              <div className="bg-[#1E2A26] rounded-xl p-12 text-center">
                <p className="text-gray-300 text-lg">You haven't listed any materials yet.</p>
                <p className="text-gray-400 mt-2">Click "Add Material" to create your first listing.</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {materials.map((material) => (
                  <MaterialCard key={material.id} material={material} showActions />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default SellerDashboard;