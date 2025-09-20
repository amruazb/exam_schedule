import React, { useState } from 'react';
import { useApp } from './AppContext.jsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card';
import { Button } from './components/ui/button';
import { Input } from './components/ui/input';
import { Label } from './components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './components/ui/select';
import { Badge } from './components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './components/ui/alert-dialog';
import { Calendar, Clock, User, UserPlus, UserMinus, Settings } from 'lucide-react';
import { formatDateTime, formatTime, getAvailableProctors } from './utils.js';

export default function ExamSchedule() {
  const { state, actions } = useApp();
  const [selectedExam, setSelectedExam] = useState('exam00');
  const [startDateTime, setStartDateTime] = useState('');
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedProctor, setSelectedProctor] = useState('');

  const currentExam = state.exams.find(exam => exam.id === selectedExam);
  const hasSlots = currentExam && currentExam.slots.length > 0;

  const handleGenerateSlots = () => {
    if (!startDateTime) return;
    
    const startTime = new Date(startDateTime);
    actions.generateSlots(selectedExam, startTime);
  };

  const handleAssignProctor = (proctorId) => {
    if (!selectedSlot || !proctorId) return;
    
    actions.assignProctorToSlot(selectedExam, selectedSlot.id, proctorId);
  };

  const handleRemoveProctor = (slotId, proctorId) => {
    actions.removeProctorFromSlot(selectedExam, slotId, proctorId);
  };

  const getSlotProctor = (proctorId) => {
    if (proctorId.startsWith("role-")) {
      const roleName = proctorId.replace("role-", "").replace("-", " ");
      return { id: proctorId, name: roleName };
    }
    return state.proctors.find(p => p.id === proctorId);
  };

  const availableProctors = selectedSlot 
    ? getAvailableProctors(state.proctors, state.exams, selectedSlot.startTime)
    : [];

  const coordinatorRoles = [
    { id: 'role-coordinator', name: 'Coordinator' },
    { id: 'role-breaktime-coordinator', name: 'Breaktime Coordinator' }
  ];

  const allAssignableOptions = [...availableProctors, ...coordinatorRoles];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Exam Schedule</h1>
        <p className="text-muted-foreground">
          Manage exam slots and assign proctors
        </p>
      </div>

      {/* Exam Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <span>Exam Configuration</span>
          </CardTitle>
          <CardDescription>
            Select an exam and configure its time slots
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="exam-select">Select Exam</Label>
              <Select value={selectedExam} onValueChange={setSelectedExam}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose an exam" />
                </SelectTrigger>
                <SelectContent>
                  {state.exams.map((exam) => (
                    <SelectItem key={exam.id} value={exam.id}>
                      {exam.name} ({exam.duration} hours)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="start-time">Exam Start Time</Label>
              <Input
                id="start-time"
                type="datetime-local"
                value={startDateTime}
                onChange={(e) => setStartDateTime(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <Button 
              onClick={handleGenerateSlots}
              disabled={!startDateTime}
              className="flex items-center space-x-2"
            >
              <Calendar className="h-4 w-4" />
              <span>Generate Slots</span>
            </Button>
            
            {hasSlots && (
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>{currentExam.slots.length} slots generated</span>
              </div>
            )}
          </div>

          {currentExam && (
            <div className="p-4 bg-muted rounded-lg">
              <h4 className="font-medium mb-2">{currentExam.name} Details</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Duration: {currentExam.duration} hours</li>
                <li>• Total slots: {currentExam.duration + 1} (including 1-hour preparation)</li>
                <li>• Points per slot: {state.pointsPerSlot}</li>
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Slots Management */}
      {hasSlots && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>Slot Management - {currentExam.name}</span>
            </CardTitle>
            <CardDescription>
              Assign proctors to exam slots
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {currentExam.slots.map((slot, index) => {
                const proctors = slot.proctorIds.map(id => getSlotProctor(id));
                const isAssigned = proctors.length > 0;

                return (
                  <div
                    key={slot.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center justify-center w-8 h-8 bg-primary text-primary-foreground rounded-full text-sm font-medium">
                        {index + 1}
                      </div>
                      
                      <div>
                        <div className="flex items-center space-x-2">
                          <p className="font-medium">
                            {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                          </p>
                          {slot.isPreparation && (
                            <Badge variant="outline">Preparation</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {formatDateTime(slot.startTime)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      {isAssigned ? (
                        <>
                          <div className="text-right">
                            {proctors.length > 0 ? (
                              proctors.map(p => (
                                <p key={p.id} className="font-medium">{p.name} {p.id.startsWith("role-") ? "" : `(ID: ${p.id})`}</p>
                              ))
                            ) : (
                              <p className="text-sm text-muted-foreground">No proctors assigned</p>
                            )}
                          </div>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <UserMinus className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Remove Proctor</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to remove {proctor.name} from this slot?
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleRemoveProctor(slot.id)}>
                                  Remove
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedSlot(slot)}
                          className="flex items-center space-x-2"
                        >
                          <UserPlus className="h-4 w-4" />
                          <span>Assign</span>
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Proctor Assignment Dialog */}
      {selectedSlot && (
        <AlertDialog open={!!selectedSlot} onOpenChange={() => setSelectedSlot(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Assign Proctor</AlertDialogTitle>
              <AlertDialogDescription>
                Select a proctor for the slot: {formatDateTime(selectedSlot.startTime)}
              </AlertDialogDescription>
            </AlertDialogHeader>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Available Proctors</Label>
                <Select
                  value={selectedProctor}
                  onValueChange={setSelectedProctor}
                  multiple // Enable multiple selection
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose proctors" />
                  </SelectTrigger>
                  <SelectContent>
                    {allAssignableOptions.map((option) => (
                      <SelectItem key={option.id} value={option.id}>
                        {option.name} {option.id.startsWith("role-") ? "" : `(ID: ${option.id})`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {availableProctors.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No available proctors for this time slot. All proctors may be assigned to other slots at the same time.
                </p>
              )}
            </div>

            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => {
                setSelectedSlot(null);
                setSelectedProctor('');
              }}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction 
                onClick={() => {
                  if (selectedProctor) {
                    handleAssignProctor(selectedProctor);
                    setSelectedSlot(null);
                    setSelectedProctor("");
                  }
                }}
                disabled={!selectedProctor}
              >
                Assign Proctor
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {/* Instructions */}
      {!hasSlots && (
        <Card>
          <CardHeader>
            <CardTitle>Getting Started</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm text-muted-foreground">
              <p>1. Select an exam from the dropdown above</p>
              <p>2. Choose the exam start date and time</p>
              <p>3. Click "Generate Slots" to create time slots</p>
              <p>4. Assign proctors to each slot</p>
              <p className="text-xs mt-4 p-3 bg-muted rounded">
                <strong>Note:</strong> Slots start 1 hour before the exam for preparation. 
                Exam00, Exam01, and Exam02 have 5 slots each (1 prep + 4 exam hours). 
                Exam03 has 9 slots (1 prep + 8 exam hours).
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

