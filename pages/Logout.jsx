import React, { useEffect } from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import { useDispatch } from "react-redux";
import { useNavigation } from "@react-navigation/native";
import { CommonActions } from '@react-navigation/native';
import { clearUser } from "../redux/authSlice"; // Asegúrate de que la ruta sea correcta
import { persistor } from "../redux/store"; // Asegúrate de que la ruta sea correcta
import AsyncStorage from "@react-native-async-storage/async-storage";

const Logout = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();

  useEffect(() => {
    const performLogout = async () => {
      // Limpia el estado de Redux
      dispatch(clearUser());
      
      // Limpia el token de AsyncStorage
      await AsyncStorage.removeItem("authToken");
      
      // Purga el estado persistido de Redux
      await persistor.purge();
      
      // Reinicia el stack de navegación y redirige a la pantalla de Login
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: 'Login' }], // Asegúrate de que 'Login' es el nombre de tu ruta de inicio de sesión
        })
      );
    };

    performLogout();
  }, [dispatch, navigation]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#443FE1" />
      <Text style={styles.text}>Cerrando sesión...</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f7f7fe',
  },
  text: {
    marginTop: 10,
    fontSize: 16,
    color: '#333',
  },
});

export default Logout;