
import React, { useState, useMemo } from 'react';
import { WildlifeEntry } from '../types';
import { BookOpen, CheckCircle2, Leaf, Bird, Bug, PawPrint, Ghost, Search, Filter, X, ArrowRight, Sparkles } from 'lucide-react';

interface SpeciesGuideProps {
  items: WildlifeEntry[];
}

const CategoryIcon = ({ category, className }: { category: string, className?: string }) => {
  const cat = category.toLowerCase();
  if (cat.includes('bird')) return <Bird className={className} />;
  if (cat.includes('plant') || cat.includes('tree') || cat.includes('flower')) return <Leaf className={className} />;
  if (cat.includes('insect') || cat.includes('bug') || cat.includes('arthropod') || cat.includes('spider')) return <Bug className={className} />;
  if (cat.includes('mammal') || cat.includes('animal')) return <PawPrint className={className} />;
  if (cat.includes('reptile') || cat.includes('amphibian') || cat.includes('snake') || cat.includes('frog')) return <Ghost className={className} />;
  return <Search className={className} />;
};

export const AnimalsList: React.FC<SpeciesGuideProps> = ({ items }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Get unique species from items
  const uniqueSpecies = useMemo(() => {
    return items.reduce((acc, item) => {
      if (!acc.find(s => s.itemName.toLowerCase() === item.itemName.toLowerCase())) {
        acc.push(item);
      }
      return acc;
    }, [] as WildlifeEntry[]);
  }, [items]);

  const allCategories = useMemo(() => {
    return Array.from(new Set(items.map(s => s.category))) as string[];
  }, [items]);

  const filteredSpecies = useMemo(() => {
    return uniqueSpecies.filter(species => {
      const matchesSearch = species.itemName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           species.scientificName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = !selectedCategory || species.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [uniqueSpecies, searchQuery, selectedCategory]);

  const foundCount = uniqueSpecies.length;
  const currentLevel = Math.floor(foundCount / 10) + 1;
  const progressInLevel = foundCount % 10;
  const progressPercentage = progressInLevel * 10;

  return (
    <div className="flex flex-col h-full max-w-md mx-auto relative z-10">
      {/* Header Section */}
      <div className="p-6 sm:p-8 pb-4 space-y-6">
        <div className="text-center">
          <h2 className="text-3xl sm:text-4xl font-display font-extrabold text-white tracking-tight text-gradient">Sanctuary Guide</h2>
          <p className="text-[10px] text-white/30 uppercase tracking-[0.5em] font-black mt-2">Your Discovered Species</p>
        </div>

        {/* Level Progress Dashboard */}
        <div className="apple-glass p-6 rounded-[2.5rem] border-white/20 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-32 h-32 bg-wy-blue/10 blur-3xl rounded-full -mr-10 -mt-10" />
          <div className="relative z-10">
            <div className="flex justify-between items-end mb-4">
              <div className="space-y-1">
                <p className="text-white/30 text-[10px] font-black uppercase tracking-[0.3em]">Collection Progress</p>
                <p className="text-3xl font-display font-black text-white tracking-tighter">{foundCount} <span className="text-[10px] text-white/30 font-bold uppercase tracking-widest ml-1">Species</span></p>
              </div>
              <div className="text-right">
                 <div className="flex items-center justify-end space-x-2 text-wy-blue">
                   <Sparkles size={16} />
                   <p className="font-display font-black text-xl tracking-tighter">Level {currentLevel}</p>
                 </div>
                 <p className="text-[8px] text-white/20 font-black uppercase tracking-widest">{10 - progressInLevel} more to level up</p>
              </div>
            </div>
            <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
              <div 
                className="h-full bg-gradient-to-r from-wy-blue to-wy-red transition-all duration-1000 shadow-[0_0_15px_rgba(0,72,152,0.5)]" 
                style={{ width: `${progressPercentage}%` }} 
              />
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="space-y-4">
          <div className="relative group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-wy-blue transition-colors" />
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search species..."
              className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4 pl-12 pr-5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-wy-blue/50 transition-all backdrop-blur-xl"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-white/10 rounded-full transition-colors"
              >
                <X size={14} className="text-white/40" />
              </button>
            )}
          </div>

          <div className="flex items-center space-x-3 overflow-x-auto no-scrollbar pb-2">
            <button 
              onClick={() => setSelectedCategory(null)}
              className={`px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all flex-shrink-0 border ${!selectedCategory ? 'bg-white text-black border-white shadow-lg scale-105' : 'bg-white/5 text-white/40 border-white/10 hover:bg-white/10'}`}
            >
              All
            </button>
            {allCategories.map(cat => (
              <button 
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all flex-shrink-0 border flex items-center space-x-2 ${selectedCategory === cat ? 'bg-wy-blue text-white border-wy-blue shadow-lg scale-105' : 'bg-white/5 text-white/40 border-white/10 hover:bg-white/10'}`}
              >
                <CategoryIcon category={cat} className="w-3 h-3" />
                <span>{cat}s</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="flex-1 overflow-y-auto no-scrollbar p-6 sm:p-8 pt-0 pb-32">
        {filteredSpecies.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-6 opacity-40">
            <div className="w-20 h-20 rounded-[2rem] bg-white/5 border border-white/10 flex items-center justify-center">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
            <div className="text-center space-y-2">
              <p className="text-white font-display font-bold text-lg tracking-tight uppercase">No Species Found</p>
              <p className="text-[9px] text-white/40 uppercase tracking-[0.3em] font-black">Try a different search or filter</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-5 sm:gap-6">
            {filteredSpecies.map((species) => (
              <div key={species.id} className="apple-glass rounded-[2.5rem] overflow-hidden border-white/10 shadow-xl group hover:bg-white/[0.05] transition-all duration-500 flex flex-col">
                <div className="h-32 sm:h-40 w-full relative overflow-hidden">
                  <img src={species.imageUrl || ''} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={species.itemName} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute top-3 right-3">
                    <div className="bg-black/40 backdrop-blur-md px-2 py-1 rounded-lg border border-white/10 flex items-center space-x-1">
                      <Sparkles size={10} className="text-wy-blue" />
                      <span className="text-[8px] font-black text-white">{species.points}</span>
                    </div>
                  </div>
                  <div className="absolute bottom-3 left-4">
                    <span className="px-3 py-1 rounded-full bg-wy-blue/80 backdrop-blur-md text-[8px] text-white font-black uppercase tracking-widest border border-white/10">
                      {species.rarity}
                    </span>
                  </div>
                </div>
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <h4 className="text-white font-display font-bold text-sm tracking-tight leading-tight group-hover:text-wy-blue transition-colors">{species.itemName}</h4>
                    <p className="text-[9px] text-white/30 italic mt-1 font-medium truncate">{species.scientificName}</p>
                  </div>
                  <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                     <div className="flex items-center space-x-2">
                        <CheckCircle2 className="text-emerald-400 w-3 h-3" />
                        <span className="text-[8px] text-emerald-400/60 font-black uppercase tracking-widest">Logged</span>
                     </div>
                     <div className="flex items-center space-x-1">
                        <span className="text-[9px] text-white/20 font-black">{items.filter(i => i.itemName.toLowerCase() === species.itemName.toLowerCase()).length}</span>
                        <ArrowRight size={8} className="text-white/10" />
                     </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
