'use client';

import { Fish, Map, Shield, Scale, Bot, Sun, Wind, Droplets, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { WeatherCard } from '@/components/WeatherCard';
import FishingAnalyticsCard from '@/components/FishingAnalyticsCard';
import { FishingJournal } from '@/components/fishing-journal/FishingJournal';
import { GoogleVoiceAssistant } from '@/components/GoogleVoiceAssistant';
import ProtectedRoute from '@/components/ProtectedRoute';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { useNetworkStatus } from '@/hooks/use-offline';
import { useFishingLogs } from '@/hooks/use-fishing-logs';
import Link from 'next/link';

export default function Dashboard() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const networkStatus = useNetworkStatus();
  const { logs, addLog, syncOfflineLogs, isOnline, syncStatus, stats } = useFishingLogs();

  if (!user) {
    return null; // ProtectedRoute will handle the redirect
  }

  const handleVoiceCommand = (transcript: string) => {
    if (!transcript || typeof transcript !== 'string') {
      console.warn('Invalid transcript received:', transcript);
      return;
    }
    const lowerTranscript = transcript.toLowerCase();
    const scrollTo = (selector: string) => document.querySelector(selector)?.scrollIntoView({ behavior: 'smooth' });

    if (lowerTranscript.includes('weather')) scrollTo('[data-section="weather"]');
    else if (lowerTranscript.includes('journal') || lowerTranscript.includes('log')) scrollTo('[data-section="journal"]');
    else if (lowerTranscript.includes('analytics')) scrollTo('[data-section="analytics"]');
    else if (lowerTranscript.includes('map')) window.location.href = '/map';
    else if (lowerTranscript.includes('safety')) window.location.href = '/safety';
  };

  const quickActions = [
    { title: "Find Fishing Spots", href: "/map", icon: Map, color: "text-blue-500" },
    { title: "Safety Guidelines", href: "/safety", icon: Shield, color: "text-green-500" },
    { title: "Fishing Regulations", href: "/laws", icon: Scale, color: "text-purple-500" },
    { title: "AI Assistant", href: "/chat", icon: Bot, color: "text-indigo-500" },
  ];

  return (
    <ProtectedRoute>
      <div className="min-h-screen w-full bg-background gradient-bg text-foreground">
        <main className="container mx-auto px-4 py-8 space-y-8 animate-fade-in">
          
          {/* Welcome Header */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                Welcome, {user?.email?.split('@')[0] || 'Fisher'}!
              </h1>
              <p className="text-muted-foreground mt-2">
                Here's your dashboard for a successful day on the water.
              </p>
            </div>
            <div className="flex items-center gap-3">
                <Badge variant={networkStatus.online ? "default" : "destructive"} className="gap-2">
                    <div className={`w-2 h-2 rounded-full ${networkStatus.online ? 'bg-green-400' : 'bg-red-400'}`}></div>
                    {networkStatus.online ? "Online" : "Offline"}
                </Badge>
                <Badge variant="outline" className="gap-2">
                    {syncStatus === 'syncing' ? "🔄 Syncing..." : isOnline ? "☁️ Synced" : "💾 Saved Locally"}
                </Badge>
            </div>
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-8">
              {/* Voice Assistant */}
              <Card className="modern-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-xl">
                    <Bot className="w-6 h-6 text-primary" />
                    Voice Assistant
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Use voice commands to navigate. Try "show weather" or "open journal".
                  </p>
                  <ErrorBoundary fallback={<p className="text-destructive">Voice assistant is currently unavailable.</p>}>
                    <GoogleVoiceAssistant onTranscript={handleVoiceCommand} />
                  </ErrorBoundary>
                </CardContent>
              </Card>

              {/* Fishing Journal */}
              <div data-section="journal">
                <ErrorBoundary fallback={<Card className="modern-card"><CardContent><p>Could not load Fishing Journal.</p></CardContent></Card>}>
                  <FishingJournal />
                </ErrorBoundary>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-8">
              {/* Weather Card */}
              <div data-section="weather">
                <ErrorBoundary fallback={<Card className="modern-card"><CardContent><p>Could not load Weather Card.</p></CardContent></Card>}>
                  <WeatherCard />
                </ErrorBoundary>
              </div>

              {/* Analytics Card */}
              <div data-section="analytics">
                <ErrorBoundary fallback={<Card className="modern-card"><CardContent><p>Could not load Fishing Analytics.</p></CardContent></Card>}>
                  <FishingAnalyticsCard />
                </ErrorBoundary>
              </div>

              {/* Quick Actions */}
              <Card className="modern-card">
                <CardHeader>
                  <CardTitle className="text-xl">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                  {quickActions.map((action) => (
                    <Link href={action.href} key={action.title}>
                      <Button variant="outline" className="w-full h-24 flex flex-col items-center justify-center gap-2 text-center p-2 hover:bg-muted/50 transition-colors duration-200">
                        <action.icon className={`w-7 h-7 ${action.color}`} />
                        <span className="text-xs font-medium">{action.title}</span>
                      </Button>
                    </Link>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
