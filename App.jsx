import React, { useEffect, createContext, useContext, useRef } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useSelector, Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { store, persistor } from "./redux/store";
import { ToastProvider } from "react-native-toast-notifications";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LogBox } from "react-native";

import Layout from "./layout/Layout";
import PublicLayout from "./layout/PublicLayout";

import About from "./pages/About";
import Skills from "./pages/Skills";
import Resume from "./pages/Resume";
import Portfolio from "./pages/Portfolio";
import Services from "./pages/Services";
import Contact from "./pages/Contact";
import PortfolioDetails from "./pages/PortfolioDetails";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import ChatBot from "./pages/Chatbot";
import OutputHistory from "./pages/OutputHistory";
import Tools from "./pages/Tools";
import ToolDetail from "./pages/ToolDetail";
import Output from "./pages/Output";
import Logout from "./pages/Logout";
import ResetEmail from "./pages/ResetEmail";
import EnterIdentifier from "./pages/EnterIdentifier";
import VerifyMobileOTP from "./pages/VerifyMobileOTP";
import NotFound from "./pages/Notfound";
import FAQ from "./pages/landing/Faq";
import Privacy from "./pages/privacy";
import ChallengeLeaderBoard from "./pages/ChallengeLeaderBoard";
import PaymentPage from "./pages/PaymentPage";
import ManageAccount from "./pages/ManageAccount";
import TermsOfUse from "./pages/TermsOfUse";
import MoleculeVisualizerPage from "./pages/MoleculeVisualizerPage";
import StudyPlanDetailView from "./components/Tools/study_plan/StudyPlanDetailView";
import StudyPlanDetails from "./components/Tools/study_plan/StudyPlanDetails";
import StudyPlanLearn from "./components/Tools/study_plan/StudyPlanLearn";
import Landing from "./pages/landing/Landing";
import Pricing from "./pages/landing/Pricing";
import Solution from "./pages/mathproblemsolution";
import Dashboard from "./pages/Dashboard";

const Stack = createNativeStackNavigator();
const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

function AuthProvider({ children }) {
  const user = useSelector((state) => state.auth.user);
  const isLoggedIn = !!user;

  const value = { isLoggedIn, user };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

const withPublicLayout = (ScreenComponent) => (props) => (
  <PublicLayout>
    <ScreenComponent {...props} />
  </PublicLayout>
);

const withAppLayout = (ScreenComponent) => (props) => (
  <Layout>
    <ScreenComponent {...props} />
  </Layout>
);

const HomeRedirect = ({ navigation }) => {
  useEffect(() => {
    navigation.replace("Dashboard");
  }, [navigation]);
  return null;
};

function AuthNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Landing" component={withPublicLayout(Landing)} />
      <Stack.Screen name="About" component={withPublicLayout(About)} />
      <Stack.Screen name="Skills" component={withPublicLayout(Skills)} />
      <Stack.Screen name="Resume" component={withPublicLayout(Resume)} />
      <Stack.Screen name="Portfolio" component={withPublicLayout(Portfolio)} />
      <Stack.Screen name="Services" component={withPublicLayout(Services)} />
      <Stack.Screen name="Contact" component={withPublicLayout(Contact)} />
      <Stack.Screen name="PortfolioDetails" component={withPublicLayout(PortfolioDetails)} />
      <Stack.Screen name="Privacy" component={withPublicLayout(Privacy)} />
      <Stack.Screen name="Terms" component={withPublicLayout(TermsOfUse)} />
      <Stack.Screen name="Pricing" component={withPublicLayout(Pricing)} />
      <Stack.Screen name="Login" component={withPublicLayout(Login)} />
      <Stack.Screen name="Register" component={withPublicLayout(Signup)} />
      <Stack.Screen name="ForgotPassword" component={withPublicLayout(ForgotPassword)} />
      <Stack.Screen name="ResetEmail" component={withPublicLayout(ResetEmail)} />
      <Stack.Screen name="ResetPassword" component={withPublicLayout(ResetPassword)} />
      <Stack.Screen name="VerifyEmailOTP" component={withPublicLayout(EnterIdentifier)} />
      <Stack.Screen name="VerifyMobileOTP" component={withPublicLayout(VerifyMobileOTP)} />
    </Stack.Navigator>
  );
}

function AppNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={HomeRedirect} />
      <Stack.Screen name="Dashboard" component={withAppLayout(Dashboard)} />
      <Stack.Screen name="Tools" component={withAppLayout(Tools)} />
      <Stack.Screen name="ToolDetail" component={withAppLayout(ToolDetail)} />
      <Stack.Screen name="ChatBot" component={withAppLayout(ChatBot)} />
      <Stack.Screen name="Help" component={withAppLayout(FAQ)} />
      <Stack.Screen name="Upgrade" component={withAppLayout(Pricing)} />
      <Stack.Screen name="Payment" component={withAppLayout(PaymentPage)} />
      <Stack.Screen name="OutputHistory" component={withAppLayout(OutputHistory)} />
      <Stack.Screen name="Output" component={withAppLayout(Output)} />
      <Stack.Screen name="MoleculeVisualizer" component={withAppLayout(MoleculeVisualizerPage)} />
      <Stack.Screen name="StudyPlanDetails" component={withAppLayout(StudyPlanDetails)} />
      <Stack.Screen name="StudyPlanDetailView" component={withAppLayout(StudyPlanDetailView)} />
      <Stack.Screen name="StudyPlanLearn" component={withAppLayout(StudyPlanLearn)} />
      <Stack.Screen name="Challenge" component={withAppLayout(ChallengeLeaderBoard)} />
      <Stack.Screen name="ManageAccount" component={withAppLayout(ManageAccount)} />
    </Stack.Navigator>
  );
}

function Root() {
  const { isLoggedIn } = useAuth();
  const navigationRef = useRef(null);

  useEffect(() => {
    const handleRedirect = async () => {
      if (isLoggedIn && navigationRef.current) {
        const redirectPath = await AsyncStorage.getItem("redirectAfterLogin");
        if (redirectPath) {
          const routeName = redirectPath.split('/')[1] || 'Dashboard';
          navigationRef.current.navigate(routeName);
          await AsyncStorage.removeItem("redirectAfterLogin");
        }
      }
    };
    handleRedirect();
  }, [isLoggedIn]);

  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isLoggedIn ? (
          <Stack.Screen name="App" component={AppNavigator} />
        ) : (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        )}
        <Stack.Screen name="Logout" component={Logout} />
        <Stack.Screen name="Solution" component={Solution} />
        <Stack.Screen name="NotFound" component={NotFound} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  LogBox.ignoreAllLogs();

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <AuthProvider>
          <ToastProvider>
            <Root />
          </ToastProvider>
        </AuthProvider>
      </PersistGate>
    </Provider>
  );
}