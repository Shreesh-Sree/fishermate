'use client';

import { TrendingUp, MapPin, Trophy, Target, Calendar, Fish, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { FishingAnalytics } from '@/types/fishing-journal';

interface TripAnalyticsProps {
  analytics: FishingAnalytics;
}

export function TripAnalytics({ analytics }: TripAnalyticsProps) {
  const getSuccessColor = (score: number) => {
    if (score >= 8) return 'text-green-600';
    if (score >= 6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getSuccessLevel = (score: number) => {
    if (score >= 8) return 'Excellent';
    if (score >= 6) return 'Good';
    if (score >= 4) return 'Fair';
    return 'Poor';
  };

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="glass-effect">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Trips</p>
                <p className="text-2xl font-bold">{analytics.totalTrips}</p>
              </div>
              <Calendar className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-effect">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Catches</p>
                <p className="text-2xl font-bold">{analytics.totalCatches}</p>
              </div>
              <Fish className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-effect">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Species Caught</p>
                <p className="text-2xl font-bold">{analytics.totalSpecies}</p>
              </div>
              <Trophy className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-effect">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Average Success</p>
                <p className={`text-2xl font-bold ${getSuccessColor(analytics.averageSuccessScore)}`}>
                  {analytics.averageSuccessScore.toFixed(1)}/10
                </p>
                <p className="text-xs text-gray-500">
                  {getSuccessLevel(analytics.averageSuccessScore)}
                </p>
              </div>
              <Target className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Favorite Locations */}
      <Card className="glass-effect">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Top Fishing Spots
          </CardTitle>
        </CardHeader>
        <CardContent>
          {analytics.favoriteLocations.length > 0 ? (
            <div className="space-y-4">
              {analytics.favoriteLocations.map((location, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-semibold">{location.name}</h4>
                    <div className="flex items-center gap-4 mt-1">
                      <Badge variant="outline">
                        {location.visitCount} visit{location.visitCount !== 1 ? 's' : ''}
                      </Badge>
                      <Badge variant="outline">
                        {location.totalCatches} catches
                      </Badge>
                      <span className="text-sm text-gray-600">
                        Best: {location.bestSeason}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`font-semibold ${getSuccessColor(location.averageSuccess)}`}>
                      {location.averageSuccess.toFixed(1)}/10
                    </div>
                    <div className="text-xs text-gray-500">
                      {getSuccessLevel(location.averageSuccess)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">
              No location data available yet. Log more trips to see your favorite spots!
            </p>
          )}
        </CardContent>
      </Card>

      {/* Monthly Performance */}
      <Card className="glass-effect">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Monthly Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          {analytics.monthlyStats.length > 0 ? (
            <div className="space-y-4">
              {analytics.monthlyStats.slice(0, 6).map((month, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">
                      {month.month} {month.year}
                    </span>
                    <div className="flex items-center gap-4">
                      <Badge variant="outline">
                        {month.trips} trips
                      </Badge>
                      <Badge variant="outline">
                        {month.catches} catches
                      </Badge>
                      <span className={`font-semibold ${getSuccessColor(month.successScore)}`}>
                        {month.successScore.toFixed(1)}/10
                      </span>
                    </div>
                  </div>
                  <Progress 
                    value={(month.successScore / 10) * 100} 
                    className="h-2"
                  />
                  {month.topSpecies.length > 0 && (
                    <div className="flex gap-1">
                      {month.topSpecies.map((species, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          {species}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">
              Not enough data for monthly analysis. Keep logging your trips!
            </p>
          )}
        </CardContent>
      </Card>

      {/* Improvement Suggestions */}
      {analytics.improvements.length > 0 && (
        <Card className="glass-effect">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Improvement Suggestions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.improvements.map((improvement, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                  <p className="text-sm">{improvement}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Catch Rate Trends */}
      <Card className="glass-effect">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Fish className="w-5 h-5" />
            Fishing Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3">Success Metrics</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Catches per trip:</span>
                  <Badge variant="outline">
                    {(analytics.totalCatches / analytics.totalTrips).toFixed(1)}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span>Species diversity:</span>
                  <Badge variant="outline">
                    {((analytics.totalSpecies / analytics.totalCatches) * 100).toFixed(0)}%
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span>Location exploration:</span>
                  <Badge variant="outline">
                    {analytics.favoriteLocations.length} spots
                  </Badge>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-3">Recommendations</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2" />
                  <span>Try early morning or late evening for better results</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2" />
                  <span>Experiment with different baits and techniques</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full mt-2" />
                  <span>Keep detailed notes about successful patterns</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
