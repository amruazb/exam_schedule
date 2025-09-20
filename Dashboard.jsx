import React from 'react';
import { useApp } from './AppContext.jsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card';
import { Badge } from './components/ui/badge';
import { Input } from './components/ui/input';
import { Button } from './components/ui/button';
import { Search, Users, Calendar, Trophy, Clock } from 'lucide-react';
import { getProctorStats, formatDateTime } from './utils.js';
import { useState } from 'react';

export default function Dashboard() {
  const { state } = useApp();
  const [searchTerm, setSearchTerm] = useState('');

  const proctorStats = getProctorStats(state.proctors, state.exams, state.pointsPerSlot);
  const filteredProctors = proctorStats.filter(proctor =>
    proctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    proctor.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalSlots = state.exams.reduce((total, exam) => total + exam.slots.length, 0);
  const assignedSlots = state.exams.reduce((total, exam) => 
    total + exam.slots.filter(slot => slot.proctorId).length, 0
  );
  const totalPoints = proctorStats.reduce((total, proctor) => total + proctor.points, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of exam proctoring system
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Proctors</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{state.proctors.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Slots</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSlots}</div>
            <p className="text-xs text-muted-foreground">
              {assignedSlots} assigned
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Points</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPoints}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Hours</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{assignedSlots}</div>
          </CardContent>
        </Card>
      </div>

      {/* Proctor Search and List */}
      <Card>
        <CardHeader>
          <CardTitle>Proctor Dashboard</CardTitle>
          <CardDescription>
            Search and view proctor information, hours worked, and points earned
          </CardDescription>
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </CardHeader>
        <CardContent>
          {filteredProctors.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                {state.proctors.length === 0 
                  ? "No proctors added yet. Go to Admin Panel to add proctors."
                  : "No proctors found matching your search."
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredProctors.map((proctor) => (
                <div
                  key={proctor.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <div>
                        <h3 className="font-medium">{proctor.name}</h3>
                        <p className="text-sm text-muted-foreground">ID: {proctor.id}</p>
                        {proctor.email && (
                          <p className="text-sm text-muted-foreground">{proctor.email}</p>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="text-center">
                      <p className="text-sm font-medium">{proctor.hours}</p>
                      <p className="text-xs text-muted-foreground">Hours</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium">{proctor.slots}</p>
                      <p className="text-xs text-muted-foreground">Slots</p>
                    </div>
                    <Badge variant="secondary" className="text-sm">
                      {proctor.points} pts
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Activity */}
      {assignedSlots > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Assignments</CardTitle>
            <CardDescription>
              Latest proctor slot assignments
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
                  <div key={index} className="flex items-center justify-between py-2 border-b last:border-b-0">
                    <div>
                      <p className="font-medium">{slot.proctorName}</p>
                      <p className="text-sm text-muted-foreground">
                        {slot.examName} - {formatDateTime(slot.startTime)}
                      </p>
                    </div>
                    <Badge variant={slot.isPreparation ? "outline" : "default"}>
                      {slot.isPreparation ? "Preparation" : "Exam"}
                    </Badge>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

