import { useEffect, useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import type { Station, StationsResponse, RouteResponse } from '@shared/api';
import carfuel from "@/assets/carfuel.png";


export default function Index() {
  const [destination, setDestination] = useState('');
  const [liveMode, setLiveMode] = useState(false);
  const [stations, setStations] = useState<Station[]>([]);
  const [loadingStations, setLoadingStations] = useState(false);
  const [routeResult, setRouteResult] = useState<{ station: Station; distanceKm: number } | null>(null);

  useEffect(() => {
    if (liveMode && stations.length === 0) {
      setLoadingStations(true);
      fetch('/api/stations')
        .then((r) => r.json())
        .then((data: StationsResponse) => setStations(data.stations))
        .finally(() => setLoadingStations(false));
    }
  }, [liveMode, stations.length]);

  useEffect(() => {
    const q = destination.trim();
    if (!q) {
      setRouteResult(null);
      return;
    }
    // Ensure stations are present to match destination
    const ensure = stations.length ? Promise.resolve(stations) : fetch('/api/stations').then((r) => r.json()).then((d: StationsResponse) => { setStations(d.stations); return d.stations; });

    ensure.then((list) => {
      const match = list.find((s) => s.name.toLowerCase().includes(q.toLowerCase()));
      if (!match) {
        setRouteResult(null);
        return;
      }
      fetch('/api/route', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ destinationId: match.id }),
      })
        .then((r) => r.json())
        .then((data: RouteResponse) => setRouteResult({ station: match, distanceKm: data.distanceKm }))
        .catch(() => setRouteResult(null));
    });
  }, [destination]);

  const getStationColor = (type: string) => {
    switch (type) {
      case 'Fast':
        return 'bg-station-fast';
      case 'Normal':
        return 'bg-station-normal';
      case 'Slow':
        return 'bg-station-slow';
      default:
        return 'bg-gray-400';
    }
  };

  const showNearby = useMemo(() => !destination.trim() && liveMode, [destination, liveMode]);
  const hideBelowOnSearch = destination.trim().length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-ev-dark to-black relative overflow-hidden">
      {/* Decorative gridlines */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.06]">
        {Array.from({ length: 30 }).map((_, i) => (
          <div key={`v-${i}`} className="absolute h-full w-px bg-white" style={{ left: `${i * 40}px` }} />
        ))}
        {Array.from({ length: 20 }).map((_, i) => (
          <div key={`h-${i}`} className="absolute w-full h-px bg-white" style={{ top: `${i * 40}px` }} />
        ))}
      </div>

      {/* Enhanced animated background glows */}
      <div className="absolute inset-0 opacity-30 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-ev-green rounded-full mix-blend-screen blur-3xl animate-blob" />
        <div className="absolute top-1/3 -right-32 w-80 h-80 bg-station-fast rounded-full mix-blend-screen blur-3xl animate-blob" style={{ animationDelay: '2s' }} />
        <div className="absolute bottom-10 left-1/3 w-72 h-72 bg-station-normal rounded-full mix-blend-screen blur-2xl animate-blob" style={{ animationDelay: '4s' }} />
      </div>

      {/* Header */}
      <header className="bg-gradient-to-r from-ev-green via-[#7bc93f] to-[#6bb933] border-b border-[#E6EDF3]/30 relative z-10 glow-green shadow-2xl shadow-ev-green/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <h1 className="font-jersey text-4xl sm:text-5xl text-black drop-shadow-lg">EV STATION TRACKER</h1>
            <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
              <p className="text-xs sm:text-sm text-black hidden lg:block flex-1 sm:flex-none text-center font-semibold">Find nearby EV charging stations and plan your route — fast & simple.</p>
              <div className="flex items-center gap-2 sm:gap-3">
                {/* Live Toggle */}
                <button
                  onClick={() => setLiveMode((v) => !v)}
                  className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full bg-gradient-to-r from-[#E6F0FF] to-[#D4E8FF] border border-[#CCE0FF] smooth-transition btn-glow"
                  style={{
                    boxShadow: liveMode ? '0 0 20px rgba(52, 199, 89, 0.5), 0 8px 16px rgba(0,0,0,0.1)' : '0 4px 12px rgba(0,0,0,0.1)',
                  }}
                >
                  <span className="text-xs text-ev-gray font-semibold">Live</span>
                  <div className={`w-12 sm:w-16 h-6 sm:h-7 rounded-full transition-all duration-300 ${liveMode ? 'bg-[#34C759] shadow-lg shadow-[#34C759]/60' : 'bg-gray-300'} relative`}>
                    <div className={`absolute top-0.5 w-6 h-6 sm:w-6 sm:h-6 bg-white rounded-full transition-transform shadow-md ${liveMode ? 'translate-x-6 sm:translate-x-9' : 'translate-x-0.5'}`} />
                  </div>
                </button>

                {/* Filters Button (visual only) */}
                <button className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full bg-gradient-to-r from-[#E6F0FF] to-[#D4E8FF] border border-[#CCE0FF] smooth-transition btn-glow hover:bg-gradient-to-r hover:from-[#D4E8FF] hover:to-[#C2E0FF]">
                  <span className="text-xs text-ev-gray font-semibold">Filters</span>
                  <svg width="20" height="18" viewBox="0 0 33 24" fill="none" className="opacity-60 icon-glow">
                    <path d="M30.25 3H2.75L13.75 12.46V19L19.25 21V12.46L30.25 3Z" stroke="#1E1E1E" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12 relative z-10">
        <div className={`grid ${hideBelowOnSearch ? 'lg:grid-cols-1' : 'lg:grid-cols-[1fr,400px]'} gap-6 sm:gap-8`}>
          {/* Left Section - Search and Results */}
          <div className="space-y-6">
            {/* Search Box */}
            <div className="card-glow card-glow-hover p-4 sm:p-6 rounded-lg">
              <h2 className="text-xs sm:text-sm font-semibold text-black mb-3">Enter destination</h2>
              <div className="relative">
                <input
                  type="text"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="Type an address, city or landmark."
                  className="w-full px-4 py-3 pr-12 text-xs sm:text-sm border-2 border-[#E6EDF3] rounded-lg focus:outline-none focus:ring-2 focus:ring-ev-green focus:border-ev-green placeholder:text-ev-gray smooth-transition hover:border-[#D0E0F0]"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-ev-green to-[#7bc93f] rounded-full flex items-center justify-center glow-green icon-glow shadow-lg pulse-glow">
                    <Search className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                </div>
              </div>
            </div>

            {/* Destination Result (shown when typing) */}
            {destination.trim() && (
              <div className="card-glow card-glow-hover p-4 sm:p-6 rounded-lg relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-ev-green/5 to-transparent pointer-events-none" />
                {!routeResult ? (
                  <p className="text-sm text-ev-gray relative z-10">No matching station found.</p>
                ) : (
                  <div className="flex items-center gap-4 relative z-10">
                    <div
                      className={`w-12 h-12 rounded-full ${getStationColor(routeResult.station.type)} flex-shrink-0 shadow-lg icon-glow`}
                      style={{
                        boxShadow: `0 0 15px ${
                          routeResult.station.type === 'Fast' ? 'rgba(14, 165, 164, 0.6)' :
                          routeResult.station.type === 'Normal' ? 'rgba(245, 158, 11, 0.6)' :
                          'rgba(239, 68, 68, 0.6)'
                        }`
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-black truncate">{routeResult.station.name}</h3>
                      <p className="text-xs text-ev-gray mt-2 font-medium">Type: {routeResult.station.type} • Ports: {routeResult.station.ports} • <span className="text-ev-green font-bold">{routeResult.distanceKm.toFixed(1)} km</span></p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Nearby Stations (only when Live ON and not searching) */}
            {showNearby && (
              <div className="card-glow card-glow-hover p-4 sm:p-6 rounded-lg">
                <h2 className="text-xs sm:text-sm font-semibold text-black mb-2">Nearby stations</h2>
                <p className="text-xs text-ev-gray mb-6">{loadingStations ? 'Loading…' : 'Showing stations close to your location (demo data).'}
                </p>
                <div className="space-y-3">
                  {stations.map((station, idx) => {
                    const colors = {
                      'Fast': { color: 'station-fast', glow: 'rgba(14, 165, 164, 0.4)' },
                      'Normal': { color: 'station-normal', glow: 'rgba(245, 158, 11, 0.4)' },
                      'Slow': { color: 'station-slow', glow: 'rgba(239, 68, 68, 0.4)' },
                    };
                    const colorScheme = colors[station.type as keyof typeof colors] || colors.Normal;
                    return (
                      <div
                        key={station.id}
                        className="flex items-center gap-4 p-3 sm:p-4 border-2 border-[#E6EDF3] rounded-lg smooth-transition hover:border-[#D0E0F0] hover:bg-gradient-to-r hover:from-white/50 hover:to-white"
                        style={{
                          boxShadow: `inset 0 0 10px ${colorScheme.glow}`,
                        }}
                      >
                        <div
                          className={`w-10 h-10 rounded-full bg-${colorScheme.color} flex-shrink-0 shadow-lg icon-glow`}
                          style={{
                            boxShadow: `0 0 12px ${colorScheme.glow.replace('0.4)', '0.6)')}`
                          }}
                        />
                        <div className="flex-1 min-w-0">
                          <h3 className="text-xs sm:text-sm font-semibold text-black truncate">{station.name}</h3>
                          <p className="text-xs text-ev-gray mt-1 font-medium">Type: {station.type} • Ports: {station.ports}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Right Section - About Panel (hidden while searching) */}
          {!hideBelowOnSearch && (
            <div className="card-glow card-glow-hover p-4 sm:p-6 rounded-lg h-fit relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-ev-green/5 to-transparent pointer-events-none" />
              <div className="relative z-10">
                <h2 className="text-xs sm:text-sm font-semibold text-black mb-3">About</h2>
                <p className="text-xs text-ev-gray mb-6 leading-relaxed">EV Station Tracker makes finding charging points simple. Search a destination to see stations along your route.</p>
                <div className="mb-6 pb-6 border-b border-[#E6EDF3]">
                  <h3 className="text-xs sm:text-sm font-semibold text-black mb-3">Key features</h3>
                  <ul className="space-y-2">
                    <li className="text-xs text-ev-gray flex items-start gap-2"><span className="text-ev-green font-bold">●</span> Live station availability</li>
                    <li className="text-xs text-ev-gray flex items-start gap-2"><span className="text-ev-green font-bold">●</span> Filter by charger type & speed</li>
                    <li className="text-xs text-ev-gray flex items-start gap-2"><span className="text-ev-green font-bold">●</span> Save favorites & plan routes</li>
                  </ul>
                </div>
                <div className="bg-gradient-to-br from-[#F1F8F7] to-[#E8F5F3] border-2 border-[#DCEFEF] rounded-lg p-4 sm:p-5 shadow-lg shadow-station-fast/10 smooth-transition hover:shadow-lg hover:shadow-station-fast/20">
                  <p className="text-xs text-station-fast font-semibold mb-1">Plug in • Drive on</p>
                  <p className="text-xs text-ev-gray mb-4 leading-relaxed">Plan routes and charge with confidence.</p>
                  <img src={carfuel} alt="EV charging illustration" className="w-full max-w-[300px] mx-auto rounded-md shadow-md" />
                  <p className="text-xs text-center text-ev-green font-bold mt-3">HAPPY CHARGING :)</p>
                </div>
                <p className="text-xs text-ev-gray mt-6 text-center italic">Tip: use short place names for faster suggestions.</p>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 text-center py-6 sm:py-8 mt-8 border-t border-ev-green/20">
        <p className="font-jersey text-sm sm:text-base text-white drop-shadow-lg font-semibold">Made for love and DSA project</p>
        <div className="mt-3 flex justify-center gap-3 opacity-60">
          <div className="w-1 h-1 rounded-full bg-ev-green glow-green animate-pulse" />
          <div className="w-1 h-1 rounded-full bg-station-fast glow-cyan animate-pulse" style={{ animationDelay: '0.5s' }} />
          <div className="w-1 h-1 rounded-full bg-station-normal glow-orange animate-pulse" style={{ animationDelay: '1s' }} />
        </div>
      </footer>
    </div>
  );
}
