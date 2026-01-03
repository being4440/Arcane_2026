import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Recycle, Users, TrendingUp, ArrowRight } from 'lucide-react';
import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/button';

const Homepage = ({ onNavigate }) => {
  return (
    <>
      <Helmet>
        <title>UpCycle Connect - Sustainable Material Exchange Platform</title>
        <meta name="description" content="Connect buyers and sellers of surplus construction materials. Promote sustainability through material reuse, rental, and exchange." />
      </Helmet>

      <div className="min-h-screen bg-[#0F1A17]">
        <Navigation onNavigate={onNavigate} currentPage="home" />
        
        {/* Hero Section */}
        <section className="container mx-auto px-4 py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto text-center"
          >
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
              Connect. Reuse. <span className="text-[#3FA37C]">Sustain.</span>
            </h1>
            <p className="text-xl text-gray-300 mb-8">
              The marketplace for surplus construction materials
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={() => onNavigate('buyer')}
                className="bg-[#3FA37C] hover:bg-[#358F6A] text-white px-8 py-6 text-lg rounded-xl transition-all hover:scale-105 hover:shadow-lg"
              >
                Browse Materials
                <ArrowRight className="ml-2" />
              </Button>
              <Button
                onClick={() => onNavigate('seller')}
                variant="outline"
                className="border-[#3FA37C] text-[#3FA37C] hover:bg-[#3FA37C] hover:text-white px-8 py-6 text-lg rounded-xl transition-all hover:scale-105"
              >
                List Materials
              </Button>
            </div>
          </motion.div>
        </section>

        {/* About Us Section */}
        <section className="container mx-auto px-4 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="max-w-4xl mx-auto bg-[#1E2A26] rounded-2xl p-8 md:p-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 text-center">
              About <span className="text-[#3FA37C]">UpCycle Connect</span>
            </h2>
            <p className="text-lg text-gray-300 leading-relaxed text-center">
              UpCycle Connect is a pioneering sustainability platform dedicated to reducing construction waste and promoting circular economy practices. We connect buyers and sellers of surplus construction materials, enabling them to sell, rent, or exchange quality materials that would otherwise go to waste. Our mission is to transform the construction industry by making material reuse accessible, profitable, and environmentally responsible for everyone.
            </p>
          </motion.div>
        </section>

        {/* Features Section */}
        <section className="container mx-auto px-4 py-16">
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="bg-[#1E2A26] p-8 rounded-xl hover:scale-105 transition-all hover:shadow-xl"
            >
              <div className="w-16 h-16 bg-[#3FA37C] rounded-lg flex items-center justify-center mb-4">
                <Recycle className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Reduce Waste</h3>
              <p className="text-gray-300">
                Give surplus materials a second life and contribute to environmental sustainability
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="bg-[#1E2A26] p-8 rounded-xl hover:scale-105 transition-all hover:shadow-xl"
            >
              <div className="w-16 h-16 bg-[#60A5FA] rounded-lg flex items-center justify-center mb-4">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Connect</h3>
              <p className="text-gray-300">
                Join a community of builders, contractors, and eco-conscious individuals
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="bg-[#1E2A26] p-8 rounded-xl hover:scale-105 transition-all hover:shadow-xl"
            >
              <div className="w-16 h-16 bg-[#8B5E3C] rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Save Money</h3>
              <p className="text-gray-300">
                Access quality materials at reduced costs and generate value from surplus
              </p>
            </motion.div>
          </div>
        </section>
      </div>
    </>
  );
};

export default Homepage;