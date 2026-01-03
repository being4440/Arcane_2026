import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

const AddMaterialForm = ({ onSubmit, onCancel }) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'Wood',
    customCategory: '',
    quantity: '',
    condition: 'Good',
    images: [],
    availability: 'sell',
    price: '',
    pricePerDay: '',
    pricePerWeek: '',
    exchangeNote: ''
  });

  const categories = ['Wood', 'Metal', 'Ceramic', 'Plastic', 'Glass', 'Others'];
  const conditions = ['Like New', 'Excellent', 'Good', 'Fair', 'Usable'];

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (formData.images.length + files.length > 3) {
      toast({
        title: "Too many images",
        description: "You can upload a maximum of 3 images",
        variant: "destructive"
      });
      return;
    }

    // Simulate image upload - in real app, would upload to server
    const newImages = files.map(file => URL.createObjectURL(file));
    handleChange('images', [...formData.images, ...newImages]);
  };

  const removeImage = (index) => {
    const newImages = formData.images.filter((_, i) => i !== index);
    handleChange('images', newImages);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.description || !formData.quantity) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    if (formData.images.length === 0) {
      toast({
        title: "No images",
        description: "Please upload at least one image",
        variant: "destructive"
      });
      return;
    }

    const finalCategory = formData.category === 'Others' ? formData.customCategory : formData.category;
    
    onSubmit({
      ...formData,
      category: finalCategory,
      images: formData.images.length > 0 ? formData.images : ['https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&h=600&fit=crop']
    });

    toast({
      title: "Success!",
      description: "Material added successfully"
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="bg-[#1E2A26] rounded-xl p-8"
    >
      <h2 className="text-2xl font-bold text-white mb-6">Add New Material</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-gray-300 mb-2">Material Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className="w-full px-4 py-3 bg-[#0F1A17] text-white rounded-lg border border-gray-700 focus:border-[#3FA37C] focus:outline-none transition-colors"
              placeholder="e.g., Reclaimed Wood Planks"
            />
          </div>

          <div>
            <label className="block text-gray-300 mb-2">Category *</label>
            <select
              value={formData.category}
              onChange={(e) => handleChange('category', e.target.value)}
              className="w-full px-4 py-3 bg-[#0F1A17] text-white rounded-lg border border-gray-700 focus:border-[#3FA37C] focus:outline-none transition-colors"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        {formData.category === 'Others' && (
          <div>
            <label className="block text-gray-300 mb-2">Custom Category *</label>
            <input
              type="text"
              value={formData.customCategory}
              onChange={(e) => handleChange('customCategory', e.target.value)}
              className="w-full px-4 py-3 bg-[#0F1A17] text-white rounded-lg border border-gray-700 focus:border-[#3FA37C] focus:outline-none transition-colors"
              placeholder="Enter custom category"
            />
          </div>
        )}

        <div>
          <label className="block text-gray-300 mb-2">Description *</label>
          <textarea
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            rows={4}
            className="w-full px-4 py-3 bg-[#0F1A17] text-white rounded-lg border border-gray-700 focus:border-[#3FA37C] focus:outline-none transition-colors resize-none"
            placeholder="Describe the material, its origin, and any relevant details"
          />
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-gray-300 mb-2">Quantity *</label>
            <input
              type="text"
              value={formData.quantity}
              onChange={(e) => handleChange('quantity', e.target.value)}
              className="w-full px-4 py-3 bg-[#0F1A17] text-white rounded-lg border border-gray-700 focus:border-[#3FA37C] focus:outline-none transition-colors"
              placeholder="e.g., 50 pieces, 100 sq ft"
            />
          </div>

          <div>
            <label className="block text-gray-300 mb-2">Condition *</label>
            <select
              value={formData.condition}
              onChange={(e) => handleChange('condition', e.target.value)}
              className="w-full px-4 py-3 bg-[#0F1A17] text-white rounded-lg border border-gray-700 focus:border-[#3FA37C] focus:outline-none transition-colors"
            >
              {conditions.map(cond => (
                <option key={cond} value={cond}>{cond}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Image Upload */}
        <div>
          <label className="block text-gray-300 mb-2">Images (1-3) *</label>
          <div className="grid grid-cols-3 gap-4 mb-4">
            {formData.images.map((img, index) => (
              <div key={index} className="relative group">
                <img src={img} alt={`Upload ${index + 1}`} className="w-full h-32 object-cover rounded-lg" />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
          {formData.images.length < 3 && (
            <label className="flex items-center justify-center gap-2 px-4 py-8 bg-[#0F1A17] text-gray-300 rounded-lg border-2 border-dashed border-gray-700 hover:border-[#3FA37C] cursor-pointer transition-colors">
              <Upload className="w-5 h-5" />
              <span>Upload Image{formData.images.length > 0 ? 's' : ''}</span>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>
          )}
        </div>

        {/* Availability Options */}
        <div>
          <label className="block text-gray-300 mb-3">Availability *</label>
          <div className="space-y-4">
            <label className="flex items-center gap-3 p-4 bg-[#0F1A17] rounded-lg cursor-pointer hover:bg-opacity-80 transition-colors">
              <input
                type="radio"
                name="availability"
                value="sell"
                checked={formData.availability === 'sell'}
                onChange={(e) => handleChange('availability', e.target.value)}
                className="w-5 h-5 text-[#3FA37C]"
              />
              <div className="flex-1">
                <span className="text-white font-semibold">Sell</span>
                {formData.availability === 'sell' && (
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => handleChange('price', e.target.value)}
                    placeholder="Enter price in ₹"
                    className="mt-2 w-full px-4 py-2 bg-[#1E2A26] text-white rounded-lg border border-gray-700 focus:border-[#3FA37C] focus:outline-none"
                  />
                )}
              </div>
            </label>

            <label className="flex items-center gap-3 p-4 bg-[#0F1A17] rounded-lg cursor-pointer hover:bg-opacity-80 transition-colors">
              <input
                type="radio"
                name="availability"
                value="rent"
                checked={formData.availability === 'rent'}
                onChange={(e) => handleChange('availability', e.target.value)}
                className="w-5 h-5 text-[#3FA37C]"
              />
              <div className="flex-1">
                <span className="text-white font-semibold">Rent</span>
                {formData.availability === 'rent' && (
                  <div className="mt-2 grid grid-cols-2 gap-4">
                    <input
                      type="number"
                      value={formData.pricePerDay}
                      onChange={(e) => handleChange('pricePerDay', e.target.value)}
                      placeholder="₹ per day"
                      className="px-4 py-2 bg-[#1E2A26] text-white rounded-lg border border-gray-700 focus:border-[#3FA37C] focus:outline-none"
                    />
                    <input
                      type="number"
                      value={formData.pricePerWeek}
                      onChange={(e) => handleChange('pricePerWeek', e.target.value)}
                      placeholder="₹ per week"
                      className="px-4 py-2 bg-[#1E2A26] text-white rounded-lg border border-gray-700 focus:border-[#3FA37C] focus:outline-none"
                    />
                  </div>
                )}
              </div>
            </label>

            <label className="flex items-center gap-3 p-4 bg-[#0F1A17] rounded-lg cursor-pointer hover:bg-opacity-80 transition-colors">
              <input
                type="radio"
                name="availability"
                value="exchange"
                checked={formData.availability === 'exchange'}
                onChange={(e) => handleChange('availability', e.target.value)}
                className="w-5 h-5 text-[#3FA37C]"
              />
              <div className="flex-1">
                <span className="text-white font-semibold">Exchange</span>
                {formData.availability === 'exchange' && (
                  <input
                    type="text"
                    value={formData.exchangeNote}
                    onChange={(e) => handleChange('exchangeNote', e.target.value)}
                    placeholder="What are you looking for? (optional)"
                    className="mt-2 w-full px-4 py-2 bg-[#1E2A26] text-white rounded-lg border border-gray-700 focus:border-[#3FA37C] focus:outline-none"
                  />
                )}
              </div>
            </label>
          </div>
        </div>

        <div className="flex gap-4 pt-4">
          <Button
            type="submit"
            className="flex-1 bg-[#3FA37C] hover:bg-[#358F6A] text-white py-3 rounded-xl transition-all hover:scale-105 hover:shadow-lg"
          >
            Add Material
          </Button>
          <Button
            type="button"
            onClick={onCancel}
            variant="outline"
            className="flex-1 border-gray-700 text-gray-300 hover:bg-[#0F1A17] py-3 rounded-xl transition-all"
          >
            Cancel
          </Button>
        </div>
      </form>
    </motion.div>
  );
};

export default AddMaterialForm;