import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Trophy, User, LogOut, LayoutDashboard, Home as HomeIcon } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="sticky top-0 z-50 glass py-4 px-6 border-b border-white/10">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="bg-primary-500 p-2 rounded-xl group-hover:rotate-12 transition-transform">
            <Trophy className="text-white w-6 h-6" />
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            Crik8 Live
          </span>
        </Link>

        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-1 hover:text-primary-400 transition-colors">
            <HomeIcon size={18} />
            Home
          </Link>
          
          {user ? (
            <>
              {user.is_staff && (
                <Link to="/admin" className="flex items-center gap-1 hover:text-primary-400 transition-colors">
                  <LayoutDashboard size={18} />
                  Dashboard
                </Link>
              )}
              <div className="flex items-center gap-4 pl-4 border-l border-white/10">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-sm font-bold">
                    {user.username[0].toUpperCase()}
                  </div>
                  <span className="hidden sm:inline text-slate-300 font-medium">{user.username}</span>
                </div>
                <button 
                  onClick={logout}
                  className="p-2 rounded-lg hover:bg-white/5 text-slate-400 hover:text-red-400 transition-all"
                  title="Logout"
                >
                  <LogOut size={20} />
                </button>
              </div>
            </>
          ) : (
            <Link 
              to="/login" 
              className="px-6 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-xl font-semibold transition-all shadow-lg shadow-primary-600/20"
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
