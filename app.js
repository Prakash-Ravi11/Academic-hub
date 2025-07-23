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
        // ============ Continue from previous app.js ============

        if (task.completed) {
            AppState.completedTasks.push({ ...task });
            showNotification('🎉 Task completed! Great job!', 'success');
            
            // Update study stats
            AppState.studyStats.totalStudyTime += task.duration || 25;
            this.updateStats();
            
            // Play completion sound
            if (AppState.voiceSettings.enabled) {
                voiceManager.speak(`Excellent work! You completed ${task.title}. Keep up the great momentum!`);
            }
            
            // Generate motivational quote
            quoteManager.loadNewQuote('achievement');
        }

        this.renderTasks();
        this.updateStats();
    }

    async deleteTask(taskId) {
        if (!confirm('Are you sure you want to delete this task?')) return;

        // Remove from local state
        AppState.tasks = AppState.tasks.filter(t => t.id !== taskId);
        AppState.completedTasks = AppState.completedTasks.filter(t => t.id !== taskId);

        // Remove from Firestore
        if (AppState.currentUser && db) {
            try {
                await db.collection('tasks').doc(taskId).delete();
            } catch (error) {
                console.error('Error deleting task from Firestore:', error);
            }
        }

        this.renderTasks();
        this.updateStats();
        showNotification('Task deleted', 'info');
    }

    renderTasks() {
        const tasksList = document.getElementById('tasksList');
        const tasksSummary = document.getElementById('tasksSummary');

        if (AppState.tasks.length === 0) {
            tasksList.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">🎯</div>
                    <div class="empty-title">Your productivity journey starts here!</div>
                    <div class="empty-subtitle">Create your first task above</div>
                </div>
            `;
            tasksSummary.textContent = 'Ready to conquer your goals';
            return;
        }

        const today = new Date().toDateString();
        const todayTasks = AppState.tasks.filter(task => 
            new Date(task.createdAt).toDateString() === today
        );
        const completedToday = todayTasks.filter(task => task.completed).length;

        tasksSummary.textContent = `${completedToday}/${todayTasks.length} completed today`;

        // Sort tasks by priority and due date
        const sortedTasks = [...AppState.tasks].sort((a, b) => {
            const priorityOrder = { high: 3, medium: 2, low: 1 };
            if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
                return priorityOrder[b.priority] - priorityOrder[a.priority];
            }
            return new Date(a.dueDate || a.createdAt) - new Date(b.dueDate || b.createdAt);
        });

        tasksList.innerHTML = sortedTasks.map(task => `
            <div class="task-item ${task.completed ? 'completed' : ''}">
                <div class="task-checkbox ${task.completed ? 'checked' : ''}" onclick="taskManager.toggleTaskCompletion('${task.id}')">
                    ${task.completed ? '✓' : ''}
                </div>
                <div class="task-content">
                    <div class="task-title">${task.title}</div>
                    <div class="task-meta">
                        <span class="task-priority ${task.priority}">${task.priority}</span>
                        ${task.dueDate ? `<span>Due: ${new Date(task.dueDate).toLocaleDateString()}</span>` : ''}
                        <span>${task.duration}min</span>
                    </div>
                    ${task.subtasks && task.subtasks.length > 0 ? `
                        <div class="task-subtasks">
                            ${task.subtasks.map(subtask => `<div class="subtask">• ${subtask}</div>`).join('')}
                        </div>
                    ` : ''}
                </div>
                <div class="task-actions">
                    <button class="btn btn-secondary btn-small" onclick="taskManager.startTaskTimer('${task.id}')" title="Start Timer">
                        ⏱️
                    </button>
                    <button class="btn btn-secondary btn-small" onclick="taskManager.deleteTask('${task.id}')" title="Delete">
                        🗑️
                    </button>
                </div>
            </div>
        `).join('');

        this.updateProgress();
    }

    updateProgress() {
        const total = AppState.tasks.length;
        const completed = AppState.tasks.filter(t => t.completed).length;
        const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

        // Update progress ring
        const progressCircle = document.getElementById('progressCircle');
        const circumference = 2 * Math.PI * 60;
        const offset = circumference - (percentage / 100) * circumference;
        progressCircle.style.strokeDashoffset = offset;

        document.getElementById('progressPercent').textContent = `${percentage}%`;

        // Update daily message
        const messages = {
            100: "Perfect day! 🎉 You're unstoppable!",
            80: "Almost there! 🌟 Just a few more tasks!",
            60: "Great progress! 💪 Keep the momentum going!",
            40: "Good start! 🚀 You're building something amazing!",
            20: "Every journey begins with a single step! ✨",
            0: "Ready to achieve greatness! 🎯"
        };

        const messageKey = Object.keys(messages).reverse().find(key => percentage >= key);
        document.getElementById('dailyMessage').textContent = messages[messageKey];
    }

    updateStats() {
        const stats = {
            totalTasks: AppState.tasks.length,
            completedTasks: AppState.tasks.filter(t => t.completed).length,
            completionRate: AppState.tasks.length > 0 ? Math.round((AppState.tasks.filter(t => t.completed).length / AppState.tasks.length) * 100) : 0,
            totalTime: Math.round(AppState.studyStats.totalStudyTime / 60 * 10) / 10,
            streakCount: this.calculateStreak()
        };

        document.getElementById('totalTasks').textContent = stats.totalTasks;
        document.getElementById('completionRate').textContent = `${stats.completionRate}%`;
        document.getElementById('totalTime').textContent = `${stats.totalTime}h`;
        document.getElementById('streakCount').textContent = stats.streakCount;
    }

    calculateStreak() {
        const today = new Date();
        let streak = 0;
        
        for (let i = 0; i < 30; i++) {
            const checkDate = new Date(today);
            checkDate.setDate(today.getDate() - i);
            
            const dayTasks = AppState.tasks.filter(task => {
                const taskDate = new Date(task.createdAt);
                return taskDate.toDateString() === checkDate.toDateString() && task.completed;
            });
            
            if (dayTasks.length > 0) {
                streak++;
            } else if (i > 0) {
                break;
            }
        }
        
        return streak;
    }

    startTaskTimer(taskId) {
        const task = AppState.tasks.find(t => t.id === taskId);
        if (!task) return;

        const timer = {
            taskId: taskId,
            taskTitle: task.title,
            duration: (task.duration || 25) * 60,
            timeLeft: (task.duration || 25) * 60,
            isRunning: true,
            startTime: Date.now()
        };

        AppState.timers.tasks.set(taskId, timer);
        this.renderTaskTimers();
        
        showNotification(`Timer started for "${task.title}"`, 'success');
        voiceManager.speak(`Timer started for ${task.title}. Focus time!`);
    }

    renderTaskTimers() {
        const container = document.getElementById('taskTimers');
        const activeTimers = Array.from(AppState.timers.tasks.values()).filter(t => t.isRunning);

        if (activeTimers.length === 0) {
            container.innerHTML = `
                <div class="no-timers">
                    <div class="empty-icon">⏰</div>
                    <div>No active timers</div>
                </div>
            `;
            return;
        }

        container.innerHTML = activeTimers.map(timer => `
            <div class="task-timer-item">
                <div class="timer-info">
                    <div class="timer-name">${timer.taskTitle}</div>
                    <div class="timer-time">${this.formatTime(timer.timeLeft)}</div>
                </div>
                <div class="timer-controls-small">
                    <button class="timer-btn pause" onclick="taskManager.pauseTaskTimer('${timer.taskId}')">⏸️</button>
                    <button class="timer-btn stop" onclick="taskManager.stopTaskTimer('${timer.taskId}')">⏹️</button>
                </div>
            </div>
        `).join('');
    }

    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
}

// ============ Study Timer & Break System ============
class StudyTimerManager {
    constructor() {
        this.studyTimer = null;
        this.breakTimer = null;
        this.isStudying = false;
        this.isOnBreak = false;
        this.setupEventListeners();
    }

    setupEventListeners() {
        document.getElementById('startStudyBtn').addEventListener('click', () => this.startStudySession());
        document.getElementById('pauseStudyBtn').addEventListener('click', () => this.pauseStudySession());
        document.getElementById('resetStudyBtn').addEventListener('click', () => this.resetStudySession());
        
        document.getElementById('autoBreakToggle').addEventListener('change', (e) => {
            AppState.studyStats.autoBreak = e.target.checked;
            this.saveSettings();
        });
        
        document.getElementById('breakInterval').addEventListener('change', (e) => {
            AppState.studyStats.breakInterval = parseInt(e.target.value);
            this.saveSettings();
        });
    }

    startStudySession() {
        if (this.isStudying) return;

        this.isStudying = true;
        AppState.timers.study.isRunning = true;
        
        document.getElementById('startStudyBtn').disabled = true;
        document.getElementById('pauseStudyBtn').disabled = false;
        document.getElementById('studyTimerDisplay').classList.add('timer-active');

        this.studyTimer = setInterval(() => {
            AppState.timers.study.timeLeft--;
            this.updateStudyDisplay();
            
            if (AppState.timers.study.timeLeft <= 0) {
                this.completeStudySession();
            }
        }, 1000);

        showNotification('📚 Study session started! Focus time!', 'success');
        voiceManager.speak('Study session started! Time to focus and learn something amazing!');
        
        // Update study stats
        AppState.studyStats.currentSessionTime = AppState.timers.study.duration;
    }

    pauseStudySession() {
        if (!this.isStudying) return;

        this.isStudying = false;
        AppState.timers.study.isRunning = false;
        
        clearInterval(this.studyTimer);
        
        document.getElementById('startStudyBtn').disabled = false;
        document.getElementById('pauseStudyBtn').disabled = true;
        document.getElementById('studyTimerDisplay').classList.remove('timer-active');

        showNotification('Study session paused', 'info');
    }

    resetStudySession() {
        this.pauseStudySession();
        
        AppState.timers.study.timeLeft = AppState.timers.study.duration;
        this.updateStudyDisplay();
        
        document.getElementById('studyTimerDisplay').classList.remove('timer-active');
        showNotification('Study timer reset', 'info');
    }

    completeStudySession() {
        this.pauseStudySession();
        
        // Update stats
        AppState.studyStats.totalStudyTime += Math.round(AppState.timers.study.duration / 60);
        AppState.studyStats.currentSessionTime = 0;
        
        // Check for streak
        const today = new Date().toDateString();
        const lastStudyDate = localStorage.getItem('lastStudyDate');
        if (lastStudyDate !== today) {
            AppState.studyStats.studyStreak++;
            localStorage.setItem('lastStudyDate', today);
        }

        this.updateStudyStats();
        
        showNotification('🎉 Study session complete! Great job!', 'success');
        voiceManager.speak('Excellent work! Your study session is complete. You\'re building great learning habits!');

        // Auto-start break if enabled
        if (document.getElementById('autoBreakToggle').checked) {
            setTimeout(() => this.startBreakSession(), 2000);
        }
        
        // Reset timer
        AppState.timers.study.timeLeft = AppState.timers.study.duration;
        this.updateStudyDisplay();
        
        // Load achievement quote
        quoteManager.loadNewQuote('achievement');
    }

    startBreakSession() {
        this.isOnBreak = true;
        AppState.timers.break.timeLeft = AppState.timers.break.duration;
        AppState.timers.break.isRunning = true;

        this.breakTimer = setInterval(() => {
            AppState.timers.break.timeLeft--;
            
            if (AppState.timers.break.timeLeft <= 0) {
                this.completeBreakSession();
            }
        }, 1000);

        showNotification('☕ Break time! Relax and recharge.', 'info');
        voiceManager.speak('Break time! Take a moment to relax and recharge. You\'ve earned it!');
        
        AppState.studyStats.breaksTaken++;
        this.updateStudyStats();
    }

    completeBreakSession() {
        this.isOnBreak = false;
        AppState.timers.break.isRunning = false;
        
        clearInterval(this.breakTimer);
        
        showNotification('Break complete! Ready for another study session?', 'success');
        voiceManager.speak('Break time is over! Ready to continue your learning journey?');
    }

    updateStudyDisplay() {
        const timeLeft = AppState.timers.study.timeLeft;
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        
        document.getElementById('studyTimerDisplay').textContent = 
            `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    updateStudyStats() {
        document.getElementById('totalStudyTime').textContent = 
            `${Math.floor(AppState.studyStats.totalStudyTime / 60)}h ${AppState.studyStats.totalStudyTime % 60}m`;
        document.getElementById('studyStreak').textContent = AppState.studyStats.studyStreak;
        document.getElementById('breaksTaken').textContent = AppState.studyStats.breaksTaken;
    }

    saveSettings() {
        if (AppState.currentUser && db) {
            db.collection('users').doc(AppState.currentUser.uid).update({
                'settings.autoBreak': AppState.studyStats.autoBreak,
                'settings.breakInterval': AppState.studyStats.breakInterval
            }).catch(console.error);
        }
    }
}

// ============ Alarm System ============
class AlarmManager {
    constructor() {
        this.alarms = [];
        this.activeAlarms = [];
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Add event listeners for alarm creation
        const createAlarmBtn = document.querySelector('button[onclick="createStudyAlarm()"]');
        if (createAlarmBtn) {
            createAlarmBtn.addEventListener('click', () => this.createStudyAlarm());
        }
    }

    createStudyAlarm() {
        const subject = document.getElementById('alarmSubject').value.trim();
        const time = document.getElementById('alarmTime').value;
        const duration = parseInt(document.getElementById('alarmDuration').value);

        if (!subject || !time) {
            showNotification('Please fill in all alarm details', 'error');
            return;
        }

        const alarm = {
            id: Date.now().toString(),
            subject: subject,
            time: time,
            duration: duration,
            createdAt: new Date(),
            isActive: true,
            userId: AppState.currentUser?.uid
        };

        this.alarms.push(alarm);
        this.scheduleAlarm(alarm);
        this.renderActiveAlarms();
        
        // Clear form
        document.getElementById('alarmSubject').value = '';
        document.getElementById('alarmTime').value = '';
        
        showNotification(`⏰ Study alarm set for ${subject} at ${time}`, 'success');
        voiceManager.speak(`Study alarm set for ${subject} at ${time}. I'll remind you when it's time to study!`);
    }

    scheduleAlarm(alarm) {
        const now = new Date();
        const alarmTime = new Date();
        const [hours, minutes] = alarm.time.split(':');
        alarmTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

        // If alarm time is in the past, set it for tomorrow
        if (alarmTime <= now) {
            alarmTime.setDate(alarmTime.getDate() + 1);
        }

        const timeUntilAlarm = alarmTime.getTime() - now.getTime();

        setTimeout(() => {
            this.triggerAlarm(alarm);
        }, timeUntilAlarm);

        console.log(`⏰ Alarm scheduled for ${alarmTime.toLocaleString()}`);
    }

    triggerAlarm(alarm) {
        // Show alarm notification
        this.showAlarmNotification(alarm);
        
        // Browser notification
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(`📚 Study Time: ${alarm.subject}`, {
                body: `Time to study ${alarm.subject} for ${alarm.duration} minutes`,
                icon: 'icon-192.png',
                tag: alarm.id
            });
        }

        // Voice announcement
        voiceManager.speak(`Attention! It's time to study ${alarm.subject}. Your ${alarm.duration} minute session is ready to begin!`);
        
        // Play notification sound
        this.playAlarmSound();
    }

    showAlarmNotification(alarm) {
        const notification = document.getElementById('alarmNotification');
        document.getElementById('alarmTitle').textContent = `📚 Study Time: ${alarm.subject}`;
        document.getElementById('alarmMessage').textContent = `Time to study ${alarm.subject} for ${alarm.duration} minutes`;
        
        notification.classList.remove('hidden');
        
        // Store current alarm for actions
        this.currentAlarm = alarm;
        
        // Auto-dismiss after 60 seconds
        setTimeout(() => {
            this.dismissAlarm();
        }, 60000);
    }

    startStudySession() {
        if (this.currentAlarm) {
            // Set study timer to alarm duration
            AppState.timers.study.duration = this.currentAlarm.duration * 60;
            AppState.timers.study.timeLeft = this.currentAlarm.duration * 60;
            
            // Start study session
            studyTimerManager.startStudySession();
            
            this.dismissAlarm();
            showNotification(`Started ${this.currentAlarm.duration}-minute study session for ${this.currentAlarm.subject}`, 'success');
        }
    }

    snoozeAlarm() {
        if (this.currentAlarm) {
            // Snooze for 10 minutes
            setTimeout(() => {
                this.triggerAlarm(this.currentAlarm);
            }, 10 * 60 * 1000);
            
            this.dismissAlarm();
            showNotification('Alarm snoozed for 10 minutes', 'info');
        }
    }

    dismissAlarm() {
        document.getElementById('alarmNotification').classList.add('hidden');
        this.currentAlarm = null;
    }

    renderActiveAlarms() {
        const container = document.getElementById('activeAlarms');
        
        if (this.alarms.length === 0) {
            container.innerHTML = '<div class="text-center p-4" style="color: var(--text-secondary);">No active alarms</div>';
            return;
        }

        container.innerHTML = this.alarms.map(alarm => `
            <div class="alarm-item">
                <div>
                    <div style="font-weight: 600;">${alarm.subject}</div>
                    <div style="font-size: 14px; color: var(--text-secondary);">${alarm.time} • ${alarm.duration} min</div>
                </div>
                <button class="btn btn-secondary btn-small" onclick="alarmManager.deleteAlarm('${alarm.id}')">
                    🗑️ Delete
                </button>
            </div>
        `).join('');
    }

    deleteAlarm(alarmId) {
        this.alarms = this.alarms.filter(a => a.id !== alarmId);
        this.renderActiveAlarms();
        showNotification('Alarm deleted', 'info');
    }

    playAlarmSound() {
        // Create a simple alarm sound using Web Audio API
        if ('AudioContext' in window || 'webkitAudioContext' in window) {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            for (let i = 0; i < 3; i++) {
                setTimeout(() => {
                    const oscillator = audioContext.createOscillator();
                    const gainNode = audioContext.createGain();
                    
                    oscillator.connect(gainNode);
                    gainNode.connect(audioContext.destination);
                    
                    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
                    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
                    
                    oscillator.start(audioContext.currentTime);
                    oscillator.stop(audioContext.currentTime + 0.5);
                }, i * 600);
            }
        }
    }
}

// ============ Quote Management System ============
class QuoteManager {
    constructor() {
        this.quotes = {
            motivation: [
                { text: "The way to get started is to quit talking and begin doing.", author: "Walt Disney", category: "Action" },
                { text: "Innovation distinguishes between a leader and a follower.", author: "Steve Jobs", category: "Innovation" },
                { text: "Your limitation—it's only your imagination.", author: "Unknown", category: "Mindset" },
                { text: "Push yourself, because no one else is going to do it for you.", author: "Unknown", category: "Self-Motivation" },
                { text: "Great things never come from comfort zones.", author: "Unknown", category: "Growth" },
                { text: "Dream it. Wish it. Do it.", author: "Unknown", category: "Action" },
                { text: "Success doesn't just find you. You have to go out and get it.", author: "Unknown", category: "Success" },
                { text: "The harder you work for something, the greater you'll feel when you achieve it.", author: "Unknown", category: "Achievement" },
                { text: "Dream bigger. Do bigger.", author: "Unknown", category: "Dreams" },
                { text: "Don't stop when you're tired. Stop when you're done.", author: "Unknown", category: "Persistence" }
            ],
            study: [
                { text: "Education is the most powerful weapon which you can use to change the world.", author: "Nelson Mandela", category: "Education" },
                { text: "The beautiful thing about learning is that nobody can take it away from you.", author: "B.B. King", category: "Learning" },
                { text: "Learning never exhausts the mind.", author: "Leonardo da Vinci", category: "Learning" },
                { text: "The expert in anything was once a beginner.", author: "Helen Hayes", category: "Growth" },
                { text: "Education is not preparation for life; education is life itself.", author: "John Dewey", category: "Education" },
                { text: "The more that you read, the more things you will know. The more that you learn, the more places you'll go.", author: "Dr. Seuss", category: "Reading" },
                { text: "Study hard what interests you the most in the most undisciplined, irreverent and original manner possible.", author: "Richard Feynman", category: "Study" },
                { text: "Intelligence plus character—that is the goal of true education.", author: "Martin Luther King Jr.", category: "Character" },
                { text: "The capacity to learn is a gift; the ability to learn is a skill; the willingness to learn is a choice.", author: "Brian Herbert", category: "Learning" },
                { text: "Live as if you were to die tomorrow. Learn as if you were to live forever.", author: "Mahatma Gandhi", category: "Learning" }
            ],
            achievement: [
                { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill", category: "Success" },
                { text: "The only impossible journey is the one you never begin.", author: "Tony Robbins", category: "Beginning" },
                { text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson", category: "Persistence" },
                { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt", category: "Belief" },
                { text: "The only way to do great work is to love what you do.", author: "Steve Jobs", category: "Passion" },
                { text: "You are never too old to set another goal or to dream a new dream.", author: "C.S. Lewis", category: "Goals" },
                { text: "What lies behind us and what lies before us are tiny matters compared to what lies within us.", author: "Ralph Waldo Emerson", category: "Inner Strength" },
                { text: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt", category: "Dreams" },
                { text: "It is during our darkest moments that we must focus to see the light.", author: "Aristotle", category: "Hope" },
                { text: "Optimism is the faith that leads to achievement.", author: "Helen Keller", category: "Optimism" }
            ],
            focus: [
                { text: "Concentrate all your thoughts upon the work at hand. The sun's rays do not burn until brought to a focus.", author: "Alexander Graham Bell", category: "Focus" },
                { text: "The successful warrior is the average man with laser-like focus.", author: "Bruce Lee", category: "Focus" },
                { text: "Where focus goes, energy flows and results show.", author: "Tony Robbins", category: "Energy" },
                { text: "Lack of direction, not lack of time, is the problem. We all have twenty-four hour days.", author: "Zig Ziglar", category: "Direction" },
                { text: "The art of being wise is knowing what to overlook.", author: "William James", category: "Wisdom" },
                { text: "Focus on being productive instead of busy.", author: "Tim Ferriss", category: "Productivity" },
                { text: "You can do two things at once, but you can't focus effectively on two things at once.", author: "Gary Keller", category: "Focus" },
                { text: "Starve your distractions, feed your focus.", author: "Unknown", category: "Distraction" },
                { text: "Focus is about saying no to the hundred other good ideas.", author: "Steve Jobs", category: "Priority" },
                { text: "The key to success is to focus our conscious mind on things we desire not things we fear.", author: "Brian Tracy", category: "Success" }
            ]
        };
        
        this.currentCategory = 'motivation';
        this.loadNewQuote();
    }

    loadNewQuote(category = null) {
        const selectedCategory = category || this.currentCategory;
        const categoryQuotes = this.quotes[selectedCategory] || this.quotes.motivation;
        const randomQuote = categoryQuotes[Math.floor(Math.random() * categoryQuotes.length)];
        
        document.getElementById('quoteText').textContent = `"${randomQuote.text}"`;
        document.getElementById('quoteAuthor').textContent = `— ${randomQuote.author}`;
        document.getElementById('quoteCategory').textContent = randomQuote.category;
        
        this.currentCategory = selectedCategory;
    }

    getPersonalMotivation() {
        const userName = AppState.currentUser?.name || 'Champion';
        const completedToday = AppState.tasks.filter(t => t.completed && 
            new Date(t.completedAt).toDateString() === new Date().toDateString()).length;
        
        let personalMessage = '';
        
        if (completedToday === 0) {
            personalMessage = `${userName}, every great journey begins with a single step. You've got this!`;
        } else if (completedToday < 3) {
            personalMessage = `${userName}, you're building momentum! ${completedToday} tasks completed. Keep going!`;
        } else if (completedToday < 5) {
            personalMessage = `${userName}, you're on fire! ${completedToday} tasks done. You're unstoppable!`;
        } else {
            personalMessage = `${userName}, absolutely incredible! ${completedToday} tasks completed. You're a productivity superstar!`;
        }
        
        // Add to chat
        chatGPTManager.addMessageToChat(personalMessage, 'ai');
        voiceManager.speak(personalMessage);
        
        // Load achievement quote
        this.loadNewQuote('achievement');
    }
}

// ============ File Upload & Processing Manager ============
class FileUploadManager {
    constructor() {
        this.setupEventListeners();
        this.setupDragAndDrop();
    }

    setupEventListeners() {
        document.getElementById('fileInput').addEventListener('change', (e) => {
            this.handleFileUpload(Array.from(e.target.files));
        });
    }

    setupDragAndDrop() {
        const uploadZone = document.getElementById('uploadZone');
        
        uploadZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadZone.classList.add('dragover');
        });
        
        uploadZone.addEventListener('dragleave', () => {
            uploadZone.classList.remove('dragover');
        });
        
        uploadZone.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadZone.classList.remove('dragover');
            this.handleFileUpload(Array.from(e.dataTransfer.files));
        });
    }

    async handleFileUpload(files) {
        if (files.length === 0) return;

        this.showUploadProgress(true);
        const extractedTasks = [];

        try {
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                this.updateProgress((i / files.length) * 100, `Processing ${file.name}...`);
                
                const tasks = await this.processFile(file);
                extractedTasks.push(...tasks);
                
                // Store file info
                AppState.uploadedFiles.push({
                    id: Date.now() + i,
                    name: file.name,
                    size: file.size,
                    type: file.type,
                    uploadedAt: new Date(),
                    tasksExtracted: tasks.length
                });
            }

            this.showExtractedTasks(extractedTasks);
            showNotification(`Successfully processed ${files.length} files and extracted ${extractedTasks.length} tasks!`, 'success');

        } catch (error) {
            console.error('File processing error:', error);
            showNotification(`Error processing files: ${error.message}`, 'error');
        } finally {
            this.showUploadProgress(false);
            document.getElementById('fileInput').value = '';
        }
    }

    async processFile(file) {
        const extension = file.name.toLowerCase().split('.').pop();
        
        switch (extension) {
            case 'txt':
                return await this.processTextFile(file);
            case 'csv':
                return await this.processCSVFile(file);
            case 'json':
                return await this.processJSONFile(file);
            case 'pdf':
                return await this.processPDFFile(file);
            case 'jpg':
            case 'jpeg':
            case 'png':
                return await this.processImageFile(file);
            default:
                throw new Error(`Unsupported file type: ${extension}`);
        }
    }

    async processTextFile(file) {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const content = e.target.result;
                const lines = content.split('\n').filter(line => line.trim());
                const tasks = [];

                lines.forEach((line, index) => {
                    const trimmedLine = line.trim();
                    if (trimmedLine.length > 3 && !trimmedLine.startsWith('#')) {
                        tasks.push({
                            title: trimmedLine,
                            priority: 'medium',
                            duration: 30,
                            source: 'text_file'
                        });
                    }
                });

                resolve(tasks);
            };
            reader.readAsText(file);
        });
    }

    async processCSVFile(file) {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const content = e.target.result;
                const lines = content.split('\n').filter(line => line.trim());
                const tasks = [];

                if (lines.length > 1) {
                    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
                    
                    for (let i = 1; i < lines.length; i++) {
                        const values = lines[i].split(',').map(v => v.trim());
                        if (values.length >= headers.length) {
                            const task = {
                                title: values[0] || `Task ${i}`,
                                priority: 'medium',
                                duration: 30,
                                source: 'csv_file'
                            };
                            
                            // Try to find due date column
                            const dateIndex = headers.findIndex(h => h.includes('date') || h.includes('due'));
                            if (dateIndex >= 0 && values[dateIndex]) {
                                task.dueDate = values[dateIndex];
                            }
                            
                            tasks.push(task);
                        }
                    }
                }

                resolve(tasks);
            };
            reader.readAsText(file);
        });
    }

    async processJSONFile(file) {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const content = JSON.parse(e.target.result);
                    const tasks = [];

                    if (Array.isArray(content)) {
                        content.forEach(item => {
                            if (typeof item === 'object' && item.title) {
                                tasks.push({
                                    title: item.title,
                                    priority: item.priority || 'medium',
                                    duration: item.duration || 30,
                                    dueDate: item.dueDate || null,
                                    source: 'json_file'
                                });
                            }
                        });
                    }

                    resolve(tasks);
                } catch (error) {
                    resolve([]);
                }
            };
            reader.readAsText(file);
        });
    }

    async processPDFFile(file) {
        // Simulated PDF processing (would use PDF.js in production)
        return new Promise((resolve) => {
            setTimeout(() => {
                const simulatedTasks = [
                    { title: 'Review PDF document content', priority: 'medium', duration: 45, source: 'pdf_file' },
                    { title: 'Complete assignments mentioned in PDF', priority: 'high', duration: 90, source: 'pdf_file' },
                    { title: 'Study key concepts from PDF', priority: 'medium', duration: 60, source: 'pdf_file' }
                ];
                resolve(simulatedTasks);
            }, 2000);
        });
    }

    async processImageFile(file) {
        // Simulated OCR processing (would use Tesseract.js in production)
        return new Promise((resolve) => {
            setTimeout(() => {
                const simulatedTasks = [
                    { title: 'Review handwritten notes from image', priority: 'medium', duration: 30, source: 'image_ocr' },
                    { title: 'Follow up on tasks in photo', priority: 'low', duration: 15, source: 'image_ocr' }
                ];
                resolve(simulatedTasks);
            }, 3000);
        });
    }

    showUploadProgress(show) {
        const progressContainer = document.getElementById('uploadProgress');
        
        if (show) {
            progressContainer.classList.remove('hidden');
        } else {
            progressContainer.classList.add('hidden');
        }
    }

    updateProgress(percentage, text) {
        document.getElementById('uploadProgressBar').style.width = `${percentage}%`;
        document.getElementById('uploadProgressText').textContent = text;
    }

    showExtractedTasks(tasks) {
        const container = document.getElementById('extractedTasksPreview');
        const tasksList = document.getElementById('extractedTasksList');
        
        if (tasks.length === 0) {
            container.classList.add('hidden');
            return;
        }

        tasksList.innerHTML = tasks.map(task => `
            <div class="task-preview" style="padding: 12px; background: var(--bg-tertiary); border-radius: 8px; margin-bottom: 8px; border: 1px solid var(--border-color);">
                <div style="font-weight: 600;">${task.title}</div>
                <div style="font-size: 14px; color: var(--text-secondary);">
                    Priority: ${task.priority} • Duration: ${task.duration}min • Source: ${task.source}
                </div>
            </div>
        `).join('');

        container.classList.remove('hidden');
        window.extractedTasksToImport = tasks;
    }
}

// ============ Theme Management ============
function setTheme(themeName) {
    document.body.setAttribute('data-theme', themeName);
    AppState.theme = themeName;
    
    // Update theme buttons
    document.querySelectorAll('.theme-btn').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-theme') === themeName);
    });
    
    showNotification(`Theme changed to ${themeName}`, 'success');
    
    // Save to user preferences
    if (AppState.currentUser && db) {
        db.collection('users').doc(AppState.currentUser.uid).update({
            'settings.theme': themeName
        }).catch(console.error);
    }
}

// ============ Notification System ============
function showNotification(message, type = 'info') {
    const container = document.getElementById('notificationContainer');
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    const icon = {
        success: '✅',
        error: '❌',
        warning: '⚠️',
        info: 'ℹ️'
    }[type] || 'ℹ️';
    
    notification.innerHTML = `
        <div style="display: flex; align-items: center; gap: 12px;">
            <span style="font-size: 18px;">${icon}</span>
            <span style="flex: 1;">${message}</span>
            <button onclick="this.parentElement.parentElement.remove()" style="background: none; border: none; color: inherit; cursor: pointer; font-size: 16px; padding: 4px;">
                ×
            </button>
        </div>
    `;
    
    container.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);

    // Browser notification for important messages
    if (type === 'success' && 'Notification' in window && Notification.permission === 'granted') {
        new Notification('FlowState Pro', {
            body: message,
            icon: 'icon-192.png'
        });
    }
}

// ============ Utility Functions ============
function showMessage(message, type) {
    const messageDisplay = document.getElementById('messageDisplay');
    const messageText = document.getElementById('messageText');
    
    messageDisplay.className = `message-display ${type}`;
    messageText.textContent = message;
    messageDisplay.classList.remove('hidden');
}

function dismissMessage() {
    document.getElementById('messageDisplay').classList.add('hidden');
}

function showAuthModal() {
    document.getElementById('authModal').classList.remove('hidden');
    document.getElementById('mainApp').classList.add('hidden');
}

function showMainApp() {
    document.getElementById('authModal').classList.add('hidden');
    document.getElementById('mainApp').classList.remove('hidden');
    document.getElementById('loadingScreen').style.display = 'none';
}

function speakText(text) {
    if (voiceManager) {
        voiceManager.speak(text);
    }
}

// ============ Global Functions (called from HTML) ============
function sendChatGPTMessage() {
    chatGPTManager.sendMessage();
}

function quickChatGPT(prompt) {
    chatGPTManager.quickPrompt(prompt);
}

function startVoiceChatGPT() {
    if (voiceManager && voiceManager.recognition) {
        voiceManager.recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            document.getElementById('chatInput').value = transcript;
            chatGPTManager.sendMessage();
        };
        voiceManager.toggleVoiceRecognition();
    }
}

function clearChat() {
    chatGPTManager.clearChat();
}

function createTaskWithAI() {
    const input = document.getElementById('taskInput');
    const taskText = input.value.trim();
    
    if (!taskText) {
        showNotification('Please describe your task', 'error');
        return;
    }

    // Show AI processing
    document.getElementById('aiProcessing').classList.remove('hidden');
    
    // Simulate AI processing
    setTimeout(() => {
        const taskData = parseTaskFromText(taskText);
        taskManager.createTask(taskData);
        
        input.value = '';
        document.getElementById('aiProcessing').classList.add('hidden');
    }, 2000);
}

function parseTaskFromText(text) {
    // Simple AI-like parsing
    const timeMatch = text.match(/(\d{1,2}:\d{2}|\d{1,2}\s*(am|pm))/i);
    const durationMatch = text.match(/(\d+)\s*(min|hour|hours)/i);
    const priorityMatch = text.match(/(urgent|important|high|low)/i);
    
    return {
        title: text.replace(/(at\s*\d|for\s*\d|urgent|important|high|low)/gi, '').trim(),
        dueDate: timeMatch ? new Date() : null, // Simplified
        duration: durationMatch ? parseInt(durationMatch[1]) * (durationMatch[2].includes('hour') ? 60 : 1) : 30,
        priority: priorityMatch ? priorityMatch[1].toLowerCase() : 'medium'
    };
}

function startVoiceTaskCreation() {
    if (voiceManager && voiceManager.recognition) {
        voiceManager.recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            document.getElementById('taskInput').value = transcript;
            createTaskWithAI();
        };
        voiceManager.toggleVoiceRecognition();
    }
}

function quickTask(type) {
    const templates = {
        study: 'Study for 45 minutes',
        workout: 'Workout session for 30 minutes',
        break: 'Take a 15 minute break',
        meeting: 'Team meeting for 1 hour'
    };
    
    document.getElementById('taskInput').value = templates[type] || 'New task';
    createTaskWithAI();
}

function startStudyTimer() {
    studyTimerManager.startStudySession();
}

function pauseStudyTimer() {
    studyTimerManager.pauseStudySession();
}

function resetStudyTimer() {
    studyTimerManager.resetStudySession();
}

function testVoice() {
    voiceManager.testVoice();
}

function getPersonalMotivation() {
    quoteManager.getPersonalMotivation();
}

function createStudyAlarm() {
    alarmManager.createStudyAlarm();
}

function startStudySession() {
    alarmManager.startStudySession();
}

function snoozeAlarm() {
    alarmManager.snoozeAlarm();
}

function dismissAlarm() {
    alarmManager.dismissAlarm();
}

function importExtractedTasks() {
    if (window.extractedTasksToImport) {
        window.extractedTasksToImport.forEach(taskData => {
            taskManager.createTask(taskData);
        });
        
        document.getElementById('extractedTasksPreview').classList.add('hidden');
        window.extractedTasksToImport = null;
        
        showNotification('All extracted tasks imported successfully!', 'success');
    }
}

function reviewTasks() {
    // For now, just import all tasks
    importExtractedTasks();
}

// ============ User Management Functions ============
function showProfile() {
    const user = AppState.currentUser;
    const profile = `
        👤 **Profile Information**
        
        **Name:** ${user.displayName || user.name || 'Not set'}
        **Email:** ${user.email}
        **Member since:** ${new Date(user.metadata?.creationTime || Date.now()).toLocaleDateString()}
        
        📊 **Statistics:**
        • Total tasks: ${AppState.tasks.length}
        • Completed tasks: ${AppState.tasks.filter(t => t.completed).length}
        • Study time: ${Math.floor(AppState.studyStats.totalStudyTime / 60)}h ${AppState.studyStats.totalStudyTime % 60}m
        • Current streak: ${AppState.studyStats.studyStreak} days
    `;
    
    chatGPTManager.addMessageToChat(profile, 'ai');
}

function showStats() {
    const stats = `
        📈 **Detailed Statistics**
        
        📋 **Tasks:**
        • Total created: ${AppState.tasks.length}
        • Completed: ${AppState.tasks.filter(t => t.completed).length}
        • Completion rate: ${AppState.tasks.length > 0 ? Math.round((AppState.tasks.filter(t => t.completed).length / AppState.tasks.length) * 100) : 0}%
        
        📚 **Study:**
        • Total study time: ${Math.floor(AppState.studyStats.totalStudyTime / 60)}h ${AppState.studyStats.totalStudyTime % 60}m
        • Study streak: ${AppState.studyStats.studyStreak} days
        • Breaks taken: ${AppState.studyStats.breaksTaken}
        
        📁 **Files:**
        • Files uploaded: ${AppState.uploadedFiles.length}
        • Tasks from files: ${AppState.uploadedFiles.reduce((sum, file) => sum + file.tasksExtracted, 0)}
    `;
    
    chatGPTManager.addMessageToChat(stats, 'ai');
}

function exportData() {
    const data = {
        user: AppState.currentUser,
        tasks: AppState.tasks,
        completedTasks: AppState.completedTasks,
        studyStats: AppState.studyStats,
        uploadedFiles: AppState.uploadedFiles,
        exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `flowstate-pro-data-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    showNotification('📤 Data exported successfully!', 'success');
}

function importData() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                try {
                    const data = JSON.parse(e.target.result);
                    AppState.tasks = data.tasks || [];
                    AppState.completedTasks = data.completedTasks || [];
                    AppState.studyStats = { ...AppState.studyStats, ...data.studyStats };
                    AppState.uploadedFiles = data.uploadedFiles || [];
                    
                    taskManager.renderTasks();
                    taskManager.updateStats();
                    studyTimerManager.updateStudyStats();
                    
                    showNotification('📥 Data imported successfully!', 'success');
                } catch (error) {
                    showNotification('❌ Invalid file format', 'error');
                }
            };
            reader.readAsText(file);
        }
    };
    input.click();
}

function showSettings() {
    const settings = `
        ⚙️ **Settings**
        
        🎨 **Appearance:**
        • Current theme: ${AppState.theme}
        • Available themes: Light, Dark, Elegant
        
        🎤 **Voice:**
        • Voice enabled: ${AppState.voiceSettings.enabled ? 'Yes' : 'No'}
        • Voice gender: ${AppState.voiceSettings.gender}
        • Voice speed: ${AppState.voiceSettings.speed}
        
        ⏰ **Study:**
        • Auto breaks: ${document.getElementById('autoBreakToggle')?.checked ? 'Enabled' : 'Disabled'}
        • Break interval: ${document.getElementById('breakInterval')?.value || 25} minutes
        
        Use the controls in the app to modify these settings.
    `;
    
    chatGPTManager.addMessageToChat(settings, 'ai');
}

function logout() {
    if (confirm('Are you sure you want to sign out?')) {
        auth.signOut().then(() => {
            AppState.currentUser = null;
            AppState.tasks = [];
            AppState.completedTasks = [];
            AppState.studyStats = { totalStudyTime: 0, studyStreak: 0, breaksTaken: 0 };
            
            showNotification('👋 Signed out successfully', 'success');
            showAuthModal();
        }).catch((error) => {
            console.error('Logout error:', error);
            showNotification('Error signing out', 'error');
        });
    }
}

// ============ Data Loading Functions ============
async function loadUserData() {
    if (!AppState.currentUser || !db) return;

    try {
        // Load tasks
        const tasksSnapshot = await db.collection('tasks')
            .where('userId', '==', AppState.currentUser.uid)
            .get();
        
        AppState.tasks = [];
        AppState.completedTasks = [];
        
        tasksSnapshot.forEach(doc => {
            const task = { id: doc.id, ...doc.data() };
            if (task.completed) {
                AppState.completedTasks.push(task);
            } else {
                AppState.tasks.push(task);
            }
        });

        // Load user settings
        const userDoc = await db.collection('users').doc(AppState.currentUser.uid).get();
        if (userDoc.exists) {
            const userData = userDoc.data();
            
            // Apply settings
            if (userData.settings) {
                if (userData.settings.theme) {
                    setTheme(userData.settings.theme);
                }
                if (userData.settings.voiceGender) {
                    AppState.voiceSettings.gender = userData.settings.voiceGender;
                    document.getElementById('voiceGender').value = userData.settings.voiceGender;
                }
                if (userData.settings.voiceSpeed) {
                    AppState.voiceSettings.speed = userData.settings.voiceSpeed;
                    document.getElementById('voiceSpeed').value = userData.settings.voiceSpeed;
                }
            }
            
            // Load stats
            if (userData.stats) {
                AppState.studyStats = { ...AppState.studyStats, ...userData.stats };
            }
        }

        // Update UI
        taskManager.renderTasks();
        taskManager.updateStats();
        studyTimerManager.updateStudyStats();
        
    } catch (error) {
        console.error('Error loading user data:', error);
        showNotification('Error loading user data', 'error');
    }
}

// ============ Initialize Application ============
async function initializeApp() {
    console.log('🚀 Initializing FlowState Pro...');
    
    // Initialize configuration
    if (!initializeConfig()) {
        return;
    }
    
    // Initialize Firebase
    const firebaseReady = initializeFirebase();
    
    // Initialize managers
    window.authManager = new AuthManager();
    window.chatGPTManager = new ChatGPTManager();
    window.voiceManager = new VoiceManager();
    window.taskManager = new TaskManager();
    window.studyTimerManager = new StudyTimerManager();
    window.alarmManager = new AlarmManager();
    window.quoteManager = new QuoteManager();
    window.fileUploadManager = new FileUploadManager();
    
    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
    }
    
    // Set up user dropdown toggle
    document.getElementById('userProfile').addEventListener('click', () => {
        document.getElementById('userDropdown').classList.toggle('hidden');
    });
    
    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('#userProfile')) {
            document.getElementById('userDropdown').classList.add('hidden');
        }
    });
    
    // Set up theme buttons
    document.querySelectorAll('.theme-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            setTheme(btn.getAttribute('data-theme'));
        });
    });
    
    AppState.isInitialized = true;
    console.log('✅ FlowState Pro initialized successfully!');
    
    // Hide loading screen after a moment
    setTimeout(() => {
        document.getElementById('loadingScreen').style.display = 'none';
    }, 2000);
}

// Start the application
document.addEventListener('DOMContentLoaded', initializeApp);
                     
