"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Map, Loader2, AlertTriangle } from "lucide-react";
import { GoogleMap, useJsApiLoader } from '@react-google-maps/api';
import { useMemo } from "react";

const containerStyle = {
  width: '100%',
  height: '400px',
  borderRadius: '0.5rem',
};

export function MapCard() {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: apiKey || ""
  });

  const center = useMemo(() => ({
    lat: 16.506, // Centered on India's east coast
    lng: 80.648
  }), []);

  const renderContent = () => {
    if (!apiKey) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
          <AlertTriangle className="w-12 h-12 mb-4 text-destructive" />
          <p className="font-bold">Google Maps API Key Missing</p>
          <p className="text-sm">Please add your key to the `.env` file.</p>
        </div>
      );
    }
    if (loadError) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
          <AlertTriangle className="w-12 h-12 mb-4 text-destructive" />
          <p className="font-bold">Map Loading Error</p>
          <p className="text-sm">Please check your API key and ensure the Maps JavaScript API is enabled in your Google Cloud Console.</p>
        </div>
      );
    }
    if (!isLoaded) {
      return (
        <div className="flex items-center justify-center h-full">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      );
    }
    return (
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={6}
      >
        {/* Child components, like markers, info windows, etc. */}
      </GoogleMap>
    );
  };

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
           {renderContent()}
        </div>
      </CardContent>
    </Card>
  );
}