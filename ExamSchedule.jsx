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
  const [selectedProctors, setSelectedProctors] = useState([]);
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [bulkAssignMode, setBulkAssignMode] = useState(false);
  const [removeAllDialogSlot, setRemoveAllDialogSlot] = useState(null);
  const [removeProctorDialog, setRemoveProctorDialog] = useState(null); // { slotId, proctorId, proctorName }

  const currentExam = state.exams.find(exam => exam.id === selectedExam);
  const hasSlots = currentExam && currentExam.slots.length > 0;

  const handleGenerateSlots = () => {
    if (!startDateTime) return;
    
    const startTime = new Date(startDateTime);
    actions.generateSlots(selectedExam, startTime);
  };

  const handleAssignProctors = (proctorIds) => {
    if (!selectedSlot || !proctorIds?.length) return;
    const unique = [...new Set(proctorIds)];
    unique.forEach((pid) => {
      actions.assignProctorToSlot(selectedExam, selectedSlot.id, pid);
    });
  };

  const handleBulkAssignProctors = (proctorIds) => {
    if (!selectedSlots.length || !proctorIds?.length) return;
    const unique = [...new Set(proctorIds)];
    
    selectedSlots.forEach(slotId => {
      unique.forEach((pid) => {
        actions.assignProctorToSlot(selectedExam, slotId, pid);
      });
    });
    
    // Reset selections
    setSelectedSlots([]);
    setBulkAssignMode(false);
    setSelectedProctors([]);
  };

  const toggleSlotSelection = (slotId) => {
    setSelectedSlots(prev => 
      prev.includes(slotId) 
        ? prev.filter(id => id !== slotId)
        : [...prev, slotId]
    );
  };

  const selectAllSlots = () => {
    if (!currentExam?.slots) return;
    const unassignedSlots = currentExam.slots
      .filter(slot => slot.proctorIds.length === 0)
      .map(slot => slot.id);
    setSelectedSlots(unassignedSlots);
  };

  const clearSlotSelection = () => {
    setSelectedSlots([]);
  };

  const handleRemoveProctor = (slotId, proctorId) => {
    actions.removeProctorFromSlot(selectedExam, slotId, proctorId);
  };

  const handleRemoveAllProctors = (slotId, proctorIds) => {
    // Create a copy of the array to avoid modification during iteration
    const proctorsToRemove = [...proctorIds];
    proctorsToRemove.forEach(proctorId => {
      actions.removeProctorFromSlot(selectedExam, slotId, proctorId);
    });
  };

  const getSlotProctor = (proctorId) => {
    if (proctorId.startsWith("role-")) {
      const roleName = proctorId.replace("role-", "").replace("-", " ");
      return { id: proctorId, name: roleName };
    }
    return state.proctors.find(p => p.id === proctorId);
  };

  const getAvailableProctorsForBulk = () => {
    if (!selectedSlots.length || !currentExam) return [];
    
    // Get slots that are selected for bulk assignment
    const slotsToCheck = currentExam.slots.filter(slot => selectedSlots.includes(slot.id));
    
    // Find proctors available for ALL selected slots
    return state.proctors.filter(proctor => {
      return slotsToCheck.every(slot => {
        const availableForSlot = getAvailableProctors(state.proctors, state.exams, slot.startTime);
        return availableForSlot.some(p => p.id === proctor.id);
      });
    });
  };

  const getAvailableProctorsForSlot = (slot) => {
    const baseAvailable = getAvailableProctors(state.proctors, state.exams, slot.startTime);
    // For single slot assignment, also show already assigned proctors as available
    // but mark them as already assigned
    const alreadyAssigned = slot.proctorIds || [];
    const alreadyAssignedProctors = alreadyAssigned
      .map(id => state.proctors.find(p => p.id === id))
      .filter(Boolean);
    
    // Combine available proctors with already assigned ones (removing duplicates)
    const combined = [...baseAvailable];
    alreadyAssignedProctors.forEach(assignedProctor => {
      if (!combined.some(p => p.id === assignedProctor.id)) {
        combined.push({ ...assignedProctor, alreadyAssigned: true });
      }
    });
    
    return combined;
  };

  const availableProctors = selectedSlot 
    ? selectedSlot.bulk 
      ? getAvailableProctorsForBulk()
      : getAvailableProctorsForSlot(selectedSlot)
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
            {/* Bulk Assignment Controls */}
            <div className="mb-6 p-4 bg-muted/50 rounded-lg border">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium">Bulk Assignment</h4>
                <div className="flex items-center space-x-2">
                  <Button
                    variant={bulkAssignMode ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      setBulkAssignMode(!bulkAssignMode);
                      if (!bulkAssignMode) {
                        setSelectedSlots([]);
                      }
                    }}
                  >
                    {bulkAssignMode ? "Exit Bulk Mode" : "Bulk Assign"}
                  </Button>
                </div>
              </div>
              
              {bulkAssignMode && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      {selectedSlots.length} slot{selectedSlots.length !== 1 ? 's' : ''} selected
                    </span>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" onClick={selectAllSlots}>
                        Select All Unassigned
                      </Button>
                      <Button variant="outline" size="sm" onClick={clearSlotSelection}>
                        Clear Selection
                      </Button>
                      {selectedSlots.length > 0 && (
                        <Button 
                          size="sm"
                          onClick={() => setSelectedSlot({ bulk: true })}
                        >
                          Assign to Selected
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-4">
              {currentExam.slots.map((slot, index) => {
                const proctors = slot.proctorIds.map(id => getSlotProctor(id));
                const isAssigned = proctors.length > 0;

                return (
                  <div
                    key={slot.id}
                    className={`flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors ${
                      bulkAssignMode && selectedSlots.includes(slot.id) ? 'bg-primary/10 border-primary' : ''
                    }`}
                  >
                    <div className="flex items-center space-x-4">
                      {bulkAssignMode && (
                        <input
                          type="checkbox"
                          checked={selectedSlots.includes(slot.id)}
                          onChange={() => toggleSlotSelection(slot.id)}
                          disabled={isAssigned}
                          className="w-4 h-4"
                        />
                      )}
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
                      <div className="flex-1">
                        {isAssigned ? (
                          <div className="text-right">
                            {proctors.length > 0 ? (
                              <div className="space-y-1">
                                {proctors.map(p => (
                                  <div key={p.id} className="flex items-center justify-end space-x-2 bg-muted/30 rounded px-2 py-1">
                                    <p className="font-medium text-sm">{p.name}</p>
                                    {!p.id.startsWith("role-") && (
                                      <span className="text-xs text-muted-foreground">({p.id})</span>
                                    )}
                                    <Button 
                                      variant="ghost" 
                                      size="sm" 
                                      className="h-5 w-5 p-0 hover:bg-destructive hover:text-destructive-foreground"
                                      onClick={() => setRemoveProctorDialog({ 
                                        slotId: slot.id, 
                                        proctorId: p.id, 
                                        proctorName: p.name 
                                      })}
                                    >
                                      <UserMinus className="h-3 w-3" />
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-sm text-muted-foreground">No proctors assigned</p>
                            )}
                          </div>
                        ) : null}
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedSlot(slot);
                            // Pre-select already assigned proctors when opening dialog
                            if (slot.proctorIds && slot.proctorIds.length > 0) {
                              setSelectedProctors(slot.proctorIds);
                            }
                          }}
                          className="flex items-center space-x-2"
                        >
                          <UserPlus className="h-4 w-4" />
                          <span>{isAssigned ? "Manage" : "Assign"}</span>
                        </Button>
                        
                        {isAssigned && (
                          <>
                            <Badge variant="secondary" className="text-xs">
                              {proctors.length} proctor{proctors.length !== 1 ? 's' : ''}
                            </Badge>
                            {proctors.length > 1 && (
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="text-destructive"
                                onClick={() => setRemoveAllDialogSlot(slot)}
                              >
                                Clear All
                              </Button>
                            )}
                          </>
                        )}
                      </div>
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
        <AlertDialog open={!!selectedSlot} onOpenChange={() => {
          setSelectedSlot(null);
          setSelectedProctors([]);
        }}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {selectedSlot.bulk ? "Bulk Assign Proctors" : "Assign Proctor"}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {selectedSlot.bulk 
                  ? `Select proctors for ${selectedSlots.length} selected slots`
                  : `Select a proctor for the slot: ${formatDateTime(selectedSlot.startTime)}`
                }
              </AlertDialogDescription>
            </AlertDialogHeader>
            
            <div className="space-y-4">
              {selectedSlot.bulk && (
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm font-medium mb-1">Selected Slots:</p>
                  <div className="text-sm text-muted-foreground max-h-20 overflow-y-auto">
                    {currentExam.slots
                      .filter(slot => selectedSlots.includes(slot.id))
                      .map((slot, index) => (
                        <div key={slot.id}>
                          {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                          {slot.isPreparation && " (Preparation)"}
                        </div>
                      ))
                    }
                  </div>
                </div>
              )}
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>
                    {selectedSlot.bulk ? "Available for All Selected Slots" : "Available Proctors"}
                  </Label>
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const allIds = allAssignableOptions.map(option => option.id);
                        setSelectedProctors(allIds);
                      }}
                      className="text-xs"
                    >
                      Select All
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedProctors([])}
                      className="text-xs"
                    >
                      Clear All
                    </Button>
                  </div>
                </div>
                {/* Simple multi-select using checkboxes since our Select stub is single-select */}
                <div className="max-h-60 overflow-auto rounded-md border p-2">
                  <SelectTrigger>
                    <SelectValue placeholder="Choose proctors" />
                  </SelectTrigger>
                  <div className="mt-2 space-y-2">
                    {allAssignableOptions.map((option) => {
                      const checked = selectedProctors.includes(option.id);
                      const isAlreadyAssigned = !selectedSlot.bulk && selectedSlot.proctorIds?.includes(option.id);
                      const isRoleOption = option.id.startsWith('role-');
                      
                      return (
                        <label 
                          key={option.id} 
                          className={`flex items-center gap-2 text-sm p-2 rounded hover:bg-accent/50 ${
                            isAlreadyAssigned ? 'bg-blue-50 border border-blue-200' : ''
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedProctors(prev => [...new Set([...prev, option.id])]);
                              } else {
                                setSelectedProctors(prev => prev.filter(id => id !== option.id));
                              }
                            }}
                          />
                          <div className="flex-1">
                            <span className="font-medium">{option.name}</span>
                            {!isRoleOption && (
                              <span className="text-muted-foreground ml-1">(ID: {option.id})</span>
                            )}
                            {isAlreadyAssigned && (
                              <Badge variant="outline" className="ml-2 text-xs">
                                Already Assigned
                              </Badge>
                            )}
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>
                
                {selectedProctors.length > 0 && (
                  <div className="mt-2 p-2 bg-muted rounded text-sm">
                    <strong>{selectedProctors.length}</strong> proctor{selectedProctors.length !== 1 ? 's' : ''} selected
                    {!selectedSlot.bulk && selectedSlot.proctorIds?.length > 0 && (
                      <span className="text-muted-foreground ml-2">
                        (including {selectedSlot.proctorIds.filter(id => selectedProctors.includes(id)).length} already assigned)
                      </span>
                    )}
                  </div>
                )}
              </div>
              
              {availableProctors.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  {selectedSlot.bulk 
                    ? "No proctors are available for all selected time slots. Try selecting fewer slots or check for scheduling conflicts."
                    : "No available proctors for this time slot. All proctors may be assigned to other slots at the same time."
                  }
                </p>
              )}
            </div>

            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => {
                setSelectedSlot(null);
                setSelectedProctors([]);
              }}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction 
                onClick={() => {
                  if (selectedProctors.length) {
                    if (selectedSlot.bulk) {
                      handleBulkAssignProctors(selectedProctors);
                    } else {
                      handleAssignProctors(selectedProctors);
                    }
                    setSelectedSlot(null);
                    setSelectedProctors([]);
                  }
                }}
                disabled={!selectedProctors.length}
              >
                {selectedSlot.bulk ? "Assign to All Selected" : "Assign Selected"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {/* Remove Single Proctor Dialog */}
      {removeProctorDialog && (
        <AlertDialog open={!!removeProctorDialog} onOpenChange={() => setRemoveProctorDialog(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Remove Proctor</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to remove {removeProctorDialog.proctorName} from this slot?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setRemoveProctorDialog(null)}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction 
                onClick={() => {
                  handleRemoveProctor(removeProctorDialog.slotId, removeProctorDialog.proctorId);
                  setRemoveProctorDialog(null);
                }}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Remove
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {/* Remove All Proctors Dialog */}
      {removeAllDialogSlot && (
        <AlertDialog open={!!removeAllDialogSlot} onOpenChange={() => setRemoveAllDialogSlot(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Remove All Proctors</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to remove all {removeAllDialogSlot.proctorIds?.length || 0} proctors from this slot?
                <br />
                <span className="text-sm font-medium mt-2 block">
                  Time: {formatTime(removeAllDialogSlot.startTime)} - {formatTime(removeAllDialogSlot.endTime)}
                </span>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setRemoveAllDialogSlot(null)}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction 
                onClick={() => {
                  handleRemoveAllProctors(removeAllDialogSlot.id, removeAllDialogSlot.proctorIds);
                  setRemoveAllDialogSlot(null);
                }}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Remove All
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

