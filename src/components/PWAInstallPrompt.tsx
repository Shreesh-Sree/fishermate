'use client';

import { Download, Smartphone, Wifi, WifiOff, Signal } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { usePWAInstall } from '@/hooks/use-pwa-install';
import { useNetworkStatus } from '@/hooks/use-offline';

export function PWAInstallPrompt() {
  const { isInstallable, isInstalled, promptInstall } = usePWAInstall();
  const networkStatus = useNetworkStatus();

  const handleInstall = async () => {
    const installed = await promptInstall();
    if (installed) {
      console.log('App installed successfully');
    }
  };

  const getConnectionQuality = () => {
    if (!networkStatus.online) return { level: 'offline', color: 'text-red-500', label: 'Offline' };
    if (!networkStatus.effectiveType) return { level: 'unknown', color: 'text-gray-500', label: 'Online' };
    
    switch (networkStatus.effectiveType) {
      case '4g':
        return { level: 'excellent', color: 'text-green-500', label: 'Excellent' };
      case '3g':
        return { level: 'good', color: 'text-yellow-500', label: 'Good' };
      case '2g':
        return { level: 'slow', color: 'text-orange-500', label: 'Slow' };
      default:
        return { level: 'unknown', color: 'text-gray-500', label: 'Online' };
    }
  };

  const connectionInfo = getConnectionQuality();

  if (isInstalled) {
    return (
      <Card className="glass-effect border-green-200 dark:border-green-700">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Smartphone className="w-5 h-5 text-green-600" />
            <div className="flex-1">
              <p className="font-medium text-green-800 dark:text-green-200">
                App Installed Successfully!
              </p>
              <p className="text-sm text-green-600 dark:text-green-400">
                You can now use FisherMate.AI offline and access it from your home screen.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Network Status */}
      <Card className="glass-effect">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {networkStatus.online ? (
                <Wifi className={`w-5 h-5 ${connectionInfo.color}`} />
              ) : (
                <WifiOff className="w-5 h-5 text-red-500" />
              )}
              <div>
                <p className="font-medium">
                  {networkStatus.online ? 'Connected' : 'Offline Mode'}
                </p>
                <p className="text-sm text-gray-600">
                  {networkStatus.online ? `${connectionInfo.label} Connection` : 'Using cached data'}
                </p>
              </div>
            </div>
            <Badge variant={networkStatus.online ? 'default' : 'destructive'}>
              {networkStatus.online ? 'Online' : 'Offline'}
            </Badge>
          </div>
          
          {networkStatus.online && networkStatus.effectiveType && (
            <div className="mt-3 grid grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Type:</span>
                <p className="font-medium">{networkStatus.effectiveType.toUpperCase()}</p>
              </div>
              {networkStatus.downlink && (
                <div>
                  <span className="text-gray-600">Speed:</span>
                  <p className="font-medium">{networkStatus.downlink} Mbps</p>
                </div>
              )}
              {networkStatus.rtt && (
                <div>
                  <span className="text-gray-600">Latency:</span>
                  <p className="font-medium">{networkStatus.rtt}ms</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* PWA Install Prompt */}
      {isInstallable && (
        <Card className="glass-effect border-blue-200 dark:border-blue-700">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Download className="w-5 h-5 text-blue-600" />
              Install FisherMate.AI App
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">
              Get the full FisherMate.AI experience! Install our app for:
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <WifiOff className="w-4 h-4 text-green-600" />
                <span>Offline access</span>
              </div>
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-blue-600" />
                <span>Home screen access</span>
              </div>
              <div className="flex items-center gap-2">
                <Signal className="w-4 h-4 text-purple-600" />
                <span>Faster performance</span>
              </div>
              <div className="flex items-center gap-2">
                <Download className="w-4 h-4 text-orange-600" />
                <span>No app store needed</span>
              </div>
            </div>

            <Button onClick={handleInstall} className="w-full bg-blue-600 hover:bg-blue-700">
              <Download className="w-4 h-4 mr-2" />
              Install App
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Offline Features Info */}
      {!networkStatus.online && (
        <Alert className="border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20">
          <WifiOff className="h-4 w-4" />
          <AlertDescription>
            <strong>Offline Mode Active:</strong> You can still view cached fishing data, 
            weather information, and safety tips. New data will sync when you reconnect.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
