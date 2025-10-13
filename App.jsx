import React, { useEffect, createContext, useContext,useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useSelector, Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { store, persistor } from "./redux/store";
import { ToastProvider } from "react-native-toast-notifications";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { HelmetProvider } from "react-helmet-async";

// Import Screens
import About from "./pages/About";
import Skills from "./pages/Skills";
import Resume from "./pages/Resume";
import Portfolio from "./pages/Portfolio";
import Services from "./pages/Services";
import Faq from "./pages/Faq";
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
import Help from "./pages/landing/Faq";
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
import Dashboard from "./pages/Dashboard";
import Solution from "./pages/mathproblemsolution";

// Layouts
import PublicLayout from "./layout/PublicLayout";
import AppLayout from "./layout/Layout";

const Stack = createNativeStackNavigator();
const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

function AuthProvider({ children }) {
  const user = useSelector((state) => state.auth.user);
  const isLoggedIn = !!user;

  const value = {
    isLoggedIn,
    user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

function AuthNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Landing" component={Landing} />
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="Register" component={Signup} />
      <Stack.Screen name="ForgotPassword" component={ForgotPassword} />
      <Stack.Screen name="ResetPassword" component={ResetPassword} />
      <Stack.Screen name="ResetEmail" component={ResetEmail} />
      <Stack.Screen name="VerifyEmailOTP" component={EnterIdentifier} />
      <Stack.Screen name="VerifyMobileOTP" component={VerifyMobileOTP} />
      <Stack.Screen name="About" component={About} />
      <Stack.Screen name="Skills" component={Skills} />
      <Stack.Screen name="Resume" component={Resume} />
      <Stack.Screen name="Portfolio" component={Portfolio} />
      <Stack.Screen name="Services" component={Services} />
      <Stack.Screen name="Faq" component={Faq} />
      <Stack.Screen name="Contact" component={Contact} />
      <Stack.Screen name="PortfolioDetails" component={PortfolioDetails} />
      <Stack.Screen name="Privacy" component={Privacy} />
      <Stack.Screen name="Terms" component={TermsOfUse} />
      <Stack.Screen name="Pricing" component={Pricing} />
    </Stack.Navigator>
  );
}

function AppNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Dashboard" component={Dashboard} />
      <Stack.Screen name="Tools" component={Tools} />
      <Stack.Screen name="ToolDetail" component={ToolDetail} />
      <Stack.Screen name="ChatBot" component={ChatBot} />
      <Stack.Screen name="Help" component={Help} />
      <Stack.Screen name="Upgrade" component={Pricing} />
      <Stack.Screen name="Payment" component={PaymentPage} />
      <Stack.Screen name="OutputHistory" component={OutputHistory} />
      <Stack.Screen name="Output" component={Output} />
      <Stack.Screen name="MoleculeVisualizer" component={MoleculeVisualizerPage} />
      <Stack.Screen name="StudyPlanDetails" component={StudyPlanDetails} />
      <Stack.Screen name="StudyPlanDetailView" component={StudyPlanDetailView} />
      <Stack.Screen name="StudyPlanLearn" component={StudyPlanLearn} />
      <Stack.Screen name="Challenge" component={ChallengeLeaderBoard} />
      <Stack.Screen name="ManageAccount" component={ManageAccount} />
      <Stack.Screen name="Solution" component={Solution} />
      <Stack.Screen name="Logout" component={Logout} />
    </Stack.Navigator>
  );
}

function RootNavigator() {
    const { isLoggedIn } = useAuth();
    const [redirectPath, setRedirectPath] = useState(null);

    useEffect(() => {
        const getRedirect = async () => {
            const path = await AsyncStorage.getItem("redirectAfterLogin");
            if (path) {
                setRedirectPath(path);
                await AsyncStorage.removeItem("redirectAfterLogin");
            }
        };

        if (isLoggedIn) {
            getRedirect();
        }
    }, [isLoggedIn]);


    if (isLoggedIn && redirectPath) {
        return <AppNavigator initialRouteName={redirectPath} />;
    }
    
    return isLoggedIn ? <AppNavigator /> : <AuthNavigator />;
}

export default function App() {
  return (
    <HelmetProvider>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <AuthProvider>
            <ToastProvider>
              <NavigationContainer>
                <RootNavigator />
              </NavigationContainer>
            </ToastProvider>
          </AuthProvider>
        </PersistGate>
      </Provider>
    </HelmetProvider>
  );
}