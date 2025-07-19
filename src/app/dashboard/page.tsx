'use client';

import { Fish, Map, Calendar, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PWAInstallPrompt } from '@/components/PWAInstallPrompt';
import { WeatherCard } from '@/components/WeatherCard';
import FishingAnalyticsCard from '@/components/FishingAnalyticsCard';
import { FishingJournal } from '@/components/fishing-journal/FishingJournal';
import { PopupChatbot } from '@/components/PopupChatbot';
import { VoiceControls } from '@/components/VoiceControls';
import ProtectedRoute from '@/components/ProtectedRoute';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { useNetworkStatus } from '@/hooks/use-offline';

export default function Dashboard() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const networkStatus = useNetworkStatus();

  const handleVoiceCommand = (transcript: string) => {
    const lowerTranscript = transcript.toLowerCase();
    
    if (lowerTranscript.includes('weather')) {
      document.querySelector('[data-section="weather"]')?.scrollIntoView({ behavior: 'smooth' });
    } else if (lowerTranscript.includes('journal') || lowerTranscript.includes('fishing log')) {
      document.querySelector('[data-section="journal"]')?.scrollIntoView({ behavior: 'smooth' });
    } else if (lowerTranscript.includes('analytics')) {
      document.querySelector('[data-section="analytics"]')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="container mx-auto px-4 py-8 space-y-8">
          {/* Welcome Header */}
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-3">
              <Fish className="w-12 h-12 text-blue-600" />
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                FisherMate.AI Dashboard
              </h1>
            </div>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Your comprehensive fishing companion with AI assistance, weather insights, and trip logging.
              {!networkStatus.online && ' Currently offline - using cached data.'}
            </p>
            {user && (
              <Badge variant="secondary" className="text-base px-4 py-2">
                Welcome back, {user.displayName || user.email}!
              </Badge>
            )}
          </div>

          {/* Voice Controls */}
          <Card className="glass-effect border-blue-200 dark:border-blue-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                Voice Assistant
              </CardTitle>
            </CardHeader>
            <CardContent>
              <VoiceControls onTranscript={handleVoiceCommand} />
            </CardContent>
          </Card>

          {/* PWA Install Prompt */}
          <PWAInstallPrompt />

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
              <Card className="glass-effect">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Map className="w-5 h-5" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => window.location.href = '/map'}
                  >
                    <Map className="w-4 h-4 mr-2" />
                    Find Fishing Spots
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => window.location.href = '/safety'}
                  >
                    <Fish className="w-4 h-4 mr-2" />
                    Safety Guidelines
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => window.location.href = '/laws'}
                  >
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Fishing Regulations
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => window.location.href = '/chat'}
                  >
                    <Calendar className="w-4 h-4 mr-2" />
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
