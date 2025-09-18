import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// Calculate total points for a proctor
export function calculateProctorPoints(proctorId, exams, pointsPerSlot = 10) {
  let totalSlots = 0;
  
  exams.forEach(exam => {
    exam.slots.forEach(slot => {
      if (slot.proctorIds && slot.proctorIds.includes(proctorId)) {
        totalSlots++;
      }
    });
  });
  
  return totalSlots * pointsPerSlot;
}

// Calculate total hours worked by a proctor
export function calculateProctorHours(proctorId, exams) {
  let totalHours = 0;
  
  exams.forEach(exam => {
    exam.slots.forEach(slot => {
      if (slot.proctorIds && slot.proctorIds.includes(proctorId)) {
        totalHours++;
      }
    });
  });
  
  return totalHours;
}

// Get all slots assigned to a proctor
export function getProctorSlots(proctorId, exams) {
  const slots = [];
  
  exams.forEach(exam => {
    exam.slots.forEach(slot => {
      if (slot.proctorIds && slot.proctorIds.includes(proctorId)) {
        slots.push({
          ...slot,
          examName: exam.name
        });
      }
    });
  });
  
  return slots.sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
}

// Format date and time for display
export function formatDateTime(dateString) {
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// Format time only
export function formatTime(dateString) {
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });
}

// Generate a unique ID
export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Get proctor statistics for leaderboard
export function getProctorStats(proctors, exams, pointsPerSlot = 10) {
  return proctors.map(proctor => {
    const points = calculateProctorPoints(proctor.id, exams, pointsPerSlot);
    const hours = calculateProctorHours(proctor.id, exams);
    const slots = getProctorSlots(proctor.id, exams);
    
    return {
      ...proctor,
      points,
      hours,
      slots: slots.length,
      assignedSlots: slots
    };
  }).sort((a, b) => b.points - a.points);
}

// Check if a slot is available (not assigned to any proctor)
export function isSlotAvailable(examId, slotId, exams) {
  const exam = exams.find(e => e.id === examId);
  if (!exam) return false;
  
  const slot = exam.slots.find(s => s.id === slotId);
  return slot && slot.proctorIds.length < 5;
}

// Get available proctors (not assigned to a specific time slot)
export function getAvailableProctors(proctors, exams, targetSlotTime) {
  const targetTime = new Date(targetSlotTime);
  
  return proctors.filter(proctor => {
    // Check if proctor is already assigned to a slot at the same time
    for (const exam of exams) {
      for (const slot of exam.slots) {
        if (slot.proctorIds.includes(proctor.id)) {
          const slotTime = new Date(slot.startTime);
          // Check if times overlap (assuming 1-hour slots)
          if (Math.abs(slotTime - targetTime) < 60 * 60 * 1000) {
            return false;
          }
        }
      }
    }
    return true;
  });
}

// Validate proctor data
export function validateProctor(proctor) {
  const errors = {};
  
  if (!proctor.name || proctor.name.trim().length === 0) {
    errors.name = 'Name is required';
  }
  
  if (!proctor.id || proctor.id.trim().length === 0) {
    errors.id = 'ID is required';
  }
  
  if (proctor.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(proctor.email)) {
    errors.email = 'Invalid email format';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

