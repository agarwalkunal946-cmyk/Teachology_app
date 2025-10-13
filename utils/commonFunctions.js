import 'react-native-get-random-values';
import { v4 as uuidv4 } from "uuid";
import AsyncStorage from '@react-native-async-storage/async-storage';

export const convertStringToPascalCase = (inputString) => {
  let words = inputString.split(/(\s|\(|\[|\)|\])/);
  return words
    .map((word) => {
      if (word.trim() === "" || ["(", "[", ")", "]"].includes(word)) {
        return word;
      }
      return word.length > 0
        ? word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        : word;
    })
    .join("");
};

let sessionId = null;

export const getSessionId = async () => {
  if (sessionId) return sessionId;
  
  let storedSessionId = await AsyncStorage.getItem('sessionId');
  if (!storedSessionId) {
    storedSessionId = uuidv4();
    await AsyncStorage.setItem('sessionId', storedSessionId);
  }
  sessionId = storedSessionId;
  return sessionId;
};

export const getTransactionId = () => {
  return uuidv4();
};


export const logUserAction = (action, params = {}) => {
  console.log(`Action: ${action}`, params);
};

export const logError = (error, params = {}) => {
  console.error("Logged Error:", error, params);
};