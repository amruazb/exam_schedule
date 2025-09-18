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
  SAVE_DATA: 'SAVE_DATA'
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

    case ActionTypes.DELETE_PROCTOR:
      return {
        ...state,
        proctors: state.proctors.filter(proctor => proctor.id !== action.payload),
        exams: state.exams.map(exam => ({
          ...exam,
          slots: exam.slots.map(slot => ({
            ...slot,
            proctorIds: slot.proctorIds.filter(id => id !== action.payload)
          }))
        }))
      };

    case ActionTypes.ASSIGN_PROCTOR_TO_SLOT:
      return {
        ...state,
        exams: state.exams.map(exam =>
          exam.id === action.payload.examId
            ? {
                ...exam,
                slots: exam.slots.map(slot =>
                  slot.id === action.payload.slotId
                    ? { ...slot, proctorIds: [...new Set([...slot.proctorIds, action.payload.proctorId])] }
                    : slot
                )
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
                slots: exam.slots.map(slot =>
                  slot.id === action.payload.slotId
                    ? { ...slot, proctorIds: slot.proctorIds.filter(id => id !== action.payload.proctorId) }
                    : slot
                )
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


