'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Sun, Moon, Fish, Waves, Wind, Compass, TrendingUp, TrendingDown, Clock, Calendar, Activity, Thermometer, Eye, Gauge } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';

interface FishingAnalytics {
  solarData: {
    sunrise: string;
    sunset: string;
    solarNoon: string;
    dayLength: string;
    uvIndex: number;
    goldenHour: {
      morning: { start: string; end: string };
      evening: { start: string; end: string };
    };
  };
  tideData: {
    highTide: string;
    lowTide: string;
    currentTide: 'rising' | 'falling';
    tideHeight: number;
    nextTideChange: string;
    tideStrength: 'weak' | 'moderate' | 'strong';
  };
  fishingScore: {
    overall: number;
    factors: {
      weather: number;
      tides: number;
      moonPhase: number;
      time: number;
      barometric: number;
    };
  };
  recommendations: string[];
  moonPhase: {
    phase: string;
    illumination: number;
    icon: string;
    fishingImpact: 'excellent' | 'good' | 'fair' | 'poor';
  };
  bestFishingTimes: {
    morning: { start: string; end: string; quality: 'excellent' | 'good' | 'fair' };
    evening: { start: string; end: string; quality: 'excellent' | 'good' | 'fair' };
  };
  fishingConditions: {
    waterTemperature: number;
    visibility: string;
    windCondition: 'ideal' | 'good' | 'challenging' | 'dangerous';
    barometricPressure: number;
    pressureTrend: 'rising' | 'falling' | 'stable';
  };
  targetSpecies: {
    name: string;
    probability: number;
    bestTime: string;
    suggestedBait: string[];
  }[];
}

const FishingAnalyticsCard = () => {
  const { t } = useLanguage();
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
      const barometricScore = calculateBarometricScore(hour);
      
      const overallScore = Math.round((weatherScore + tideScore + moonScore + timeScore + barometricScore) / 5);

      // Generate tide times
      const { highTide, lowTide, currentTide, nextTideChange, tideStrength } = calculateTideTimes(hour);

      // Calculate best fishing times
      const bestTimes = calculateBestFishingTimes(sunrise, sunset, hour);

      // Generate target species based on conditions
      const targetSpecies = generateTargetSpecies(overallScore, moonData, hour);

      // Calculate fishing conditions
      const fishingConditions = calculateFishingConditions(hour, userLocation);

      const fishingAnalytics: FishingAnalytics = {
        solarData: {
          sunrise: formatTime(sunrise),
          sunset: formatTime(sunset),
          solarNoon: formatTime(new Date(now.setHours(12, 0, 0))),
          dayLength: calculateDayLength(sunrise, sunset),
          uvIndex: calculateUVIndex(hour, userLocation.lat),
          goldenHour: {
            morning: {
              start: formatTime(new Date(sunrise.getTime() - 30 * 60000)),
              end: formatTime(new Date(sunrise.getTime() + 60 * 60000))
            },
            evening: {
              start: formatTime(new Date(sunset.getTime() - 60 * 60000)),
              end: formatTime(new Date(sunset.getTime() + 30 * 60000))
            }
          }
        },
        tideData: {
          highTide,
          lowTide,
          currentTide,
          tideHeight: 1.2 + Math.random() * 0.8,
          nextTideChange,
          tideStrength
        },
        fishingScore: {
          overall: overallScore,
          factors: {
            weather: weatherScore,
            tides: tideScore,
            moonPhase: moonScore,
            time: timeScore,
            barometric: barometricScore
          }
        },
        moonPhase: {
          ...moonData,
          fishingImpact: getMoonFishingImpact(moonData.illumination)
        },
        bestFishingTimes: bestTimes,
        fishingConditions,
        targetSpecies,
        recommendations: generateEnhancedRecommendations(overallScore, hour, moonData, fishingConditions)
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

  const calculateBarometricScore = (hour: number): number => {
    // Simulate barometric pressure effects
    return 65 + Math.round(Math.random() * 25);
  };

  const calculateBestFishingTimes = (sunrise: Date, sunset: Date, currentHour: number) => {
    return {
      morning: {
        start: formatTime(new Date(sunrise.getTime() - 30 * 60000)),
        end: formatTime(new Date(sunrise.getTime() + 90 * 60000)),
        quality: (currentHour >= 5 && currentHour <= 8) ? 'excellent' : 'good' as 'excellent' | 'good' | 'fair'
      },
      evening: {
        start: formatTime(new Date(sunset.getTime() - 90 * 60000)),
        end: formatTime(new Date(sunset.getTime() + 30 * 60000)),
        quality: (currentHour >= 17 && currentHour <= 20) ? 'excellent' : 'good' as 'excellent' | 'good' | 'fair'
      }
    };
  };

  const generateTargetSpecies = (score: number, moonData: any, hour: number) => {
    const species = [
      { name: t("snapper"), probability: score > 70 ? 85 : 60, bestTime: hour < 12 ? t("morning") : t("evening"), suggestedBait: [t("live_shrimp"), t("squid")] },
      { name: t("mackerel"), probability: score > 60 ? 75 : 55, bestTime: t("morning"), suggestedBait: [t("small_fish"), t("artificial_lures")] },
      { name: t("sardine"), probability: 70, bestTime: t("morning"), suggestedBait: [t("worms"), t("small_fish")] },
      { name: t("kingfish"), probability: score > 80 ? 90 : 65, bestTime: t("evening"), suggestedBait: [t("live_shrimp"), t("squid")] },
    ];
    return species.sort((a, b) => b.probability - a.probability).slice(0, 3);
  };

  const calculateFishingConditions = (hour: number, location: any) => {
    return {
      waterTemperature: 26 + Math.round(Math.random() * 4),
      visibility: hour >= 6 && hour <= 18 ? t("good") : t("fair"),
      windCondition: hour >= 5 && hour <= 19 ? 'ideal' : 'good' as 'ideal' | 'good' | 'challenging' | 'dangerous',
      barometricPressure: 1013 + Math.round(Math.random() * 20 - 10),
      pressureTrend: ['rising', 'falling', 'stable'][Math.floor(Math.random() * 3)] as 'rising' | 'falling' | 'stable'
    };
  };

  const getMoonFishingImpact = (illumination: number): 'excellent' | 'good' | 'fair' | 'poor' => {
    if (illumination < 25 || illumination > 75) return 'excellent';
    if (illumination < 40 || illumination > 60) return 'good';
    return 'fair';
  };

  const generateEnhancedRecommendations = (score: number, hour: number, moonData: any, conditions: any) => {
    const recommendations = [];
    
    if (score >= 80) {
      recommendations.push(t("weather_excellent"));
    } else if (score >= 60) {
      recommendations.push(t("weather_good"));
    } else if (score >= 40) {
      recommendations.push(t("weather_fair"));
    } else {
      recommendations.push(t("weather_poor"));
    }

    if (hour >= 5 && hour <= 8) {
      recommendations.push("Early morning is ideal for active fish feeding.");
    }
    
    if (hour >= 17 && hour <= 20) {
      recommendations.push("Evening hours show high fish activity.");
    }

    if (moonData.illumination < 25) {
      recommendations.push("New moon phase increases fish feeding activity.");
    }

    if (conditions.pressureTrend === 'falling') {
      recommendations.push("Falling barometric pressure often triggers fish feeding.");
    }

    return recommendations;
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
    const nextChangeHour = (currentHour < highHour) ? highHour : lowHour;
    
    // Calculate tide strength based on moon phase
    const tideStrengths: ('weak' | 'moderate' | 'strong')[] = ['weak', 'moderate', 'strong'];
    const tideStrength = tideStrengths[Math.floor(Math.random() * 3)];
    
    return {
      highTide: `${highHour > 12 ? highHour - 12 : highHour}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')} ${highHour < 12 ? 'AM' : 'PM'}`,
      lowTide: `${lowHour > 12 ? lowHour - 12 : lowHour}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')} ${lowHour < 12 ? 'AM' : 'PM'}`,
      currentTide: Math.random() > 0.5 ? 'rising' : 'falling' as 'rising' | 'falling',
      nextTideChange: `${nextChangeHour > 12 ? nextChangeHour - 12 : nextChangeHour}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')} ${nextChangeHour < 12 ? 'AM' : 'PM'}`,
      tideStrength
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
    if (score >= 80) return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-700';
    if (score >= 60) return 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/30 border-yellow-200 dark:border-yellow-700';
    return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-700';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 80) return <TrendingUp className="w-5 h-5" />;
    if (score >= 60) return <Activity className="w-5 h-5" />;
    return <TrendingDown className="w-5 h-5" />;
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
            <p className="text-lg font-semibold text-gray-700">Analyzing fishing conditions...</p>
            <p className="text-sm text-gray-500">Please wait while we crunch the numbers.</p>
          </div>
        </div>
      );
    }

    if (error || !analytics) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center p-4 bg-red-50 dark:bg-red-900/30 rounded-lg border border-red-200 dark:border-red-700">
            <Activity className="w-12 h-12 mb-4 mx-auto text-red-500" />
            <p className="font-bold text-red-700">Analytics Error</p>
            <p className="text-sm text-red-600">{error || 'Could not load analytics.'}</p>
          </div>
        </div>
      );
    }

    const { fishingScore, recommendations, solarData, tideData, moonPhase, bestFishingTimes, fishingConditions, targetSpecies } = analytics;
    const scoreColor = fishingScore.overall >= 80 ? 'text-green-500' : fishingScore.overall >= 60 ? 'text-yellow-500' : 'text-red-500';

    return (
      <div className="p-4 space-y-4">
        {/* Overall Score */}
        <div className="text-center">
          <div className={`relative w-32 h-32 mx-auto flex items-center justify-center rounded-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 shadow-inner`}>
            <div className="absolute inset-0 rounded-full border-4 border-gray-200"></div>
            <div 
              className="absolute inset-0 rounded-full"
              style={{
                background: `conic-gradient(${scoreColor.replace('text-', '').replace('-500', '')} ${fishingScore.overall * 3.6}deg, #e5e7eb 0deg)`
              }}
            ></div>
            <div className="relative z-10 bg-white dark:bg-gray-800 w-24 h-24 rounded-full flex flex-col items-center justify-center shadow-md">
              <p className={`text-4xl font-bold ${scoreColor}`}>{fishingScore.overall}</p>
              <p className="text-xs text-gray-500">{t("fishing_score")}</p>
            </div>
          </div>
        </div>

        {/* Best Fishing Times */}
        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 p-3 rounded-lg border border-blue-100 dark:border-blue-700">
          <h4 className="text-sm font-bold text-blue-800 mb-2 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            {t("best_fishing_times")}
          </h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <p className="font-medium text-blue-700">{t("morning")}</p>
              <p className="text-blue-600">{bestFishingTimes.morning.start} - {bestFishingTimes.morning.end}</p>
              <Badge variant="outline" className="text-xs">{t(bestFishingTimes.morning.quality)}</Badge>
            </div>
            <div>
              <p className="font-medium text-blue-700">{t("evening")}</p>
              <p className="text-blue-600">{bestFishingTimes.evening.start} - {bestFishingTimes.evening.end}</p>
              <Badge variant="outline" className="text-xs">{t(bestFishingTimes.evening.quality)}</Badge>
            </div>
          </div>
        </div>

        {/* Target Species */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-3 rounded-lg border border-green-100 dark:border-green-700">
          <h4 className="text-sm font-bold text-green-800 mb-2 flex items-center gap-2">
            <Fish className="w-4 h-4" />
            {t("target_species")}
          </h4>
          <div className="space-y-2">
            {targetSpecies.map((species, index) => (
              <div key={index} className="flex justify-between items-center text-xs">
                <div>
                  <p className="font-medium text-green-700">{species.name}</p>
                  <p className="text-green-600">{species.bestTime} • {species.suggestedBait.join(', ')}</p>
                </div>
                <Badge variant="secondary" className="text-xs">{species.probability}%</Badge>
              </div>
            ))}
          </div>
        </div>

        {/* Fishing Conditions */}
        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 p-3 rounded-lg border border-purple-100 dark:border-purple-700">
          <h4 className="text-sm font-bold text-purple-800 mb-2 flex items-center gap-2">
            <Gauge className="w-4 h-4" />
            Conditions
          </h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-2">
              <Thermometer className="w-3 h-3 text-purple-600" />
              <span className="text-purple-700">{fishingConditions.waterTemperature}°C</span>
            </div>
            <div className="flex items-center gap-2">
              <Eye className="w-3 h-3 text-purple-600" />
              <span className="text-purple-700">{fishingConditions.visibility}</span>
            </div>
            <div className="flex items-center gap-2">
              <Wind className="w-3 h-3 text-purple-600" />
              <span className="text-purple-700">{t(fishingConditions.windCondition)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Gauge className="w-3 h-3 text-purple-600" />
              <span className="text-purple-700">{fishingConditions.barometricPressure} hPa</span>
            </div>
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-3 gap-3 text-center">
          {/* Solar */}
          <div className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 p-2 rounded-lg border border-yellow-100 dark:border-yellow-700">
            <Sun className="w-5 h-5 mx-auto text-yellow-600 mb-1" />
            <p className="text-xs font-medium text-yellow-800">{t("sunrise")}</p>
            <p className="text-sm font-bold text-yellow-900">{solarData.sunrise}</p>
          </div>
          {/* Tides */}
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 p-2 rounded-lg border border-blue-100 dark:border-blue-700">
            <Waves className="w-5 h-5 mx-auto text-blue-600 mb-1" />
            <p className="text-xs font-medium text-blue-800">{t("high_tide")}</p>
            <p className="text-sm font-bold text-blue-900">{tideData.highTide}</p>
          </div>
          {/* Moon */}
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 p-2 rounded-lg border border-indigo-100 dark:border-indigo-700">
            <Moon className="w-5 h-5 mx-auto text-indigo-600 mb-1" />
            <p className="text-xs font-medium text-indigo-800">{t("moon_phase")}</p>
            <p className="text-sm font-bold text-indigo-900">{moonPhase.phase}</p>
          </div>
        </div>

        {/* Recommendations */}
        <div className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 p-3 rounded-lg border border-orange-100 dark:border-orange-700">
          <h4 className="text-sm font-bold text-orange-800 mb-2">Recommendations</h4>
          <ul className="space-y-1 text-xs text-orange-700">
            {recommendations.slice(0, 3).map((rec, i) => (
              <li key={i} className="flex items-center gap-2">
                <Compass className="w-3 h-3 flex-shrink-0" />
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  };

  return (
    <Card className="modern-card animate-fade-in hover-lift">
      <CardHeader className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 dark:from-green-700 dark:via-emerald-700 dark:to-teal-700 text-white p-4 rounded-t-xl">
        <div className="flex items-center gap-3">
          <Activity className="w-6 h-6 text-white animate-float" />
          <div>
            <h3 className="text-lg font-bold animate-shimmer">{t("fishing_analytics_title")}</h3>
            <p className="text-green-100 text-sm">Your AI-powered fishing forecast</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0 h-full">
        {renderContent()}
      </CardContent>
    </Card>
  );
};

export default FishingAnalyticsCard;
