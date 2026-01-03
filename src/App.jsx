import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import LandingPage from '@/pages/LandingPage';
import AuthPage from '@/pages/AuthPage';
import SellerHome from '@/pages/SellerHome';
import AddMaterial from '@/pages/AddMaterial';
import BuyerHome from '@/pages/BuyerHome';
import MaterialDetail from '@/pages/MaterialDetail';
import ReviewsPage from '@/pages/ReviewsPage';
import { Toaster } from '@/components/ui/toaster';

function App() {
  const [currentPage, setCurrentPage] = useState('landing');
  const [user, setUser] = useState(null); // { role: 'buyer' | 'seller', name: '...', ... }
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  
  // Mock Data
  const [materials, setMaterials] = useState([
    {
      id: 1,
      name: 'Reclaimed Oak Beams',
      description: 'Solid oak beams reclaimed from a 1920s warehouse. Excellent structural condition with rustic character.',
      category: 'Wood',
      quantity: '12 beams',
      condition: 'Good',
      images: [
        'https://images.unsplash.com/photo-1563453392212-326f5e854473?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1609767524994-0e45ab4fbce1?w=800&h=600&fit=crop'
      ],
      availability: 'sell',
      price: 12000,
      seller: 'Vintage Structures Ltd.',
      sellerLocation: { lat: 28.6139, lng: 77.2090 },
      city: 'New Delhi'
    },
    {
      id: 2,
      name: 'Industrial Steel Scaffolding',
      description: 'Heavy-duty steel scaffolding sets. Includes frames, cross braces, and coupling pins.',
      category: 'Metal',
      quantity: '50 sets',
      condition: 'Excellent',
      images: [
        'https://images.unsplash.com/photo-1587293852726-70cdb56c2866?w=800&h=600&fit=crop'
      ],
      availability: 'rent',
      pricePerDay: 500,
      pricePerWeek: 2500,
      seller: 'BuildFast Infra',
      sellerLocation: { lat: 28.6292, lng: 77.2190 },
      city: 'Noida'
    },
    {
      id: 3,
      name: 'Surplus Porcelain Tiles',
      description: 'Leftover porcelain floor tiles from a mall project. Neutral beige color, non-slip finish.',
      category: 'Ceramic',
      quantity: '400 sq ft',
      condition: 'Like New',
      images: [
        'https://images.unsplash.com/photo-1615971677499-5467cbab01c0?w=800&h=600&fit=crop'
      ],
      availability: 'exchange',
      exchangeNote: 'Looking for sanitary fixtures or plumbing pipes',
      seller: 'Metro Developers',
      sellerLocation: { lat: 28.5989, lng: 77.2295 },
      city: 'Gurgaon'
    }
  ]);

  const [feedbacks, setFeedbacks] = useState([
    {
      id: 1,
      sellerName: 'Vintage Structures Ltd.',
      buyerName: 'Alice Green',
      rating: 5,
      comment: '[Post-Delivery] Excellent quality beams, exactly as described! Pickup was smooth.',
      date: '2023-11-15',
      materialName: 'Reclaimed Oak Beams',
      stage: 'Post-Delivery'
    },
    {
      id: 2,
      sellerName: 'BuildFast Infra',
      buyerName: 'Bob Builder',
      rating: 4,
      comment: '[Post-Delivery] Scaffolding was in good condition. A bit of a wait at the depot.',
      date: '2023-12-02',
      materialName: 'Industrial Steel Scaffolding',
      stage: 'Post-Delivery'
    },
    {
      id: 3,
      sellerName: 'Vintage Structures Ltd.',
      buyerName: 'Charlie Wood',
      rating: 5,
      comment: '[During Deal] Great seller, very communicative during the negotiation.',
      date: '2023-12-10',
      materialName: 'Pine Planks',
      stage: 'During Deal'
    }
  ]);

  // New State for Requests and Notifications
  const [materialRequests, setMaterialRequests] = useState([]); // Unlisted/Custom requests
  const [notifications, setNotifications] = useState([]);

  // Mock Active Transactions for Listed Items
  const [transactions, setTransactions] = useState([
    {
        id: 101,
        materialId: 2,
        materialName: 'Industrial Steel Scaffolding',
        sellerName: 'BuildFast Infra',
        status: 'In Progress',
        date: '2023-12-28',
        price: 500,
        quantity: '2 sets'
    },
    {
        id: 102,
        materialId: 3,
        materialName: 'Surplus Porcelain Tiles',
        sellerName: 'Metro Developers',
        status: 'Completed',
        date: '2023-12-15',
        price: 0,
        quantity: '50 sq ft'
    }
  ]);

  const handleLogin = (userData) => {
    setUser(userData);
    if (userData.role === 'seller') {
      setCurrentPage('seller-home');
    } else {
      setCurrentPage('buyer-home');
    }
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentPage('landing');
  };

  const handleAddMaterial = (newMaterial) => {
    const materialWithId = {
      ...newMaterial,
      id: materials.length + 1,
      seller: user?.organisationName || 'My Organisation',
      city: user?.city || 'Unknown City',
      sellerLocation: { lat: 28.6139 + (Math.random() - 0.5) * 0.1, lng: 77.2090 + (Math.random() - 0.5) * 0.1 }
    };
    setMaterials([materialWithId, ...materials]);
    setCurrentPage('seller-home');
  };

  const handleViewMaterial = (material) => {
    setSelectedMaterial(material);
    setCurrentPage('material-detail');
  };

  const handleAddFeedback = (newFeedback) => {
    // Prefix the stage to the comment so it appears in existing UI components
    const stagedComment = `[${newFeedback.stage || 'General'}] ${newFeedback.comment}`;
    
    setFeedbacks([{ 
        ...newFeedback, 
        comment: stagedComment,
        id: feedbacks.length + 1, 
        date: new Date().toISOString().split('T')[0] 
    }, ...feedbacks]);
  };

  const handleAddRequest = (requestData) => {
    const newRequest = {
      id: Date.now(),
      ...requestData,
      status: 'Pending',
      date: new Date().toLocaleDateString()
    };
    setMaterialRequests([newRequest, ...materialRequests]);
    
    // Mock notification creation
    setTimeout(() => {
        const newNotification = {
            id: Date.now() + 1,
            title: "Request Received",
            message: `We're looking for "${requestData.name}". We'll notify you when it matches a listing.`,
            type: 'info',
            read: false
        };
        setNotifications(prev => [newNotification, ...prev]);
    }, 1500);
  };

  const handleCreateTransaction = (material, reqData) => {
      const newTransaction = {
          id: Date.now(),
          materialId: material.id,
          materialName: material.name,
          sellerName: material.seller,
          status: 'Pending',
          date: new Date().toLocaleDateString(),
          price: material.price || material.pricePerDay || 0,
          quantity: reqData.quantity
      };
      setTransactions([newTransaction, ...transactions]);
      
      // Simulate seller approval
      setTimeout(() => {
         setTransactions(prev => prev.map(t => t.id === newTransaction.id ? { ...t, status: 'In Progress' } : t));
         setNotifications(prev => [{
            id: Date.now() + 2,
            title: "Request Approved",
            message: `Your request for ${material.name} has been approved by ${material.seller}.`,
            type: 'success',
            read: false
         }, ...prev]);
      }, 5000);
  };

  const handleMarkNotificationRead = (id) => {
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const getSellerStats = (sellerName) => {
    const sellerFeedbacks = feedbacks.filter(f => f.sellerName === sellerName);
    const count = sellerFeedbacks.length;
    const average = count > 0 
      ? sellerFeedbacks.reduce((acc, curr) => acc + curr.rating, 0) / count 
      : 0;
    return { count, average };
  };

  return (
    <>
      <Helmet>
        <title>UpCycle Connect</title>
        <meta name="description" content="Sustainable material exchange platform." />
      </Helmet>
      
      <div className="min-h-screen bg-[#0F1A17] text-white font-sans selection:bg-[#3FA37C] selection:text-white">
        {currentPage === 'landing' && (
          <LandingPage onNavigate={setCurrentPage} />
        )}

        {currentPage === 'auth' && (
          <AuthPage onLogin={handleLogin} onCancel={() => setCurrentPage('landing')} />
        )}

        {currentPage === 'reviews' && (
          <ReviewsPage 
            onNavigate={setCurrentPage} 
            feedbacks={feedbacks}
            user={user}
            onLogout={handleLogout}
          />
        )}

        {currentPage === 'seller-home' && user?.role === 'seller' && (
          <SellerHome 
            user={user} 
            materials={materials.filter(m => m.seller === user.organisationName)} 
            feedbacks={feedbacks.filter(f => f.sellerName === user.organisationName)}
            onNavigate={setCurrentPage} 
            onLogout={handleLogout} 
          />
        )}

        {currentPage === 'add-material' && user?.role === 'seller' && (
          <AddMaterial 
            onCancel={() => setCurrentPage('seller-home')} 
            onSubmit={handleAddMaterial} 
          />
        )}

        {currentPage === 'buyer-home' && user?.role === 'buyer' && (
          <BuyerHome 
            user={user} 
            materials={materials} 
            materialRequests={materialRequests}
            transactions={transactions}
            notifications={notifications}
            onAddRequest={handleAddRequest}
            onAddFeedback={handleAddFeedback}
            onMarkNotificationRead={handleMarkNotificationRead}
            onNavigate={setCurrentPage} 
            onLogout={handleLogout}
            onViewMaterial={handleViewMaterial}
            getSellerStats={getSellerStats}
          />
        )}

        {currentPage === 'material-detail' && selectedMaterial && (
          <MaterialDetail 
            material={selectedMaterial} 
            onBack={() => setCurrentPage('buyer-home')}
            user={user}
            sellerStats={getSellerStats(selectedMaterial.seller)}
            onCreateTransaction={handleCreateTransaction}
            onAddFeedback={handleAddFeedback}
          />
        )}
      </div>
      <Toaster />
    </>
  );
}

export default App;