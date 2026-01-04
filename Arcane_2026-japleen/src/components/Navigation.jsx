import React from 'react';
import { motion } from 'framer-motion';
import { Recycle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Navigation = ({ onNavigate, currentPage, showAuthButtons = false, user }) => {
  return (
    <nav className="absolute top-0 left-0 w-full z-50 bg-transparent py-6">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => onNavigate('landing')}
          >
            <div className="w-10 h-10 bg-[#3FA37C] rounded-xl flex items-center justify-center shadow-lg shadow-[#3FA37C]/20">
              <Recycle className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-white tracking-tight">
              UpCycle <span className="text-[#3FA37C]">Connect</span>
            </span>
          </motion.div>

          <div className="flex items-center gap-6">
            {/* Reviews only visible if user is logged in */}
            {user && (
              <button 
                  onClick={() => onNavigate('reviews')}
                  className="text-gray-300 hover:text-[#3FA37C] font-medium transition-colors hidden sm:block"
              >
                  Reviews
              </button>
            )}

            {showAuthButtons && (
                <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-4"
                >
                <Button 
                    onClick={() => onNavigate('auth')}
                    variant="ghost"
                    className="text-gray-300 hover:text-white hidden sm:inline-flex"
                >
                    Log In
                </Button>
                <Button 
                    onClick={() => onNavigate('auth')}
                    className="bg-[#1E2A26] hover:bg-[#2C3E37] text-[#3FA37C] border border-[#3FA37C]/30 rounded-lg"
                >
                    Register
                </Button>
                </motion.div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;