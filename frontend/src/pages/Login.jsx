import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { LogIn, Lock, User as UserIcon, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';

const Login = () => {
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
      if (user.is_staff) {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError('Invalid username or password');
    }
    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center py-20">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md glass p-10 rounded-3xl shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary-600 to-accent-600"></div>
        
        <div className="text-center mb-10">
          <div className="inline-flex p-4 rounded-2xl bg-primary-500/10 text-primary-500 mb-4">
            <LogIn size={32} />
          </div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            Welcome Back
          </h2>
          <p className="text-slate-500 mt-2">Access your cricket dashboard</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-sm font-medium">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div className="relative group">
              <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary-500 transition-colors" size={20} />
              <input 
                type="text" 
                placeholder="Username" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-4 pl-12 pr-4 outline-none focus:border-primary-500/50 focus:ring-4 focus:ring-primary-500/10 transition-all text-white"
                required
              />
            </div>

            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary-500 transition-colors" size={20} />
              <input 
                type={showPwd ? 'text' : 'password'}
                placeholder="Password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-4 pl-12 pr-12 outline-none focus:border-primary-500/50 focus:ring-4 focus:ring-primary-500/10 transition-all text-white"
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
            className="w-full py-4 bg-primary-600 hover:bg-primary-500 text-white rounded-xl font-bold text-lg transition-all shadow-lg shadow-primary-600/20 disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-8 text-center text-slate-500 text-sm">
          Don't have an account?{' '}
          <Link to="/register" className="text-primary-400 hover:text-primary-300 font-semibold transition-colors hover:underline">
            Create Account
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
