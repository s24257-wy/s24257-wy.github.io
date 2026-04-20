
import React from 'react';
// Fixed: Changed RecycleEntry to WildlifeEntry as defined in types.ts
import { WildlifeEntry } from '../types';
import { Award, Lock, Binoculars, Camera, Feather } from 'lucide-react';

interface AchievementsProps {
  history: WildlifeEntry[];
  badges: string[];
}

export const ACHIEVEMENT_RULES = [
  {
    id: 'first_scan',
    title: 'Novice Ranger',
    description: 'Log your first wildlife discovery',
    icon: <Camera className="w-6 h-6 text-amber-500" />,
    target: 1,
    // Fixed: Logic updated to use wildlife sightings history
    check: (history: WildlifeEntry[]) => {
      const count = history.length;
      return { current: count, completed: count >= 1 };
    }
  },
  {
    id: 'bird_watcher',
    title: 'Ornithologist',
    description: 'Identify 3 bird species',
    icon: <Feather className="w-6 h-6 text-blue-500" />,
    target: 3,
    // Fixed: Logic updated to filter for Bird category
    check: (history: WildlifeEntry[]) => {
      const birds = history.filter(i => i.category === 'Bird');
      return { current: birds.length, completed: birds.length >= 3 };
    }
  },
  {
    id: 'mammal_tracker',
    title: 'Zoologist',
    description: 'Identify 5 mammal species',
    icon: <Binoculars className="w-6 h-6 text-emerald-600" />,
    target: 5,
    // Fixed: Logic updated to filter for Mammal category
    check: (history: WildlifeEntry[]) => {
      const mammals = history.filter(i => i.category === 'Mammal');
      return { current: mammals.length, completed: mammals.length >= 5 };
    }
  },
  {
    id: 'master_explorer',
    title: 'Master Explorer',
    description: 'Log 20 total wildlife sightings',
    icon: <Award className="w-6 h-6 text-amber-600" />,
    target: 20,
    // Fixed: Logic updated for total sightings count
    check: (history: WildlifeEntry[]) => {
      const count = history.length;
      return { current: count, completed: count >= 20 };
    }
  }
];

export const Achievements: React.FC<AchievementsProps> = ({ history, badges }) => {
  return (
    <div className="flex flex-col h-full max-w-md mx-auto p-4 overflow-y-auto no-scrollbar pb-24">
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold text-stone-800">Ranger Badges</h2>
        <p className="text-stone-600">Unlock rewards as you explore nature</p>
      </div>

      <div className="space-y-4">
        {ACHIEVEMENT_RULES.map((achievement) => {
          const status = achievement.check(history);
          const isUnlocked = badges.includes(achievement.id) || status.completed;
          const progress = Math.min(100, (status.current / achievement.target) * 100);

          return (
            <div 
              key={achievement.id} 
              className={`relative rounded-2xl p-4 border transition-all duration-300 ${
                isUnlocked 
                  ? 'bg-white border-amber-200 shadow-md' 
                  : 'bg-stone-50 border-stone-200 grayscale opacity-90'
              }`}
            >
              <div className="flex items-center space-x-4">
                <div className={`w-14 h-14 rounded-full flex items-center justify-center ${isUnlocked ? 'bg-amber-50' : 'bg-stone-200'}`}>
                  {isUnlocked ? achievement.icon : <Lock className="w-6 h-6 text-stone-400" />}
                </div>
                
                <div className="flex-1">
                  <h3 className={`font-bold ${isUnlocked ? 'text-stone-800' : 'text-stone-500'}`}>
                    {achievement.title}
                  </h3>
                  <p className="text-sm text-stone-500 mb-2">{achievement.description}</p>
                  
                  {/* Progress Bar */}
                  <div className="w-full bg-stone-200 rounded-full h-2 overflow-hidden">
                    <div 
                      className={`h-2 rounded-full transition-all duration-500 ${isUnlocked ? 'bg-gradient-to-r from-amber-400 to-orange-500' : 'bg-stone-400'}`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-[10px] text-stone-400 font-medium">
                      {status.current} / {achievement.target}
                    </span>
                    {isUnlocked && (
                       <span className="text-[10px] font-bold text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full">
                         EARNED
                       </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
