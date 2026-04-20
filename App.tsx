
import React, { useState, useEffect } from 'react';
import { Scanner } from './components/Scanner';
import { Leaderboard } from './components/Leaderboard';
import { Dashboard } from './components/Dashboard';
import { Login } from './components/Login';
import { InteractiveMap } from './components/InteractiveMap';
import { WaypointInfo } from './components/WaypointInfo';
import { AnimalsList } from './components/AnimalsList';
import { User, WildlifeEntry, ViewState, AnalysisResult } from './types';
import { Camera, TrendingUp, User as UserIcon, Map as MapIcon, BookOpen, Ban, ShieldAlert } from 'lucide-react';

interface PendingScan {
  imageUrl: string | null;
  result: AnalysisResult | null;
  notes: string;
  signature: string | null;
  step: 'SCAN_WILDLIFE' | 'ANALYZING' | 'REVIEW_RESULT';
  base64?: string;
}

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [view, setView] = useState<ViewState>(ViewState.MAP);
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [logbook, setLogbook] = useState<WildlifeEntry[]>([]);
  const [manualLocation, setManualLocation] = useState<{lat: number, lng: number} | undefined>(undefined);
  const [isSelectingLocation, setIsSelectingLocation] = useState(false);
  const [pendingScan, setPendingScan] = useState<PendingScan | null>(null);

  useEffect(() => {
    if (currentUser) {
      setUsers(prev => {
        const others = prev.filter(u => u.id !== currentUser.id);
        return [...others, currentUser];
      });
    }
  }, [currentUser]);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
  };

  const handleScanWithLocation = async (loc: { lat: number; lng: number }, file: File) => {
    const imageUrl = URL.createObjectURL(file);
    setManualLocation(loc);
    setIsSelectingLocation(false);
    
    const base64 = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve((reader.result as string).split(',')[1]);
    });

    setPendingScan({
      imageUrl,
      result: null,
      notes: '',
      signature: null,
      step: 'ANALYZING',
      base64
    });
    
    setView(ViewState.SCANNER);
  };

  const handleScanComplete = (entry: WildlifeEntry) => {
    if (!currentUser) return;

    // Prevent repeated uploads based on image signature
    const isDuplicate = logbook.some(e => e.imageSignature === entry.imageSignature && e.userId === currentUser.id);
    if (isDuplicate) {
      // We'll handle the error display in the Scanner component or just ignore it here
      // For now, let's just return to prevent adding
      return;
    }

    // Don't count sightings of internet uploaded photos
    let updatedLogbook = logbook;
    if (!entry.isInternetImage) {
      updatedLogbook = [...logbook, entry];
      setLogbook(updatedLogbook);
    }

    // Calculate unique species count for leveling
    const uniqueSpeciesCount = updatedLogbook.reduce((acc, item) => {
      if (!acc.includes(item.itemName.toLowerCase())) {
        acc.push(item.itemName.toLowerCase());
      }
      return acc;
    }, [] as string[]).length;

    const newLevel = Math.floor(uniqueSpeciesCount / 10) + 1;

    setManualLocation(undefined);
    setPendingScan(null); // Clear pending scan

    setCurrentUser(prev => {
      if (!prev) return null;
      
      let newWarningCount = prev.internetWarningCount;
      let newIsBanned = prev.isBanned;
      let newTotalPoints = prev.totalPoints;
      let newSightingsLogged = prev.sightingsLogged;

      if (entry.isInternetImage) {
        newWarningCount += 1;
        if (newWarningCount >= 2) {
          newIsBanned = true;
        }
      } else {
        newTotalPoints += entry.points;
        newSightingsLogged += 1;
      }

      return {
        ...prev,
        totalPoints: newTotalPoints,
        sightingsLogged: newSightingsLogged,
        internetWarningCount: newWarningCount,
        isBanned: newIsBanned,
        level: newLevel
      };
    });
    
    setView(ViewState.ANIMALS_LIST);
  };

  if (!isAuthenticated || !currentUser) return <Login onLogin={handleLogin} />;

  if (currentUser.isBanned) {
    return (
      <div className="h-screen bg-stone-900 flex flex-col items-center justify-center p-8 text-center">
        <div className="bg-red-600/20 p-6 rounded-full mb-6 border border-red-500/30">
          <ShieldAlert className="w-16 h-16 text-red-500" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-4 uppercase tracking-tighter serif">Access Denied</h1>
        <p className="text-stone-400 max-w-xs mb-8 leading-relaxed">
          Your account has been permanently banned from the network for repeated violations.
        </p>
        <button 
          onClick={() => setIsAuthenticated(false)}
          className="bg-stone-800 text-white px-8 py-3 rounded-xl font-bold border border-stone-700 hover:bg-stone-700 transition"
        >
          Sign Out
        </button>
      </div>
    );
  }

  const renderContent = () => {
    switch (view) {
      case ViewState.SCANNER: return (
        <Scanner 
          onScanComplete={handleScanComplete} 
          existingSignatures={logbook.map(e => e.imageSignature).filter((s): s is string => !!s)}
          customLocation={manualLocation} 
          initialData={pendingScan || undefined}
          onOpenMap={(data) => {
            setPendingScan(data);
            setIsSelectingLocation(true);
            setView(ViewState.MAP);
          }}
        />
      );
      case ViewState.LEADERBOARD: return <Leaderboard users={users} currentUser={currentUser} />;
      case ViewState.PROFILE: return <Dashboard user={currentUser} logbook={logbook} onLogout={() => setIsAuthenticated(false)} />;
      case ViewState.MAP: return (
        <InteractiveMap 
          items={logbook} 
          isExternalSelectionMode={isSelectingLocation}
          onSelectionModeChange={setIsSelectingLocation}
          onViewWaypointInfo={() => setView(ViewState.WAYPOINT_INFO)}
          onLocationSelect={(loc) => {
            setManualLocation(loc);
            setIsSelectingLocation(false);
            setView(ViewState.SCANNER);
          }}
          onScanWithLocation={handleScanWithLocation}
          onSelectionCancel={() => {
            setIsSelectingLocation(false);
            setView(ViewState.MAP);
          }}
        />
      );
      case ViewState.WAYPOINT_INFO: return <WaypointInfo onBack={() => setView(ViewState.MAP)} />;
      case ViewState.ANIMALS_LIST: return <AnimalsList items={logbook} />;
      default: return <Scanner onScanComplete={handleScanComplete} existingSignatures={logbook.map(e => e.imageSignature).filter((s): s is string => !!s)} />;
    }
  };

  return (
    <div className="flex flex-col h-screen text-white font-sans overflow-hidden relative">
      {/* Apple Liquid Glass Background */}
      <div className="liquid-mesh" />
      <div className="liquid-blob-v2 w-[600px] h-[600px] bg-wy-blue -top-48 -left-48 animate-float-v2" />
      <div className="liquid-blob-v2 w-[500px] h-[500px] bg-wy-red -bottom-32 -right-32 animate-float-v2" style={{ animationDelay: '-4s' }} />
      <div className="liquid-blob-v2 w-[400px] h-[400px] bg-indigo-600 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-10" />

      <main className="flex-1 overflow-hidden relative z-10">{renderContent()}</main>
      
      <nav className="apple-nav flex justify-around items-center px-4 sm:px-8 relative z-50">
        <button 
          onClick={() => { setView(ViewState.LEADERBOARD); setIsSelectingLocation(false); }} 
          className={`flex flex-col items-center py-4 transition-all duration-500 ${view === ViewState.LEADERBOARD ? 'text-white scale-110' : 'text-white/30 hover:text-white/50'}`}
        >
          <div className={`p-2 rounded-xl transition-all duration-500 ${view === ViewState.LEADERBOARD ? 'bg-white/10 shadow-lg' : ''}`}>
            <TrendingUp size={22} strokeWidth={view === ViewState.LEADERBOARD ? 2.5 : 2} />
          </div>
          <span className="text-[8px] font-bold mt-1 uppercase tracking-[0.2em]">Ranks</span>
        </button>
        
        <button 
          onClick={() => { setView(ViewState.ANIMALS_LIST); setIsSelectingLocation(false); }} 
          className={`flex flex-col items-center py-4 transition-all duration-500 ${view === ViewState.ANIMALS_LIST ? 'text-white scale-110' : 'text-white/30 hover:text-white/50'}`}
        >
          <div className={`p-2 rounded-xl transition-all duration-500 ${view === ViewState.ANIMALS_LIST ? 'bg-white/10 shadow-lg' : ''}`}>
            <BookOpen size={22} strokeWidth={view === ViewState.ANIMALS_LIST ? 2.5 : 2} />
          </div>
          <span className="text-[8px] font-bold mt-1 uppercase tracking-[0.2em]">Guide</span>
        </button>
        
        <button 
          onClick={() => { setView(ViewState.MAP); setIsSelectingLocation(false); }} 
          className={`flex flex-col items-center py-4 transition-all duration-500 ${view === ViewState.MAP ? 'text-white scale-110' : 'text-white/30 hover:text-white/50'}`}
        >
          <div className={`p-2 rounded-xl transition-all duration-500 ${view === ViewState.MAP ? 'bg-white/10 shadow-lg' : ''}`}>
            <MapIcon size={22} strokeWidth={view === ViewState.MAP ? 2.5 : 2} />
          </div>
          <span className="text-[8px] font-bold mt-1 uppercase tracking-[0.2em]">Map</span>
        </button>
        
        <button 
          onClick={() => { setView(ViewState.PROFILE); setIsSelectingLocation(false); }} 
          className={`flex flex-col items-center py-4 transition-all duration-500 ${view === ViewState.PROFILE ? 'text-white scale-110' : 'text-white/30 hover:text-white/50'}`}
        >
          <div className={`p-2 rounded-xl transition-all duration-500 ${view === ViewState.PROFILE ? 'bg-white/10 shadow-lg' : ''}`}>
            <UserIcon size={22} strokeWidth={view === ViewState.PROFILE ? 2.5 : 2} />
          </div>
          <span className="text-[8px] font-bold mt-1 uppercase tracking-[0.2em]">Profile</span>
        </button>
      </nav>
    </div>
  );
}
