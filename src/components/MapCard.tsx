"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Map } from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default icon issue with React-Leaflet
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;  
L.Icon.Default.mergeOptions({
    iconUrl: markerIcon.src,
    iconRetinaUrl: markerIcon2x.src,
    shadowUrl: markerShadow.src,
});


export function MapCard() {
    const position: [number, number] = [16.506, 80.648];

    return (
        <Card className="shadow-lg">
            <CardHeader>
                <CardTitle className="font-headline flex items-center gap-2">
                    <Map className="w-6 h-6 text-primary" />
                    Map
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[400px] w-full rounded-lg border">
                    <MapContainer center={position} zoom={6} scrollWheelZoom={false} style={{ height: "100%", width: "100%" }}>
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <Marker position={position}>
                            <Popup>
                                Bay of Bengal.
                            </Popup>
                        </Marker>
                    </MapContainer>
                </div>
            </CardContent>
        </Card>
    );
}