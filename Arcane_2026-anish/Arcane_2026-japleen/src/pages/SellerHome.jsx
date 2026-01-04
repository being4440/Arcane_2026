import React, { useState, useEffect } from 'react';
import { Plus, Package, LogOut, Star, MessageSquare, Leaf } from 'lucide-react';
import { Button } from '@/components/ui/button';
import MaterialCard from '@/components/MaterialCard';
import { motion } from 'framer-motion';
import { api } from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';

const StatsCard = ({ icon: Icon, label, value, sublabel }) => (
    <div className="bg-[#1E2A26] p-6 rounded-xl border border-gray-800">
        <div className="flex items-center justify-between mb-2">
            <h3 className="text-gray-400 text-sm">{label}</h3>
            {Icon && <Icon className="w-5 h-5 text-[#3FA37C]" />}
        </div>
        <p className="text-3xl font-bold text-white">{value}</p>
        {sublabel && <p className="text-xs text-gray-500 mt-1">{sublabel}</p>}
    </div>
);

const SellerHome = ({ user, materials, feedbacks: feedbacksProp = [], pendingCount = 0, onNavigate, onLogout }) => {
    const { toast } = useToast();
    const [feedbacks, setFeedbacks] = useState(feedbacksProp);
    const [loadingFeedbacks, setLoadingFeedbacks] = useState(false);

    // Fetch feedbacks from backend on mount
    useEffect(() => {
        let mounted = true;
        const loadFeedbacks = async () => {
            setLoadingFeedbacks(true);
            try {
                const data = await api.getOrgFeedbacks();
                if (mounted) {
                    setFeedbacks(Array.isArray(data) ? data : []);
                }
            } catch (err) {
                console.error('Failed to fetch feedbacks:', err);
                if (mounted) {
                    setFeedbacks(feedbacksProp); // Fall back to prop
                }
            } finally {
                if (mounted) setLoadingFeedbacks(false);
            }
        };
        loadFeedbacks();
        return () => { mounted = false; };
    }, []);

    const averageRating = feedbacks.length > 0
        ? (feedbacks.reduce((acc, curr) => acc + (curr.rating || 0), 0) / feedbacks.length).toFixed(1)
        : 'N/A';

    return (
        <div className="min-h-screen bg-[#0F1A17] pb-20">
            {/* Top Nav */}
            <nav className="bg-[#1E2A26] border-b border-gray-800 p-4 sticky top-0 z-50">
                <div className="container mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#3FA37C] rounded-lg flex items-center justify-center">
                            <span className="font-bold text-white text-lg">{user.organisationName?.[0] || 'S'}</span>
                        </div>
                        <div>
                            <h1 className="font-bold text-white">{user.organisationName}</h1>
                            <p className="text-xs text-gray-400">Seller Dashboard</p>
                        </div>
                    </div>
                    <div className="flex gap-4 items-center">
                        <button onClick={() => onNavigate('reviews')} className="text-sm text-gray-400 hover:text-white mr-2">All Reviews</button>
                        <button onClick={() => onNavigate('profile')} className="text-sm text-gray-400 hover:text-white mr-2">Profile</button>
                        <Button variant="ghost" onClick={onLogout} className="text-gray-400 hover:text-white">
                            <LogOut className="w-5 h-5 mr-2" />
                            Logout
                        </Button>
                    </div>
                </div>
            </nav>

            <div className="container mx-auto px-4 py-8">

                {/* Stats Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-[#1E2A26] p-6 rounded-xl border border-gray-800">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-gray-400 text-sm">Total Listings</h3>
                            <Package className="w-5 h-5 text-[#3FA37C]" />
                        </div>
                        <p className="text-3xl font-bold text-white">{materials.length}</p>
                    </div>
                    <div className="bg-[#1E2A26] p-6 rounded-xl border border-gray-800">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-gray-400 text-sm">Average Rating</h3>
                            <Star className="w-5 h-5 text-yellow-400" />
                        </div>
                        <p className="text-3xl font-bold text-white">{averageRating} <span className="text-sm text-gray-500 font-normal">/ 5.0</span></p>
                    </div>
                    {/* CO2 Stats Card */}
                    <div className="bg-[#1E2A26] p-6 rounded-xl border border-[#3FA37C]/30 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Leaf className="w-24 h-24 text-[#3FA37C]" />
                        </div>
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 bg-[#3FA37C]/10 rounded-xl text-[#3FA37C]">
                                <Leaf className="w-6 h-6" />
                            </div>
                            <span className="text-gray-400 font-medium">Impact</span>
                        </div>
                        <div>
                            <h3 className="text-3xl font-bold text-white mb-1">
                                {materials.reduce((acc, curr) => {
                                    const qty = parseFloat(String(curr.quantity).replace(/[^0-9.]/g, '')) || 1;
                                    return acc + (qty * 0.05); // 0.05 tons per unit approx
                                }, 0).toFixed(1)} T
                            </h3>
                            <p className="text-sm text-[#3FA37C]">CO2 Saved</p>
                        </div>
                    </div>

                    {/* Pending Requests Card */}
                    <div
                        onClick={() => onNavigate('seller-requests')}
                        className="bg-[#1E2A26] p-6 rounded-xl border border-gray-800 cursor-pointer hover:border-[#3FA37C] transition-colors group"
                    >
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-gray-400 text-sm group-hover:text-[#3FA37C] transition-colors">Pending Requests</h3>
                            <div className="w-5 h-5 bg-yellow-500/20 rounded-full flex items-center justify-center">
                                <span className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
                            </div>
                        </div>
                        <div className="flex items-baseline gap-2">
                            <p className="text-3xl font-bold text-white">{pendingCount}</p>
                            <span className="text-xs text-gray-500">Click to view</span>
                        </div>
                    </div>
                </div>

                {/* Feedback Section */}
                <div className="mb-12">
                    <h2 className="text-2xl font-bold text-white mb-6">Recent Feedback</h2>
                    {loadingFeedbacks ? (
                        <div className="bg-[#1E2A26] rounded-xl p-8 text-center border border-dashed border-gray-700">
                            <p className="text-gray-400">Loading feedback...</p>
                        </div>
                    ) : feedbacks.length === 0 ? (
                        <div className="bg-[#1E2A26] rounded-xl p-8 text-center border border-dashed border-gray-700">
                            <p className="text-gray-400">No feedback received yet.</p>
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-2 gap-4">
                            {feedbacks.map(feedback => (
                                <div key={feedback.feedback_id || feedback.id} className="bg-[#1E2A26] p-5 rounded-xl border border-gray-800">
                                    <div className="flex justify-between items-start mb-3">
                                        <span className="text-[#3FA37C] font-medium text-sm">{feedback.materialName || `Request #${feedback.request_id}`}</span>
                                        <div className="flex items-center gap-1">
                                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                            <span className="text-yellow-400 font-bold text-sm">{feedback.rating}</span>
                                        </div>
                                    </div>
                                    <p className="text-gray-300 text-sm mb-3">"{feedback.comment}"</p>
                                    <div className="flex justify-between text-xs text-gray-500">
                                        <span>{feedback.buyerName || `Buyer #${feedback.buyer_id}`}</span>
                                        <span>{feedback.date || new Date(feedback.created_at).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Main Action Area */}
                <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-white mb-2">My Inventory</h2>
                        <p className="text-gray-400">Manage your surplus listings.</p>
                    </div>
                    <Button
                        onClick={() => onNavigate('add-material')}
                        className="bg-[#3FA37C] hover:bg-[#358F6A] text-white px-6 py-6 rounded-xl shadow-lg shadow-[#3FA37C]/20 hover:scale-105 transition-all"
                    >
                        <Plus className="mr-2 h-5 w-5" />
                        Add Surplus Material
                    </Button>
                </div>

                {/* Listings Grid */}
                {materials.length === 0 ? (
                    <div className="bg-[#1E2A26] rounded-2xl p-12 text-center border border-dashed border-gray-700">
                        <div className="w-20 h-20 bg-[#0F1A17] rounded-full flex items-center justify-center mx-auto mb-6">
                            <Package className="w-10 h-10 text-gray-600" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">No materials listed yet</h3>
                        <p className="text-gray-400 mb-6">Start monetizing your surplus inventory today.</p>
                        <Button
                            onClick={() => onNavigate('add-material')}
                            variant="outline"
                            className="border-[#3FA37C] text-[#3FA37C] hover:bg-[#3FA37C] hover:text-white"
                        >
                            Create First Listing
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {materials.map((item, idx) => (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                            >
                                <MaterialCard material={item} showActions={true} />
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SellerHome;