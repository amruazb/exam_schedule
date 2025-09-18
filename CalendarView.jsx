import React, { useState, useMemo } from 'react';
import { useApp } from '../contexts/AppContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CalendarDays, ChevronLeft, ChevronRight, Clock, User, Calendar } from 'lucide-react';
import { formatTime, formatDateTime } from '../lib/utils';

export default function CalendarView() {
  const { state } = useApp();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('week'); // 'week' or 'day'
  const [selectedExam, setSelectedExam] = useState('all');

  // Get the start of the week (Sunday)
  const getWeekStart = (date) => {
    const start = new Date(date);
    start.setDate(start.getDate() - start.getDay());
    start.setHours(0, 0, 0, 0);
    return start;
  };

  // Get the start of the day
  const getDayStart = (date) => {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    return start;
  };

  // Generate time slots for the calendar grid
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 6; hour <= 22; hour++) {
      slots.push(hour);
    }
    return slots;
  };

  // Get all slots for the current view
  const getViewSlots = useMemo(() => {
    const allSlots = [];
    
    state.exams.forEach(exam => {
      if (selectedExam !== 'all' && exam.id !== selectedExam) return;
      
      exam.slots.forEach(slot => {
        const slotDate = new Date(slot.startTime);
        const proctor = state.proctors.find(p => p.id === slot.proctorId);
        
        allSlots.push({
          ...slot,
          examName: exam.name,
          examId: exam.id,
          proctorName: proctor?.name || null,
          date: slotDate
        });
      });
    });
    
    return allSlots;
  }, [state.exams, state.proctors, selectedExam]);

  // Filter slots for current view
  const getFilteredSlots = () => {
    if (viewMode === 'week') {
      const weekStart = getWeekStart(selectedDate);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 7);
      
      return getViewSlots.filter(slot => {
        const slotDate = new Date(slot.startTime);
        return slotDate >= weekStart && slotDate < weekEnd;
      });
    } else {
      const dayStart = getDayStart(selectedDate);
      const dayEnd = new Date(dayStart);
      dayEnd.setDate(dayEnd.getDate() + 1);
      
      return getViewSlots.filter(slot => {
        const slotDate = new Date(slot.startTime);
        return slotDate >= dayStart && slotDate < dayEnd;
      });
    }
  };

  // Navigate dates
  const navigateDate = (direction) => {
    const newDate = new Date(selectedDate);
    if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() + (direction * 7));
    } else {
      newDate.setDate(newDate.getDate() + direction);
    }
    setSelectedDate(newDate);
  };

  // Get week days
  const getWeekDays = () => {
    const weekStart = getWeekStart(selectedDate);
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(weekStart);
      day.setDate(day.getDate() + i);
      days.push(day);
    }
    return days;
  };

  // Get slots for a specific day and hour
  const getSlotsForDayHour = (date, hour) => {
    const filteredSlots = getFilteredSlots();
    return filteredSlots.filter(slot => {
      const slotDate = new Date(slot.startTime);
      return slotDate.getDate() === date.getDate() &&
             slotDate.getMonth() === date.getMonth() &&
             slotDate.getFullYear() === date.getFullYear() &&
             slotDate.getHours() === hour;
    });
  };

  const timeSlots = generateTimeSlots();
  const weekDays = getWeekDays();
  const filteredSlots = getFilteredSlots();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Calendar View</h1>
        <p className="text-muted-foreground">
          Visual calendar of exam slots and proctor assignments
        </p>
      </div>

      {/* Controls */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateDate(-1)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              <div className="text-center">
                <h3 className="font-medium">
                  {viewMode === 'week' 
                    ? `Week of ${selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
                    : selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
                  }
                </h3>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateDate(1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex items-center space-x-4">
              <Select value={selectedExam} onValueChange={setSelectedExam}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter by exam" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Exams</SelectItem>
                  {state.exams.map((exam) => (
                    <SelectItem key={exam.id} value={exam.id}>
                      {exam.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Tabs value={viewMode} onValueChange={setViewMode}>
                <TabsList>
                  <TabsTrigger value="week">Week</TabsTrigger>
                  <TabsTrigger value="day">Day</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Calendar Grid */}
      <Card>
        <CardContent className="p-0">
          {viewMode === 'week' ? (
            // Week View
            <div className="overflow-x-auto">
              <div className="min-w-[800px]">
                {/* Header Row */}
                <div className="grid grid-cols-8 border-b">
                  <div className="p-3 border-r bg-muted">
                    <span className="text-sm font-medium">Time</span>
                  </div>
                  {weekDays.map((day, index) => (
                    <div key={index} className="p-3 border-r last:border-r-0 bg-muted text-center">
                      <div className="text-sm font-medium">
                        {day.toLocaleDateString('en-US', { weekday: 'short' })}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {day.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' })}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Time Slots */}
                {timeSlots.map((hour) => (
                  <div key={hour} className="grid grid-cols-8 border-b last:border-b-0">
                    <div className="p-3 border-r bg-muted/50 text-center">
                      <span className="text-sm">
                        {hour.toString().padStart(2, '0')}:00
                      </span>
                    </div>
                    {weekDays.map((day, dayIndex) => {
                      const daySlots = getSlotsForDayHour(day, hour);
                      return (
                        <div key={dayIndex} className="p-2 border-r last:border-r-0 min-h-[60px]">
                          {daySlots.map((slot, slotIndex) => (
                            <div
                              key={slotIndex}
                              className={`mb-1 p-2 rounded text-xs ${
                                slot.proctorId 
                                  ? 'bg-primary text-primary-foreground' 
                                  : 'bg-muted border border-dashed'
                              }`}
                            >
                              <div className="font-medium truncate">
                                {slot.examName}
                              </div>
                              {slot.proctorName && (
                                <div className="truncate opacity-90">
                                  {slot.proctorName}
                                </div>
                              )}
                              {slot.isPreparation && (
                                <Badge variant="outline" className="text-xs mt-1">
                                  Prep
                                </Badge>
                              )}
                            </div>
                          ))}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            // Day View
            <div className="space-y-4 p-6">
              {timeSlots.map((hour) => {
                const hourSlots = getSlotsForDayHour(selectedDate, hour);
                return (
                  <div key={hour} className="flex items-start space-x-4">
                    <div className="w-20 text-right">
                      <span className="text-sm font-medium">
                        {hour.toString().padStart(2, '0')}:00
                      </span>
                    </div>
                    <div className="flex-1 min-h-[60px] border-l pl-4">
                      {hourSlots.length === 0 ? (
                        <div className="h-full flex items-center">
                          <span className="text-sm text-muted-foreground">No slots</span>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {hourSlots.map((slot, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between p-3 border rounded-lg"
                            >
                              <div className="flex items-center space-x-3">
                                <div>
                                  <div className="flex items-center space-x-2">
                                    <span className="font-medium">{slot.examName}</span>
                                    {slot.isPreparation && (
                                      <Badge variant="outline">Preparation</Badge>
                                    )}
                                  </div>
                                  <div className="text-sm text-muted-foreground">
                                    {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                                  </div>
                                </div>
                              </div>
                              
                              <div className="flex items-center space-x-2">
                                {slot.proctorName ? (
                                  <div className="text-right">
                                    <div className="font-medium">{slot.proctorName}</div>
                                    <div className="text-sm text-muted-foreground">
                                      ID: {slot.proctorId}
                                    </div>
                                  </div>
                                ) : (
                                  <Badge variant="outline">Unassigned</Badge>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Slots in View</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredSlots.length}</div>
            <p className="text-xs text-muted-foreground">
              {viewMode === 'week' ? 'This week' : 'Today'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Assigned</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {filteredSlots.filter(slot => slot.proctorId).length}
            </div>
            <p className="text-xs text-muted-foreground">
              {filteredSlots.length > 0 
                ? `${Math.round((filteredSlots.filter(slot => slot.proctorId).length / filteredSlots.length) * 100)}% coverage`
                : 'No slots'
              }
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unassigned</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {filteredSlots.filter(slot => !slot.proctorId).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Need assignment
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Legend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Legend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-primary rounded"></div>
              <span>Assigned Slot</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-muted border border-dashed rounded"></div>
              <span>Unassigned Slot</span>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="text-xs">Prep</Badge>
              <span>Preparation Hour</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

