// ============ Global Variables & Configuration ============
let app = null;
let auth = null;
let db = null;
let storage = null;

// Application State
const AppState = {
    currentUser: null,
    tasks: [],
    completedTasks: [],
    studyStats: {
        totalStudyTime: 0,
        studyStreak: 0,
        breaksTaken: 0,
        currentSessionTime: 0
    },
    timers: {
        study: { duration: 1500, timeLeft: 1500, isRunning: false },
        break: { duration: 300, timeLeft: 300, isRunning: false },
        tasks: new Map()
    },
    voiceSettings: {
        enabled: true,
        gender: 'female',
        speed: 0.9,
        selectedVoice: null
    },
    theme: 'light',
    alarms: [],
    chatHistory: [],
    uploadedFiles: [],
    isInitialized: false
};

// ============ Firebase Initialization ============
function initializeFirebase() {
    try {
        // Initialize Firebase
        firebase.initializeApp(FIREBASE_CONFIG);
        
        auth = firebase.auth();
        db = firebase.firestore();
        storage = firebase.storage();
        
        console.log('✅ Firebase initialized successfully');
        
        // Auth state listener
        auth.onAuthStateChanged((user) => {
            if (user) {
                AppState.currentUser = user;
                loadUserData();
                showMainApp();
            } else {
                AppState.currentUser = null;
                showAuthModal();
            }
        });
        
        return true;
    } catch (error) {
        console.error('❌ Firebase initialization failed:', error);
        showNotification('Connection failed. Using offline mode.', 'warning');
        return false;
    }
}

// ============ Authentication Manager ============
class AuthManager {
    constructor() {
        this.isLoginMode = true;
        this.setupEventListeners();
    }

    setupEventListeners() {
        document.getElementById('authForm').addEventListener('submit', this.handleAuth.bind(this));
        document.getElementById('authSwitchLink').addEventListener('click', this.toggleAuthMode.bind(this));
    }

    async handleAuth(event) {
        event.preventDefault();
        
        const email = document.getElementById('emailInput').value.trim();
        const password = document.getElementById('passwordInput').value.trim();
        
        if (!email || !password) {
            showMessage('Please fill in all required fields', 'error');
            return;
        }

        this.showLoading(true);

        try {
            if (this.isLoginMode) {
                await this.signIn(email, password);
            } else {
                await this.signUp(email, password);
            }
        } catch (error) {
            console.error('Auth error:', error);
            showMessage(this.getErrorMessage(error.code), 'error');
        } finally {
            this.showLoading(false);
        }
    }

    async signIn(email, password) {
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        const user = userCredential.user;
        
        showMessage(`Welcome back, ${user.email}!`, 'success');
        await this.loadUserProfile(user);
    }

    async signUp(email, password) {
        const name = document.getElementById('nameInput').value.trim();
        const age = document.getElementById('ageInput').value;
        const gender = document.querySelector('input[name="gender"]:checked')?.value;

        if (!name) {
            throw new Error('Name is required');
        }

        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        const user = userCredential.user;

        // Update profile
        await user.updateProfile({ displayName: name });

        // Save additional user data to Firestore
        await db.collection('users').doc(user.uid).set({
            name: name,
            email: email,
            age: age || null,
            gender: gender || 'not-specified',
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            settings: {
                theme: 'light',
                voiceGender: 'female',
                notifications: true
            },
            stats: {
                totalTasks: 0,
                completedTasks: 0,
                studyTime: 0,
                streak: 0
            }
        });

        showMessage(`Account created successfully! Welcome, ${name}!`, 'success');
        await this.loadUserProfile(user);
    }

    async loadUserProfile(user) {
        try {
            const userDoc = await db.collection('users').doc(user.uid).get();
            if (userDoc.exists) {
                const userData = userDoc.data();
                AppState.currentUser = { ...user, ...userData };
                
                // Update UI
                document.getElementById('userName').textContent = userData.name || user.email;
                document.getElementById('userAvatar').textContent = (userData.name || user.email).charAt(0).toUpperCase();
            }
        } catch (error) {
            console.error('Error loading user profile:', error);
        }
    }

    toggleAuthMode() {
        this.isLoginMode = !this.isLoginMode;
        
        const title = document.getElementById('authTitle');
        const subtitle = document.getElementById('authSubtitle');
        const nameInput = document.getElementById('nameInput');
        const ageInput = document.getElementById('ageInput');
        const genderSelector = document.getElementById('genderSelector');
        const submitBtn = document.getElementById('authButtonText');
        const switchText = document.getElementById('authSwitchText');
        const switchLink = document.getElementById('authSwitchLink');

        if (this.isLoginMode) {
            title.textContent = 'Welcome Back';
            subtitle.textContent = 'Sign in to your account';
            nameInput.style.display = 'none';
            ageInput.style.display = 'none';
            genderSelector.style.display = 'none';
            submitBtn.textContent = 'Sign In';
            switchText.textContent = "Don't have an account?";
            switchLink.textContent = 'Create Account';
        } else {
            title.textContent = 'Join FlowState Pro';
            subtitle.textContent = 'Create your productivity workspace';
            nameInput.style.display = 'block';
            ageInput.style.display = 'block';
            genderSelector.style.display = 'block';
            submitBtn.textContent = 'Create Account';
            switchText.textContent = 'Already have an account?';
            switchLink.textContent = 'Sign In';
        }

        // Clear form
        document.getElementById('authForm').reset();
        dismissMessage();
    }

    async resetPassword() {
        const email = prompt('Enter your email address:');
        if (!email) return;

        try {
            await auth.sendPasswordResetEmail(email);
            showMessage('Password reset email sent! Check your inbox.', 'success');
        } catch (error) {
            showMessage(this.getErrorMessage(error.code), 'error');
        }
    }

    showLoading(show) {
        const loader = document.getElementById('authLoader');
        const buttonText = document.getElementById('authButtonText');
        
        if (show) {
            loader.classList.remove('hidden');
            buttonText.classList.add('hidden');
        } else {
            loader.classList.add('hidden');
            buttonText.classList.remove('hidden');
        }
    }

    getErrorMessage(errorCode) {
        const errorMessages = {
            'auth/user-not-found': 'No account found with this email address.',
            'auth/wrong-password': 'Incorrect password. Please try again.',
            'auth/email-already-in-use': 'An account with this email already exists.',
            'auth/weak-password': 'Password should be at least 6 characters long.',
            'auth/invalid-email': 'Please enter a valid email address.',
            'auth/too-many-requests': 'Too many failed attempts. Please try again later.',
            'auth/network-request-failed': 'Network error. Please check your connection.'
        };
        
        return errorMessages[errorCode] || 'An unexpected error occurred. Please try again.';
    }
}

// ============ ChatGPT Integration with OpenRouter ============
class ChatGPTManager {
    constructor() {
        this.apiKey = OPENROUTER_CONFIG.apiKey;
        this.baseURL = OPENROUTER_CONFIG.baseURL;
        this.model = OPENROUTER_CONFIG.model;
        this.chatHistory = [];
        this.setupEventListeners();
    }

    setupEventListeners() {
        document.getElementById('chatInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });
    }

    async sendMessage() {
        const input = document.getElementById('chatInput');
        const message = input.value.trim();
        
        if (!message) return;

        // Add user message to chat
        this.addMessageToChat(message, 'user');
        input.value = '';

        // Show loading
        this.showTyping(true);

        try {
            const response = await this.callOpenRouter(message);
            this.addMessageToChat(response, 'ai');
            
            // Save to history
            this.chatHistory.push(
                { role: 'user', content: message },
                { role: 'assistant', content: response }
            );

            // Speak response if voice is enabled
            if (AppState.voiceSettings.enabled) {
                speakText(response);
            }

        } catch (error) {
            console.error('ChatGPT API Error:', error);
            this.addMessageToChat('Sorry, I encountered an error. Please try again.', 'ai');
        } finally {
            this.showTyping(false);
        }
    }

    async callOpenRouter(message) {
        const headers = {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': window.location.origin,
            'X-Title': 'FlowState Pro'
        };

        const payload = {
            model: this.model,
            messages: [
                {
                    role: 'system',
                    content: `You are a helpful AI assistant integrated into FlowState Pro, a productivity app. The user's name is ${AppState.currentUser?.name || 'User'}. You help with studying, productivity, task management, motivation, and general questions. Be helpful, encouraging, and concise.`
                },
                ...this.chatHistory.slice(-10), // Keep last 10 messages for context
                {
                    role: 'user',
                    content: message
                }
            ],
            max_tokens: 500,
            temperature: 0.7,
            top_p: 0.9,
            frequency_penalty: 0.1,
            presence_penalty: 0.1
        };

        const response = await fetch(`${this.baseURL}/chat/completions`, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error(`OpenRouter API error: ${response.status}`);
        }

        const data = await response.json();
        return data.choices[0].message.content;
    }

    addMessageToChat(message, sender) {
        const chatMessages = document.getElementById('chatMessages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}`;
        
        if (sender === 'ai') {
            messageDiv.innerHTML = `<strong>🤖 ChatGPT:</strong> ${message}`;
        } else {
            messageDiv.innerHTML = `<strong>You:</strong> ${message}`;
        }
        
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    showTyping(show) {
        const chatMessages = document.getElementById('chatMessages');
        let typingIndicator = chatMessages.querySelector('.typing-indicator');
        
        if (show && !typingIndicator) {
            typingIndicator = document.createElement('div');
            typingIndicator.className = 'message ai typing-indicator';
            typingIndicator.innerHTML = '<strong>🤖 ChatGPT:</strong> <em>Thinking...</em>';
            chatMessages.appendChild(typingIndicator);
            chatMessages.scrollTop = chatMessages.scrollHeight;
        } else if (!show && typingIndicator) {
            typingIndicator.remove();
        }
    }

    quickPrompt(prompt) {
        document.getElementById('chatInput').value = prompt;
        this.sendMessage();
    }

    clearChat() {
        document.getElementById('chatMessages').innerHTML = `
            <div class="message ai">
                <strong>🤖 ChatGPT:</strong> Hello! I'm your real AI assistant powered by ChatGPT. I can help you with studying, productivity, coding, writing, and much more. What would you like to know?
            </div>
        `;
        this.chatHistory = [];
    }
}

// ============ Voice Recognition & Speech Manager ============
class VoiceManager {
    constructor() {
        this.recognition = null;
        this.isListening = false;
        this.voices = [];
        this.selectedVoice = null;
        this.initializeVoiceRecognition();
        this.initializeTextToSpeech();
        this.setupEventListeners();
    }

    initializeVoiceRecognition() {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            this.recognition = new SpeechRecognition();
            
            this.recognition.continuous = false;
            this.recognition.interimResults = false;
            this.recognition.lang = 'en-US';
            
            this.recognition.onstart = () => {
                this.isListening = true;
                document.getElementById('voiceBtn').classList.add('listening');
                document.getElementById('voiceStatus').textContent = 'Listening... Speak now';
            };
            
            this.recognition.onend = () => {
                this.isListening = false;
                document.getElementById('voiceBtn').classList.remove('listening');
                document.getElementById('voiceStatus').textContent = 'Voice AI ready - Click microphone to start';
            };
            
            this.recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                this.processVoiceCommand(transcript);
            };
            
            this.recognition.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
                showNotification('Voice recognition error. Please try again.', 'error');
                this.isListening = false;
                document.getElementById('voiceBtn').classList.remove('listening');
            };
        } else {
            console.warn('Speech recognition not supported');
        }
    }

    initializeTextToSpeech() {
        if ('speechSynthesis' in window) {
            const loadVoices = () => {
                this.voices = speechSynthesis.getVoices();
                this.updateVoiceOptions();
                this.selectDefaultVoice();
            };

            loadVoices();
            speechSynthesis.onvoiceschanged = loadVoices;
        }
    }

    updateVoiceOptions() {
        const voiceSelect = document.getElementById('voiceGender');
        if (!voiceSelect) return;

        // Filter voices based on gender preference
        const genderPreference = AppState.voiceSettings.gender;
        const filteredVoices = this.voices.filter(voice => {
            const voiceName = voice.name.toLowerCase();
            if (genderPreference === 'female') {
                return voiceName.includes('female') || voiceName.includes('woman') || 
                       voiceName.includes('samantha') || voiceName.includes('susan') ||
                       voiceName.includes('karen') || voiceName.includes('victoria');
            } else if (genderPreference === 'male') {
                return voiceName.includes('male') || voiceName.includes('man') ||
                       voiceName.includes('daniel') || voiceName.includes('alex') ||
                       voiceName.includes('tom') || voiceName.includes('david');
            }
            return true;
        });

        this.selectedVoice = filteredVoices[0] || this.voices[0];
    }

    selectDefaultVoice() {
        const genderPreference = AppState.voiceSettings.gender;
        
        // Try to find appropriate voice based on gender preference
        this.selectedVoice = this.voices.find(voice => {
            const voiceName = voice.name.toLowerCase();
            if (genderPreference === 'female') {
                return voiceName.includes('female') || voiceName.includes('samantha') || voiceName.includes('karen');
            } else {
                return voiceName.includes('male') || voiceName.includes('daniel') || voiceName.includes('alex');
            }
        }) || this.voices[0];
    }

    setupEventListeners() {
        document.getElementById('voiceBtn').addEventListener('click', () => {
            this.toggleVoiceRecognition();
        });

        document.getElementById('voiceGender').addEventListener('change', (e) => {
            AppState.voiceSettings.gender = e.target.value;
            this.updateVoiceOptions();
            this.saveSettings();
        });

        document.getElementById('voiceSpeed').addEventListener('change', (e) => {
            AppState.voiceSettings.speed = parseFloat(e.target.value);
            this.saveSettings();
        });
    }

    toggleVoiceRecognition() {
        if (!this.recognition) {
            showNotification('Voice recognition not supported in this browser', 'error');
            return;
        }

        if (this.isListening) {
            this.recognition.stop();
        } else {
            this.recognition.start();
        }
    }

    processVoiceCommand(transcript) {
        console.log('Voice command received:', transcript);
        document.getElementById('voiceStatus').textContent = `Heard: "${transcript}"`;
        
        const lowerTranscript = transcript.toLowerCase();
        
        // Task creation commands
        if (lowerTranscript.includes('create task') || lowerTranscript.includes('add task') || lowerTranscript.includes('new task')) {
            const taskText = transcript.replace(/(create|add|new)\s*task\s*/i, '').trim();
            if (taskText) {
                document.getElementById('taskInput').value = taskText;
                createTaskWithAI();
            }
            return;
        }
        
        // ChatGPT commands
        if (lowerTranscript.includes('ask chatgpt') || lowerTranscript.includes('chat gpt')) {
            const question = transcript.replace(/ask\s*(chat\s*gpt|chatgpt)\s*/i, '').trim();
            if (question) {
                document.getElementById('chatInput').value = question;
                chatGPTManager.sendMessage();
            }
            return;
        }
        
        // Timer commands
        if (lowerTranscript.includes('start timer') || lowerTranscript.includes('begin study')) {
            startStudyTimer();
            return;
        }
        
        if (lowerTranscript.includes('stop timer') || lowerTranscript.includes('pause timer')) {
            pauseStudyTimer();
            return;
        }
        
        // Theme commands
        if (lowerTranscript.includes('dark theme') || lowerTranscript.includes('dark mode')) {
            setTheme('dark');
            return;
        }
        
        if (lowerTranscript.includes('light theme') || lowerTranscript.includes('light mode')) {
            setTheme('light');
            return;
        }
        
        // Default: send to ChatGPT
        document.getElementById('chatInput').value = transcript;
        chatGPTManager.sendMessage();
    }

    speak(text) {
        if ('speechSynthesis' in window && this.selectedVoice) {
            // Cancel any ongoing speech
            speechSynthesis.cancel();
            
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.voice = this.selectedVoice;
            utterance.rate = AppState.voiceSettings.speed;
            utterance.pitch = 1.0;
            utterance.volume = 1.0;
            
            speechSynthesis.speak(utterance);
        }
    }

    saveSettings() {
        if (AppState.currentUser && db) {
            db.collection('users').doc(AppState.currentUser.uid).update({
                'settings.voiceGender': AppState.voiceSettings.gender,
                'settings.voiceSpeed': AppState.voiceSettings.speed
            }).catch(console.error);
        }
    }

    testVoice() {
        const userName = AppState.currentUser?.name || 'User';
        this.speak(`Hello ${userName}! This is your AI voice assistant. I'm ready to help you stay productive and focused on your goals.`);
    }
}

// ============ Task Management System ============
class TaskManager {
    constructor() {
        this.tasks = [];
        this.completedTasks = [];
        this.taskTimers = new Map();
        this.setupEventListeners();
    }

    setupEventListeners() {
        document.getElementById('taskInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                createTaskWithAI();
            }
        });
    }

    async createTask(taskData) {
        const task = {
            id: Date.now().toString(),
            title: taskData.title || 'Untitled Task',
            description: taskData.description || '',
            priority: taskData.priority || 'medium',
            dueDate: taskData.dueDate || null,
            duration: taskData.duration || 25,
            completed: false,
            createdAt: new Date(),
            userId: AppState.currentUser?.uid,
            tags: taskData.tags || [],
            subtasks: taskData.subtasks || []
        };

        // Add to local state
        AppState.tasks.push(task);

        // Save to Firestore
        if (AppState.currentUser && db) {
            try {
                await db.collection('tasks').doc(task.id).set(task);
            } catch (error) {
                console.error('Error saving task to Firestore:', error);
            }
        }

        this.renderTasks();
        this.updateStats();
        showNotification(`Task "${task.title}" created successfully!`, 'success');

        return task;
    }

    async toggleTaskCompletion(taskId) {
        const task = AppState.tasks.find(t => t.id === taskId);
        if (!task) return;

        task.completed = !task.completed;
        task.completedAt = task.completed ? new Date() : null;

        // Update in Firestore
        if (AppState.currentUser && db) {
            try {
                await db.collection('tasks').doc(taskId).update({
                    completed: task.completed,
                    completedAt: task.completedAt
                });
            } catch (error) {
                console.error('Error updating task in Firestore:', error);
            }
        }

        if (task.completed) {
            AppState.completedTasks.push({ ...task });
            showNotification('🎉 Task completed!
