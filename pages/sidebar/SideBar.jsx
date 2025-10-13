import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Pressable } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import {
  LayoutDashboard, Book, MessageCircle, Trophy, ArrowUp, X,
  Newspaper, School
} from 'lucide-react-native';
import { theme } from '../../styles/theme';

const routes = [
  { name: "Dashboard", path: "Dashboard", icon: LayoutDashboard },
  { name: "Study Hub", path: "Tools", icon: Book },
  { name: "ClassRoom", path: "ToolDetail", icon: School, isTool: true, state: { tool: { subType: "ClassRoom", title: "ClassRoom" } } },
  { name: "Daily News", path: "ToolDetail", icon: Newspaper, isTool: true, state: { tool: { subType: "Daily News", title: "Daily News" } } },
  { name: "Chat", path: "ChatBot", icon: MessageCircle },
  { name: "Leader Board", path: "Challenge", icon: Trophy },
  { name: "Upgrade", path: "Upgrade", icon: ArrowUp },
];

const SideBar = ({ isOpen, toggle }) => {
    const navigation = useNavigation();
    const route = useRoute();
    
    const handleNavigation = (path, state) => {
        if (state) {
            navigation.navigate(path, state);
        } else {
            navigation.navigate(path);
        }
        toggle();
    };

    const NavItem = ({ item }) => {
        const isActive = route.name === item.path && (!item.state || route.params?.tool?.subType === item.state.tool.subType);
        return (
            <TouchableOpacity style={[styles.navItem, isActive && styles.activeItem]} onPress={() => handleNavigation(item.path, item.state)}>
                <View style={[styles.iconWrapper, isActive && styles.activeIconWrapper]}>
                    <item.icon color={isActive ? 'white' : theme.colors.primary} size={22} />
                </View>
                <Text style={[styles.navLabel, isActive && styles.activeLabel]}>{item.name}</Text>
            </TouchableOpacity>
        );
    };

    return (
        <Modal visible={isOpen} transparent={true} animationType="fade" onRequestClose={toggle}>
            <Pressable style={styles.overlay} onPress={toggle}>
                <Pressable style={styles.sidebarContainer}>
                    <TouchableOpacity style={styles.closeButton} onPress={toggle}><X color="#333" /></TouchableOpacity>
                    <View style={styles.navList}>
                        {routes.map(item => <NavItem key={item.name} item={item} />)}
                    </View>
                </Pressable>
            </Pressable>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' },
    sidebarContainer: { width: 260, height: '100%', backgroundColor: 'white', padding: 20, paddingTop: 60, elevation: 10 },
    closeButton: { position: 'absolute', top: 20, right: 20 },
    navList: { marginTop: 20 },
    navItem: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 12, marginBottom: 8 },
    activeItem: { backgroundColor: '#f0efff' },
    iconWrapper: { backgroundColor: '#f0efff', borderRadius: 12, width: 45, height: 45, justifyContent: 'center', alignItems: 'center' },
    activeIconWrapper: { backgroundColor: theme.colors.primary },
    navLabel: { fontSize: 16, marginLeft: 16, color: '#374151', fontWeight: '500' },
    activeLabel: { color: theme.colors.primary, fontWeight: '600' },
});

export default SideBar;