import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Calendar, MapPin, Award, 
  Activity, TrendingUp, ChevronLeft, 
  Clock, Share2, Star, Mail, Phone,
  Target, Zap, Shield
} from 'lucide-react';

const PlayerDetail = () => {
  const { id } = useParams();
  const [player, setPlayer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeRankingTab, setActiveRankingTab] = useState('batting');

  useEffect(() => {
    const fetchPlayer = async () => {
      try {
        const res = await api.get(`players/${id}/`);
        setPlayer(res.data);
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    };
    fetchPlayer();
  }, [id]);

  if (loading) return (
    <div className="flex h-screen items-center justify-center">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-primary-500 border-opacity-50"></div>
    </div>
  );

  if (!player) return (
    <div className="text-center py-20 bg-slate-900/50 rounded-3xl border border-white/5">
      <User size={64} className="mx-auto text-slate-700 mb-4" />
      <p className="text-slate-400 text-xl font-medium">Player profile not found.</p>
      <Link to="/" className="mt-6 inline-block text-primary-400 hover:underline">Return Home</Link>
    </div>
  );

  const careerStats = player.batting_career || {};
  const formats = ['TEST', 'ODI', 'T20'];

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20">
      {/* Breadcrumbs / Back */}
      <Link to="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-white transition-colors group">
        <div className="p-2 rounded-full group-hover:bg-white/5">
          <ChevronLeft size={20} />
        </div>
        <span className="font-medium text-sm">Back to Matches</span>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Column: Profile Card & Sidebar Info */}
        <div className="lg:col-span-1 space-y-6">
          {/* Profile Header Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-3xl overflow-hidden relative"
          >
            <div className="h-24 bg-gradient-to-r from-primary-600 to-accent-600 opacity-20"></div>
            <div className="px-6 pb-8 -mt-12 text-center">
              <div className="relative inline-block">
                {player.image_url ? (
                  <img src={player.image_url} alt={player.name} className="w-32 h-32 rounded-3xl object-cover border-4 border-slate-950 shadow-2xl mx-auto" />
                ) : (
                  <div className="w-32 h-32 rounded-3xl bg-slate-800 border-4 border-slate-950 shadow-2xl mx-auto flex items-center justify-center">
                    <User size={48} className="text-slate-600" />
                  </div>
                )}
                <div className="absolute -bottom-2 -right-2 p-1.5 bg-primary-500 rounded-xl shadow-lg border-2 border-slate-950">
                  <Star size={16} className="text-white fill-white" />
                </div>
              </div>

              <h1 className="mt-6 text-2xl font-black tracking-tight">{player.name}</h1>
              <div className="mt-2 flex items-center justify-center gap-2 text-slate-400">
                <img src={`https://flagsapi.com/IN/flat/24.png`} alt={player.country} className="w-5 h-5 rounded-sm opacity-80" />
                <span className="font-bold text-xs uppercase tracking-widest">{player.country}</span>
              </div>
            </div>

            <div className="border-t border-white/5 p-6 space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500 font-medium">Born</span>
                <span className="text-white font-bold">{player.date_of_birth || 'Jan 01, 1990'}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500 font-medium">Birth Place</span>
                <span className="text-white font-bold truncate max-w-[120px]">{player.birth_place || 'Not set'}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500 font-medium">Role</span>
                <span className="px-3 py-1 bg-primary-500/10 text-primary-400 rounded-full text-xs font-black uppercase">{player.role}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500 font-medium">Batting</span>
                <span className="text-white font-bold">{player.batting_style || 'Right Hand Bat'}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500 font-medium">Bowling</span>
                <span className="text-white font-bold">{player.bowling_style || 'Not set'}</span>
              </div>
            </div>
          </motion.div>

          {/* ICC Rankings Widget */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass rounded-3xl p-6"
          >
            <div className="flex items-center gap-2 mb-6">
              <Award className="text-yellow-500" size={18} />
              <h3 className="font-bold uppercase text-xs tracking-widest text-slate-500">ICC Rankings</h3>
            </div>
            
            <div className="flex p-1 bg-white/5 rounded-2xl mb-6">
              {['batting', 'bowling', 'all-rounder'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveRankingTab(tab)}
                  className={`flex-1 py-1.5 rounded-xl text-[10px] font-black uppercase transition-all ${activeRankingTab === tab ? 'bg-primary-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  {tab.split('-')[0]}
                </button>
              ))}
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-3 text-[10px] font-black uppercase text-slate-600 px-2">
                <span>Format</span>
                <span className="text-center">Current</span>
                <span className="text-right">Best</span>
              </div>
              {formats.map(fmt => (
                <div key={fmt} className="grid grid-cols-3 items-center px-2 py-3 bg-white/2 rounded-xl border border-white/5">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-tighter">{fmt}</span>
                  <span className="text-center font-black text-white">--</span>
                  <span className="text-right font-black text-slate-500">--</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Teams List */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass rounded-3xl p-6"
          >
            <h3 className="font-bold uppercase text-xs tracking-widest text-slate-500 mb-4">Current Teams</h3>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1.5 bg-slate-900 border border-white/10 rounded-xl text-xs font-bold hover:border-primary-500/50 cursor-default transition-colors">
                {player.team_name || 'Free Agent'}
              </span>
              <span className="px-3 py-1.5 bg-slate-900 border border-white/10 rounded-xl text-xs font-bold opacity-50">Local League XI</span>
            </div>
          </motion.div>
        </div>

        {/* Right Columns: Main Statistics Grid */}
        <div className="lg:col-span-3 space-y-8">
          
          {/* Recent Form Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Batting Form */}
            <motion.div 
               initial={{ opacity: 0, x: 20 }} 
               animate={{ opacity: 1, x: 0 }}
               className="glass rounded-3xl overflow-hidden"
            >
              <div className="p-6 border-b border-white/5 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Zap className="text-yellow-400" size={18} />
                  <h3 className="font-black italic uppercase tracking-tight">Batting Form</h3>
                </div>
                <div className="h-1 w-12 bg-primary-500 rounded-full"></div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="text-slate-500 font-bold uppercase text-[10px]">
                    <tr>
                      <th className="px-6 py-4">Score</th>
                      <th className="px-6 py-4">OPPN.</th>
                      <th className="px-6 py-4">Format</th>
                      <th className="px-6 py-4 text-right">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {player.batting_form?.length > 0 ? player.batting_form.map((f, i) => (
                      <tr key={i} className="hover:bg-white/2 transition-colors">
                        <td className="px-6 py-4 font-black text-primary-400">{f.score}</td>
                        <td className="px-6 py-4 font-bold">{f.oppn}</td>
                        <td className="px-6 py-4 text-xs font-black text-slate-500 uppercase">{f.format}</td>
                        <td className="px-6 py-4 text-right text-xs font-medium text-slate-500">{f.date}</td>
                      </tr>
                    )) : (
                      <tr><td colSpan="4" className="px-6 py-10 text-center text-slate-500 italic">No recent innings recorded</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </motion.div>

            {/* Bowling Form */}
            <motion.div 
               initial={{ opacity: 0, x: 20 }} 
               animate={{ opacity: 1, x: 0 }}
               transition={{ delay: 0.1 }}
               className="glass rounded-3xl overflow-hidden"
            >
              <div className="p-6 border-b border-white/5 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Activity className="text-emerald-400" size={18} />
                  <h3 className="font-black italic uppercase tracking-tight">Bowling Form</h3>
                </div>
                <div className="h-1 w-12 bg-emerald-500 rounded-full"></div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="text-slate-500 font-bold uppercase text-[10px]">
                    <tr>
                      <th className="px-6 py-4">Wickets</th>
                      <th className="px-6 py-4">OPPN.</th>
                      <th className="px-6 py-4">Format</th>
                      <th className="px-6 py-4 text-right">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {player.bowling_form?.length > 0 ? player.bowling_form.map((f, i) => (
                      <tr key={i} className="hover:bg-white/2 transition-colors">
                        <td className="px-6 py-4 font-black text-emerald-400">{f.wickets}</td>
                        <td className="px-6 py-4 font-bold">{f.oppn}</td>
                        <td className="px-6 py-4 text-xs font-black text-slate-500 uppercase">{f.format}</td>
                        <td className="px-6 py-4 text-right text-xs font-medium text-slate-500">{f.date}</td>
                      </tr>
                    )) : (
                      <tr><td colSpan="4" className="px-6 py-10 text-center text-slate-500 italic">No recent matches recorded</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </motion.div>
          </div>

          {/* Batting Career Summary */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="glass rounded-3xl overflow-hidden relative"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary-600 via-primary-400 to-transparent opacity-50"></div>
            <div className="p-8 border-b border-white/5 flex items-center justify-between">
               <div className="flex items-center gap-3">
                 <div className="p-2 bg-primary-500/10 rounded-xl text-primary-400"><TrendingUp size={24} /></div>
                 <div>
                   <h3 className="text-xl font-black italic uppercase tracking-tight">Batting Career Summary</h3>
                   <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Aggregated statistics across formats</p>
                 </div>
               </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-white/2 text-[10px] font-black uppercase text-slate-500 tracking-wider">
                  <tr>
                    <th className="px-8 py-4 bg-slate-900/40">Statistic</th>
                    {formats.map(fmt => <th key={fmt} className="px-6 py-4 text-center">{fmt}</th>)}
                    <th className="px-6 py-4 text-center text-primary-400">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-medium text-sm">
                  {[
                    { label: 'Matches', key: 'matches' },
                    { label: 'Innings', key: 'innings' },
                    { label: 'Runs', key: 'runs', highlight: true },
                    { label: 'Balls', key: 'balls' },
                    { label: 'Highest', key: 'highest' },
                    { label: 'Average', key: 'avg' },
                    { label: 'Strike Rate', key: 'sr' },
                    { label: 'Fours', key: 'fours' },
                    { label: 'Sixes', key: 'sixes' },
                    { label: 'Not Out', key: 'not_out' },
                  ].map((row, i) => (
                    <tr key={row.key} className="hover:bg-primary-500/5 transition-colors group">
                      <td className="px-8 py-3.5 font-bold text-slate-400 group-hover:text-white transition-colors border-r border-white/5">{row.label}</td>
                      {formats.map(fmt => (
                        <td key={fmt} className="px-6 py-3.5 text-center font-black">
                          {careerStats[fmt]?.[row.key] ?? '0'}
                        </td>
                      ))}
                      <td className={`px-6 py-3.5 text-center font-black ${row.highlight ? 'text-primary-400 text-lg' : 'text-slate-500'}`}>
                        {formats.reduce((acc, fmt) => acc + (parseFloat(careerStats[fmt]?.[row.key]) || 0), 0) || '0'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>

          {/* Bowling Career Summary */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="glass rounded-3xl overflow-hidden relative"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-600 via-emerald-400 to-transparent opacity-50"></div>
            <div className="p-8 border-b border-white/5 flex items-center justify-between">
               <div className="flex items-center gap-3">
                 <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-400"><Shield size={24} /></div>
                 <div>
                   <h3 className="text-xl font-black italic uppercase tracking-tight text-white">Bowling Career Summary</h3>
                   <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Defensive performance metrics</p>
                 </div>
               </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left font-medium text-sm">
                <thead className="bg-white/2 text-[10px] font-black uppercase text-slate-500 tracking-wider">
                  <tr>
                    <th className="px-8 py-4 bg-slate-900/40">Statistic</th>
                    {formats.map(fmt => <th key={fmt} className="px-6 py-4 text-center">{fmt}</th>)}
                    <th className="px-6 py-4 text-center text-emerald-400">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {[
                    { label: 'Matches', key: 'matches' },
                    { label: 'Wickets', key: 'wickets', highlight: true },
                    { label: 'Runs', key: 'runs' },
                    { label: 'Balls', key: 'balls' },
                    { label: 'Maidens', key: 'maidens' },
                    { label: 'Average', key: 'avg' },
                    { label: 'Economy', key: 'eco' },
                  ].map((row, i) => (
                    <tr key={row.key} className="hover:bg-emerald-500/5 transition-colors group">
                      <td className="px-8 py-3.5 font-bold text-slate-400 group-hover:text-white transition-colors border-r border-white/5">{row.label}</td>
                      {formats.map(fmt => (
                        <td key={fmt} className="px-6 py-3.5 text-center font-black">
                          {player.bowling_career?.[fmt]?.[row.key] ?? '0'}
                        </td>
                      ))}
                      <td className={`px-6 py-3.5 text-center font-black ${row.highlight ? 'text-emerald-400 text-lg' : 'text-slate-500'}`}>
                        {formats.reduce((acc, fmt) => acc + (parseFloat(player.bowling_career?.[fmt]?.[row.key]) || 0), 0) || '0'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default PlayerDetail;
