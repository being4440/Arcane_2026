import React, { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle, XCircle, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { api } from '@/lib/api';

const SellerRequests = ({ requests = [], onNavigate, onAccept, onReject, refreshKey = 0 }) => {
    const [orgRequests, setOrgRequests] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Always try to fetch latest from backend; fall back to prop if request fails
        let mounted = true;
        const load = async () => {
            setLoading(true);
            try {
                const data = await api.getOrgRequests();
                if (!mounted) return;
                // Normalize backend shape to UI shape used below
                const normalized = data.map(r => ({
                    id: r.request_id,
                    materialId: r.material_id,
                    materialName: r.material_title || `#${r.material_id}`,
                    buyerId: r.buyer_id,
                    buyerName: r.buyer_name || 'Anonymous',
                    message: r.message,
                    quantity: r.requested_quantity,
                    status: r.status,
                    date: r.created_at
                }));
                setOrgRequests(normalized);
            } catch (e) {
                // fallback to provided prop
                if (!mounted) return;
                console.warn('Failed to fetch org requests, falling back to prop', e);
                // attempt to normalize prop shape too
                const normalized = requests.map(r => ({
                    id: r.request_id || r.id,
                    materialId: r.material_id || r.materialId,
                    materialName: r.material_title || r.materialName || r.title,
                    buyerId: r.buyer_id || r.buyerId,
                    buyerName: r.buyer_name || r.buyerName || r.requesterName,
                    message: r.message,
                    quantity: r.requested_quantity || r.quantity || r.requestedQuantity,
                    status: r.status,
                    date: r.created_at || r.date
                }));
                setOrgRequests(normalized);
            } finally {
                if (mounted) setLoading(false);
            }
        };
        load();
        return () => { mounted = false; };
    }, [refreshKey]); // refetch when parent increments refreshKey

    const display = orgRequests.length ? orgRequests : requests.map(r => ({
        id: r.request_id || r.id,
        materialId: r.material_id || r.materialId,
        materialName: r.material_title || r.materialName || r.title,
        buyerId: r.buyer_id || r.buyerId,
        buyerName: r.buyer_name || r.buyerName || r.requesterName,
        message: r.message,
        quantity: r.requested_quantity || r.quantity || r.requestedQuantity,
        status: r.status,
        date: r.created_at || r.date
    }));

    return (
        <div className="min-h-screen bg-[#0F1A17] py-8 px-4">
            <div className="max-w-4xl mx-auto">
                <button onClick={() => onNavigate('seller-home')} className="flex items-center text-gray-400 hover:text-white mb-8 transition-colors">
                    <ArrowLeft className="w-5 h-5 mr-2" /> Back to Dashboard
                </button>

                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">Pending Requests</h1>
                        <p className="text-gray-400">Manage buyer interests and inquiries.</p>
                    </div>
                    <div className="bg-[#1E2A26] px-4 py-2 rounded-lg border border-gray-700">
                        <span className="text-white font-bold">{display.length}</span> <span className="text-gray-400">Pending</span>
                    </div>
                </div>

                <div className="space-y-4">
                    {display.length === 0 && !loading ? (
                        <div className="bg-[#1E2A26] rounded-2xl p-16 text-center border border-dashed border-gray-700">
                            <div className="w-16 h-16 bg-[#0F1A17] rounded-full flex items-center justify-center mx-auto mb-4 text-gray-600">
                                <User className="w-8 h-8" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">No pending requests</h3>
                            <p className="text-gray-400">When buyers are interested in your materials, they will appear here.</p>
                        </div>
                    ) : (
                        // Group requests by material
                        (() => {
                            const groups = display.reduce((acc, r) => {
                                const key = r.materialId ?? r.materialName;
                                if (!acc[key]) acc[key] = { materialName: r.materialName || `#${r.materialId}`, items: [] };
                                acc[key].items.push(r);
                                return acc;
                            }, {});

                            return Object.keys(groups).map((key, gidx) => (
                                <GroupedRequestsCard
                                    key={key}
                                    groupKey={key}
                                    group={groups[key]}
                                    index={gidx}
                                    onAccept={onAccept}
                                    onReject={onReject}
                                />
                            ));
                        })()
                    )}
                </div>
            </div>
        </div>
    );
};

export default SellerRequests;

// Helper grouped card component
const GroupedRequestsCard = ({ groupKey, group, index, onAccept, onReject }) => {
    const [expanded, setExpanded] = React.useState(false);

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-[#1E2A26] rounded-xl p-6 border border-gray-800 hover:border-[#3FA37C]/50 transition-colors"
        >
            <div className="flex items-center justify-between mb-3">
                <div>
                    <h3 className="text-xl font-bold text-white">{group.materialName}</h3>
                    <p className="text-sm text-gray-400">{group.items.length} buyer{group.items.length > 1 ? 's' : ''} interested</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" onClick={() => setExpanded(prev => !prev)} className="text-gray-300">
                        {expanded ? 'Hide' : 'View'} Buyers
                    </Button>
                </div>
            </div>

            {expanded && (
                <div className="mt-4 space-y-3">
                    {group.items.map(item => (
                        <div key={item.id} className={`bg-[#0F1A17] p-4 rounded-lg border transition-all ${item.status === 'rejected' ? 'opacity-50 border-red-500/30' : 'border-gray-800'}`}>
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-1">
                                        <span className="text-sm text-gray-400">Buyer:</span>
                                        <span className="text-sm text-white font-medium">{item.buyerName || item.requesterName || 'Anonymous'}</span>
                                        <span className="ml-3 text-xs text-gray-500">{item.date}</span>
                                    </div>
                                    {item.message ? (
                                        <p className="text-gray-300 text-sm italic">"{item.message}"</p>
                                    ) : (
                                        <p className="text-gray-500 text-sm">No message provided.</p>
                                    )}
                                    <div className="text-xs text-gray-400 mt-2">Quantity: <span className="text-white ml-1">{item.quantity}</span></div>
                                </div>

                                {item.status === 'accepted' && (
                                    <div className="flex flex-col gap-2 ml-4 items-end">
                                        <div className="px-3 py-2 bg-[#3FA37C]/20 border border-[#3FA37C] rounded-lg">
                                            <span className="text-sm text-[#3FA37C] font-medium">📍 Location sent</span>
                                        </div>
                                    </div>
                                )}
                                {item.status === 'rejected' && (
                                    <div className="flex flex-col gap-2 ml-4 items-end">
                                        <div className="px-3 py-2 bg-red-500/20 border border-red-500 rounded-lg">
                                            <span className="text-sm text-red-400 font-medium">❌ Rejected</span>
                                        </div>
                                    </div>
                                )}
                                {item.status === 'pending' && (
                                    <div className="flex flex-col gap-2 ml-4">
                                        <Button onClick={() => onAccept(item.id)} className="bg-[#3FA37C] hover:bg-[#358F6A] text-white">
                                            <CheckCircle className="w-4 h-4 mr-2" /> Accept
                                        </Button>
                                        <Button variant="outline" onClick={() => onReject(item.id)} className="border-red-500/50 text-red-400 hover:bg-red-500/10">
                                            <XCircle className="w-4 h-4 mr-2" /> Reject
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </motion.div>
    );
};
