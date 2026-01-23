/**
 * TaskAI - Your AI-Powered Task Management App
 *
 * @format
 */

import { StatusBar, StyleSheet, useColorScheme, View, Text } from 'react-native';
import {
    SafeAreaProvider,
    useSafeAreaInsets,
} from 'react-native-safe-area-context';

// Define the StatusBarContentStyle enum
enum StatusBarContentStyle {
    Light = 'light-content',
    Dark = 'dark-content',
}

function App() {
    const isDarkMode = useColorScheme() === 'dark';

    // Determine the status bar style
    const statusBarStyle = isDarkMode
        ? StatusBarContentStyle.Light
        : StatusBarContentStyle.Dark;

    return (
        <SafeAreaProvider>
            <StatusBar barStyle={statusBarStyle} />
            <AppContent />
        </SafeAreaProvider>
    );
}

function AppContent() {
    const safeAreaInsets = useSafeAreaInsets();
    const isDarkMode = useColorScheme() === 'dark';

    return (
        <View style={[styles.container, { paddingTop: safeAreaInsets.top }]}>
            <View style={styles.content}>
                <Text style={[styles.title, isDarkMode && styles.titleDark]}>
                    TaskAI
                </Text>
                <Text style={[styles.subtitle, isDarkMode && styles.subtitleDark]}>
                    Your AI-Powered Task Management Assistant
                </Text>
                <View style={styles.descriptionContainer}>
                    <Text style={[styles.description, isDarkMode && styles.descriptionDark]}>
                        Welcome to TaskAI! Manage your tasks with the power of artificial intelligence.
                    </Text>
                    <Text style={[styles.description, isDarkMode && styles.descriptionDark]}>
                        Organize, prioritize, and complete your tasks more efficiently than ever before.
                    </Text>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 32,
    },
    title: {
        fontSize: 48,
        fontWeight: 'bold',
        color: '#000000',
        marginBottom: 16,
        textAlign: 'center',
    },
    titleDark: {
        color: '#FFFFFF',
    },
    subtitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#666666',
        marginBottom: 32,
        textAlign: 'center',
    },
    subtitleDark: {
        color: '#CCCCCC',
    },
    descriptionContainer: {
        marginTop: 24,
        gap: 16,
    },
    description: {
        fontSize: 16,
        color: '#333333',
        textAlign: 'center',
        lineHeight: 24,
    },
    descriptionDark: {
        color: '#DDDDDD',
    },
});

export default App;
