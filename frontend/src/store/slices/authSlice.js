import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import * as authService from '../../services/authService.js';
import { clearSessionId } from '../../utils/sessionId.js';
import { updateSocketAuth, disconnectSocket } from '../../services/websocket.js';

const API_URL = import.meta.env.VITE_API_URL || '/api';

/**
 * @typedef {Object} AuthState
 * @property {Object|null} user - Current user
 * @property {'merchant'|'customer'|null} userType - User type
 * @property {string|null} accessToken - JWT access token
 * @property {boolean} isAuthenticated - Authentication status
 * @property {boolean} isLoading - Loading state
 */

/**
 * Initialize auth on app startup by attempting to restore session from httpOnly cookie.
 * Tries merchant first, then customer.
 */
export const initializeAuth = createAsyncThunk(
  'auth/initialize',
  async (_, { rejectWithValue }) => {
    for (const userType of ['merchant', 'customer']) {
      try {
        const refreshRes = await axios.post(
          `${API_URL}/auth/${userType}/refresh`,
          {},
          { withCredentials: true }
        );
        const { accessToken } = refreshRes.data;

        const meEndpoint = `${API_URL}/auth/${userType}/me`;
        const profileRes = await axios.get(meEndpoint, {
          headers: { Authorization: `Bearer ${accessToken}` },
          withCredentials: true,
        });

        const user = userType === 'merchant' ? profileRes.data.merchant : profileRes.data.customer;
        return { user, userType, accessToken };
      } catch {
        // No valid session for this userType, try next
      }
    }
    return rejectWithValue('No valid session');
  }
);

/**
 * Login customer async thunk
 */
export const loginCustomer = createAsyncThunk(
  'auth/loginCustomer',
  async ({ email, password, sessionId }, { rejectWithValue }) => {
    try {
      const response = await authService.loginCustomer(email, password, sessionId);
      return {
        user: response.customer,
        userType: 'customer',
        accessToken: response.accessToken,
      };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Login failed');
    }
  }
);

/**
 * Register customer async thunk
 */
export const registerCustomer = createAsyncThunk(
  'auth/registerCustomer',
  async ({ firstName, lastName, email, password, sessionId }, { rejectWithValue }) => {
    try {
      const response = await authService.registerCustomer(
        email,
        password,
        firstName,
        lastName,
        sessionId
      );
      return {
        user: response.customer,
        userType: 'customer',
        accessToken: response.accessToken,
      };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Registration failed');
    }
  }
);

/**
 * Login merchant async thunk
 */
export const loginMerchant = createAsyncThunk(
  'auth/loginMerchant',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await authService.loginMerchant({ email, password });
      return {
        user: response.merchant,
        userType: 'merchant',
        accessToken: response.accessToken,
      };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Login failed');
    }
  }
);

/**
 * Register merchant async thunk
 */
export const registerMerchant = createAsyncThunk(
  'auth/registerMerchant',
  async ({ email, password, storeName }, { rejectWithValue }) => {
    try {
      const response = await authService.registerMerchant({ email, password, storeName });
      return {
        user: response.merchant,
        userType: 'merchant',
        accessToken: response.accessToken,
      };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Registration failed');
    }
  }
);

/**
 * Logout async thunk
 */
export const logout = createAsyncThunk('auth/logout', async (_, { getState }) => {
  const { auth } = getState();
  await authService.logout(auth.userType || 'customer');
  clearSessionId();
  return null;
});

/** @type {AuthState} */
const initialState = {
  user: null,
  userType: null,
  accessToken: null,
  isAuthenticated: false,
  isLoading: true,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const { user, userType, accessToken } = action.payload;
      state.user = user;
      state.userType = userType;
      state.accessToken = accessToken;
      state.isAuthenticated = true;
      state.isLoading = false;
    },
    setAccessToken: (state, action) => {
      state.accessToken = action.payload;
      // Update WebSocket auth with new token
      updateSocketAuth(action.payload);
    },
    clearCredentials: (state) => {
      state.user = null;
      state.userType = null;
      state.accessToken = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      // Disconnect WebSocket on logout
      disconnectSocket();
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    updateUser: (state, action) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Login customer
      .addCase(loginCustomer.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(loginCustomer.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.userType = action.payload.userType;
        state.accessToken = action.payload.accessToken;
        state.isAuthenticated = true;
        state.isLoading = false;
      })
      .addCase(loginCustomer.rejected, (state) => {
        state.isLoading = false;
      })
      // Register customer
      .addCase(registerCustomer.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(registerCustomer.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.userType = action.payload.userType;
        state.accessToken = action.payload.accessToken;
        state.isAuthenticated = true;
        state.isLoading = false;
      })
      .addCase(registerCustomer.rejected, (state) => {
        state.isLoading = false;
      })
      // Login merchant
      .addCase(loginMerchant.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(loginMerchant.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.userType = action.payload.userType;
        state.accessToken = action.payload.accessToken;
        state.isAuthenticated = true;
        state.isLoading = false;
      })
      .addCase(loginMerchant.rejected, (state) => {
        state.isLoading = false;
      })
      // Register merchant
      .addCase(registerMerchant.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(registerMerchant.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.userType = action.payload.userType;
        state.accessToken = action.payload.accessToken;
        state.isAuthenticated = true;
        state.isLoading = false;
      })
      .addCase(registerMerchant.rejected, (state) => {
        state.isLoading = false;
      })
      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.userType = null;
        state.accessToken = null;
        state.isAuthenticated = false;
        state.isLoading = false;
      })
      // Initialize auth
      .addCase(initializeAuth.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.userType = action.payload.userType;
        state.accessToken = action.payload.accessToken;
        state.isAuthenticated = true;
        state.isLoading = false;
      })
      .addCase(initializeAuth.rejected, (state) => {
        state.isLoading = false;
      });
  },
});

export const {
  setCredentials,
  setAccessToken,
  clearCredentials,
  setLoading,
  updateUser,
} = authSlice.actions;

// Selectors
export const selectCurrentUser = (state) => state.auth.user;
export const selectUserType = (state) => state.auth.userType;
export const selectAccessToken = (state) => state.auth.accessToken;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectAuthLoading = (state) => state.auth.isLoading;
export const selectIsMerchant = (state) => state.auth.userType === 'merchant';
export const selectIsCustomer = (state) => state.auth.userType === 'customer';

export default authSlice.reducer;
