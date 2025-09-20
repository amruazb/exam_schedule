import React from 'react';
import { useApp } from './AppContext.jsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card';
import { Badge } from './components/ui/badge';
import { Avatar, AvatarFallback } from './components/ui/avatar';
import { Trophy, Medal, Award, Clock, Calendar, Star } from 'lucide-react';
import { getProctorStats, formatDateTime } from './utils.js';

export default function Leaderboard() {
  const { state } = useApp();
  const proctorStats = getProctorStats(state.proctors, state.exams, state.pointsPerSlot);

  const topProctors = proctorStats.slice(0, 10);
  const totalPoints = proctorStats.reduce((sum, proctor) => sum + proctor.points, 0);
  const totalHours = proctorStats.reduce((sum, proctor) => sum + proctor.hours, 0);

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Award className="h-5 w-5 text-amber-600" />;
      default:
        return <Star className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getRankBadgeVariant = (rank) => {
    switch (rank) {
      case 1:
        return "default";
      case 2:
        return "secondary";
      case 3:
        return "outline";
      default:
        return "outline";
    }
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Leaderboard</h1>
        <p className="text-muted-foreground">
          Top performing proctors by points earned
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Participants</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{state.proctors.length}</div>
            <p className="text-xs text-muted-foreground">
              Active proctors
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Points</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPoints}</div>
            <p className="text-xs text-muted-foreground">
              Points distributed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Hours</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalHours}</div>
            <p className="text-xs text-muted-foreground">
              Hours worked
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Leaderboard */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Trophy className="h-5 w-5" />
            <span>Top Proctors</span>
          </CardTitle>
          <CardDescription>
            Ranked by total points earned from proctoring slots
          </CardDescription>
        </CardHeader>
        <CardContent>
          {topProctors.length === 0 ? (
            <div className="text-center py-12">
              <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-muted-foreground mb-2">
                No Rankings Yet
              </h3>
              <p className="text-sm text-muted-foreground">
                Add proctors and assign them to slots to see the leaderboard
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {topProctors.map((proctor, index) => {
                const rank = index + 1;
                const isTopThree = rank <= 3;
                
                return (
                  <div
                    key={proctor.id}
                    className={`flex items-center justify-between p-4 rounded-lg border transition-colors ${
                      isTopThree ? 'bg-accent/50 border-accent' : 'hover:bg-accent/30'
                    }`}
                  >
                    <div className="flex items-center space-x-4">
                      {/* Rank */}
                      <div className="flex items-center justify-center w-10 h-10">
                        {getRankIcon(rank)}
                      </div>

                      {/* Avatar */}
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {getInitials(proctor.name)}
                        </AvatarFallback>
                      </Avatar>

                      {/* Proctor Info */}
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-medium">{proctor.name}</h3>
                          <Badge variant={getRankBadgeVariant(rank)}>
                            #{rank}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          ID: {proctor.id}
                        </p>
                        {proctor.email && (
                          <p className="text-xs text-muted-foreground">
                            {proctor.email}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center space-x-6 text-right">
                      <div>
                        <p className="text-sm font-medium">{proctor.hours}</p>
                        <p className="text-xs text-muted-foreground">Hours</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">{proctor.slots}</p>
                        <p className="text-xs text-muted-foreground">Slots</p>
                      </div>
                      <div className="min-w-[80px]">
                        <p className="text-lg font-bold text-primary">{proctor.points}</p>
                        <p className="text-xs text-muted-foreground">Points</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent High Performers */}
      {proctorStats.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Most Active This Period */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="h-5 w-5" />
                <span>Most Active</span>
              </CardTitle>
              <CardDescription>
                Proctors with the most hours worked
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {proctorStats
                  .sort((a, b) => b.hours - a.hours)
                  .slice(0, 5)
                  .map((proctor, index) => (
                    <div key={proctor.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs">
                            {getInitials(proctor.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm">{proctor.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {proctor.slots} slots
                          </p>
                        </div>
                      </div>
                      <Badge variant="secondary">
                        {proctor.hours}h
                      </Badge>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Assignments */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5" />
                <span>Recent Activity</span>
              </CardTitle>
              <CardDescription>
                Latest slot assignments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {state.exams
                  .flatMap(exam => 
                    exam.slots
                      .filter(slot => slot.proctorId)
                      .map(slot => ({
                        ...slot,
                        examName: exam.name,
                        proctorName: state.proctors.find(p => p.id === slot.proctorId)?.name || 'Unknown'
                      }))
                  )
                  .sort((a, b) => new Date(b.startTime) - new Date(a.startTime))
                  .slice(0, 5)
                  .map((slot, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm">{slot.proctorName}</p>
                        <p className="text-xs text-muted-foreground">
                          {slot.examName}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">
                          {formatDateTime(slot.startTime)}
                        </p>
                        <Badge variant={slot.isPreparation ? "outline" : "default"} className="text-xs">
                          +{state.pointsPerSlot} pts
                        </Badge>
                      </div>
                    </div>
                  ))}
                
                {state.exams.every(exam => exam.slots.every(slot => !slot.proctorId)) && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No recent activity
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Achievement Badges */}
      {proctorStats.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Award className="h-5 w-5" />
              <span>Achievements</span>
            </CardTitle>
            <CardDescription>
              Special recognition for outstanding performance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Top Scorer */}
              {proctorStats[0] && (
                <div className="text-center p-4 border rounded-lg">
                  <Trophy className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                  <h4 className="font-medium">Top Scorer</h4>
                  <p className="text-sm text-muted-foreground">{proctorStats[0].name}</p>
                  <Badge className="mt-2">{proctorStats[0].points} points</Badge>
                </div>
              )}

              {/* Most Dedicated */}
              {proctorStats.sort((a, b) => b.hours - a.hours)[0] && (
                <div className="text-center p-4 border rounded-lg">
                  <Clock className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                  <h4 className="font-medium">Most Dedicated</h4>
                  <p className="text-sm text-muted-foreground">
                    {proctorStats.sort((a, b) => b.hours - a.hours)[0].name}
                  </p>
                  <Badge variant="secondary" className="mt-2">
                    {proctorStats.sort((a, b) => b.hours - a.hours)[0].hours} hours
                  </Badge>
                </div>
              )}

              {/* Most Reliable */}
              {proctorStats.sort((a, b) => b.slots - a.slots)[0] && (
                <div className="text-center p-4 border rounded-lg">
                  <Star className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                  <h4 className="font-medium">Most Reliable</h4>
                  <p className="text-sm text-muted-foreground">
                    {proctorStats.sort((a, b) => b.slots - a.slots)[0].name}
                  </p>
                  <Badge variant="outline" className="mt-2">
                    {proctorStats.sort((a, b) => b.slots - a.slots)[0].slots} slots
                  </Badge>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

