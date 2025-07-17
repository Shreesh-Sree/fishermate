'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Sun, Moon, Fish, Waves, Wind, Compass, TrendingUp, TrendingDown, Clock, Calendar, Activity } from 'lucide-react';
import { useEffect, useState } from 'react';

interface FishingAnalytics {
  solarData: {
    sunrise: string;
    sunset: string;
    solarNoon: string;
    dayLength: string;
    uvIndex: number;
  };
  tideData: {
    highTide: string;
    lowTide: string;
    currentTide: 'rising' | 'falling';
    tideHeight: number;
  };
  fishingScore: {
    overall: number;
    factors: {
      weather: number;
      tides: number;
      moonPhase: number;
      time: number;
    };
  };
  recommendations: string[];
  moonPhase: {
    phase: string;
    illumination: number;
    icon: string;
  };
}

const FishingAnalyticsCard = () => {
  const [analytics, setAnalytics] = useState<FishingAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    getCurrentLocation();
  }, []);

  useEffect(() => {
    if (userLocation) {
      generateFishingAnalytics();
    }
  }, [userLocation]);

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error('Error getting location:', error);
          // Fallback to Chennai coordinates
          setUserLocation({ lat: 13.0827, lng: 80.2707 });
        }
      );
    } else {
      setUserLocation({ lat: 13.0827, lng: 80.2707 });
    }
  };

  const generateFishingAnalytics = () => {
    if (!userLocation) return;

    try {
      setLoading(true);
      setError(null);

      const now = new Date();
      const hour = now.getHours();
      const day = now.getDate();

      // Calculate sunrise and sunset times based on location
      const { sunrise, sunset } = calculateSunTimes(userLocation.lat, userLocation.lng, now);
      
      // Calculate moon phase
      const moonData = calculateMoonPhase(now);
      
      // Calculate fishing scores
      const weatherScore = calculateWeatherScore(hour);
      const tideScore = calculateTideScore(hour);
      const moonScore = calculateMoonScore(moonData.illumination);
      const timeScore = calculateTimeScore(hour, sunrise, sunset);
      
      const overallScore = Math.round((weatherScore + tideScore + moonScore + timeScore) / 4);

      // Generate tide times
      const { highTide, lowTide, currentTide } = calculateTideTimes(hour);

      const fishingAnalytics: FishingAnalytics = {
        solarData: {
          sunrise: formatTime(sunrise),
          sunset: formatTime(sunset),
          solarNoon: formatTime(new Date(now.setHours(12, 0, 0))),
          dayLength: calculateDayLength(sunrise, sunset),
          uvIndex: calculateUVIndex(hour, userLocation.lat)
        },
        tideData: {
          highTide,
          lowTide,
          currentTide,
          tideHeight: 1.2 + Math.random() * 0.8
        },
        fishingScore: {
          overall: overallScore,
          factors: {
            weather: weatherScore,
            tides: tideScore,
            moonPhase: moonScore,
            time: timeScore
          }
        },
        moonPhase: moonData,
        recommendations: generateRecommendations(overallScore, hour, moonData)
      };

      setAnalytics(fishingAnalytics);
    } catch (err) {
      console.error('Error generating fishing analytics:', err);
      setError('Unable to generate fishing analytics');
    } finally {
      setLoading(false);
    }
  };

  // Utility functions for calculations
  const calculateSunTimes = (lat: number, lng: number, date: Date) => {
    // Simplified sunrise/sunset calculation
    const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000);
    const latitude = lat * Math.PI / 180;
    
    const declination = 23.45 * Math.sin((360 * (284 + dayOfYear) / 365) * Math.PI / 180) * Math.PI / 180;
    const hourAngle = Math.acos(-Math.tan(latitude) * Math.tan(declination));
    
    const sunriseTime = 12 - (hourAngle * 180 / Math.PI) / 15;
    const sunsetTime = 12 + (hourAngle * 180 / Math.PI) / 15;
    
    const sunrise = new Date(date);
    sunrise.setHours(Math.floor(sunriseTime), (sunriseTime % 1) * 60, 0);
    
    const sunset = new Date(date);
    sunset.setHours(Math.floor(sunsetTime), (sunsetTime % 1) * 60, 0);
    
    return { sunrise, sunset };
  };

  const calculateMoonPhase = (date: Date) => {
    const newMoon = new Date('2025-01-29'); // Reference new moon
    const daysSinceNewMoon = Math.floor((date.getTime() - newMoon.getTime()) / (1000 * 60 * 60 * 24));
    const phase = (daysSinceNewMoon % 29.53) / 29.53;
    
    let phaseName = '';
    let icon = '';
    
    if (phase < 0.0625) {
      phaseName = 'New Moon';
      icon = '🌑';
    } else if (phase < 0.1875) {
      phaseName = 'Waxing Crescent';
      icon = '🌒';
    } else if (phase < 0.3125) {
      phaseName = 'First Quarter';
      icon = '🌓';
    } else if (phase < 0.4375) {
      phaseName = 'Waxing Gibbous';
      icon = '🌔';
    } else if (phase < 0.5625) {
      phaseName = 'Full Moon';
      icon = '🌕';
    } else if (phase < 0.6875) {
      phaseName = 'Waning Gibbous';
      icon = '🌖';
    } else if (phase < 0.8125) {
      phaseName = 'Last Quarter';
      icon = '🌗';
    } else {
      phaseName = 'Waning Crescent';
      icon = '🌘';
    }
    
    return {
      phase: phaseName,
      illumination: Math.round(Math.abs(Math.cos(phase * 2 * Math.PI)) * 100),
      icon
    };
  };

  const calculateWeatherScore = (hour: number): number => {
    // Base score varies by time of day
    const baseScore = 70;
    const timeBonus = (hour >= 5 && hour <= 7) || (hour >= 17 && hour <= 19) ? 20 : 0;
    return Math.min(100, baseScore + timeBonus + Math.round(Math.random() * 10));
  };

  const calculateTideScore = (hour: number): number => {
    // Higher scores during changing tides (6-8 AM and 4-6 PM)
    if ((hour >= 6 && hour <= 8) || (hour >= 16 && hour <= 18)) {
      return 85 + Math.round(Math.random() * 10);
    }
    return 60 + Math.round(Math.random() * 20);
  };

  const calculateMoonScore = (illumination: number): number => {
    // New moon and full moon are best for fishing
    if (illumination < 20 || illumination > 80) {
      return 85 + Math.round(Math.random() * 10);
    }
    return 60 + Math.round(Math.random() * 20);
  };

  const calculateTimeScore = (hour: number, sunrise: Date, sunset: Date): number => {
    const sunriseHour = sunrise.getHours();
    const sunsetHour = sunset.getHours();
    
    // Dawn and dusk are prime fishing times
    if ((hour >= sunriseHour - 1 && hour <= sunriseHour + 1) || 
        (hour >= sunsetHour - 1 && hour <= sunsetHour + 1)) {
      return 95;
    }
    
    // Early morning and late afternoon are good
    if ((hour >= 6 && hour <= 10) || (hour >= 15 && hour <= 18)) {
      return 80;
    }
    
    return 50 + Math.round(Math.random() * 30);
  };

  const calculateTideTimes = (currentHour: number) => {
    // Simplified tide calculation
    const highHour = (currentHour < 12) ? Math.floor(Math.random() * 4) + 8 : Math.floor(Math.random() * 4) + 20;
    const lowHour = (highHour + 6) % 24;
    
    return {
      highTide: `${highHour}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')} ${highHour < 12 ? 'AM' : 'PM'}`,
      lowTide: `${lowHour > 12 ? lowHour - 12 : lowHour}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')} ${lowHour < 12 ? 'AM' : 'PM'}`,
      currentTide: Math.random() > 0.5 ? 'rising' : 'falling' as 'rising' | 'falling'
    };
  };

  const calculateUVIndex = (hour: number, lat: number): number => {
    // Higher UV around noon, varies by latitude
    const noonFactor = Math.max(0, 1 - Math.abs(hour - 12) / 6);
    const latitudeFactor = 1 - Math.abs(lat) / 90;
    return Math.round((8 + latitudeFactor * 3) * noonFactor);
  };

  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const calculateDayLength = (sunrise: Date, sunset: Date): string => {
    const diff = sunset.getTime() - sunrise.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const generateRecommendations = (score: number, hour: number, moonData: any): string[] => {
    const recommendations: string[] = [];
    
    if (score >= 80) {
      recommendations.push('🎣 Excellent fishing conditions today!');
      recommendations.push('🌊 Try deep water fishing for best results');
      recommendations.push('🐟 Target active fish species during peak times');
    } else if (score >= 60) {
      recommendations.push('✅ Good fishing conditions');
      recommendations.push('🏖️ Shore fishing recommended');
      recommendations.push('🎯 Focus on structure and cover areas');
    } else {
      recommendations.push('⚠️ Challenging conditions today');
      recommendations.push('🎯 Focus on sheltered areas');
      recommendations.push('🐛 Try live bait for better results');
    }

    // Time-based recommendations
    if (hour >= 5 && hour <= 7) {
      recommendations.push('🌅 Perfect dawn fishing time - fish are most active');
    } else if (hour >= 17 && hour <= 19) {
      recommendations.push('🌇 Ideal dusk fishing period - feeding time');
    } else if (hour >= 10 && hour <= 14) {
      recommendations.push('☀️ Midday fishing - seek shaded or deeper waters');
    }

    // Moon phase recommendations
    if (moonData.phase === 'New Moon' || moonData.phase === 'Full Moon') {
      recommendations.push(`${moonData.icon} ${moonData.phase} - excellent for fishing!`);
    }

    recommendations.push('📱 Check local regulations before fishing');
    
    return recommendations;
  };
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 80) return <TrendingUp className="w-5 h-5" />;
    if (score >= 60) return <Activity className="w-5 h-5" />;
    return <TrendingDown className="w-5 h-5" />;
  };

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Fish className="w-5 h-5" />
            Fishing Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-20 bg-gray-200 rounded-lg"></div>
            <div className="h-16 bg-gray-200 rounded-lg"></div>
            <div className="h-32 bg-gray-200 rounded-lg"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !analytics) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Fish className="w-5 h-5" />
            Fishing Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertDescription>
              {error || 'Unable to load fishing analytics'}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Fish className="w-5 h-5" />
          Fishing Analytics
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Fishing Score */}
        <div className={`p-4 rounded-lg border-2 ${getScoreColor(analytics.fishingScore.overall)}`}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              {getScoreIcon(analytics.fishingScore.overall)}
              <span className="font-semibold">Fishing Score</span>
            </div>
            <span className="text-2xl font-bold">{analytics.fishingScore.overall}/100</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex justify-between">
              <span>Weather:</span>
              <span className="font-medium">{analytics.fishingScore.factors.weather}%</span>
            </div>
            <div className="flex justify-between">
              <span>Tides:</span>
              <span className="font-medium">{analytics.fishingScore.factors.tides}%</span>
            </div>
            <div className="flex justify-between">
              <span>Moon:</span>
              <span className="font-medium">{analytics.fishingScore.factors.moonPhase}%</span>
            </div>
            <div className="flex justify-between">
              <span>Time:</span>
              <span className="font-medium">{analytics.fishingScore.factors.time}%</span>
            </div>
          </div>
        </div>

        {/* Solar, Tide, and Moon Information */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-3">
            <h4 className="font-semibold flex items-center gap-2">
              <Sun className="w-4 h-4 text-yellow-500" />
              Solar Data
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Sunrise:</span>
                <span className="font-medium">{analytics.solarData.sunrise}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Sunset:</span>
                <span className="font-medium">{analytics.solarData.sunset}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Day Length:</span>
                <span className="font-medium">{analytics.solarData.dayLength}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">UV Index:</span>
                <Badge variant={analytics.solarData.uvIndex > 7 ? "destructive" : analytics.solarData.uvIndex > 3 ? "secondary" : "outline"}>
                  {analytics.solarData.uvIndex}
                </Badge>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold flex items-center gap-2">
              <Waves className="w-4 h-4 text-blue-500" />
              Tide Data
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">High Tide:</span>
                <span className="font-medium">{analytics.tideData.highTide}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Low Tide:</span>
                <span className="font-medium">{analytics.tideData.lowTide}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Current:</span>
                <Badge variant={analytics.tideData.currentTide === 'rising' ? "default" : "secondary"}>
                  {analytics.tideData.currentTide}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Height:</span>
                <span className="font-medium">{analytics.tideData.tideHeight.toFixed(1)}m</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold flex items-center gap-2">
              <Moon className="w-4 h-4 text-purple-500" />
              Moon Phase
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Phase:</span>
                <div className="flex items-center gap-1">
                  <span className="text-lg">{analytics.moonPhase.icon}</span>
                  <span className="font-medium">{analytics.moonPhase.phase}</span>
                </div>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Illumination:</span>
                <span className="font-medium">{analytics.moonPhase.illumination}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-purple-500 h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${analytics.moonPhase.illumination}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Recommendations */}
        <div>
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <Compass className="w-4 h-4 text-indigo-500" />
            Today's Fishing Recommendations
          </h4>
          <div className="space-y-2">
            {analytics.recommendations.map((rec, index) => (
              <div key={index} className="p-3 bg-blue-50 rounded-lg text-sm border-l-4 border-blue-400 hover:bg-blue-100 transition-colors">
                {rec}
              </div>
            ))}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="pt-4 border-t border-gray-200">
          <div className="flex items-center justify-center gap-6 text-center">
            <div>
              <div className="text-lg font-bold text-blue-600">{new Date().toLocaleDateString()}</div>
              <div className="text-xs text-gray-500">Today</div>
            </div>
            <div>
              <div className="text-lg font-bold text-green-600">{analytics.fishingScore.overall}%</div>
              <div className="text-xs text-gray-500">Success Rate</div>
            </div>
            <div>
              <div className="text-lg font-bold text-purple-600">{analytics.moonPhase.illumination}%</div>
              <div className="text-xs text-gray-500">Moon Visibility</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FishingAnalyticsCard;
