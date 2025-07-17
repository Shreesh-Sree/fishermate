import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Sun, Cloud, CloudRain, Wind, Droplets, Cloudy, Navigation } from "lucide-react";

const weatherData = {
  current: {
    location: "Kochi, Kerala",
    temp: 29,
    condition: "Partly Cloudy",
    icon: Cloudy,
    wind: 15,
    humidity: 78,
  },
  forecast: [
    { day: "Tue", temp: 30, icon: Sun },
    { day: "Wed", temp: 28, icon: CloudRain },
    { day: "Thu", temp: 29, icon: Cloudy },
    { day: "Fri", temp: 31, icon: Sun },
    { day: "Sat", temp: 28, icon: Cloud },
  ],
};

export function WeatherCard() {
  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline flex items-center gap-2">
          <Navigation className="w-6 h-6 text-primary" />
          Real-time Weather
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center">
          <p className="text-muted-foreground">{weatherData.current.location}</p>
          <div className="flex items-center justify-center gap-4 my-4">
            <weatherData.current.icon className="w-20 h-20 text-accent" />
            <div>
              <p className="text-6xl font-bold">{weatherData.current.temp}°C</p>
              <p className="text-muted-foreground">{weatherData.current.condition}</p>
            </div>
          </div>
          <div className="flex justify-around text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Wind className="w-4 h-4" />
              <span>{weatherData.current.wind} km/h</span>
            </div>
            <div className="flex items-center gap-1">
              <Droplets className="w-4 h-4" />
              <span>{weatherData.current.humidity}%</span>
            </div>
          </div>
        </div>
        <Separator className="my-6" />
        <div>
          <h3 className="text-center font-bold mb-4">5-Day Forecast</h3>
          <div className="flex justify-between">
            {weatherData.forecast.map((day) => (
              <div key={day.day} className="flex flex-col items-center gap-2 text-sm">
                <p className="font-medium text-muted-foreground">{day.day}</p>
                <day.icon className="w-8 h-8 text-primary" />
                <p className="font-bold">{day.temp}°C</p>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
