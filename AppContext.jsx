import React, { createContext, useContext, useReducer, useEffect } from 'react';

// Initial state
const initialState = {
  exams: [
    {
      id: 'exam00',
      name: 'Exam00',
      duration: 4, // hours
      slots: []
    },
    {
      id: 'exam01',
      name: 'Exam01',
      duration: 4, // hours
      slots: []
    },
    {
      id: 'exam02',
      name: 'Exam02',
      duration: 4, // hours
      slots: []
    },
    {
      id: 'exam03',
      name: 'Exam03',
      duration: 8, // hours
      slots: []
    }
  ],
  proctors: [
    { id: 'Imqandyl', name: 'Imqandyl', email: '' },
    { id: 'fkuruthl', name: 'Fkuruthl', email: '' },
    { id: 'neali', name: 'Neali', email: '' },
    { id: 'Hankhali', name: 'Hankhali', email: '' },
    { id: 'kqaddour', name: 'Kqaddour', email: '' },
    { id: 'mohkhan', name: 'Mohkhan', email: '' },
    { id: 'mosami', name: 'Mosami', email: '' },
    { id: 'abardhan', name: 'Abardhan', email: '' },
    { id: 'aabashee', name: 'Aabashee', email: '' },
    { id: 'aradwan', name: 'Aradwan', email: '' },
    { id: 'mamuzamm', name: 'Mamuzamm', email: '' },
    { id: 'ytapano', name: 'Ytapano', email: '' },
    { id: 'absalem', name: 'Absalem', email: '' },
    { id: 'nakhalil', name: 'Nakhalil', email: '' },
    { id: 'maabdulr', name: 'Maabdulr', email: '' },
    { id: 'mbabayan', name: 'Mbabayan', email: '' },
    { id: 'aalbugar', name: 'Aalbugar', email: '' },
    { id: 'ghsaad', name: 'Ghsaad', email: '' },
    { id: 'Amagoury', name: 'Amagoury', email: '' },
    { id: 'sngantch', name: 'Sngantch', email: '' },
    { id: 'aali2', name: 'Aali2', email: '' },
    { id: 'aalbobak', name: 'Aalbobak', email: '' },
    { id: 'meid', name: 'Meid', email: '' },
    { id: 'rradin-m', name: 'Rradin-m', email: '' },
    { id: 'Desteve', name: 'Desteve', email: '' },
    { id: 'Nosman', name: 'Nosman', email: '' },
    { id: 'hbasheer', name: 'Hbasheer', email: '' },
    { id: 'enoshahi', name: 'Enoshahi', email: '' },
    { id: 'nkunnath', name: 'Nkunnath', email: '' },
    { id: 'sgantch', name: 'Sgantch', email: '' },
    { id: 'ffidha', name: 'Ffidha', email: '' },
    { id: 'hassaleh', name: 'Hassaleh', email: '' },
    { id: 'dimirzoe', name: 'Dimirzoe', email: '' },
    { id: 'tabadawi', name: 'Tabadawi', email: '' },
  ],
  volunteers: [
    { id: 'vol001', name: 'John Volunteer', email: 'john@example.com', skills: 'First aid' },
    { id: 'vol002', name: 'Jane Helper', email: 'jane@example.com', skills: 'Technical support' }
  ],
  events: [
    { 
      id: 'event001',
      name: 'Orientation Day',
      date: '2025-10-10',
      startTime: '09:00',
      duration: 4,
      description: 'New student orientation',
      requiredVolunteers: 3,
      volunteerIds: [],
      slots: []
    }
  ],
  isAdminLoggedIn: false,
  pointsPerSlot: 10
};

// Action types
const ActionTypes = {
  ADD_PROCTOR: 'ADD_PROCTOR',
  UPDATE_PROCTOR: 'UPDATE_PROCTOR',
  DELETE_PROCTOR: 'DELETE_PROCTOR',
  ASSIGN_PROCTOR_TO_SLOT: 'ASSIGN_PROCTOR_TO_SLOT',
  REMOVE_PROCTOR_FROM_SLOT: 'REMOVE_PROCTOR_FROM_SLOT',
  GENERATE_SLOTS: 'GENERATE_SLOTS',
  SET_ADMIN_LOGIN: 'SET_ADMIN_LOGIN',
  LOAD_DATA: 'LOAD_DATA',
  SAVE_DATA: 'SAVE_DATA',
  ADD_EXAM: 'ADD_EXAM',
  UPDATE_EXAM: 'UPDATE_EXAM',
  DELETE_EXAM: 'DELETE_EXAM',
  ADD_VOLUNTEER: 'ADD_VOLUNTEER',
  UPDATE_VOLUNTEER: 'UPDATE_VOLUNTEER',
  DELETE_VOLUNTEER: 'DELETE_VOLUNTEER',
  ADD_EVENT: 'ADD_EVENT',
  UPDATE_EVENT: 'UPDATE_EVENT',
  DELETE_EVENT: 'DELETE_EVENT',
  ASSIGN_VOLUNTEER_TO_EVENT: 'ASSIGN_VOLUNTEER_TO_EVENT',
  REMOVE_VOLUNTEER_FROM_EVENT: 'REMOVE_VOLUNTEER_FROM_EVENT',
  GENERATE_EVENT_SLOTS: 'GENERATE_EVENT_SLOTS',
  ASSIGN_VOLUNTEER_TO_EVENT_SLOT: 'ASSIGN_VOLUNTEER_TO_EVENT_SLOT',
  REMOVE_VOLUNTEER_FROM_EVENT_SLOT: 'REMOVE_VOLUNTEER_FROM_EVENT_SLOT'
};

// Reducer function
function appReducer(state, action) {
  switch (action.type) {
    case ActionTypes.ADD_PROCTOR:
      return {
        ...state,
        proctors: [...state.proctors, action.payload]
      };

    case ActionTypes.UPDATE_PROCTOR:
      return {
        ...state,
        proctors: state.proctors.map(proctor =>
          proctor.id === action.payload.id ? action.payload : proctor
        )
      };
      
    case ActionTypes.ADD_EXAM:
      return {
        ...state,
        exams: [...state.exams, {
          ...action.payload,
          slots: []
        }]
      };
      
    case ActionTypes.UPDATE_EXAM:
      return {
        ...state,
        exams: state.exams.map(exam =>
          exam.id === action.payload.id ? {
            ...action.payload,
            slots: exam.slots // Preserve existing slots
          } : exam
        )
      };

    case ActionTypes.DELETE_PROCTOR:
      return {
        ...state,
        proctors: state.proctors.filter(proctor => proctor.id !== action.payload),
        exams: state.exams.map(exam => ({
          ...exam,
          slots: Array.isArray(exam.slots) ? exam.slots.map(slot => ({
            ...slot,
            proctorIds: Array.isArray(slot.proctorIds) ? slot.proctorIds.filter(id => id !== action.payload) : []
          })) : []
        }))
      };

    case ActionTypes.ASSIGN_PROCTOR_TO_SLOT:
      return {
        ...state,
        exams: state.exams.map(exam =>
          exam.id === action.payload.examId
            ? {
                ...exam,
                slots: Array.isArray(exam.slots) ? exam.slots.map(slot =>
                  slot.id === action.payload.slotId
                    ? { 
                        ...slot, 
                        proctorIds: [...new Set([...(Array.isArray(slot.proctorIds) ? slot.proctorIds : []), action.payload.proctorId])] 
                      }
                    : slot
                ) : []
              }
            : exam
        )
      };

    case ActionTypes.REMOVE_PROCTOR_FROM_SLOT:
      return {
        ...state,
        exams: state.exams.map(exam =>
          exam.id === action.payload.examId
            ? {
                ...exam,
                slots: Array.isArray(exam.slots) ? exam.slots.map(slot =>
                  slot.id === action.payload.slotId
                    ? { 
                        ...slot, 
                        proctorIds: Array.isArray(slot.proctorIds) 
                          ? slot.proctorIds.filter(id => id !== action.payload.proctorId) 
                          : [] 
                      }
                    : slot
                ) : []
              }
            : exam
        )
      };

    case ActionTypes.GENERATE_SLOTS:
      return {
        ...state,
        exams: state.exams.map(exam =>
          exam.id === action.payload.examId
            ? { ...exam, slots: action.payload.slots }
            : exam
        )
      };

    case ActionTypes.SET_ADMIN_LOGIN:
      return {
        ...state,
        isAdminLoggedIn: action.payload
      };

    case ActionTypes.LOAD_DATA:
      return {
        ...state,
        ...action.payload
      };
      
    case ActionTypes.DELETE_EXAM:
      return {
        ...state,
        exams: state.exams.filter(exam => exam.id !== action.payload)
      };
      
    case ActionTypes.ADD_VOLUNTEER:
      return {
        ...state,
        volunteers: [...(state.volunteers || []), action.payload]
      };

    case ActionTypes.UPDATE_VOLUNTEER:
      return {
        ...state,
        volunteers: (state.volunteers || []).map(volunteer =>
          volunteer.id === action.payload.id ? action.payload : volunteer
        )
      };

    case ActionTypes.DELETE_VOLUNTEER:
      return {
        ...state,
        volunteers: (state.volunteers || []).filter(volunteer => volunteer.id !== action.payload),
        events: (state.events || []).map(event => ({
          ...event,
          volunteerIds: Array.isArray(event.volunteerIds) 
            ? event.volunteerIds.filter(id => id !== action.payload) 
            : []
        }))
      };
      
    case ActionTypes.ADD_EVENT:
      return {
        ...state,
        events: [...(state.events || []), action.payload]
      };

    case ActionTypes.UPDATE_EVENT:
      return {
        ...state,
        events: (state.events || []).map(event =>
          event.id === action.payload.id ? {
            ...action.payload,
            volunteerIds: event.volunteerIds || [] // Preserve existing volunteer assignments
          } : event
        )
      };

    case ActionTypes.DELETE_EVENT:
      return {
        ...state,
        events: (state.events || []).filter(event => event.id !== action.payload)
      };
      
    case ActionTypes.ASSIGN_VOLUNTEER_TO_EVENT:
      return {
        ...state,
        events: (state.events || []).map(event =>
          event.id === action.payload.eventId
            ? {
                ...event,
                volunteerIds: [...new Set([...(Array.isArray(event.volunteerIds) ? event.volunteerIds : []), action.payload.volunteerId])]
              }
            : event
        )
      };

    case ActionTypes.REMOVE_VOLUNTEER_FROM_EVENT:
      return {
        ...state,
        events: (state.events || []).map(event =>
          event.id === action.payload.eventId
            ? {
                ...event,
                volunteerIds: Array.isArray(event.volunteerIds) 
                  ? event.volunteerIds.filter(id => id !== action.payload.volunteerId) 
                  : []
              }
            : event
        )
      };
      
    case ActionTypes.GENERATE_EVENT_SLOTS:
      return {
        ...state,
        events: (state.events || []).map(event =>
          event.id === action.payload.eventId
            ? { ...event, slots: action.payload.slots }
            : event
        )
      };
      
    case ActionTypes.ASSIGN_VOLUNTEER_TO_EVENT_SLOT:
      return {
        ...state,
        events: (state.events || []).map(event =>
          event.id === action.payload.eventId
            ? {
                ...event,
                slots: Array.isArray(event.slots) 
                  ? event.slots.map(slot =>
                      slot.id === action.payload.slotId
                        ? { 
                            ...slot, 
                            volunteerIds: [...new Set([...(Array.isArray(slot.volunteerIds) ? slot.volunteerIds : []), action.payload.volunteerId])]
                          }
                        : slot
                    ) 
                  : []
              }
            : event
        )
      };
      
    case ActionTypes.REMOVE_VOLUNTEER_FROM_EVENT_SLOT:
      return {
        ...state,
        events: (state.events || []).map(event =>
          event.id === action.payload.eventId
            ? {
                ...event,
                slots: Array.isArray(event.slots) 
                  ? event.slots.map(slot =>
                      slot.id === action.payload.slotId
                        ? { 
                            ...slot, 
                            volunteerIds: Array.isArray(slot.volunteerIds) 
                              ? slot.volunteerIds.filter(id => id !== action.payload.volunteerId) 
                              : []
                          }
                        : slot
                    ) 
                  : []
              }
            : event
        )
      };

    default:
      return state;
  }
}

// Create context
const AppContext = createContext();

// Context provider component
export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem("examProctoringSytem");
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        dispatch({ type: ActionTypes.LOAD_DATA, payload: parsedData });
      } catch (error) {
        console.error("Error loading saved data:", error);
      }
    }
  }, []);

  // Save data to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem("examProctoringSytem", JSON.stringify(state));
  }, [state]);

  // Action creators
  const actions = {
    addProctor: (proctor) => {
      dispatch({ type: ActionTypes.ADD_PROCTOR, payload: proctor });
    },

    updateProctor: (proctor) => {
      dispatch({ type: ActionTypes.UPDATE_PROCTOR, payload: proctor });
    },

    deleteProctor: (proctorId) => {
      dispatch({ type: ActionTypes.DELETE_PROCTOR, payload: proctorId });
    },
    
    addExam: (exam) => {
      dispatch({ type: ActionTypes.ADD_EXAM, payload: exam });
    },
    
    updateExam: (exam) => {
      dispatch({ type: ActionTypes.UPDATE_EXAM, payload: exam });
    },
    
    deleteExam: (examId) => {
      dispatch({ type: ActionTypes.DELETE_EXAM, payload: examId });
    },

    assignProctorToSlot: (examId, slotId, proctorId) => {
      dispatch({
        type: ActionTypes.ASSIGN_PROCTOR_TO_SLOT,
        payload: { examId, slotId, proctorId }
      });
    },

    removeProctorFromSlot: (examId, slotId, proctorId) => {
      dispatch({
        type: ActionTypes.REMOVE_PROCTOR_FROM_SLOT,
        payload: { examId, slotId, proctorId }
      });
    },

    generateSlots: (examId, startTime) => {
      const exam = state.exams.find((e) => e.id === examId);
      if (!exam) return;

      const slots = [];
      const totalSlots = exam.duration + 1; // +1 for preparation hour

      for (let i = 0; i < totalSlots; i++) {
        const slotTime = new Date(startTime);
        slotTime.setHours(slotTime.getHours() + i);

        slots.push({
          id: `${examId}-slot-${i}`,
          examId,
          startTime: slotTime.toISOString(),
          endTime: new Date(slotTime.getTime() + 60 * 60 * 1000).toISOString(), // +1 hour
          proctorIds: [],
          isPreparation: i === 0,
        });
      }

      dispatch({
        type: ActionTypes.GENERATE_SLOTS,
        payload: { examId, slots },
      });
    },

    setAdminLogin: (isLoggedIn) => {
      dispatch({ type: ActionTypes.SET_ADMIN_LOGIN, payload: isLoggedIn });
    },
    
    addVolunteer: (volunteer) => {
      dispatch({ type: ActionTypes.ADD_VOLUNTEER, payload: volunteer });
    },

    updateVolunteer: (volunteer) => {
      dispatch({ type: ActionTypes.UPDATE_VOLUNTEER, payload: volunteer });
    },

    deleteVolunteer: (volunteerId) => {
      dispatch({ type: ActionTypes.DELETE_VOLUNTEER, payload: volunteerId });
    },
    
    addEvent: (event) => {
      dispatch({ type: ActionTypes.ADD_EVENT, payload: event });
    },
    
    updateEvent: (event) => {
      dispatch({ type: ActionTypes.UPDATE_EVENT, payload: event });
    },
    
    deleteEvent: (eventId) => {
      dispatch({ type: ActionTypes.DELETE_EVENT, payload: eventId });
    },
    
    assignVolunteerToEvent: (eventId, volunteerId) => {
      dispatch({
        type: ActionTypes.ASSIGN_VOLUNTEER_TO_EVENT,
        payload: { eventId, volunteerId }
      });
    },
    
    removeVolunteerFromEvent: (eventId, volunteerId) => {
      dispatch({
        type: ActionTypes.REMOVE_VOLUNTEER_FROM_EVENT,
        payload: { eventId, volunteerId }
      });
    },
    
    generateEventSlots: (eventId, startTime) => {
      const event = state.events?.find((e) => e.id === eventId);
      if (!event) return;

      const slots = [];
      const totalSlots = event.duration || 4; // Default to 4 hours if not specified

      for (let i = 0; i < totalSlots; i++) {
        const slotTime = new Date(startTime);
        slotTime.setHours(slotTime.getHours() + i);

        slots.push({
          id: `${eventId}-slot-${i}`,
          eventId,
          startTime: slotTime.toISOString(),
          endTime: new Date(slotTime.getTime() + 60 * 60 * 1000).toISOString(), // +1 hour
          volunteerIds: [],
        });
      }

      dispatch({
        type: ActionTypes.GENERATE_EVENT_SLOTS,
        payload: { eventId, slots },
      });
    },
    
    assignVolunteerToEventSlot: (eventId, slotId, volunteerId) => {
      dispatch({
        type: ActionTypes.ASSIGN_VOLUNTEER_TO_EVENT_SLOT,
        payload: { eventId, slotId, volunteerId }
      });
    },
    
    removeVolunteerFromEventSlot: (eventId, slotId, volunteerId) => {
      dispatch({
        type: ActionTypes.REMOVE_VOLUNTEER_FROM_EVENT_SLOT,
        payload: { eventId, slotId, volunteerId }
      });
    },
  };

  return (
    <AppContext.Provider value={{ state, actions }}>
      {children}
    </AppContext.Provider>
  );
}

// Custom hook to use the context
export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}

export { ActionTypes };


