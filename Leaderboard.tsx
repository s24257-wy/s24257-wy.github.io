
import React from 'react';
import { User } from '../types';
import { Trophy, Medal, Compass } from 'lucide-react';

interface LeaderboardProps {
  users: User[];
  currentUser: User;
}

export const Leaderboard: React.FC<LeaderboardProps> = ({ users, currentUser }) => {
  const sortedUsers = [...users].sort((a, b) => b.totalPoints - a.totalPoints);
  const currentUserRank = sortedUsers.findIndex(u => u.id === currentUser.id);
  const displayRank = currentUserRank === -1 ? 1 : currentUserRank + 1;

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0: return <Compass className="w-6 h-6 text-[#D7001B]" />;
      case 1: return <Medal className="w-6 h-6 text-stone-400" />;
      case 2: return <Medal className="w-6 h-6 text-orange-700" />;
      default: return <span className="text-stone-400 font-bold w-6 text-center serif">{index + 1}</span>;
    }
  };

  return (
    <div className="flex flex-col h-full max-w-md mx-auto p-4 sm:p-8 overflow-y-auto no-scrollbar pb-32 relative z-10">
      <div className="mb-8 sm:mb-12 text-center">
        <h2 className="text-3xl sm:text-4xl font-display font-extrabold text-white tracking-tight text-gradient">Merit Ranks</h2>
        <p className="text-[10px] text-white/30 uppercase tracking-[0.5em] font-black mt-2">Wahyanite Honor Roll</p>
      </div>

      <div className="apple-glass p-6 sm:p-10 rounded-[2.5rem] sm:rounded-[3rem] border-white/20 mb-8 sm:mb-12 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-40 h-40 bg-wy-blue/10 blur-3xl rounded-full -mr-10 -mt-10" />
        <div className="relative z-10 flex items-center justify-between">
           <div className="space-y-2">
             <p className="text-white/30 text-[10px] font-black uppercase tracking-[0.3em]">Your Merit Rank</p>
             <div className="flex items-baseline space-x-3">
               <span className="text-5xl sm:text-6xl font-display font-black text-white tracking-tighter drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]">#{displayRank}</span>
               <span className="text-[10px] font-black text-wy-blue uppercase tracking-widest">Level {currentUser.level}</span>
             </div>
           </div>
           <div className="text-right space-y-2">
              <p className="text-white/30 text-[10px] font-black uppercase tracking-[0.3em]">Honor Points</p>
              <span className="text-4xl sm:text-5xl font-display font-black tracking-tighter text-wy-red drop-shadow-[0_0_20px_rgba(215,0,27,0.4)]">{currentUser.totalPoints}</span>
           </div>
        </div>
      </div>

      <div className="space-y-4">
        {sortedUsers.map((user, index) => {
          const isCurrentUser = user.id === currentUser.id;
          return (
            <div 
              key={user.id} 
              className={`apple-glass p-6 rounded-[2.5rem] flex items-center space-x-6 border-white/10 transition-all duration-500 ${isCurrentUser ? 'bg-white/[0.08] border-white/30 scale-[1.03] shadow-2xl' : 'hover:bg-white/[0.05] shadow-xl'}`}
            >
              <div className="w-12 h-12 flex items-center justify-center font-display font-black text-2xl text-white/20 tracking-tighter">
                {index + 1}
              </div>
              <div className="relative">
                  <img src={user.avatar} alt={user.name} className="w-16 h-16 rounded-[1.5rem] border border-white/10 shadow-xl group-hover:scale-110 transition-transform duration-500" />
                  {index === 0 && <div className="absolute -top-2 -right-2 bg-wy-red w-5 h-5 rounded-full border-2 border-white shadow-lg animate-bounce" />}
              </div>
              <div className="flex-1">
                <h4 className={`font-display font-bold text-lg tracking-tight ${isCurrentUser ? 'text-white' : 'text-white/80'}`}>{user.name}</h4>
                <p className="text-[9px] text-white/20 font-black uppercase tracking-widest mt-1.5">{user.sightingsLogged} Logged Sightings</p>
              </div>
              <div className="text-right">
                <p className={`font-display font-black text-xl tracking-tighter ${isCurrentUser ? 'text-wy-red' : 'text-white'}`}>{user.totalPoints}</p>
                <p className="text-[8px] text-white/20 font-black uppercase tracking-widest mt-0.5">Points</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
