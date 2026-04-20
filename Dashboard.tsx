
import React from 'react';
import { WildlifeEntry, User } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Bird, History, TrendingUp, LogOut, MapPin, Award, BookOpen, User as UserIcon } from 'lucide-react';

interface DashboardProps {
  user: User;
  logbook: WildlifeEntry[];
  onLogout: () => void;
}

// Colors adapted from Style Guide: PMS287 (Blue), PMS1797 (Red), PMS873C (Gold), PMS Black, Silver
const WY_CHART_COLORS = ['#004898', '#D7001B', '#C5A059', '#1A1A1A', '#A1A1A1', '#003366'];

export const Dashboard: React.FC<DashboardProps> = ({ user, logbook, onLogout }) => {
  
  const categoryCount = logbook.reduce((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const pieData = Object.keys(categoryCount).map((key) => ({
    name: key,
    value: categoryCount[key]
  }));

  return (
    <div className="flex flex-col h-full max-w-md mx-auto p-4 sm:p-8 overflow-y-auto no-scrollbar pb-32 relative z-10">
      <div className="flex items-center justify-between mb-8 sm:mb-12">
        <div className="space-y-1">
          <h2 className="text-3xl sm:text-4xl font-display font-extrabold text-white tracking-tight text-gradient">Field Profile</h2>
          <p className="text-[10px] text-white/30 uppercase tracking-[0.5em] font-black">Wahyanite Explorer</p>
        </div>
        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-[1.2rem] sm:rounded-[1.5rem] bg-gradient-to-br from-wy-blue to-wy-red p-0.5 shadow-2xl">
          <div className="w-full h-full rounded-[1.1rem] sm:rounded-[1.4rem] bg-black flex items-center justify-center overflow-hidden">
             <UserIcon className="text-white/40 w-6 h-6 sm:w-8 sm:h-8" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:gap-6 mb-8 sm:mb-10">
        <div className="apple-glass p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] border-white/20 shadow-2xl">
          <div className="flex items-center space-x-3 mb-3">
             <div className="w-8 h-8 bg-wy-blue/20 rounded-xl flex items-center justify-center border border-wy-blue/20">
                <TrendingUp className="text-wy-blue w-4 h-4" />
             </div>
             <span className="text-[9px] text-white/30 uppercase tracking-[0.4em] font-black">Level</span>
          </div>
          <p className="text-2xl sm:text-3xl font-display font-extrabold text-white tracking-tighter">{user.level}</p>
          <p className="text-[9px] text-emerald-400/60 font-black uppercase tracking-widest mt-1">Explorer Grade</p>
        </div>
        <div className="apple-glass p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] border-white/20 shadow-2xl">
          <div className="flex items-center space-x-3 mb-3">
             <div className="w-8 h-8 bg-wy-red/20 rounded-xl flex items-center justify-center border border-wy-red/20">
                <Award className="text-wy-red w-4 h-4" />
             </div>
             <span className="text-[9px] text-white/30 uppercase tracking-[0.4em] font-black">Merit</span>
          </div>
          <p className="text-2xl sm:text-3xl font-display font-extrabold text-white tracking-tighter">{user.totalPoints}</p>
          <p className="text-[9px] text-wy-blue/60 font-black uppercase tracking-widest mt-1">Honor Points</p>
        </div>
      </div>

      {pieData.length > 0 ? (
        <div className="apple-glass p-10 rounded-[3rem] border-white/20 mb-10 shadow-2xl">
          <div className="flex items-center justify-between mb-8">
             <h3 className="text-xs font-black text-white/40 uppercase tracking-[0.4em]">Biodiversity Mix</h3>
             <div className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[9px] text-white/40 font-black uppercase tracking-widest">Live Data</div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={95}
                  paddingAngle={8}
                  dataKey="value"
                  stroke="none"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={WY_CHART_COLORS[index % WY_CHART_COLORS.length]} className="drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]" />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(0, 0, 0, 0.8)', 
                    borderRadius: '24px', 
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(20px)',
                    padding: '12px 20px',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.4)'
                  }}
                  itemStyle={{ color: '#fff', fontSize: '11px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '2px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-6">
             {pieData.map((item, i) => (
               <div key={i} className="flex items-center space-x-3 bg-white/[0.02] p-3 rounded-2xl border border-white/5">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: WY_CHART_COLORS[i % WY_CHART_COLORS.length] }} />
                  <span className="text-[9px] text-white/40 font-black uppercase tracking-widest">{item.name}</span>
               </div>
             ))}
          </div>
        </div>
      ) : (
        <div className="apple-glass p-16 rounded-[3rem] border border-dashed border-white/10 text-center mb-10 backdrop-blur-3xl">
          <p className="text-white/20 text-[10px] font-black uppercase tracking-[0.5em]">Journal Empty</p>
          <p className="text-[9px] text-white/10 italic mt-3 uppercase tracking-widest">In Hoc Signo Vinces</p>
        </div>
      )}

      <div className="space-y-6">
        <h3 className="text-xs font-black text-white/40 uppercase tracking-[0.4em] px-2 flex items-center space-x-3">
          <History className="w-4 h-4 text-wy-blue" />
          <span>Recent Discoveries</span>
        </h3>
        <div className="space-y-4">
          {logbook.length === 0 ? (
            <div className="apple-glass p-12 rounded-[2.5rem] text-center border-white/10">
              <p className="text-white/20 text-[10px] uppercase tracking-[0.4em] font-black">No sightings recorded yet</p>
            </div>
          ) : (
            logbook.slice().reverse().map((s) => (
              <div key={s.id} className="apple-glass p-6 rounded-[2.5rem] flex items-center space-x-6 border-white/10 hover:bg-white/[0.05] transition-all group cursor-pointer shadow-xl">
                <div className="w-16 h-16 rounded-[1.5rem] overflow-hidden border border-white/10 shadow-lg group-hover:scale-110 transition-transform duration-500">
                  <img src={s.imageUrl} className="w-full h-full object-cover" alt={s.itemName} />
                </div>
                <div className="flex-1">
                  <h4 className="text-white font-display font-bold text-lg tracking-tight leading-tight">{s.itemName}</h4>
                  <div className="flex items-center text-[9px] text-white/30 font-black uppercase tracking-widest mt-1.5">
                    <MapPin size={10} className="mr-1.5 text-wy-red" />
                    <span>{s.location ? `${s.location.lat.toFixed(4)}, ${s.location.lng.toFixed(4)}` : 'Campus Site'}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-wy-red font-display font-black text-xl tracking-tighter">+{s.points}</p>
                  <p className="text-[8px] text-white/20 font-black uppercase tracking-widest mt-0.5">Points</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <button 
        onClick={onLogout}
        className="mt-16 w-full py-6 apple-glass rounded-[2rem] text-wy-red font-black uppercase tracking-[0.4em] text-[10px] hover:bg-wy-red/10 transition-all active:scale-95 border-wy-red/20 shadow-2xl flex items-center justify-center space-x-3"
      >
        <LogOut size={16} />
        <span>Terminate Session</span>
      </button>
    </div>
  );
};
