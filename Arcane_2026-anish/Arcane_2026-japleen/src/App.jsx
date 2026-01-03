import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import LandingPage from '@/pages/LandingPage';
import AuthPage from '@/pages/AuthPage';
import SellerHome from '@/pages/SellerHome';
import AddMaterial from '@/pages/AddMaterial';
import BuyerHome from '@/pages/BuyerHome';
import MaterialDetail from '@/pages/MaterialDetail';
import ReviewsPage from '@/pages/ReviewsPage';
import { Toaster } from '@/components/ui/toaster';
import { api } from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';

function App() {
  const { toast } = useToast();
  const [currentPage, setCurrentPage] = useState('landing');
  const [user, setUser] = useState(null); // { role: 'buyer' | 'seller', name: '...', ... }
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [loading, setLoading] = useState(false);

  // Data State
  const [materials, setMaterials] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]); // Keep mock for now or fetch if available

  // Mock Active Transactions for Listed Items (Keep user mocks for demo if backend missing)
  const [transactions, setTransactions] = useState([]);
  const [materialRequests, setMaterialRequests] = useState([]);
  const [notifications, setNotifications] = useState([]);

  // Initial Load
  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user_details');
    const storedRole = localStorage.getItem('role');

    if (token && storedUser && storedRole) {
      setUser({ role: storedRole, ...JSON.parse(storedUser) });
      if (storedRole === 'seller') setCurrentPage('seller-home');
      else if (storedRole === 'buyer') setCurrentPage('buyer-home');
    }
  }, []);

  // Fetch Materials
  useEffect(() => {
    // Only fetch if logged in? Or public?
    // Current backend allows public read? `read_materials` in `material.py` doesn't enforce auth.
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    try {
      setLoading(true);
      const data = await api.getMaterials();
      // Map backend data to frontend model
      const mapped = data.map(m => ({
        id: m.material_id,
        orgId: m.org_id,
        name: m.title,
        description: m.description,
        category: m.category,
        quantity: `${m.quantity_value || ''} ${m.quantity_unit || ''}`.trim(),
        condition: m.condition || 'Good',
        images: m.photos && m.photos.length > 0 ? m.photos.map(p => p.photo_url) : ['https://images.unsplash.com/photo-1563453392212-326f5e854473?w=800&h=600&fit=crop'],
        availability: m.availability_status || 'sell',
        price: 1000, // Mock since backend missing
        seller: 'Unknown Seller', // Backend map needed or fetch org
        sellerLocation: { lat: 28.6139 + (Math.random() - 0.5) * 0.1, lng: 77.2090 + (Math.random() - 0.5) * 0.1 },
        city: 'New Delhi'
      }));
      setMaterials(mapped);
    } catch (e) {
      console.error("Failed to fetch materials", e);
      // Fallback to mock if fetch fails? Or just empty.
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (userData) => {
    setUser(userData);
    if (userData.role === 'seller') {
      setCurrentPage('seller-home');
    } else {
      setCurrentPage('buyer-home');
    }
    fetchMaterials(); // Refresh data on login
  };

  const handleLogout = () => {
    localStorage.clear();
    setUser(null);
    setCurrentPage('landing');
  };

  const handleAddMaterial = async (newMaterial) => {
    try {
      // newMaterial from form: { name, category, description, quantity, unit, condition, images, ... }
      // Backend expects: title, category, description, quantity_value, quantity_unit, condition, photos

      const payload = {
        title: newMaterial.name,
        category: newMaterial.category,
        description: newMaterial.description,
        quantity_value: parseFloat(newMaterial.quantity) || 0, // Extract number? Form gives string?
        quantity_unit: 'units', // Need a unit field in form or parse
        condition: newMaterial.condition,
        photos: newMaterial.images || []
      };

      await api.createMaterial(payload);
      toast({ title: "Success", description: "Material listed successfully" });
      fetchMaterials();
      setCurrentPage('seller-home');
    } catch (error) {
      toast({ title: "Error", description: "Failed to create material", variant: "destructive" });
    }
  };

  const handleViewMaterial = (material) => {
    setSelectedMaterial(material);
    setCurrentPage('material-detail');
  };

  // KEEP MOCK HANDLERS FOR NOW (Transition incrementally)
  const handleAddFeedback = (newFeedback) => {
    const stagedComment = `[${newFeedback.stage || 'General'}] ${newFeedback.comment}`;
    setFeedbacks([{
      ...newFeedback,
      comment: stagedComment,
      id: feedbacks.length + 1,
      date: new Date().toISOString().split('T')[0]
    }, ...feedbacks]);
  };

  const handleAddRequest = (requestData) => {
    // TODO: Integrate api.createRequest
    const newRequest = {
      id: Date.now(),
      ...requestData,
      status: 'Pending',
      date: new Date().toLocaleDateString()
    };
    setMaterialRequests([newRequest, ...materialRequests]);
    setTimeout(() => {
      setNotifications(prev => [{
        id: Date.now() + 1,
        title: "Request Received",
        message: `We're looking for "${requestData.name}". We'll notify you when it matches a listing.`,
        type: 'info',
        read: false
      }, ...prev]);
    }, 1500);
  };

  const handleCreateTransaction = (material, reqData) => {
    // TODO: Integrate with backend request/transaction logic
    const newTransaction = {
      id: Date.now(),
      materialId: material.id,
      materialName: material.name,
      sellerName: material.seller,
      status: 'Pending',
      date: new Date().toLocaleDateString(),
      price: material.price || 0,
      quantity: reqData.quantity
    };
    setTransactions([newTransaction, ...transactions]);
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
            materials={materials.filter(m => m.orgId === user.user_id)}
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