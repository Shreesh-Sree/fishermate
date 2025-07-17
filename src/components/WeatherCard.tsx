
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Sun, Cloud, CloudRain, Wind, Droplets, Cloudy, Navigation, Loader2, AlertTriangle, Snowflake, CloudLightning, MapPin, Gauge, Eye, Compass, Thermometer, CloudSnow } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { fetchWeatherApi } from 'openmeteo';

type WeatherData = {
  current: {
    location: string;
    temp: number;
    apparentTemperature: number;
    condition: string;
    icon: LucideIcon;
    wind: number;
    windDirection: number;
    humidity: number;
    visibility: number;
    pressure: number;
    cloudCover: number;
    dewPoint: number;
    isDay: boolean;
  };
};

const weatherCodeMap: { [key: number]: { day: LucideIcon, night: LucideIcon, description: string } } = {
  0: { day: Sun, night: Sun, description: "Clear sky" },
  1: { day: Cloudy, night: Cloudy, description: "Mainly clear" },
  2: { day: Cloud, night: Cloud, description: "Partly cloudy" },
  3: { day: Cloud, night: Cloud, description: "Overcast" },
  45: { day: Wind, night: Wind, description: "Fog" },
  48: { day: Wind, night: Wind, description: "Depositing rime fog" },
  51: { day: CloudRain, night: CloudRain, description: "Light drizzle" },
  53: { day: CloudRain, night: CloudRain, description: "Moderate drizzle" },
  55: { day: CloudRain, night: CloudRain, description: "Dense drizzle" },
  61: { day: CloudRain, night: CloudRain, description: "Slight rain" },
  63: { day: CloudRain, night: CloudRain, description: "Moderate rain" },
  66: { day: CloudRain, night: CloudRain, description: "Light freezing rain" },
  67: { day: CloudRain, night: CloudRain, description: "Heavy freezing rain" },
  71: { day: Snowflake, night: Snowflake, description: "Slight snow fall" },
  73: { day: Snowflake, night: Snowflake, description: "Moderate snow fall" },
  75: { day: Snowflake, night: Snowflake, description: "Heavy snow fall" },
  77: { day: Snowflake, night: Snowflake, description: "Snow grains" },
  80: { day: CloudRain, night: CloudRain, description: "Slight rain showers" },
  81: { day: CloudRain, night: CloudRain, description: "Moderate rain showers" },
  82: { day: CloudRain, night: CloudRain, description: "Violent rain showers" },
  85: { day: Snowflake, night: Snowflake, description: "Slight snow showers" },
  86: { day: Snowflake, night: Snowflake, description: "Heavy snow showers" },
  95: { day: CloudLightning, night: CloudLightning, description: "Thunderstorm" },
  96: { day: CloudLightning, night: CloudLightning, description: "Thunderstorm with slight hail" },
  99: { day: CloudLightning, night: CloudLightning, description: "Thunderstorm with heavy hail" },
};

const getDayOfWeek = (date: Date, locale: string) => {
  return date.toLocaleDateString(locale, { weekday: 'short' });
};

const getWindDirection = (degrees: number): string => {
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const index = Math.round(degrees / 22.5) % 16;
  return directions[index];
};

const formatTime = (timestamp: number): string => {
  return new Date(timestamp * 1000).toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit', 
    hour12: false 
  });
};


export function WeatherCard() {
  const { locale, t } = useLanguage();
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        });
      },
      () => {
        setError("Unable to retrieve your location. Please enable location services.");
        setLoading(false);
      }
    );
  }, []);

  useEffect(() => {
    async function fetchWeather(isInitialLoad = false) {
      if (!coords) return;

      if (isInitialLoad) setLoading(true);
      setError(null);

      const params = {
        "latitude": coords.lat,
        "longitude": coords.lon,
        "current": [
          "temperature_2m", 
          "relative_humidity_2m", 
          "apparent_temperature", 
          "weather_code", 
          "wind_speed_10m", 
          "wind_direction_10m",
          "pressure_msl",
          "visibility",
          "cloud_cover",
          "dew_point_2m",
          "is_day"
        ],
        "timezone": "auto",
      };
      const url = "https://api.open-meteo.com/v1/forecast";
      
      try {
        const responses = await fetchWeatherApi(url, params);
        const response = responses[0];
        
        const utcOffsetSeconds = response.utcOffsetSeconds();
        const current = response.current()!;

        const isDay = current.variables(10)!.value() === 1;
        const weatherCode = current.variables(3)!.value();
        const weatherInfo = weatherCodeMap[Math.round(weatherCode)] || weatherCodeMap[0];
        
        // Find city name from coordinates
        const geoRes = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${coords.lat}&longitude=${coords.lon}&localityLanguage=en`);
        const geoData = await geoRes.json();
        const locationName = `${geoData.city}, ${geoData.countryCode}`;

        setWeatherData({
          current: {
            location: locationName,
            temp: Math.round(current.variables(0)!.value()),
            apparentTemperature: Math.round(current.variables(2)!.value()),
            condition: weatherInfo.description,
            icon: isDay ? weatherInfo.day : weatherInfo.night,
            wind: Math.round(current.variables(4)!.value()),
            windDirection: Math.round(current.variables(5)!.value()),
            humidity: Math.round(current.variables(1)!.value()),
            pressure: Math.round(current.variables(6)!.value()),
            visibility: Math.round(current.variables(7)!.value() / 1000), // Convert to km
            cloudCover: Math.round(current.variables(8)!.value()),
            dewPoint: Math.round(current.variables(9)!.value()),
            isDay,
          },
        });

      } catch (err) {
        if (err instanceof Error) {
            setError(err.message);
        } else {
            setError("An unknown error occurred.");
        }
      } finally {
        if (isInitialLoad) setLoading(false);
      }
    }
    
    if (coords) {
      fetchWeather(true); // Initial fetch
      const intervalId = setInterval(() => fetchWeather(false), 300000); // Refresh every 5 minutes

      return () => clearInterval(intervalId); // Cleanup on component unmount
    }
  }, [coords, locale]);

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
    
    const { current } = weatherData;

    return (
      <>
        <div className="text-center">
          <p className="text-muted-foreground flex items-center justify-center gap-1"><MapPin size={14}/> {current.location}</p>
          <div className="flex items-center justify-center gap-4 my-4">
            <current.icon className="w-20 h-20 text-accent" />
            <div>
              <p className="text-6xl font-bold">{current.temp}°C</p>
              <p className="text-muted-foreground">{current.condition}</p>
            </div>
          </div>
        </div>
        
        <Separator className="my-4" />
        
        {/* Primary Weather Details */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center gap-2 text-sm">
            <Thermometer className="w-4 h-4 text-accent" />
            <div>
              <p className="text-muted-foreground text-xs">Feels like</p>
              <p className="font-semibold">{current.apparentTemperature}°C</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Wind className="w-4 h-4 text-accent" />
            <div>
              <p className="text-muted-foreground text-xs">Wind</p>
              <p className="font-semibold">{current.wind} km/h {getWindDirection(current.windDirection)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Droplets className="w-4 h-4 text-accent" />
            <div>
              <p className="text-muted-foreground text-xs">Humidity</p>
              <p className="font-semibold">{current.humidity}%</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Gauge className="w-4 h-4 text-accent" />
            <div>
              <p className="text-muted-foreground text-xs">Pressure</p>
              <p className="font-semibold">{current.pressure} hPa</p>
            </div>
          </div>
        </div>

        <Separator className="my-4" />

        {/* Additional Weather Details */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center gap-2 text-sm">
            <Eye className="w-4 h-4 text-accent" />
            <div>
              <p className="text-muted-foreground text-xs">Visibility</p>
              <p className="font-semibold">{current.visibility} km</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Cloud className="w-4 h-4 text-accent" />
            <div>
              <p className="text-muted-foreground text-xs">Cloud Cover</p>
              <p className="font-semibold">{current.cloudCover}%</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <CloudSnow className="w-4 h-4 text-accent" />
            <div>
              <p className="text-muted-foreground text-xs">Dew Point</p>
              <p className="font-semibold">{current.dewPoint}°C</p>
            </div>
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
          {t('weather_title')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {renderContent()}
      </CardContent>
    </Card>
  );
}
