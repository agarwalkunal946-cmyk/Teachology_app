import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import Markdown from "react-native-markdown-display";
import api from "../utils/apiLogger"; // Asegúrate de que la ruta sea correcta
import { helperBotEndpoint, apiUrl } from '../config/config'; // Asegúrate de que la ruta sea correcta

const FloatingHelperBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const scrollViewRef = useRef(null);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          type: "bot",
          text: "¡Hola! ¿Cómo puedo ayudarte hoy con nuestras herramientas o sitio web?",
        },
      ]);
    }
  }, [isOpen, messages.length]);

  const handleSendMessage = useCallback(async () => {
    const userMessageText = inputValue.trim();
    if (!userMessageText || isLoading) {
      return;
    }

    const newUserMessage = { type: "user", text: userMessageText };
    setMessages((prevMessages) => [...prevMessages, newUserMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      const response = await api.post(
        `${apiUrl}${helperBotEndpoint}`,
        { user_input: userMessageText },
        { headers: { "Content-Type": "application/json" } }
      );

      if (response.data && response.data.response) {
        const botResponseMessage = { type: "bot", text: response.data.response };
        setMessages((prevMessages) => [...prevMessages, botResponseMessage]);
      } else {
        throw new Error("Formato de respuesta no válido recibido del servidor.");
      }
    } catch (error) {
      const errorMsg = error.response?.data?.detail || error.message || "Error al comunicarse con el servidor.";
      const errorBotMessage = {
        type: "bot",
        text: `Lo siento, encontré un error: ${errorMsg}`,
        isError: true,
      };
      setMessages((prevMessages) => [...prevMessages, errorBotMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [inputValue, isLoading, apiUrl, helperBotEndpoint]);

  return (
    <>
      {!isOpen && (
        <TouchableOpacity
          style={styles.floatingButton}
          onPress={() => setIsOpen(true)}
          activeOpacity={0.8}
        >
          <FontAwesome name="comments" size={26} color="white" />
        </TouchableOpacity>
      )}

      {isOpen && (
        <View style={styles.windowContainer}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={{ flex: 1 }}
          >
            <View style={styles.chatWindow}>
              <View style={styles.header}>
                <Text style={styles.headerText}>Asistente de Ayuda</Text>
                <TouchableOpacity onPress={() => setIsOpen(false)} style={styles.closeButton}>
                  <FontAwesome name="times" size={20} color="#6c757d" />
                </TouchableOpacity>
              </View>

              <ScrollView
                ref={scrollViewRef}
                style={styles.messagesArea}
                contentContainerStyle={styles.messagesContainer}
                onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
              >
                {messages.map((message, index) => (
                  <View
                    key={index}
                    style={[
                      styles.messageBubble,
                      message.type === "user" ? styles.userMessage : styles.botMessage,
                      message.isError && styles.errorMessage,
                    ]}
                  >
                    <Markdown style={message.type === 'user' ? markdownUserStyles : markdownBotStyles}>
                      {message.text}
                    </Markdown>
                  </View>
                ))}
              </ScrollView>

              <View style={styles.inputArea}>
                <TextInput
                  style={styles.input}
                  placeholder="Pregunta sobre las herramientas..."
                  value={inputValue}
                  onChangeText={setInputValue}
                  editable={!isLoading}
                  onSubmitEditing={handleSendMessage}
                  placeholderTextColor="#999"
                />
                <TouchableOpacity
                  style={styles.sendButton}
                  onPress={handleSendMessage}
                  disabled={isLoading || !inputValue.trim()}
                >
                  {isLoading ? (
                    <ActivityIndicator size="small" color="#ffffff" />
                  ) : (
                    <FontAwesome name="paper-plane" size={18} color="white" />
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  floatingButton: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    backgroundColor: '#007bff',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
    zIndex: 999,
  },
  windowContainer: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    width: 350,
    height: '70%',
    maxHeight: 500,
    zIndex: 1000,
  },
  chatWindow: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#ced4da',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 10,
    overflow: 'hidden',
  },
  header: {
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#dee2e6',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerText: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#333',
  },
  closeButton: {
    padding: 5,
  },
  messagesArea: {
    flex: 1,
    backgroundColor: '#f1f3f5',
  },
  messagesContainer: {
    padding: 15,
  },
  messageBubble: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 18,
    maxWidth: '85%',
    marginBottom: 10,
  },
  userMessage: {
    backgroundColor: '#007bff',
    alignSelf: 'flex-end',
    borderBottomRightRadius: 5,
  },
  botMessage: {
    backgroundColor: '#e9ecef',
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 5,
  },
  errorMessage: {
    backgroundColor: '#f8d7da',
    borderColor: '#f5c6cb',
    borderWidth: 1,
  },
  inputArea: {
    flexDirection: 'row',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#dee2e6',
    backgroundColor: '#ffffff',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ced4da',
    borderRadius: 20,
    paddingVertical: Platform.OS === 'ios' ? 10 : 6,
    paddingHorizontal: 15,
    marginRight: 8,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  sendButton: {
    backgroundColor: '#007bff',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

const markdownUserStyles = StyleSheet.create({
  text: { color: '#ffffff' },
});

const markdownBotStyles = StyleSheet.create({
  text: { color: '#343a40' },
});

export default FloatingHelperBot;