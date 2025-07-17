"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CloudSun, Droplets, Wind, Eye, Thermometer, Gauge, Sun, Moon, CloudRain, Umbrella, Navigation, Waves, Zap, AlertTriangle } from 'lucide-react';

interface WeatherData {
  current: {
    temperature_2m: number;
    relative_humidity_2m: number;
    wind_speed_10m: number;
    wind_direction_10m: number;
    visibility: number;
    weather_code: number;
    apparent_temperature: number;
    pressure_msl: number;
    surface_pressure: number;
    cloud_cover: number;
    uv_index: number;
  };
  hourly: {
    time: string[];
    temperature_2m: number[];
    precipitation_probability: number[];
    weather_code: number[];
  };
  daily: {
    time: string[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    precipitation_probability_max: number[];
    weather_code: number[];
    sunrise: string[];
    sunset: string[];
    uv_index_max: number[];
  };
}

const weatherCodes: { [key: number]: { icon: any; label: string; description: string } } = {
  0: { icon: Sun, label: 'Clear Sky', description: 'Perfect for fishing' },
  1: { icon: Sun, label: 'Mainly Clear', description: 'Great conditions' },
  2: { icon: CloudSun, label: 'Partly Cloudy', description: 'Good for fishing' },
  3: { icon: CloudSun, label: 'Overcast', description: 'Fish may be active' },
  45: { icon: CloudSun, label: 'Foggy', description: 'Limited visibility' },
  48: { icon: CloudSun, label: 'Fog', description: 'Be cautious' },
  51: { icon: CloudRain, label: 'Light Drizzle', description: 'Fish feeding time' },
  53: { icon: CloudRain, label: 'Drizzle', description: 'Active fish' },
  55: { icon: CloudRain, label: 'Heavy Drizzle', description: 'Good catch potential' },
  61: { icon: Umbrella, label: 'Light Rain', description: 'Fish are biting' },
  63: { icon: Umbrella, label: 'Rain', description: 'Consider shelter' },
  65: { icon: Umbrella, label: 'Heavy Rain', description: 'Seek cover' },
};

export function WeatherCard() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState<string>('Current Location');

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            async (position) => {
              const { latitude, longitude } = position.coords;
              
              // Fetch location name
              try {
                const geocodeResponse = await fetch(
                  `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
                );
                const locationData = await geocodeResponse.json();
                setLocation(`${locationData.city || locationData.locality || 'Unknown'}, ${locationData.countryName || ''}`);
              } catch (error) {
                console.error('Error fetching location name:', error);
              }

              // Fetch weather data
              const response = await fetch(
                `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,surface_pressure,cloud_cover,pressure_msl,wind_speed_10m,wind_direction_10m,visibility&hourly=temperature_2m,precipitation_probability,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max,precipitation_probability_max&timezone=auto&forecast_days=3`
              );
              const data = await response.json();
              setWeather(data);
            },
            (error) => {
              console.error('Error getting location:', error);
              // Fallback to default location (Chennai)
              fetchDefaultWeather();
            }
          );
        } else {
          fetchDefaultWeather();
        }
      } catch (error) {
        console.error('Error fetching weather:', error);
      } finally {
        setLoading(false);
      }
    };

    const fetchDefaultWeather = async () => {
      try {
        const response = await fetch(
          'https://api.open-meteo.com/v1/forecast?latitude=13.0827&longitude=80.2707&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,surface_pressure,cloud_cover,pressure_msl,wind_speed_10m,wind_direction_10m,visibility&hourly=temperature_2m,precipitation_probability,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max,precipitation_probability_max&timezone=auto&forecast_days=3'
        );
        const data = await response.json();
        setWeather(data);
        setLocation('Chennai, India');
      } catch (error) {
        console.error('Error fetching default weather:', error);
      }
    };

    fetchWeather();
  }, []);

  const getWindDirection = (degrees: number) => {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    return directions[Math.round(degrees / 45) % 8];
  };

  const getFishingCondition = (weatherCode: number, windSpeed: number, temperature: number) => {
    if (weatherCode === 0 || weatherCode === 1) {
      if (windSpeed < 15 && temperature > 15 && temperature < 30) return { label: 'Excellent', color: 'bg-green-500' };
      return { label: 'Good', color: 'bg-blue-500' };
    }
    if (weatherCode <= 3) return { label: 'Good', color: 'bg-blue-500' };
    if (weatherCode <= 55) return { label: 'Fair', color: 'bg-yellow-500' };
    return { label: 'Poor', color: 'bg-red-500' };
  };

  if (loading) {
    return (
      <Card className="modern-card-tall">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="spinner w-5 h-5"></div>
            Loading Weather...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-4 bg-muted rounded animate-pulse"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!weather) {
    return (
      <Card className="modern-card-tall">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <CloudSun className="w-5 h-5" />
            Weather Unavailable
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Unable to fetch weather data. Please check your connection.</p>
        </CardContent>
      </Card>
    );
  }

  const currentWeather = weatherCodes[weather.current.weather_code] || weatherCodes[0];
  const IconComponent = currentWeather.icon;
  const fishingCondition = getFishingCondition(
    weather.current.weather_code,
    weather.current.wind_speed_10m,
    weather.current.temperature_2m
  );

  return (
    <Card className="modern-card-tall">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              <IconComponent className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              Current Weather
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">{location}</p>
          </div>
          <Badge className={`${fishingCondition.color} text-white`}>
            {fishingCondition.label} Fishing
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Main Temperature Display */}
        <div className="text-center py-4">
          <div className="text-4xl font-bold text-foreground mb-2">
            {Math.round(weather.current.temperature_2m)}°C
          </div>
          <p className="text-muted-foreground">{currentWeather.label}</p>
          <p className="text-sm text-muted-foreground mt-1">{currentWeather.description}</p>
          <p className="text-xs text-muted-foreground mt-2">
            Feels like {Math.round(weather.current.apparent_temperature)}°C
          </p>
        </div>

        {/* Weather Metrics Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="weather-metric">
            <Droplets className="w-5 h-5 text-blue-500 mx-auto mb-2" />
            <div className="weather-metric-value">{weather.current.relative_humidity_2m}%</div>
            <div className="weather-metric-label">Humidity</div>
          </div>
          
          <div className="weather-metric">
            <Wind className="w-5 h-5 text-gray-500 mx-auto mb-2" />
            <div className="weather-metric-value">
              {Math.round(weather.current.wind_speed_10m)} km/h
            </div>
            <div className="weather-metric-label">
              Wind {getWindDirection(weather.current.wind_direction_10m)}
            </div>
          </div>
          
          <div className="weather-metric">
            <Gauge className="w-5 h-5 text-purple-500 mx-auto mb-2" />
            <div className="weather-metric-value">
              {Math.round(weather.current.pressure_msl)} hPa
            </div>
            <div className="weather-metric-label">Pressure</div>
          </div>
          
          <div className="weather-metric">
            <Eye className="w-5 h-5 text-green-500 mx-auto mb-2" />
            <div className="weather-metric-value">
              {weather.current.visibility ? `${(weather.current.visibility / 1000).toFixed(1)} km` : 'N/A'}
            </div>
            <div className="weather-metric-label">Visibility</div>
          </div>
        </div>

        {/* Today's Forecast */}
        <div>
          <h4 className="font-semibold text-foreground mb-3">Today's Range</h4>
          <div className="flex items-center justify-between glass-card-sm p-3">
            <div className="text-center">
              <div className="text-sm text-muted-foreground">Low</div>
              <div className="font-semibold text-foreground">
                {Math.round(weather.daily.temperature_2m_min[0])}°
              </div>
            </div>
            <div className="flex-1 mx-4">
              <div className="h-2 bg-gradient-to-r from-blue-400 to-red-400 rounded-full"></div>
            </div>
            <div className="text-center">
              <div className="text-sm text-muted-foreground">High</div>
              <div className="font-semibold text-foreground">
                {Math.round(weather.daily.temperature_2m_max[0])}°
              </div>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Cloud Cover:</span>
            <span className="font-medium">{weather.current.cloud_cover}%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">UV Index:</span>
            <span className="font-medium">{weather.daily.uv_index_max[0] || 'N/A'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Rain Chance:</span>
            <span className="font-medium">{weather.daily.precipitation_probability_max[0] || 0}%</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

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
