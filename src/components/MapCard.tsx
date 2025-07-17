"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Map as MapIcon, AlertTriangle, MapPin, Anchor, Fish, Shield, Loader2, Navigation } from "lucide-react";
import dynamic from 'next/dynamic';
import { useLanguage } from "@/context/LanguageContext";
import { Badge } from "@/components/ui/badge";

// Dynamically import Leaflet components to avoid SSR issues
const MapContainer = dynamic(() => import('react-leaflet').then((mod) => mod.MapContainer), { 
  ssr: false,
  loading: () => <div className="h-full w-full flex items-center justify-center">Loading map...</div>
});
const TileLayer = dynamic(() => import('react-leaflet').then((mod) => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then((mod) => mod.Marker), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then((mod) => mod.Popup), { ssr: false });

// Hook to initialize Leaflet
const useLeaflet = () => {
  const [L, setL] = useState<any>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      import('leaflet').then((leaflet) => {
        import('leaflet/dist/leaflet.css');
        
        // Fix for default markers
        delete (leaflet.default.Icon.Default.prototype as any)._getIconUrl;
        leaflet.default.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        });
        
        setL(leaflet.default);
        setIsReady(true);
      }).catch((error) => {
        console.error('Failed to load Leaflet:', error);
        setIsReady(false);
      });
    }
  }, []);

  return { L, isReady };
};

type FishingPOI = {
  id: string;
  name: string;
  type: 'harbor' | 'market' | 'station' | 'zone' | 'dock';
  position: { lat: number; lng: number };
  description: string;
  distance?: number;
};

// Function to calculate distance between two coordinates (in km)
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // Radius of the Earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;
  return Math.round(distance * 100) / 100;
};

// Generate fishing-related POIs near user location
const generateFishingPOIs = (userLat: number, userLng: number): FishingPOI[] => {
  const basePOIs: Omit<FishingPOI, 'distance'>[] = [
    {
      id: '1',
      name: 'Main Fishing Harbor',
      type: 'harbor',
      position: { lat: userLat + 0.01, lng: userLng + 0.02 },
      description: 'Primary fishing harbor with boat services and fuel'
    },
    {
      id: '2',
      name: 'Fish Market',
      type: 'market',
      position: { lat: userLat - 0.015, lng: userLng + 0.01 },
      description: 'Local fish market for selling daily catch'
    },
    {
      id: '3',
      name: 'Coast Guard Station',
      type: 'station',
      position: { lat: userLat + 0.02, lng: userLng - 0.01 },
      description: 'Coast guard station for emergency assistance'
    },
    {
      id: '4',
      name: 'Safe Fishing Zone',
      type: 'zone',
      position: { lat: userLat - 0.01, lng: userLng - 0.02 },
      description: 'Recommended safe fishing area with good catch'
    },
    {
      id: '5',
      name: 'Boat Repair Dock',
      type: 'dock',
      position: { lat: userLat + 0.005, lng: userLng - 0.015 },
      description: 'Boat repair and maintenance facility'
    },
    {
      id: '6',
      name: 'Ice Factory',
      type: 'market',
      position: { lat: userLat - 0.008, lng: userLng + 0.018 },
      description: 'Ice supply for preserving fish catch'
    }
  ];

  return basePOIs.map(poi => ({
    ...poi,
    distance: calculateDistance(userLat, userLng, poi.position.lat, poi.position.lng)
  }));
};

const getMarkerIcon = (type: FishingPOI['type'], L: any) => {
  if (!L) return null;
  
  const iconHtml = (emoji: string) => `
    <div style="
      background: white;
      border: 2px solid #3b82f6;
      border-radius: 50%;
      width: 30px;
      height: 30px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    ">${emoji}</div>
  `;

  const iconSize: [number, number] = [30, 30];
  const iconAnchor: [number, number] = [15, 15];

  switch (type) {
    case 'harbor': 
      return new L.DivIcon({
        html: iconHtml('⚓'),
        className: 'custom-marker',
        iconSize,
        iconAnchor
      });
    case 'market': 
      return new L.DivIcon({
        html: iconHtml('🐟'),
        className: 'custom-marker',
        iconSize,
        iconAnchor
      });
    case 'station': 
      return new L.DivIcon({
        html: iconHtml('🛡️'),
        className: 'custom-marker',
        iconSize,
        iconAnchor
      });
    case 'zone': 
      return new L.DivIcon({
        html: iconHtml('🎣'),
        className: 'custom-marker',
        iconSize,
        iconAnchor
      });
    case 'dock': 
      return new L.DivIcon({
        html: iconHtml('🚢'),
        className: 'custom-marker',
        iconSize,
        iconAnchor
      });
    default: 
      return new L.DivIcon({
        html: iconHtml('📍'),
        className: 'custom-marker',
        iconSize,
        iconAnchor
      });
  }
};

// User location marker icon
const getUserLocationIcon = (L: any) => {
  if (!L) return null;
  
  return new L.DivIcon({
    html: `
      <div style="
        background: #ef4444;
        border: 3px solid white;
        border-radius: 50%;
        width: 20px;
        height: 20px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      "></div>
    `,
    className: 'user-location-marker',
    iconSize: [20, 20],
    iconAnchor: [10, 10]
  });
};

// Simple emoji icon getter for fallback
const getEmojiIcon = (type: FishingPOI['type']) => {
  switch (type) {
    case 'harbor': return '⚓';
    case 'market': return '🐟';
    case 'station': return '🛡️';
    case 'zone': return '🎣';
    case 'dock': return '🚢';
    default: return '📍';
  }
};

export function MapCard() {
    const { t } = useLanguage();
    const { L, isReady: leafletReady } = useLeaflet();
    const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [fishingPOIs, setFishingPOIs] = useState<FishingPOI[]>([]);
    const [selectedPOI, setSelectedPOI] = useState<FishingPOI | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [mapReady, setMapReady] = useState(false);

    useEffect(() => {
        // Set map ready after component mounts (for SSR compatibility)
        setMapReady(true);
        
        // Add custom styles for map markers
        if (typeof document !== 'undefined') {
            const markerStyles = `
                .custom-marker {
                    background: transparent !important;
                    border: none !important;
                }
                .user-location-marker {
                    background: transparent !important;
                    border: none !important;
                }
                .leaflet-popup-content-wrapper {
                    border-radius: 8px;
                }
                .leaflet-popup-tip {
                    background: white;
                }
            `;
            
            const styleId = 'leaflet-custom-styles';
            if (!document.getElementById(styleId)) {
                const styleSheet = document.createElement('style');
                styleSheet.id = styleId;
                styleSheet.textContent = markerStyles;
                document.head.appendChild(styleSheet);
            }
        }
    }, []);

    useEffect(() => {
        if (!navigator.geolocation) {
            setError("Geolocation is not supported by your browser.");
            setLoading(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const coords = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                setUserLocation(coords);
                const pois = generateFishingPOIs(coords.lat, coords.lng);
                setFishingPOIs(pois);
                setLoading(false);
            },
            (error) => {
                console.error("Geolocation error:", error);
                // Fallback to a default location (Visakhapatnam, India)
                const defaultLocation = { lat: 17.6868, lng: 83.2185 };
                setUserLocation(defaultLocation);
                const pois = generateFishingPOIs(defaultLocation.lat, defaultLocation.lng);
                setFishingPOIs(pois);
                setError("Using default location. Enable location services for accurate results.");
                setLoading(false);
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 300000 // 5 minutes
            }
        );
    }, []);

    if (loading || !mapReady || !leafletReady) {
        return (
            <Card className="modern-card-tall">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <MapIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        {t('map_title')}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-[400px] w-full rounded-lg glass-card-sm flex flex-col items-center justify-center text-center p-4">
                        <Loader2 className="w-8 h-8 mb-4 text-blue-600 dark:text-blue-400 animate-spin" />
                        <p className="font-semibold text-foreground">{t('getting_location')}</p>
                        <p className="text-sm text-muted-foreground mt-2">{t('location_access_help')}</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="modern-card-tall">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <MapIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    {t('map_title')}
                    {userLocation && (
                        <Badge variant="outline" className="ml-2 glass-card-sm">
                            <Navigation className="w-3 h-3 mr-1" />
                            Live
                        </Badge>
                    )}
                </CardTitle>
                {error && (
                    <p className="text-sm text-amber-600 dark:text-amber-400 flex items-center gap-1">
                        <AlertTriangle className="w-4 h-4" />
                        {error}
                    </p>
                )}
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {/* POI Summary */}
                    <div className="text-sm text-muted-foreground">
                        Found {fishingPOIs.length} {t('fishing_spots_nearby')}
                    </div>
                    
                    <div className="h-[400px] w-full rounded-lg glass-card-sm overflow-hidden">
                        {leafletReady && L && MapContainer ? (
                            <MapContainer
                                center={[userLocation?.lat || 17.6868, userLocation?.lng || 83.2185]}
                                zoom={13}
                                style={{ height: '100%', width: '100%' }}
                                scrollWheelZoom={true}
                            >
                                <TileLayer
                                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                />
                                
                                {/* User Location Marker */}
                                {userLocation && (
                                    <Marker
                                        position={[userLocation.lat, userLocation.lng]}
                                        icon={getUserLocationIcon(L)}
                                    >
                                        <Popup>
                                            <div className="text-center">
                                                <strong>📍 Your Location</strong>
                                                <br />
                                                <small>Lat: {userLocation.lat.toFixed(4)}, Lng: {userLocation.lng.toFixed(4)}</small>
                                            </div>
                                        </Popup>
                                    </Marker>
                                )}
                                
                                {/* Fishing POI Markers */}
                                {fishingPOIs.map((poi) => (
                                    <Marker
                                        key={poi.id}
                                        position={[poi.position.lat, poi.position.lng]}
                                        icon={getMarkerIcon(poi.type, L)}
                                        eventHandlers={{
                                            click: () => setSelectedPOI(poi),
                                        }}
                                    >
                                        <Popup>
                                            <div className="p-2 max-w-xs">
                                                <h3 className="font-semibold text-sm flex items-center gap-1">
                                                    <span>{getEmojiIcon(poi.type)}</span>
                                                    {poi.name}
                                                </h3>
                                                <p className="text-xs text-gray-600 mt-1">{poi.description}</p>
                                                {poi.distance && (
                                                    <p className="text-xs text-blue-600 mt-1 flex items-center gap-1">
                                                        <MapPin className="w-3 h-3" />
                                                        {poi.distance} km away
                                                    </p>
                                                )}
                                            </div>
                                        </Popup>
                                    </Marker>
                                ))}
                            </MapContainer>
                        ) : (
                            // Fallback static map display
                            <div className="h-full w-full bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 flex flex-col items-center justify-center relative overflow-hidden">
                                {/* Background pattern */}
                                <div className="absolute inset-0 opacity-10">
                                    <div className="grid grid-cols-8 grid-rows-6 h-full w-full">
                                        {Array.from({ length: 48 }).map((_, i) => (
                                            <div key={i} className="border border-blue-200 dark:border-blue-800"></div>
                                        ))}
                                    </div>
                                </div>
                                
                                {/* Static map content */}
                                <div className="relative z-10 text-center p-4">
                                    <MapIcon className="w-16 h-16 mb-4 text-blue-600 mx-auto" />
                                    <h3 className="text-lg font-bold text-blue-900 dark:text-blue-100 mb-2">
                                        Interactive Map
                                    </h3>
                                    <p className="text-sm text-blue-700 dark:text-blue-200 mb-4">
                                        Install react-leaflet to enable interactive mapping
                                    </p>
                                    
                                    {/* User location display */}
                                    {userLocation && (
                                        <div className="bg-white dark:bg-gray-800 rounded-lg p-3 mb-4 shadow-md">
                                            <div className="flex items-center justify-center gap-2 text-sm">
                                                <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                                                <span className="font-medium">Your Location</span>
                                            </div>
                                            <div className="text-xs text-muted-foreground mt-1">
                                                {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}
                                            </div>
                                        </div>
                                    )}
                                    
                                    {/* POI indicators */}
                                    <div className="grid grid-cols-3 gap-2 max-w-xs mx-auto">
                                        {fishingPOIs.slice(0, 6).map((poi) => (
                                            <div
                                                key={poi.id}
                                                className="bg-white dark:bg-gray-800 rounded-lg p-2 shadow-sm"
                                            >
                                                <div className="text-lg mb-1">{getEmojiIcon(poi.type)}</div>
                                                <div className="text-xs font-medium truncate">{poi.name}</div>
                                                {poi.distance && (
                                                    <div className="text-xs text-muted-foreground">{poi.distance}km</div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                    
                    {/* Quick POI List */}
                    <div className="grid grid-cols-2 gap-2">
                        {fishingPOIs.slice(0, 4).map((poi) => (
                            <div
                                key={poi.id}
                                className="text-xs p-2 bg-muted rounded-lg cursor-pointer hover:bg-muted/80 transition-colors"
                                onClick={() => setSelectedPOI(poi)}
                            >
                                <div className="font-medium flex items-center gap-1">
                                    <span>{getEmojiIcon(poi.type)}</span>
                                    {poi.name}
                                </div>
                                {poi.distance && (
                                    <div className="text-muted-foreground">{poi.distance} km</div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
