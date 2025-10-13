import React, { useState, useEffect, useRef } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, FlatList, ActivityIndicator, Alert } from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { useSelector, useDispatch } from "react-redux";
import Markdown from 'react-native-markdown-display';
import { BookOpen, FileText, School, PencilRuler, MessageSquare, Sync, User, Bot, ThumbsUp, Brain } from "lucide-react-native";
import { setStudyMaterial, setDoubtMessages, selectDoubtHistoryByTopic } from "../../../redux/studyPlanSlice";
import { GiveTopicStudyLinksEndpoint, apiUrl } from "../../../config/config";
import api from "../../../utils/apiLogger";
import ScreenLoader from "../../ScreenLoader";
import BackButton from "../../BackButton";
import { selectUserId } from "../../../redux/authSlice";
import { theme } from "../../../styles/theme";

const parseTopics = (description) => {
    if (!description) return [];
    return description.split(/[.;\n]/).flatMap(part => part.includes(':') ? part.split(':')[1].split(',').map(t => `${part.split(':')[0]}: ${t.trim()}`) : part.split(',').map(t => t.trim())).filter(Boolean);
};

const parseApiResponse = (data, activeTab) => {
    try {
        const apiResponse = typeof data === 'string' ? JSON.parse(data) : data;
        if (!apiResponse) return null;
        if (apiResponse.revision_notes && activeTab === "Revision Notes") return { type: "revision_notes", title: apiResponse.topic_name || "Revision Notes", concepts: apiResponse.revision_notes };
        if (apiResponse.key_concepts) return { type: activeTab === "Explain Full Chapter" ? "full_chapter" : "summary", title: apiResponse.topic_name || "Study Guide", concepts: apiResponse.key_concepts };
        if (apiResponse.questions) return { type: "practice_quiz", title: `Practice Quiz: ${apiResponse.topic_name}`, questions: apiResponse.questions };
    } catch (e) { /* Fallthrough */ }
    return null;
};

const DoubtResponseRenderer = ({ response }) => (
    <View style={styles.doubtResponseContainer}>
        <View style={styles.doubtSection}>
            <Text style={styles.doubtSectionHeader}><ThumbsUp size={16} /> Simple Answer</Text>
            <Text>{response.explanation.simple_answer}</Text>
        </View>
        <View style={styles.doubtSection}>
            <Text style={styles.doubtSectionHeader}><BookOpen size={16} /> Detailed Explanation</Text>
            <Markdown>{response.explanation.detailed_explanation}</Markdown>
        </View>
    </View>
);

const AskADoubtChat = ({ chatHistory, onSendMessage, isLoading }) => {
  const [query, setQuery] = useState("");
  const flatListRef = useRef(null);

  return (
    <View style={styles.chatWrapper}>
      <FlatList
        ref={flatListRef}
        data={chatHistory}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={[styles.chatMessage, item.sender === 'user' ? styles.userMessage : styles.botMessage]}>
            <View style={styles.chatAvatar}><Text>{item.sender === 'user' ? <User size={18} color="white" /> : <Bot size={18} color="white" />}</Text></View>
            <View style={styles.chatBubble}>
                {typeof item.text === "object" ? <DoubtResponseRenderer response={item.text} /> : <Text style={item.sender === 'user' && { color: 'white' }}>{item.text}</Text>}
            </View>
          </View>
        )}
        ListEmptyComponent={!isLoading ? <Text style={styles.emptyChatText}>Ask a question to get started!</Text> : null}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />
      {isLoading && <ActivityIndicator style={{ margin: 10 }} />}
      <View style={styles.chatInputContainer}>
        <TextInput style={styles.chatInput} value={query} onChangeText={setQuery} placeholder="Type your question..." editable={!isLoading} />
        <TouchableOpacity style={styles.sendButton} onPress={() => { onSendMessage(query); setQuery(''); }} disabled={isLoading || !query.trim()}>
          <Text style={{ color: 'white' }}>Send</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const StudyPlanLearn = () => {
    const { params } = useRoute();
    const navigation = useNavigation();
    const dispatch = useDispatch();
    const userId = useSelector(selectUserId);
    const { examName, topicDescription, originalPlanState, day_number } = params || {};
    const [subTopics, setSubTopics] = useState([]);
    const [selectedTopic, setSelectedTopic] = useState(null);
    const [activeTab, setActiveTab] = useState("Summary");
    const [content, setContent] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isChatLoading, setIsChatLoading] = useState(false);
    const doubtHistory = useSelector(state => (selectedTopic && state.studyPlan.doubtHistoryByTopic[selectedTopic]) || []);
    const cachedMaterials = useSelector(state => state.studyPlan.studyMaterialsByTopic);

    useEffect(() => {
        const topics = parseTopics(topicDescription);
        setSubTopics(topics);
        if (topics.length > 0) setSelectedTopic(topics[0]);
    }, [topicDescription]);

    const fetchMaterial = useCallback(async (forceRefetch = false) => {
        if (!selectedTopic || activeTab === "Ask a Doubt") { setContent(null); return; }
        const cacheKey = `${selectedTopic}-${activeTab}`;
        if (cachedMaterials[cacheKey] && !forceRefetch) {
            setContent(parseApiResponse(cachedMaterials[cacheKey], activeTab)); return;
        }
        setIsLoading(true);
        try {
            const response = await api.post(`${apiUrl}${GiveTopicStudyLinksEndpoint}`, {
                exam_name: examName, topics: [selectedTopic], user_id: userId, plan_id: originalPlanState.planId, day_number, type: activeTab.replace(/ /g, '_').toLowerCase()
            });
            const parsed = parseApiResponse(response.data, activeTab);
            setContent(parsed);
            if (parsed) dispatch(setStudyMaterial({ topicDescription: cacheKey, content: response.data }));
        } catch (e) { Alert.alert("Error", "Failed to load material."); }
        finally { setIsLoading(false); }
    }, [selectedTopic, activeTab, userId]);

    useEffect(() => { fetchMaterial(); }, [fetchMaterial]);

    const handleSendDoubt = async (query) => {
        const userMessage = { sender: 'user', text: query };
        dispatch(setDoubtMessages({ topic: selectedTopic, messages: [...doubtHistory, userMessage] }));
        setIsChatLoading(true);
        try {
            const response = await api.post(`${apiUrl}${GiveTopicStudyLinksEndpoint}`, { isDoubt: true, topic: selectedTopic, student_query: query, exam_name: examName, user_id: userId, plan_id: originalPlanState.planId, day_number });
            const botMessage = { sender: 'bot', text: response.data };
            dispatch(setDoubtMessages({ topic: selectedTopic, messages: [...doubtHistory, userMessage, botMessage] }));
        } catch (err) {
            const errorMessage = { sender: 'bot', text: 'Error processing request.' };
            dispatch(setDoubtMessages({ topic: selectedTopic, messages: [...doubtHistory, userMessage, errorMessage] }));
        } finally { setIsChatLoading(false); }
    };
    
    const tabs = [{ name: "Summary", icon: BookOpen }, { name: "Revision Notes", icon: FileText }, { name: "Explain Full Chapter", icon: School }, { name: "Practice Quiz", icon: PencilRuler }, { name: "Ask a Doubt", icon: MessageSquare }];

    return (
        <View style={styles.pageWrapper}>
            <View style={styles.sidebar}>
                <BackButton />
                <Text style={styles.sidebarHeader}>Topics for Preparation</Text>
                <ScrollView>
                    {subTopics.map((topic, index) => (
                        <TouchableOpacity key={index} style={[styles.topicButton, topic === selectedTopic && styles.activeTopic]} onPress={() => setSelectedTopic(topic)}>
                            <Text style={topic === selectedTopic && styles.activeTopicText}>{topic}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>
            <View style={styles.contentArea}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.actionButtons}>
                    {tabs.map(tab => (
                        <TouchableOpacity key={tab.name} style={[styles.actionBtn, activeTab === tab.name && styles.activeActionBtn]} onPress={() => setActiveTab(tab.name)}>
                            <tab.icon size={16} color={activeTab === tab.name ? 'white' : theme.colors.primary} />
                            <Text style={[styles.actionBtnText, activeTab === tab.name && styles.activeActionBtnText]}>{tab.name}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
                {isLoading ? <ScreenLoader /> :
                    activeTab === "Ask a Doubt" ? <AskADoubtChat chatHistory={doubtHistory} onSendMessage={handleSendDoubt} isLoading={isChatLoading} /> :
                    content ? (
                        <ScrollView>
                            <Text style={styles.materialTitle}>{content.title}</Text>
                            {content.type !== 'practice_quiz' ? content.concepts?.map((c, i) => (
                                <View key={i} style={styles.conceptCard}><Text style={styles.conceptTitle}>{c.concept_title || c.title}</Text><Markdown>{c.summary || c.points.join('\n')}</Markdown></View>
                            )) : content.questions.map((q, i) => (
                                <View key={i} style={styles.conceptCard}><Text style={styles.conceptTitle}>Q{i+1}: {q.question}</Text><Text>Answer: {q.answer}</Text></View>
                            ))}
                        </ScrollView>
                    ) : <Text>No content available.</Text>
                }
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    pageWrapper: { flex: 1, flexDirection: 'row', backgroundColor: '#f8faff' },
    sidebar: { width: 280, padding: 16, backgroundColor: 'white', borderRightWidth: 1, borderRightColor: '#e2e8f0' },
    sidebarHeader: { fontSize: 16, fontWeight: '600', color: theme.colors.primary, marginBottom: 16, textAlign: 'center' },
    topicButton: { padding: 12, borderRadius: 8, marginBottom: 8 },
    activeTopic: { backgroundColor: theme.colors.primaryLight },
    activeTopicText: { fontWeight: 'bold', color: theme.colors.primary },
    contentArea: { flex: 1, padding: 16 },
    actionButtons: { paddingBottom: 16, marginBottom: 16, borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
    actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8, borderWidth: 1, borderColor: '#e2e8f0', marginRight: 8 },
    activeActionBtn: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
    actionBtnText: { fontWeight: '600', color: theme.colors.primary },
    activeActionBtnText: { color: 'white' },
    materialTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
    conceptCard: { backgroundColor: 'white', padding: 16, borderRadius: 8, marginBottom: 12, borderWidth: 1, borderColor: '#e2e8f0' },
    conceptTitle: { fontSize: 18, fontWeight: '600', marginBottom: 8 },
    chatWrapper: { flex: 1 },
    chatMessage: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 10, maxWidth: '80%' },
    userMessage: { alignSelf: 'flex-end' },
    botMessage: { alignSelf: 'flex-start' },
    chatAvatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: theme.colors.primary, justifyContent: 'center', alignItems: 'center', marginHorizontal: 8 },
    chatBubble: { padding: 12, borderRadius: 18 },
    userMessage: { backgroundColor: theme.colors.primary },
    botMessage: { backgroundColor: '#e5e5ea' },
    emptyChatText: { textAlign: 'center', color: '#888', marginTop: 20 },
    chatInputContainer: { flexDirection: 'row', padding: 8, borderTopWidth: 1, borderTopColor: '#e2e8f0' },
    chatInput: { flex: 1, borderWidth: 1, borderColor: '#ccc', borderRadius: 20, paddingHorizontal: 15, height: 40 },
    sendButton: { marginLeft: 8, backgroundColor: theme.colors.primary, paddingHorizontal: 20, justifyContent: 'center', borderRadius: 20 },
    doubtResponseContainer: { gap: 10 },
    doubtSection: { borderLeftWidth: 3, paddingLeft: 10, borderColor: theme.colors.primary },
    doubtSectionHeader: { fontWeight: 'bold', marginBottom: 4 },
});

export default StudyPlanLearn;