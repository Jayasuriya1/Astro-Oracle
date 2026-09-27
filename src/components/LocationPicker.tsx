import React, { useState, useEffect, useRef } from 'react';
import {
  MapPin,
  Search,
  Crosshair,
  Check,
  ChevronDown,
  ChevronUp,
  Loader2,
  Sparkles,
  Sliders
} from 'lucide-react';
import { locationService, type LocationResult, POPULAR_LOCATIONS } from '../services/locationService';
import type { Coordinates } from '../types/astrology';

interface LocationPickerProps {
  coordinates: Coordinates;
  currentCity: string;
  currentState: string;
  onLocationChange: (coords: Coordinates, city: string, state: string) => void;
  onCoordinatesOnlyChange: (coords: Coordinates) => void;
}

export const LocationPicker: React.FC<LocationPickerProps> = ({
  coordinates,
  currentCity,
  currentState,
  onLocationChange,
  onCoordinatesOnlyChange
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<LocationResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isOpenDropdown, setIsOpenDropdown] = useState(false);
  const [isGpsLoading, setIsGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [showManualCoords, setShowManualCoords] = useState(false);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpenDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle typing with debounced search
  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
    setGpsError(null);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (!text.trim()) {
      setResults([]);
      setIsOpenDropdown(false);
      setIsSearching(false);
      return;
    }

    // Immediate local match first
    const local = locationService.searchLocal(text);
    if (local.length > 0) {
      setResults(local);
      setIsOpenDropdown(true);
    }

    // Debounce global API search
    setIsSearching(true);
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const fullResults = await locationService.searchGlobal(text);
        setResults(fullResults);
        setIsOpenDropdown(true);
      } catch (e) {
        console.error('Search error:', e);
      } finally {
        setIsSearching(false);
      }
    }, 350);
  };

  // Select place from dropdown or chip
  const handleSelectPlace = (place: LocationResult) => {
    onLocationChange(
      {
        latitude: place.latitude,
        longitude: place.longitude,
        placeName: place.placeName
      },
      place.city,
      place.state
    );
    setSearchQuery(place.city);
    setIsOpenDropdown(false);
    setGpsError(null);
  };

  // GPS auto-detect
  const handleGpsDetect = async () => {
    setIsGpsLoading(true);
    setGpsError(null);
    try {
      const loc = await locationService.getCurrentGPS();
      handleSelectPlace(loc);
    } catch (err: any) {
      setGpsError(err.message || 'Failed to detect location');
    } finally {
      setIsGpsLoading(false);
    }
  };

  return (
    <div className="space-y-3" ref={wrapperRef}>
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-cyan-400" />
          Birth Place & Location
        </label>
        <span className="text-[11px] text-cyan-400/90 font-medium">
          Accurate Swiss Ephemeris Geocoding
        </span>
      </div>

      {/* Primary Smart Search & GPS Detect Bar */}
      <div className="relative">
        <div className="relative flex items-center">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            onFocus={() => {
              if (results.length > 0 || searchQuery.trim()) {
                setIsOpenDropdown(true);
              }
            }}
            placeholder="Type city or town (e.g. Tiruchirappalli, Salem, Coimbatore, Pune...)"
            className="w-full pl-10 pr-28 py-2.5 bg-slate-900 border border-slate-700/80 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition"
          />

          {/* Quick GPS Button inside search bar */}
          <div className="absolute right-1.5 flex items-center gap-1">
            {isSearching && <Loader2 className="w-3.5 h-3.5 text-slate-400 animate-spin mr-1" />}
            <button
              type="button"
              onClick={handleGpsDetect}
              disabled={isGpsLoading}
              className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 hover:border-cyan-500/40 transition flex items-center gap-1 disabled:opacity-50"
              title="Detect current location via browser GPS"
            >
              {isGpsLoading ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <Crosshair className="w-3 h-3 text-cyan-400" />
              )}
              <span className="hidden sm:inline">GPS</span>
            </button>
          </div>
        </div>

        {/* Autocomplete Dropdown */}
        {isOpenDropdown && results.length > 0 && (
          <div className="absolute z-50 left-0 right-0 mt-1.5 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl max-h-60 overflow-y-auto divide-y divide-slate-800/80">
            {results.map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectPlace(item)}
                className="w-full text-left px-3.5 py-2.5 hover:bg-slate-800/80 transition flex items-center justify-between group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center flex-shrink-0 group-hover:bg-cyan-500/20">
                    <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-200 group-hover:text-white">
                      {item.city}, {item.state}
                    </p>
                    <p className="text-[11px] text-slate-400 truncate max-w-xs sm:max-w-sm">
                      {item.placeName}
                    </p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0 pl-2">
                  <span className="text-[10px] font-mono text-cyan-300/80 bg-cyan-950/60 border border-cyan-800/50 px-1.5 py-0.5 rounded">
                    {item.latitude.toFixed(2)}°N, {item.longitude.toFixed(2)}°E
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {gpsError && (
        <p className="text-xs text-rose-400 bg-rose-950/30 border border-rose-800/50 p-2 rounded-lg">
          {gpsError}
        </p>
      )}

      {/* Currently Selected Location Summary Card */}
      <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0 text-emerald-400">
            <Check className="w-4 h-4" />
          </div>
          <div className="overflow-hidden">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-100">
                {coordinates.placeName || `${currentCity}, ${currentState}`}
              </span>
              <span className="text-[10px] text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-1.5 py-0.2 rounded font-medium">
                Active
              </span>
            </div>
            <p className="text-[11px] font-mono text-cyan-300 mt-0.5">
              Lat: {coordinates.latitude.toFixed(4)}° • Lon: {coordinates.longitude.toFixed(4)}°
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowManualCoords(!showManualCoords)}
          className="flex-shrink-0 text-[11px] text-slate-400 hover:text-white flex items-center gap-1 py-1 px-2 rounded-lg hover:bg-slate-800 transition"
        >
          <Sliders className="w-3 h-3 text-slate-400" />
          <span className="hidden sm:inline">{showManualCoords ? 'Hide Manual' : 'Fine-tune'}</span>
          {showManualCoords ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>
      </div>

      {/* Quick Location Pills */}
      <div className="space-y-1.5">
        <span className="text-[11px] text-slate-400 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-amber-400" />
          Popular Presets (1-Click Select):
        </span>
        <div className="flex flex-wrap gap-1.5">
          {POPULAR_LOCATIONS.slice(0, 10).map((preset) => {
            const isSelected =
              Math.abs(coordinates.latitude - preset.latitude) < 0.01 &&
              Math.abs(coordinates.longitude - preset.longitude) < 0.01;
            return (
              <button
                key={preset.city}
                type="button"
                onClick={() => handleSelectPlace(preset)}
                className={`px-2.5 py-1 text-xs rounded-lg border transition ${
                  isSelected
                    ? 'bg-cyan-500/20 text-cyan-200 border-cyan-500/50 shadow-sm shadow-cyan-900/30'
                    : 'bg-slate-900/80 hover:bg-slate-800 border-slate-800 text-slate-300 hover:text-white'
                }`}
              >
                {preset.city}
              </button>
            );
          })}
        </div>
      </div>

      {/* Collapsible Manual Raw Coordinates (For Advanced Astrologers) */}
      {showManualCoords && (
        <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/90 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300">
              Advanced: Custom Decimal Degrees
            </span>
            <span className="text-[10px] text-slate-500">
              Only edit if you need custom GPS seconds
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">
                Latitude (°N positive, °S negative)
              </label>
              <input
                type="number"
                step="0.0001"
                value={coordinates.latitude}
                onChange={(e) =>
                  onCoordinatesOnlyChange({
                    ...coordinates,
                    latitude: parseFloat(e.target.value) || 0
                  })
                }
                className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">
                Longitude (°E positive, °W negative)
              </label>
              <input
                type="number"
                step="0.0001"
                value={coordinates.longitude}
                onChange={(e) =>
                  onCoordinatesOnlyChange({
                    ...coordinates,
                    longitude: parseFloat(e.target.value) || 0
                  })
                }
                className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
