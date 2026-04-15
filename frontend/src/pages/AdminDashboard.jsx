import { useState, useEffect } from 'react';
import api from '../api/axios';
import { Plus, Users, Trophy, SwatchBook, Save, Trash2 } from 'lucide-react';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('matches');
  const [teams, setTeams] = useState([]);
  const [tournaments, setTournaments] = useState([]);
  const [matches, setMatches] = useState([]);
  
  // Form states
  const [newTeam, setNewTeam] = useState({ name: '', captain_name: '' });
  const [newMatch, setNewMatch] = useState({ 
    tournament: '', team1: '', team2: '', match_date: '', status: 'Upcoming' 
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [tRes, tourRes, mRes] = await Promise.all([
        api.get('teams/'),
        api.get('tournaments/'),
        api.get('matches/')
      ]);
      setTeams(tRes.data);
      setTournaments(tourRes.data);
      setMatches(mRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    try {
      await api.post('teams/', newTeam);
      setNewTeam({ name: '', captain_name: '' });
      fetchData();
    } catch (err) {
      alert("Error creating team");
    }
  };

  const handleCreateMatch = async (e) => {
    e.preventDefault();
    try {
      await api.post('matches/', newMatch);
      setNewMatch({ tournament: '', team1: '', team2: '', match_date: '', status: 'Upcoming' });
      fetchData();
    } catch (err) {
      alert("Error creating match");
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-black italic uppercase tracking-tighter">Admin <span className="text-primary-500">HQ</span></h1>
          <p className="text-slate-500">Manage tournaments, teams and live action</p>
        </div>
      </div>

      <div className="flex gap-4 p-1 glass rounded-2xl w-fit">
        {[
          { id: 'matches', icon: trophy, label: 'Matches' },
          { id: 'teams', icon: Users, label: 'Teams' },
          { id: 'tournaments', icon: Trophy, label: 'Tournaments' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${
              activeTab === tab.id ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/20' : 'text-slate-500 hover:text-white hover:bg-white/5'
            }`}
          >
            <tab.icon size={18} />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass rounded-3xl overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-white/5 border-b border-white/10">
                <tr>
                  <th className="p-6 font-bold text-slate-400">Details</th>
                  <th className="p-6 font-bold text-slate-400">Status</th>
                  <th className="p-6 font-bold text-slate-400 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                 {activeTab === 'matches' && matches.map(match => (
                   <tr key={match.id} className="hover:bg-white/2 translate-x-0">
                     <td className="p-6">
                       <div className="font-bold">{match.team1_name} vs {match.team2_name}</div>
                       <div className="text-xs text-slate-500">{new Date(match.match_date).toLocaleString()}</div>
                     </td>
                     <td className="p-6">
                       <span className="px-3 py-1 bg-primary-500/10 text-primary-400 rounded-full text-xs font-bold uppercase tracking-tight">
                         {match.status}
                       </span>
                     </td>
                     <td className="p-6 text-right">
                       <button className="p-2 text-slate-500 hover:text-white"><Plus size={18} /></button>
                       <button className="p-2 text-slate-500 hover:text-red-400"><Trash2 size={18} /></button>
                     </td>
                   </tr>
                 ))}
                 {activeTab === 'teams' && teams.map(team => (
                   <tr key={team.id}>
                     <td className="p-6">
                        <div className="font-bold">{team.name}</div>
                        <div className="text-xs text-slate-500">Captain: {team.captain_name}</div>
                     </td>
                     <td className="p-6">{team.players?.length || 0} Players</td>
                     <td className="p-6 text-right">
                       <button className="p-2 text-slate-500 hover:text-red-400"><Trash2 size={18} /></button>
                     </td>
                   </tr>
                 ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Sidebar Forms */}
        <div className="space-y-6">
          <div className="glass p-8 rounded-3xl border-primary-500/20">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Plus className="text-primary-500" />
              {activeTab === 'teams' ? 'Add New Team' : 'Schedule Match'}
            </h3>
            
            {activeTab === 'teams' ? (
              <form onSubmit={handleCreateTeam} className="space-y-4">
                <input 
                  className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-3 px-4" 
                  placeholder="Team Name"
                  value={newTeam.name}
                  onChange={e => setNewTeam({...newTeam, name: e.target.value})}
                />
                <input 
                  className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-3 px-4" 
                  placeholder="Captain Name"
                  value={newTeam.captain_name}
                  onChange={e => setNewTeam({...newTeam, captain_name: e.target.value})}
                />
                <button className="w-full py-4 bg-primary-600 hover:bg-primary-500 rounded-xl font-bold transition-all shadow-lg shadow-primary-600/20">
                  Save Team
                </button>
              </form>
            ) : (
                <form onSubmit={handleCreateMatch} className="space-y-4">
                   <select 
                    className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-3 px-4"
                    value={newMatch.tournament}
                    onChange={e => setNewMatch({...newMatch, tournament: e.target.value})}
                  >
                    <option value="">Select Tournament</option>
                    {tournaments.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                  <div className="grid grid-cols-2 gap-4">
                    <select 
                      className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-3 px-4"
                      value={newMatch.team1}
                      onChange={e => setNewMatch({...newMatch, team1: e.target.value})}
                    >
                      <option value="">Team 1</option>
                      {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                    <select 
                      className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-3 px-4"
                      value={newMatch.team2}
                      onChange={e => setNewMatch({...newMatch, team2: e.target.value})}
                    >
                      <option value="">Team 2</option>
                      {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                  </div>
                  <input 
                    type="datetime-local" 
                    className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-3 px-4"
                    value={newMatch.match_date}
                    onChange={e => setNewMatch({...newMatch, match_date: e.target.value})}
                  />
                  <button className="w-full py-4 bg-primary-600 hover:bg-primary-500 rounded-xl font-bold transition-all shadow-lg shadow-primary-600/20">
                    Schedule Match
                  </button>
                </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
