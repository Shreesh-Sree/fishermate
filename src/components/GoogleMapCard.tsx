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

    // Modern map styles
    const mapStyles = [
      { elementType: "geometry", stylers: [{ color: "#f5f5f5" }] },
      { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
      { elementType: "labels.text.fill", stylers: [{ color: "#616161" }] },
      { elementType: "labels.text.stroke", stylers: [{ color: "#f5f5f5" }] },
      { featureType: "administrative.land_parcel", stylers: [{ visibility: "off" }] },
      { featureType: "administrative.locality", elementType: "labels.text.fill", stylers: [{ color: "#bdbdbd" }] },
      { featureType: "poi", elementType: "geometry", stylers: [{ color: "#eeeeee" }] },
      { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
      { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#e5e5e5" }] },
      { featureType: "poi.park", elementType: "labels.text.fill", stylers: [{ color: "#9e9e9e" }] },
      { featureType: "road", elementType: "geometry", stylers: [{ color: "#ffffff" }] },
      { featureType: "road.arterial", elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
      { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#dadada" }] },
      { featureType: "road.highway", elementType: "labels.text.fill", stylers: [{ color: "#616161" }] },
      { featureType: "road.local", elementType: "labels.text.fill", stylers: [{ color: "#9e9e9e" }] },
      { featureType: "transit.line", elementType: "geometry", stylers: [{ color: "#e5e5e5" }] },
      { featureType: "transit.station", elementType: "geometry", stylers: [{ color: "#eeeeee" }] },
      { featureType: "water", elementType: "geometry", stylers: [{ color: "#c9c9c9" }] },
      { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#9e9e9e" }] }
    ];

    // Initialize Google Map
    const map = new google.maps.Map(mapRef.current, {
      center: userLocation,
      zoom: 13,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      styles: mapStyles,
      disableDefaultUI: true,
      zoomControl: true,
    });

    googleMapRef.current = map;

    // Add user location marker with animation
    const userMarker = new google.maps.Marker({
      position: userLocation,
      map: map,
      title: 'Your Location',
      icon: {
        url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="24" cy="24" r="16" fill="#1D4ED8" stroke="#FFFFFF" stroke-width="3"/>
            <circle cx="24" cy="24" r="8" fill="#FFFFFF"/>
          </svg>
        `),
        scaledSize: new google.maps.Size(48, 48),
      },
      animation: google.maps.Animation.DROP,
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
      fishing_spot: '#3b82f6', // Blue
      marina: '#8b5cf6', // Purple
      bait_shop: '#10b981', // Green
      safety_station: '#ef4444', // Red
      restaurant: '#f59e0b' // Amber
    };

    const icons = {
      fishing_spot: 'M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5', // Simplified fish icon
      marina: 'M12 2L2 7v10l10 5 10-5V7L12 2zm0 2.5L19 8l-7 3.5L5 8l7-3.5zM4 16.5V9l7 3.5v7.5L4 16.5z', // Simplified anchor
      bait_shop: 'M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4H6zm5 14H8v-2h3v2zm0-4H8v-2h3v2zm0-4H8V8h3v2zm5 4h-3v-2h3v2zm0-4h-3v-2h3v2zm0-4h-3V8h3v2z', // Simplified shop
      safety_station: 'M12 2l-9 4.5V12c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V6.5L12 2z', // Shield
      restaurant: 'M12 2l.94 3.06L16 6l-2.94 1.94L12 11l-1.06-3.06L8 6l3.06-.94L12 2z' // Star
    };

    return {
      url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
        <svg width="40" height="40" viewBox="0 0 24 24" fill="${colors[type as keyof typeof colors] || '#6b7280'}" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill-opacity="0.8"/>
          <path d="${icons[type as keyof typeof icons] || ''}" fill="white"/>
        </svg>
      `)}`,
      scaledSize: new google.maps.Size(40, 40),
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

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-full bg-gray-50 rounded-2xl">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-lg font-semibold text-gray-800">Locating Your Position...</p>
            <p className="text-sm text-gray-500">Fetching nearby fishing data.</p>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex items-center justify-center h-full bg-red-50 rounded-2xl">
          <div className="text-center p-6">
            <AlertTriangle className="w-12 h-12 mb-4 mx-auto text-red-600" />
            <p className="font-bold text-red-800">Map Error</p>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      );
    }

    return (
      <div className="flex flex-col h-full">
        {/* Map container */}
        <div ref={mapRef} className="flex-grow rounded-t-2xl" />
        
        {/* POI list */}
        <div className="p-4 bg-white rounded-b-2xl h-72 overflow-y-auto">
          <h4 className="text-lg font-bold text-gray-900 mb-3">Nearby Points of Interest</h4>
          {fishingPOIs.length > 0 ? (
            <ul className="space-y-3">
              {fishingPOIs.slice(0, 10).map((poi) => (
                <li 
                  key={poi.id} 
                  className={`p-3 rounded-xl border-l-4 transition-all duration-300 hover:shadow-lg hover:bg-gray-50 ${getColorForPOI(poi.type)}`}
                  onClick={() => getDirections(poi)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full bg-white shadow-md">
                        {getIconForPOI(poi.type)}
                      </div>
                      <div>
                        <p className="font-semibold text-md text-gray-900">{poi.name}</p>
                        <p className="text-xs text-gray-600 truncate max-w-xs">{poi.description}</p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 ml-4">
                      <p className="text-md font-bold text-gray-800">{poi.distance.toFixed(1)} km</p>
                      {poi.rating && (
                        <div className="flex items-center justify-end text-xs text-amber-600 mt-1">
                          <Star className="w-3 h-3 mr-1 fill-current" />
                          <span className="font-semibold">{poi.rating.toFixed(1)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center py-8">
              <Fish className="w-12 h-12 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-600 font-semibold">No Fishing Spots Found Nearby</p>
              <p className="text-sm text-gray-400">Try zooming out or exploring a different area.</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <Card className="modern-card-tall animate-fade-in hover-lift overflow-hidden">
      <CardContent className="p-0 h-full">
        {renderContent()}
      </CardContent>
    </Card>
  );
};

export default GoogleMapCard;
