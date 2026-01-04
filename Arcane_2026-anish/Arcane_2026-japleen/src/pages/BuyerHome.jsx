import React, { useState, useEffect } from 'react';
import { Map, List, LogOut, PlusCircle, Bell, Clock, Briefcase, Star, MessageSquare, Search, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import MaterialCard from '@/components/MaterialCard';
import MapView from '@/components/MapView';
import RequestMaterialModal from '@/components/RequestMaterialModal';
import FeedbackModal from '@/components/FeedbackModal';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast';
import { api } from '@/lib/api';

const BuyerHome = ({
    user,
    materials,
    materialRequests,
    transactions = [],
    notifications,
    onAddRequest,
    onAddFeedback,
    onMarkNotificationRead,
    onNavigate,
    onLogout,
    onViewMaterial,
    getSellerStats,
    onSearch
}) => {
    const { toast } = useToast();
    const [activeTab, setActiveTab] = useState('browse'); // 'browse' | 'deals' | 'requests'
    const [viewMode, setViewMode] = useState('list');
    const [filterCategory, setFilterCategory] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');
    const [searchIndustry, setSearchIndustry] = useState('');
    const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
    const [isNotificationOpen, setIsNotificationOpen] = useState(false);
    const performSearch = () => {
        const params = {};
        if (filterCategory !== 'All') params.category = filterCategory;
        if (searchTerm) params.q = searchTerm;
        if (searchIndustry && searchIndustry !== 'All') params.industry = searchIndustry;

        if (onSearch) {
            onSearch(params);
        }
    };

    // Trigger search when filters change
    useEffect(() => {
        const timer = setTimeout(() => {
            if (activeTab === 'browse') {
                performSearch();
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [searchTerm, searchIndustry, filterCategory]);

    // Use materials prop directly
    const displayMaterials = materials;

    const unreadCount = notifications.filter(n => !n.read).length;

    const handleRequestSubmit = (data) => {
        onAddRequest(data);
        toast({
            title: "Request Submitted",
            description: "We'll notify you when matching materials become available."
        });
        setActiveTab('requests');
    };

    const openFeedback = (transaction, stage) => {
        setSelectedTransactionForFeedback(transaction);
        setFeedbackStage(stage);
        setFeedbackModalOpen(true);
    };

    const handleFeedbackSubmit = async (data) => {
        try {
            await onAddFeedback({
                requestId: selectedTransactionForFeedback.id,
                sellerName: selectedTransactionForFeedback.sellerName,
                buyerName: user?.name || 'Anonymous',
                materialName: selectedTransactionForFeedback.materialName,
                stage: feedbackStage,
                ...data
            });
            setFeedbackModalOpen(false);
        } catch (err) {
            console.error('Feedback submission failed:', err);
        }
    };

    return (
        <div className="min-h-screen bg-[#0F1A17] flex flex-col">
            <nav className="bg-[#1E2A26] border-b border-gray-800 p-4 sticky top-0 z-50">
                <div className="container mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#60A5FA] rounded-lg flex items-center justify-center">
                            <span className="font-bold text-white text-lg">{user.name?.[0] || 'B'}</span>
                        </div>
                        <div>
                            <h1 className="font-bold text-white">Welcome, {user.name}</h1>
                            <p className="text-xs text-gray-400">Buyer Portal</p>
                        </div>
                    </div>
                    <div className="flex gap-4 items-center">
                        <button onClick={() => onNavigate('reviews')} className="text-sm text-gray-400 hover:text-white mr-2 hidden md:block">Seller Reviews</button>

                        {/* Notifications Bell */}
                        <div className="relative">
                            <button
                                onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                                className="p-2 text-gray-400 hover:text-white relative"
                            >
                                <Bell className="w-5 h-5" />
                                {unreadCount > 0 && (
                                    <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border border-[#1E2A26]" />
                                )}
                            </button>

                            <AnimatePresence>
                                {isNotificationOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 10 }}
                                        className="absolute right-0 top-full mt-2 w-80 bg-[#1E2A26] border border-gray-700 rounded-xl shadow-2xl overflow-hidden z-[60]"
                                    >
                                        <div className="p-3 border-b border-gray-700 font-semibold text-white">Notifications</div>
                                        <div className="max-h-64 overflow-y-auto">
                                            {notifications.length === 0 ? (
                                                <div className="p-4 text-center text-gray-500 text-sm">No notifications</div>
                                            ) : (
                                                notifications.map(n => (
                                                    <div
                                                        key={n.id}
                                                        className={`p-3 border-b border-gray-800 hover:bg-[#0F1A17] transition-colors ${!n.read ? 'bg-[#3FA37C]/5' : ''}`}
                                                        onClick={() => onMarkNotificationRead(n.id)}
                                                    >
                                                        <div className="text-sm font-medium text-white mb-1">{n.title}</div>
                                                        <p className="text-xs text-gray-400">{n.message}</p>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        <div className="hidden md:flex bg-[#0F1A17] rounded-lg p-1 border border-gray-700">
                            <button
                                onClick={() => setViewMode('list')}
                                className={`p-2 rounded-md transition-colors ${viewMode === 'list' ? 'bg-[#3FA37C] text-white' : 'text-gray-400 hover:text-white'}`}
                            >
                                <List className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => setViewMode('map')}
                                className={`p-2 rounded-md transition-colors ${viewMode === 'map' ? 'bg-[#3FA37C] text-white' : 'text-gray-400 hover:text-white'}`}
                            >
                                <Map className="w-5 h-5" />
                            </button>
                        </div>
                        <button onClick={() => onNavigate && onNavigate('profile')} className="text-gray-400 hover:text-white mr-4">Profile</button>
                        <Button variant="ghost" onClick={onLogout} className="text-gray-400 hover:text-white">
                            <LogOut className="w-5 h-5 mr-2" />
                            Logout
                        </Button>
                    </div>
                </div>
            </nav>

            <div className="container mx-auto px-4 py-6 flex-1 flex flex-col">
                {/* Main Tabs */}
                <div className="flex gap-6 mb-8 border-b border-gray-800 overflow-x-auto">
                    <button
                        onClick={() => setActiveTab('browse')}
                        className={`pb-3 px-2 text-sm font-medium transition-colors border-b-2 whitespace-nowrap ${activeTab === 'browse' ? 'border-[#3FA37C] text-[#3FA37C]' : 'border-transparent text-gray-400 hover:text-white'
                            }`}
                    >
                        Browse Market
                    </button>
                    <button
                        onClick={() => setActiveTab('deals')}
                        className={`pb-3 px-2 text-sm font-medium transition-colors border-b-2 whitespace-nowrap ${activeTab === 'deals' ? 'border-yellow-500 text-yellow-500' : 'border-transparent text-gray-400 hover:text-white'
                            }`}
                    >
                        My Deals <span className="ml-1 bg-yellow-500/20 text-yellow-500 px-1.5 rounded-full text-xs">{transactions.length}</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('requests')}
                        className={`pb-3 px-2 text-sm font-medium transition-colors border-b-2 whitespace-nowrap ${activeTab === 'requests' ? 'border-[#60A5FA] text-[#60A5FA]' : 'border-transparent text-gray-400 hover:text-white'
                            }`}
                    >
                        Custom Requests <span className="ml-1 bg-[#60A5FA]/20 text-[#60A5FA] px-1.5 rounded-full text-xs">{materialRequests.length}</span>
                    </button>
                </div>

                {activeTab === 'browse' && (
                    <>
                        {/* Mobile View Toggle */}
                        <div className="md:hidden flex justify-center mb-6">
                            <div className="bg-[#1E2A26] rounded-full p-1 border border-gray-700 flex">
                                <button
                                    onClick={() => setViewMode('list')}
                                    className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${viewMode === 'list' ? 'bg-[#3FA37C] text-white' : 'text-gray-400'}`}
                                >
                                    List View
                                </button>
                                <button
                                    onClick={() => setViewMode('map')}
                                    className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${viewMode === 'map' ? 'bg-[#3FA37C] text-white' : 'text-gray-400'}`}
                                >
                                    Map View
                                </button>
                            </div>
                        </div>

                        {/* Filters */}
                        {viewMode === 'list' && (
                            <div className="space-y-4 pb-4 mb-4">
                                {/* Search and Industry Filter */}
                                <div className="flex gap-3 flex-col md:flex-row">
                                    <div className="relative flex-1">
                                        <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400 pointer-events-none" />
                                        <input
                                            type="text"
                                            placeholder="Search materials..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="w-full pl-10 pr-4 py-2 bg-[#0F1A17] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#3FA37C] transition-colors"
                                        />
                                    </div>
                                    <select
                                        value={searchIndustry}
                                        onChange={(e) => setSearchIndustry(e.target.value)}
                                        className="px-4 py-2 bg-[#0F1A17] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-[#3FA37C] transition-colors md:w-48"
                                    >
                                        {industries.map(ind => (
                                            <option key={ind} value={ind === 'All' ? '' : ind}>{ind}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Category Filter */}
                                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                                    {categories.map(cat => (
                                        <button
                                            key={cat}
                                            onClick={() => setFilterCategory(cat)}
                                            className={`px-4 py-2 rounded-lg whitespace-nowrap text-sm font-medium transition-colors ${filterCategory === cat
                                                ? 'bg-[#60A5FA] text-white'
                                                : 'bg-[#1E2A26] text-gray-400 hover:text-white border border-gray-700'
                                                }`}
                                        >
                                            {cat}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Content */}
                        <div className="flex-1 relative">
                            {viewMode === 'list' ? (
                                <>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
                                        {displayMaterials.map((item, idx) => (
                                            <motion.div
                                                key={item.id}
                                                initial={{ opacity: 0, scale: 0.95 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                transition={{ delay: idx * 0.05 }}
                                                onClick={() => onViewMaterial(item)}
                                                className="cursor-pointer"
                                            >
                                                <MaterialCard
                                                    material={item}
                                                    sellerStats={getSellerStats(item.seller)}
                                                />
                                            </motion.div>
                                        ))}
                                    </div>
                                    {displayMaterials.length === 0 && (
                                        <div className="text-center py-20 bg-[#1E2A26]/50 rounded-xl border border-dashed border-gray-700">
                                            <p className="text-gray-400 mb-4">No materials found in this category.</p>
                                            <Button onClick={() => setActiveTab('requests')} variant="outline" className="border-[#60A5FA] text-[#60A5FA] hover:bg-[#60A5FA] hover:text-white">
                                                Request This Material
                                            </Button>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="h-full min-h-[500px] rounded-xl overflow-hidden border border-gray-800 relative">
                                    <MapView materials={displayMaterials} onMarkerClick={onViewMaterial} />
                                </div>
                            )}
                        </div>
                    </>
                )}

                {activeTab === 'deals' && (
                    <div className="max-w-4xl mx-auto w-full">
                        <div className="mb-6">
                            <h2 className="text-2xl font-bold text-white mb-1">My Active Deals</h2>
                            <p className="text-gray-400 text-sm">Track your transactions and leave feedback.</p>
                        </div>

                        <div className="space-y-4">
                            {transactions.length === 0 ? (
                                <div className="text-center py-16 bg-[#1E2A26] rounded-xl border border-gray-800">
                                    <Briefcase className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                                    <h3 className="text-lg font-bold text-white">No active deals</h3>
                                    <p className="text-gray-400">Requests you make for materials will appear here.</p>
                                </div>
                            ) : (
                                transactions.map(deal => (
                                    <div key={deal.id} className="bg-[#1E2A26] rounded-xl p-6 border border-gray-800 flex flex-col md:flex-row gap-6">
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start mb-2">
                                                <h3 className="text-xl font-bold text-white">{deal.materialName}</h3>
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${deal.status === 'Completed' ? 'bg-green-500/20 text-green-500' :
                                                    deal.status === 'In Progress' ? 'bg-blue-500/20 text-blue-500' :
                                                        'bg-yellow-500/20 text-yellow-500'
                                                    }`}>
                                                    {deal.status}
                                                </span>
                                            </div>
                                            <p className="text-gray-400 text-sm mb-1">Seller: <span className="text-white">{deal.sellerName}</span></p>
                                            <p className="text-gray-400 text-sm mb-4">Quantity: {deal.quantity}</p>

                                            <div className="flex items-center text-xs text-gray-500 gap-4">
                                                <span>ID: #{deal.id}</span>
                                                <span>{deal.date}</span>
                                            </div>
                                        </div>

                                        <div className="flex flex-col justify-center gap-3 min-w-[200px] border-t md:border-t-0 md:border-l border-gray-700 pt-4 md:pt-0 md:pl-6">
                                            {deal.status === 'In Progress' && (
                                                <Button
                                                    onClick={() => openFeedback(deal, 'During Deal')}
                                                    variant="outline"
                                                    className="w-full border-blue-500/50 text-blue-400 hover:bg-blue-500/10"
                                                >
                                                    <MessageSquare className="w-4 h-4 mr-2" />
                                                    Rate (During Deal)
                                                </Button>
                                            )}
                                            {deal.status === 'Completed' && (
                                                <Button
                                                    onClick={() => openFeedback(deal, 'Post-Delivery')}
                                                    className="w-full bg-[#3FA37C] hover:bg-[#358F6A] text-white"
                                                >
                                                    <Star className="w-4 h-4 mr-2" />
                                                    Rate (Post-Delivery)
                                                </Button>
                                            )}
                                            <Button variant="ghost" className="text-gray-400 w-full text-xs">View Details</Button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'requests' && (
                    // Requests Tab
                    <div className="max-w-4xl mx-auto w-full">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                            <div>
                                <h2 className="text-2xl font-bold text-white mb-1">Custom Requests</h2>
                                <p className="text-gray-400 text-sm">Requests for unlisted materials.</p>
                            </div>
                            <Button
                                onClick={() => setIsRequestModalOpen(true)}
                                className="bg-[#60A5FA] hover:bg-[#4B8AD1] text-white rounded-xl shadow-lg shadow-[#60A5FA]/20"
                            >
                                <PlusCircle className="w-5 h-5 mr-2" />
                                Request New Material
                            </Button>
                        </div>

                        <div className="space-y-4">
                            {materialRequests.length === 0 ? (
                                <div className="text-center py-16 bg-[#1E2A26] rounded-xl border border-gray-800">
                                    <div className="w-16 h-16 bg-[#0F1A17] rounded-full flex items-center justify-center mx-auto mb-4 text-gray-600">
                                        <PlusCircle className="w-8 h-8" />
                                    </div>
                                    <h3 className="text-lg font-bold text-white mb-2">No active requests</h3>
                                    <p className="text-gray-400">Requests you submit will appear here.</p>
                                </div>
                            ) : (
                                materialRequests.map(req => (
                                    <div key={req.id} className="bg-[#1E2A26] rounded-xl p-6 border border-gray-800 flex flex-col md:flex-row justify-between gap-6">
                                        <div>
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="text-xl font-bold text-white">{req.name}</h3>
                                                <span className={`px-2 py-0.5 text-xs font-bold rounded uppercase ${req.status === 'Pending' ? 'bg-yellow-500/20 text-yellow-500' : 'bg-green-500/20 text-green-500'
                                                    }`}>
                                                    {req.status}
                                                </span>
                                            </div>
                                            <p className="text-gray-400 text-sm mb-4">{req.description}</p>
                                            <div className="flex gap-6 text-sm text-gray-500">
                                                <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> Posted: {req.date}</span>
                                                <span className="flex items-center gap-1 font-medium text-gray-300">Qty: {req.quantity}</span>
                                            </div>
                                        </div>
                                        <div className="flex flex-col justify-between items-end min-w-[150px]">
                                            <div className={`px-3 py-1 rounded text-xs font-medium border ${req.urgency === 'Critical' ? 'border-red-500 text-red-500 bg-red-500/10' :
                                                req.urgency === 'Urgent' ? 'border-orange-500 text-orange-500 bg-orange-500/10' :
                                                    'border-gray-600 text-gray-400'
                                                }`}>
                                                {req.urgency} Priority
                                            </div>
                                            <div className="mt-4 flex items-center gap-2 text-xs text-[#60A5FA]">
                                                <Bell className="w-3 h-3" />
                                                Notifications On
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}
            </div>

            <RequestMaterialModal
                isOpen={isRequestModalOpen}
                onClose={() => setIsRequestModalOpen(false)}
                onSubmit={handleRequestSubmit}
            />

            <FeedbackModal
                isOpen={feedbackModalOpen}
                onClose={() => setFeedbackModalOpen(false)}
                onSubmit={handleFeedbackSubmit}
                sellerName={selectedTransactionForFeedback?.sellerName}
                materialName={selectedTransactionForFeedback?.materialName}
                stage={feedbackStage}
            />
        </div>
    );
};

export default BuyerHome;