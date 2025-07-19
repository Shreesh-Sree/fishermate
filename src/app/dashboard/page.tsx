'use client';

import { Fish, Map, Calendar, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PWAInstallIcon } from '@/components/PWAInstallIcon';
import { WeatherCard } from '@/components/WeatherCard';
import FishingAnalyticsCard from '@/components/FishingAnalyticsCard';
import { FishingJournal } from '@/components/fishing-journal/FishingJournal';
import { PopupChatbot } from '@/components/PopupChatbot';
import { GoogleVoiceAssistant } from '@/components/GoogleVoiceAssistant';
import ProtectedRoute from '@/components/ProtectedRoute';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { useNetworkStatus } from '@/hooks/use-offline';

export default function Dashboard() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const networkStatus = useNetworkStatus();

  // Add safety checks for undefined values
  if (!user) {
    return null; // Let ProtectedRoute handle the redirect
  }

  if (!t) {
    return <div>Loading translations...</div>;
  }

  const handleVoiceCommand = (transcript: string) => {
    if (!transcript || typeof transcript !== 'string') {
      console.warn('Invalid transcript received:', transcript);
      return;
    }

    const lowerTranscript = transcript.toLowerCase();
    
    try {
      if (lowerTranscript.includes('weather')) {
        document.querySelector('[data-section="weather"]')?.scrollIntoView({ behavior: 'smooth' });
      } else if (lowerTranscript.includes('journal') || lowerTranscript.includes('fishing log')) {
        document.querySelector('[data-section="journal"]')?.scrollIntoView({ behavior: 'smooth' });
      } else if (lowerTranscript.includes('analytics')) {
        document.querySelector('[data-section="analytics"]')?.scrollIntoView({ behavior: 'smooth' });
      }
    } catch (error) {
      console.error('Error handling voice command:', error);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-blue-50/50 via-white to-cyan-50/50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900/20">
        <div className="container mx-auto px-4 py-8 space-y-8">
          {/* Welcome Header */}
          <div className="text-center space-y-6">
            <div className="flex items-center justify-center gap-4">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-200/50 dark:border-blue-500/30 backdrop-blur-sm">
                <Fish className="w-10 h-10 text-blue-600 dark:text-blue-400" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-700 bg-clip-text text-transparent">
                FisherMate.AI
              </h1>
            </div>
            <div className="space-y-2">
              <h2 className="text-xl md:text-2xl font-semibold text-gray-800 dark:text-gray-100">
                Welcome back, {user?.email?.split('@')[0] || 'Fisher'}! 🎣
              </h2>
              <p className="text-base md:text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
                Your comprehensive fishing companion with AI assistance, weather insights, and comprehensive trip logging.
                {!networkStatus.online && (
                  <span className="block mt-2 text-amber-600 dark:text-amber-400 font-medium">
                    📡 Currently offline - using cached data
                  </span>
                )}
              </p>
            </div>
            
            {/* Status Indicators */}
            <div className="flex justify-center gap-4 flex-wrap">
              <Badge variant={networkStatus.online ? "default" : "secondary"} className="text-xs px-3 py-1">
                {networkStatus.online ? "🟢 Online" : "🔴 Offline"}
              </Badge>
              <Badge variant="outline" className="text-xs px-3 py-1">
                🌊 Ready to Fish
              </Badge>
              <Badge variant="outline" className="text-xs px-3 py-1">
                ✨ AI Powered
              </Badge>
            </div>
          </div>

          {/* Voice Controls */}
          <Card className="glass-effect border-blue-200/50 dark:border-blue-500/30 shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-lg">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-lg"></div>
                <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                  🎤 Voice Assistant
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ErrorBoundary fallback={
                <div className="text-center p-4">
                  <p className="text-muted-foreground">Voice Assistant temporarily unavailable</p>
                </div>
              }>
                <GoogleVoiceAssistant onTranscript={handleVoiceCommand} />
              </ErrorBoundary>
            </CardContent>
          </Card>

          {/* PWA Install Icon in Header */}
          <div className="flex justify-center">
            <PWAInstallIcon />
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Weather & Quick Actions */}
            <div className="space-y-6">
              {/* Weather Card */}
              <div data-section="weather">
                <ErrorBoundary>
                  <WeatherCard />
                </ErrorBoundary>
              </div>

              {/* Quick Actions */}
              <Card className="glass-effect shadow-lg border-white/20 dark:border-white/10">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3 text-lg">
                    <div className="p-2 rounded-lg bg-gradient-to-r from-green-500/20 to-blue-500/20">
                      <Map className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                    <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                      🚀 Quick Actions
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start h-12 glass-button-outline hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200"
                    onClick={() => window.location.href = '/map'}
                  >
                    <Map className="w-4 h-4 mr-3" />
                    Find Fishing Spots
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start h-12 glass-button-outline hover:bg-green-50 dark:hover:bg-green-900/20 transition-all duration-200"
                    onClick={() => window.location.href = '/safety'}
                  >
                    <Fish className="w-4 h-4 mr-3" />
                    Safety Guidelines
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start h-12 glass-button-outline hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all duration-200"
                    onClick={() => window.location.href = '/laws'}
                  >
                    <TrendingUp className="w-4 h-4 mr-3" />
                    Fishing Regulations
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start h-12 glass-button-outline hover:bg-cyan-50 dark:hover:bg-cyan-900/20 transition-all duration-200"
                    onClick={() => window.location.href = '/chat'}
                  >
                    <Calendar className="w-4 h-4 mr-3" />
                    AI Assistant
                  </Button>
                </CardContent>
              </Card>

              {/* Analytics Summary */}
              <div data-section="analytics">
                <ErrorBoundary>
                  <FishingAnalyticsCard />
                </ErrorBoundary>
              </div>
            </div>

            {/* Right Column - Fishing Journal */}
            <div className="lg:col-span-2 space-y-6">
              <div data-section="journal">
                <ErrorBoundary>
                  <FishingJournal />
                </ErrorBoundary>
              </div>
            </div>
          </div>

          {/* Additional Features Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="glass-effect border-green-200 dark:border-green-700">
              <CardHeader>
                <CardTitle className="text-green-700 dark:text-green-300">
                  🌊 Today's Fishing Conditions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Water Temperature:</span>
                    <Badge variant="outline">18°C</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Best Fishing Time:</span>
                    <Badge variant="outline">6:00 AM - 8:00 AM</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Moon Phase:</span>
                    <Badge variant="outline">🌗 Last Quarter</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Tidal Activity:</span>
                    <Badge variant="outline">Moderate</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-effect border-yellow-200 dark:border-yellow-700">
              <CardHeader>
                <CardTitle className="text-yellow-700 dark:text-yellow-300">
                  📊 This Week's Stats
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Trips Logged:</span>
                    <Badge variant="outline">3</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Catches:</span>
                    <Badge variant="outline">12 fish</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Success Rate:</span>
                    <Badge variant="outline">75%</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Favorite Spot:</span>
                    <Badge variant="outline">Mirror Lake</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-effect border-purple-200 dark:border-purple-700">
              <CardHeader>
                <CardTitle className="text-purple-700 dark:text-purple-300">
                  🎯 Goals & Achievements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Monthly Goal:</span>
                    <Badge variant="outline">8/10 trips</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>New Species:</span>
                    <Badge variant="outline">2 discovered</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Streak:</span>
                    <Badge variant="outline">5 days 🔥</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Next Badge:</span>
                    <Badge variant="outline">Explorer 🗺️</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Floating Chatbot */}
        <PopupChatbot />
      </div>
    </ProtectedRoute>
  );
}
