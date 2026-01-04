import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { api } from '@/lib/api';

const Profile = ({ onNavigate }) => {
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState(null);
    const [form, setForm] = useState({});

    useEffect(() => {
        let mounted = true;
        const load = async () => {
            try {
                const data = await api.getProfile();
                if (!mounted) return;
                setProfile(data);
                // Normalize form
                const f = {
                    email: data.email || data.email_address || data.E || '',
                    phone: data.phone || data.contact_number || data.contactNumber || '',
                    city: data.city || '',
                    name: data.name || data.org_name || ''
                };
                setForm(f);
            } catch (e) {
                toast({ title: 'Failed', description: e.message || 'Unable to load profile', variant: 'destructive' });
            } finally {
                if (mounted) setLoading(false);
            }
        };
        load();
        return () => { mounted = false; };
    }, []);

    const handleChange = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {};
            // Only send fields that exist in form
            if ('email' in form) payload.email = form.email;
            if ('phone' in form) payload.phone = form.phone;
            if ('city' in form) payload.city = form.city;
            if ('name' in form) payload.name = form.name;
            if ('contact_number' in form) payload.contact_number = form.contact_number;

            const updated = await api.updateProfile(payload);
            toast({ title: 'Profile Updated', description: 'Your profile was updated successfully.' });
            setProfile(updated);
        } catch (err) {
            toast({ title: 'Update Failed', description: err.message || 'Failed to update', variant: 'destructive' });
        }
    };

    if (loading) return <div className="p-6 text-gray-400">Loading...</div>;
    if (!profile) return <div className="p-6 text-gray-400">No profile data</div>;

    return (
        <div className="p-6 max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-white mb-4">Profile</h2>
            <form onSubmit={handleSubmit} className="space-y-4 bg-[#0F1A17] p-6 rounded-lg border border-gray-800">
                <label className="block text-sm text-gray-400">Name</label>
                <input value={form.name || ''} onChange={(e) => handleChange('name', e.target.value)} className="w-full px-3 py-2 rounded bg-[#1E2A26] text-white border border-gray-700" />

                <label className="block text-sm text-gray-400">Email</label>
                <input value={form.email || ''} onChange={(e) => handleChange('email', e.target.value)} className="w-full px-3 py-2 rounded bg-[#1E2A26] text-white border border-gray-700" />

                <label className="block text-sm text-gray-400">Contact Number</label>
                <input value={form.phone || ''} onChange={(e) => handleChange('phone', e.target.value)} className="w-full px-3 py-2 rounded bg-[#1E2A26] text-white border border-gray-700" />

                <label className="block text-sm text-gray-400">City</label>
                <input value={form.city || ''} onChange={(e) => handleChange('city', e.target.value)} className="w-full px-3 py-2 rounded bg-[#1E2A26] text-white border border-gray-700" />

                <div className="flex gap-2">
                    <Button type="submit" className="bg-[#3FA37C]">Save Changes</Button>
                    <Button variant="outline" onClick={() => onNavigate && onNavigate('buyer-home')}>Cancel</Button>
                </div>
            </form>
        </div>
    );
};

export default Profile;
