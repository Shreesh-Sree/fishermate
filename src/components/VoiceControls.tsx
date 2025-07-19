'use client';

import { useState, useEffect } from 'react';
import { Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useVoiceRecognition } from '@/hooks/use-voice-recognition';
import { useLanguage } from '@/context/LanguageContext';

interface VoiceControlsProps {
  onTranscript: (text: string) => void;
  isProcessing?: boolean;
}

export function VoiceControls({ onTranscript, isProcessing = false }: VoiceControlsProps) {
  const { t } = useLanguage();
  const {
    isListening,
    transcript,
    isSupported,
    startListening,
    stopListening,
    clearTranscript,
    confidence
  } = useVoiceRecognition();

  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);

  useEffect(() => {
    setSpeechSupported('speechSynthesis' in window);
  }, []);

  useEffect(() => {
    if (transcript && !isListening) {
      onTranscript(transcript);
      clearTranscript();
    }
  }, [transcript, isListening, onTranscript, clearTranscript]);

  const handleToggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const speakText = (text: string) => {
    if (!speechSupported || isSpeaking) return;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US'; // We'll make this dynamic
    utterance.rate = 0.8;
    utterance.pitch = 1;
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  if (!isSupported) {
    return (
      <Card className="glass-effect border-yellow-200 dark:border-yellow-700">
        <CardContent className="p-4 text-center">
          <p className="text-sm text-yellow-700 dark:text-yellow-300">
            Voice recognition is not supported in this browser. Please use Chrome, Edge, or Safari for voice features.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-center space-x-4">
        {/* Voice Input Control */}
        <div className="flex flex-col items-center space-y-2">
          <Button
            onClick={handleToggleListening}
            disabled={isProcessing}
            variant={isListening ? "destructive" : "default"}
            size="lg"
            className={`relative ${
              isListening 
                ? "bg-red-500 hover:bg-red-600 animate-pulse" 
                : "bg-blue-500 hover:bg-blue-600"
            }`}
          >
            {isListening ? (
              <MicOff className="h-5 w-5" />
            ) : (
              <Mic className="h-5 w-5" />
            )}
            {isListening && (
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
              </span>
            )}
          </Button>
          <span className="text-xs text-center">
            {isListening ? "Stop Listening" : "Start Voice"}
          </span>
        </div>

        {/* Text-to-Speech Control */}
        {speechSupported && (
          <div className="flex flex-col items-center space-y-2">
            <Button
              onClick={isSpeaking ? stopSpeaking : () => speakText("Voice output is ready")}
              variant={isSpeaking ? "destructive" : "outline"}
              size="lg"
              className={isSpeaking ? "animate-pulse" : ""}
            >
              {isSpeaking ? (
                <VolumeX className="h-5 w-5" />
              ) : (
                <Volume2 className="h-5 w-5" />
              )}
            </Button>
            <span className="text-xs text-center">
              {isSpeaking ? "Stop Audio" : "Test Audio"}
            </span>
          </div>
        )}
      </div>

      {/* Voice Status */}
      {(isListening || transcript) && (
        <Card className="glass-effect border-blue-200 dark:border-blue-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Badge variant={isListening ? "destructive" : "secondary"}>
                {isListening ? "Listening..." : "Processing"}
              </Badge>
              {confidence > 0 && (
                <Badge variant="outline">
                  {Math.round(confidence * 100)}% confident
                </Badge>
              )}
            </div>
            {transcript && (
              <p className="text-sm bg-muted/50 p-3 rounded-lg">
                "{transcript}"
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Quick Voice Commands Help */}
      <Card className="glass-effect border-green-200 dark:border-green-700">
        <CardContent className="p-3">
          <h4 className="text-sm font-medium text-green-700 dark:text-green-300 mb-2">
            Voice Commands:
          </h4>
          <div className="text-xs text-green-600 dark:text-green-400 space-y-1">
            <p>• "What's the weather like?"</p>
            <p>• "Show me fishing laws"</p>
            <p>• "Find nearby fishing spots"</p>
            <p>• "Safety guidelines"</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
