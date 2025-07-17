"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Sun, Cloud, CloudRain, Wind, Droplets, Cloudy, Navigation, Loader2, AlertTriangle, Snowflake, CloudLightning } from "lucide-react";
import type { LucideIcon } from "lucide-react";

type WeatherData = {
  current: {
    location: string;
    temp: number;
    condition: string;
    icon: LucideIcon;
    wind: number;
    humidity: number;
  };
  forecast: {
    day: string;
    temp: number;
    icon: LucideIcon;
  }[];
};

const weatherIconMap: { [key: string]: LucideIcon } = {
  "01d": Sun, "01n": Sun,
  "02d": Cloudy, "02n": Cloudy,
  "03d": Cloud, "03n": Cloud,
  "04d": Cloud, "04n": Cloud,
  "09d": CloudRain, "09n": CloudRain,
  "10d": CloudRain, "10n": CloudRain,
  "11d": CloudLightning, "11n": CloudLightning,
  "13d": Snowflake, "13n": Snowflake,
  "50d": Wind, "50n": Wind,
};

const getDayOfWeek = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { weekday: 'short' });
};

const apiKey = process.env.NEXT_PUBLIC_OPENWEATHERMAP_API_KEY;

export function WeatherCard() {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchWeather() {
      if (!apiKey) {
        setError("OpenWeatherMap API key is missing.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      
      const lat = 9.9312; // Kochi latitude
      const lon = 76.2673; // Kochi longitude

      try {
        // Fetch current weather
        const currentRes = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`);
        if (!currentRes.ok) throw new Error('Failed to fetch current weather');
        const current = await currentRes.json();

        // Fetch 5-day forecast
        const forecastRes = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`);
        if (!forecastRes.ok) throw new Error('Failed to fetch forecast');
        const forecast = await forecastRes.json();

        // Process forecast data to get one entry per day
        const dailyForecasts = forecast.list
          .filter((item: any, index: number) => index % 8 === 0) // Data is every 3 hours, so 8 points per day
          .slice(0, 5)
          .map((item: any) => ({
            day: getDayOfWeek(item.dt_txt),
            temp: Math.round(item.main.temp),
            icon: weatherIconMap[item.weather[0].icon] || Sun,
          }));

        setWeatherData({
          current: {
            location: `${current.name}, ${current.sys.country}`,
            temp: Math.round(current.main.temp),
            condition: current.weather[0].main,
            icon: weatherIconMap[current.weather[0].icon] || Sun,
            wind: Math.round(current.wind.speed * 3.6), // m/s to km/h
            humidity: current.main.humidity,
          },
          forecast: dailyForecasts,
        });

      } catch (err) {
        if (err instanceof Error) {
            setError(err.message);
        } else {
            setError("An unknown error occurred.");
        }
      } finally {
        setLoading(false);
      }
    }

    fetchWeather();
  }, []);

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      );
    }

    if (error || !weatherData) {
      return (
         <div className="flex flex-col items-center justify-center h-64 text-center text-muted-foreground">
          <AlertTriangle className="w-12 h-12 mb-4 text-destructive" />
          <p className="font-bold">Error fetching weather</p>
          <p className="text-sm">{error || "Could not load weather data."}</p>
        </div>
      );
    }
    
    const { current, forecast } = weatherData;

    return (
      <>
        <div className="text-center">
          <p className="text-muted-foreground">{current.location}</p>
          <div className="flex items-center justify-center gap-4 my-4">
            <current.icon className="w-20 h-20 text-accent" />
            <div>
              <p className="text-6xl font-bold">{current.temp}°C</p>
              <p className="text-muted-foreground">{current.condition}</p>
            </div>
          </div>
          <div className="flex justify-around text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Wind className="w-4 h-4" />
              <span>{current.wind} km/h</span>
            </div>
            <div className="flex items-center gap-1">
              <Droplets className="w-4 h-4" />
              <span>{current.humidity}%</span>
            </div>
          </div>
        </div>
        <Separator className="my-6" />
        <div>
          <h3 className="text-center font-bold mb-4">5-Day Forecast</h3>
          <div className="flex justify-between">
            {forecast.map((day) => (
              <div key={day.day} className="flex flex-col items-center gap-2 text-sm">
                <p className="font-medium text-muted-foreground">{day.day}</p>
                <day.icon className="w-8 h-8 text-primary" />
                <p className="font-bold">{day.temp}°C</p>
              </div>
            ))}
          </div>
        </div>
      </>
    )
  }

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline flex items-center gap-2">
          <Navigation className="w-6 h-6 text-primary" />
          Real-time Weather
        </CardTitle>
      </CardHeader>
      <CardContent>
        {renderContent()}
      </CardContent>
    </Card>
  );
}