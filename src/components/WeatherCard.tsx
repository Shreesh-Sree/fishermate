'use client';

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sun, Cloud, CloudRain, Wind, Droplets, Cloudy, Loader2, AlertTriangle, Snowflake, CloudLightning, MapPin, Gauge, Eye, Compass, Thermometer, CloudSnow, AlertCircle, CheckCircle, Activity, Waves } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { fetchWeatherApi } from 'openmeteo';

// Air Quality interface for Google Air Quality API
interface AirQualityData {
  aqi: number;
  category: string;
  healthRecommendations: string;
  dominantPollutant: string;
}

// Enhanced weather data interface with Google APIs
interface EnhancedWeatherData {
  pollen?: {
    treeIndex: number;
    grassIndex: number;
    weedIndex: number;
    overall: string;
  };
  solarRadiation?: {
    current: number;
    daily: number;
    optimal: boolean;
  };
  marineForecast?: {
    waveHeight: number;
    swellDirection: number;
    waterTemperature: number;
    visibility: number;
  };
}

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
  airQuality?: AirQualityData;
  enhanced?: EnhancedWeatherData;
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

const getWindDirection = (degrees: number): string => {
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const index = Math.round(degrees / 22.5) % 16;
  return directions[index];
};

const getFishingRecommendation = (weatherData: WeatherData['current'], airQuality?: AirQualityData) => {
  const { wind, condition, temp, visibility } = weatherData;

  // Poor conditions
  if (wind > 25 || visibility < 2 || condition.toLowerCase().includes('storm') || condition.toLowerCase().includes('thunder')) {
    return {
      status: 'dangerous',
      icon: AlertCircle,
      message: 'Not safe for fishing',
      details: 'High winds, poor visibility, or severe weather detected. Stay on shore.',
      color: 'destructive'
    };
  }

  // Consider air quality in recommendations
  if (airQuality && airQuality.aqi > 150) {
    return {
      status: 'caution',
      icon: AlertTriangle,
      message: 'Fish with caution - Poor air quality',
      details: 'Air quality is unhealthy. Consider shorter fishing trips and avoid strenuous activities.',
      color: 'warning'
    };
  }

  // Moderate conditions
  if (wind > 15 || visibility < 5 || temp < 5 || temp > 40 || (airQuality && airQuality.aqi > 100)) {
    return {
      status: 'caution',
      icon: AlertTriangle,
      message: 'Fish with caution',
      details: 'Moderate winds, visibility issues, or moderate air quality. Stay close to shore and monitor conditions.',
      color: 'warning'
    };
  }

  // Good conditions
  return {
    status: 'good',
    icon: CheckCircle,
    message: 'Good for fishing',
    details: 'Favorable weather conditions. Good visibility, manageable winds, and clean air.',
    color: 'success'
  };
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
          "visibility",
          "pressure_msl",
          "cloud_cover",
          "dew_point_2m"
        ],
        "timezone": "auto"
      };

      try {
        const responses = await fetchWeatherApi("https://api.open-meteo.com/v1/forecast", params);
        const response = responses[0];

        const current = response.current()!;
        const currentData = {
          location: `${coords.lat.toFixed(1)}°N, ${coords.lon.toFixed(1)}°E`,
          temp: Math.round(current.variables(0)!.value()),
          apparentTemperature: Math.round(current.variables(2)!.value()),
          condition: "",
          icon: Sun as LucideIcon,
          wind: Math.round(current.variables(4)!.value()),
          windDirection: Math.round(current.variables(5)!.value()),
          humidity: Math.round(current.variables(1)!.value()),
          visibility: Math.round(current.variables(6)!.value() / 1000),
          pressure: Math.round(current.variables(7)!.value()),
          cloudCover: Math.round(current.variables(8)!.value()),
          dewPoint: Math.round(current.variables(9)!.value()),
          isDay: true
        };

        const weatherCode = Math.round(current.variables(3)!.value());
        const weatherInfo = weatherCodeMap[weatherCode];

        if (weatherInfo) {
          currentData.condition = weatherInfo.description;
          currentData.icon = currentData.isDay ? weatherInfo.day : weatherInfo.night;
        }

        setWeatherData({
          current: currentData
        });
      } catch (err) {
        setError("Failed to fetch weather data");
        console.error("Weather fetch error:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchWeather(true);
  }, [coords, locale]);

  if (loading) {
    return (
      <Card className="modern-card animate-pulse">
        <CardContent className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </CardContent>
      </Card>
    );
  }

  if (error || !weatherData) {
    return (
      <Card className="modern-card border-red-200">
        <CardContent className="flex items-center justify-center h-full text-red-600">
          <div className="text-center">
            <AlertTriangle className="w-12 h-12 mb-4 mx-auto text-destructive" />
            <p className="font-bold">Error fetching weather</p>
            <p className="text-sm">{error || "Could not load weather data."}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { current } = weatherData;
  const fishingRec = getFishingRecommendation(current);

  return (
    <Card className="modern-card animate-fade-in hover-lift">
      <CardContent className="p-0 h-full">
        {/* Header with gradient background */}
        <div className="bg-gradient-to-r from-blue-500 via-cyan-500 to-teal-500 text-white p-4 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold animate-shimmer">{t('weather_title')}</h3>
              <div className="flex items-center gap-2 mt-1">
                <MapPin className="w-3 h-3 text-blue-100" />
                <p className="text-blue-100 text-xs">{current.location}</p>
              </div>
            </div>
            <div className="text-right">
              <current.icon className="w-10 h-10 text-white animate-float ml-auto mb-1" />
              <p className="text-blue-100 text-xs">{current.condition}</p>
            </div>
          </div>
        </div>

        {/* Main temperature display */}
        <div className="p-4 text-center border-b border-gray-100">
          <div className="text-4xl font-bold text-gray-800 mb-1 animate-pulse-slow">
            {current.temp}°C
          </div>
          <div className="text-sm text-gray-600">
            Feels like {current.apparentTemperature}°C
          </div>

          {/* Fishing recommendation badge */}
          <div className="mt-3">
            <Badge
              variant={fishingRec.color as any}
              className="animate-glow px-3 py-1"
            >
              <fishingRec.icon className="w-3 h-3 mr-1" />
              {fishingRec.message}
            </Badge>
          </div>
        </div>

        {/* Weather stats grid */}
        <div className="p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            {/* Wind */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-3 rounded-lg border border-green-100 hover-glow transition-all">
              <div className="flex items-center gap-2 mb-1">
                <Wind className="w-4 h-4 text-green-600" />
                <span className="text-xs font-medium text-green-800">Wind</span>
              </div>
              <div className="text-sm font-bold text-green-900">{current.wind} km/h</div>
              <div className="text-xs text-green-600">{getWindDirection(current.windDirection)}</div>
            </div>

            {/* Humidity */}
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-3 rounded-lg border border-blue-100 hover-glow transition-all">
              <div className="flex items-center gap-2 mb-1">
                <Droplets className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-medium text-blue-800">Humidity</span>
              </div>
              <div className="text-sm font-bold text-blue-900">{current.humidity}%</div>
            </div>

            {/* Pressure */}
            <div className="bg-gradient-to-br from-purple-50 to-indigo-50 p-3 rounded-lg border border-purple-100 hover-glow transition-all">
              <div className="flex items-center gap-2 mb-1">
                <Gauge className="w-4 h-4 text-purple-600" />
                <span className="text-xs font-medium text-purple-800">Pressure</span>
              </div>
              <div className="text-sm font-bold text-purple-900">{current.pressure} hPa</div>
            </div>

            {/* Visibility */}
            <div className="bg-gradient-to-br from-orange-50 to-yellow-50 p-3 rounded-lg border border-orange-100 hover-glow transition-all">
              <div className="flex items-center gap-2 mb-1">
                <Eye className="w-4 h-4 text-orange-600" />
                <span className="text-xs font-medium text-orange-800">Visibility</span>
              </div>
              <div className="text-sm font-bold text-orange-900">{current.visibility} km</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
