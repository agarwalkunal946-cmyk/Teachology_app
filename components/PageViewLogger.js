import { useEffect } from 'react';
import { useNavigationState } from '@react-navigation/native';
import newrelic from 'newrelic-react-native-agent';
import { getSessionId } from '../utils/commanFunctions';

const PageViewLogger = () => {
  const routeName = useNavigationState(state => state.routes[state.index]?.name);

  useEffect(() => {
    const sendPageViewToNewRelic = async () => {
      if (newrelic && routeName) {
        const sessionId = await getSessionId();
        newrelic.recordCustomEvent("PageView", {
          path: routeName,
          timestamp: new Date().toISOString(),
          sessionId: sessionId,
        });
      }
    };
    sendPageViewToNewRelic();
  }, [routeName]);

  return null;
};

export default PageViewLogger;