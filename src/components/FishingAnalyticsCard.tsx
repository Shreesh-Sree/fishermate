'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Sun, Moon, Fish, Waves, Wind, Compass, TrendingUp, TrendingDown, Clock, Calendar } from 'lucide-react';
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
      fetchFishingAnalytics();
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
          setError('Using default location for fishing analytics');
        }
      );
    } else {
      setUserLocation({ lat: 13.0827, lng: 80.2707 });
      setError('Geolocation not supported. Using default location.');
    }
  };

  const fetchFishingAnalytics = async () => {
    if (!userLocation) return;

    try {
      setLoading(true);
      
      // Fetch solar data using Google Solar API
      const solarResponse = await fetch(
        `https://solar.googleapis.com/v1/solarPotential:findClosest?location.latitude=${userLocation.lat}&location.longitude=${userLocation.lng}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
      );

      let solarData = {
        sunrise: '6:00 AM',
        sunset: '6:00 PM',
        solarNoon: '12:00 PM',
        dayLength: '12 hours',
        uvIndex: 5
      };

      if (solarResponse.ok) {
        const solar = await solarResponse.json();
        if (solar.solarPotential) {
          // Process solar data - this is a simplified version
          // In practice, you'd calculate sunrise/sunset times based on the solar potential data
          solarData = {
            sunrise: calculateSunrise(userLocation.lat, userLocation.lng),
            sunset: calculateSunset(userLocation.lat, userLocation.lng),
            solarNoon: '12:00 PM',
            dayLength: calculateDayLength(userLocation.lat),
            uvIndex: Math.round(Math.random() * 10) // Placeholder - would come from weather API
          };
        }
      }

      // Generate fishing analytics based on current conditions
      const now = new Date();
      const hour = now.getHours();
      
      // Calculate fishing score based on various factors
      const weatherScore = calculateWeatherScore();
      const tideScore = calculateTideScore();
      const moonScore = calculateMoonPhaseScore();
      const timeScore = calculateTimeScore(hour);
      
      const overallScore = Math.round((weatherScore + tideScore + moonScore + timeScore) / 4);

      const fishingAnalytics: FishingAnalytics = {
        solarData,
        tideData: {
          highTide: '10:30 AM',
          lowTide: '4:30 PM',
          currentTide: hour < 14 ? 'rising' : 'falling',
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
        recommendations: generateRecommendations(overallScore, hour)
      };

      setAnalytics(fishingAnalytics);
    } catch (err) {
      console.error('Error fetching fishing analytics:', err);
      setError('Unable to fetch fishing analytics');
    } finally {
      setLoading(false);
    }
  };

  // Utility functions for calculations
  const calculateSunrise = (lat: number, lng: number): string => {
    // Simplified sunrise calculation
    const now = new Date();
    const sunrise = new Date(now);
    sunrise.setHours(6, 0, 0); // Placeholder
    return sunrise.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const calculateSunset = (lat: number, lng: number): string => {
    // Simplified sunset calculation
    const now = new Date();
    const sunset = new Date(now);
    sunset.setHours(18, 0, 0); // Placeholder
    return sunset.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const calculateDayLength = (lat: number): string => {
    return '12 hours'; // Placeholder
  };

  const calculateWeatherScore = (): number => {
    // Would integrate with weather data
    return 70 + Math.round(Math.random() * 30);
  };

  const calculateTideScore = (): number => {
    const hour = new Date().getHours();
    // Higher scores during changing tides
    if (hour >= 6 && hour <= 8) return 85; // Morning tide change
    if (hour >= 16 && hour <= 18) return 85; // Evening tide change
    return 60 + Math.round(Math.random() * 20);
  };

  const calculateMoonPhaseScore = (): number => {
    // Simplified moon phase scoring
    const day = new Date().getDate();
    const moonPhase = day % 28;
    if (moonPhase < 3 || moonPhase > 25) return 90; // New moon
    if (moonPhase >= 12 && moonPhase <= 16) return 90; // Full moon
    return 60 + Math.round(Math.random() * 20);
  };

  const calculateTimeScore = (hour: number): number => {
    // Dawn and dusk are best fishing times
    if ((hour >= 5 && hour <= 7) || (hour >= 17 && hour <= 19)) return 95;
    if ((hour >= 8 && hour <= 10) || (hour >= 15 && hour <= 16)) return 80;
    return 50 + Math.round(Math.random() * 30);
  };

  const generateRecommendations = (score: number, hour: number): string[] => {
    const recommendations: string[] = [];
    
    if (score >= 80) {
      recommendations.push('🎣 Excellent fishing conditions!');
      recommendations.push('🌊 Try deep water fishing for best results');
    } else if (score >= 60) {
      recommendations.push('✅ Good fishing conditions');
      recommendations.push('🏖️ Shore fishing recommended');
    } else {
      recommendations.push('⚠️ Challenging conditions today');
      recommendations.push('🎯 Focus on sheltered areas');
    }

    if (hour >= 5 && hour <= 7) {
      recommendations.push('🌅 Perfect dawn fishing time');
    } else if (hour >= 17 && hour <= 19) {
      recommendations.push('🌇 Ideal dusk fishing period');
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
    if (score >= 60) return <Fish className="w-5 h-5" />;
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
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!analytics) {
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
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              {getScoreIcon(analytics.fishingScore.overall)}
              <span className="font-semibold">Fishing Score</span>
            </div>
            <span className="text-2xl font-bold">{analytics.fishingScore.overall}/100</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>Weather: {analytics.fishingScore.factors.weather}%</div>
            <div>Tides: {analytics.fishingScore.factors.tides}%</div>
            <div>Moon: {analytics.fishingScore.factors.moonPhase}%</div>
            <div>Time: {analytics.fishingScore.factors.time}%</div>
          </div>
        </div>

        {/* Solar & Tide Information */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-3">
            <h4 className="font-semibold flex items-center gap-2">
              <Sun className="w-4 h-4" />
              Solar Data
            </h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Sunrise:</span>
                <span>{analytics.solarData.sunrise}</span>
              </div>
              <div className="flex justify-between">
                <span>Sunset:</span>
                <span>{analytics.solarData.sunset}</span>
              </div>
              <div className="flex justify-between">
                <span>UV Index:</span>
                <Badge variant={analytics.solarData.uvIndex > 7 ? "destructive" : "secondary"}>
                  {analytics.solarData.uvIndex}
                </Badge>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold flex items-center gap-2">
              <Waves className="w-4 h-4" />
              Tide Data
            </h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>High Tide:</span>
                <span>{analytics.tideData.highTide}</span>
              </div>
              <div className="flex justify-between">
                <span>Low Tide:</span>
                <span>{analytics.tideData.lowTide}</span>
              </div>
              <div className="flex justify-between">
                <span>Current:</span>
                <Badge variant={analytics.tideData.currentTide === 'rising' ? "default" : "secondary"}>
                  {analytics.tideData.currentTide}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Recommendations */}
        <div>
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <Compass className="w-4 h-4" />
            Today's Recommendations
          </h4>
          <div className="space-y-2">
            {analytics.recommendations.map((rec, index) => (
              <div key={index} className="p-2 bg-blue-50 rounded-lg text-sm border-l-4 border-blue-400">
                {rec}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FishingAnalyticsCard;
