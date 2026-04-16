import { useState, useEffect } from 'react';
import api from '../api/axios';
import { Table, Calendar, Users, ChevronRight, Activity, Trophy } from 'lucide-react';
import { motion } from 'framer-motion';

const Home = () => {
  const [matches, setMatches] = useState([]);
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [matchRes, tournamentRes] = await Promise.all([
          api.get('matches/'),
          api.get('tournaments/')
        ]);
        setMatches(matchRes.data);
        setTournaments(tournamentRes.data);
      } catch (err) {
        console.error("Error fetching data", err);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  if (loading) return (
    <div className="flex h-64 items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary-500"></div>
    </div>
  );

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="relative rounded-3xl overflow-hidden aspect-[21/9] flex items-center p-12">
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent z-10"></div>
        <img 
          src="https://images.unsplash.com/photo-1531415074968-036ba1b575da?q=80&w=2067&auto=format&fit=crop" 
          alt="Cricket Stadium" 
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="relative z-20 max-w-2xl space-y-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-500/20 text-primary-400 border border-primary-500/30 text-sm font-semibold"
          >
            <Activity size={16} />
            Live Coverage
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-6xl font-black leading-tight"
          >
            Experience Cricket <br />
            <span className="text-primary-500">Redefined.</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-slate-400 text-lg"
          >
            Get real-time scores, exclusive tournament insights, and apply to showcase your talent in the upcoming leagues.
          </motion.p>
        </div>
      </section>

      {/* Matches Grid */}
      <section className="space-y-6">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-3xl font-bold">Live & Upcoming</h2>
            <p className="text-slate-400">Never miss a single ball of the action</p>
          </div>
          <button className="text-primary-400 font-semibold flex items-center gap-1 hover:gap-2 transition-all">
            View All <ChevronRight size={20} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {matches.length > 0 ? matches.map((match) => (
            <motion.div 
              key={match.id}
              whileHover={{ y: -5 }}
              className="glass p-6 rounded-2xl space-y-4 hover:border-primary-500/50 transition-colors"
            >
              <div className="flex justify-between items-center text-xs font-bold text-slate-500 uppercase tracking-widest">
                <span>{new Date(match.match_date).toLocaleDateString()}</span>
                <span className={`px-2 py-1 rounded-md ${match.status === 'Ongoing' ? 'bg-red-500/20 text-red-500 animate-pulse' : 'bg-slate-800'}`}>
                  {match.status}
                </span>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xl font-bold">{match.team1_name}</span>
                  <span className="text-slate-600 font-black italic">VS</span>
                  <span className="text-xl font-bold text-right">{match.team2_name}</span>
                </div>
                
                {match.latest_score && (
                  <div className="bg-slate-900/50 p-4 rounded-xl border border-white/5">
                    <p className="text-center text-2xl font-black text-primary-400">
                      {match.latest_score.score_details}
                    </p>
                    <p className="text-center text-xs text-slate-500 mt-2 truncate italic">
                      {match.latest_score.commentary}
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          )) : (
            <div className="col-span-3 text-center py-20 glass rounded-3xl border-dashed">
              <Activity className="mx-auto text-slate-700 mb-4" size={48} />
              <p className="text-slate-500 text-lg">No matches scheduled at the moment.</p>
            </div>
          )}
        </div>
      </section>

      {/* Tournaments Section */}
      <section className="space-y-6">
        <h2 className="text-3xl font-bold">Active Tournaments</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {tournaments.map((tourney) => (
            <div key={tourney.id} className="relative group overflow-hidden rounded-3xl glass p-8">
              <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                <Trophy size={120} />
              </div>
              <div className="relative z-10 space-y-4">
                <h3 className="text-2xl font-bold text-primary-400">{tourney.name}</h3>
                <p className="text-slate-400 line-clamp-2">{tourney.description}</p>
                <div className="flex gap-6 text-sm text-slate-300">
                  <div className="flex items-center gap-2">
                    <Calendar size={16} className="text-primary-500" />
                    <span>Starts: {tourney.start_date}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users size={16} className="text-primary-500" />
                    <span>Open Registration</span>
                  </div>
                </div>
                <button className="w-full mt-4 py-3 bg-white/5 hover:bg-primary-600 text-white rounded-xl font-bold transition-all border border-white/10 hover:border-primary-500">
                  Apply to Play
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;
