import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Building2, ChevronLeft, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { api } from '@/lib/api';

const InputField = ({ label, type = "text", value, onChange, placeholder, required = true }) => (
    <div className="mb-4">
        <label className="block text-sm font-medium text-gray-400 mb-1.5">{label}</label>
        <input
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full bg-[#0F1A17] border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-[#3FA37C] transition-colors"
            required={required}
        />
    </div>
);

const AuthPage = ({ onLogin, onCancel }) => {
    const { toast } = useToast();
    const [role, setRole] = useState(null); // 'buyer' | 'seller'
    const [authMode, setAuthMode] = useState('login'); // 'login' | 'register'

    // Buyer State
    const [buyerData, setBuyerData] = useState({
        name: '',
        email: '',
        password: '',
        phone: '',
        city: ''
    });

    // Seller State
    const [sellerData, setSellerData] = useState({
        orgName: '',
        orgType: 'Contractor',
        industryType: 'Construction',
        officialEmail: '',
        contactNumber: '',
        address: '',
        city: '',
        regNumber: '',
        password: '',
        confirmPassword: ''
    });

    // Login State
    const [loginData, setLoginData] = useState({
        identifier: '',
        password: ''
    });

    const handleBuyerSubmit = async (e) => {
        console.log('AuthPage: handleBuyerSubmit called', { authMode, buyerData });
        e.preventDefault();
        if (authMode === 'register') {
            if (!buyerData.name || !buyerData.email || !buyerData.password) {
                toast({ title: "Error", description: "Please fill all fields", variant: "destructive" });
                return;
            }

            try {
                await api.signupBuyer({
                    name: buyerData.name,
                    email: buyerData.email,
                    city: buyerData.city || 'New Delhi',
                    phone: buyerData.phone,
                    password: buyerData.password
                });

                // Auto Login
                const loginResp = await api.login(buyerData.email, buyerData.password);
                localStorage.setItem('token', loginResp.access_token);

                const userDataToStore = { ...loginResp.user_details, user_id: loginResp.user_id };
                localStorage.setItem('user_details', JSON.stringify(userDataToStore));
                localStorage.setItem('role', loginResp.role);

                toast({ title: "Account Created", description: "Welcome to UpCycle Connect!" });
                onLogin({ role: 'buyer', ...userDataToStore });
            } catch (error) {
                toast({ title: "Registration Failed", description: error.message || 'Registration failed', variant: "destructive" });
            }
        } else {
            handleLoginSubmit(e);
        }
    };

    const handleSellerSubmit = async (e) => {
        console.log('AuthPage: handleSellerSubmit called', { authMode, sellerData });
        e.preventDefault();
        if (authMode === 'register') {
            if (sellerData.password !== sellerData.confirmPassword) {
                toast({ title: "Error", description: "Passwords do not match", variant: "destructive" });
                return;
            }
            if (!sellerData.orgName || !sellerData.officialEmail) {
                toast({ title: "Error", description: "Please fill required fields", variant: "destructive" });
                return;
            }

            try {
                await api.signupOrganization({
                    org_name: sellerData.orgName,
                    org_type: sellerData.orgType,
                    industry_type: sellerData.industryType,
                        email: sellerData.officialEmail,
                        contact_number: sellerData.contactNumber,
                    password: sellerData.password
                });

                // Auto Login
                const loginResp = await api.login(sellerData.officialEmail, sellerData.password);
                localStorage.setItem('token', loginResp.access_token);

                const userDataToStore = { ...loginResp.user_details, user_id: loginResp.user_id };
                localStorage.setItem('user_details', JSON.stringify(userDataToStore));
                localStorage.setItem('role', loginResp.role);

                toast({ title: "Account Created", description: "Organisation registered successfully!" });
                onLogin({ role: 'seller', ...userDataToStore });
            } catch (error) {
                // Show backend validation message if present
                toast({ title: "Registration Failed", description: error.message || 'Registration failed', variant: "destructive" });
            }

        } else {
            handleLoginSubmit(e);
        }
    };

    const handleLoginSubmit = async (e) => {
        console.log('AuthPage: handleLoginSubmit called', { loginData });
        if (e) e.preventDefault(); // Handle cases where called from other handlers
        if (!loginData.identifier || !loginData.password) {
            toast({ title: "Error", description: "Please enter credentials", variant: "destructive" });
            return;
        }

        try {
            const data = await api.login(loginData.identifier, loginData.password);
            localStorage.setItem('token', data.access_token);
            // We need to persist user_id as well, or the whole login response, not just user_details
            // Update: Persist just what we need or correct the structure.
            // Let's store the full user object including ID in local storage for specific user_details key if App.jsx relies on it?
            // App.jsx does: setUser({ role: storedRole, ...JSON.parse(storedUser) });
            // So we should put user_id INSIDE user_details or merge them before storing.

            const userDataToStore = { ...data.user_details, user_id: data.user_id };
            localStorage.setItem('user_details', JSON.stringify(userDataToStore));
            localStorage.setItem('role', data.role);

            toast({ title: "Welcome Back", description: "Logged in successfully" });
            onLogin({
                role: data.role,
                ...userDataToStore
            });
        } catch (error) {
            toast({ title: "Login Failed", description: error.message, variant: "destructive" });
        }
    };

    return (
        <div className="min-h-screen bg-[#0F1A17] flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-[#1E2A26] w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden border border-gray-800 flex flex-col md:flex-row min-h-[600px]"
            >
                {/* Left Side - Info/Back */}
                <div className="md:w-1/3 bg-[#0F1A17] p-8 flex flex-col justify-between border-r border-gray-800">
                    <div>
                        <button
                            onClick={role ? () => setRole(null) : onCancel}
                            className="flex items-center text-gray-400 hover:text-white transition-colors mb-8"
                        >
                            <ChevronLeft className="w-5 h-5 mr-1" />
                            {role ? 'Back to Role' : 'Back to Home'}
                        </button>
                        <h2 className="text-2xl font-bold text-white mb-2">
                            {role ? (role === 'buyer' ? 'Buyer Access' : 'Seller Portal') : 'Get Started'}
                        </h2>
                        <p className="text-gray-400 text-sm">
                            {!role ? 'Select your role to continue to the platform.' :
                                role === 'buyer' ? 'Find surplus materials near you.' : 'List surplus materials and recover value.'}
                        </p>
                    </div>

                    <div className="mt-8">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-2 h-2 rounded-full bg-[#3FA37C]" />
                            <span className="text-xs text-gray-400">Secure Authentication</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-[#60A5FA]" />
                            <span className="text-xs text-gray-400">Verified Profiles</span>
                        </div>
                    </div>
                </div>

                {/* Right Side - Forms */}
                <div className="md:w-2/3 p-8 overflow-y-auto max-h-[800px]">
                    {!role ? (
                        <div className="h-full flex flex-col justify-center gap-6">
                            <button
                                onClick={() => setRole('buyer')}
                                className="group flex items-center p-6 bg-[#0F1A17] rounded-xl border border-gray-700 hover:border-[#60A5FA] transition-all hover:bg-[#0F1A17]/80"
                            >
                                <div className="w-14 h-14 bg-[#60A5FA]/10 rounded-lg flex items-center justify-center mr-6 group-hover:scale-110 transition-transform">
                                    <User className="w-7 h-7 text-[#60A5FA]" />
                                </div>
                                <div className="text-left flex-1">
                                    <h3 className="text-xl font-bold text-white mb-1">I'm a Buyer</h3>
                                    <p className="text-gray-400 text-sm">Browse and request materials</p>
                                </div>
                                <ArrowRight className="w-5 h-5 text-gray-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
                            </button>

                            <button
                                onClick={() => setRole('seller')}
                                className="group flex items-center p-6 bg-[#0F1A17] rounded-xl border border-gray-700 hover:border-[#3FA37C] transition-all hover:bg-[#0F1A17]/80"
                            >
                                <div className="w-14 h-14 bg-[#3FA37C]/10 rounded-lg flex items-center justify-center mr-6 group-hover:scale-110 transition-transform">
                                    <Building2 className="w-7 h-7 text-[#3FA37C]" />
                                </div>
                                <div className="text-left flex-1">
                                    <h3 className="text-xl font-bold text-white mb-1">I'm a Seller</h3>
                                    <p className="text-gray-400 text-sm">List organization & surplus inventory</p>
                                </div>
                                <ArrowRight className="w-5 h-5 text-gray-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
                            </button>
                        </div>
                    ) : (
                        <div className="h-full">
                            {/* Toggle Auth Mode */}
                            <div className="flex bg-[#0F1A17] p-1 rounded-lg mb-8 w-fit mx-auto">
                                <button
                                    onClick={() => setAuthMode('login')}
                                    className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${authMode === 'login' ? 'bg-[#1E2A26] text-white shadow-sm' : 'text-gray-400 hover:text-white'}`}
                                >
                                    Login
                                </button>
                                <button
                                    onClick={() => setAuthMode('register')}
                                    className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${authMode === 'register' ? 'bg-[#1E2A26] text-white shadow-sm' : 'text-gray-400 hover:text-white'}`}
                                >
                                    Register
                                </button>
                            </div>

                            <form onSubmit={role === 'buyer' ? handleBuyerSubmit : handleSellerSubmit} className="space-y-4">
                                {authMode === 'login' ? (
                                    <>
                                        <InputField
                                            label={role === 'seller' ? "Organisation ID / Email" : "Email Address"}
                                            value={loginData.identifier}
                                            onChange={(v) => setLoginData({ ...loginData, identifier: v })}
                                            placeholder="Enter your ID"
                                        />
                                        <InputField
                                            label="Password"
                                            type="password"
                                            value={loginData.password}
                                            onChange={(v) => setLoginData({ ...loginData, password: v })}
                                            placeholder="Enter your password"
                                        />
                                    </>
                                ) : (
                                    role === 'buyer' ? (
                                        <>
                                            <InputField label="Full Name" value={buyerData.name} onChange={(v) => setBuyerData({ ...buyerData, name: v })} placeholder="John Doe" />
                                            <InputField label="Email Address" type="email" value={buyerData.email} onChange={(v) => setBuyerData({ ...buyerData, email: v })} placeholder="john@example.com" />
                                            <InputField label="Contact Number" value={buyerData.phone} onChange={(v) => setBuyerData({ ...buyerData, phone: v })} placeholder="9876543210" />
                                            <InputField label="City" value={buyerData.city} onChange={(v) => setBuyerData({ ...buyerData, city: v })} placeholder="City" />
                                            <InputField label="Password" type="password" value={buyerData.password} onChange={(v) => setBuyerData({ ...buyerData, password: v })} placeholder="Create a password" />
                                        </>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="md:col-span-2">
                                                <InputField label="Organisation Name" value={sellerData.orgName} onChange={(v) => setSellerData({ ...sellerData, orgName: v })} placeholder="Acme Corp" />
                                            </div>
                                            <InputField label="Org Type" value={sellerData.orgType} onChange={(v) => setSellerData({ ...sellerData, orgType: v })} placeholder="Contractor" />
                                            <InputField label="Industry Type" value={sellerData.industryType} onChange={(v) => setSellerData({ ...sellerData, industryType: v })} placeholder="Construction" />
                                            <InputField label="Official Email" type="email" value={sellerData.officialEmail} onChange={(v) => setSellerData({ ...sellerData, officialEmail: v })} placeholder="admin@acme.com" />
                                            <InputField label="Contact Number" value={sellerData.contactNumber} onChange={(v) => setSellerData({ ...sellerData, contactNumber: v })} placeholder="+91 9876543210" />
                                            <div className="md:col-span-2">
                                                <InputField label="Address" value={sellerData.address} onChange={(v) => setSellerData({ ...sellerData, address: v })} placeholder="123 Builder Lane" />
                                            </div>
                                            <InputField label="City" value={sellerData.city} onChange={(v) => setSellerData({ ...sellerData, city: v })} placeholder="City" />
                                            <InputField label="Registration/ID Number" value={sellerData.regNumber} onChange={(v) => setSellerData({ ...sellerData, regNumber: v })} placeholder="GSTIN or Reg No." />
                                            <InputField label="Password" type="password" value={sellerData.password} onChange={(v) => setSellerData({ ...sellerData, password: v })} placeholder="Create password" />
                                            <InputField label="Confirm Password" type="password" value={sellerData.confirmPassword} onChange={(v) => setSellerData({ ...sellerData, confirmPassword: v })} placeholder="Confirm password" />
                                        </div>
                                    )
                                )}

                                <Button type="submit" className="w-full bg-[#3FA37C] hover:bg-[#358F6A] text-white py-6 mt-6 text-lg rounded-xl">
                                    {authMode === 'login' ? 'Login' : 'Create Account'}
                                </Button>
                            </form>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default AuthPage;