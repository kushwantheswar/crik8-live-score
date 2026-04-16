import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import { Activity, Info, List, Users, Table, BarChart2, ChevronLeft, Calendar, Trophy } from 'lucide-react';
import { motion } from 'framer-motion';

const MatchDetail = () => {
  const { id } = useParams();
  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('live');
  const [team1Squad, setTeam1Squad] = useState([]);
  const [team2Squad, setTeam2Squad] = useState([]);

  useEffect(() => {
    const fetchMatch = async () => {
      try {
        const res = await api.get(`matches/${id}/`);
        setMatch(res.data);
        
        // Fetch teams to get players for the 'Squads' tab
        const [t1, t2] = await Promise.all([
          api.get(`teams/${res.data.team1}/`),
          api.get(`teams/${res.data.team2}/`)
        ]);
        setTeam1Squad(t1.data.players || []);
        setTeam2Squad(t2.data.players || []);
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    };
    
    fetchMatch();
    const interval = setInterval(fetchMatch, 10000); // 10s auto-refresh for live scores
    return () => clearInterval(interval);
  }, [id]);

  if (loading) return (
    <div className="flex h-screen items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary-500"></div>
    </div>
  );

  if (!match) return <div className="text-center p-20 text-white">Match not found.</div>;

  const tabs = [
    { id: 'info', label: 'Info', icon: Info },
    { id: 'live', label: 'Live', icon: Activity },
    { id: 'scorecard', label: 'Scorecard', icon: List },
    { id: 'squads', label: 'Squads', icon: Users },
    { id: 'points_table', label: 'Points Table', icon: Table },
    { id: 'overs', label: 'Overs', icon: Activity },
    { id: 'graphs', label: 'Graphs', icon: BarChart2 },
  ];

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 space-y-8 animate-in fade-in duration-500">
      <Link to="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-primary-400 font-semibold mb-2 transition-colors">
        <ChevronLeft size={20} /> Back to Matches
      </Link>

      {/* Match Header */}
      <div className="glass p-8 rounded-3xl relative overflow-hidden border border-white/5 shadow-2xl">
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <Trophy size={150} />
        </div>
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-8">
             <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-500">
               <Calendar size={14} /> {new Date(match.match_date).toLocaleDateString()}
             </div>
             <div className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest ${match.status === 'Ongoing' ? 'bg-red-500/20 text-red-500 animate-pulse border border-red-500/30' : match.status === 'Completed' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-primary-500/20 text-primary-400 border border-primary-500/30'}`}>
               {match.status}
             </div>
          </div>
          
          <div className="flex items-center justify-between text-center md:px-10">
            <div className="flex-1">
              <h2 className="text-4xl md:text-5xl font-black text-white">{match.team1_name}</h2>
            </div>
            <div className="px-8 flex-shrink-0">
               <span className="text-3xl font-black italic text-slate-700">VS</span>
            </div>
            <div className="flex-1">
              <h2 className="text-4xl md:text-5xl font-black text-white">{match.team2_name}</h2>
            </div>
          </div>

          <div className="mt-10 text-center">
             {match.latest_score ? (
                <>
                  <h1 className="text-5xl font-black text-primary-400 mb-2">{match.latest_score.score_details}</h1>
                  <p className="text-slate-400 max-w-2xl mx-auto italic">{match.latest_score.commentary}</p>
                </>
             ) : (
                <h1 className="text-2xl font-bold text-slate-500">Match hasn't started yet</h1>
             )}
          </div>
        </div>
      </div>

      {/* Modern Navigation Tabs */}
      <div className="overflow-x-auto hide-scrollbar">
        <div className="flex gap-2 p-1.5 glass rounded-2xl w-max">
          {tabs.map((tab) => {
             const Icon = tab.icon;
             return (
               <button
                 key={tab.id}
                 onClick={() => setActiveTab(tab.id)}
                 className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all whitespace-nowrap ${
                   activeTab === tab.id 
                     ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/20' 
                     : 'text-slate-400 hover:text-white hover:bg-white/5'
                 }`}
               >
                 <Icon size={18} />
                 {tab.label}
               </button>
             );
          })}
        </div>
      </div>

      {/* Tab Content Area */}
      <div className="glass p-8 rounded-3xl min-h-[400px]">
         {activeTab === 'info' && (
           <div className="space-y-6">
              <h3 className="text-2xl font-bold text-white mb-6">Match Information</h3>
              <div className="grid grid-cols-2 gap-4 max-w-lg">
                <div className="text-slate-500 font-medium tracking-wide">Tournament</div>
                <div className="font-bold text-white">Live League</div>
                <div className="text-slate-500 font-medium tracking-wide">Date & Time</div>
                <div className="font-bold text-white">{new Date(match.match_date).toLocaleString()}</div>
                <div className="text-slate-500 font-medium tracking-wide">Venue</div>
                <div className="font-bold text-white">Central Stadium</div>
                <div className="text-slate-500 font-medium tracking-wide">Toss</div>
                <div className="font-bold text-white">To be decided</div>
              </div>
           </div>
         )}

         {activeTab === 'live' && (
           <div className="space-y-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                <h3 className="text-2xl font-bold text-white">Live Coverage</h3>
              </div>
              
              {match.latest_score ? (
                <div className="relative pl-8 border-l-2 border-primary-500/30 space-y-8">
                   <div className="relative">
                     <div className="absolute -left-[41px] top-0 w-5 h-5 bg-primary-500 rounded-full border-4 border-slate-950"></div>
                     <span className="text-xs font-bold text-primary-400 uppercase tracking-widest mb-2 block">Latest Update</span>
                     <p className="text-xl text-white font-medium bg-white/5 p-4 rounded-xl border border-white/5">
                       {match.latest_score.commentary || "Score updated: " + match.latest_score.score_details}
                     </p>
                   </div>
                   <div className="opacity-50 text-center pt-8 border-t border-white/5 text-sm uppercase tracking-widest font-bold">Waiting for next ball...</div>
                </div>
              ) : (
                <div className="text-center py-20 text-slate-500">Live commentary will appear here once the match begins.</div>
              )}
           </div>
         )}

         {activeTab === 'scorecard' && (
           <div>
              <h3 className="text-2xl font-bold text-white mb-6">Detailed Scorecard</h3>
              <div className="bg-slate-900/50 rounded-2xl overflow-hidden border border-white/5 mb-8">
                 <div className="bg-primary-600/20 px-6 py-4 border-b border-white/5">
                   <h4 className="font-black text-primary-400">{match.team1_name} Innings</h4>
                 </div>
                 <div className="p-10 text-center text-slate-500">
                    Detailed Batting & Bowling figures will sync here shortly.
                 </div>
              </div>
              <div className="bg-slate-900/50 rounded-2xl overflow-hidden border border-white/5">
                 <div className="bg-primary-600/20 px-6 py-4 border-b border-white/5">
                   <h4 className="font-black text-primary-400">{match.team2_name} Innings</h4>
                 </div>
                 <div className="p-10 text-center text-slate-500">
                    Detailed Batting & Bowling figures will sync here shortly.
                 </div>
              </div>
           </div>
         )}

         {activeTab === 'squads' && (
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                 <h3 className="text-xl font-black text-white mb-4 bg-slate-900/50 p-4 rounded-xl text-center border border-white/5">{match.team1_name}</h3>
                 <div className="space-y-2">
                   {team1Squad.map(p => (
                     <div key={p.id} className="flex justify-between items-center p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors">
                       <span className="font-bold text-white">{p.name}</span>
                       <span className="text-xs uppercase bg-primary-500/20 text-primary-400 px-3 py-1 rounded-full">{p.role}</span>
                     </div>
                   ))}
                   {team1Squad.length === 0 && <p className="text-center text-slate-500 py-4">Squad unannounced</p>}
                 </div>
              </div>
              <div>
                 <h3 className="text-xl font-black text-white mb-4 bg-slate-900/50 p-4 rounded-xl text-center border border-white/5">{match.team2_name}</h3>
                 <div className="space-y-2">
                   {team2Squad.map(p => (
                     <div key={p.id} className="flex justify-between items-center p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors">
                       <span className="font-bold text-white">{p.name}</span>
                       <span className="text-xs uppercase bg-primary-500/20 text-primary-400 px-3 py-1 rounded-full">{p.role}</span>
                     </div>
                   ))}
                   {team2Squad.length === 0 && <p className="text-center text-slate-500 py-4">Squad unannounced</p>}
                 </div>
              </div>
           </div>
         )}

         {(activeTab === 'points_table' || activeTab === 'overs' || activeTab === 'graphs') && (
           <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
              <div className="p-6 bg-slate-800/50 rounded-full border border-white/5 shadow-inner">
                 <BarChart2 size={48} className="text-slate-600" />
              </div>
              <h3 className="text-2xl font-bold text-white">Analytics Engine Booting...</h3>
              <p className="text-slate-500 max-w-sm">
                Advanced {tabLabel(activeTab)} data, visualizations, and tracking will populate as the match progresses.
              </p>
           </div>
         )}
      </div>
    </div>
  );
};

// helper for tab label
function tabLabel(id) {
  if (id === 'points_table') return 'Points Table';
  if (id === 'overs') return 'Over-by-Over';
  if (id === 'graphs') return 'Graphs & Wagon Wheel';
  return id;
}

export default MatchDetail;
