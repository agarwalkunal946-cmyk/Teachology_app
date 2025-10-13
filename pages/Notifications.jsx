import React, { useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, Pressable } from 'react-native';
import { useNavigation } from "@react-navigation/native";
import api from "../utils/apiLogger";
import { markNotificationAsReadEndpoint, apiUrl } from "../config/config";
import { theme } from '../styles/theme';

const timeAgo = (date) => {
    if (!date) return "";
    const now = new Date();
    const seconds = Math.round((now - new Date(date)) / 1000);
    const minutes = Math.round(seconds / 60);
    const hours = Math.round(minutes / 60);
    const days = Math.round(hours / 24);

    if (seconds < 60) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
};

const EmptyNotifications = () => (
    <View style={styles.notificationState}>
        <Text style={styles.notificationStateText}>No new notifications.</Text>
    </View>
);

const Notifications = ({ isVisible, closePanel, notifications, setNotifications }) => {
    const navigation = useNavigation();

    const handleNotificationClick = async (notification) => {
        if (!notification.isRead) {
            try {
                await api.post(`${apiUrl}${markNotificationAsReadEndpoint}`, {
                    notification_id: notification._id,
                });
                setNotifications(prev =>
                    prev.map(n => (n._id === notification._id ? { ...n, isRead: true } : n))
                );
            } catch (err) {
                console.error("Failed to mark notification as read:", err);
            }
        }

        if (notification.link && notification.link.toLowerCase() !== "none") {
            const path = notification.link.startsWith("/") ? notification.link.substring(1) : notification.link;
            navigation.navigate(path);
            closePanel();
        }
    };

    const sortedNotifications = useMemo(() => {
        return [...notifications].sort((a, b) => {
            if (a.isRead !== b.isRead) return a.isRead ? 1 : -1;
            return new Date(b.createdAt) - new Date(a.createdAt);
        });
    }, [notifications]);

    const renderItem = ({ item }) => (
        <TouchableOpacity
            style={[styles.notificationItem, !item.isRead ? styles.unread : styles.read]}
            onPress={() => handleNotificationClick(item)}
            disabled={item.isRead}
        >
            <View style={styles.notificationContent}>
                <Text style={[styles.notificationTitle, !item.isRead && styles.unreadTitle]}>{item.title}</Text>
                <Text style={styles.notificationText}>{item.message}</Text>
            </View>
            <View style={styles.notificationMeta}>
                <Text style={styles.notificationTime}>{timeAgo(item.createdAt)}</Text>
                {!item.isRead && <View style={styles.notificationIndicator} />}
            </View>
        </TouchableOpacity>
    );

    return (
        <Modal
            visible={isVisible}
            transparent={true}
            animationType="fade"
            onRequestClose={closePanel}
        >
            <Pressable style={styles.overlay} onPress={closePanel}>
                <Pressable style={styles.notificationsPanel}>
                    <View style={styles.notificationsHeader}>
                        <Text style={styles.notificationsTitle}>Notifications</Text>
                    </View>
                    <FlatList
                        data={sortedNotifications}
                        renderItem={renderItem}
                        keyExtractor={(item) => item._id}
                        ListEmptyComponent={<EmptyNotifications />}
                        contentContainerStyle={styles.notificationsList}
                    />
                </Pressable>
            </Pressable>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'flex-start',
        alignItems: 'flex-end',
    },
    notificationsPanel: {
        marginTop: 75,
        marginRight: 20,
        width: 380,
        maxWidth: '90%',
        backgroundColor: '#ffffff',
        borderRadius: 16,
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        maxHeight: '70%',
    },
    notificationsHeader: {
        padding: 16,
        borderBottomWidth: 1,
        borderColor: '#e2e8f0',
    },
    notificationsTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1e293b',
    },
    notificationsList: {
        padding: 8,
    },
    notificationItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 16,
        padding: 16,
        borderRadius: 12,
        marginBottom: 8,
    },
    unread: {
        backgroundColor: '#eae8fd',
        borderWidth: 1,
        borderColor: '#dcd9f9',
    },
    read: {
        opacity: 0.7,
    },
    notificationContent: {
        flex: 1,
    },
    notificationTitle: {
        fontSize: 15,
        fontWeight: '600',
        lineHeight: 20,
        color: '#475569',
        marginBottom: 4,
    },
    unreadTitle: {
        color: theme.colors.primary,
    },
    notificationText: {
        fontSize: 14,
        lineHeight: 20,
        color: '#64748b',
    },
    notificationMeta: {
        alignItems: 'flex-end',
        gap: 8,
    },
    notificationTime: {
        fontSize: 12,
        color: '#475569',
        fontWeight: '500',
    },
    notificationIndicator: {
        width: 10,
        height: 10,
        backgroundColor: theme.colors.primary,
        borderRadius: 5,
    },
    notificationState: {
        padding: 48,
        alignItems: 'center',
        justifyContent: 'center',
    },
    notificationStateText: {
        color: '#64748b',
        fontSize: 14,
    },
});

export default Notifications;