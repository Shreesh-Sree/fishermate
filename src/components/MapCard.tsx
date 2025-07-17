"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Map as MapIcon, AlertTriangle } from "lucide-react";
import { APIProvider, Map, Marker } from '@vis.gl/react-google-maps';

const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

export function MapCard() {
    const position = { lat: 16.506, lng: 80.648 };

    if (!apiKey) {
      return (
        <Card className="shadow-lg">
           <CardHeader>
                <CardTitle className="font-headline flex items-center gap-2">
                    <MapIcon className="w-6 h-6 text-primary" />
                    Map
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[400px] w-full rounded-lg border bg-muted flex flex-col items-center justify-center text-center p-4">
                  <AlertTriangle className="w-12 h-12 mb-4 text-destructive" />
                  <p className="font-bold">Google Maps API Key Missing</p>
                  <p className="text-sm text-muted-foreground">Please add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to your .env.local file.</p>
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
                    Map
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[400px] w-full rounded-lg border overflow-hidden">
                  <APIProvider apiKey={apiKey}>
                      <Map
                        defaultCenter={position}
                        defaultZoom={6}
                        gestureHandling={'greedy'}
                        disableDefaultUI={true}
                        mapId="seaGuideMap"
                      >
                         <Marker position={position} />
                      </Map>
                  </APIProvider>
                </div>
            </CardContent>
        </Card>
    );
}
