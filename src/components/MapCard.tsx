"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Map, Loader2 } from "lucide-react";
import { GoogleMap, useJsApiLoader } from '@react-google-maps/api';
import { useMemo } from "react";

const containerStyle = {
  width: '100%',
  height: '400px',
  borderRadius: '0.5rem',
};

export function MapCard() {
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ""
  });

  const center = useMemo(() => ({
    lat: 16.506, // Centered on India's east coast
    lng: 80.648
  }), []);

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline flex items-center gap-2">
          <Map className="w-6 h-6 text-primary" />
          Map
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative w-full h-[400px] rounded-lg overflow-hidden border">
           {loadError && <div>Error loading maps. Please check your API key.</div>}
           {!isLoaded && !loadError && (
             <div className="flex items-center justify-center h-full">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
             </div>
           )}
           {isLoaded && (
            <GoogleMap
              mapContainerStyle={containerStyle}
              center={center}
              zoom={6}
            >
              {/* Child components, like markers, info windows, etc. */}
            </GoogleMap>
           )}
        </div>
      </CardContent>
    </Card>
  );
}
