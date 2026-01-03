import React, { useState } from 'react';
import { ChevronLeft, Upload, X, DollarSign, Calendar, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { motion } from 'framer-motion';

const AddMaterial = ({ onCancel, onSubmit }) => {
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

  const categories = ['Wood', 'Metal', 'Ceramic', 'Concrete', 'Glass', 'Electrical', 'Others'];
  const conditions = ['New', 'Like New', 'Excellent', 'Good', 'Fair', 'Salvage'];

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (formData.images.length + files.length > 3) {
      toast({ title: "Limit exceeded", description: "Max 3 images allowed", variant: "destructive" });
      return;
    }
    // Mock URL for demo
    const newImages = files.map(file => URL.createObjectURL(file));
    setFormData(prev => ({ ...prev, images: [...prev.images, ...newImages] }));
  };

  const removeImage = (idx) => {
    setFormData(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== idx) }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.quantity || formData.images.length === 0) {
        toast({ title: "Incomplete", description: "Please fill required fields and upload at least one image.", variant: "destructive" });
        return;
    }
    const finalCategory = formData.category === 'Others' ? formData.customCategory : formData.category;
    onSubmit({ ...formData, category: finalCategory });
    toast({ title: "Success", description: "Material listed successfully!" });
  };

  return (
    <div className="min-h-screen bg-[#0F1A17] py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <button onClick={onCancel} className="flex items-center text-gray-400 hover:text-white mb-6">
            <ChevronLeft className="w-5 h-5 mr-1" /> Cancel
        </button>

        <div className="bg-[#1E2A26] rounded-2xl p-8 border border-gray-800 shadow-2xl">
            <h1 className="text-3xl font-bold text-white mb-8">Add Surplus Material</h1>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Basic Details */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-[#3FA37C]">Item Details</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                            <label className="block text-sm text-gray-400 mb-1">Item Name *</label>
                            <input 
                                value={formData.name}
                                onChange={e => setFormData({...formData, name: e.target.value})}
                                className="w-full bg-[#0F1A17] border border-gray-700 rounded-lg p-3 text-white focus:border-[#3FA37C] focus:outline-none"
                                placeholder="e.g. Pine Wood Pallets"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Category *</label>
                            <select 
                                value={formData.category}
                                onChange={e => setFormData({...formData, category: e.target.value})}
                                className="w-full bg-[#0F1A17] border border-gray-700 rounded-lg p-3 text-white focus:border-[#3FA37C] focus:outline-none"
                            >
                                {categories.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        {formData.category === 'Others' && (
                             <div>
                                <label className="block text-sm text-gray-400 mb-1">Custom Category</label>
                                <input 
                                    value={formData.customCategory}
                                    onChange={e => setFormData({...formData, customCategory: e.target.value})}
                                    className="w-full bg-[#0F1A17] border border-gray-700 rounded-lg p-3 text-white focus:border-[#3FA37C] focus:outline-none"
                                />
                            </div>
                        )}
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Condition *</label>
                            <select 
                                value={formData.condition}
                                onChange={e => setFormData({...formData, condition: e.target.value})}
                                className="w-full bg-[#0F1A17] border border-gray-700 rounded-lg p-3 text-white focus:border-[#3FA37C] focus:outline-none"
                            >
                                {conditions.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm text-gray-400 mb-1">Quantity *</label>
                            <input 
                                value={formData.quantity}
                                onChange={e => setFormData({...formData, quantity: e.target.value})}
                                className="w-full bg-[#0F1A17] border border-gray-700 rounded-lg p-3 text-white focus:border-[#3FA37C] focus:outline-none"
                                placeholder="e.g. 500 units / 200 kg"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm text-gray-400 mb-1">Description</label>
                            <textarea 
                                value={formData.description}
                                onChange={e => setFormData({...formData, description: e.target.value})}
                                className="w-full bg-[#0F1A17] border border-gray-700 rounded-lg p-3 text-white focus:border-[#3FA37C] focus:outline-none h-24 resize-none"
                                placeholder="Details about origin, dimensions, etc."
                            />
                        </div>
                    </div>
                </div>

                {/* Images */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-[#3FA37C]">Photos (Max 3) *</h3>
                    <div className="flex gap-4 flex-wrap">
                        {formData.images.map((img, i) => (
                            <div key={i} className="relative w-24 h-24 rounded-lg overflow-hidden group">
                                <img src={img} alt="preview" className="w-full h-full object-cover" />
                                <button type="button" onClick={() => removeImage(i)} className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                        ))}
                        {formData.images.length < 3 && (
                            <label className="w-24 h-24 rounded-lg border-2 border-dashed border-gray-700 hover:border-[#3FA37C] flex flex-col items-center justify-center cursor-pointer text-gray-500 hover:text-[#3FA37C] transition-colors">
                                <Upload className="w-6 h-6 mb-1" />
                                <span className="text-xs">Upload</span>
                                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                            </label>
                        )}
                    </div>
                </div>

                {/* Availability */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-[#3FA37C]">Availability & Pricing</h3>
                    <div className="grid grid-cols-3 gap-4 mb-4">
                        {[
                            { id: 'sell', label: 'Sell', icon: DollarSign },
                            { id: 'rent', label: 'Rent', icon: Calendar },
                            { id: 'exchange', label: 'Exchange', icon: RefreshCcw }
                        ].map(opt => (
                            <button
                                key={opt.id}
                                type="button"
                                onClick={() => setFormData({...formData, availability: opt.id})}
                                className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all ${
                                    formData.availability === opt.id 
                                    ? 'bg-[#3FA37C]/10 border-[#3FA37C] text-[#3FA37C]' 
                                    : 'bg-[#0F1A17] border-gray-700 text-gray-400 hover:border-gray-500'
                                }`}
                            >
                                <opt.icon className="w-6 h-6 mb-2" />
                                <span className="font-medium">{opt.label}</span>
                            </button>
                        ))}
                    </div>

                    <div className="bg-[#0F1A17] p-4 rounded-xl border border-gray-800">
                        {formData.availability === 'sell' && (
                             <div>
                                <label className="block text-sm text-gray-400 mb-1">Selling Price (₹)</label>
                                <input 
                                    type="number"
                                    value={formData.price}
                                    onChange={e => setFormData({...formData, price: e.target.value})}
                                    className="w-full bg-[#1E2A26] border border-gray-700 rounded-lg p-3 text-white focus:border-[#3FA37C] focus:outline-none"
                                    placeholder="0.00"
                                />
                             </div>
                        )}
                        {formData.availability === 'rent' && (
                             <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Price per Day (₹)</label>
                                    <input 
                                        type="number"
                                        value={formData.pricePerDay}
                                        onChange={e => setFormData({...formData, pricePerDay: e.target.value})}
                                        className="w-full bg-[#1E2A26] border border-gray-700 rounded-lg p-3 text-white focus:border-[#3FA37C] focus:outline-none"
                                        placeholder="0.00"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Price per Week (₹)</label>
                                    <input 
                                        type="number"
                                        value={formData.pricePerWeek}
                                        onChange={e => setFormData({...formData, pricePerWeek: e.target.value})}
                                        className="w-full bg-[#1E2A26] border border-gray-700 rounded-lg p-3 text-white focus:border-[#3FA37C] focus:outline-none"
                                        placeholder="0.00"
                                    />
                                </div>
                             </div>
                        )}
                        {formData.availability === 'exchange' && (
                             <div>
                                <label className="block text-sm text-gray-400 mb-1">Exchange Note (Optional)</label>
                                <input 
                                    value={formData.exchangeNote}
                                    onChange={e => setFormData({...formData, exchangeNote: e.target.value})}
                                    className="w-full bg-[#1E2A26] border border-gray-700 rounded-lg p-3 text-white focus:border-[#3FA37C] focus:outline-none"
                                    placeholder="What are you looking for?"
                                />
                             </div>
                        )}
                    </div>
                </div>

                <div className="pt-6 border-t border-gray-800 flex justify-end gap-4">
                    <Button type="button" variant="ghost" onClick={onCancel} className="text-gray-400">Cancel</Button>
                    <Button type="submit" className="bg-[#3FA37C] hover:bg-[#358F6A] text-white px-8">Post Material</Button>
                </div>
            </form>
        </div>
      </div>
    </div>
  );
};

export default AddMaterial;