'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Fish, Anchor, Shield, AlertTriangle, Navigation, Star, Loader2 } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import { useTheme } from 'next-themes';

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
  const { theme } = useTheme();
  const mapRef = useRef<HTMLDivElement>(null);
  const googleMapRef = useRef<google.maps.Map | null>(null);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [fishingPOIs, setFishingPOIs] = useState<FishingPOI[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isGoogleMapsLoaded, setIsGoogleMapsLoaded] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  // Load Google Maps API with better error handling and async loading
  const loadGoogleMaps = () => {
    if (window.google && window.google.maps) {
      setIsGoogleMapsLoaded(true);
      return;
    }

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      setError('Google Maps API key is not configured. Please add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to your environment variables.');
      setIsLoading(false);
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,geometry&loading=async&callback=initMap`;
    script.async = true;
    script.defer = true;
    
    script.onerror = () => {
      if (retryCount < 3) {
        setRetryCount(prev => prev + 1);
        setTimeout(() => loadGoogleMaps(), 2000);
      } else {
        setError('Failed to load Google Maps. Please check your internet connection and API key.');
        setIsLoading(false);
      }
    };
    
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
  }, [isGoogleMapsLoaded, userLocation, theme]);

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

    // Dark mode map styles
    const darkMapStyles = [
      { elementType: "geometry", stylers: [{ color: "#212121" }] },
      { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
      { elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
      { elementType: "labels.text.stroke", stylers: [{ color: "#212121" }] },
      { featureType: "administrative", elementType: "geometry", stylers: [{ color: "#757575" }] },
      { featureType: "administrative.country", elementType: "labels.text.fill", stylers: [{ color: "#9e9e9e" }] },
      { featureType: "administrative.land_parcel", stylers: [{ visibility: "off" }] },
      { featureType: "administrative.locality", elementType: "labels.text.fill", stylers: [{ color: "#bdbdbd" }] },
      { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
      { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#181818" }] },
      { featureType: "poi.park", elementType: "labels.text.fill", stylers: [{ color: "#616161" }] },
      { featureType: "poi.park", elementType: "labels.text.stroke", stylers: [{ color: "#1b1b1b" }] },
      { featureType: "road", elementType: "geometry.fill", stylers: [{ color: "#2c2c2c" }] },
      { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#8a8a8a" }] },
      { featureType: "road.arterial", elementType: "geometry", stylers: [{ color: "#373737" }] },
      { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#3c3c3c" }] },
      { featureType: "road.highway.controlled_access", elementType: "geometry", stylers: [{ color: "#4e4e4e" }] },
      { featureType: "road.local", elementType: "labels.text.fill", stylers: [{ color: "#616161" }] },
      { featureType: "transit", elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
      { featureType: "water", elementType: "geometry", stylers: [{ color: "#000000" }] },
      { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#3d3d3d" }] }
    ];

    // Light mode map styles  
    const lightMapStyles = [
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

    // Initialize Google Map with theme-aware styles
    const map = new google.maps.Map(mapRef.current, {
      center: userLocation,
      zoom: 13,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      styles: theme === 'dark' ? darkMapStyles : lightMapStyles,
      disableDefaultUI: false,
      zoomControl: true,
      streetViewControl: false,
      fullscreenControl: true,
      mapTypeControl: false,
    });

    googleMapRef.current = map;

    // Add user location marker with modern AdvancedMarkerElement
    if (google.maps.marker && google.maps.marker.AdvancedMarkerElement) {
      // Use modern AdvancedMarkerElement
      const userMarkerElement = document.createElement('div');
      userMarkerElement.innerHTML = `
        <div style="
          width: 48px; 
          height: 48px; 
          background: #1D4ED8; 
          border: 3px solid #FFFFFF; 
          border-radius: 50%; 
          display: flex; 
          align-items: center; 
          justify-content: center;
          box-shadow: 0 4px 8px rgba(0,0,0,0.3);
        ">
          <div style="
            width: 16px; 
            height: 16px; 
            background: #FFFFFF; 
            border-radius: 50%;
          "></div>
        </div>
      `;

      const userMarker = new google.maps.marker.AdvancedMarkerElement({
        position: userLocation,
        map: map,
        title: 'Your Location',
        content: userMarkerElement,
      });
    } else {
      // Fallback to legacy Marker for backward compatibility
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
    }

    // Search for nearby fishing-related places using modern Places API
    if (google.maps.places && google.maps.places.Place) {
      searchNearbyFishingPlacesModern(userLocation, map);
    } else {
      // Fallback to legacy PlacesService
      const service = new google.maps.places.PlacesService(map);
      searchNearbyFishingPlaces(service, userLocation, map);
    }
  };

  // Modern Places API search function
  const searchNearbyFishingPlacesModern = async (location: UserLocation, map: google.maps.Map) => {
    const searches = [
      { keywords: ['fishing', 'marina', 'harbor'], type: 'marina' },
      { keywords: ['fishing', 'pier', 'jetty'], type: 'fishing_spot' },
      { keywords: ['bait', 'tackle', 'fishing', 'shop'], type: 'bait_shop' },
      { keywords: ['coast guard', 'marine safety'], type: 'safety_station' },
      { keywords: ['seafood', 'restaurant'], type: 'restaurant' }
    ];

    const allPOIs: FishingPOI[] = [];

    try {
      for (const [index, search] of searches.entries()) {
        const request = {
          textQuery: search.keywords.join(' '),
          fields: ['displayName', 'location', 'rating', 'priceLevel', 'photos'],
          locationBias: {
            radius: 25000,
            center: location
          },
          maxResultCount: 3
        };

        // Note: This is a simplified implementation as the new Places API requires different setup
        // For now, we'll fall back to the legacy implementation
        const service = new google.maps.places.PlacesService(map);
        const legacyRequest = {
          location: new google.maps.LatLng(location.lat, location.lng),
          radius: 25000,
          keyword: search.keywords.join(' '),
        };

        service.nearbySearch(legacyRequest, (results, status) => {
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
                addModernMarker(poi, map);
              }
            });

            if (index === searches.length - 1) {
              setFishingPOIs(allPOIs.sort((a, b) => a.distance - b.distance));
            }
          }
        });
      }
    } catch (error) {
      console.error('Error with modern Places API:', error);
      // Fallback to legacy implementation
      const service = new google.maps.places.PlacesService(map);
      searchNearbyFishingPlaces(service, location, map);
    }
  };

  // Add marker using modern AdvancedMarkerElement or fallback to legacy
  const addModernMarker = (poi: FishingPOI, map: google.maps.Map) => {
    if (google.maps.marker && google.maps.marker.AdvancedMarkerElement) {
      const markerElement = document.createElement('div');
      markerElement.innerHTML = getMarkerHTML(poi.type);

      const marker = new google.maps.marker.AdvancedMarkerElement({
        position: { lat: poi.lat, lng: poi.lng },
        map: map,
        title: poi.name,
        content: markerElement,
      });

      // Add click listener for info window
      markerElement.addEventListener('click', () => {
        const infoWindow = new google.maps.InfoWindow({
          content: createInfoWindowContent(poi)
        });
        infoWindow.open(map, marker);
      });
    } else {
      // Fallback to legacy marker
      const marker = new google.maps.Marker({
        position: { lat: poi.lat, lng: poi.lng },
        map: map,
        title: poi.name,
        icon: getMarkerIcon(poi.type)
      });

      const infoWindow = new google.maps.InfoWindow({
        content: createInfoWindowContent(poi)
      });

      marker.addListener('click', () => {
        infoWindow.open(map, marker);
      });
    }
  };

  // Get HTML for modern markers
  const getMarkerHTML = (type: string): string => {
    const colors = {
      marina: '#3B82F6',
      fishing_spot: '#10B981',
      bait_shop: '#F59E0B',
      safety_station: '#EF4444',
      restaurant: '#8B5CF6'
    };

    const icons = {
      marina: '⚓',
      fishing_spot: '🐟',
      bait_shop: '🎣',
      safety_station: '🛡️',
      restaurant: '🍽️'
    };

    return `
      <div style="
        width: 40px;
        height: 40px;
        background: ${colors[type as keyof typeof colors] || '#6B7280'};
        border: 2px solid #FFFFFF;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 16px;
        box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        cursor: pointer;
      ">${icons[type as keyof typeof icons] || '📍'}</div>
    `;
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

              // Add marker to map using modern API when available
              addModernMarker(poi, map);
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
        return 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-400';
      case 'marina':
        return 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 dark:border-purple-400';
      case 'bait_shop':
        return 'border-green-500 bg-green-50 dark:bg-green-900/20 dark:border-green-400';
      case 'safety_station':
        return 'border-red-500 bg-red-50 dark:bg-red-900/20 dark:border-red-400';
      case 'restaurant':
        return 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-400';
      default:
        return 'border-gray-500 bg-gray-50 dark:bg-gray-900/20 dark:border-gray-400';
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
        <div className="flex items-center justify-center h-full glass-card rounded-2xl">
          <div className="text-center p-8">
            <Loader2 className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 dark:border-blue-400 mx-auto mb-6" />
            <p className="text-xl font-semibold text-foreground mb-2">Loading Interactive Map...</p>
            <p className="text-sm text-muted-foreground">Fetching your location and nearby fishing spots</p>
            {retryCount > 0 && (
              <p className="text-xs text-muted-foreground mt-2">Retry attempt {retryCount}/3</p>
            )}
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex items-center justify-center h-full glass-card rounded-2xl">
          <div className="text-center p-8 max-w-md">
            <AlertTriangle className="w-16 h-16 mb-6 mx-auto text-red-600 dark:text-red-400" />
            <h3 className="text-xl font-bold text-foreground mb-4">Map Error</h3>
            <p className="text-sm text-muted-foreground mb-6">{error}</p>
            <div className="space-y-3">
              <button 
                onClick={() => {
                  setError(null);
                  setIsLoading(true);
                  setRetryCount(0);
                  loadGoogleMaps();
                }}
                className="btn-primary w-full"
              >
                Retry Loading Map
              </button>
              {error.includes('API key') && (
                <div className="glass-card-sm p-4 text-left">
                  <h4 className="font-semibold text-foreground mb-2">Setup Instructions:</h4>
                  <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside">
                    <li>Get a Google Maps API key from Google Cloud Console</li>
                    <li>Enable Maps JavaScript API and Places API</li>
                    <li>Add the key to your .env.local file as NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</li>
                  </ol>
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="flex flex-col h-full">
        {/* Map container */}
        <div ref={mapRef} className="flex-grow rounded-t-2xl min-h-[400px]" />
        
        {/* POI list */}
        <div className="p-6 glass-card-sm rounded-b-2xl h-72 overflow-y-auto">
          <h4 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
            <Navigation className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            Nearby Fishing Spots
          </h4>
          {fishingPOIs.length > 0 ? (
            <ul className="space-y-3">
              {fishingPOIs.slice(0, 10).map((poi) => (
                <li 
                  key={poi.id} 
                  className={`glass-card-sm p-4 border-l-4 transition-all duration-300 hover:shadow-lg cursor-pointer ${getColorForPOI(poi.type)}`}
                  onClick={() => getDirections(poi)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full bg-white dark:bg-gray-800 shadow-md">
                        {getIconForPOI(poi.type)}
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{poi.name}</p>
                        <p className="text-xs text-muted-foreground truncate max-w-xs">{poi.description}</p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 ml-4">
                      <p className="text-sm font-bold text-foreground">{poi.distance.toFixed(1)} km</p>
                      {poi.rating && (
                        <div className="flex items-center justify-end text-xs text-amber-600 dark:text-amber-400 mt-1">
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
              <Fish className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-foreground font-semibold">No Fishing Spots Found Nearby</p>
              <p className="text-sm text-muted-foreground">Try zooming out or exploring a different area.</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <Card className="modern-card-tall overflow-hidden">
      <CardHeader className="glass-card p-4 border-b border-border">
        <CardTitle className="flex items-center gap-3 text-foreground">
          <div className="w-10 h-10 glass-card-sm flex items-center justify-center rounded-xl">
            <MapPin className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          Interactive Fishing Map
          {userLocation && (
            <span className="text-xs glass-card-sm px-2 py-1 rounded-full text-green-600 dark:text-green-400">
              Live Location
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 h-full">
        {renderContent()}
      </CardContent>
    </Card>
  );
};

export default GoogleMapCard;
