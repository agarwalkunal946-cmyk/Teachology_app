import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert, Image, FlatList } from 'react-native';
import { useSelector } from 'react-redux';
import { pick, isCancel } from '@react-native-documents/picker';
import Voice from '@react-native-voice/voice';
import Tts from 'react-native-tts';
import { Mic, MicOff, Volume2, User, Bot, CheckCircle, XCircle, AlertCircle } from 'lucide-react-native';
import { repeat_question, classify_intent, start_viva, chat, syllabus, evaluate_answer, apiUrl } from "../../config/config";
import api from '../../utils/apiLogger';
import { selectUserId } from "../../redux/authSlice";
import ScreenLoader from '../ScreenLoader';
import { theme } from '../../styles/theme';

const VivaInterviewerBot = () => {
    const [syllabusFile, setSyllabusFile] = useState(null);
    const [isSyllabusUploaded, setIsSyllabusUploaded] = useState(false);
    const [isVivaStarted, setIsVivaStarted] = useState(false);
    const [isVivaEnded, setIsVivaEnded] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState('');
    const [conversation, setConversation] = useState([]);
    const [results, setResults] = useState(null);
    const [sessionId, setSessionId] = useState(null);
    const userId = useSelector(selectUserId);
    const conversationEndRef = useRef(null);

    useEffect(() => {
        const onSpeechResults = e => {
            if (e.value && e.value.length > 0) handleUserResponse(e.value[0]);
        };
        const onSpeechEnd = () => setIsListening(false);
        const onSpeechError = e => { setIsListening(false); console.error(e); };
        Voice.onSpeechResults = onSpeechResults;
        Voice.onSpeechEnd = onSpeechEnd;
        Voice.onSpeechError = onSpeechError;

        Tts.addEventListener('tts-start', () => setIsSpeaking(true));
        Tts.addEventListener('tts-finish', () => { setIsSpeaking(false); if(isVivaStarted && !isVivaEnded) toggleListening(); });
        Tts.addEventListener('tts-error', err => console.error(err));

        return () => {
            Voice.destroy().then(Voice.removeAllListeners);
            Tts.stop();
            Tts.removeEventListeners('tts-start');
            Tts.removeEventListeners('tts-finish');
            Tts.removeEventListeners('tts-error');
        };
    }, [isVivaStarted, isVivaEnded]);

    const speak = useCallback(text => { Tts.stop(); Tts.speak(text); }, []);
    const addToConversation = useCallback((sender, message) => setConversation(prev => [...prev, { sender, message }]), []);

    const handleUserResponse = async userText => {
        setIsProcessing(true);
        addToConversation('user', userText);
        try {
            const vivaRes = await api.post(`${apiUrl}${chat}`, { session_id: sessionId, user_id: userId, message: userText });
            const botResponse = vivaRes.data.response;
            if (/concludes your viva session/i.test(botResponse.spoken_response)) setIsVivaEnded(true);
            addToConversation("bot", botResponse.spoken_response);
            speak(botResponse.spoken_response);
        } catch (err) { addToConversation("bot", "Something went wrong."); speak("Something went wrong.");
        } finally { setIsProcessing(false); }
    };

    const handleFileSelect = async () => {
        try {
            const [res] = await pick({ type: ['*/*'] });
            setSyllabusFile(res);
        } catch (err) {
            if (!isCancel(err)) {
                Alert.alert("Error", "Could not select file.");
            }
        }
    };

    const startViva = async () => {
        const newSessionId = `session_${Date.now()}`; setSessionId(newSessionId);
        setIsProcessing(true);
        try {
            const response = await api.post(`${apiUrl}${start_viva}`, { session_id: newSessionId, user_id: userId });
            const botResponse = JSON.parse(response.data.response.replace(/```json|```/g, '').trim());
            setIsVivaStarted(true);
            addToConversation('bot', botResponse.spoken_response);
            speak(botResponse.spoken_response);
        } catch (err) { setError('Failed to start viva.');
        } finally { setIsProcessing(false); }
    };

    const toggleListening = async () => {
        if (isListening) await Voice.stop();
        else { try { await Voice.start('en-US'); setIsListening(true); } catch (e) { console.error(e); } }
    };

    if (isProcessing) return <ScreenLoader />;

    return (
        <ScrollView contentContainerStyle={styles.pageWrapper}>
            <View style={styles.header}><Text style={styles.titlePart1}>AI Viva </Text><Text style={styles.titlePart2}>Conductor</Text></View>
            <View style={styles.mainContent}>
                {error && <Text style={styles.errorText}>{error}</Text>}
                {!isSyllabusUploaded ? (
                    <View style={styles.uploadCard}>
                        <TouchableOpacity style={styles.uploadBox} onPress={handleFileSelect}>
                            <Text>{syllabusFile ? syllabusFile.name : 'Upload syllabus'}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.button} onPress={() => setIsSyllabusUploaded(true)} disabled={!syllabusFile}><Text style={styles.buttonText}>Analyze Syllabus</Text></TouchableOpacity>
                    </View>
                ) : !isVivaStarted ? (
                    <View style={styles.uploadCard}><Text>Ready to Start!</Text><TouchableOpacity style={styles.button} onPress={startViva}><Text style={styles.buttonText}>Start Viva</Text></TouchableOpacity></View>
                ) : (
                    <View style={styles.vivaLayout}>
                        <Image source={require('../../assets/img/ui/interview.gif')} style={styles.teacherImage} />
                        <FlatList data={conversation} renderItem={({item}) => (<View style={[styles.messageWrapper, item.sender === 'user' && styles.userMessage]}><Text style={styles.messageBubble}>{item.message}</Text></View>)} />
                        <TouchableOpacity style={[styles.button, isListening && styles.stopButton]} onPress={toggleListening}><Text style={styles.buttonText}>{isListening ? 'Stop' : 'Speak'}</Text></TouchableOpacity>
                    </View>
                )}
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    pageWrapper: { padding: 20, flexGrow: 1, backgroundColor: '#f8faff' },
    header: { marginBottom: 24 },
    titlePart1: { color: theme.colors.primary, fontSize: 32, fontWeight: '700' },
    titlePart2: { color: '#2a2a2a', fontSize: 32, fontWeight: '500' },
    mainContent: { flex: 1, backgroundColor: 'rgba(255, 255, 255, 0.8)', borderRadius: 24, padding: 16 },
    errorText: { color: 'red', textAlign: 'center', marginBottom: 10 },
    uploadCard: { alignItems: 'center', gap: 20 },
    uploadBox: { width: '100%', minHeight: 150, borderWidth: 2, borderColor: '#ddd', borderStyle: 'dashed', borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    button: { backgroundColor: theme.colors.primary, padding: 15, borderRadius: 50, minWidth: 150, alignItems: 'center' },
    buttonText: { color: 'white', fontWeight: 'bold' },
    stopButton: { backgroundColor: 'red' },
    vivaLayout: { flex: 1, alignItems: 'center' },
    teacherImage: { width: 150, height: 150, borderRadius: 75, marginBottom: 20 },
    messageWrapper: { maxWidth: '80%', padding: 12, borderRadius: 18, marginBottom: 10 },
    userMessage: { alignSelf: 'flex-end', backgroundColor: theme.colors.primary },
    messageBubble: { color: 'white' },
});

export default VivaInterviewerBot;