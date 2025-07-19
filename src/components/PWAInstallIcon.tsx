'use client';

import { useState } from 'react';
import { Download, Smartphone, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from '@/components/ui/tooltip';
import { usePWAInstall } from '@/hooks/use-pwa-install';

export function PWAInstallIcon() {
  const { isInstallable, isInstalled, promptInstall } = usePWAInstall();
  const [isLoading, setIsLoading] = useState(false);

  const handleInstall = async () => {
    setIsLoading(true);
    try {
      const installed = await promptInstall();
      if (installed) {
        console.log('App installed successfully');
      }
    } catch (error) {
      console.error('Installation failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isInstalled) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="glass-button-outline text-green-600 dark:text-green-400 cursor-default"
              disabled
            >
              <Check className="w-5 h-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>App Installed ✓</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  if (!isInstallable) {
    return null;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleInstall}
            disabled={isLoading}
            className="glass-button-outline hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Download className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <div className="flex items-center gap-2">
            <Smartphone className="w-4 h-4" />
            <span>Install FisherMate.AI</span>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
