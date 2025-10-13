import axios from 'axios';
import { getSessionId, getTransactionId, logUserAction } from './commonFunctions';
import { store } from '../redux/store';
import { clearUser } from '../redux/authSlice';
import { Toast } from 'react-native-toast-notifications';

const api = axios.create();

api.interceptors.request.use(config => {
  const state = store.getState().auth;
  config.headers['x-session-id'] = getSessionId();
  config.headers['x-transaction-id'] = getTransactionId();
  config.headers['x-user-id'] = state.user_id;
  config.headers['Authorization'] = `Bearer ${state.token}`;
  return config;
});

api.interceptors.response.use(
  response => {
    logUserAction('API_RESPONSE', {
      url: response.config.url,
      status: response.status,
      sessionId: getSessionId(),
      transactionId: response.config.headers['x-transaction-id'],
      userId: store.getState().auth.user_id,
    });
    return response;
  },
  error => {
    logUserAction('API_ERROR', {
      url: error.config?.url,
      status: error.response?.status,
      sessionId: getSessionId(),
      transactionId: error.config?.headers['x-transaction-id'],
      userId: store.getState().auth.user_id,
    });

    const status = error.response?.status;

    if (status === 403) {
      Toast.show("Your token usage is exhausted, please upgrade your plan.", { type: "danger" });
    } else if (status === 401) {
      Toast.show("Your token has expired, please login again.", { type: "danger" });
      store.dispatch(clearUser());
    }

    return Promise.reject(error);
  }
);

export default api;