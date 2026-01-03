import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Package, Users, TrendingUp, DollarSign } from 'lucide-react';
import Navigation from '@/components/Navigation';
import { useToast } from '@/components/ui/use-toast';

const AdminDashboard = ({ onNavigate, onLogout, materials }) => {
  const { toast } = useToast();

  const stats = [
    {
      title: 'Total Materials',
      value: materials.length,
      icon: Package,
      color: '#3FA37C'
    },
    {
      title: 'Active Sellers',
      value: new Set(materials.map(m => m.seller)).size,
      icon: Users,
      color: '#60A5FA'
    },
    {
      title: 'Total Value',
      value: `₹${materials.reduce((sum, m) => sum + (m.price || 0), 0).toLocaleString()}`,
      icon: DollarSign,
      color: '#8B5E3C'
    },
    {
      title: 'Growth',
      value: '+24%',
      icon: TrendingUp,
      color: '#3FA37C'
    }
  ];

  const handleFeatureClick = () => {
    toast({
      title: "Feature Coming Soon",
      description: "🚧 This feature isn't implemented yet—but don't worry! You can request it in your next prompt! 🚀"
    });
  };

  return (
    <>
      <Helmet>
        <title>Admin Dashboard - UpCycle Connect</title>
        <meta name="description" content="Manage the UpCycle Connect platform, monitor transactions, and oversee user activities." />
      </Helmet>

      <div className="min-h-screen bg-[#0F1A17]">
        <Navigation onNavigate={onNavigate} currentPage="admin-dashboard" onLogout={onLogout} userRole="admin" />
        
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">Admin Dashboard</h1>
            <p className="text-gray-300">Platform overview and management</p>
          </div>

          {/* Stats Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="bg-[#1E2A26] p-6 rounded-xl hover:scale-105 transition-all hover:shadow-xl"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className="w-12 h-12 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: stat.color }}
                    >
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <h3 className="text-gray-400 text-sm mb-1">{stat.title}</h3>
                  <p className="text-3xl font-bold text-white">{stat.value}</p>
                </motion.div>
              );
            })}
          </div>

          {/* Recent Activity */}
          <div className="bg-[#1E2A26] rounded-xl p-6 mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">Recent Activity</h2>
            <div className="space-y-4">
              {materials.slice(0, 5).map((material, index) => (
                <motion.div
                  key={material.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="flex items-center justify-between p-4 bg-[#0F1A17] rounded-lg hover:bg-opacity-80 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={material.images[0]}
                      alt={material.name}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                    <div>
                      <p className="text-white font-semibold">{material.name}</p>
                      <p className="text-gray-400 text-sm">{material.seller}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[#3FA37C] font-semibold">
                      {material.availability === 'sell' ? `₹${material.price}` : material.availability}
                    </p>
                    <p className="text-gray-400 text-sm">{material.category}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Management Actions */}
          <div className="grid md:grid-cols-3 gap-6">
            <button
              onClick={handleFeatureClick}
              className="bg-[#1E2A26] p-6 rounded-xl hover:scale-105 transition-all hover:shadow-xl text-left"
            >
              <h3 className="text-xl font-bold text-white mb-2">Manage Users</h3>
              <p className="text-gray-400">View and manage user accounts</p>
            </button>
            <button
              onClick={handleFeatureClick}
              className="bg-[#1E2A26] p-6 rounded-xl hover:scale-105 transition-all hover:shadow-xl text-left"
            >
              <h3 className="text-xl font-bold text-white mb-2">Transaction History</h3>
              <p className="text-gray-400">Review all platform transactions</p>
            </button>
            <button
              onClick={handleFeatureClick}
              className="bg-[#1E2A26] p-6 rounded-xl hover:scale-105 transition-all hover:shadow-xl text-left"
            >
              <h3 className="text-xl font-bold text-white mb-2">Platform Settings</h3>
              <p className="text-gray-400">Configure platform parameters</p>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;