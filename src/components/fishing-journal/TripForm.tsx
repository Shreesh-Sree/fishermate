'use client';

import { useState } from 'react';
import { X, MapPin, Calendar, Clock, Fish, Camera, Mic, Save } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { FishingTrip, Catch, WeatherConditions, WaterConditions } from '@/types/fishing-journal';
import { VoiceControls } from '../VoiceControls';

interface TripFormProps {
  onSave: (trip: Omit<FishingTrip, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => void;
  onClose: () => void;
}

export function TripForm({ onSave, onClose }: TripFormProps) {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    startTime: '06:00',
    endTime: '12:00',
    location: {
      name: '',
      coordinates: { lat: 0, lng: 0 },
      waterBody: 'lake' as const,
      access: 'public' as const,
    },
    weather: {
      temperature: 20,
      conditions: 'sunny' as const,
      windSpeed: 5,
      windDirection: 'north' as const,
      humidity: 60,
      pressure: 1013,
    },
    waterConditions: {
      temperature: 18,
      clarity: 'clear' as const,
      level: 'normal' as const,
      current: 'slow' as const,
    },
    catches: [] as Catch[],
    techniques: [] as string[],
    baits: [] as string[],
    equipment: [] as string[],
    companions: [] as string[],
    successScore: 5,
    notes: '',
    photos: [] as string[],
  });

  const [newCatch, setNewCatch] = useState({
    species: '',
    quantity: 1,
    weight: 0,
    length: 0,
    method: 'rod',
    bait: '',
    timeOfCatch: '',
    released: false,
    location: '',
    notes: '',
  });

  const calculateDuration = () => {
    const start = new Date(`2000-01-01T${formData.startTime}`);
    const end = new Date(`2000-01-01T${formData.endTime}`);
    return Math.max(0, (end.getTime() - start.getTime()) / (1000 * 60)); // in minutes
  };

  const handleAddCatch = () => {
    if (newCatch.species) {
      setFormData(prev => ({
        ...prev,
        catches: [...prev.catches, { ...newCatch, id: Date.now().toString() }]
      }));
      setNewCatch({
        species: '',
        quantity: 1,
        weight: 0,
        length: 0,
        method: 'rod',
        bait: '',
        timeOfCatch: '',
        released: false,
        location: '',
        notes: '',
      });
    }
  };

  const handleRemoveCatch = (index: number) => {
    setFormData(prev => ({
      ...prev,
      catches: prev.catches.filter((_, i) => i !== index)
    }));
  };

  const handleAddItem = (field: 'techniques' | 'baits' | 'equipment' | 'companions', value: string) => {
    if (value.trim()) {
      setFormData(prev => ({
        ...prev,
        [field]: [...prev[field], value.trim()]
      }));
    }
  };

  const handleRemoveItem = (field: 'techniques' | 'baits' | 'equipment' | 'companions', index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const handleVoiceInput = (transcript: string) => {
    const lowerTranscript = transcript.toLowerCase();
    
    // Voice commands for quick data entry
    if (lowerTranscript.includes('caught')) {
      // Parse "caught 2 bass" or "caught one trout"
      const fishMatch = lowerTranscript.match(/caught\s+(\d+|one|two|three|four|five)\s+(\w+)/);
      if (fishMatch) {
        const quantity = fishMatch[1] === 'one' ? 1 : 
                        fishMatch[1] === 'two' ? 2 :
                        fishMatch[1] === 'three' ? 3 :
                        fishMatch[1] === 'four' ? 4 :
                        fishMatch[1] === 'five' ? 5 :
                        parseInt(fishMatch[1]) || 1;
        const species = fishMatch[2];
        
        setNewCatch(prev => ({
          ...prev,
          species: species,
          quantity: quantity,
        }));
      }
    } else if (lowerTranscript.includes('location')) {
      // Parse "location is lake tahoe" or "at mirror lake"
      const locationMatch = lowerTranscript.match(/(?:location|at)\s+(?:is\s+)?(.+)/);
      if (locationMatch) {
        setFormData(prev => ({
          ...prev,
          location: { ...prev.location, name: locationMatch[1] }
        }));
      }
    } else if (lowerTranscript.includes('weather')) {
      // Parse weather conditions
      if (lowerTranscript.includes('sunny')) {
        setFormData(prev => ({
          ...prev,
          weather: { ...prev.weather, conditions: 'sunny' }
        }));
      } else if (lowerTranscript.includes('cloudy')) {
        setFormData(prev => ({
          ...prev,
          weather: { ...prev.weather, conditions: 'cloudy' }
        }));
      } else if (lowerTranscript.includes('rainy')) {
        setFormData(prev => ({
          ...prev,
          weather: { ...prev.weather, conditions: 'rainy' }
        }));
      }
    }
  };

  const handleSubmit = () => {
    if (!formData.location.name) {
      alert('Please enter a location name');
      return;
    }

    const trip = {
      ...formData,
      duration: calculateDuration(),
    };

    onSave(trip);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <Card className="glass-effect max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Log Fishing Trip</CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
          {/* Voice Controls for quick data entry */}
          <VoiceControls onTranscript={handleVoiceInput} />
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="startTime">Start Time</Label>
              <Input
                id="startTime"
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="endTime">End Time</Label>
              <Input
                id="endTime"
                type="time"
                value={formData.endTime}
                onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
              />
            </div>
          </div>

          {/* Location */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Location
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="locationName">Location Name *</Label>
                <Input
                  id="locationName"
                  placeholder="e.g., Lake Tahoe, Bass Pond"
                  value={formData.location.name}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    location: { ...prev.location, name: e.target.value }
                  }))}
                />
              </div>
              <div>
                <Label htmlFor="waterBody">Water Body Type</Label>
                <Select
                  value={formData.location.waterBody}
                  onValueChange={(value: any) => setFormData(prev => ({
                    ...prev,
                    location: { ...prev.location, waterBody: value }
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lake">Lake</SelectItem>
                    <SelectItem value="river">River</SelectItem>
                    <SelectItem value="ocean">Ocean</SelectItem>
                    <SelectItem value="pond">Pond</SelectItem>
                    <SelectItem value="stream">Stream</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Weather */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Weather Conditions</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="weatherConditions">Conditions</Label>
                <Select
                  value={formData.weather.conditions}
                  onValueChange={(value: any) => setFormData(prev => ({
                    ...prev,
                    weather: { ...prev.weather, conditions: value }
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sunny">Sunny</SelectItem>
                    <SelectItem value="cloudy">Cloudy</SelectItem>
                    <SelectItem value="overcast">Overcast</SelectItem>
                    <SelectItem value="rainy">Rainy</SelectItem>
                    <SelectItem value="stormy">Stormy</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Temperature: {formData.weather.temperature}°C</Label>
                <Slider
                  value={[formData.weather.temperature]}
                  onValueChange={(value) => setFormData(prev => ({
                    ...prev,
                    weather: { ...prev.weather, temperature: value[0] }
                  }))}
                  min={-10}
                  max={40}
                  step={1}
                  className="mt-2"
                />
              </div>
              <div>
                <Label>Wind Speed: {formData.weather.windSpeed} mph</Label>
                <Slider
                  value={[formData.weather.windSpeed]}
                  onValueChange={(value) => setFormData(prev => ({
                    ...prev,
                    weather: { ...prev.weather, windSpeed: value[0] }
                  }))}
                  min={0}
                  max={30}
                  step={1}
                  className="mt-2"
                />
              </div>
            </div>
          </div>

          {/* Catches */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Fish className="w-5 h-5" />
              Catches
            </h3>
            
            {/* Add New Catch */}
            <Card className="p-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Input
                  placeholder="Species"
                  value={newCatch.species}
                  onChange={(e) => setNewCatch(prev => ({ ...prev, species: e.target.value }))}
                />
                <Input
                  type="number"
                  placeholder="Quantity"
                  value={newCatch.quantity}
                  onChange={(e) => setNewCatch(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
                />
                <Input
                  type="number"
                  step="0.1"
                  placeholder="Weight (lbs)"
                  value={newCatch.weight || ''}
                  onChange={(e) => setNewCatch(prev => ({ ...prev, weight: parseFloat(e.target.value) || 0 }))}
                />
                <Button onClick={handleAddCatch} size="sm">
                  Add Catch
                </Button>
              </div>
            </Card>

            {/* Existing Catches */}
            {formData.catches.length > 0 && (
              <div className="space-y-2">
                {formData.catches.map((catch_, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded">
                    <Badge variant="outline">
                      {catch_.quantity}x {catch_.species}
                    </Badge>
                    {catch_.weight > 0 && (
                      <Badge variant="secondary">
                        {catch_.weight} lbs
                      </Badge>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveCatch(index)}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Success Score */}
          <div>
            <Label>Trip Success Score: {formData.successScore}/10</Label>
            <Slider
              value={[formData.successScore]}
              onValueChange={(value) => setFormData(prev => ({ ...prev, successScore: value[0] }))}
              min={1}
              max={10}
              step={1}
              className="mt-2"
            />
          </div>

          {/* Notes */}
          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Any observations, lessons learned, or memorable moments..."
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              rows={3}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} className="bg-blue-600 hover:bg-blue-700">
              <Save className="w-4 h-4 mr-2" />
              Save Trip
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
