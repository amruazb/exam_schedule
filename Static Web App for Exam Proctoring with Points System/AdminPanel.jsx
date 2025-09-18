import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Lock, Shield, UserPlus, Edit, Trash2, Users, Settings, Eye, EyeOff } from 'lucide-react';
import { generateId, validateProctor, getProctorStats } from '../lib/utils';

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
                    Exam00, Exam01, Exam02 (4h each), Exam03 (8h)
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

