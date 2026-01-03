import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Recycle, ShieldCheck, Leaf } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Navigation from '@/components/Navigation';
const LandingPage = ({
  onNavigate
}) => {
  return <div className="min-h-screen bg-[#0F1A17]">
      <Navigation onNavigate={onNavigate} currentPage="landing" showAuthButtons={true} />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <motion.div initial={{
          opacity: 0,
          y: 30
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.8
        }} className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              Build the Future,<br />
              <span className="text-[#3FA37C]">Reuse the Past.</span>
            </h1>
            <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
              UpCycle Connect transforms construction surplus into valuable assets. Join the circular economy revolution today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button onClick={() => onNavigate('auth')} className="bg-[#3FA37C] hover:bg-[#358F6A] text-white px-8 py-6 text-lg rounded-xl shadow-lg shadow-[#3FA37C]/20 hover:scale-105 transition-all">
                Get Started
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </div>
          </motion.div>
        </div>
        
        {/* Abstract Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-20">
          <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-[#3FA37C] rounded-full blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-[#60A5FA] rounded-full blur-[150px]" />
        </div>
      </section>

      {/* About Us Section */}
      <section className="py-24 bg-[#0F1A17] relative">
        <div className="container mx-auto px-4">
          <motion.div initial={{
          opacity: 0
        }} whileInView={{
          opacity: 1
        }} viewport={{
          once: true
        }} className="bg-[#1E2A26] rounded-2xl p-8 md:p-16 border border-gray-800 shadow-2xl max-w-5xl mx-auto">
            <div className="flex flex-col md:flex-row gap-12 items-center">
              <div className="flex-1">
                <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">About Us</h2>
                <div className="space-y-4 text-gray-300 leading-relaxed text-lg">
                  <p>
                    UpCycle Connect is a pioneering sustainability platform dedicated to reducing construction waste and promoting circular economy practices.
                  </p>
                  <p>
                    We connect buyers and sellers of surplus construction materials, enabling them to sell, rent, or exchange quality materials that would otherwise go to waste.
                  </p>
                  <p>
                    Our mission is to transform the construction industry by making material reuse accessible, profitable, and environmentally responsible for everyone.
                  </p>
                </div>
              </div>
              <div className="flex-1 grid grid-cols-2 gap-4">
                <div className="bg-[#0F1A17] p-6 rounded-xl border border-gray-800 flex flex-col items-center text-center">
                  <Recycle className="w-10 h-10 text-[#3FA37C] mb-3" />
                  <span className="font-semibold text-white">Minimal Waste</span>
                </div>
                <div className="bg-[#0F1A17] p-6 rounded-xl border border-gray-800 flex flex-col items-center text-center translate-y-8">
                  <ShieldCheck className="w-10 h-10 text-[#60A5FA] mb-3" />
                  <span className="font-semibold text-white">Verified Quality</span>
                </div>
                <div className="bg-[#0F1A17] p-6 rounded-xl border border-gray-800 flex flex-col items-center text-center">
                  <Leaf className="w-10 h-10 text-[#8B5E3C] mb-3" />
                  <span className="font-semibold text-white">Eco Friendly</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>;
};
export default LandingPage;