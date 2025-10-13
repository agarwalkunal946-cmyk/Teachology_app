import { getSessionId, getTransactionId, logUserAction } from './commonFunctions';
import { store } from '../redux/store';
import { clearUser } from '../redux/authSlice';
import { Toast } from 'react-native-toast-notifications';

async function customFetch(url, options = {}) {
  const state = store.getState().auth;
  const headers = {
    'x-session-id': await getSessionId(),
    'x-transaction-id': getTransactionId(),
    'x-user-id': state.user_id,
    'Authorization': `Bearer ${state.token}`,
    ...options.headers,
  };

  try {
    const response = await fetch(url, { ...options, headers });

    logUserAction('FETCH_RESPONSE', {
      url,
      status: response.status,
      sessionId: headers['x-session-id'],
      transactionId: headers['x-transaction-id'],
      userId: state.user_id,
    });

    if (response.status === 403) {
      Toast.show("Your token usage is exhausted, please upgrade your plan.", { type: "danger" });
    }

    if (response.status === 401) {
      Toast.show("Your token has expired, please login again.", { type: "danger" });
      store.dispatch(clearUser());
    }

    return response;
  } catch (error) {
    logUserAction('FETCH_ERROR', {
      url,
      status: error?.status || 'Network Error',
      sessionId: headers['x-session-id'],
      transactionId: headers['x-transaction-id'],
      userId: state.user_id,
    });
    throw error;
  }
}

export default customFetch;