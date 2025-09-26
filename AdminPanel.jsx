import React, { useState } from 'react';
import { useApp } from './AppContext.jsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card';
import { Button } from './components/ui/button';
import { Input } from './components/ui/input';
import { Label } from './components/ui/label';
import { Badge } from './components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './components/ui/alert-dialog';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './components/ui/dialog';
import { Lock, Shield, UserPlus, Edit, Trash2, Users, Settings, Eye, EyeOff, FileText, Clock, Plus } from 'lucide-react';
import { generateId, validateProctor, getProctorStats } from './utils.js';

const ADMIN_PASSWORD = 'admin123';

export default function AdminPanel() {
  const { state, actions } = useApp();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  
  // Proctor form state
  const [proctorForm, setProctorForm] = useState({
    id: '',
    name: '',
    email: ''
  });
  const [editingProctor, setEditingProctor] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [isProctorDialogOpen, setIsProctorDialogOpen] = useState(false);
  
  // Exam form state
  const [examForm, setExamForm] = useState({
    id: '',
    name: '',
    duration: 4
  });
  const [editingExam, setEditingExam] = useState(null);
  const [examFormErrors, setExamFormErrors] = useState({});
  const [isExamDialogOpen, setIsExamDialogOpen] = useState(false);
  
  // Volunteer form state
  const [volunteerForm, setVolunteerForm] = useState({
    id: '',
    name: '',
    email: '',
    skills: ''
  });
  const [editingVolunteer, setEditingVolunteer] = useState(null);
  const [volunteerFormErrors, setVolunteerFormErrors] = useState({});
  const [isVolunteerDialogOpen, setIsVolunteerDialogOpen] = useState(false);
  
  // Event form state
  const [eventForm, setEventForm] = useState({
    id: '',
    name: '',
    date: '',
    startTime: '09:00',
    duration: 4,
    description: '',
    requiredVolunteers: 1
  });
  const [editingEvent, setEditingEvent] = useState(null);
  const [eventFormErrors, setEventFormErrors] = useState({});
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      actions.setAdminLogin(true);
      setLoginError('');
      setPassword('');
    } else {
      setLoginError('Invalid password');
    }
  };

  const handleLogout = () => {
    actions.setAdminLogin(false);
    setPassword('');
    setLoginError('');
  };

  const resetProctorForm = () => {
    setProctorForm({ id: '', name: '', email: '' });
    setEditingProctor(null);
    setFormErrors({});
  };
  
  const resetExamForm = () => {
    setExamForm({ id: '', name: '', duration: 4 });
    setEditingExam(null);
    setExamFormErrors({});
  };
  
  const resetVolunteerForm = () => {
    setVolunteerForm({ id: '', name: '', email: '', skills: '' });
    setEditingVolunteer(null);
    setVolunteerFormErrors({});
  };
  
  const resetEventForm = () => {
    setEventForm({ 
      id: '', 
      name: '', 
      date: '', 
      startTime: '09:00', 
      duration: 4, 
      description: '', 
      requiredVolunteers: 1 
    });
    setEditingEvent(null);
    setEventFormErrors({});
  };

  const handleProctorSubmit = (e) => {
    e.preventDefault();
    
    const validation = validateProctor(proctorForm);
    if (!validation.isValid) {
      setFormErrors(validation.errors);
      return;
    }

    // Check for duplicate ID (only if not editing or ID changed)
    const existingProctor = state.proctors.find(p => p.id === proctorForm.id);
    if (existingProctor && (!editingProctor || editingProctor.id !== proctorForm.id)) {
      setFormErrors({ id: 'Proctor ID already exists' });
      return;
    }

    if (editingProctor) {
      actions.updateProctor(proctorForm);
    } else {
      actions.addProctor({
        ...proctorForm,
        createdAt: new Date().toISOString()
      });
    }

    resetProctorForm();
    setIsProctorDialogOpen(false);
  };

  const handleEditProctor = (proctor) => {
    setProctorForm({
      id: proctor.id,
      name: proctor.name,
      email: proctor.email || ''
    });
    setEditingProctor(proctor);
    setFormErrors({});
    setIsProctorDialogOpen(true);
  };

  const handleDeleteProctor = (proctorId) => {
    actions.deleteProctor(proctorId);
  };
  
  const handleExamSubmit = (e) => {
    e.preventDefault();
    
    // Import validateExam from utils
    const { validateExam } = require('./utils.js');
    const validation = validateExam(examForm);
    if (!validation.isValid) {
      setExamFormErrors(validation.errors);
      return;
    }

    // Check for duplicate ID (only if not editing or ID changed)
    const existingExam = state.exams.find(e => e.id === examForm.id);
    if (existingExam && (!editingExam || editingExam.id !== examForm.id)) {
      setExamFormErrors({ id: 'Exam ID already exists' });
      return;
    }

    if (editingExam) {
      actions.updateExam(examForm);
    } else {
      actions.addExam(examForm);
    }

    resetExamForm();
    setIsExamDialogOpen(false);
  };

  const handleEditExam = (exam) => {
    setExamForm({
      id: exam.id,
      name: exam.name,
      duration: exam.duration
    });
    setEditingExam(exam);
    setExamFormErrors({});
    setIsExamDialogOpen(true);
  };

  const handleDeleteExam = (examId) => {
    actions.deleteExam(examId);
  };
  
  // Volunteer handlers
  const handleVolunteerSubmit = (e) => {
    e.preventDefault();
    
    // Basic validation
    const errors = {};
    if (!volunteerForm.id.trim()) errors.id = "Volunteer ID is required";
    if (!volunteerForm.name.trim()) errors.name = "Name is required";
    if (volunteerForm.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(volunteerForm.email)) {
      errors.email = "Invalid email format";
    }
    
    if (Object.keys(errors).length > 0) {
      setVolunteerFormErrors(errors);
      return;
    }
    
    // Check for duplicate ID (only if not editing or ID changed)
    const existingVolunteer = state.volunteers?.find(v => v.id === volunteerForm.id);
    if (existingVolunteer && (!editingVolunteer || editingVolunteer.id !== volunteerForm.id)) {
      setVolunteerFormErrors({ id: 'Volunteer ID already exists' });
      return;
    }

    if (editingVolunteer) {
      actions.updateVolunteer(volunteerForm);
    } else {
      actions.addVolunteer({
        ...volunteerForm,
        createdAt: new Date().toISOString()
      });
    }

    resetVolunteerForm();
    setIsVolunteerDialogOpen(false);
  };

  const handleEditVolunteer = (volunteer) => {
    setVolunteerForm({
      id: volunteer.id,
      name: volunteer.name,
      email: volunteer.email || '',
      skills: volunteer.skills || ''
    });
    setEditingVolunteer(volunteer);
    setVolunteerFormErrors({});
    setIsVolunteerDialogOpen(true);
  };

  const handleDeleteVolunteer = (volunteerId) => {
    actions.deleteVolunteer(volunteerId);
  };
  
  // Event handlers
  const handleEventSubmit = (e) => {
    e.preventDefault();
    
    // Basic validation
    const errors = {};
    if (!eventForm.id.trim()) errors.id = "Event ID is required";
    if (!eventForm.name.trim()) errors.name = "Event name is required";
    if (!eventForm.date) errors.date = "Event date is required";
    if (!eventForm.startTime) errors.startTime = "Start time is required";
    if (!eventForm.duration || eventForm.duration < 1) errors.duration = "Duration must be at least 1 hour";
    if (eventForm.requiredVolunteers < 1) errors.requiredVolunteers = "At least 1 volunteer is required";
    
    if (Object.keys(errors).length > 0) {
      setEventFormErrors(errors);
      return;
    }
    
    // Check for duplicate ID (only if not editing or ID changed)
    const existingEvent = state.events?.find(e => e.id === eventForm.id);
    if (existingEvent && (!editingEvent || editingEvent.id !== eventForm.id)) {
      setEventFormErrors({ id: 'Event ID already exists' });
      return;
    }

    if (editingEvent) {
      actions.updateEvent(eventForm);
      
      // Generate slots for the edited event
      const eventStartDateTime = new Date(`${eventForm.date}T${eventForm.startTime}`);
      actions.generateEventSlots(eventForm.id, eventStartDateTime.toISOString());
    } else {
      const newEvent = {
        ...eventForm,
        createdAt: new Date().toISOString(),
        volunteerIds: [],
        slots: []
      };
      
      actions.addEvent(newEvent);
      
      // Generate slots for the new event
      const eventStartDateTime = new Date(`${eventForm.date}T${eventForm.startTime}`);
      actions.generateEventSlots(newEvent.id, eventStartDateTime.toISOString());
    }

    resetEventForm();
    setIsEventDialogOpen(false);
  };

  const handleEditEvent = (event) => {
    setEventForm({
      id: event.id,
      name: event.name,
      date: event.date,
      startTime: event.startTime || '09:00',
      duration: event.duration || 4,
      description: event.description || '',
      requiredVolunteers: event.requiredVolunteers || 1
    });
    setEditingEvent(event);
    setEventFormErrors({});
    setIsEventDialogOpen(true);
  };

  const handleDeleteEvent = (eventId) => {
    actions.deleteEvent(eventId);
  };
  
  const handleAssignVolunteerToEvent = (eventId, volunteerId) => {
    actions.assignVolunteerToEvent(eventId, volunteerId);
  };
  
  const handleRemoveVolunteerFromEvent = (eventId, volunteerId) => {
    actions.removeVolunteerFromEvent(eventId, volunteerId);
  };
  
  // State for slot management
  const [currentSlot, setCurrentSlot] = useState(null);
  const [currentEventId, setCurrentEventId] = useState(null);
  const [isSlotManagementOpen, setIsSlotManagementOpen] = useState(false);
  
  const handleSlotVolunteerManagement = (eventId, slotId) => {
    setCurrentEventId(eventId);
    setCurrentSlot(slotId);
    setIsSlotManagementOpen(true);
  };
  
  const handleAssignVolunteerToSlot = (eventId, slotId, volunteerId) => {
    actions.assignVolunteerToEventSlot(eventId, slotId, volunteerId);
  };
  
  const handleRemoveVolunteerFromSlot = (eventId, slotId, volunteerId) => {
    actions.removeVolunteerFromEventSlot(eventId, slotId, volunteerId);
  };

  const proctorStats = getProctorStats(state.proctors, state.exams, state.pointsPerSlot);

  // Login form
  if (!state.isAdminLoggedIn) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Shield className="h-12 w-12 text-primary" />
            </div>
            <CardTitle>Admin Access</CardTitle>
            <CardDescription>
              Enter the admin password to access the management panel
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter admin password"
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
              
              {loginError && (
                <p className="text-sm text-destructive">{loginError}</p>
              )}
              
              <Button type="submit" className="w-full">
                <Lock className="h-4 w-4 mr-2" />
                Login
              </Button>
            </form>
            
            <div className="mt-4 p-3 bg-muted rounded-lg">
              <p className="text-xs text-muted-foreground">
                <strong>Demo Password:</strong> admin123
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Admin panel content
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Admin Panel</h1>
          <p className="text-muted-foreground">
            Manage proctors and system settings
          </p>
        </div>
        <Button variant="outline" onClick={handleLogout}>
          Logout
        </Button>
      </div>

      <Tabs defaultValue="proctors" className="space-y-6">
        <TabsList>
          <TabsTrigger value="proctors">Proctor Management</TabsTrigger>
          <TabsTrigger value="exams">Exam Management</TabsTrigger>
          <TabsTrigger value="volunteers">Volunteer Management</TabsTrigger>
          <TabsTrigger value="events">Event Management</TabsTrigger>
          <TabsTrigger value="settings">System Settings</TabsTrigger>
        </TabsList>

        {/* Proctor Management Tab */}
        <TabsContent value="proctors" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                <CardTitle className="text-sm font-medium">Active Proctors</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {proctorStats.filter(p => p.slots > 0).length}
                </div>
                <p className="text-xs text-muted-foreground">
                  With assignments
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Points</CardTitle>
                <Settings className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {proctorStats.reduce((sum, p) => sum + p.points, 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Points distributed
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Proctor List */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Proctor Management</CardTitle>
                  <CardDescription>
                    Add, edit, and remove proctors from the system
                  </CardDescription>
                </div>
                <Dialog open={isProctorDialogOpen} onOpenChange={setIsProctorDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={resetProctorForm}>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Add Proctor
                    </Button>
                  </DialogTrigger>
                  {isProctorDialogOpen && (
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>
                          {editingProctor ? 'Edit Proctor' : 'Add New Proctor'}
                        </DialogTitle>
                        <DialogDescription>
                          {editingProctor 
                            ? 'Update proctor information'
                            : 'Enter the details for the new proctor'
                          }
                        </DialogDescription>
                      </DialogHeader>
                    
                    <form onSubmit={handleProctorSubmit} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="proctor-id">Proctor ID *</Label>
                        <Input
                          id="proctor-id"
                          value={proctorForm.id}
                          onChange={(e) => setProctorForm({...proctorForm, id: e.target.value})}
                          placeholder="e.g., PROC001"
                        />
                        {formErrors.id && (
                          <p className="text-sm text-destructive">{formErrors.id}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="proctor-name">Full Name *</Label>
                        <Input
                          id="proctor-name"
                          value={proctorForm.name}
                          onChange={(e) => setProctorForm({...proctorForm, name: e.target.value})}
                          placeholder="e.g., John Doe"
                        />
                        {formErrors.name && (
                          <p className="text-sm text-destructive">{formErrors.name}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="proctor-email">Email (Optional)</Label>
                        <Input
                          id="proctor-email"
                          type="email"
                          value={proctorForm.email}
                          onChange={(e) => setProctorForm({...proctorForm, email: e.target.value})}
                          placeholder="e.g., john.doe@university.edu"
                        />
                        {formErrors.email && (
                          <p className="text-sm text-destructive">{formErrors.email}</p>
                        )}
                      </div>

                      <DialogFooter>
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => setIsProctorDialogOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button type="submit">
                          {editingProctor ? 'Update' : 'Add'} Proctor
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                  )}
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {state.proctors.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-muted-foreground mb-2">
                    No Proctors Added
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Add your first proctor to get started
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {proctorStats.map((proctor) => (
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
                        <Badge variant="secondary">
                          {proctor.points} pts
                        </Badge>
                        
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditProctor(proctor)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            {/* Only render content when triggered by user */}
                            {(open) => open && (
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Proctor</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete {proctor.name}? This will also remove them from all assigned slots. This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction 
                                    onClick={() => handleDeleteProctor(proctor.id)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            )}
                          </AlertDialog>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Exam Management Tab */}
        <TabsContent value="exams" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Exams</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{state.exams.length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Slots</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {state.exams.reduce((sum, exam) => sum + exam.slots.length, 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Across all exams
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Assigned Slots</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {state.exams.reduce((sum, exam) => 
                    sum + exam.slots.filter(slot => slot.proctorIds && slot.proctorIds.length > 0).length, 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  With proctors assigned
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Exam List */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Exam Management</CardTitle>
                  <CardDescription>
                    Add, edit, and manage exams in the system
                  </CardDescription>
                </div>
                <Dialog open={isExamDialogOpen} onOpenChange={setIsExamDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={resetExamForm}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Exam
                    </Button>
                  </DialogTrigger>
                  {isExamDialogOpen && (
                    <DialogContent>
                    <DialogHeader>
                      <DialogTitle>
                        {editingExam ? 'Edit Exam' : 'Add New Exam'}
                      </DialogTitle>
                      <DialogDescription>
                        {editingExam 
                          ? 'Update exam information'
                          : 'Enter the details for the new exam'
                        }
                      </DialogDescription>
                    </DialogHeader>
                    
                    <form onSubmit={handleExamSubmit} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="exam-id">Exam ID *</Label>
                        <Input
                          id="exam-id"
                          value={examForm.id}
                          onChange={(e) => setExamForm({...examForm, id: e.target.value.toLowerCase()})}
                          placeholder="e.g., exam01"
                          disabled={!!editingExam} // Disable ID field when editing
                        />
                        {examFormErrors.id && (
                          <p className="text-sm text-destructive">{examFormErrors.id}</p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          Unique identifier for the exam (alphanumeric, hyphens, underscores only)
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="exam-name">Exam Name *</Label>
                        <Input
                          id="exam-name"
                          value={examForm.name}
                          onChange={(e) => setExamForm({...examForm, name: e.target.value})}
                          placeholder="e.g., Final Exam"
                        />
                        {examFormErrors.name && (
                          <p className="text-sm text-destructive">{examFormErrors.name}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="exam-duration">Duration (hours) *</Label>
                        <Input
                          id="exam-duration"
                          type="number"
                          min="1"
                          max="12"
                          value={examForm.duration}
                          onChange={(e) => setExamForm({...examForm, duration: parseInt(e.target.value) || 0})}
                          placeholder="4"
                        />
                        {examFormErrors.duration && (
                          <p className="text-sm text-destructive">{examFormErrors.duration}</p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          Exam duration in hours (1-12). This will determine how many slots are generated.
                        </p>
                      </div>

                      <DialogFooter>
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => setIsExamDialogOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button type="submit">
                          {editingExam ? 'Update' : 'Add'} Exam
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                  )}
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {state.exams.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-muted-foreground mb-2">
                    No Exams Added
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Add your first exam to get started
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {state.exams.map((exam) => (
                    <div
                      key={exam.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <div>
                            <h3 className="font-medium">{exam.name}</h3>
                            <p className="text-sm text-muted-foreground">ID: {exam.id}</p>
                            <p className="text-sm text-muted-foreground">Duration: {exam.duration} hours</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <div className="text-center">
                          <p className="text-sm font-medium">{exam.slots.length}</p>
                          <p className="text-xs text-muted-foreground">Slots</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-medium">
                            {exam.slots.filter(slot => slot.proctorIds && slot.proctorIds.length > 0).length}
                          </p>
                          <p className="text-xs text-muted-foreground">Assigned</p>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditExam(exam)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            {/* Only render content when triggered by user */}
                            {(open) => open && (
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Exam</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete {exam.name}? This will remove all associated slots and assignments. This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction 
                                    onClick={() => handleDeleteExam(exam.id)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            )}
                          </AlertDialog>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Volunteer Management Tab */}
        <TabsContent value="volunteers" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Volunteers</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{state.volunteers?.length || 0}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Volunteers</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {state.events?.reduce((count, event) => 
                    count + (Array.isArray(event.volunteerIds) ? event.volunteerIds.length : 0), 0) || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  With assignments
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Unassigned</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {(state.volunteers?.length || 0) - 
                   (new Set(state.events?.flatMap(event => 
                     Array.isArray(event.volunteerIds) ? event.volunteerIds : []
                   ) || []).size)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Available volunteers
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Volunteer List */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Volunteer Management</CardTitle>
                  <CardDescription>
                    Add, edit, and manage volunteers
                  </CardDescription>
                </div>
                <Dialog open={isVolunteerDialogOpen} onOpenChange={setIsVolunteerDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={resetVolunteerForm}>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Add Volunteer
                    </Button>
                  </DialogTrigger>
                  {isVolunteerDialogOpen && (
                    <DialogContent>
                    <DialogHeader>
                      <DialogTitle>
                        {editingVolunteer ? 'Edit Volunteer' : 'Add New Volunteer'}
                      </DialogTitle>
                      <DialogDescription>
                        {editingVolunteer 
                          ? 'Update volunteer information'
                          : 'Enter the details for the new volunteer'
                        }
                      </DialogDescription>
                    </DialogHeader>
                    
                    <form onSubmit={handleVolunteerSubmit} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="volunteer-id">Volunteer ID *</Label>
                        <Input
                          id="volunteer-id"
                          value={volunteerForm.id}
                          onChange={(e) => setVolunteerForm({...volunteerForm, id: e.target.value})}
                          placeholder="e.g., VOL001"
                          disabled={!!editingVolunteer} // Disable ID field when editing
                        />
                        {volunteerFormErrors.id && (
                          <p className="text-sm text-destructive">{volunteerFormErrors.id}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="volunteer-name">Full Name *</Label>
                        <Input
                          id="volunteer-name"
                          value={volunteerForm.name}
                          onChange={(e) => setVolunteerForm({...volunteerForm, name: e.target.value})}
                          placeholder="e.g., John Doe"
                        />
                        {volunteerFormErrors.name && (
                          <p className="text-sm text-destructive">{volunteerFormErrors.name}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="volunteer-email">Email (Optional)</Label>
                        <Input
                          id="volunteer-email"
                          type="email"
                          value={volunteerForm.email}
                          onChange={(e) => setVolunteerForm({...volunteerForm, email: e.target.value})}
                          placeholder="e.g., john.doe@university.edu"
                        />
                        {volunteerFormErrors.email && (
                          <p className="text-sm text-destructive">{volunteerFormErrors.email}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="volunteer-skills">Skills (Optional)</Label>
                        <Input
                          id="volunteer-skills"
                          value={volunteerForm.skills}
                          onChange={(e) => setVolunteerForm({...volunteerForm, skills: e.target.value})}
                          placeholder="e.g., First aid, Technical support"
                        />
                      </div>

                      <DialogFooter>
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => setIsVolunteerDialogOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button type="submit">
                          {editingVolunteer ? 'Update' : 'Add'} Volunteer
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                  )}
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {!state.volunteers || state.volunteers.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-muted-foreground mb-2">
                    No Volunteers Added
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Add your first volunteer to get started
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {state.volunteers.map((volunteer) => (
                    <div
                      key={volunteer.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <div>
                            <h3 className="font-medium">{volunteer.name}</h3>
                            <p className="text-sm text-muted-foreground">ID: {volunteer.id}</p>
                            {volunteer.email && (
                              <p className="text-sm text-muted-foreground">{volunteer.email}</p>
                            )}
                            {volunteer.skills && (
                              <p className="text-sm text-muted-foreground">Skills: {volunteer.skills}</p>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <div className="text-center">
                          <p className="text-sm font-medium">
                            {state.events?.reduce((count, event) => 
                              count + (Array.isArray(event.volunteerIds) && event.volunteerIds.includes(volunteer.id) ? 1 : 0), 0) || 0}
                          </p>
                          <p className="text-xs text-muted-foreground">Events</p>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditVolunteer(volunteer)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            {(open) => open && (
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Volunteer</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete {volunteer.name}? This will also remove them from all assigned events. This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction 
                                    onClick={() => handleDeleteVolunteer(volunteer.id)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            )}
                          </AlertDialog>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Event Management Tab */}
        <TabsContent value="events" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Events</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{state.events?.length || 0}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Upcoming Events</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {state.events?.filter(event => new Date(event.date) >= new Date()).length || 0}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Fully Staffed</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {state.events?.filter(event => 
                    Array.isArray(event.volunteerIds) && 
                    event.volunteerIds.length >= (event.requiredVolunteers || 1)
                  ).length || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  With sufficient volunteers
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Event List */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Event Management</CardTitle>
                  <CardDescription>
                    Add, edit, and manage events
                  </CardDescription>
                </div>
                <Dialog open={isEventDialogOpen} onOpenChange={(open) => {
                    if (open) resetEventForm();
                    setIsEventDialogOpen(open);
                  }}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Event
                    </Button>
                  </DialogTrigger>
                  {isEventDialogOpen && (
                    <DialogContent>
                    <DialogHeader>
                      <DialogTitle>
                        {editingEvent ? 'Edit Event' : 'Add New Event'}
                      </DialogTitle>
                      <DialogDescription>
                        {editingEvent 
                          ? 'Update event information'
                          : 'Enter the details for the new event'
                        }
                      </DialogDescription>
                    </DialogHeader>
                    
                    <form onSubmit={handleEventSubmit} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="event-id">Event ID *</Label>
                        <Input
                          id="event-id"
                          value={eventForm.id}
                          onChange={(e) => setEventForm({...eventForm, id: e.target.value.toLowerCase()})}
                          placeholder="e.g., event01"
                          disabled={!!editingEvent} // Disable ID field when editing
                        />
                        {eventFormErrors.id && (
                          <p className="text-sm text-destructive">{eventFormErrors.id}</p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          Unique identifier for the event (alphanumeric, hyphens, underscores only)
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="event-name">Event Name *</Label>
                        <Input
                          id="event-name"
                          value={eventForm.name}
                          onChange={(e) => setEventForm({...eventForm, name: e.target.value})}
                          placeholder="e.g., Orientation Day"
                        />
                        {eventFormErrors.name && (
                          <p className="text-sm text-destructive">{eventFormErrors.name}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="event-date">Event Date *</Label>
                        <Input
                          id="event-date"
                          type="date"
                          value={eventForm.date}
                          onChange={(e) => setEventForm({...eventForm, date: e.target.value})}
                        />
                        {eventFormErrors.date && (
                          <p className="text-sm text-destructive">{eventFormErrors.date}</p>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="event-start-time">Start Time *</Label>
                        <Input
                          id="event-start-time"
                          type="time"
                          value={eventForm.startTime}
                          onChange={(e) => setEventForm({...eventForm, startTime: e.target.value})}
                        />
                        {eventFormErrors.startTime && (
                          <p className="text-sm text-destructive">{eventFormErrors.startTime}</p>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="event-duration">Duration (hours) *</Label>
                        <Input
                          id="event-duration"
                          type="number"
                          min="1"
                          max="12"
                          value={eventForm.duration}
                          onChange={(e) => setEventForm({
                            ...eventForm, 
                            duration: parseInt(e.target.value) || 1
                          })}
                          placeholder="4"
                        />
                        {eventFormErrors.duration && (
                          <p className="text-sm text-destructive">{eventFormErrors.duration}</p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          Event duration in hours (1-12). This will determine how many volunteer slots are generated.
                        </p>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="event-description">Description (Optional)</Label>
                        <Input
                          id="event-description"
                          value={eventForm.description}
                          onChange={(e) => setEventForm({...eventForm, description: e.target.value})}
                          placeholder="Brief description of the event"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="event-volunteers">Required Volunteers *</Label>
                        <Input
                          id="event-volunteers"
                          type="number"
                          min="1"
                          max="50"
                          value={eventForm.requiredVolunteers}
                          onChange={(e) => setEventForm({
                            ...eventForm, 
                            requiredVolunteers: parseInt(e.target.value) || 1
                          })}
                          placeholder="1"
                        />
                        {eventFormErrors.requiredVolunteers && (
                          <p className="text-sm text-destructive">{eventFormErrors.requiredVolunteers}</p>
                        )}
                      </div>

                      <DialogFooter>
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => setIsEventDialogOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button type="submit">
                          {editingEvent ? 'Update' : 'Add'} Event
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                  )}
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {!state.events || state.events.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-muted-foreground mb-2">
                    No Events Added
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Add your first event to get started
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {state.events.map((event) => (
                    <div
                      key={event.id}
                      className="flex flex-col p-4 border rounded-lg"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex-1">
                          <h3 className="font-medium">{event.name}</h3>
                          <div className="flex flex-wrap gap-2">
                            <p className="text-sm text-muted-foreground">Date: {new Date(event.date).toLocaleDateString()}</p>
                            <p className="text-sm text-muted-foreground">Time: {event.startTime || 'Not set'}</p>
                            <p className="text-sm text-muted-foreground">Duration: {event.duration || 4} hours</p>
                          </div>
                          {event.description && (
                            <p className="text-sm text-muted-foreground">{event.description}</p>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-4">
                          <div className="text-center">
                            <p className="text-sm font-medium">
                              {Array.isArray(event.volunteerIds) ? event.volunteerIds.length : 0} / {event.requiredVolunteers || 1}
                            </p>
                            <p className="text-xs text-muted-foreground">Volunteers</p>
                          </div>
                          <div className="text-center">
                            <p className="text-sm font-medium">
                              {Array.isArray(event.slots) ? event.slots.length : 0}
                            </p>
                            <p className="text-xs text-muted-foreground">Slots</p>
                          </div>
                        </div>
                      </div>
                      
                      {/* Slot Display Section */}
                      {Array.isArray(event.slots) && event.slots.length > 0 && (
                        <div className="mt-4 border-t pt-4">
                          <h4 className="text-sm font-medium mb-2">Event Slots</h4>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                            {event.slots.map((slot) => (
                              <div 
                                key={slot.id} 
                                className={`text-xs p-2 rounded border ${
                                  slot.volunteerIds && slot.volunteerIds.length >= event.requiredVolunteers 
                                    ? 'bg-green-50 border-green-200' 
                                    : 'bg-amber-50 border-amber-200'
                                }`}
                              >
                                <div className="font-medium">
                                  {new Date(slot.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - 
                                  {new Date(slot.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                                <div className="flex justify-between items-center mt-1">
                                  <span>
                                    {Array.isArray(slot.volunteerIds) ? slot.volunteerIds.length : 0} / {event.requiredVolunteers} assigned
                                  </span>
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="h-6 px-2"
                                    onClick={() => handleSlotVolunteerManagement(event.id, slot.id)}
                                  >
                                    Manage
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-end space-x-2 mt-4">
                        {Array.isArray(event.slots) && event.slots.length === 0 && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              const eventStartDateTime = new Date(`${event.date}T${event.startTime || '09:00'}`);
                              actions.generateEventSlots(event.id, eventStartDateTime.toISOString());
                            }}
                          >
                            <Clock className="h-4 w-4 mr-2" />
                            Generate Slots
                          </Button>
                        )}
                        
                        <div className="flex items-center space-x-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <UserPlus className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            {(open) => open && (
                              <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Assign Volunteers</DialogTitle>
                                <DialogDescription>
                                  Assign volunteers to "{event.name}"
                                </DialogDescription>
                              </DialogHeader>
                              
                              <div className="space-y-4 my-4 max-h-[300px] overflow-y-auto">
                                <div className="text-sm font-medium">Current Volunteers:</div>
                                {Array.isArray(event.volunteerIds) && event.volunteerIds.length > 0 ? (
                                  event.volunteerIds.map(volunteerId => {
                                    const volunteer = state.volunteers?.find(v => v.id === volunteerId);
                                    return volunteer ? (
                                      <div key={volunteer.id} className="flex items-center justify-between p-2 border rounded">
                                        <span>{volunteer.name}</span>
                                        <Button 
                                          variant="outline" 
                                          size="sm"
                                          onClick={() => handleRemoveVolunteerFromEvent(event.id, volunteer.id)}
                                        >
                                          Remove
                                        </Button>
                                      </div>
                                    ) : null;
                                  })
                                ) : (
                                  <p className="text-sm text-muted-foreground">No volunteers assigned yet</p>
                                )}
                                
                                <div className="text-sm font-medium mt-6">Available Volunteers:</div>
                                {state.volunteers?.filter(volunteer => 
                                  !Array.isArray(event.volunteerIds) || !event.volunteerIds.includes(volunteer.id)
                                ).length > 0 ? (
                                  state.volunteers
                                    .filter(volunteer => !Array.isArray(event.volunteerIds) || !event.volunteerIds.includes(volunteer.id))
                                    .map(volunteer => (
                                      <div key={volunteer.id} className="flex items-center justify-between p-2 border rounded">
                                        <div>
                                          <div>{volunteer.name}</div>
                                          {volunteer.skills && <div className="text-xs text-muted-foreground">Skills: {volunteer.skills}</div>}
                                        </div>
                                        <Button 
                                          variant="outline" 
                                          size="sm"
                                          onClick={() => handleAssignVolunteerToEvent(event.id, volunteer.id)}
                                        >
                                          Assign
                                        </Button>
                                      </div>
                                    ))
                                ) : (
                                  <p className="text-sm text-muted-foreground">No more volunteers available</p>
                                )}
                              </div>
                              
                              <DialogFooter>
                                <Button variant="outline" type="button">
                                  Close
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                            )}
                          </Dialog>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditEvent(event)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            {(open) => open && (
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Event</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete "{event.name}"? This will remove all volunteer assignments for this event. This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction 
                                    onClick={() => handleDeleteEvent(event.id)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            )}
                          </AlertDialog>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Slot Management Dialog */}
          <Dialog open={isSlotManagementOpen} onOpenChange={setIsSlotManagementOpen}>
            {(open) => open && (
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Manage Slot Volunteers</DialogTitle>
                  <DialogDescription>
                    Assign volunteers to this time slot
                  </DialogDescription>
                </DialogHeader>
                
                {currentEventId && currentSlot && (
                  <>
                    {(() => {
                      const event = state.events?.find(e => e.id === currentEventId);
                      const slot = event?.slots?.find(s => s.id === currentSlot);
                      
                      if (!event || !slot) {
                        return <p>Slot not found</p>;
                      }
                      
                      return (
                        <div className="space-y-4 my-4 max-h-[400px] overflow-y-auto">
                          <div className="p-3 bg-muted rounded-lg">
                            <div className="font-medium">{event.name}</div>
                            <div className="text-sm">
                              {new Date(slot.startTime).toLocaleString([], {
                                weekday: 'short',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })} - 
                              {new Date(slot.endTime).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </div>
                          </div>
                          
                          <div className="text-sm font-medium">Current Volunteers:</div>
                          {Array.isArray(slot.volunteerIds) && slot.volunteerIds.length > 0 ? (
                            <div className="space-y-2">
                              {slot.volunteerIds.map(volunteerId => {
                                const volunteer = state.volunteers?.find(v => v.id === volunteerId);
                                return volunteer ? (
                                  <div key={volunteer.id} className="flex items-center justify-between p-2 border rounded">
                                    <span>{volunteer.name}</span>
                                    <Button 
                                      variant="outline" 
                                      size="sm"
                                      onClick={() => handleRemoveVolunteerFromSlot(currentEventId, currentSlot, volunteer.id)}
                                    >
                                      Remove
                                    </Button>
                                  </div>
                                ) : null;
                              })}
                            </div>
                          ) : (
                            <p className="text-sm text-muted-foreground">No volunteers assigned to this slot yet</p>
                          )}
                          
                          <div className="text-sm font-medium mt-6">Available Volunteers:</div>
                          {(() => {
                            const assignedVolunteers = slot.volunteerIds || [];
                            const availableVolunteers = state.volunteers?.filter(volunteer => 
                              !assignedVolunteers.includes(volunteer.id)
                            ) || [];
                            
                            return availableVolunteers.length > 0 ? (
                              <div className="space-y-2">
                                {availableVolunteers.map(volunteer => (
                                  <div key={volunteer.id} className="flex items-center justify-between p-2 border rounded">
                                    <div>
                                      <div>{volunteer.name}</div>
                                      {volunteer.skills && <div className="text-xs text-muted-foreground">Skills: {volunteer.skills}</div>}
                                    </div>
                                    <Button 
                                      variant="outline" 
                                      size="sm"
                                      onClick={() => handleAssignVolunteerToSlot(currentEventId, currentSlot, volunteer.id)}
                                    >
                                      Assign
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-sm text-muted-foreground">No more volunteers available</p>
                            );
                          })()}
                        </div>
                      );
                    })()}
                  </>
                )}
                
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsSlotManagementOpen(false)}>
                    Close
                  </Button>
                </DialogFooter>
              </DialogContent>
            )}
          </Dialog>
        </TabsContent>
        
        {/* System Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>System Configuration</CardTitle>
              <CardDescription>
                Configure system-wide settings and preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Points per Slot</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      type="number"
                      value={state.pointsPerSlot}
                      readOnly
                      className="w-24"
                    />
                    <span className="text-sm text-muted-foreground">points</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Currently fixed at {state.pointsPerSlot} points per slot
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Total Exams</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      type="number"
                      value={state.exams.length}
                      readOnly
                      className="w-24"
                    />
                    <span className="text-sm text-muted-foreground">exams</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Customizable from the Exam Management tab
                  </p>
                </div>
              </div>

              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">System Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p><strong>Data Storage:</strong> Local Browser Storage</p>
                    <p><strong>Authentication:</strong> Static Password</p>
                  </div>
                  <div>
                    <p><strong>Total Slots:</strong> {state.exams.reduce((sum, exam) => sum + exam.slots.length, 0)}</p>
                    <p><strong>Assigned Slots:</strong> {state.exams.reduce((sum, exam) => sum + exam.slots.filter(slot => slot.proctorId).length, 0)}</p>
                  </div>
                </div>
              </div>

              <div className="p-4 border border-amber-200 bg-amber-50 rounded-lg">
                <h4 className="font-medium text-amber-800 mb-2">Future Enhancements</h4>
                <ul className="text-sm text-amber-700 space-y-1">
                  <li>• Database integration for persistent storage</li>
                  <li>• User authentication with roles and permissions</li>
                  <li>• Email notifications for slot assignments</li>
                  <li>• Export functionality for reports</li>
                  <li>• Advanced scheduling with conflict detection</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

