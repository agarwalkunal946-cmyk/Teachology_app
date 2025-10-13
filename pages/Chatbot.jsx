import React, { useState, useRef, useEffect } from "react";
import {
  View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity,
  Modal, Pressable, Image, ActivityIndicator, Alert, SafeAreaView
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { useNavigation } from "@react-navigation/native";
import Markdown from "react-native-markdown-display";
import { pick } from '@react-native-documents/picker';
import {
  addChat, setCurrentChat, addMessage, selectChats, selectCurrentChat,
  deleteChat, updateLastBotMessage, initializeChat
} from "../redux/chatSlice";
import { selectUserId, selectUser } from "../redux/authSlice";
import { getInitialTokenInfoEndpoint, askAssistant as askAssistantEndpoint, apiUrl } from "../config/config";
import api from "../utils/apiLogger";
import { Trash2, X, History, User, Bot, Paperclip, Send } from 'lucide-react-native';
import { theme } from '../styles/theme';

const Avatar = ({ type }) => {
    const auth = useSelector(selectUser);
    const [imgFailed, setImgFailed] = useState(false);
    const effectiveSrc = type === "user" ? auth?.profile_image : null;
    const hasSrc = effectiveSrc && effectiveSrc !== "None";

    useEffect(() => { setImgFailed(false); }, [effectiveSrc]);

    if (!hasSrc || imgFailed) {
        return (
            <View style={styles.avatarWrapper}>
                {type === "user" ? <User color={theme.colors.primary} size={22} /> : <Bot color={theme.colors.primary} size={22} />}
            </View>
        );
    }
    return (
        <View style={styles.avatarWrapper}>
            <Image source={{ uri: effectiveSrc }} style={styles.avatarImage} onError={() => setImgFailed(true)} />
        </View>
    );
};

const EmptyChatView = ({ onAttachClick }) => (
    <View style={styles.emptyChatContainer}>
        <View style={styles.emptyChatContent}>
            <Image style={styles.uploadCloudIcon} source={require('../assets/img/ui/doubt-illustration.png')} />
            <View>
                <Text style={styles.emptyHeadingLine1}>Please Upload a document to</Text>
                <Text style={styles.emptyHeadingLine2}>Start a Conversation</Text>
            </View>
            <TouchableOpacity style={styles.uploadButton} onPress={onAttachClick}>
                <Text style={styles.uploadButtonText}>Upload Document</Text>
            </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.initialInputBar} onPress={onAttachClick}>
            <Paperclip color={theme.colors.textDark} style={styles.attachIcon} />
            <Text style={styles.initialInputPrompt}>Please upload document.</Text>
            <View style={styles.roundActionButton}>
                <Send color="white" size={20} />
            </View>
        </TouchableOpacity>
    </View>
);

const Sidebar = ({ chatHistory, onSelectChat, selectedChatId, handleDeleteChat, onNewChat, tokenInfo, isOpen, onClose }) => {
    const navigation = useNavigation();
    const displayableChats = chatHistory.filter(chat => chat.messages && chat.messages.length > 0);

    return (
        <Modal visible={isOpen} transparent={true} animationType="fade" onRequestClose={onClose}>
            <Pressable style={styles.sidebarOverlay} onPress={onClose}>
                <Pressable style={styles.sidebarContainer}>
                    <TouchableOpacity style={styles.sidebarCloseBtn} onPress={onClose}>
                        <X color={theme.colors.textDark} size={24} />
                    </TouchableOpacity>
                    <View style={styles.infoCard}>
                        <View style={styles.infoCardHeader}>
                            <View style={styles.cardIconBg}><History color="white" size={16} /></View>
                            <Text style={styles.infoCardTitle}>Chat History</Text>
                        </View>
                        <TouchableOpacity style={[styles.rechargeBtn, styles.newChatBtn]} onPress={onNewChat}>
                            <Text style={styles.rechargeBtnText}>+ New Chat</Text>
                        </TouchableOpacity>
                        <FlatList
                            data={displayableChats}
                            keyExtractor={item => item.id}
                            renderItem={({ item }) => (
                                <TouchableOpacity style={[styles.historyItem, item.id === selectedChatId && styles.activeHistoryItem]} onPress={() => onSelectChat(item.id)}>
                                    <Text style={styles.historyItemName} numberOfLines={1}>{item.messages[0]?.text}</Text>
                                    <TouchableOpacity onPress={() => handleDeleteChat(item.id)}>
                                        <Trash2 color={item.id === selectedChatId ? 'white' : theme.colors.notification} size={16} />
                                    </TouchableOpacity>
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                    <View style={styles.infoCard}>
                        <View style={styles.infoCardHeader}>
                             <View style={styles.cardIconBg}><Image source={require('../assets/img/ui/logo.png')} style={{width: 16, height: 16}} /></View>
                            <Text style={styles.infoCardTitle}>Tokens</Text>
                        </View>
                        <View style={styles.tokensBody}>
                            <View>
                                <Text style={styles.tokenValue}>{tokenInfo?.tokens_left || 0}</Text>
                                <Text style={styles.tokenTotal}>/ {tokenInfo?.total_tokens || 10000}</Text>
                            </View>
                            <TouchableOpacity style={styles.rechargeBtn} onPress={() => navigation.navigate("Upgrade")}>
                                <Text style={styles.rechargeBtnText}>Recharge</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Pressable>
            </Pressable>
        </Modal>
    );
};

const ChatDisplay = ({ messages }) => {
    const flatListRef = useRef(null);
    return (
        <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item, index) => index.toString()}
            style={styles.messageDisplayArea}
            contentContainerStyle={{ paddingVertical: 10 }}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
            renderItem={({ item }) => (
                <View style={[styles.messageWrapper, item.type === "user" ? styles.userMessageWrapper : styles.aiMessageWrapper]}>
                    {item.type === "ai" && <Avatar type="ai" />}
                    <View style={[styles.messageContent, item.type === "user" ? styles.userMessageContent : styles.aiMessageContent]}>
                        {item.isLoading ? <ActivityIndicator color={theme.colors.primary} /> : <Markdown style={{ body: { color: item.type === 'user' ? 'white' : theme.colors.textDark, fontSize: 16 } }}>{item.text}</Markdown>}
                    </View>
                    {item.type === "user" && <Avatar type="user" />}
                </View>
            )}
        />
    );
};

const InputBox = ({ onSendMessage, isLoading, selectedFile, handleRemoveFile, message, setMessage, onAttachClick }) => {
    return (
        <View style={styles.chatInputContainer}>
            {selectedFile && (
                <View style={styles.fileChip}>
                    <Text style={styles.fileName}>{selectedFile.name}</Text>
                    <TouchableOpacity onPress={handleRemoveFile}><X color="white" size={16} /></TouchableOpacity>
                </View>
            )}
            <View style={styles.textInputBar}>
                <TouchableOpacity style={styles.roundActionButton} onPress={onAttachClick}>
                    <Paperclip color="white" size={20} />
                </TouchableOpacity>
                <TextInput
                    style={styles.textInputField}
                    placeholder="Ask Anything"
                    value={message}
                    onChangeText={setMessage}
                    editable={!isLoading}
                    onSubmitEditing={() => onSendMessage(message)}
                />
                <TouchableOpacity style={styles.roundActionButton} onPress={() => onSendMessage(message)} disabled={isLoading || !message.trim()}>
                    <Send color="white" size={20} />
                </TouchableOpacity>
            </View>
        </View>
    );
};

const ChatBot = () => {
    const dispatch = useDispatch();
    const chats = useSelector(selectChats);
    const currentChat = useSelector(selectCurrentChat);
    const userId = useSelector(selectUserId);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [tokenInfo, setTokenInfo] = useState(null);

    const fetchTokenInfo = async () => {
        if (!userId) return;
        try {
            const formData = new FormData();
            formData.append("user_id", userId);
            const response = await api.post(`${apiUrl}${getInitialTokenInfoEndpoint}`, formData);
            setTokenInfo(response.data);
        } catch (error) {
            Alert.alert("Error", "Could not update token count.");
        }
    };

    useEffect(() => {
        dispatch(initializeChat());
        fetchTokenInfo();
    }, [dispatch, userId]);

    const handleSendMessage = async (userMessage) => {
        if (!selectedFile) {
            Alert.alert("Upload Required", "To start the conversation, please upload a document.");
            return;
        }
        const chatId = currentChat.id;
        setIsLoading(true);
        dispatch(addMessage({ chatId, message: userMessage, type: "user" }));
        dispatch(addMessage({ chatId, message: "", type: "bot", isLoading: true }));
        setMessage("");

        const formData = new FormData();
        formData.append("request", userMessage);
        formData.append("uploadedFiles", selectedFile);
        formData.append("user_id", userId);

        try {
            const response = await api.post(`${apiUrl}${askAssistantEndpoint}`, formData);
            dispatch(updateLastBotMessage({ chatId, newMessage: response.data.response, isLoading: false }));
        } catch (error) {
            dispatch(updateLastBotMessage({ chatId, newMessage: "Sorry, something went wrong.", isLoading: false }));
        } finally {
            setIsLoading(false);
            await fetchTokenInfo();
        }
    };

    const handleFilePick = async () => {
        try {
            const [res] = await pick({ type: ['application/pdf'] });
            if (res.size > 5 * 1024 * 1024) {
                Alert.alert("File Too Large", "File size cannot exceed 5MB.");
                return;
            }
            setSelectedFile({ uri: res.uri, name: res.name, type: res.type });
        } catch (err) {
            console.log(err);
        }
    };

    const handleDeleteChat = (idToDelete) => {
        dispatch(deleteChat(idToDelete));
        setSelectedFile(null);
        dispatch(addChat());
    };

    const showEmptyView = !selectedFile && (!currentChat || currentChat.messages.length === 0);

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.chatContainer}>
                <TouchableOpacity style={styles.sidebarToggleBtn} onPress={() => setIsSidebarOpen(true)}>
                    <History color="white" size={18} />
                </TouchableOpacity>
                {showEmptyView ? (
                    <EmptyChatView onAttachClick={handleFilePick} />
                ) : (
                    <>
                        <ChatDisplay messages={currentChat?.messages || []} />
                        <InputBox
                            onSendMessage={handleSendMessage}
                            isLoading={isLoading}
                            selectedFile={selectedFile}
                            handleRemoveFile={() => setSelectedFile(null)}
                            message={message}
                            setMessage={setMessage}
                            onAttachClick={handleFilePick}
                        />
                    </>
                )}
                <Sidebar
                    chatHistory={chats}
                    onSelectChat={(id) => { dispatch(setCurrentChat(id)); setIsSidebarOpen(false); }}
                    selectedChatId={currentChat?.id}
                    handleDeleteChat={handleDeleteChat}
                    onNewChat={() => { dispatch(addChat()); setSelectedFile(null); setIsSidebarOpen(false); }}
                    tokenInfo={tokenInfo}
                    isOpen={isSidebarOpen}
                    onClose={() => setIsSidebarOpen(false)}
                />
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#f8f9fe' },
    chatContainer: { flex: 1, flexDirection: 'row', padding: 10 },
    sidebarToggleBtn: { position: 'absolute', top: 15, right: 15, backgroundColor: theme.colors.primary, borderRadius: 20, width: 40, height: 40, alignItems: 'center', justifyContent: 'center', zIndex: 10 },
    emptyChatContainer: { flex: 1, justifyContent: 'space-between', alignItems: 'center', borderRadius: 24, padding: 24, backgroundColor: 'rgba(255, 255, 255, 0.7)' },
    emptyChatContent: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 24 },
    uploadCloudIcon: { width: 120, height: 120 },
    emptyHeadingLine1: { fontSize: 22, color: theme.colors.textDark },
    emptyHeadingLine2: { fontSize: 28, fontWeight: '700', color: theme.colors.primary },
    uploadButton: { backgroundColor: theme.colors.primary, paddingVertical: 12, paddingHorizontal: 28, borderRadius: 25 },
    uploadButtonText: { color: 'white', fontSize: 16, fontWeight: '600' },
    initialInputBar: { flexDirection: 'row', alignItems: 'center', width: '100%', padding: 8, borderRadius: 50, backgroundColor: '#deddff', gap: 16 },
    attachIcon: { marginLeft: 12 },
    initialInputPrompt: { flex: 1, fontSize: 16, color: theme.colors.textDark },
    messageDisplayArea: { flex: 1, backgroundColor: 'rgba(245, 247, 255, 0.8)', borderRadius: 24, padding: 10 },
    messageWrapper: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginVertical: 10, maxWidth: '80%' },
    userMessageWrapper: { alignSelf: 'flex-end', flexDirection: 'row-reverse' },
    aiMessageWrapper: { alignSelf: 'flex-start' },
    avatarWrapper: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'white', borderWidth: 2, borderColor: theme.colors.primary, justifyContent: 'center', alignItems: 'center' },
    avatarImage: { width: '100%', height: '100%', borderRadius: 20 },
    messageContent: { padding: 16, borderRadius: 18, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.4)' },
    userMessageContent: { backgroundColor: theme.colors.primary, borderTopRightRadius: 8 },
    aiMessageContent: { backgroundColor: theme.colors.lightPrimaryBg, borderTopLeftRadius: 8 },
    chatInputContainer: { backgroundColor: theme.colors.lightPrimaryBg, borderRadius: 16, padding: 12, marginTop: 16 },
    fileChip: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: theme.colors.primary, padding: 8, borderRadius: 8, alignSelf: 'flex-start', marginBottom: 10 },
    fileName: { color: 'white' },
    textInputBar: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    roundActionButton: { backgroundColor: theme.colors.primary, borderRadius: 24, width: 48, height: 48, justifyContent: 'center', alignItems: 'center' },
    textInputField: { flex: 1, fontSize: 16, paddingHorizontal: 12, color: theme.colors.textDark },
    sidebarOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' },
    sidebarContainer: { position: 'absolute', right: 0, top: 0, bottom: 0, width: 300, backgroundColor: '#f8f9fe', padding: 20, paddingTop: 50 },
    sidebarCloseBtn: { alignSelf: 'flex-end', marginBottom: 10 },
    infoCard: { backgroundColor: 'rgba(245, 247, 255, 0.9)', borderRadius: 24, padding: 20, gap: 16, marginBottom: 24 },
    infoCardHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    cardIconBg: { backgroundColor: theme.colors.primary, borderRadius: 16, width: 32, height: 32, justifyContent: 'center', alignItems: 'center' },
    infoCardTitle: { fontSize: 20, fontWeight: '700', color: theme.colors.primary },
    newChatBtn: { paddingVertical: 10, borderRadius: 20, alignItems: 'center', backgroundColor: theme.colors.primary },
    rechargeBtnText: { color: 'white', fontWeight: '600' },
    historyItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 12, borderRadius: 8, backgroundColor: '#e7e6e6', marginTop: 5 },
    activeHistoryItem: { backgroundColor: theme.colors.primary },
    historyItemName: { flex: 1, color: theme.colors.textDark },
    tokensBody: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    tokenValue: { fontSize: 20, fontWeight: '700', color: theme.colors.primary },
    tokenTotal: { fontSize: 14, color: theme.colors.textDark },
    rechargeBtn: { backgroundColor: theme.colors.primary, paddingVertical: 10, paddingHorizontal: 22, borderRadius: 20 },
});

export default ChatBot;