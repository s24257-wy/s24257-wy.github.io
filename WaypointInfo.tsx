
import React from 'react';
import { ArrowLeft, MapPin, Clock, Trees, Info } from 'lucide-react';

interface WaypointInfoProps {
  onBack: () => void;
}

export const WaypointInfo: React.FC<WaypointInfoProps> = ({ onBack }) => {
  return (
    <div className="flex flex-col h-full bg-white overflow-y-auto no-scrollbar">
      <div className="relative h-64 w-full bg-[#004898] p-8 flex flex-col justify-end">
        <div className="absolute top-0 right-0 p-8 opacity-40 pointer-events-none">
           <img 
            src="https://upload.wikimedia.org/wikipedia/en/thumb/5/5e/Wah_Yan_College_Hong_Kong_logo.svg/1200px-Wah_Yan_College_Hong_Kong_logo.svg.png" 
            className="w-32 h-32 object-contain" 
            alt="logo"
           />
        </div>

        <button 
          onClick={onBack}
          className="absolute top-6 left-6 p-2 bg-white/10 rounded-full text-white hover:bg-white/20 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="relative z-10">
          <p className="text-white/70 text-[10px] uppercase tracking-[0.3em] font-bold mb-2">Heritage Site</p>
          <h1 className="text-3xl font-bold text-white serif leading-tight">Wah Yan College<br/>Hong Kong</h1>
          <div className="flex items-center text-white/80 text-xs mt-3 serif">
             <MapPin className="w-3 h-3 mr-1 text-[#D7001B]" />
             <span>281 Queen's Road East, Wan Chai</span>
          </div>
        </div>
      </div>

      <div className="p-8 space-y-10 pb-24">
        <section>
          <h2 className="text-[10px] font-bold text-[#004898] uppercase tracking-[0.2em] mb-4 border-b border-stone-100 pb-2">1.1 | School Background</h2>
          <p className="text-stone-700 text-base leading-relaxed serif italic">
            "Wah Yan College Hong Kong offers a holistic, liberating and transforming Catholic education within a learning community of students and teachers. Our goal is to nurture progressively competent, committed, compassionate, spiritual and ethically discerning persons."
          </p>
        </section>

        <section>
          <h2 className="text-[10px] font-bold text-[#004898] uppercase tracking-[0.2em] mb-4 border-b border-stone-100 pb-2">1.3 | School Motto</h2>
          <div className="text-center py-6 bg-stone-50 rounded border border-stone-100">
             <h3 className="text-xl font-bold text-[#004898] serif mb-1 uppercase tracking-widest">IN HOC SIGNO VINCES</h3>
             <p className="text-sm text-stone-500 serif italic">In the sign of Christ, we shall conquer</p>
          </div>
          <p className="text-stone-600 text-sm mt-4 leading-relaxed serif">
            While not all Wahyanites would engage in a physical battle in their lives, we are obliged, nevertheless, to engage in a lifelong struggle to conquer oneself.
          </p>
        </section>

        <section>
          <h2 className="text-[10px] font-bold text-[#004898] uppercase tracking-[0.2em] mb-4 border-b border-stone-100 pb-2">Nature & Conservation</h2>
          <div className="space-y-4 text-sm text-stone-600 serif">
             <div className="flex items-start">
                <Trees className="w-4 h-4 mr-3 text-[#D7001B] flex-shrink-0 mt-1" />
                <p>Singature campus features, including the Chapel, Plumeria Garden, and the Wah Yan Heritage Centre, are vital zones for local biodiversity.</p>
             </div>
             <div className="flex items-start">
                <Info className="w-4 h-4 mr-3 text-[#D7001B] flex-shrink-0 mt-1" />
                <p>Observe the traditional Jesuit values by showing respect to all creatures within these sacred grounds.</p>
             </div>
          </div>
        </section>
        
        <button 
            onClick={onBack}
            className="w-full py-4 bg-[#004898] text-white font-bold rounded shadow-xl hover:bg-[#00367a] transition serif uppercase tracking-[0.2em] text-xs"
        >
            Return to Explorer Map
        </button>

      </div>
    </div>
  );
};
