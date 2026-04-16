import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, Lock, User as UserIcon, Mail, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const PasswordStrength = ({ password }) => {
  const checks = [
    { label: 'At least 8 characters', ok: password.length >= 8 },
    { label: 'Contains a number', ok: /\d/.test(password) },
    { label: 'Contains a letter', ok: /[a-zA-Z]/.test(password) },
  ];
  const strength = checks.filter((c) => c.ok).length;
  const colors = ['bg-red-500', 'bg-yellow-500', 'bg-emerald-500'];
  const labels = ['Weak', 'Fair', 'Strong'];

  if (!password) return null;

  return (
    <div className="mt-2 space-y-2">
      <div className="flex gap-1.5">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-all duration-300 ${
              i < strength ? colors[strength - 1] : 'bg-slate-700'
            }`}
          />
        ))}
      </div>
      <p className={`text-xs font-medium ${strength === 3 ? 'text-emerald-400' : strength === 2 ? 'text-yellow-400' : 'text-red-400'}`}>
        {labels[strength - 1] || 'Weak'}
      </p>
      <ul className="space-y-1">
        {checks.map((c) => (
          <li key={c.label} className={`text-xs flex items-center gap-1.5 ${c.ok ? 'text-emerald-400' : 'text-slate-500'}`}>
            <CheckCircle size={11} className={c.ok ? 'opacity-100' : 'opacity-30'} />
            {c.label}
          </li>
        ))}
      </ul>
    </div>
  );
};

const Register = () => {
  const [form, setForm] = useState({ username: '', email: '', password: '', confirm: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirm) {
      setError('Passwords do not match.');
      return;
    }
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setLoading(true);
    try {
      // Call the API first — only show success AFTER it works
      const user = await register({
        username: form.username,
        email: form.email,
        password: form.password,
      });
      setSuccess(true); // show success only on real success
      if (user?.is_staff) navigate('/admin');
      else navigate('/');
    } catch (err) {
      setSuccess(false);
      const data = err?.response?.data;
      if (data?.username) setError(`Username: ${Array.isArray(data.username) ? data.username[0] : data.username}`);
      else if (data?.email) setError(`Email: ${Array.isArray(data.email) ? data.email[0] : data.email}`);
      else if (data?.password) setError(`Password: ${Array.isArray(data.password) ? data.password[0] : data.password}`);
      else if (data?.detail) setError(data.detail);
      else setError('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center py-16 px-4">
      {/* Background glow orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-primary-600/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-accent-600/10 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        className="w-full max-w-md glass p-10 rounded-3xl shadow-2xl relative overflow-hidden"
      >
        {/* Top gradient bar */}
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-emerald-500 via-primary-500 to-accent-600" />

        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.1 }}
            className="inline-flex p-4 rounded-2xl bg-emerald-500/10 text-emerald-400 mb-4"
          >
            <UserPlus size={32} />
          </motion.div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            Create Account
          </h1>
          <p className="text-slate-500 mt-2 text-sm">Join Crik8 — your cricket hub</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="p-4 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl text-sm font-medium"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Success flash */}
          <AnimatePresence>
            {success && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl text-sm font-medium flex items-center gap-2"
              >
                <CheckCircle size={16} /> Account created! Logging you in…
              </motion.div>
            )}
          </AnimatePresence>

          {/* Username */}
          <div className="relative group">
            <UserIcon
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-400 transition-colors"
              size={18}
            />
            <input
              id="register-username"
              type="text"
              name="username"
              placeholder="Username"
              value={form.username}
              onChange={handleChange}
              autoComplete="username"
              className="w-full bg-slate-900/60 border border-white/10 rounded-xl py-4 pl-11 pr-4 outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/15 transition-all text-white placeholder:text-slate-600"
              required
            />
          </div>

          {/* Email */}
          <div className="relative group">
            <Mail
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-400 transition-colors"
              size={18}
            />
            <input
              id="register-email"
              type="email"
              name="email"
              placeholder="Email address"
              value={form.email}
              onChange={handleChange}
              autoComplete="email"
              className="w-full bg-slate-900/60 border border-white/10 rounded-xl py-4 pl-11 pr-4 outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/15 transition-all text-white placeholder:text-slate-600"
              required
            />
          </div>

          {/* Password */}
          <div>
            <div className="relative group">
              <Lock
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-400 transition-colors"
                size={18}
              />
              <input
                id="register-password"
                type={showPwd ? 'text' : 'password'}
                name="password"
                placeholder="Password"
                value={form.password}
                onChange={handleChange}
                autoComplete="new-password"
                className="w-full bg-slate-900/60 border border-white/10 rounded-xl py-4 pl-11 pr-12 outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/15 transition-all text-white placeholder:text-slate-600"
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
            <PasswordStrength password={form.password} />
          </div>

          {/* Confirm password */}
          <div className="relative group">
            <Lock
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-400 transition-colors"
              size={18}
            />
            <input
              id="register-confirm"
              type={showConfirm ? 'text' : 'password'}
              name="confirm"
              placeholder="Confirm password"
              value={form.confirm}
              onChange={handleChange}
              autoComplete="new-password"
              className={`w-full bg-slate-900/60 border rounded-xl py-4 pl-11 pr-12 outline-none transition-all text-white placeholder:text-slate-600 ${
                form.confirm && form.confirm !== form.password
                  ? 'border-red-500/50 focus:ring-2 focus:ring-red-500/15'
                  : form.confirm && form.confirm === form.password
                  ? 'border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/15'
                  : 'border-white/10 focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/15'
              }`}
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
            >
              {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {form.confirm && form.confirm !== form.password && (
            <p className="text-xs text-red-400 -mt-3 pl-1">Passwords don't match</p>
          )}

          {/* Submit */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading || success}
            id="register-submit"
            className="w-full py-4 bg-gradient-to-r from-emerald-600 to-primary-600 hover:from-emerald-500 hover:to-primary-500 text-white rounded-xl font-bold text-base transition-all shadow-lg shadow-emerald-600/20 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading || success ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                {success ? 'Logging in…' : 'Creating account…'}
              </span>
            ) : (
              'Create Account'
            )}
          </motion.button>
        </form>

        {/* Footer link */}
        <div className="mt-7 text-center text-slate-500 text-sm">
          Already have an account?{' '}
          <Link
            to="/login"
            className="text-emerald-400 hover:text-emerald-300 font-semibold transition-colors hover:underline"
          >
            Sign In
          </Link>
        </div>

        {/* Decorative cricket ball SVG */}
        <div className="absolute -bottom-8 -right-8 w-32 h-32 opacity-5">
          <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="50" cy="50" r="48" fill="white" stroke="white" strokeWidth="2" />
            <path d="M50 2 Q80 20 98 50 Q80 80 50 98 Q20 80 2 50 Q20 20 50 2Z" stroke="white" strokeWidth="3" fill="none" />
          </svg>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
