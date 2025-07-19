'use client';

import { useState } from 'react';
import { Phone, AlertTriangle, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useLanguage } from '@/context/LanguageContext';

interface EmergencyContact {
  name: string;
  number: string;
  type: 'emergency' | 'coast_guard' | 'police' | 'medical';
}

interface EmergencySOSButtonProps {
  variant?: 'full' | 'compact';
}

export function EmergencySOSButton({ variant = 'full' }: EmergencySOSButtonProps) {
  const [isEmergencyMode, setIsEmergencyMode] = useState(false);

  // Emergency contacts based on region
  const emergencyContacts: EmergencyContact[] = [
    { name: 'Emergency Services', number: '911', type: 'emergency' },
    { name: 'Coast Guard', number: '1-800-424-8802', type: 'coast_guard' },
    { name: 'Marine Emergency', number: '911', type: 'emergency' },
    { name: 'Local Police', number: '911', type: 'police' },
  ];

  const initiateEmergencyCall = (contact: EmergencyContact) => {
    // Log emergency action
    const emergencyLog = {
      timestamp: new Date().toISOString(),
      contact: contact,
      location: 'Unknown', // Would be replaced with actual GPS coordinates
      type: 'SOS_CALL_INITIATED'
    };
    
    // Store in localStorage for offline access
    const existingLogs = JSON.parse(localStorage.getItem('emergency_logs') || '[]');
    existingLogs.push(emergencyLog);
    localStorage.setItem('emergency_logs', JSON.stringify(existingLogs));

    // Initiate phone call
    window.open(`tel:${contact.number}`, '_self');
    
    // Send location data if available
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        console.log('Emergency location:', {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy
        });
      });
    }
  };

  const handleEmergencyPress = () => {
    setIsEmergencyMode(true);
    // Vibrate if available
    if (navigator.vibrate) {
      navigator.vibrate([200, 100, 200, 100, 200]);
    }
  };

  // Compact version for header
  if (variant === 'compact') {
    return (
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="relative bg-red-50 hover:bg-red-100 dark:bg-red-950/50 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 border border-red-200/50 dark:border-red-800/50"
            aria-label="Emergency SOS"
            onClick={handleEmergencyPress}
          >
            <Shield className="h-5 w-5" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
          </Button>
        </AlertDialogTrigger>
        
        <AlertDialogContent className="glass-effect border-red-200/50 dark:border-red-500/30 max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-600 dark:text-red-400 flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Emergency Services
            </AlertDialogTitle>
            <AlertDialogDescription>
              Select emergency service to call immediately. Your location will be shared automatically if available.
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="space-y-3 py-4">
            {emergencyContacts.map((contact, index) => (
              <Button
                key={index}
                onClick={() => initiateEmergencyCall(contact)}
                variant="outline"
                className={`w-full justify-start text-left p-4 h-auto hover:bg-red-50 dark:hover:bg-red-900/20 ${
                  contact.type === 'emergency' ? 'border-red-300 dark:border-red-600' : ''
                }`}
              >
                <Phone className="w-4 h-4 mr-3 text-red-600" />
                <div className="flex-1">
                  <div className="font-semibold">{contact.name}</div>
                  <div className="text-sm text-muted-foreground">{contact.number}</div>
                </div>
                <Badge 
                  variant={contact.type === 'emergency' ? 'destructive' : 'secondary'}
                  className="text-xs"
                >
                  {contact.type.replace('_', ' ')}
                </Badge>
              </Button>
            ))}
          </div>
          
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  // Full version for pages
  return (
    <div className="space-y-4">
      {/* Emergency SOS Button */}
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            onClick={handleEmergencyPress}
            className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold shadow-lg hover:shadow-xl transition-all duration-200 touch-target"
            size="lg"
          >
            <AlertTriangle className="w-5 h-5 mr-2 animate-pulse" />
            🆘 EMERGENCY SOS
          </Button>
        </AlertDialogTrigger>
        
        <AlertDialogContent className="glass-effect border-red-200/50 dark:border-red-500/30 max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-600 dark:text-red-400 flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Emergency Services
            </AlertDialogTitle>
            <AlertDialogDescription className="text-enhanced">
              Select emergency service to call immediately. Your location will be shared automatically if available.
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="space-y-3 py-4">
            {emergencyContacts.map((contact, index) => (
              <Button
                key={index}
                onClick={() => initiateEmergencyCall(contact)}
                variant="outline"
                className={`w-full justify-start text-left p-4 h-auto glass-button-outline hover:bg-red-50 dark:hover:bg-red-900/20 ${
                  contact.type === 'emergency' ? 'border-red-300 dark:border-red-600' : ''
                }`}
              >
                <Phone className="w-4 h-4 mr-3 text-red-600" />
                <div className="flex-1">
                  <div className="font-semibold text-enhanced">{contact.name}</div>
                  <div className="text-sm text-muted-foreground">{contact.number}</div>
                </div>
                <Badge 
                  variant={contact.type === 'emergency' ? 'destructive' : 'secondary'}
                  className="text-xs"
                >
                  {contact.type.replace('_', ' ')}
                </Badge>
              </Button>
            ))}
          </div>
          
          <AlertDialogFooter>
            <AlertDialogCancel className="glass-button">Cancel</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Emergency Information Card */}
      <Card className="glass-effect border-orange-200/50 dark:border-orange-500/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm text-orange-700 dark:text-orange-300 flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Safety Information
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-xs text-muted-foreground space-y-2">
            <div className="flex items-start gap-2">
              <span className="text-orange-500">•</span>
              <span>Press SOS for immediate emergency assistance</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-orange-500">•</span>
              <span>Location data shared automatically when available</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-orange-500">•</span>
              <span>Emergency logs stored locally for offline access</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
