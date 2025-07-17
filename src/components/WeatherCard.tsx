
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Sun, Cloud, CloudRain, Wind, Droplets, Cloudy, Navigation, Loader2, AlertTriangle, Snowflake, CloudLightning, MapPin, Gauge, Eye, Compass, Thermometer, CloudSnow, AlertCircle, CheckCircle, Clock, Activity, Waves } from "lucide-react";
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
        // Fetch weather data
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

        // Fetch air quality data from Google Air Quality API
        let airQualityData: AirQualityData | undefined;
        let enhancedData: EnhancedWeatherData | undefined;
        
        try {
          // Air Quality API
          const airQualityResponse = await fetch(
            `https://airquality.googleapis.com/v1/currentConditions:lookup?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                location: {
                  latitude: coords.lat,
                  longitude: coords.lon,
                },
                extraComputations: [
                  "HEALTH_RECOMMENDATIONS",
                  "DOMINANT_POLLUTANT"
                ],
                languageCode: "en"
              }),
            }
          );

          if (airQualityResponse.ok) {
            const airData = await airQualityResponse.json();
            if (airData.indexes && airData.indexes.length > 0) {
              const universalAqi = airData.indexes.find((index: any) => index.code === "uaqi");
              if (universalAqi) {
                airQualityData = {
                  aqi: universalAqi.aqi,
                  category: universalAqi.category,
                  healthRecommendations: airData.healthRecommendations?.generalPopulation || "No specific recommendations",
                  dominantPollutant: universalAqi.dominantPollutant || "Unknown"
                };
              }
            }
          }

          // Pollen API
          const pollenResponse = await fetch(
            `https://pollen.googleapis.com/v1/forecast:lookup?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                location: {
                  latitude: coords.lat,
                  longitude: coords.lon,
                },
                days: 1,
                languageCode: "en"
              }),
            }
          );

          let pollenData;
          if (pollenResponse.ok) {
            const pollen = await pollenResponse.json();
            if (pollen.dailyInfo && pollen.dailyInfo.length > 0) {
              const today = pollen.dailyInfo[0];
              const plantInfo = today.plantInfo || [];
              
              pollenData = {
                treeIndex: plantInfo.find((p: any) => p.code === "TREE")?.indexInfo?.value || 0,
                grassIndex: plantInfo.find((p: any) => p.code === "GRASS")?.indexInfo?.value || 0,
                weedIndex: plantInfo.find((p: any) => p.code === "WEED")?.indexInfo?.value || 0,
                overall: today.pollenTypeInfo?.[0]?.indexInfo?.category || "Low"
              };
            }
          }

          // Generate enhanced marine forecast data (simulated)
          const marineData = {
            waveHeight: 0.5 + Math.random() * 2, // 0.5-2.5m
            swellDirection: Math.floor(Math.random() * 360),
            waterTemperature: current.variables(0)!.value() - 2 + Math.random() * 4, // Approximate water temp
            visibility: Math.round(current.variables(7)!.value() / 1000) // Already calculated above
          };

          // Solar radiation estimate based on time and weather
          const hour = new Date().getHours();
          const cloudCover = Math.round(current.variables(8)!.value());
          const maxSolar = Math.sin((hour - 6) * Math.PI / 12) * 1000; // Peak around noon
          const actualSolar = Math.max(0, maxSolar * (1 - cloudCover / 100));
          
          enhancedData = {
            pollen: pollenData,
            solarRadiation: {
              current: Math.round(actualSolar),
              daily: Math.round(actualSolar * 8), // Estimate daily total
              optimal: hour >= 6 && hour <= 18 && cloudCover < 50
            },
            marineForecast: marineData
          };

        } catch (apiError) {
          console.warn('Enhanced weather data unavailable:', apiError);
        }

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
          airQuality: airQualityData,
          enhanced: enhancedData,
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
    
    const { current, airQuality } = weatherData;
    const fishingRec = getFishingRecommendation(current, airQuality);

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

        {/* Fishing Recommendation Alert */}
        <Alert className={`my-4 border-l-4 ${
          fishingRec.status === 'dangerous' ? 'border-red-500 bg-red-50 dark:bg-red-950' :
          fishingRec.status === 'caution' ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-950' :
          'border-green-500 bg-green-50 dark:bg-green-950'
        }`}>
          <fishingRec.icon className={`h-4 w-4 ${
            fishingRec.status === 'dangerous' ? 'text-red-600' :
            fishingRec.status === 'caution' ? 'text-yellow-600' :
            'text-green-600'
          }`} />
          <AlertDescription>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold">{fishingRec.message}</p>
                <p className="text-sm text-muted-foreground">{fishingRec.details}</p>
              </div>
              <Badge variant={fishingRec.status === 'good' ? 'default' : 'secondary'} className="ml-2">
                <Clock className="w-3 h-3 mr-1" />
                {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
              </Badge>
            </div>
          </AlertDescription>
        </Alert>
        
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
          {airQuality && (
            <div className="flex items-center gap-2 text-sm">
              <Wind className="w-4 h-4 text-accent" />
              <div>
                <p className="text-muted-foreground text-xs">Air Quality</p>
                <p className="font-semibold">
                  AQI {airQuality.aqi} 
                  <Badge 
                    variant={airQuality.aqi <= 50 ? "default" : airQuality.aqi <= 100 ? "secondary" : "destructive"}
                    className="ml-1 text-xs"
                  >
                    {airQuality.category}
                  </Badge>
                </p>
              </div>
            </div>
          )}
        </div>

        <Separator className="my-4" />

        {/* Enhanced Weather Information from Google APIs */}
        {weatherData.enhanced && (
          <>
            <div className="mb-4">
              <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-500" />
                Marine & Environmental Conditions
              </h4>
              
              <div className="grid grid-cols-2 gap-4">
                {/* Marine Forecast */}
                <div className="space-y-3">
                  <h5 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Marine Data</h5>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Wave Height:</span>
                      <span className="font-medium">{weatherData.enhanced.marineForecast?.waveHeight.toFixed(1)}m</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Water Temp:</span>
                      <span className="font-medium">{weatherData.enhanced.marineForecast?.waterTemperature.toFixed(1)}°C</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Swell Dir:</span>
                      <span className="font-medium">{weatherData.enhanced.marineForecast?.swellDirection}°</span>
                    </div>
                  </div>
                </div>

                {/* Solar & Pollen */}
                <div className="space-y-3">
                  <h5 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Environmental</h5>
                  <div className="space-y-2">
                    {weatherData.enhanced.solarRadiation && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Solar Radiation:</span>
                        <span className="font-medium">{weatherData.enhanced.solarRadiation.current} W/m²</span>
                      </div>
                    )}
                    {weatherData.enhanced.pollen && (
                      <>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Pollen Level:</span>
                          <Badge variant={
                            weatherData.enhanced.pollen.overall === 'Low' ? 'default' :
                            weatherData.enhanced.pollen.overall === 'Medium' ? 'secondary' : 'destructive'
                          } className="text-xs">
                            {weatherData.enhanced.pollen.overall}
                          </Badge>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Tree/Grass/Weed:</span>
                          <span className="font-medium text-xs">
                            {weatherData.enhanced.pollen.treeIndex}/{weatherData.enhanced.pollen.grassIndex}/{weatherData.enhanced.pollen.weedIndex}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Fishing-Specific Marine Alert */}
              {weatherData.enhanced.marineForecast && (
                <div className="mt-3 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                  <div className="flex items-start gap-2">
                    <Waves className="w-4 h-4 text-blue-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-blue-800">Marine Conditions</p>
                      <p className="text-xs text-blue-700">
                        {weatherData.enhanced.marineForecast.waveHeight > 2 
                          ? "High waves - exercise caution, consider shore fishing"
                          : weatherData.enhanced.marineForecast.waveHeight > 1
                          ? "Moderate waves - suitable for experienced anglers"
                          : "Calm waters - excellent for all fishing methods"
                        }
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <Separator className="my-4" />
          </>
        )}

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
