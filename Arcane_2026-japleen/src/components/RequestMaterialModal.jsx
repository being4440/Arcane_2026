import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const RequestMaterialModal = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    quantity: '',
    urgency: 'Standard' // Standard, Urgent, Critical
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
    setFormData({ name: '', description: '', quantity: '', urgency: 'Standard' });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[70] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-[#1E2A26] w-full max-w-md rounded-2xl p-6 border border-gray-700 shadow-2xl relative"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 mb-6">
             <div className="p-3 bg-[#60A5FA]/10 rounded-full">
                <AlertCircle className="w-6 h-6 text-[#60A5FA]" />
             </div>
             <div>
                <h2 className="text-xl font-bold text-white">Request Material</h2>
                <p className="text-xs text-gray-400">Can't find it? We'll help you source it.</p>
             </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Material Name *</label>
              <input
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full bg-[#0F1A17] border border-gray-700 rounded-lg p-3 text-white focus:border-[#60A5FA] focus:outline-none"
                placeholder="e.g. Recycled Asphalt"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">Quantity Needed *</label>
              <input
                value={formData.quantity}
                onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                className="w-full bg-[#0F1A17] border border-gray-700 rounded-lg p-3 text-white focus:border-[#60A5FA] focus:outline-none"
                placeholder="e.g. 20 Tons"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full bg-[#0F1A17] border border-gray-700 rounded-lg p-3 text-white focus:border-[#60A5FA] focus:outline-none h-24 resize-none"
                placeholder="Specific requirements, dimensions, etc."
                required
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">Urgency / Timeframe</label>
              <select
                value={formData.urgency}
                onChange={(e) => setFormData({...formData, urgency: e.target.value})}
                className="w-full bg-[#0F1A17] border border-gray-700 rounded-lg p-3 text-white focus:border-[#60A5FA] focus:outline-none"
              >
                <option value="Standard">Standard (Within 2 weeks)</option>
                <option value="Urgent">Urgent (Within 1 week)</option>
                <option value="Critical">Critical (ASAP)</option>
              </select>
            </div>

            <Button
              type="submit"
              className="w-full bg-[#60A5FA] hover:bg-[#4B8AD1] text-white py-6 rounded-xl text-lg font-medium mt-4"
            >
              Submit Request
            </Button>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default RequestMaterialModal;