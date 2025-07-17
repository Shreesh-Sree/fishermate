"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Map as MapIcon, AlertTriangle, MapPin, Anchor, Fish, Shield, Loader2, Navigation } from "lucide-react";
import dynamic from 'next/dynamic';
import { useLanguage } from "@/context/LanguageContext";
import { Badge } from "@/components/ui/badge";

// Dynamically import Leaflet components to avoid SSR issues
const MapContainer = dynamic(() => import('react-leaflet').then((mod) => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then((mod) => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then((mod) => mod.Marker), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then((mod) => mod.Popup), { ssr: false });

// Import Leaflet CSS
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Custom CSS for markers
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

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = markerStyles;
  document.head.appendChild(styleSheet);
}

// Fix for default markers in Leaflet
if (typeof window !== 'undefined') {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  });
}

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

const getMarkerIcon = (type: FishingPOI['type']) => {
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
const getUserLocationIcon = () => {
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

export function MapCard() {
    const { t } = useLanguage();
    const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [fishingPOIs, setFishingPOIs] = useState<FishingPOI[]>([]);
    const [selectedPOI, setSelectedPOI] = useState<FishingPOI | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [mapReady, setMapReady] = useState(false);

    useEffect(() => {
        // Set map ready after component mounts (for SSR compatibility)
        setMapReady(true);
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

    if (loading || !mapReady) {
        return (
            <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle className="font-headline flex items-center gap-2">
                        <MapIcon className="w-6 h-6 text-primary" />
                        {t('map_title')}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-[400px] w-full rounded-lg border bg-muted flex flex-col items-center justify-center text-center p-4">
                        <Loader2 className="w-8 h-8 mb-4 text-primary animate-spin" />
                        <p className="font-bold">{t('getting_location')}</p>
                        <p className="text-sm text-muted-foreground">{t('location_access_help')}</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="shadow-lg">
            <CardHeader>
                <CardTitle className="font-headline flex items-center gap-2">
                    <MapIcon className="w-6 h-6 text-primary" />
                    {t('map_title')}
                    {userLocation && (
                        <Badge variant="outline" className="ml-2">
                            <Navigation className="w-3 h-3 mr-1" />
                            Live
                        </Badge>
                    )}
                </CardTitle>
                {error && (
                    <p className="text-sm text-amber-600 flex items-center gap-1">
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
                    
                    <div className="h-[400px] w-full rounded-lg border overflow-hidden">
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
                                    icon={getUserLocationIcon()}
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
                                    icon={getMarkerIcon(poi.type)}
                                    eventHandlers={{
                                        click: () => setSelectedPOI(poi),
                                    }}
                                >
                                    <Popup>
                                        <div className="p-2 max-w-xs">
                                            <h3 className="font-semibold text-sm flex items-center gap-1">
                                                <span>{poi.type === 'harbor' ? '⚓' : poi.type === 'market' ? '🐟' : poi.type === 'station' ? '🛡️' : poi.type === 'zone' ? '🎣' : '🚢'}</span>
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
                                    <span>{getMarkerIcon(poi.type)}</span>
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
