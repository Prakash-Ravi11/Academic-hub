// ============ Configuration with GitHub Secrets ============

// Check if we're in GitHub Pages environment and have secrets
const isProduction = window.location.hostname.includes('github.io');

// Firebase Configuration - Using GitHub Secrets
const FIREBASE_CONFIG = {
    apiKey: isProduction ? process.env.FIREBASE_API_KEY : "demo-key-for-local-testing",
    authDomain: isProduction ? process.env.FIREBASE_AUTH_DOMAIN : "flowstate-pro-demo.firebaseapp.com",
    projectId: isProduction ? process.env.FIREBASE_PROJECT_ID : "flowstate-pro-demo",
    storageBucket: isProduction ? process.env.FIREBASE_STORAGE_BUCKET : "flowstate-pro-demo.appspot.com",
    messagingSenderId: isProduction ? process.env.FIREBASE_MESSAGING_SENDER_ID : "123456789",
    appId: isProduction ? process.env.FIREBASE_APP_ID : "1:123456789:web:demo"
};

// OpenRouter Configuration for Real ChatGPT - Using GitHub Secrets
const OPENROUTER_CONFIG = {
    apiKey: isProduction ? process.env.OPENROUTER_API_KEY : "demo-openrouter-key",
    baseURL: "https://openrouter.ai/api/v1",
    model: "openai/gpt-3.5-turbo-16k",
    fallbackModel: "anthropic/claude-3-haiku"
};

// Backup GitHub API Configuration
const GITHUB_CONFIG = {
    token: isProduction ? process.env.GITHUB_TOKEN : "demo-github-token",
    repo: "flowstate-pro-data",
    owner: "your-github-username"
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
    defaultStudyDuration: 25,
    defaultBreakDuration: 5,
    maxChatHistory: 50,
    autoSaveInterval: 30000
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
    COLLABORATION: false
};

// Secrets validation
function validateSecrets() {
    if (isProduction) {
        const requiredSecrets = [
            'FIREBASE_API_KEY',
            'FIREBASE_PROJECT_ID',
            'OPENROUTER_API_KEY'
        ];
        
        const missingSecrets = requiredSecrets.filter(secret => !process.env[secret]);
        
        if (missingSecrets.length > 0) {
            console.error('❌ Missing required secrets:', missingSecrets);
            return false;
        }
    }
    return true;
}

// Initialize configuration
function initializeConfig() {
    if (!validateSecrets()) {
        showNotification('Configuration error. Some features may not work.', 'warning');
        return false;
    }
    
    console.log('✅ Configuration initialized');
    return true;
}
