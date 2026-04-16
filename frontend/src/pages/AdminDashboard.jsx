import { useState, useEffect } from 'react';
import api from '../api/axios';
import { Plus, Users, Trophy, SwatchBook, Save, Trash2, User, MapPin, Activity } from 'lucide-react';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('matches');
  const [teams, setTeams] = useState([]);
  const [tournaments, setTournaments] = useState([]);
  const [matches, setMatches] = useState([]);
  const [players, setPlayers] = useState([]);
  
  // Player filters
  const [selectedState, setSelectedState] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  
  // Form states
  const [newTeam, setNewTeam] = useState({ name: '', captain_name: '' });
  const [newMatch, setNewMatch] = useState({ 
    tournament: '', team1: '', team2: '', match_date: '', status: 'Upcoming' 
  });
  const [newTournament, setNewTournament] = useState({ 
    name: '', description: '', format_type: 'T20', start_date: '', end_date: '' 
  });
  
  const [selectedMatchForScore, setSelectedMatchForScore] = useState(null);
  const [scoreForm, setScoreForm] = useState({ status: '', score_details: '', commentary: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [tRes, tourRes, mRes, pRes] = await Promise.all([
        api.get('teams/'),
        api.get('tournaments/'),
        api.get('matches/'),
        api.get('players/')
      ]);
      setTeams(tRes.data);
      setTournaments(tourRes.data);
      setMatches(mRes.data);
      setPlayers(pRes.data);
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

  const handleCreateTournament = async (e) => {
    e.preventDefault();
    try {
      await api.post('tournaments/', newTournament);
      setNewTournament({ name: '', description: '', format_type: 'T20', start_date: '', end_date: '' });
      fetchData();
    } catch (err) {
      alert("Error creating tournament");
    }
  };

  const handleAssignPlayer = async (teamId, playerId) => {
    if (!playerId) return;
    try {
      await api.patch(`players/${playerId}/`, { team: teamId });
      fetchData();
    } catch (err) {
      alert("Error assigning player");
    }
  };

  const handleRemovePlayer = async (playerId) => {
    if (!window.confirm("Remove player from team?")) return;
    try {
      await api.patch(`players/${playerId}/`, { team: null });
      fetchData();
    } catch (err) {
      alert("Error removing player");
    }
  };

  const handleDeleteTeam = async (id) => {
    if (!window.confirm("Delete team?")) return;
    try { await api.delete(`teams/${id}/`); fetchData(); } catch (err) {}
  };

  const handleDeleteMatch = async (id) => {
    if (!window.confirm("Delete match?")) return;
    try { await api.delete(`matches/${id}/`); fetchData(); } catch (err) {}
  };

  const handleDeleteTournament = async (id) => {
    if (!window.confirm("Delete tournament?")) return;
    try { await api.delete(`tournaments/${id}/`); fetchData(); } catch (err) {}
  };
  
  const handleDeletePlayer = async (id) => {
    if (!window.confirm("Delete player?")) return;
    try { await api.delete(`players/${id}/`); fetchData(); } catch(err) {}
  };

  const handleUpdateScore = async (e) => {
    e.preventDefault();
    try {
      if (scoreForm.status !== selectedMatchForScore.status) {
         await api.patch(`matches/${selectedMatchForScore.id}/`, { status: scoreForm.status });
      }
      if (scoreForm.score_details) {
         await api.post(`matches/${selectedMatchForScore.id}/update_score/`, {
            score_details: scoreForm.score_details,
            commentary: scoreForm.commentary
         });
      }
      setSelectedMatchForScore(null);
      setScoreForm({ status: '', score_details: '', commentary: '' });
      fetchData();
    } catch (err) {
      console.error(err);
      const detail = err.response?.data ? JSON.stringify(err.response.data) : err.message;
      alert("Error updating match score: " + detail);
    }
  };

  const quickUpdate = (type, value) => {
    let currentScore = scoreForm.score_details || "";
    let runs = 0;
    let wickets = 0;
    
    // Simple logic to try and parse existing score if it's like "150/2"
    const match = currentScore.match(/(\d+)\/(\d+)/);
    if (match) {
        runs = parseInt(match[1]);
        wickets = parseInt(match[2]);
    } else if (currentScore && !isNaN(currentScore)) {
        runs = parseInt(currentScore);
    }

    let commentary = "";
    if (type === 'run') {
        runs += value;
        commentary = value === 4 ? "FOUR! Stunning shot." : value === 6 ? "SIX! Over the ropes." : `${value} run(s) taken.`;
    } else if (type === 'wicket') {
        wickets += 1;
        commentary = "WICKET! The batsman is out.";
    } else if (type === 'extra') {
        runs += 1;
        commentary = value === 'Wd' ? "Wide ball." : "No ball.";
    }

    setScoreForm({
        ...scoreForm,
        score_details: `${runs}/${wickets}`,
        commentary: commentary
    });
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
          { id: 'matches', icon: Trophy, label: 'Matches' },
          { id: 'teams', icon: Users, label: 'Teams' },
          { id: 'tournaments', icon: Trophy, label: 'Tournaments' },
          { id: 'players', icon: User, label: 'Players' },
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
                       <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-tight ${match.status === 'Ongoing' ? 'bg-red-500/10 text-red-500 animate-pulse' : match.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-primary-500/10 text-primary-400'}`}>
                         {match.status}
                       </span>
                     </td>
                     <td className="p-6 text-right">
                       <button 
                          onClick={() => {
                             setSelectedMatchForScore(match);
                             setScoreForm({ status: match.status, score_details: match.latest_score?.score_details || '', commentary: '' });
                          }}
                          className="p-2 text-slate-500 hover:text-white"
                          title="Live Update Scoreboard"
                       >
                         <Activity size={18} />
                       </button>
                       <button onClick={() => handleDeleteMatch(match.id)} className="p-2 text-slate-500 hover:text-red-400"><Trash2 size={18} /></button>
                     </td>
                   </tr>
                 ))}
                 {activeTab === 'tournaments' && tournaments.map(tour => (
                   <tr key={tour.id} className="hover:bg-white/2">
                     <td className="p-6">
                        <div className="font-bold">{tour.name}</div>
                        <div className="text-xs text-slate-500">{tour.description}</div>
                     </td>
                     <td className="p-6">
                        <div className="font-bold text-primary-400 uppercase">{tour.format_type}</div>
                        <div className="text-xs text-slate-500">{tour.start_date} to {tour.end_date}</div>
                     </td>
                     <td className="p-6 text-right">
                       <button onClick={() => handleDeleteTournament(tour.id)} className="p-2 text-slate-500 hover:text-red-400"><Trash2 size={18} /></button>
                     </td>
                   </tr>
                 ))}
                 {activeTab === 'teams' && teams.map(team => (
                   <tr key={team.id}>
                     <td className="p-6">
                        <div className="font-bold">{team.name}</div>
                        <div className="text-xs text-slate-500">Captain: {team.captain_name}</div>
                     </td>
                     <td className="p-6">
                        <div className="mb-2 text-sm">{team.players?.length || 0} Players</div>
                        <select 
                          className="bg-slate-800 border border-white/10 rounded-lg px-2 py-1 text-xs outline-none w-32" 
                          onChange={(e) => handleAssignPlayer(team.id, e.target.value)} 
                          value=""
                        >
                          <option value="">+ Add Player</option>
                          {players.filter(p => !p.team).map(p => (
                             <option key={p.id} value={p.id}>{p.name} ({p.role})</option>
                          ))}
                        </select>
                        {team.players && team.players.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-3">
                             {team.players.map(p => (
                               <span key={p.id} className="text-[10px] bg-slate-900 px-2 py-1 flex items-center gap-1 rounded-md border border-white/5">
                                 {p.name} <button onClick={() => handleRemovePlayer(p.id)} className="text-red-500 hover:text-red-400 ml-1 font-black">×</button>
                               </span>
                             ))}
                          </div>
                        )}
                     </td>
                     <td className="p-6 text-right">
                       <button onClick={() => handleDeleteTeam(team.id)} className="p-2 text-slate-500 hover:text-red-400"><Trash2 size={18} /></button>
                     </td>
                   </tr>
                 ))}
                 {activeTab === 'players' && (() => {
                   const uniqueStates = [...new Set(players.map(p => p.state).filter(Boolean))];
                   const uniqueCities = [...new Set(players.filter(p => !selectedState || p.state === selectedState).map(p => p.city).filter(Boolean))];
                   const filteredPlayers = players.filter(p => {
                     if (selectedState && p.state !== selectedState) return false;
                     if (selectedCity && p.city !== selectedCity) return false;
                     return true;
                   });
                   return (
                     <>
                       <tr>
                         <td colSpan="3" className="p-4 bg-slate-900/50">
                           <div className="flex gap-4">
                             <select className="bg-slate-800 border border-white/10 rounded-lg px-3 py-2 text-sm outline-none w-48" value={selectedState} onChange={e => { setSelectedState(e.target.value); setSelectedCity(''); }}>
                               <option value="">All States</option>
                               {uniqueStates.map(state => <option key={state} value={state}>{state}</option>)}
                             </select>
                             <select className="bg-slate-800 border border-white/10 rounded-lg px-3 py-2 text-sm outline-none w-48" value={selectedCity} onChange={e => setSelectedCity(e.target.value)}>
                               <option value="">All Cities</option>
                               {uniqueCities.map(city => <option key={city} value={city}>{city}</option>)}
                             </select>
                           </div>
                         </td>
                       </tr>
                       {filteredPlayers.map(player => (
                         <tr key={player.id} className="hover:bg-white/2">
                           <td className="p-6">
                              <div className="font-bold flex items-center gap-2">{player.name} <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded-full text-[10px] uppercase font-bold">{player.role}</span></div>
                              <div className="text-xs text-slate-500 flex gap-1 mt-1 items-center"><MapPin size={12}/> {player.village ? player.village+', ' : ''}{player.city}, {player.state}</div>
                           </td>
                           <td className="p-6">
                              <div className="text-sm font-medium">{player.mobile_number}</div>
                              <div className="text-xs text-slate-400">{player.email}</div>
                           </td>
                           <td className="p-6 text-right">
                             <button onClick={() => handleDeletePlayer(player.id)} className="p-2 text-slate-500 hover:text-red-400"><Trash2 size={18} /></button>
                           </td>
                         </tr>
                       ))}
                       {filteredPlayers.length === 0 && (
                         <tr><td colSpan="3" className="p-8 text-center text-slate-500">No players found matching this criteria.</td></tr>
                       )}
                     </>
                   )
                 })()}
              </tbody>
            </table>
          </div>
        </div>

        {/* Sidebar Forms */}
        <div className="space-y-6">
          <div className="glass p-8 rounded-3xl border-primary-500/20">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              {selectedMatchForScore ? (
                <> <Activity className="text-red-500 animate-pulse" /> Live Scoreboard Updater </>
              ) : (
                <>
                  <Plus className="text-primary-500" />
                  {activeTab === 'teams' ? 'Add New Team' : activeTab === 'players' ? 'Player Invites' : activeTab === 'tournaments' ? 'Create Tournament' : 'Schedule Match'}
                </>
              )}
            </h3>
            
            {activeTab === 'players' ? (
              <div className="text-center p-4">
                <User className="mx-auto text-slate-500 mb-2" size={48} />
                <p className="text-slate-400 text-sm">Players register themselves from the frontend via the Profile page.</p>
              </div>
            ) : activeTab === 'tournaments' ? (
              <form onSubmit={handleCreateTournament} className="space-y-4">
                 <input className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-3 px-4 text-white" placeholder="Tournament Name" value={newTournament.name} onChange={e => setNewTournament({...newTournament, name: e.target.value})} required/>
                 <select className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-3 px-4 text-white" value={newTournament.format_type} onChange={e => setNewTournament({...newTournament, format_type: e.target.value})}>
                    <option value="T10">T10 (10 Overs)</option>
                    <option value="T20">T20 (20 Overs)</option>
                    <option value="ODI">ODI (50 Overs)</option>
                    <option value="TEST">Test Match (Days)</option>
                 </select>
                 <div className="flex gap-2">
                   <input type="date" className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-3 px-4 text-white" value={newTournament.start_date} onChange={e => setNewTournament({...newTournament, start_date: e.target.value})} required/>
                   <input type="date" className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-3 px-4 text-white" value={newTournament.end_date} onChange={e => setNewTournament({...newTournament, end_date: e.target.value})} required/>
                 </div>
                 <textarea className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-3 px-4 h-24 text-white" placeholder="Description" value={newTournament.description} onChange={e => setNewTournament({...newTournament, description: e.target.value})} required></textarea>
                 <button className="w-full py-4 bg-primary-600 hover:bg-primary-500 rounded-xl font-bold transition-all shadow-lg shadow-primary-600/20 text-white">Create Tournament</button>
              </form>
            ) : activeTab === 'teams' ? (
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
            ) : selectedMatchForScore ? (
               <form onSubmit={handleUpdateScore} className="space-y-4">
                 <div className="text-sm font-bold text-primary-400 mb-4 bg-primary-500/10 p-3 rounded-lg border border-primary-500/20">
                   {selectedMatchForScore.team1_name} vs {selectedMatchForScore.team2_name}
                 </div>
                 
                 <div>
                   <label className="block text-xs uppercase text-slate-500 font-bold mb-1">Match Status</label>
                   <select className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-3 px-4 text-white outline-none" value={scoreForm.status} onChange={e => setScoreForm({...scoreForm, status: e.target.value})}>
                       <option value="Upcoming">Upcoming</option>
                       <option value="Ongoing">Ongoing (Live)</option>
                       <option value="Completed">Completed</option>
                   </select>
                 </div>
                 
                 <div>
                    <label className="block text-xs uppercase text-slate-500 font-bold mb-1">Score Display (e.g. 150/2)</label>
                    <input className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-3 px-4 text-white outline-none" placeholder="150/2" value={scoreForm.score_details} onChange={e => setScoreForm({...scoreForm, score_details: e.target.value})}/>
                  </div>

                  {/* Quick Scoring Buttons */}
                  <div className="space-y-3 p-4 bg-white/5 rounded-2xl border border-white/5">
                    <label className="block text-[10px] uppercase text-slate-500 font-black mb-1">Quick Scorer</label>
                    <div className="grid grid-cols-4 gap-2">
                       {[0, 1, 2, 3, 4, 6].map(r => (
                         <button key={r} type="button" onClick={() => quickUpdate('run', r)} className="py-2 bg-slate-800 hover:bg-primary-600 rounded-lg font-bold text-sm transition-colors">{r}</button>
                       ))}
                       <button type="button" onClick={() => quickUpdate('extra', 'Wd')} className="py-2 bg-amber-900/40 text-amber-500 border border-amber-500/20 hover:bg-amber-500 hover:text-white rounded-lg font-bold text-sm transition-all">Wd</button>
                       <button type="button" onClick={() => quickUpdate('extra', 'Nb')} className="py-2 bg-amber-900/40 text-amber-500 border border-amber-500/20 hover:bg-amber-500 hover:text-white rounded-lg font-bold text-sm transition-all">Nb</button>
                       <button type="button" onClick={() => quickUpdate('wicket')} className="col-span-4 py-2 bg-red-900/40 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white rounded-lg font-black text-sm uppercase transition-all tracking-widest">Wicket!</button>
                    </div>
                  </div>
                 
                 <div>
                   <label className="block text-xs uppercase text-slate-500 font-bold mb-1">Recent Commentary / Event</label>
                   <textarea className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-3 px-4 h-24 text-white outline-none" placeholder="Kohli hits a boundary down the leg side..." value={scoreForm.commentary} onChange={e => setScoreForm({...scoreForm, commentary: e.target.value})}></textarea>
                 </div>
                 
                 <div className="flex gap-2">
                   <button type="submit" className="flex-1 py-4 bg-red-600 hover:bg-red-500 rounded-xl font-bold transition-all shadow-lg shadow-red-600/20 text-white flex items-center justify-center gap-2">
                     <Save size={16} /> Publish Score
                   </button>
                   <button type="button" onClick={() => setSelectedMatchForScore(null)} className="px-6 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold">Cancel</button>
                 </div>
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
