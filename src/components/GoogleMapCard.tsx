'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Fish, Anchor, Shield, AlertTriangle, Navigation, Star } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';

interface FishingPOI {
  id: number;
  name: string;
  type: 'fishing_spot' | 'marina' | 'bait_shop' | 'safety_station' | 'restaurant';
  lat: number;
  lng: number;
  distance: number;
  description: string;
  rating?: number;
  place_id?: string;
  price_level?: number;
  photos?: string[];
}

interface UserLocation {
  lat: number;
  lng: number;
}

const GoogleMapCard = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const googleMapRef = useRef<google.maps.Map | null>(null);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [fishingPOIs, setFishingPOIs] = useState<FishingPOI[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isGoogleMapsLoaded, setIsGoogleMapsLoaded] = useState(false);

  // Load Google Maps API
  const loadGoogleMaps = () => {
    if (window.google && window.google.maps) {
      setIsGoogleMapsLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places,geometry&callback=initMap`;
    script.async = true;
    script.defer = true;
    
    // @ts-ignore
    window.initMap = () => {
      setIsGoogleMapsLoaded(true);
    };
    
    document.head.appendChild(script);
  };

  useEffect(() => {
    loadGoogleMaps();
    getCurrentLocation();
  }, []);

  useEffect(() => {
    if (isGoogleMapsLoaded && userLocation && mapRef.current) {
      initializeMap();
    }
  }, [isGoogleMapsLoaded, userLocation]);

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setUserLocation(location);
          setIsLoading(false);
        },
        (error) => {
          console.error('Error getting location:', error);
          // Fallback to Chennai, India (coastal city)
          const defaultLocation = { lat: 13.0827, lng: 80.2707 };
          setUserLocation(defaultLocation);
          setError('Using default location (Chennai). Please enable location access for better results.');
          setIsLoading(false);
        }
      );
    } else {
      setError('Geolocation is not supported by this browser.');
      const defaultLocation = { lat: 13.0827, lng: 80.2707 };
      setUserLocation(defaultLocation);
      setIsLoading(false);
    }
  };

  const initializeMap = () => {
    if (!mapRef.current || !userLocation || !window.google) return;

    // Initialize Google Map
    const map = new google.maps.Map(mapRef.current, {
      center: userLocation,
      zoom: 13,
      mapTypeId: google.maps.MapTypeId.TERRAIN,
      styles: [
        {
          featureType: 'water',
          elementType: 'all',
          stylers: [{ color: '#3498db' }]
        },
        {
          featureType: 'landscape',
          elementType: 'all',
          stylers: [{ color: '#ecf0f1' }]
        }
      ]
    });

    googleMapRef.current = map;

    // Add user location marker
    new google.maps.Marker({
      position: userLocation,
      map: map,
      title: 'Your Location',
      icon: {
        url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="8" fill="#3b82f6" stroke="#ffffff" stroke-width="2"/>
            <circle cx="12" cy="12" r="3" fill="#ffffff"/>
          </svg>
        `),
        scaledSize: new google.maps.Size(24, 24),
      }
    });

    // Search for nearby fishing-related places using Places API
    const service = new google.maps.places.PlacesService(map);
    searchNearbyFishingPlaces(service, userLocation, map);
  };

  const searchNearbyFishingPlaces = (service: google.maps.places.PlacesService, location: UserLocation, map: google.maps.Map) => {
    const searches = [
      // Fishing spots and marinas
      { keyword: 'fishing marina harbor', type: 'marina' },
      { keyword: 'fishing spot pier jetty', type: 'fishing_spot' },
      { keyword: 'bait tackle fishing shop', type: 'bait_shop' },
      { keyword: 'coast guard marine safety', type: 'safety_station' },
      { keyword: 'seafood restaurant fishing', type: 'restaurant' }
    ];

    const allPOIs: FishingPOI[] = [];
    let searchesCompleted = 0;

    searches.forEach((search, index) => {
      const request = {
        location: new google.maps.LatLng(location.lat, location.lng),
        radius: 25000, // 25km radius
        keyword: search.keyword,
      };

      service.nearbySearch(request, (results, status) => {
        searchesCompleted++;
        
        if (status === google.maps.places.PlacesServiceStatus.OK && results) {
          results.slice(0, 3).forEach((place, placeIndex) => {
            if (place.geometry && place.geometry.location) {
              const poi: FishingPOI = {
                id: index * 10 + placeIndex,
                name: place.name || 'Unknown Location',
                type: search.type as any,
                lat: place.geometry.location.lat(),
                lng: place.geometry.location.lng(),
                distance: calculateDistance(location, {
                  lat: place.geometry.location.lat(),
                  lng: place.geometry.location.lng()
                }),
                description: place.vicinity || 'No description available',
                rating: place.rating,
                place_id: place.place_id,
                price_level: place.price_level,
                photos: place.photos?.slice(0, 1).map(photo => 
                  photo.getUrl({ maxWidth: 300, maxHeight: 200 })
                )
              };

              allPOIs.push(poi);

              // Add marker to map
              const marker = new google.maps.Marker({
                position: { lat: poi.lat, lng: poi.lng },
                map: map,
                title: poi.name,
                icon: getMarkerIcon(poi.type)
              });

              // Add info window
              const infoWindow = new google.maps.InfoWindow({
                content: createInfoWindowContent(poi)
              });

              marker.addListener('click', () => {
                infoWindow.open(map, marker);
              });
            }
          });
        }

        // Update state when all searches are complete
        if (searchesCompleted === searches.length) {
          allPOIs.sort((a, b) => a.distance - b.distance);
          setFishingPOIs(allPOIs);
        }
      });
    });
  };

  const getMarkerIcon = (type: string) => {
    const colors = {
      fishing_spot: '#3b82f6',
      marina: '#8b5cf6', 
      bait_shop: '#10b981',
      safety_station: '#ef4444',
      restaurant: '#f59e0b'
    };

    const icons = {
      fishing_spot: '🎣',
      marina: '⚓',
      bait_shop: '🏪',
      safety_station: '🛡️',
      restaurant: '🍽️'
    };

    return {
      url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
        <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
          <circle cx="16" cy="16" r="12" fill="${colors[type as keyof typeof colors] || '#6b7280'}" stroke="#ffffff" stroke-width="2"/>
          <text x="16" y="20" text-anchor="middle" font-size="12" fill="white">${icons[type as keyof typeof icons] || '📍'}</text>
        </svg>
      `)}`,
      scaledSize: new google.maps.Size(32, 32),
    };
  };

  const createInfoWindowContent = (poi: FishingPOI) => {
    return `
      <div style="max-width: 250px;">
        <h3 style="margin: 0 0 8px 0; font-weight: bold;">${poi.name}</h3>
        <p style="margin: 0 0 8px 0; color: #666; font-size: 14px;">${poi.description}</p>
        <div style="display: flex; justify-content: space-between; align-items: center; font-size: 12px; color: #888;">
          <span>📍 ${poi.distance.toFixed(1)} km away</span>
          ${poi.rating ? `<span>⭐ ${poi.rating}/5</span>` : ''}
        </div>
        ${poi.photos && poi.photos.length > 0 ? `
          <img src="${poi.photos[0]}" style="width: 100%; height: 120px; object-fit: cover; margin-top: 8px; border-radius: 4px;" alt="${poi.name}">
        ` : ''}
      </div>
    `;
  };

  const calculateDistance = (point1: UserLocation, point2: UserLocation): number => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (point2.lat - point1.lat) * Math.PI / 180;
    const dLng = (point2.lng - point1.lng) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(point1.lat * Math.PI / 180) * Math.cos(point2.lat * Math.PI / 180) * 
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const getIconForPOI = (type: string) => {
    switch (type) {
      case 'fishing_spot':
        return <Fish className="w-5 h-5 text-blue-600" />;
      case 'marina':
        return <Anchor className="w-5 h-5 text-purple-600" />;
      case 'bait_shop':
        return <MapPin className="w-5 h-5 text-green-600" />;
      case 'safety_station':
        return <Shield className="w-5 h-5 text-red-600" />;
      case 'restaurant':
        return <Star className="w-5 h-5 text-yellow-600" />;
      default:
        return <MapPin className="w-5 h-5 text-gray-600" />;
    }
  };

  const getColorForPOI = (type: string) => {
    switch (type) {
      case 'fishing_spot':
        return 'border-blue-500 bg-blue-50';
      case 'marina':
        return 'border-purple-500 bg-purple-50';
      case 'bait_shop':
        return 'border-green-500 bg-green-50';
      case 'safety_station':
        return 'border-red-500 bg-red-50';
      case 'restaurant':
        return 'border-yellow-500 bg-yellow-50';
      default:
        return 'border-gray-500 bg-gray-50';
    }
  };

  const getDirections = (poi: FishingPOI) => {
    if (userLocation) {
      const url = `https://www.google.com/maps/dir/${userLocation.lat},${userLocation.lng}/${poi.lat},${poi.lng}`;
      window.open(url, '_blank');
    }
  };

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Fishing Map & Nearby Spots
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="w-full h-64 bg-gray-200 animate-pulse rounded-lg flex items-center justify-center">
            <div className="text-gray-500">Loading Google Maps and location data...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="modern-card-tall animate-fade-in hover-lift">
      <CardContent className="p-0 h-full">
        {/* Header with gradient */}
        <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white p-4 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold animate-shimmer">Interactive Map</h3>
              <p className="text-indigo-100 text-xs">Fishing spots near you</p>
            </div>
            <MapPin className="w-8 h-8 text-white animate-float" />
          </div>
          {error && (
            <div className="flex items-center gap-2 text-amber-200 text-sm mt-2 animate-slide-in-left">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-xs">{error}</span>
            </div>
          )}
        </div>

        <div className="p-4 space-y-4 flex-1">
          {/* Google Maps Container */}
          <div className="relative rounded-xl overflow-hidden border-2 border-gray-200 shadow-lg hover-glow">
            <div ref={mapRef} className="w-full h-48 lg:h-56" />
            
            {/* Map overlay with location info */}
            <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm rounded-lg p-2 shadow-md">
              <div className="flex items-center gap-2 text-xs">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="font-medium">
                  {userLocation ? 'Location tracked' : 'Finding location...'}
                </span>
              </div>
            </div>

            {/* POI count overlay */}
            <div className="absolute top-3 right-3 bg-indigo-600 text-white rounded-lg p-2 shadow-md animate-glow">
              <div className="text-xs font-bold">{fishingPOIs.length} spots</div>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-2 rounded-lg border border-blue-100 hover-glow transition-all">
              <div className="text-sm font-bold text-blue-600">
                {fishingPOIs.filter(p => p.type === 'fishing_spot').length}
              </div>
              <div className="text-xs text-blue-700">Spots</div>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-indigo-50 p-2 rounded-lg border border-purple-100 hover-glow transition-all">
              <div className="text-sm font-bold text-purple-600">
                {fishingPOIs.filter(p => p.type === 'marina').length}
              </div>
              <div className="text-xs text-purple-700">Marinas</div>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-2 rounded-lg border border-green-100 hover-glow transition-all">
              <div className="text-sm font-bold text-green-600">
                {fishingPOIs.filter(p => p.type === 'bait_shop').length}
              </div>
              <div className="text-xs text-green-700">Shops</div>
            </div>
          </div>

          {/* Nearby Spots List */}
          {fishingPOIs.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 mb-2">
                <Fish className="w-4 h-4 text-indigo-600" />
                <span className="text-sm font-medium text-indigo-800">Nearby ({fishingPOIs.length})</span>
              </div>
              
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {fishingPOIs.slice(0, 3).map((poi, index) => (
                  <div 
                    key={poi.id} 
                    className={`p-2 rounded-lg border-l-4 hover-glow transition-all duration-300 ${getColorForPOI(poi.type)}`}
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          {getIconForPOI(poi.type)}
                          <h4 className="font-medium text-xs truncate">{poi.name}</h4>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-500">📍 {poi.distance.toFixed(1)} km</span>
                          {poi.rating && (
                            <span className="text-yellow-600">⭐ {poi.rating}</span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => getDirections(poi)}
                        className="ml-2 flex items-center gap-1 px-2 py-1 bg-indigo-600 text-white text-xs rounded-md hover:bg-indigo-700 transition-colors animate-glow"
                      >
                        <Navigation className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default GoogleMapCard;
