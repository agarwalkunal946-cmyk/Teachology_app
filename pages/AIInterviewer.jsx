import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Alert } from 'react-native';
import Voice from '@react-native-voice/voice';
import { Audio } from 'expo-av';
import { interviewerEndpoint, clearEndpoint, apiUrl } from '../../config/config';
import api from '../../utils/apiLogger';
import { theme } from '../../styles/theme';

const AIInterviewer = () => {
    const [messages, setMessages] = useState([]);
    const [isRecording, setIsRecording] = useState(false);
    const [recording, setRecording] = useState();
    const [sound, setSound] = useState();
    const [error, setError] = useState("");

    useEffect(() => {
        const onSpeechResults = e => {
            // Speech-to-text is an alternative to sending raw audio.
            // For this component, we focus on sending the audio file.
        };
        Voice.onSpeechResults = onSpeechResults;
        return () => Voice.destroy().then(Voice.removeAllListeners);
    }, []);
    
    useEffect(() => {
        return sound ? () => { sound.unloadAsync(); } : undefined;
    }, [sound]);

    async function startRecording() {
        try {
            await Audio.requestPermissionsAsync();
            await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
            const { recording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
            setRecording(recording);
            setIsRecording(true);
        } catch (err) { setError('Failed to start recording. Please check microphone permissions.'); }
    }

    async function stopRecording() {
        setIsRecording(false);
        await recording.stopAndUnloadAsync();
        const uri = recording.getURI();
        sendAudioToBackend(uri);
        setMessages(prev => [...prev, { text: 'You said...', role: 'user' }]);
    }

    const sendAudioToBackend = async (uri) => {
        const formData = new FormData();
        formData.append('file', { uri, name: `audio-${Date.now()}.m4a`, type: 'audio/m4a' });
        try {
            const response = await api.post(`${apiUrl}${interviewerEndpoint}`, formData, { headers: { 'Content-Type': 'multipart/form-data' }, responseType: 'blob' });
            
            const reader = new FileReader();
            reader.onload = async () => {
                const { sound } = await Audio.Sound.createAsync({ uri: reader.result });
                setSound(sound);
                setMessages(prev => [...prev, { text: 'Assistant is replying...', role: 'assistant' }]);
                await sound.playAsync();
            };
            reader.readAsDataURL(response.data);

        } catch (err) { setError("Error sending audio to server."); }
    };
    
    return (
        <View style={styles.container}>
            <Text style={styles.title}>AI Interviewer</Text>
            <View style={styles.chatbox}>
                <FlatList 
                    data={messages} 
                    keyExtractor={(item, index) => index.toString()} 
                    renderItem={({ item }) => (
                        <View style={[styles.message, item.role === 'user' ? styles.userMessage : styles.assistantMessage]}>
                            <Text style={styles.messageText}>{item.text}</Text>
                        </View>
                    )} 
                />
            </View>
            <TouchableOpacity style={styles.recordButton} onPress={isRecording ? stopRecording : startRecording}>
                <Text style={styles.recordButtonText}>{isRecording ? "⏹️" : "🎤"}</Text>
            </TouchableOpacity>
            {error && <Text style={styles.errorMessage}>{error}</Text>}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, alignItems: 'center', backgroundColor: '#f0f4f8' },
    title: { color: '#2979ff', fontSize: 28, fontWeight: '600', marginVertical: 20 },
    chatbox: { width: '100%', backgroundColor: 'rgba(255, 255, 255, 0.95)', borderRadius: 12, elevation: 3, padding: 10, height: 450, marginBottom: 20 },
    message: { padding: 12, borderRadius: 20, marginBottom: 12, maxWidth: '75%' },
    userMessage: { backgroundColor: '#1e88e5', alignSelf: 'flex-end', borderBottomRightRadius: 4 },
    assistantMessage: { backgroundColor: '#689f38', alignSelf: 'flex-start', borderBottomLeftRadius: 4 },
    messageText: { color: 'white', fontSize: 16 },
    recordButton: { backgroundColor: '#d50000', borderRadius: 35, width: 70, height: 70, justifyContent: 'center', alignItems: 'center', elevation: 5 },
    recordButtonText: { fontSize: 24, color: 'white' },
    errorMessage: { color: '#e53935', marginTop: 15, fontWeight: 'bold' },
});

export default AIInterviewer;