
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Sun, Cloud, CloudRain, Wind, Droplets, Cloudy, Navigation, Loader2, AlertTriangle, Snowflake, CloudLightning, MapPin, Gauge } from "lucide-react";
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
    humidity: number;
    isDay: boolean;
  };
  forecast: {
    day: string;
    temp: number;
    icon: LucideIcon;
  }[];
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
        "current": ["temperature_2m", "relative_humidity_2m", "apparent_temperature", "weather_code", "wind_speed_10m", "is_day"],
        "daily": ["weather_code", "temperature_2m_max"],
        "timezone": "auto",
      };
      const url = "https://api.open-meteo.com/v1/forecast";
      
      try {
        const responses = await fetchWeatherApi(url, params);
        const response = responses[0];
        
        const utcOffsetSeconds = response.utcOffsetSeconds();
        const current = response.current()!;
        const daily = response.daily()!;

        const isDay = current.variables(5)!.value() === 1;
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
            humidity: Math.round(current.variables(1)!.value()),
            isDay,
          },
          forecast: [...Array(5)].map((_, i) => {
            const date = new Date((Number(daily.time(i)) + utcOffsetSeconds) * 1000);
            const dailyCode = daily.variables(0)!.value(i);
            const dailyWeatherInfo = weatherCodeMap[Math.round(dailyCode)] || weatherCodeMap[0];
            return {
              day: getDayOfWeek(date, locale),
              temp: Math.round(daily.variables(1)!.value(i)),
              icon: dailyWeatherInfo.day, // Always show day icon for forecast
            };
          }),
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
    
    const { current, forecast } = weatherData;

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
          <div className="flex justify-around text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Wind className="w-4 h-4" />
              <span>{current.wind} km/h</span>
            </div>
             <div className="flex items-center gap-1">
              <Gauge className="w-4 h-4" />
              <span>Feels like {current.apparentTemperature}°C</span>
            </div>
            <div className="flex items-center gap-1">
              <Droplets className="w-4 h-4" />
              <span>{current.humidity}%</span>
            </div>
          </div>
        </div>
        <Separator className="my-6" />
        <div>
          <h3 className="text-center font-bold mb-4">{t('forecast_title')}</h3>
          <div className="flex justify-between">
            {forecast.map((day, index) => (
              <div key={`${day.day}-${index}`} className="flex flex-col items-center gap-2 text-sm">
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
          {t('weather_title')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {renderContent()}
      </CardContent>
    </Card>
  );
}
