import { useEffect, useRef } from 'react';
import { useNavigationState } from '@react-navigation/native';
import { logUserAction } from '../utils/commanFunctions';
import AsyncStorage from '@react-native-async-storage/async-storage';

const RouteLogger = () => {
  const currentRouteName = useNavigationState(state => state.routes[state.index].name);
  const previousRouteName = useRef(null);

  useEffect(() => {
    const logRouteChange = async () => {
        if (previousRouteName.current !== currentRouteName) {
            const sessionId = await AsyncStorage.getItem('sessionId');
            const userId = await AsyncStorage.getItem('userId');
            logUserAction('ROUTE_CHANGE', {
              path: currentRouteName,
              sessionId: sessionId,
              userId: userId,
            });
            previousRouteName.current = currentRouteName;
        }
    };
    logRouteChange();
  }, [currentRouteName]);

  return null;
};

export default RouteLogger;