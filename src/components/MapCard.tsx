import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Map } from "lucide-react";
import Image from 'next/image';

export function MapCard() {
  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline flex items-center gap-2">
          <Map className="w-6 h-6 text-primary" />
          Map
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative w-full h-96 rounded-lg overflow-hidden border">
           <Image 
             src="https://placehold.co/800x600.png" 
             alt="Map placeholder" 
             layout="fill"
             objectFit="cover"
             data-ai-hint="world map"
            />
        </div>
      </CardContent>
    </Card>
  );
}
