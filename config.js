// Firebase Configuration
const FIREBASE_CONFIG = {
    apiKey: "your-firebase-api-key",
    authDomain: "flowstate-pro.firebaseapp.com",
    projectId: "flowstate-pro",
    storageBucket: "flowstate-pro.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abcdef123456"
};

// OpenRouter Configuration for ChatGPT
const OPENROUTER_CONFIG = {
    apiKey: "your-openrouter-api-key",
    baseURL: "https://openrouter.ai/api/v1",
    model: "openai/gpt-3.5-turbo",
    fallbackModel: "anthropic/claude-3-haiku"
};

// App Configuration
const APP_CONFIG = {
    name: "FlowState Pro",
    version: "5.0.0",
    enableOfflineMode: true,
    enableVoiceFeatures: true,
    enableNotifications: true,
    maxFileUploadSize: 10 * 1024 * 1024, // 10MB
    supportedFileTypes: ['.pdf', '.xlsx', '.xls', '.csv', '.txt', '.jpg', '.png', '.jpeg'],
    defaultStudyDuration: 25, // minutes
    defaultBreakDuration: 5, // minutes
    maxChatHistory: 50,
    autoSaveInterval: 30000 // 30 seconds
};

// API Endpoints
const API_ENDPOINTS = {
    openrouter: "https://openrouter.ai/api/v1/chat/completions",
    backup: "https://api.github.com/repos/your-username/flowstate-data",
    analytics: "https://api.flowstate-pro.com/analytics"
};

// Feature Flags
const FEATURES = {
    REAL_CHATGPT: true,
    CLOUD_STORAGE: true,
    FILE_UPLOAD: true,
    VOICE_COMMANDS: true,
    STUDY_ALARMS: true,
    BREAK_INTERVALS: true,
    ANALYTICS: true,
    COLLABORATION: false, // Coming soon
    PREMIUM_FEATURES: false
};

// Secrets Placeholder (Will be replaced by GitHub Secrets)
const SECRETS = {
    FIREBASE_API_KEY: process.env.FIREBASE_API_KEY || FIREBASE_CONFIG.apiKey,
    OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY || OPENROUTER_CONFIG.apiKey,
    FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID || FIREBASE_CONFIG.projectId
};
