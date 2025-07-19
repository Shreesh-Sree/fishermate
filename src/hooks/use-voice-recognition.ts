'use client';

import { useState, useRef, useEffect } from 'react';

// Extend the Window interface for Speech Recognition
declare global {
  interface Window {
    SpeechRecognition?: any;
    webkitSpeechRecognition?: any;
  }
}

interface VoiceRecognitionHook {
  isListening: boolean;
  transcript: string;
  isSupported: boolean;
  startListening: () => void;
  stopListening: () => void;
  clearTranscript: () => void;
  confidence: number;
}

export const useVoiceRecognition = (): VoiceRecognitionHook => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [confidence, setConfidence] = useState(0);
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Ensure we're in the browser environment
    if (typeof window === 'undefined') {
      return;
    }

    // Check if speech recognition is supported
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      setIsSupported(true);
      
      try {
        recognitionRef.current = new SpeechRecognition();
        
        const recognition = recognitionRef.current;
        recognition.continuous = false; // Changed to false for better reliability
        recognition.interimResults = true;
        recognition.lang = 'en-US';
        recognition.maxAlternatives = 1; // Add for better performance
        
        recognition.onstart = () => {
          console.log('Speech recognition started');
        };
        
        recognition.onresult = (event: any) => {
          let finalTranscript = '';
          let interimTranscript = '';
          
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const result = event.results[i];
            if (result.isFinal) {
              finalTranscript += result[0].transcript;
              setConfidence(result[0].confidence || 0.8);
            } else {
              interimTranscript += result[0].transcript;
            }
          }
          
          const transcript = finalTranscript || interimTranscript;
          if (transcript.trim()) {
            setTranscript(transcript.trim());
          }
        };
        
        recognition.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
          if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
            alert('Microphone access denied. Please enable microphone permissions and try again.');
          }
          setIsListening(false);
        };
        
        recognition.onend = () => {
          console.log('Speech recognition ended');
          setIsListening(false);
        };
      } catch (error) {
        console.error('Failed to initialize speech recognition:', error);
        setIsSupported(false);
      }
    } else {
      setIsSupported(false);
      console.log('Speech recognition not supported in this browser');
    }
  }, []);

  const startListening = () => {
    if (recognitionRef.current && !isListening && isSupported) {
      try {
        setIsListening(true);
        setTranscript('');
        recognitionRef.current.start();
      } catch (error) {
        console.error('Error starting speech recognition:', error);
        setIsListening(false);
      }
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      try {
        recognitionRef.current.stop();
        setIsListening(false);
      } catch (error) {
        console.error('Error stopping speech recognition:', error);
        setIsListening(false);
      }
    }
  };

  const clearTranscript = () => {
    setTranscript('');
    setConfidence(0);
  };

  return {
    isListening,
    transcript,
    isSupported,
    startListening,
    stopListening,
    clearTranscript,
    confidence,
  };
};
