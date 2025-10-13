import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import {
  View, Text, StyleSheet, Image, TextInput, TouchableOpacity,
  ScrollView, FlatList, Modal, ActivityIndicator, SafeAreaView, Pressable
} from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { useNavigation } from "@react-navigation/native";
import Markdown from "react-native-markdown-display";
import Voice from '@react-native-voice/voice';
import Tts from 'react-native-tts';
import {
  PlusCircle, Lock, ArrowLeft, ArrowRight, X, Paperclip, Mic, StopCircle,
  Pause, Play, List, User, Bot, Search
} from "lucide-react-native";

import { setCurrentStudyMaterial, setStudyMaterial } from "../../../redux/aiTeacherSlice";
import { UserStudyPlanDetailsEndpoint, GetStudyPlanByIdEndpoint, GiveTopicStudyLinksEndpoint, apiUrl } from "../../../config/config";
import { selectUserId } from "../../../redux/authSlice";
import api from "../../../utils/apiLogger";
import { theme } from "../../../styles/theme";

const formatRevisionNotesToMarkdown = (data) => {
  if (typeof data !== "object" || data === null || !Array.isArray(data.revision_notes)) return String(data);
  let markdown = `# ${data.topic_name || "Revision Notes"}\n\n`;
  data.revision_notes.forEach(section => {
    if (section.title) markdown += `## ${section.title}\n\n`;
    if (section.summary) markdown += `_${section.summary}_\n\n`;
    if (section.key_points?.length) markdown += section.key_points.map(p => `- ${p}`).join('\n') + '\n\n';
    if (section.examples?.length) markdown += section.examples.map(e => `> ${e}`).join('\n') + '\n\n';
    if (section.mnemonics) markdown += `### Mnemonic\n**${section.mnemonics}**\n\n`;
  });
  return markdown;
};

const formatDoubtResponseToMarkdown = (data) => {
    if (typeof data !== "object" || data === null || !data.explanation) return String(data);
    const { explanation, tone, student_query } = data;
    return `## Response to: "${student_query}"\n\n### Simple Answer\n${explanation.simple_answer}\n\n### Detailed Explanation\n${explanation.detailed_explanation}\n\n> 💡 ${tone}`;
};

const parseTopics = (description) => {
    if (!description) return [];
    return description.split(/[.;\n]/).flatMap(part => {
        const parts = part.split(':');
        const subject = parts.length > 1 ? `${parts[0].trim()}: ` : '';
        const topics = (parts.length > 1 ? parts[1] : parts[0]).split(',').map(t => t.trim()).filter(Boolean);
        return topics.map(t => `${subject}${t}`);
    });
};

const splitContentIntoPages = (text) => {
    if (!text || typeof text !== "string") return [""];
    const pages = [];
    let currentPageContent = "";
    const blocks = text.split(/(\n#+\s.*)/).filter(Boolean).map(b => b.trim());
    blocks.forEach(block => {
        if (currentPageContent.length + block.length > 1800 && currentPageContent.length > 0) {
            pages.push(currentPageContent);
            currentPageContent = block;
        } else {
            currentPageContent += (currentPageContent ? "\n\n" : "") + block;
        }
    });
    if (currentPageContent) pages.push(currentPageContent);
    return pages.length ? pages : [""];
};

const TeacherView = () => (
    <View style={styles.teacherViewContainer}>
        <Image source={require('../../../assets/img/ui/interview.gif')} style={styles.teacherImage} />
    </View>
);

const TypingBox = ({ onAsk, isLoading, isTopicSelected, question, setQuestion, isMicListening, toggleMicListening }) => {
    const handleAsk = () => {
        if (!question.trim() || isLoading || !isTopicSelected) return;
        onAsk(question, "General Query");
    };
    return (
        <View style={styles.typingBoxContainer}>
            <TextInput
                style={styles.typingInput}
                placeholder={isTopicSelected ? (isMicListening ? "Listening..." : "Ask a question...") : "Please select a topic first"}
                value={question}
                onChangeText={setQuestion}
                onSubmitEditing={handleAsk}
                editable={!isLoading && isTopicSelected}
            />
            <TouchableOpacity style={[styles.typingButton, isMicListening && styles.micActive]} onPress={toggleMicListening} disabled={isLoading || !isTopicSelected}>
                {isMicListening ? <StopCircle color="white" /> : <Mic color="white" />}
            </TouchableOpacity>
        </View>
    );
};

const StudyPlanSidebar = ({ onPlansLoaded, isOpen, onClose }) => {
    const navigation = useNavigation();
    const dispatch = useDispatch();
    const userId = useSelector(selectUserId);
    const { studyMaterials } = useSelector(state => state.aiTeacher);
    const [plansData, setPlansData] = useState(null);
    const [detailedPlans, setDetailedPlans] = useState({});
    const [activePlanId, setActivePlanId] = useState(null);
    const [activeTopicId, setActiveTopicId] = useState(null);
    const [loadingSubTopic, setLoadingSubTopic] = useState(null);

    useEffect(() => {
        const fetchUserPlans = async () => {
            try {
                const response = await api.post(`${apiUrl}${UserStudyPlanDetailsEndpoint}`, { user_id: userId });
                setPlansData(response.data);
                onPlansLoaded(response.data?.plans_details?.length > 0);
            } catch (err) { onPlansLoaded(false); }
        };
        if(userId) fetchUserPlans();
    }, [userId, onPlansLoaded]);

    const handlePlanClick = async (planId) => {
        if (activePlanId === planId) { setActivePlanId(null); return; }
        setActivePlanId(planId);
        if (!detailedPlans[planId]) {
            const response = await api.post(`${apiUrl}${GetStudyPlanByIdEndpoint}`, { plan_id_str: planId, user_id_str: userId });
            setDetailedPlans(prev => ({ ...prev, [planId]: response.data }));
        }
    };

    const handleSubTopicClick = async (subTopic, examName, dayNumber) => {
        if (loadingSubTopic) return;
        const context = { examName, subTopic, planId: activePlanId, dayNumber };
        setLoadingSubTopic(subTopic);
        try {
            const response = await api.post(`${apiUrl}${GiveTopicStudyLinksEndpoint}`, { exam_name: examName, topics: [subTopic], user_id: userId, plan_id: activePlanId, day_number: dayNumber, type: "revision_notes" });
            const formattedMaterial = formatRevisionNotesToMarkdown(response.data);
            dispatch(setStudyMaterial({ topic: subTopic, material: formattedMaterial, context }));
            onClose();
        } finally { setLoadingSubTopic(null); }
    };
    
    return (
        <Modal visible={isOpen} transparent={true} animationType="slide" onRequestClose={onClose}>
            <Pressable style={styles.sidebarOverlay} onPress={onClose}>
                <Pressable style={styles.studyPlanSidebar}>
                    <TouchableOpacity style={styles.sidebarCloseBtn} onPress={onClose}><X color={theme.colors.textPrimary} /></TouchableOpacity>
                    <Text style={styles.sidebarTitle}>My Study Plans</Text>
                    <FlatList
                        data={plansData?.plans_details || []}
                        keyExtractor={item => item.plan_id}
                        renderItem={({ item }) => {
                            const isPlanActive = activePlanId === item.plan_id;
                            const detailedPlanData = detailedPlans[item.plan_id];
                            return(
                                <View style={styles.studyPlanCard}>
                                    <TouchableOpacity style={styles.studyPlanHeader} onPress={() => handlePlanClick(item.plan_id)}>
                                        <Text style={styles.studyPlanTitle}>{item.exam_name}</Text>
                                    </TouchableOpacity>
                                    {isPlanActive && detailedPlanData?.daily_topics.map(day => (
                                        <View key={day.day_number}>
                                            <TouchableOpacity style={styles.topicItem} onPress={() => setActiveTopicId(day.day_number)}>
                                                <Text>Day {day.day_number}: {day.topic_description}</Text>
                                            </TouchableOpacity>
                                            {activeTopicId === day.day_number && parseTopics(day.topic_description).map((subTopic, idx) => (
                                                <TouchableOpacity key={idx} style={styles.subTopicItem} onPress={() => handleSubTopicClick(subTopic, item.exam_name, day.day_number)}>
                                                    <Text>{loadingSubTopic === subTopic ? 'Loading...' : subTopic}</Text>
                                                </TouchableOpacity>
                                            ))}
                                        </View>
                                    ))}
                                </View>
                            );
                        }}
                    />
                </Pressable>
            </Pressable>
        </Modal>
    );
};

const PaginatedBoard = ({ pages, currentPage, onPageChange, defaultText, onQuerySubmit }) => (
    <View style={styles.fullscreenBoard}>
        <View style={styles.boardHeader}>
            <TouchableOpacity onPress={() => onPageChange(Math.max(currentPage - 1, 0))} disabled={currentPage === 0}><ArrowLeft color={currentPage === 0 ? '#ccc' : 'black'} /></TouchableOpacity>
            <Text>Page {currentPage + 1} of {pages.length || 1}</Text>
            <TouchableOpacity onPress={() => onPageChange(Math.min(currentPage + 1, (pages.length - 1) || 0))} disabled={currentPage >= (pages.length - 1)}><ArrowRight color={currentPage >= (pages.length - 1) ? '#ccc' : 'black'} /></TouchableOpacity>
        </View>
        <ScrollView style={styles.markdownWrapper}>
            <Markdown style={markdownStyles}>{pages[currentPage] || defaultText}</Markdown>
        </ScrollView>
    </View>
);

const ClassRoom = () => {
    const userId = useSelector(selectUserId);
    const { currentStudyMaterial, studyMaterialContext } = useSelector(state => state.aiTeacher);
    const [isQueryLoading, setIsQueryLoading] = useState(false);
    const [speechStatus, setSpeechStatus] = useState("idle");
    const [pages, setPages] = useState([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [isStudyPlanOpen, setIsStudyPlanOpen] = useState(false);
    const [question, setQuestion] = useState("");
    const [isMicListening, setIsMicListening] = useState(false);
    
    const defaultText = "# Welcome to the AI Magic Classroom!\nPlease select a topic from your study plan to begin.";

    useEffect(() => {
        setPages(splitContentIntoPages(currentStudyMaterial));
        setCurrentPage(0);
        Tts.stop();
        setSpeechStatus('idle');
    }, [currentStudyMaterial]);

    useEffect(() => {
        const onSpeechResults = e => { if (e.value?.[0]) setQuestion(e.value[0]); };
        const onSpeechEnd = () => setIsMicListening(false);
        Voice.onSpeechResults = onSpeechResults;
        Voice.onSpeechEnd = onSpeechEnd;
        Tts.addEventListener('tts-start', () => setSpeechStatus('playing'));
        Tts.addEventListener('tts-finish', () => setSpeechStatus('idle'));
        return () => { Voice.destroy().then(Voice.removeAllListeners); Tts.stop(); };
    }, []);

    const speak = useCallback(text => {
        Tts.stop();
        Tts.speak(text.replace(/#|##|###|\*|_/g, ''));
    }, []);

    const toggleMicListening = async () => {
        if (isMicListening) { await Voice.stop(); } 
        else { try { await Voice.start('en-US'); setIsMicListening(true); } catch (e) { Alert.alert('Mic Error', e.message); } }
    };

    const handleQuerySubmit = async (query, contextText) => {
        if (!query.trim()) return;
        setIsQueryLoading(true);
        try {
            const payload = { ...studyMaterialContext, highlighted_text: contextText, student_query: query, isDoubt: true, user_id: userId, type: "revision_notes" };
            const response = await api.post(`${apiUrl}${GiveTopicStudyLinksEndpoint}`, payload);
            const formattedResult = formatDoubtResponseToMarkdown(response.data);
            setPages([formattedResult]);
            setCurrentPage(0);
        } catch (err) {
            setPages(['Sorry, I encountered an error. Please try again.']);
        } finally { setIsQueryLoading(false); setQuestion(""); }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.classroomWrapper}>
                <TouchableOpacity style={styles.sidebarToggleBtn} onPress={() => setIsStudyPlanOpen(true)}><List color="white" /></TouchableOpacity>
                <View style={styles.boardContainer}>
                    <PaginatedBoard pages={pages} currentPage={currentPage} onPageChange={setCurrentPage} defaultText={defaultText} onQuerySubmit={handleQuerySubmit} />
                </View>
                <View style={styles.bottomBarContainer}>
                    <TeacherView />
                    <View style={styles.controlsAndInput}>
                        <View style={styles.speechControls}>
                            <TouchableOpacity style={styles.explainButton} onPress={() => speak(pages[currentPage] || '')} disabled={speechStatus === 'playing' || !currentStudyMaterial}>
                                <Text style={styles.explainButtonText}>{speechStatus === 'playing' ? 'Explaining...' : 'Explain with AI'}</Text>
                            </TouchableOpacity>
                            {speechStatus !== 'idle' && <TouchableOpacity style={styles.stopButton} onPress={() => Tts.stop()}><StopCircle color="white" /></TouchableOpacity>}
                        </View>
                        <TypingBox onAsk={handleQuerySubmit} isLoading={isQueryLoading} isTopicSelected={!!currentStudyMaterial} question={question} setQuestion={setQuestion} isMicListening={isMicListening} toggleMicListening={toggleMicListening} />
                    </View>
                </View>
            </View>
            <StudyPlanSidebar isOpen={isStudyPlanOpen} onClose={() => setIsStudyPlanOpen(false)} onPlansLoaded={() => {}} />
        </SafeAreaView>
    );
};

const markdownStyles = {
    heading1: { color: theme.colors.primary, borderBottomWidth: 2, borderColor: '#dde3e9', paddingBottom: 8, marginTop: 24, marginBottom: 16 },
    heading2: { color: theme.colors.primary, borderBottomWidth: 1, borderColor: '#dde3e9', paddingBottom: 6, marginTop: 20, marginBottom: 12 },
    text: { color: '#2c3e50', fontSize: 16, lineHeight: 28 },
    bullet_list: { marginBottom: 16 },
    ordered_list: { marginBottom: 16 },
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#e4e9f2' },
    classroomWrapper: { flex: 1, margin: 10, borderRadius: 16, overflow: 'hidden', backgroundColor: '#e4e9f2', borderWidth: 1, borderColor: '#dde3e9' },
    sidebarToggleBtn: { position: 'absolute', top: 15, right: 15, backgroundColor: theme.colors.primary, borderRadius: 22, width: 44, height: 44, alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
    boardContainer: { flex: 1, backgroundColor: 'white' },
    bottomBarContainer: { flexDirection: 'row', alignItems: 'center', padding: 10, backgroundColor: '#fdfdff', borderTopWidth: 1, borderColor: '#dde3e9', gap: 16 },
    controlsAndInput: { flex: 1, gap: 10 },
    teacherViewContainer: { width: 80, height: 80, borderRadius: 40, overflow: 'hidden', borderWidth: 3, borderColor: 'white', backgroundColor: theme.colors.primary },
    teacherImage: { width: '100%', height: '100%' },
    speechControls: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    explainButton: { backgroundColor: theme.colors.primary, paddingVertical: 10, paddingHorizontal: 20, borderRadius: 25, },
    explainButtonText: { color: 'white', fontWeight: 'bold' },
    stopButton: { backgroundColor: '#e94b3c', width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
    typingBoxContainer: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    typingInput: { flex: 1, backgroundColor: '#f7f9fc', paddingVertical: 12, paddingHorizontal: 20, borderRadius: 25, borderWidth: 1, borderColor: '#dde3e9', fontSize: 16 },
    typingButton: { backgroundColor: theme.colors.primary, width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
    micActive: { backgroundColor: '#e94b3c' },
    sidebarOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' },
    studyPlanSidebar: { position: 'absolute', right: 0, top: 0, bottom: 0, width: '85%', backgroundColor: 'white', padding: 20, elevation: 10 },
    sidebarCloseBtn: { alignSelf: 'flex-end', marginBottom: 10 },
    sidebarTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 16 },
    studyPlanCard: { marginBottom: 16, borderWidth: 1, borderColor: '#eee', borderRadius: 8 },
    studyPlanHeader: { padding: 12, backgroundColor: '#f9f9f9' },
    studyPlanTitle: { fontWeight: '600' },
    topicItem: { padding: 12, borderTopWidth: 1, borderTopColor: '#eee' },
    subTopicItem: { padding: 12, paddingLeft: 24, backgroundColor: '#fafafa' },
    fullscreenBoard: { flex: 1 },
    boardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15, borderBottomWidth: 1, borderColor: '#eee' },
    markdownWrapper: { flex: 1, padding: 15 }
});

export default ClassRoom;