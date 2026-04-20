
import React, { useEffect, useRef, useState } from 'react';
import * as L from 'leaflet';
import { WildlifeEntry } from '../types';
import { MapPin, Camera, Crosshair, X, Check, Navigation, LocateFixed, Info, Layers, Plus, Minus, Compass } from 'lucide-react';

type MapLayer = 'satellite' | 'streets' | 'terrain';

interface InteractiveMapProps {
  items: WildlifeEntry[];
  isExternalSelectionMode: boolean;
  onViewWaypointInfo: () => void;
  onLocationSelect: (location: { lat: number; lng: number }) => void;
  onSelectionCancel: () => void;
  onSelectionModeChange?: (mode: boolean) => void;
  onScanWithLocation?: (location: { lat: number; lng: number }, file: File) => void;
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({ 
  items, 
  isExternalSelectionMode,
  onViewWaypointInfo, 
  onLocationSelect,
  onSelectionCancel,
  onSelectionModeChange,
  onScanWithLocation
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const userAccuracyRef = useRef<L.Circle | null>(null);
  const onViewWaypointInfoRef = useRef(onViewWaypointInfo);
  const [internalSelectionMode, setInternalSelectionMode] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [currentLayer, setCurrentLayer] = useState<MapLayer>('satellite');
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setInternalSelectionMode(isExternalSelectionMode);
  }, [isExternalSelectionMode]);

  useEffect(() => {
    onViewWaypointInfoRef.current = onViewWaypointInfo;
  }, [onViewWaypointInfo]);
  
  const handleStartSighting = () => {
    setInternalSelectionMode(true);
    if (onSelectionModeChange) onSelectionModeChange(true);
    // Automatically try to locate user when starting a sighting for better UX
    handleLocateMe();
  };

  const handleCancelSighting = () => {
    setInternalSelectionMode(false);
    if (onSelectionModeChange) onSelectionModeChange(false);
    onSelectionCancel();
  };

  const defaultCenter: [number, number] = [22.274056, 114.175944];

  const handleLocateMe = () => {
    if (!mapInstanceRef.current) return;
    setIsLocating(true);
    
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        if (mapInstanceRef.current) {
          const map = mapInstanceRef.current;
          
          // Use a higher zoom level for better precision
          map.flyTo([latitude, longitude], 19, { 
            duration: 1,
            easeLinearity: 0.25
          });
          
          const userIconHtml = `
            <div class="relative flex items-center justify-center w-8 h-8">
               <div class="absolute w-12 h-12 bg-wy-blue rounded-full opacity-20 animate-ping"></div>
               <div class="w-4 h-4 bg-wy-blue rounded-full border-2 border-white shadow-md z-10"></div>
            </div>
          `;
          const userIcon = L.divIcon({
            className: 'bg-transparent border-none',
            html: userIconHtml,
            iconSize: [32, 32],
            iconAnchor: [16, 16]
          });

          // Update or create accuracy circle
          if (userAccuracyRef.current) {
            userAccuracyRef.current.setLatLng([latitude, longitude]);
            userAccuracyRef.current.setRadius(accuracy);
          } else {
            userAccuracyRef.current = L.circle([latitude, longitude], {
              radius: accuracy,
              color: '#004898',
              fillColor: '#004898',
              fillOpacity: 0.1,
              weight: 1,
              interactive: false
            }).addTo(map);
          }

          if (userMarkerRef.current) {
            userMarkerRef.current.setLatLng([latitude, longitude]);
          } else {
            userMarkerRef.current = L.marker([latitude, longitude], { icon: userIcon, zIndexOffset: 2000 }).addTo(map);
          }
        }
        setIsLocating(false);
      },
      (err) => {
        console.error("Geolocation failed", err);
        setIsLocating(false);
        alert("Could not get your precise location. Please ensure GPS is enabled.");
      },
      { 
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      mapInstanceRef.current = L.map(mapContainerRef.current, {
        zoomControl: false,
        attributionControl: false,
        minZoom: 4,
        maxZoom: 19
      }).setView(defaultCenter, 18); 

      updateMapLayer('satellite');
    }

    const map = mapInstanceRef.current;

    map.eachLayer((layer) => {
      if (layer instanceof L.Marker && layer !== userMarkerRef.current) {
        map.removeLayer(layer);
      }
      if (layer instanceof L.Circle && layer !== userAccuracyRef.current) {
        map.removeLayer(layer);
      }
    });

    // Central Waypoint with Wah Yan Blue/Red styling
    const waypointIconHtml = `
      <div class="relative flex items-center justify-center w-12 h-12">
         <div class="absolute w-12 h-12 bg-[#004898] rounded-full opacity-20 animate-pulse"></div>
         <div class="relative w-10 h-10 bg-[#004898] rounded-full border-2 border-white shadow-xl flex items-center justify-center text-white z-10">
            <span class="text-xs font-bold">✦</span>
         </div>
      </div>
    `;

    const waypointIcon = L.divIcon({
        className: 'bg-transparent border-none',
        html: waypointIconHtml,
        iconSize: [48, 48],
        iconAnchor: [24, 48],
        popupAnchor: [0, -48]
    });

    const centralMarker = L.marker(defaultCenter, { icon: waypointIcon, zIndexOffset: 1000 }).addTo(map);
    centralMarker.bindPopup(`
        <div class="p-4 text-center min-w-[200px] serif bg-stone-950/90 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl">
            <div class="w-12 h-12 bg-wy-blue/20 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-wy-blue/30">
              <span class="text-wy-blue text-xl">✦</span>
            </div>
            <h3 class="font-bold text-white text-sm mb-1 leading-tight uppercase tracking-wider">Wah Yan College<br/>Campus Sanctuary</h3>
            <p class="text-[9px] text-white/30 mb-4 uppercase tracking-widest font-black">Heritage Site HQ</p>
            <button id="btn-waypoint-info" class="w-full bg-white text-stone-950 text-[9px] font-black py-3 px-4 rounded-xl shadow-xl hover:bg-stone-100 transition flex items-center justify-center uppercase tracking-widest">
                <span>School Background</span>
            </button>
        </div>
    `, {
      className: 'custom-popup',
      closeButton: false
    });

    centralMarker.on('popupopen', () => {
        const btn = document.getElementById('btn-waypoint-info');
        if (btn) btn.addEventListener('click', () => onViewWaypointInfoRef.current());
    });

    const validItems = items.filter(item => item.location);
    validItems.forEach(item => {
      if (!item.location) return;
      const { lat, lng } = item.location;
      
      const iconHtml = `
        <div class="relative flex items-center justify-center w-8 h-8">
           <div class="absolute w-8 h-8 bg-[#D7001B] rounded-full opacity-30 animate-pulse"></div>
           <div class="relative w-8 h-8 bg-white rounded-full border-2 border-[#D7001B] shadow-lg flex items-center justify-center text-[#D7001B] font-bold text-xs overflow-hidden">
              <img src="${item.imageUrl}" class="w-full h-full object-cover" />
           </div>
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'bg-transparent border-none',
        html: iconHtml,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
        popupAnchor: [0, -16]
      });

      L.marker([lat, lng], { icon: customIcon }).addTo(map).bindPopup(`
        <div class="p-0 min-w-[180px] text-center serif bg-stone-950/90 backdrop-blur-xl rounded-[2rem] border border-white/10 shadow-2xl overflow-hidden">
          <div class="h-28 w-full relative">
            <img src="${item.imageUrl}" class="w-full h-full object-cover" />
            <div class="absolute inset-0 bg-gradient-to-t from-stone-950 via-transparent to-transparent"></div>
          </div>
          <div class="p-4">
            <h3 class="font-bold text-white text-sm uppercase tracking-wide mb-1">${item.itemName}</h3>
            <p class="text-[9px] text-white/40 italic mb-3 font-medium">${item.category}</p>
            <div class="inline-flex items-center space-x-2 px-3 py-1 bg-wy-red/20 rounded-full border border-wy-red/30">
              <div class="w-1 h-1 bg-wy-red rounded-full animate-pulse"></div>
              <span class="text-[8px] text-wy-red uppercase font-black tracking-widest">Logged by Wahyanite</span>
            </div>
          </div>
        </div>
      `, {
        className: 'custom-popup',
        closeButton: false
      });
    });

    return () => {};
  }, [items, internalSelectionMode]);

  const updateMapLayer = (layer: MapLayer) => {
    if (!mapInstanceRef.current) return;
    
    if (tileLayerRef.current) {
      mapInstanceRef.current.removeLayer(tileLayerRef.current);
    }

    let url = '';
    switch (layer) {
      case 'satellite':
        url = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
        break;
      case 'streets':
        url = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
        break;
      case 'terrain':
        url = 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png';
        break;
    }

    tileLayerRef.current = L.tileLayer(url, {
      maxZoom: 19,
      attribution: 'Map data'
    }).addTo(mapInstanceRef.current);
    setCurrentLayer(layer);
  };

  const handleZoomIn = () => mapInstanceRef.current?.zoomIn();
  const handleZoomOut = () => mapInstanceRef.current?.zoomOut();

  const handleCaptureLocation = () => {
    if (mapInstanceRef.current) {
        const center = mapInstanceRef.current.getCenter();
        onLocationSelect({ lat: center.lat, lng: center.lng });
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && mapInstanceRef.current) {
      const center = mapInstanceRef.current.getCenter();
      onScanWithLocation?.({ lat: center.lat, lng: center.lng }, file);
    }
  };

  return (
    <div className="flex flex-col h-full relative z-10 overflow-hidden">
       {!internalSelectionMode && (
         <div className="absolute top-8 left-0 right-0 z-[1000] flex justify-center pointer-events-none px-4">
            <div className="apple-glass px-8 py-3 rounded-full pointer-events-auto flex items-center space-x-4 border-white/20 shadow-2xl animate-in fade-in slide-in-from-top-4 duration-700">
                <div className="w-8 h-8 bg-wy-red/20 rounded-full flex items-center justify-center border border-wy-red/30">
                  <Compass className="w-4 h-4 text-wy-red animate-spin-slow" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-white uppercase tracking-[0.3em]">Sanctuary Explorer</span>
                  <span className="text-[7px] text-white/30 uppercase tracking-widest font-bold">Wah Yan College Campus</span>
                </div>
            </div>
         </div>
       )}
       
       <div ref={mapContainerRef} className="flex-1 w-full bg-stone-950" />

       {/* Custom Map Controls */}
       {!internalSelectionMode && (
         <>
           {/* Top Right: GPS & Layers */}
           <div className="absolute top-24 right-4 sm:right-8 z-[1000] flex flex-col space-y-3">
             <button 
               onClick={handleLocateMe}
               disabled={isLocating}
               className="w-12 h-12 sm:w-14 sm:h-14 apple-glass rounded-2xl flex flex-col items-center justify-center text-white hover:bg-white/10 transition-all active:scale-90 disabled:opacity-50 border-white/10 shadow-2xl group"
             >
               <LocateFixed size={18} className={isLocating ? "animate-pulse text-wy-blue" : "group-hover:scale-110 transition-transform"} />
             </button>
             
             <div className="flex flex-col apple-glass rounded-2xl border-white/10 overflow-hidden shadow-2xl">
               <button 
                 onClick={() => updateMapLayer('satellite')}
                 className={`w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center transition-all ${currentLayer === 'satellite' ? 'bg-wy-blue text-white' : 'text-white/40 hover:bg-white/5'}`}
               >
                 <Layers size={18} />
               </button>
               <button 
                 onClick={() => updateMapLayer('streets')}
                 className={`w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center transition-all border-t border-white/5 ${currentLayer === 'streets' ? 'bg-wy-blue text-white' : 'text-white/40 hover:bg-white/5'}`}
               >
                 <Navigation size={18} />
               </button>
             </div>
           </div>

           {/* Bottom Right: Zoom Controls */}
           <div className="absolute bottom-32 right-4 sm:right-8 z-[1000] flex flex-col apple-glass rounded-2xl border-white/10 overflow-hidden shadow-2xl">
             <button onClick={handleZoomIn} className="w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center text-white/60 hover:bg-white/10 transition-all active:bg-white/20">
               <Plus size={20} />
             </button>
             <button onClick={handleZoomOut} className="w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center text-white/60 hover:bg-white/10 transition-all border-t border-white/5 active:bg-white/20">
               <Minus size={20} />
             </button>
           </div>

           {/* Bottom Center: Main Action */}
           <div className="absolute bottom-10 left-0 right-0 z-[1000] flex justify-center pointer-events-none">
              <button 
                onClick={handleStartSighting}
                className="pointer-events-auto group relative"
              >
                 <div className="absolute -inset-4 bg-wy-blue/20 rounded-full blur-2xl group-hover:bg-wy-blue/40 transition-all duration-500"></div>
                 <div className="relative w-20 h-20 bg-wy-blue text-white rounded-full shadow-[0_20px_50px_rgba(0,72,152,0.4)] flex items-center justify-center border border-white/20 active:scale-90 transition-all overflow-hidden">
                    <Camera size={32} className="relative z-10" />
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                 </div>
              </button>
           </div>
         </>
       )}

       {/* Selection Mode UI */}
       {!internalSelectionMode && items.length > 0 && (
         <div className="absolute bottom-32 left-4 sm:left-8 z-[1000] animate-in slide-in-from-left-8 duration-700">
            <div className="apple-glass p-5 rounded-3xl border-white/10 shadow-2xl flex flex-col space-y-3">
               <div className="flex items-center space-x-3 mb-1">
                  <div className="w-2 h-2 bg-wy-red rounded-full animate-pulse"></div>
                  <span className="text-[9px] font-black text-white/40 uppercase tracking-[0.2em]">Live Sightings</span>
               </div>
               <div className="flex -space-x-2">
                  {items.slice(0, 4).map((item, i) => (
                    <div key={i} className="w-8 h-8 rounded-full border-2 border-stone-900 overflow-hidden bg-stone-800">
                      <img src={item.imageUrl} className="w-full h-full object-cover" />
                    </div>
                  ))}
                  {items.length > 4 && (
                    <div className="w-8 h-8 rounded-full border-2 border-stone-900 bg-stone-800 flex items-center justify-center">
                      <span className="text-[8px] font-black text-white">+{items.length - 4}</span>
                    </div>
                  )}
               </div>
               <p className="text-[10px] text-white font-bold tracking-tight">{items.length} specimens logged</p>
            </div>
         </div>
       )}

       {internalSelectionMode && (
         <div className="absolute inset-0 z-[1000] pointer-events-none flex flex-col items-center justify-between py-20">
            <div className="apple-glass px-8 py-4 rounded-2xl border-white/20 shadow-2xl animate-in slide-in-from-top-8 duration-700">
               <p className="text-white font-black text-[10px] uppercase tracking-[0.4em]">Pin specimen location</p>
            </div>

            <div className="relative flex items-center justify-center">
               <div className="absolute w-64 h-64 border-2 border-dashed border-wy-red/30 rounded-full animate-spin-slow"></div>
               <div className="absolute w-48 h-48 border border-wy-red/20 rounded-full animate-pulse"></div>
               <div className="text-wy-red bg-white/10 p-8 rounded-full backdrop-blur-3xl border-2 border-wy-red/50 shadow-[0_0_60px_rgba(215,0,27,0.5)]">
                  <Crosshair size={48} strokeWidth={1.5} />
               </div>
            </div>

            <div className="h-20"></div> {/* Spacer */}
         </div>
       )}

        {internalSelectionMode && (
          <div className="absolute bottom-10 left-0 right-0 z-[1000] flex justify-center px-4 sm:px-8 pointer-events-none">
             <div className="pointer-events-auto flex space-x-3 sm:space-x-4 items-center">
                <button 
                  onClick={handleCancelSighting} 
                  className="w-12 h-12 sm:w-14 sm:h-14 apple-glass text-white/40 rounded-xl sm:rounded-2xl flex items-center justify-center border-white/10 shadow-2xl active:scale-90 transition-all"
                >
                   <X size={20} />
                </button>
                <button onClick={handleLocateMe} className="w-12 h-12 sm:w-14 sm:h-14 apple-glass text-wy-blue rounded-xl sm:rounded-2xl flex items-center justify-center border-white/10 shadow-2xl active:scale-90 transition-all">
                   <LocateFixed size={20} className={isLocating ? "animate-pulse" : ""} />
                </button>
                <div className="relative">
                   <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center space-x-3 sm:space-x-4 bg-white text-stone-950 px-6 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl shadow-[0_0_40px_rgba(255,255,255,0.3)] font-black border border-white/20 uppercase tracking-[0.2em] sm:tracking-[0.3em] text-[9px] sm:text-[10px] active:scale-95 transition-all"
                   >
                      <Camera size={18} />
                      <span>Pin & Snap</span>
                   </button>
                   <input 
                     ref={fileInputRef}
                     type="file" 
                     accept="image/*" 
                     className="hidden" 
                     onChange={handleFileChange}
                   />
                </div>
             </div>
          </div>
        )}
    </div>
  );
};
