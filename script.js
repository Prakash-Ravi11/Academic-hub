// ============ ACADEMIA HUB COMPLETE JAVASCRIPT ============

// Global Variables
let currentUser = null;
let isLoggedIn = false;
let tasks = [];
let completedTasks = [];
let studyStats = {
    totalStudyTime: 0,
    studyStreak: 0,
    tasksCompleted: 0,
    focusTime: 0
};

// Voice Recognition
let recognition = null;
let isListening = false;
let voices = [];
let selectedVoice = null;

// AI Chat
let chatHistory = [];
let isTyping = false;

// Theme Management
let currentTheme = 'light';

// Academia Hub Application Class
class AcademiaHub {
    constructor() {
        this.init();
    }

    init() {
        console.log('🎓 Initializing Academia Hub...');
        this.initializeEventListeners();
        this.initializeVoiceRecognition();
        this.initializeTextToSpeech();
        this.loadSavedData();
        this.showAuthModal();
        this.loadQuotes();
        console.log('✅ Academia Hub initialized successfully!');
    }

    // ============ EVENT LISTENERS ============
    initializeEventListeners() {
        // Authentication
        const authForm = document.getElementById('authForm');
        if (authForm) {
            authForm.addEventListener('submit', this.handleAuthentication.bind(this));
        }

        const authSwitchLink = document.getElementById('authSwitchLink');
        if (authSwitchLink) {
            authSwitchLink.addEventListener('click', this.toggleAuthMode.bind(this));
        }

        // Voice Controls
        const voiceBtn = document.getElementById('voiceBtn');
        if (voiceBtn) {
            voiceBtn.addEventListener('click', this.toggleVoiceRecognition.bind(this));
        }

        // Chat
        const chatInput = document.getElementById('chatInput');
        if (chatInput) {
            chatInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.sendMessage();
                }
            });
        }

        const sendBtn = document.getElementById('sendBtn');
        if (sendBtn) {
            sendBtn.addEventListener('click', this.sendMessage.bind(this));
        }

        // Task Input
        const taskInput = document.getElementById('taskInput');
        if (taskInput) {
            taskInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.createTask();
                }
            });
        }

        const createTaskBtn = document.getElementById('createTaskBtn');
        if (createTaskBtn) {
            createTaskBtn.addEventListener('click', this.createTask.bind(this));
        }

        // Theme buttons
        document.querySelectorAll('.theme-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const theme = e.target.textContent.toLowerCase();
                this.setTheme(theme);
            });
        });

        // Progress motivate button
        const motivateBtn = document.getElementById('motivateBtn');
        if (motivateBtn) {
            motivateBtn.addEventListener('click', this.getMotivation.bind(this));
        }
    }

    // ============ AUTHENTICATION ============
    handleAuthentication(event) {
        event.preventDefault();
        
        const emailInput = document.getElementById('emailInput');
        const passwordInput = document.getElementById('passwordInput');
        const nameInput = document.getElementById('nameInput');
        
        if (!emailInput || !passwordInput) {
            this.showNotification('❌ Form inputs not found', 'error');
            return;
        }

        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();
        const name = nameInput ? nameInput.value.trim() : '';

        if (!email || !password) {
            this.showNotification('❌ Please fill in all required fields', 'error');
            return;
        }

        // Simple authentication for demo
        const isSignUp = document.getElementById('authTitle').textContent.includes('Create');
        
        if (isSignUp && !name) {
            this.showNotification('❌ Please enter your name', 'error');
            return;
        }

        // Create or authenticate user
        currentUser = {
            name: name || email.split('@')[0],
            email: email,
            id: Date.now().toString(),
            createdAt: new Date()
        };

        isLoggedIn = true;
        this.saveUserData();
        this.hideAuthModal();
        this.showMainApp();
        this.showNotification(`🎓 Welcome to Academia Hub, ${currentUser.name}!`, 'success');
    }

    toggleAuthMode() {
        const authTitle = document.getElementById('authTitle');
        const authSubtitle = document.getElementById('authSubtitle');
        const authSwitchText = document.getElementById('authSwitchText');
        const authSwitchLink = document.getElementById('authSwitchLink');
        const authBtn = document.getElementById('authSubmitBtn');
        const nameInput = document.getElementById('nameInput');

        const isLogin = authTitle.textContent.includes('Welcome');

        if (isLogin) {
            // Switch to Sign Up
            authTitle.textContent = 'Create Account';
            authSubtitle.textContent = 'Join the Academia Hub community';
            authSwitchText.textContent = 'Already have an account?';
            authSwitchLink.textContent = 'Sign In';
            authBtn.textContent = 'Create Account';
            if (nameInput) nameInput.style.display = 'block';
        } else {
            // Switch to Login
            authTitle.textContent = 'Welcome to Academia Hub';
            authSubtitle.textContent = 'Access your personalized study workspace';
            authSwitchText.textContent = "Don't have an account?";
            authSwitchLink.textContent = 'Create Account';
            authBtn.textContent = 'Sign In';
            if (nameInput) nameInput.style.display = 'none';
        }
    }

    showAuthModal() {
        const authModal = document.getElementById('authModal');
        if (authModal) {
            authModal.classList.remove('hidden');
        }
    }

    hideAuthModal() {
        const authModal = document.getElementById('authModal');
        if (authModal) {
            authModal.classList.add('hidden');
        }
    }

    showMainApp() {
        const mainApp = document.getElementById('mainApp');
        if (mainApp) {
            mainApp.classList.remove('hidden');
        }
        
        // Update user display
        const userNameEl = document.getElementById('userName');
        const userAvatarEl = document.getElementById('userAvatar');
        
        if (userNameEl && currentUser) {
            userNameEl.textContent = currentUser.name;
        }
        
        if (userAvatarEl && currentUser) {
            userAvatarEl.textContent = currentUser.name.charAt(0).toUpperCase();
        }

        // Load user data
        this.loadUserTasks();
        this.updateProgress();
        this.updateStats();
    }

    // ============ VOICE RECOGNITION ============
    initializeVoiceRecognition() {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            recognition = new SpeechRecognition();
            
            recognition.continuous = false;
            recognition.interimResults = false;
            recognition.lang = 'en-US';
            
            recognition.onstart = () => {
                isListening = true;
                this.updateVoiceStatus('🎤 Listening... Speak now!');
                const voiceBtn = document.getElementById('voiceBtn');
                if (voiceBtn) voiceBtn.classList.add('listening');
            };
            
            recognition.onend = () => {
                isListening = false;
                this.updateVoiceStatus('Click the microphone to start voice commands');
                const voiceBtn = document.getElementById('voiceBtn');
                if (voiceBtn) voiceBtn.classList.remove('listening');
            };
            
            recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                this.processVoiceCommand(transcript);
            };
            
            recognition.onerror = (event) => {
                console.error('Voice recognition error:', event.error);
                this.showNotification('❌ Voice recognition error. Please try again.', 'error');
            };
        } else {
            this.updateVoiceStatus('Voice recognition not supported in this browser');
        }
    }

    initializeTextToSpeech() {
        if ('speechSynthesis' in window) {
            speechSynthesis.onvoiceschanged = () => {
                voices = speechSynthesis.getVoices();
                this.selectDefaultVoice();
            };
        }
    }

    selectDefaultVoice() {
        selectedVoice = voices.find(voice => 
            voice.lang.includes('en') && voice.name.toLowerCase().includes('female')
        ) || voices.find(voice => voice.lang.includes('en')) || voices[0];
    }

    toggleVoiceRecognition() {
        if (!recognition) {
            this.showNotification('❌ Voice recognition not supported', 'error');
            return;
        }

        if (isListening) {
            recognition.stop();
        } else {
            recognition.start();
        }
    }

    processVoiceCommand(transcript) {
        console.log('Voice command received:', transcript);
        
        const lowerTranscript = transcript.toLowerCase();
        
        // Task creation
        if (lowerTranscript.includes('create task') || lowerTranscript.includes('add task')) {
            const taskText = transcript.replace(/(create|add)\s*task\s*/i, '').trim();
            if (taskText) {
                const taskInput = document.getElementById('taskInput');
                if (taskInput) {
                    taskInput.value = taskText;
                    this.createTask();
                }
            }
            return;
        }
        
        // Theme changes
        if (lowerTranscript.includes('dark theme') || lowerTranscript.includes('dark mode')) {
            this.setTheme('dark');
            this.speak('Switched to dark theme');
            return;
        }
        
        if (lowerTranscript.includes('light theme') || lowerTranscript.includes('light mode')) {
            this.setTheme('light');
            this.speak('Switched to light theme');
            return;
        }
        
        // Help
        if (lowerTranscript.includes('help')) {
            const helpMessage = 'I can help you create tasks, change themes, and answer questions about studying. Try saying "create task study math" or "ask about biology".';
            this.addChatMessage(helpMessage, 'ai');
            this.speak(helpMessage);
            return;
        }
        
        // Default: send to chat
        const chatInput = document.getElementById('chatInput');
        if (chatInput) {
            chatInput.value = transcript;
            this.sendMessage();
        }
    }

    updateVoiceStatus(message) {
        const voiceStatus = document.getElementById('voiceStatus');
        if (voiceStatus) {
            voiceStatus.textContent = message;
        }
    }

    speak(text) {
        if ('speechSynthesis' in window && selectedVoice && text) {
            speechSynthesis.cancel();
            
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.voice = selectedVoice;
            utterance.rate = 0.9;
            utterance.pitch = 1.0;
            utterance.volume = 1.0;
            
            speechSynthesis.speak(utterance);
        }
    }

    // ============ CHAT SYSTEM ============
    sendMessage() {
        const chatInput = document.getElementById('chatInput');
        if (!chatInput) return;
        
        const message = chatInput.value.trim();
        if (!message) return;
        
        // Add user message
        this.addChatMessage(message, 'user');
        chatInput.value = '';
        
        // Show typing indicator
        this.showTypingIndicator();
        
        // Simulate AI response
        setTimeout(() => {
            this.hideTypingIndicator();
            const response = this.generateAIResponse(message);
            this.addChatMessage(response, 'ai');
            this.speak(response.substring(0, 150)); // Speak first 150 characters
        }, 1500);
    }

    addChatMessage(message, sender) {
        const chatMessages = document.getElementById('chatMessages');
        if (!chatMessages) return;
        
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}`;
        
        if (sender === 'ai') {
            messageDiv.innerHTML = `<strong>🎓 Academia AI:</strong> ${message}`;
        } else {
            messageDiv.innerHTML = `<strong>You:</strong> ${message}`;
        }
        
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        
        // Save to history
        chatHistory.push({ sender, message, timestamp: new Date() });
        this.saveChatHistory();
    }

    generateAIResponse(message) {
        const lowerMessage = message.toLowerCase();
        
        // Academic subject responses
        if (lowerMessage.includes('math') || lowerMessage.includes('mathematics')) {
            return "I'd love to help you with mathematics! Whether it's algebra, calculus, geometry, or statistics, I can explain concepts, solve problems step-by-step, and provide practice exercises. What specific math topic would you like to explore?";
        }
        
        if (lowerMessage.includes('science') || lowerMessage.includes('biology') || lowerMessage.includes('chemistry') || lowerMessage.includes('physics')) {
            return "Science is fascinating! I can help explain concepts in biology (cells, genetics, evolution), chemistry (atoms, reactions, bonds), physics (motion, energy, forces), and more. I can also help with lab reports and scientific method. What science topic interests you?";
        }
        
        if (lowerMessage.includes('history')) {
            return "History helps us understand our world! I can discuss different time periods, analyze historical events, explain cause and effect relationships, and help with essay writing. What historical period or topic would you like to explore?";
        }
        
        if (lowerMessage.includes('english') || lowerMessage.includes('literature') || lowerMessage.includes('writing')) {
            return "I love helping with English and literature! I can assist with essay writing, analyze poems and stories, explain literary devices, improve grammar, build vocabulary, and develop critical thinking skills. What would you like to work on?";
        }
        
        if (lowerMessage.includes('study') || lowerMessage.includes('exam') || lowerMessage.includes('test')) {
            return "Great question about studying! I can help you create effective study schedules, suggest memory techniques, explain active learning strategies, and provide test-taking tips. What subject are you preparing for, or what specific study challenge are you facing?";
        }
        
        // Default academic response
        return `That's an interesting question! As your AI study companion, I'm here to help you succeed academically. I can assist with any subject, provide study strategies, explain complex concepts, and support your learning journey. What specific topic or subject would you like to dive into?`;
    }

    showTypingIndicator() {
        const chatMessages = document.getElementById('chatMessages');
        if (!chatMessages) return;
        
        const typingDiv = document.createElement('div');
        typingDiv.className = 'typing-indicator';
        typingDiv.id = 'typingIndicator';
        typingDiv.innerHTML = `
            <span>🎓 Academia AI is thinking...</span>
            <div class="typing-dots">
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
            </div>
        `;
        
        chatMessages.appendChild(typingDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    hideTypingIndicator() {
        const typingIndicator = document.getElementById('typingIndicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }

    // ============ TASK MANAGEMENT ============
    createTask() {
        const taskInput = document.getElementById('taskInput');
        if (!taskInput) return;
        
        const taskText = taskInput.value.trim();
        if (!taskText) {
            this.showNotification('❌ Please enter a task description', 'error');
            return;
        }
        
        const task = {
            id: Date.now().toString(),
            title: taskText,
            completed: false,
            createdAt: new Date(),
            userId: currentUser?.id,
            type: 'study' // Academic focus
        };
        
        tasks.push(task);
        taskInput.value = '';
        
        this.renderTasks();
        this.updateProgress();
        this.updateStats();
        this.saveTaskData();
        
        this.showNotification(`✅ Study task created: "${task.title}"`, 'success');
        this.speak(`Task created: ${task.title}`);
    }

    toggleTask(taskId) {
        const task = tasks.find(t => t.id === taskId);
        if (!task) return;
        
        task.completed = !task.completed;
        task.completedAt = task.completed ? new Date() : null;
        
        if (task.completed) {
            completedTasks.push({ ...task });
            studyStats.tasksCompleted++;
            this.showNotification('🎉 Great job completing your study task!', 'success');
            this.speak('Excellent work! Task completed successfully!');
        } else {
            const index = completedTasks.findIndex(t => t.id === taskId);
            if (index > -1) {
                completedTasks.splice(index, 1);
                studyStats.tasksCompleted = Math.max(0, studyStats.tasksCompleted - 1);
            }
        }
        
        this.renderTasks();
        this.updateProgress();
        this.updateStats();
        this.saveTaskData();
    }

    deleteTask(taskId) {
        if (!confirm('Are you sure you want to delete this task?')) return;
        
        tasks = tasks.filter(t => t.id !== taskId);
        completedTasks = completedTasks.filter(t => t.id !== taskId);
        
        this.renderTasks();
        this.updateProgress();
        this.updateStats();
        this.saveTaskData();
        
        this.showNotification('🗑️ Task deleted', 'info');
    }

    renderTasks() {
        const tasksList = document.getElementById('tasksList');
        if (!tasksList) return;
        
        if (tasks.length === 0) {
            tasksList.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">📚</div>
                    <div class="empty-title">Ready to start studying!</div>
                    <div class="empty-subtitle">Create your first study task above</div>
                </div>
            `;
            return;
        }
        
        tasksList.innerHTML = tasks.map(task => `
            <div class="task-item ${task.completed ? 'completed' : ''}">
                <div class="task-checkbox ${task.completed ? 'checked' : ''}" onclick="academiaHub.toggleTask('${task.id}')">
                    ${task.completed ? '✓' : ''}
                </div>
                <div class="task-content">
                    <div class="task-title">${task.title}</div>
                    <div class="task-meta">
                        <span>📅 ${new Date(task.createdAt).toLocaleDateString()}</span>
                        <span>📚 Study Task</span>
                    </div>
                </div>
                <button class="btn btn-secondary btn-small" onclick="academiaHub.deleteTask('${task.id}')" title="Delete Task">
                    🗑️
                </button>
            </div>
        `).join('');
    }

    // ============ PROGRESS & STATS ============
    updateProgress() {
        const total = tasks.length;
        const completed = tasks.filter(t => t.completed).length;
        const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
        
        // Update progress ring
        const progressCircle = document.getElementById('progressCircle');
        if (progressCircle) {
            const circumference = 2 * Math.PI * 60;
            const offset = circumference - (percentage / 100) * circumference;
            progressCircle.style.strokeDashoffset = offset;
        }
        
        const progressPercent = document.getElementById('progressPercent');
        if (progressPercent) {
            progressPercent.textContent = `${percentage}%`;
        }
        
        // Update daily message
        const messages = {
            100: "Perfect study day! 🎉 You're unstoppable!",
            80: "Almost there! 🌟 Keep up the excellent work!",
            60: "Great progress! 💪 You're building great study habits!",
            40: "Good start! 🚀 Every step counts towards success!",
            20: "Beginning your journey! ✨ You've got this!",
            0: "Ready to achieve academic excellence! 🎯"
        };
        
        const messageKey = Object.keys(messages).reverse().find(key => percentage >= key);
        const dailyMessage = document.getElementById('dailyMessage');
        if (dailyMessage) {
            dailyMessage.textContent = messages[messageKey];
        }
        
        // Update tasks summary
        const tasksSummary = document.getElementById('tasksSummary');
        if (tasksSummary) {
            tasksSummary.textContent = total > 0 ? 
                `${completed}/${total} study tasks completed today` : 
                'Ready to start your study session';
        }
    }

    updateStats() {
        const totalTasksEl = document.getElementById('totalTasks');
        const completedTasksEl = document.getElementById('completedTasks');
        const completionRateEl = document.getElementById('completionRate');
        const streakCountEl = document.getElementById('streakCount');
        
        const total = tasks.length;
        const completed = tasks.filter(t => t.completed).length;
        const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
        
        if (totalTasksEl) totalTasksEl.textContent = total;
        if (completedTasksEl) completedTasksEl.textContent = completed;
        if (completionRateEl) completionRateEl.textContent = `${rate}%`;
        if (streakCountEl) streakCountEl.textContent = this.calculateStreak();
    }

    calculateStreak() {
        // Simple streak calculation based on consecutive days with completed tasks
        const today = new Date().toDateString();
        const hasTasksToday = tasks.some(t => 
            t.completed && new Date(t.completedAt).toDateString() === today
        );
        
        return hasTasksToday ? studyStats.studyStreak + 1 : studyStats.studyStreak;
    }

    // ============ THEME MANAGEMENT ============
    setTheme(theme) {
        currentTheme = theme;
        document.body.setAttribute('data-theme', theme);
        
        // Update active button
        document.querySelectorAll('.theme-btn').forEach(btn => {
            btn.classList.toggle('active', btn.textContent.toLowerCase() === theme);
        });
        
        this.showNotification(`🎨 Theme changed to ${theme}`, 'success');
        this.saveTheme();
    }

    // ============ QUOTES SYSTEM ============
    loadQuotes() {
        const quotes = [
            {
                text: "Education is the most powerful weapon which you can use to change the world.",
                author: "Nelson Mandela",
                category: "Education"
            },
            {
                text: "The beautiful thing about learning is that nobody can take it away from you.",
                author: "B.B. King",
                category: "Learning"
            },
            {
                text: "Learning never exhausts the mind.",
                author: "Leonardo da Vinci",
                category: "Learning"
            },
            {
                text: "The expert in anything was once a beginner.",
                author: "Helen Hayes",
                category: "Growth"
            },
            {
                text: "Study hard what interests you the most in the most undisciplined, irreverent and original manner possible.",
                author: "Richard Feynman",
                category: "Study"
            }
        ];
        
        const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
        
        const quoteText = document.getElementById('quoteText');
        const quoteAuthor = document.getElementById('quoteAuthor');
        const quoteCategory = document.getElementById('quoteCategory');
        
        if (quoteText) quoteText.textContent = `"${randomQuote.text}"`;
        if (quoteAuthor) quoteAuthor.textContent = `— ${randomQuote.author}`;
        if (quoteCategory) quoteCategory.textContent = randomQuote.category;
    }

    getMotivation() {
        const userName = currentUser?.name || 'Student';
        const motivationalMessages = [
            `${userName}, your dedication to learning is inspiring! Keep pushing forward!`,
            `Great work today, ${userName}! Every study session brings you closer to your goals!`,
            `${userName}, you're building incredible knowledge and skills! Stay focused!`,
            `Amazing progress, ${userName}! Your hard work will definitely pay off!`,
            `Keep it up, ${userName}! You're developing excellent study habits!`
        ];
        
        const message = motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)];
        this.addChatMessage(message, 'ai');
        this.speak(message);
        this.loadQuotes(); // Load a new quote
    }

    // ============ DATA PERSISTENCE ============
    saveUserData() {
        if (currentUser) {
            localStorage.setItem('academia-hub-user', JSON.stringify(currentUser));
            localStorage.setItem('academia-hub-logged-in', 'true');
        }
    }

    saveTaskData() {
        localStorage.setItem('academia-hub-tasks', JSON.stringify(tasks));
        localStorage.setItem('academia-hub-completed-tasks', JSON.stringify(completedTasks));
        localStorage.setItem('academia-hub-stats', JSON.stringify(studyStats));
    }

    saveChatHistory() {
        localStorage.setItem('academia-hub-chat', JSON.stringify(chatHistory.slice(-50))); // Keep last 50 messages
    }

    saveTheme() {
        localStorage.setItem('academia-hub-theme', currentTheme);
    }

    loadSavedData() {
        // Load user
        const savedUser = localStorage.getItem('academia-hub-user');
        const wasLoggedIn = localStorage.getItem('academia-hub-logged-in');
        
        if (savedUser && wasLoggedIn === 'true') {
            currentUser = JSON.parse(savedUser);
            isLoggedIn = true;
        }

        // Load tasks
        const savedTasks = localStorage.getItem('academia-hub-tasks');
        if (savedTasks) {
            tasks = JSON.parse(savedTasks);
        }

        const savedCompletedTasks = localStorage.getItem('academia-hub-completed-tasks');
        if (savedCompletedTasks) {
            completedTasks = JSON.parse(savedCompletedTasks);
        }

        // Load stats
        const savedStats = localStorage.getItem('academia-hub-stats');
        if (savedStats) {
            studyStats = { ...studyStats, ...JSON.parse(savedStats) };
        }

        // Load chat history
        const savedChat = localStorage.getItem('academia-hub-chat');
        if (savedChat) {
            chatHistory = JSON.parse(savedChat);
        }

        // Load theme
        const savedTheme = localStorage.getItem('academia-hub-theme');
        if (savedTheme) {
            this.setTheme(savedTheme);
        }

        // Auto-login if user was logged in
        if (isLoggedIn && currentUser) {
            this.hideAuthModal();
            this.showMainApp();
        }
    }

    loadUserTasks() {
        this.renderTasks();
        this.updateProgress();
        this.updateStats();
    }

    // ============ NOTIFICATIONS ============
    showNotification(message, type = 'info') {
        const container = document.getElementById('notificationContainer') || this.createNotificationContainer();
        
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        
        const icon = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: '📘'
        }[type] || '📘';
        
        notification.innerHTML = `
            <span style="font-size: 18px;">${icon}</span>
            <span style="flex: 1;">${message}</span>
            <button onclick="this.parentElement.remove()" style="background: none; border: none; color: inherit; cursor: pointer; font-size: 16px; padding: 4px;">×</button>
        `;
        
        container.appendChild(notification);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    }

    createNotificationContainer() {
        const container = document.createElement('div');
        container.id = 'notificationContainer';
        container.className = 'notification-container';
        document.body.appendChild(container);
        return container;
    }

    // ============ LOGOUT ============
    logout() {
        if (confirm('Are you sure you want to sign out?')) {
            currentUser = null;
            isLoggedIn = false;
            tasks = [];
            completedTasks = [];
            chatHistory = [];
            
            localStorage.removeItem('academia-hub-user');
            localStorage.removeItem('academia-hub-logged-in');
            localStorage.removeItem('academia-hub-tasks');
            localStorage.removeItem('academia-hub-completed-tasks');
            localStorage.removeItem('academia-hub-chat');
            
            this.showNotification('👋 Signed out successfully', 'success');
            location.reload(); // Refresh the page
        }
    }
}

// ============ INITIALIZE APPLICATION ============
let academiaHub;

document.addEventListener('DOMContentLoaded', function() {
    console.log('🎓 Academia Hub - Ultimate Study Companion');
    console.log('Initializing application...');
    
    academiaHub = new AcademiaHub();
    
    // Make globally available for HTML onclick handlers
    window.academiaHub = academiaHub;
    
    // Global functions for HTML onclick handlers
    window.sendMessage = () => academiaHub.sendMessage();
    window.createTask = () => academiaHub.createTask();
    window.getMotivation = () => academiaHub.getMotivation();
    window.logout = () => academiaHub.logout();
});

// Service Worker Registration
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('sw.js')
            .then(function(registration) {
                console.log('✅ SW registered:', registration.scope);
            })
            .catch(function(err) {
                console.log('❌ SW registration failed:', err);
            });
    });
}
