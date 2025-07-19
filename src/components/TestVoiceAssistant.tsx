'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useVoiceRecognition } from '@/hooks/use-voice-recognition';

export function TestVoiceAssistant() {
  const {
    isListening,
    transcript,
    isSupported,
    startListening,
    stopListening
  } = useVoiceRecognition();

  const handleTest = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const handleClear = () => {
    // For now, just stop and restart to clear
    if (isListening) {
      stopListening();
      setTimeout(() => startListening(), 100);
    }
  };

  return (
    <Card className="glass-card border-purple-200/50 dark:border-purple-500/30 shadow-lg">
      <CardHeader>
        <CardTitle className="text-purple-700 dark:text-purple-300">
          🎙️ Voice Assistant Test Panel
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isSupported ? (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-700 dark:text-red-300">
              ❌ Speech recognition is not supported in this browser.
            </p>
          </div>
        ) : (
          <>
            <div className="flex gap-4">
              <Button 
                onClick={handleTest}
                variant={isListening ? "destructive" : "default"}
                className="glass-button"
              >
                {isListening ? "🛑 Stop Listening" : "🎤 Start Listening"}
              </Button>
              <Button 
                onClick={handleClear}
                variant="outline"
                className="glass-button"
              >
                🗑️ Clear
              </Button>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Status: 
                <span className={`ml-2 px-2 py-1 rounded text-xs ${
                  isListening 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
                }`}>
                  {isListening ? '🟢 Listening...' : '⭕ Stopped'}
                </span>
              </label>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Transcript:
              </label>
              <div className="min-h-[100px] p-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg">
                <p className="text-gray-800 dark:text-gray-200">
                  {transcript || 'Start speaking to see your words here...'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2">Test Commands:</h4>
                <ul className="text-sm text-blue-700 dark:text-blue-400 space-y-1">
                  <li>• "Show weather"</li>
                  <li>• "Open journal"</li>
                  <li>• "Show analytics"</li>
                  <li>• "Navigate to safety"</li>
                </ul>
              </div>
              
              <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <h4 className="font-medium text-green-800 dark:text-green-300 mb-2">Browser Support:</h4>
                <ul className="text-sm text-green-700 dark:text-green-400 space-y-1">
                  <li>• Chrome: ✅ Full Support</li>
                  <li>• Edge: ✅ Full Support</li>
                  <li>• Safari: ⚠️ Limited</li>
                  <li>• Firefox: ❌ Not Supported</li>
                </ul>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
