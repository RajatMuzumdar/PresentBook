// auth.js

// Action types
export const SIGN_IN = 'SIGN_IN';
export const SIGN_OUT = 'SIGN_OUT';

// Action creators
export const signIn = user => ({
  type: SIGN_IN,
  payload: user,
});

export const signOut = () => ({
  type: SIGN_OUT,
});

// Reducer
const initialState = {
  currentUser: null,
  isAuthenticated: false,
};

const authReducer = (state = initialState, action) => {
  switch (action.type) {
    case SIGN_IN:
      return { ...state, currentUser: action.payload, isAuthenticated: true };
    case SIGN_OUT:
      return { ...state, currentUser: null, isAuthenticated: false };
    default:
      return state;
  }
};

export default authReducer;
