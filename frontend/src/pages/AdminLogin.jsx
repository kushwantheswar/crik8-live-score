import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Shield, Lock, User as UserIcon, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';

const AdminLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(username, password);
      // Explicitly check for admin access here
      if (!user.is_staff) {
        setError('Access denied. Admin privileges required.');
        // Optionally logout if you want to strictly ban them
        // logout(); 
      } else {
        navigate('/admin');
      }
    } catch (err) {
      if (!err.response) {
        setError('Connection to server failed. Please ensure the backend is running.');
      } else if (err.response.status === 401) {
        setError('Invalid admin credentials.');
      } else {
        setError('An unexpected error occurred. Please try again later.');
      }
    }
    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center py-20 px-4">
      {/* Background glow specific to admin */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-blue-600/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full bg-indigo-600/10 blur-3xl" />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-md bg-slate-900/80 backdrop-blur-xl p-10 rounded-3xl shadow-2xl relative overflow-hidden border border-white/10"
      >
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-600 to-indigo-600"></div>
        
        <div className="text-center mb-10">
          <div className="inline-flex p-4 rounded-2xl bg-blue-500/10 text-blue-500 mb-4 shadow-[0_0_20px_rgba(59,130,246,0.3)]">
            <Shield size={36} className="text-blue-400" />
          </div>
          <h2 className="text-3xl font-black bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent transform tracking-tight">
            Admin Login
          </h2>
          <p className="text-slate-500 mt-2 font-medium">Restricted System Access</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-sm font-medium"
            >
              {error}
            </motion.div>
          )}

          <div className="space-y-4">
            <div className="relative group">
              <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" size={20} />
              <input 
                type="text" 
                placeholder="Admin ID" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-slate-950/50 border border-white/5 rounded-xl py-4 pl-12 pr-4 outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all text-white placeholder-slate-600 font-medium"
                required
              />
            </div>

            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" size={20} />
              <input 
                type={showPwd ? 'text' : 'password'}
                placeholder="Secret Key" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-950/50 border border-white/5 rounded-xl py-4 pl-12 pr-12 outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all text-white placeholder-slate-600 font-medium tracking-wider"
                required
              />
              <button
                type="button"
                onClick={() => setShowPwd(!showPwd)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
              >
                {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl font-bold text-lg transition-all shadow-lg shadow-blue-600/30 disabled:opacity-50 tracking-wide"
          >
            {loading ? 'Authenticating...' : 'Authorize Access'}
          </button>
        </form>

      </motion.div>
    </div>
  );
};

export default AdminLogin;
