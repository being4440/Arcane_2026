import React, { useState } from 'react';
import { ArrowLeft, MapPin, Package, ShieldAlert, CheckCircle2, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import FeedbackModal from '@/components/FeedbackModal';

const MaterialDetail = ({ material, onBack, user, sellerStats, onCreateTransaction, onAddFeedback }) => {
  const { toast } = useToast();
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [reqData, setReqData] = useState({ purpose: '', quantity: '', timeframe: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmitRequest = (e) => {
        e.preventDefault();
        setSubmitted(true);

        // Create actual transaction and await backend response before closing UI
        (async () => {
            try {
                await onCreateTransaction(material, reqData);
                toast({ title: "Request Sent", description: "You can track this in 'My Deals' on your dashboard." });
                setRequestModalOpen(false);
                onBack(); // Redirect to dashboard
            } catch (err) {
                console.error('Request creation failed', err);
                toast({ title: "Error", description: err?.message || 'Failed to send request', variant: 'destructive' });
            } finally {
                setSubmitted(false);
            }
        })();
  };

  const handleFeedbackSubmit = async (feedbackData) => {
      try {
        await onAddFeedback({
            requestId: material.requestId,
            sellerName: material.seller,
            buyerName: user?.name || 'Anonymous',
            materialName: material.name,
            stage: 'General',
            ...feedbackData
        });
        setFeedbackModalOpen(false);
      } catch (err) {
        console.error('Feedback submission failed:', err);
      }
  };

  const getBadgeColor = (type) => {
    switch(type) {
        case 'sell': return 'bg-[#3FA37C] text-white';
        case 'rent': return 'bg-[#60A5FA] text-white';
        case 'exchange': return 'bg-[#8B5E3C] text-white';
        default: return 'bg-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-[#0F1A17] pb-20">
      {/* Header Image */}
      <div className="relative h-[40vh] w-full">
        <img src={material.images[0]} alt={material.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#0F1A17]" />
        <button 
            onClick={onBack}
            className="absolute top-6 left-6 bg-black/50 hover:bg-black/70 p-2 rounded-full text-white backdrop-blur-sm transition-colors"
        >
            <ArrowLeft className="w-6 h-6" />
        </button>
      </div>

      <div className="container mx-auto px-4 -mt-20 relative z-10">
        <div className="grid md:grid-cols-3 gap-8">
            {/* Main Info */}
            <div className="md:col-span-2 space-y-6">
                <div className="bg-[#1E2A26] rounded-2xl p-8 border border-gray-800 shadow-2xl">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide mb-3 inline-block ${getBadgeColor(material.availability)}`}>
                                For {material.availability}
                            </span>
                            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{material.name}</h1>
                            <div className="flex items-center text-gray-400 gap-4 mb-2">
                                <span className="flex items-center"><MapPin className="w-4 h-4 mr-1" /> {material.city}</span>
                                <span className="flex items-center"><Package className="w-4 h-4 mr-1" /> {material.category}</span>
                            </div>
                        </div>
                        <div className="text-right">
                             {material.availability === 'sell' && <div className="text-3xl font-bold text-[#3FA37C]">₹{material.price}</div>}
                             {material.availability === 'rent' && <div className="text-2xl font-bold text-[#60A5FA]">₹{material.pricePerDay}<span className="text-sm text-gray-400">/day</span></div>}
                        </div>
                    </div>
                    
                    {/* Seller Rating Display */}
                    <div className="flex items-center gap-2 mb-6 bg-[#0F1A17] p-3 rounded-xl w-fit border border-gray-700">
                        <span className="text-gray-400 text-sm">Seller Rating:</span>
                        <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            <span className="font-bold text-white">{sellerStats?.average?.toFixed(1) || 'New'}</span>
                            <span className="text-gray-500 text-sm">({sellerStats?.count || 0} reviews)</span>
                        </div>
                    </div>

                    <div className="border-t border-gray-700 my-6" />

                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-white">Description</h3>
                        <p className="text-gray-300 leading-relaxed">{material.description}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-8">
                        <div className="bg-[#0F1A17] p-4 rounded-xl">
                            <span className="block text-gray-500 text-sm">Condition</span>
                            <span className="text-white font-medium">{material.condition}</span>
                        </div>
                        <div className="bg-[#0F1A17] p-4 rounded-xl">
                            <span className="block text-gray-500 text-sm">Available Quantity</span>
                            <span className="text-white font-medium">{material.quantity}</span>
                        </div>
                    </div>
                </div>

                {/* Privacy Notice */}
                <div className="bg-[#8B5E3C]/10 border border-[#8B5E3C]/30 rounded-xl p-4 flex items-start gap-3">
                    <ShieldAlert className="w-6 h-6 text-[#8B5E3C] shrink-0 mt-0.5" />
                    <div>
                        <h4 className="text-[#8B5E3C] font-semibold text-sm">Privacy Protected</h4>
                        <p className="text-xs text-[#8B5E3C]/80">The exact pickup location is hidden for security reasons. It will be revealed only after the seller approves your request.</p>
                    </div>
                </div>
            </div>

            {/* Sidebar Action */}
            <div className="md:col-span-1">
                <div className="bg-[#1E2A26] rounded-2xl p-6 border border-gray-800 sticky top-24">
                    <h3 className="text-xl font-bold text-white mb-6">Interested?</h3>
                    <div className="space-y-4 mb-6">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-400">Seller</span>
                            <span className="text-white font-medium">{material.seller}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-400">Response Rate</span>
                            <span className="text-[#3FA37C]">High</span>
                        </div>
                    </div>
                    <div className="space-y-3">
                        <Button 
                            onClick={() => setRequestModalOpen(true)}
                            className="w-full bg-[#3FA37C] hover:bg-[#358F6A] text-white py-6 rounded-xl text-lg font-medium"
                        >
                            Send Request
                        </Button>
                        <Button
                            onClick={() => setFeedbackModalOpen(true)}
                            variant="outline"
                            className="w-full border-gray-600 text-gray-300 hover:text-white hover:bg-white/5 py-6 rounded-xl"
                        >
                            Rate Seller
                        </Button>
                    </div>
                    <p className="text-xs text-center text-gray-500 mt-4">No payment required at this stage.</p>
                </div>
            </div>
        </div>
      </div>

      {/* Request Modal */}
      <AnimatePresence>
        {requestModalOpen && (
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
            >
                <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="bg-[#1E2A26] w-full max-w-md rounded-2xl p-6 border border-gray-700 shadow-2xl"
                >
                    {submitted ? (
                        <div className="text-center py-8">
                            <div className="w-16 h-16 bg-[#3FA37C]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckCircle2 className="w-8 h-8 text-[#3FA37C]" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">Request Sent!</h3>
                            <p className="text-gray-400">Redirecting to Dashboard...</p>
                        </div>
                    ) : (
                        <>
                            <h2 className="text-xl font-bold text-white mb-4">Submit Request</h2>
                            <form onSubmit={handleSubmitRequest} className="space-y-4">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Purpose of Use</label>
                                    <textarea 
                                        className="w-full bg-[#0F1A17] border border-gray-700 rounded-lg p-3 text-white focus:border-[#3FA37C] focus:outline-none h-20 resize-none"
                                        placeholder="Briefly describe your project..."
                                        required
                                        value={reqData.purpose}
                                        onChange={e => setReqData({...reqData, purpose: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Quantity Needed</label>
                                    <input 
                                        className="w-full bg-[#0F1A17] border border-gray-700 rounded-lg p-3 text-white focus:border-[#3FA37C] focus:outline-none"
                                        placeholder={`Max: ${material.quantity}`}
                                        required
                                        value={reqData.quantity}
                                        onChange={e => setReqData({...reqData, quantity: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Preferred Pickup Timeframe</label>
                                    <input 
                                        className="w-full bg-[#0F1A17] border border-gray-700 rounded-lg p-3 text-white focus:border-[#3FA37C] focus:outline-none"
                                        placeholder="e.g., Next week, Weekends"
                                        required
                                        value={reqData.timeframe}
                                        onChange={e => setReqData({...reqData, timeframe: e.target.value})}
                                    />
                                </div>
                                <div className="flex gap-3 mt-6">
                                    <Button type="button" variant="ghost" onClick={() => setRequestModalOpen(false)} className="flex-1 text-gray-400">Cancel</Button>
                                    <Button type="submit" className="flex-1 bg-[#3FA37C] hover:bg-[#358F6A] text-white">Submit</Button>
                                </div>
                            </form>
                        </>
                    )}
                </motion.div>
            </motion.div>
        )}
      </AnimatePresence>

      <FeedbackModal 
        isOpen={feedbackModalOpen}
        onClose={() => setFeedbackModalOpen(false)}
        onSubmit={handleFeedbackSubmit}
        sellerName={material.seller}
        materialName={material.name}
      />
    </div>
  );
};

export default MaterialDetail;