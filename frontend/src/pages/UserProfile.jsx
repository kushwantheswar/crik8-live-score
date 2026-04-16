import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { User as UserIcon, Calendar, MapPin, Mail, Phone, Target, Save, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const UserProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    date_of_birth: '',
    role: 'Batsman',
    batting_style: 'Right-hand bat',
    bowling_style: 'Right-arm Fast',
    country: 'India',
    state: '',
    city: '',
    village: '',
    pincode: '',
    mobile_number: '',
    email: '',
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.get('players/me/');
      setProfile(res.data);
      setFormData(res.data);
    } catch (err) {
      if (err.response?.status === 404) {
        setIsEditing(true); // Auto-open form if no profile yet
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePincodeChange = async (e) => {
    const code = e.target.value;
    setFormData((prev) => ({ ...prev, pincode: code }));
    
    if (code.length === 6) {
      try {
        const res = await fetch(`https://api.postalpincode.in/pincode/${code}`);
        const data = await res.json();
        if (data[0].Status === 'Success') {
          const postOffice = data[0].PostOffice[0];
          setFormData((prev) => ({
            ...prev,
            state: postOffice.State,
            city: postOffice.District,
          }));
        }
      } catch (err) {
        console.error("Failed to fetch pincode details", err);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      if (profile) {
        // Edit existing
        await api.put(`players/${profile.id}/`, formData);
        setMessage('Profile updated successfully!');
      } else {
        // Create new
        const res = await api.post('players/', formData);
        setProfile(res.data);
        setMessage('Profile created successfully!');
      }
      setIsEditing(false);
      fetchProfile();
    } catch (err) {
      setMessage('An error occurred while saving.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-400">Loading profile...</div>;

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black bg-gradient-to-r from-emerald-400 to-primary-500 bg-clip-text text-transparent">
            Player Profile
          </h1>
          <p className="text-slate-500 mt-1">Manage your cricket identity & details</p>
        </div>
        {!isEditing && (
          <button 
            onClick={() => setIsEditing(true)}
            className="px-6 py-2 glass hover:bg-white/10 text-white rounded-xl font-semibold transition-all border border-white/10"
          >
            Edit Profile
          </button>
        )}
      </div>

      {message && (
        <div className={`mb-6 p-4 rounded-xl flex items-center gap-2 ${message.includes('error') ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}`}>
          <CheckCircle size={18} /> {message}
        </div>
      )}

      <div className="glass rounded-3xl p-8 border border-white/5 shadow-2xl relative overflow-hidden">
        {isEditing ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <h3 className="text-xl font-bold text-white mb-4 border-b border-white/10 pb-2">Basic Info</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Full Name</label>
                <div className="relative">
                  <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                  <input required
                    className="w-full bg-slate-900/60 border border-white/10 rounded-xl py-3 pl-11 pr-4 outline-none focus:border-emerald-500/50 text-white" 
                    value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} 
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Date of Birth</label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                  <input type="date" required
                    className="w-full bg-slate-900/60 border border-white/10 rounded-xl py-3 pl-11 pr-4 outline-none focus:border-emerald-500/50 text-white" 
                    value={formData.date_of_birth} onChange={e => setFormData({...formData, date_of_birth: e.target.value})} 
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Playing Role</label>
                <div className="relative">
                  <Target className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                  <select required
                    className="w-full bg-slate-900/60 border border-white/10 rounded-xl py-3 pl-11 pr-4 outline-none focus:border-emerald-500/50 text-white appearance-none" 
                    value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} 
                  >
                    <option>Batsman</option>
                    <option>Bowler</option>
                    <option>Wicket Keeper</option>
                    <option>All-rounder</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Batting Style</label>
                <div className="relative">
                  <select required
                    className="w-full bg-slate-900/60 border border-white/10 rounded-xl py-3 px-4 outline-none focus:border-emerald-500/50 text-white appearance-none" 
                    value={formData.batting_style} onChange={e => setFormData({...formData, batting_style: e.target.value})} 
                  >
                    <option value="">Select Batting Style</option>
                    <option>Right-hand bat</option>
                    <option>Left-hand bat</option>
                  </select>
                </div>
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-400 mb-2">Bowling Style</label>
                <div className="relative">
                  <select required
                    className="w-full bg-slate-900/60 border border-white/10 rounded-xl py-3 px-4 outline-none focus:border-emerald-500/50 text-white appearance-none" 
                    value={formData.bowling_style} onChange={e => setFormData({...formData, bowling_style: e.target.value})} 
                  >
                    <option value="None">None (Doesn't Bowl)</option>
                    <option>Right-arm Fast</option>
                    <option>Right-arm Medium</option>
                    <option>Right-arm Spin (Off break/Leg break)</option>
                    <option>Left-arm Fast</option>
                    <option>Left-arm Medium</option>
                    <option>Left-arm Spin (Orthodox/Unorthodox)</option>
                  </select>
                </div>
              </div>
            </div>

            <h3 className="text-xl font-bold text-white mt-10 mb-4 border-b border-white/10 pb-2">Location & Contact</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">PIN Code</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                  <input required placeholder="6-digit pincode" maxLength="6"
                    className="w-full bg-slate-900/60 border border-white/10 rounded-xl py-3 pl-11 pr-4 outline-none focus:border-emerald-500/50 text-white transition-colors" 
                    value={formData.pincode} onChange={handlePincodeChange} 
                  />
                </div>
                <p className="text-xs text-slate-500 mt-2 ml-1">Auto-fetches City & State</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">City/District</label>
                  <input required readOnly
                    className="w-full bg-slate-900/30 border border-white/5 rounded-xl py-3 px-4 text-slate-300 outline-none" 
                    value={formData.city} 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">State</label>
                  <input required readOnly
                    className="w-full bg-slate-900/30 border border-white/5 rounded-xl py-3 px-4 text-slate-300 outline-none" 
                    value={formData.state} 
                  />
                </div>
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-400 mb-2">Village / Location</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                  <input 
                    className="w-full bg-slate-900/60 border border-white/10 rounded-xl py-3 pl-11 pr-4 outline-none focus:border-emerald-500/50 text-white" 
                    value={formData.village} onChange={e => setFormData({...formData, village: e.target.value})} 
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Mobile Number</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                  <input required type="tel"
                    className="w-full bg-slate-900/60 border border-white/10 rounded-xl py-3 pl-11 pr-4 outline-none focus:border-emerald-500/50 text-white" 
                    value={formData.mobile_number} onChange={e => setFormData({...formData, mobile_number: e.target.value})} 
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                  <input required type="email"
                    className="w-full bg-slate-900/60 border border-white/10 rounded-xl py-3 pl-11 pr-4 outline-none focus:border-emerald-500/50 text-white" 
                    value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} 
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-4 pt-6 border-t border-white/10 mt-8">
              <button disabled={saving} type="submit" className="flex-1 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50">
                <Save size={20} /> {saving ? 'Saving...' : 'Save Profile'}
              </button>
              {profile && (
                <button type="button" onClick={() => { setIsEditing(false); setFormData(profile); }} className="px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold transition-all border border-white/10">
                  Cancel
                </button>
              )}
            </div>
          </form>
        ) : (
          <div className="space-y-8 animate-in fade-in zoom-in duration-300">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 border-b border-white/10 pb-2">Player Details</h3>
                  <div className="space-y-4">
                    <p className="flex justify-between border-b border-white/5 pb-2"><span className="text-slate-400 flex gap-2 items-center"><UserIcon size={16}/> Name</span> <span className="font-bold text-white">{profile.name}</span></p>
                    <p className="flex justify-between border-b border-white/5 pb-2"><span className="text-slate-400 flex gap-2 items-center"><Target size={16}/> Role</span> <span className="font-bold text-emerald-400">{profile.role}</span></p>
                    <p className="flex justify-between border-b border-white/5 pb-2"><span className="text-slate-400">Batting</span> <span className="font-medium text-white">{profile.batting_style}</span></p>
                    <p className="flex justify-between border-b border-white/5 pb-2"><span className="text-slate-400">Bowling</span> <span className="font-medium text-white">{profile.bowling_style === 'None' ? '-' : profile.bowling_style}</span></p>
                    <p className="flex justify-between border-b border-white/5 pb-2"><span className="text-slate-400 flex gap-2 items-center"><Calendar size={16}/> DOB</span> <span className="font-bold text-white">{profile.date_of_birth}</span></p>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 border-b border-white/10 pb-2">Contact & Location</h3>
                  <div className="space-y-4">
                    <p className="flex justify-between border-b border-white/5 pb-2"><span className="text-slate-400 flex gap-2 items-center"><MapPin size={16}/> Address</span> <span className="font-medium text-right max-w-[200px]">{profile.village ? profile.village + ', ' : ''}{profile.city}, {profile.state} - {profile.pincode}</span></p>
                    <p className="flex justify-between border-b border-white/5 pb-2"><span className="text-slate-400 flex gap-2 items-center"><Phone size={16}/> Mobile</span> <span className="font-medium">{profile.mobile_number}</span></p>
                    <p className="flex justify-between border-b border-white/5 pb-2"><span className="text-slate-400 flex gap-2 items-center"><Mail size={16}/> Email</span> <span className="font-medium">{profile.email}</span></p>
                  </div>
                </div>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;
