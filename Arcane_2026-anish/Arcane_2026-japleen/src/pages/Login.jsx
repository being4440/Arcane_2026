import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { User, Building2, Shield } from 'lucide-react';
import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/button';

const Login = ({ onLogin, onNavigate }) => {
  const [selectedRole, setSelectedRole] = useState(null);

  const roles = [
    {
      id: 'buyer',
      title: 'Buyer',
      icon: User,
      description: 'Browse and purchase surplus materials',
      color: '#60A5FA'
    },
    {
      id: 'seller',
      title: 'Seller',
      icon: Building2,
      description: 'List your surplus materials for sale, rent, or exchange',
      color: '#3FA37C'
    },
    {
      id: 'admin',
      title: 'Admin',
      icon: Shield,
      description: 'Manage platform and oversee transactions',
      color: '#8B5E3C'
    }
  ];

  const handleRoleSelect = (roleId) => {
    setSelectedRole(roleId);
  };

  const handleLogin = () => {
    if (selectedRole) {
      onLogin(selectedRole);
    }
  };

  return (
    <>
      <Helmet>
        <title>Login - UpCycle Connect</title>
        <meta name="description" content="Login to UpCycle Connect as a buyer, seller, or admin to access the sustainable material exchange platform." />
      </Helmet>

      <div className="min-h-screen bg-[#0F1A17]">
        <Navigation onNavigate={onNavigate} currentPage="login" />
        
        <div className="container mx-auto px-4 py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 text-center">
              Select Your Role
            </h1>
            <p className="text-xl text-gray-300 mb-12 text-center">
              Choose how you'd like to use UpCycle Connect
            </p>

            <div className="grid md:grid-cols-3 gap-6 mb-8">
              {roles.map((role, index) => {
                const Icon = role.icon;
                return (
                  <motion.div
                    key={role.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    onClick={() => handleRoleSelect(role.id)}
                    className={`bg-[#1E2A26] p-8 rounded-xl cursor-pointer transition-all hover:scale-105 ${
                      selectedRole === role.id
                        ? 'ring-2 ring-offset-2 ring-offset-[#0F1A17] shadow-xl'
                        : 'hover:shadow-lg'
                    }`}
                    style={{
                      ringColor: selectedRole === role.id ? role.color : 'transparent'
                    }}
                  >
                    <div
                      className="w-16 h-16 rounded-lg flex items-center justify-center mb-4"
                      style={{ backgroundColor: role.color }}
                    >
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-3">{role.title}</h3>
                    <p className="text-gray-300">{role.description}</p>
                  </motion.div>
                );
              })}
            </div>

            <div className="text-center">
              <Button
                onClick={handleLogin}
                disabled={!selectedRole}
                className="bg-[#3FA37C] hover:bg-[#358F6A] text-white px-12 py-6 text-lg rounded-xl transition-all hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                Continue as {selectedRole ? roles.find(r => r.id === selectedRole)?.title : 'User'}
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default Login;