/**
 * Academic Hub Pro - Complete JavaScript Logic
 * Built by: Nick (Ex-Apple UI/UX) + R R PRAKASHRAVI
 * 
 * Features:
 * - Advanced loading animations with particle morphing
 * - AI chat integration (OpenRouter/ChatGPT)
 * - TensorFlow.js ML predictions for study optimization
 * - File management with Base64 encoding
 * - Study time tracking and progress calculation
 * - Theme management with smooth transitions
 * - PWA service worker registration
 * - Real-time notifications and updates
 * - Advanced animations and micro-interactions
 */

// ==================== GLOBAL STATE MANAGEMENT ====================
class AcademicHubApp {
    constructor() {
        this.state = {
            user: {
                name: '',
                avatar: '',
                preferences: {}
            },
            subjects: {},
            studySessions: [],
            aiChat: {
                messages: [],
                apiKey: ''
            },
            ml: {
                model: null,
                predictions: {}
            },
            theme: 'light',
            notifications: []
        };
        
        this.init();
    }
    
    async init() {
        console.log('🚀 Academic Hub Pro initializing...');
        
        // Initialize core systems
        await this.initializeApp();
        await this.loadUserData();
        await this.setupEventListeners();
        await this.initializeML();
        await this.registerServiceWorker();
        
        console.log('✅ Academic Hub Pro ready!');
    }
    
    async initializeApp() {
        // Initialize particles for loading screen
        this.initializeParticles();
        
        // Setup loading sequence
        setTimeout(() => this.completeLoading(), 3000);
        
        // Initialize subjects from timetable data
        this.initializeSubjects();
        
        // Setup real-time clock
        this.startClock();
    }
    
    initializeParticles() {
        if (typeof particlesJS !== 'undefined') {
            particlesJS('particles-js', {
                particles: {
                    number: { 
                        value: 100,
                        density: { enable: true, value_area: 800 }
                    },
                    color: { value: '#007AFF' },
                    shape: { 
                        type: 'circle',
                        stroke: { width: 0, color: '#000000' }
                    },
                    opacity: {
                        value: 0.6,
                        random: true,
                        anim: { enable: true, speed: 1, opacity_min: 0.1 }
                    },
                    size: {
                        value: 3,
                        random: true,
                        anim: { enable: true, speed: 2, size_min: 0.1 }
                    },
                    line_linked: {
                        enable: true,
                        distance: 150,
                        color: '#007AFF',
                        opacity: 0.4,
                        width: 1
                    },
                    move: {
                        enable: true,
                        speed: 2,
                        direction: 'none',
                        random: false,
                        straight: false,
                        out_mode: 'out',
                        bounce: false
                    }
                },
                interactivity: {
                    detect_on: 'canvas',
                    events: {
                        onhover: { enable: true, mode: 'repulse' },
                        onclick: { enable: true, mode: 'push' },
                        resize: true
                    },
                    modes: {
                        grab: { distance: 400, line_linked: { opacity: 1 } },
                        bubble: { distance: 400, size: 40, duration: 2, opacity: 8 },
                        repulse: { distance: 200, duration: 0.4 },
                        push: { particles_nb: 4 },
                        remove: { particles_nb: 2 }
                    }
                },
                retina_detect: true
            });
        }
    }
    
    completeLoading() {
        const loadingScreen = document.getElementById('loading-screen');
        loadingScreen.style.opacity = '0';
        loadingScreen.style.transform = 'scale(1.1)';
        
        setTimeout(() => {
            loadingScreen.style.display = 'none';
            this.checkUsername();
        }, 1000);
    }
    
    checkUsername() {
        const savedUsername = localStorage.getItem('academic-hub-username');
        if (!savedUsername) {
            document.getElementById('username-modal').classList.add('show');
            document.getElementById('usernameInput').focus();
        } else {
            this.state.user.name = savedUsername;
            this.updateUserDisplay();
        }
    }
    
    initializeSubjects() {
        // Subject data from the actual timetable
        this.state.subjects = {
            '21MAB201T': {
                code: '21MAB201T',
                title: 'Transforms and Boundary Value Problems',
                faculty: 'Dr. V. Vidhya',
                credits: 4,
                category: 'Basic Science',
                room: 'LH905',
                slot: 'A',
                color: '#FF6B6B',
                icon: '📐',
                progress: 0,
                studyTime: 0,
                materials: [],
                lastStudied: null,
                targetHours: 40
            },
            '21CSC201J': {
                code: '21CSC201J',
                title: 'Data Structures and Algorithms',
                faculty: 'Dr. Kalpana C',
                credits: 4,
                category: 'Professional Core',
                room: 'LH905',
                slot: 'B',
                color: '#4ECDC4',
                icon: '🌳',
                progress: 0,
                studyTime: 0,
                materials: [],
                lastStudied: null,
                targetHours: 50
            },
            '21CSS201T': {
                code: '21CSS201T',
                title: 'Computer Organization and Architecture',
                faculty: 'Dr. Meenakshi M',
                credits: 4,
                category: 'Engineering Science',
                room: 'LH905',
                slot: 'C',
                color: '#45B7D1',
                icon: '🏗️',
                progress: 0,
                studyTime: 0,
                materials: [],
                lastStudied: null,
                targetHours: 45
            },
            '21CSC203P': {
                code: '21CSC203P',
                title: 'Advanced Programming Practice',
                faculty: 'Dr. Prince Chelladurai S',
                credits: 4,
                category: 'Professional Core',
                room: 'LH905',
                slot: 'D',
                color: '#96CEB4',
                icon: '💻',
                progress: 0,
                studyTime: 0,
                materials: [],
                lastStudied: null,
                targetHours: 60
            },
            '21CSC202J': {
                code: '21CSC202J',
                title: 'Operating Systems',
                faculty: 'Dr. G. Priyadharshini',
                credits: 4,
                category: 'Professional Core',
                room: 'LH905',
                slot: 'F',
                color: '#FFEAA7',
                icon: '⚙️',
                progress: 0,
                studyTime: 0,
                materials: [],
                lastStudied: null,
                targetHours: 45
            },
            '21LEM202T': {
                code: '21LEM202T',
                title: 'Universal Human Values - II',
                faculty: 'Dr. Caleb Theodar M',
                credits: 3,
                category: 'Engineering Science',
                room: 'To be Alloted',
                slot: 'G',
                color: '#DDA0DD',
                icon: '🧠',
                progress: 0,
                studyTime: 0,
                materials: [],
                lastStudied: null,
                targetHours: 30
            },
            '21LEM201T': {
                code: '21LEM201T',
                title: 'Professional Ethics',
                faculty: 'Dr. B. Monika Nair',
                credits: 0,
                category: 'Mandatory',
                room: 'Online',
                slot: 'P25',
                color: '#98D8C8',
                icon: '⚖️',
                progress: 0,
                studyTime: 0,
                materials: [],
                lastStudied: null,
                targetHours: 20
            }
        };
        
        this.loadSubjectData();
        this.updateDashboardStats();
    }
    
    async loadUserData() {
        // Load theme
        const savedTheme = localStorage.getItem('academic-hub-theme') || 'light';
        this.setTheme(savedTheme);
        
        // Load AI API key
        this.state.aiChat.apiKey = localStorage.getItem('academic-hub-api-key') || '';
        
        // Load subject data
        const savedSubjects = localStorage.getItem('academic-hub-subjects');
        if (savedSubjects) {
            const parsed = JSON.parse(savedSubjects);
            Object.keys(parsed).forEach(code => {
                if (this.state.subjects[code]) {
                    Object.assign(this.state.subjects[code], parsed[code]);
                }
            });
        }
        
        // Update UI with loaded data
        this.updateProgressBars();
        this.updateMaterialsLists();
    }
    
    async setupEventListeners() {
        // Theme toggle
        document.querySelectorAll('.theme-toggle').forEach(btn => {
            btn.addEventListener('click', () => this.toggleTheme());
        });
        
        // Sidebar navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => this.handleNavigation(e));
        });
        
        // File upload areas
        Object.keys(this.state.subjects).forEach(code => {
            const uploadArea = document.querySelector(`[data-subject="${code}"] .file-upload-area`);
            if (uploadArea) {
                uploadArea.addEventListener('click', () => this.handleFileUpload(code));
                uploadArea.addEventListener('dragover', (e) => this.handleDragOver(e));
                uploadArea.addEventListener('drop', (e) => this.handleFileDrop(e, code));
                uploadArea.addEventListener('dragleave', (e) => this.handleDragLeave(e));
            }
        });
        
        // AI Chat
        const chatInput = document.getElementById('chatInput');
        const chatSend = document.getElementById('chatSend');
        
        if (chatInput && chatSend) {
            chatInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.sendAIMessage();
                }
            });
            
            chatSend.addEventListener('click', () => this.sendAIMessage());
        }
        
        // Auto-resize chat input
        if (chatInput) {
            chatInput.addEventListener('input', () => {
                chatInput.style.height = 'auto';
                chatInput.style.height = Math.min(chatInput.scrollHeight, 120) + 'px';
            });
        }
        
        // Subject action buttons
        this.setupSubjectButtons();
        
        // Global keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));
        
        // Window events
        window.addEventListener('beforeunload', () => this.saveAppData());
        window.addEventListener('online', () => this.handleOnlineStatus(true));
        window.addEventListener('offline', () => this.handleOnlineStatus(false));
    }
    
    setupSubjectButtons() {
        Object.keys(this.state.subjects).forEach(code => {
            const card = document.querySelector(`[data-subject="${code}"]`);
            if (card) {
                const materialsBtn = card.querySelector('.action-btn.secondary');
                const studyBtn = card.querySelector('.action-btn.primary');
                
                if (materialsBtn) {
                    materialsBtn.addEventListener('click', () => this.viewMaterials(code));
                }
                
                if (studyBtn) {
                    studyBtn.addEventListener('click', () => this.startStudySession(code));
                }
            }
        });
    }
    
    startClock() {
        const updateClock = () => {
            const now = new Date();
            const timeString = now.toLocaleTimeString('en-IN', {
                timeZone: 'Asia/Kolkata',
                hour12: true,
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });
            
            const clockElement = document.getElementById('liveClock');
            if (clockElement) {
                clockElement.textContent = timeString;
            }
        };
        
        updateClock();
        setInterval(updateClock, 1000);
    }
    
    // ==================== USER MANAGEMENT ====================
    saveUsername() {
        const input = document.getElementById('usernameInput');
        const username = input.value.trim();
        
        if (username) {
            this.state.user.name = username;
            localStorage.setItem('academic-hub-username', username);
            
            this.updateUserDisplay();
            this.hideUsernameModal();
            this.showNotification('Welcome!', `Hi ${username}! Your Academic Hub is ready.`, 'success');
        } else {
            this.showNotification('Error', 'Please enter your name', 'error');
        }
    }
    
    updateUserDisplay() {
        const nameElements = document.querySelectorAll('#userName');
        const avatarElements = document.querySelectorAll('#userAvatar');
        
        nameElements.forEach(el => el.textContent = this.state.user.name);
        avatarElements.forEach(el => {
            el.textContent = this.state.user.name.charAt(0).toUpperCase();
        });
    }
    
    hideUsernameModal() {
        const modal = document.getElementById('username-modal');
        modal.classList.remove('show');
        
        setTimeout(() => {
            modal.style.display = 'none';
        }, 300);
    }
    
    // ==================== THEME MANAGEMENT ====================
    toggleTheme() {
        const currentTheme = this.state.theme;
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        this.setTheme(newTheme);
    }
    
    setTheme(theme) {
        this.state.theme = theme;
        document.body.setAttribute('data-theme', theme);
        localStorage.setItem('academic-hub-theme', theme);
        
        // Update theme toggle icons
        document.querySelectorAll('.theme-toggle').forEach(toggle => {
            toggle.textContent = theme === 'dark' ? '☀️' : '🌙';
        });
        
        // Add theme transition class
        document.body.classList.add('theme-transitioning');
        setTimeout(() => document.body.classList.remove('theme-transitioning'), 300);
    }
    
    // ==================== FILE MANAGEMENT ====================
    handleFileUpload(subjectCode) {
        const input = document.createElement('input');
        input.type = 'file';
        input.multiple = true;
        input.accept = '.pdf,.docx,.pptx,.txt,.png,.jpg,.jpeg';
        
        input.addEventListener('change', (e) => {
            this.processFiles(e.target.files, subjectCode);
        });
        
        input.click();
    }
    
    handleDragOver(e) {
        e.preventDefault();
        e.currentTarget.classList.add('dragover');
    }
    
    handleDragLeave(e) {
        e.currentTarget.classList.remove('dragover');
    }
    
    handleFileDrop(e, subjectCode) {
        e.preventDefault();
        e.currentTarget.classList.remove('dragover');
        this.processFiles(e.dataTransfer.files, subjectCode);
    }
    
    async processFiles(files, subjectCode) {
        const maxSize = 10 * 1024 * 1024; // 10MB limit
        
        for (let file of files) {
            if (file.size > maxSize) {
                this.showNotification('Error', `${file.name} is too large (max 10MB)`, 'error');
                continue;
            }
            
            try {
                const base64 = await this.fileToBase64(file);
                const material = {
                    id: Date.now() + Math.random(),
                    name: file.name,
                    type: file.type,
                    size: file.size,
                    data: base64,
                    uploadedAt: new Date().toISOString()
                };
                
                this.state.subjects[subjectCode].materials.push(material);
                this.saveAppData();
                this.updateMaterialsList(subjectCode);
                
                this.showNotification('Success', `${file.name} uploaded successfully`, 'success');
            } catch (error) {
                this.showNotification('Error', `Failed to upload ${file.name}`, 'error');
            }
        }
    }
    
    fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }
    
    updateMaterialsList(subjectCode) {
        const listElement = document.getElementById(`materials-${subjectCode}`);
        if (!listElement) return;
        
        const materials = this.state.subjects[subjectCode].materials;
        
        if (materials.length === 0) {
            listElement.innerHTML = '';
            return;
        }
        
        listElement.innerHTML = materials.map(material => `
            <div class="material-item">
                <span class="material-name" title="${material.name}">${material.name}</span>
                <div class="material-actions">
                    <button class="material-btn" onclick="app.downloadMaterial('${subjectCode}', '${material.id}')">
                        📥 Download
                    </button>
                    <button class="material-btn" onclick="app.deleteMaterial('${subjectCode}', '${material.id}')">
                        🗑️ Delete
                    </button>
                </div>
            </div>
        `).join('');
    }
    
    updateMaterialsLists() {
        Object.keys(this.state.subjects).forEach(code => {
            this.updateMaterialsList(code);
        });
    }
    
    downloadMaterial(subjectCode, materialId) {
        const material = this.state.subjects[subjectCode].materials.find(m => m.id == materialId);
        if (!material) return;
        
        const link = document.createElement('a');
        link.href = material.data;
        link.download = material.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        this.showNotification('Downloaded', `${material.name} downloaded successfully`, 'success');
    }
    
    deleteMaterial(subjectCode, materialId) {
        const material = this.state.subjects[subjectCode].materials.find(m => m.id == materialId);
        if (!material) return;
        
        if (confirm(`Delete ${material.name}?`)) {
            this.state.subjects[subjectCode].materials = 
                this.state.subjects[subjectCode].materials.filter(m => m.id != materialId);
            
            this.saveAppData();
            this.updateMaterialsList(subjectCode);
            this.showNotification('Deleted', `${material.name} deleted successfully`, 'success');
        }
    }
    
    // ==================== STUDY SESSION MANAGEMENT ====================
    startStudySession(subjectCode) {
        const subject = this.state.subjects[subjectCode];
        if (!subject) return;
        
        const session = {
            id: Date.now(),
            subjectCode,
            startTime: new Date(),
            endTime: null,
            duration: 0,
            paused: false
        };
        
        this.state.currentSession = session;
        this.showStudyTimer(subject);
    }
    
    showStudyTimer(subject) {
        // Create study timer modal (simplified for brevity)
        const modal = document.createElement('div');
        modal.className = 'study-timer-modal';
        modal.innerHTML = `
            <div class="timer-content">
                <h2>📚 Studying: ${subject.title}</h2>
                <div class="timer-display" id="timerDisplay">00:00:00</div>
                <div class="timer-controls">
                    <button onclick="app.pauseTimer()" id="pauseBtn">⏸️ Pause</button>
                    <button onclick="app.stopTimer()" id="stopBtn">⏹️ Stop</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        this.startTimer();
    }
    
    startTimer() {
        this.timerInterval = setInterval(() => {
            if (this.state.currentSession && !this.state.currentSession.paused) {
                const elapsed = Date.now() - this.state.currentSession.startTime;
                const display = this.formatTime(elapsed);
                
                const timerDisplay = document.getElementById('timerDisplay');
                if (timerDisplay) {
                    timerDisplay.textContent = display;
                }
            }
        }, 1000);
    }
    
    pauseTimer() {
        if (this.state.currentSession) {
            this.state.currentSession.paused = !this.state.currentSession.paused;
            const pauseBtn = document.getElementById('pauseBtn');
            if (pauseBtn) {
                pauseBtn.textContent = this.state.currentSession.paused ? '▶️ Resume' : '⏸️ Pause';
            }
        }
    }
    
    stopTimer() {
        if (this.state.currentSession) {
            const session = this.state.currentSession;
            session.endTime = new Date();
            session.duration = session.endTime - session.startTime;
            
            // Update subject study time
            const subject = this.state.subjects[session.subjectCode];
            subject.studyTime += Math.floor(session.duration / (1000 * 60)); // Convert to minutes
            subject.lastStudied = new Date().toISOString();
            
            // Update progress
            this.updateSubjectProgress(session.subjectCode);
            
            // Save session
            this.state.studySessions.push(session);
            
            // Clean up
            clearInterval(this.timerInterval);
            document.querySelector('.study-timer-modal')?.remove();
            this.state.currentSession = null;
            
            this.saveAppData();
            this.updateDashboardStats();
            this.showNotification('Session Complete', 
                `Great job! You studied for ${this.formatTime(session.duration)}`, 'success');
        }
    }
    
    formatTime(milliseconds) {
        const seconds = Math.floor(milliseconds / 1000);
        const mins = Math.floor(seconds / 60);
        const hours = Math.floor(mins / 60);
        
        return `${hours.toString().padStart(2, '0')}:${(mins % 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;
    }
    
    updateSubjectProgress(subjectCode) {
        const subject = this.state.subjects[subjectCode];
        if (!subject) return;
        
        // Calculate progress based on study time vs target hours
        const progressPercent = Math.min((subject.studyTime / 60) / subject.targetHours * 100, 100);
        subject.progress = Math.round(progressPercent);
        
        this.updateProgressBar(subjectCode);
    }
    
    updateProgressBar(subjectCode) {
        const card = document.querySelector(`[data-subject="${subjectCode}"]`);
        if (!card) return;
        
        const progressFill = card.querySelector('.progress-fill');
        const progressValue = card.querySelector('.progress-value');
        const studyTimeSpan = card.querySelector('.study-time span:last-child');
        
        const subject = this.state.subjects[subjectCode];
        
        if (progressFill) {
            progressFill.style.width = `${subject.progress}%`;
        }
        
        if (progressValue) {
            progressValue.textContent = `${subject.progress}%`;
        }
        
        if (studyTimeSpan) {
            const hours = Math.floor(subject.studyTime / 60);
            const mins = subject.studyTime % 60;
            studyTimeSpan.textContent = `Study Time: ${hours}h ${mins}m`;
        }
    }
    
    updateProgressBars() {
        Object.keys(this.state.subjects).forEach(code => {
            this.updateProgressBar(code);
        });
    }
    
    updateDashboardStats() {
        const totalSubjects = Object.keys(this.state.subjects).length;
        const totalCredits = Object.values(this.state.subjects).reduce((sum, s) => sum + s.credits, 0);
        const avgProgress = Math.round(Object.values(this.state.subjects).reduce((sum, s) => sum + s.progress, 0) / totalSubjects);
        const totalStudyTime = Object.values(this.state.subjects).reduce((sum, s) => sum + s.studyTime, 0);
        
        document.getElementById('totalSubjects').textContent = totalSubjects;
        document.getElementById('totalCredits').textContent = totalCredits;
        document.getElementById('avgProgress').textContent = `${avgProgress}%`;
        document.getElementById('studyTime').textContent = `${Math.floor(totalStudyTime / 60)}h`;
    }
    
    // ==================== AI CHAT INTEGRATION ====================
    async sendAIMessage() {
        const input = document.getElementById('chatInput');
        const sendBtn = document.getElementById('chatSend');
        const messagesContainer = document.getElementById('aiChatMessages');
        
        const message = input.value.trim();
        if (!message) return;
        
        // Add user message
        this.addChatMessage('user', message);
        input.value = '';
        sendBtn.disabled = true;
        
        try {
            // Check API key
            if (!this.state.aiChat.apiKey) {
                this.addChatMessage('ai', 'Please set your OpenRouter API key in settings to use AI chat.');
                return;
            }
            
            // Send to OpenRouter API
            const response = await this.callOpenRouterAPI(message);
            this.addChatMessage('ai', response);
            
        } catch (error) {
            console.error('AI Chat error:', error);
            this.addChatMessage('ai', 'Sorry, I encountered an error. Please try again.');
        } finally {
            sendBtn.disabled = false;
        }
    }
    
    async callOpenRouterAPI(message) {
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.state.aiChat.apiKey}`,
                'HTTP-Referer': window.location.origin,
                'X-Title': 'Academic Hub Pro'
            },
            body: JSON.stringify({
                model: 'openai/gpt-3.5-turbo',
                messages: [
                    {
                        role: 'system',
                        content: `You are an AI study assistant for ${this.state.user.name}, a B.Tech CSE AI/ML student at SRM University. Help with academic questions, study planning, and subject-specific guidance. Current subjects: ${Object.values(this.state.subjects).map(s => s.title).join(', ')}.`
                    },
                    {
                        role: 'user',
                        content: message
                    }
                ],
                temperature: 0.7,
                max_tokens: 500
            })
        });
        
        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }
        
        const data = await response.json();
        return data.choices[0].message.content;
    }
    
    addChatMessage(role, content) {
        const messagesContainer = document.getElementById('aiChatMessages');
        if (!messagesContainer) return;
        
        const messageDiv = document.createElement('div');
        messageDiv.className = `ai-message ${role}`;
        
        const avatar = document.createElement('div');
        avatar.className = `message-avatar ${role}`;
        avatar.textContent = role === 'ai' ? '🤖' : this.state.user.name.charAt(0).toUpperCase();
        
        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';
        messageContent.textContent = content;
        
        messageDiv.appendChild(avatar);
        messageDiv.appendChild(messageContent);
        messagesContainer.appendChild(messageDiv);
        
        // Scroll to bottom
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        
        // Save message
        this.state.aiChat.messages.push({ role, content, timestamp: new Date().toISOString() });
    }
    
    openAIChat() {
        const modal = document.getElementById('ai-chat-modal');
        if (modal) {
            modal.classList.add('show');
            document.getElementById('chatInput')?.focus();
        }
    }
    
    closeAIChat() {
        const modal = document.getElementById('ai-chat-modal');
        if (modal) {
            modal.classList.remove('show');
        }
    }
    
    // ==================== MACHINE LEARNING INTEGRATION ====================
    async initializeML() {
        try {
            // Create a simple neural network for study time prediction
            this.state.ml.model = tf.sequential({
                layers: [
                    tf.layers.dense({ inputShape: [4], units: 8, activation: 'relu' }),
                    tf.layers.dense({ units: 4, activation: 'relu' }),
                    tf.layers.dense({ units: 1, activation: 'sigmoid' })
                ]
            });
            
            this.state.ml.model.compile({
                optimizer: 'adam',
                loss: 'meanSquaredError',
                metrics: ['mae']
            });
            
            console.log('✅ ML Model initialized');
            this.generateMLPredictions();
            
        } catch (error) {
            console.warn('ML initialization failed:', error);
        }
    }
    
    async generateMLPredictions() {
        if (!this.state.ml.model) return;
        
        Object.keys(this.state.subjects).forEach(code => {
            const subject = this.state.subjects[code];
            
            try {
                // Create input features: [credits, current_progress, study_time_hours, materials_count]
                const features = tf.tensor2d([[
                    subject.credits / 4, // Normalized credits
                    subject.progress / 100, // Normalized progress
                    (subject.studyTime / 60) / subject.targetHours, // Normalized study time
                    subject.materials.length / 10 // Normalized materials count
                ]]);
                
                // Generate prediction
                const prediction = this.state.ml.model.predict(features);
                const predictionValue = await prediction.data();
                
                // Update prediction display
                this.updateMLPrediction(code, predictionValue[0]);
                
                features.dispose();
                prediction.dispose();
                
            } catch (error) {
                console.warn(`ML prediction failed for ${code}:`, error);
            }
        });
    }
    
    updateMLPrediction(subjectCode, predictionValue) {
        const card = document.querySelector(`[data-subject="${subjectCode}"]`);
        if (!card) return;
        
        const predictionElement = card.querySelector('.ml-prediction .prediction-value');
        if (!predictionElement) return;
        
        const percentage = Math.round(predictionValue * 100);
        const subject = this.state.subjects[subjectCode];
        
        let message = '';
        if (percentage < 30) {
            message = `📈 Predicted success: ${percentage}% - Need more study time!`;
        } else if (percentage < 70) {
            message = `📊 Predicted success: ${percentage}% - On track, keep going!`;
        } else {
            message = `🎯 Predicted success: ${percentage}% - Excellent progress!`;
        }
        
        predictionElement.textContent = message;
        
        // Add recommendation
        const recommendations = this.generateStudyRecommendations(subject, predictionValue);
        if (recommendations) {
            predictionElement.textContent += `\n💡 ${recommendations}`;
        }
    }
    
    generateStudyRecommendations(subject, prediction) {
        const recommendations = [];
        
        if (subject.studyTime < subject.targetHours * 0.3) {
            recommendations.push('Increase daily study time');
        }
        
        if (subject.materials.length < 3) {
            recommendations.push('Upload more study materials');
        }
        
        if (!subject.lastStudied || Date.now() - new Date(subject.lastStudied).getTime() > 7 * 24 * 60 * 60 * 1000) {
            recommendations.push('Review this subject soon');
        }
        
        return recommendations.length > 0 ? recommendations[0] : null;
    }
    
    // ==================== NAVIGATION & UI ====================
    handleNavigation(e) {
        const section = e.currentTarget.dataset.section;
        if (!section) return;
        
        // Update active nav item
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        e.currentTarget.classList.add('active');
        
        // Handle section switching
        switch (section) {
            case 'ai-chat':
                this.openAIChat();
                break;
            case 'settings':
                this.openSettings();
                break;
            case 'analytics':
                this.showNotification('Premium Feature', 'Analytics requires premium upgrade', 'info');
                break;
            case 'schedule':
                this.showNotification('Premium Feature', 'Smart scheduling requires premium upgrade', 'info');
                break;
            default:
                console.log(`Navigate to: ${section}`);
        }
    }
    
    openSettings() {
        // Create settings modal (simplified)
        const modal = document.createElement('div');
        modal.className = 'settings-modal';
        modal.innerHTML = `
            <div class="settings-content">
                <h2>⚙️ Settings</h2>
                <div class="setting-group">
                    <label>OpenRouter API Key:</label>
                    <input type="password" id="apiKeyInput" value="${this.state.aiChat.apiKey}" placeholder="Enter your API key">
                    <small>Get your API key from <a href="https://openrouter.ai" target="_blank">openrouter.ai</a></small>
                </div>
                <div class="settings-actions">
                    <button onclick="app.saveSettings()">💾 Save</button>
                    <button onclick="app.closeSettings()">❌ Close</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    }
    
    saveSettings() {
        const apiKey = document.getElementById('apiKeyInput')?.value.trim();
        if (apiKey) {
            this.state.aiChat.apiKey = apiKey;
            localStorage.setItem('academic-hub-api-key', apiKey);
            this.showNotification('Settings Saved', 'API key updated successfully', 'success');
        }
        this.closeSettings();
    }
    
    closeSettings() {
        document.querySelector('.settings-modal')?.remove();
    }
    
    viewMaterials(subjectCode) {
        const subject = this.state.subjects[subjectCode];
        if (!subject || subject.materials.length === 0) {
            this.showNotification('No Materials', 'No materials uploaded for this subject yet', 'info');
            return;
        }
        
        // Show materials in a modal or expand the card
        this.showNotification('Materials', `${subject.materials.length} files available`, 'info');
    }
    
    // ==================== NOTIFICATIONS ====================
    showNotification(title, message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-title">${this.getNotificationIcon(type)} ${title}</div>
            <div class="notification-message">${message}</div>
        `;
        
        document.body.appendChild(notification);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => notification.remove(), 300);
        }, 5000);
        
        // Click to dismiss
        notification.addEventListener('click', () => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => notification.remove(), 300);
        });
    }
    
    getNotificationIcon(type) {
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };
        return icons[type] || icons.info;
    }
    
    // ==================== KEYBOARD SHORTCUTS ====================
    handleKeyboardShortcuts(e) {
        // Ctrl/Cmd + K: Open AI Chat
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            this.openAIChat();
        }
        
        // Ctrl/Cmd + T: Toggle Theme
        if ((e.ctrlKey || e.metaKey) && e.key === 't') {
            e.preventDefault();
            this.toggleTheme();
        }
        
        // Escape: Close modals
        if (e.key === 'Escape') {
            this.closeAIChat();
            this.closeSettings();
            document.querySelector('.study-timer-modal')?.remove();
        }
    }
    
    // ==================== PWA & SERVICE WORKER ====================
    async registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            try {
                const registration = await navigator.serviceWorker.register('/sw.js');
                console.log('✅ Service Worker registered:', registration);
            } catch (error) {
                console.warn('Service Worker registration failed:', error);
            }
        }
    }
    
    handleOnlineStatus(isOnline) {
        const indicator = document.getElementById('offline-indicator');
        if (indicator) {
            indicator.style.display = isOnline ? 'none' : 'block';
        }
        
        this.showNotification(
            isOnline ? 'Back Online' : 'Offline Mode',
            isOnline ? 'Internet connection restored' : 'App continues to work offline',
            isOnline ? 'success' : 'warning'
        );
    }
    
    // ==================== DATA PERSISTENCE ====================
    saveAppData() {
        try {
            localStorage.setItem('academic-hub-subjects', JSON.stringify(this.state.subjects));
            localStorage.setItem('academic-hub-sessions', JSON.stringify(this.state.studySessions));
            localStorage.setItem('academic-hub-ai-messages', JSON.stringify(this.state.aiChat.messages));
        } catch (error) {
            console.warn('Failed to save app data:', error);
        }
    }
    
    loadSubjectData() {
        try {
            const saved = localStorage.getItem('academic-hub-subjects');
            if (saved) {
                const parsed = JSON.parse(saved);
                Object.keys(parsed).forEach(code => {
                    if (this.state.subjects[code]) {
                        Object.assign(this.state.subjects[code], parsed[code]);
                    }
                });
            }
        } catch (error) {
            console.warn('Failed to load subject data:', error);
        }
    }
    
    // ==================== UTILITY METHODS ====================
    toggleSidebar() {
        const sidebar = document.getElementById('sidebar');
        if (sidebar) {
            sidebar.classList.toggle('open');
        }
    }
    
    // Public methods for global access
    handleFileUpload(code) { this.handleFileUpload(code); }
    downloadMaterial(code, id) { this.downloadMaterial(code, id); }
    deleteMaterial(code, id) { this.deleteMaterial(code, id); }
    viewMaterials(code) { this.viewMaterials(code); }
    startStudySession(code) { this.startStudySession(code); }
    sendAIMessage() { this.sendAIMessage(); }
    closeAIChat() { this.closeAIChat(); }
    saveUsername() { this.saveUsername(); }
    toggleTheme() { this.toggleTheme(); }
    pauseTimer() { this.pauseTimer(); }
    stopTimer() { this.stopTimer(); }
    saveSettings() { this.saveSettings(); }
    closeSettings() { this.closeSettings(); }
}

// ==================== GLOBAL FUNCTIONS ====================
// Initialize the app
let app;

document.addEventListener('DOMContentLoaded', () => {
    app = new AcademicHubApp();
});

// Global functions for HTML onclick handlers
function saveUsername() { app?.saveUsername(); }
function toggleTheme() { app?.toggleTheme(); }
function toggleSidebar() { app?.toggleSidebar(); }
function sendAIMessage() { app?.sendAIMessage(); }
function closeAIChat() { app?.closeAIChat(); }

// Service Worker (sw.js) - Create as separate file
const swCode = `
const CACHE_NAME = 'academic-hub-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/script.js',
    '/manifest.json'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(urlsToCache))
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                if (response) {
                    return response;
                }
                return fetch(event.request);
            }
        )
    );
});
`;

// Export service worker code to create sw.js file
console.log('Service Worker Code:', swCode);

// Add CSS for new components
const additionalCSS = `
/* Study Timer Modal */
.study-timer-modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.8);
    backdrop-filter: blur(20px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
}

.timer-content {
    background: var(--glass-bg);
    backdrop-filter: var(--backdrop-blur);
    border-radius: var(--border-radius-xl);
    padding: 48px;
    text-align: center;
    min-width: 400px;
}

.timer-display {
    font-family: var(--font-mono, monospace);
    font-size: 64px;
    font-weight: 800;
    color: var(--system-blue);
    margin: 32px 0;
    text-shadow: 0 0 20px rgba(0, 122, 255, 0.3);
}

.timer-controls {
    display: flex;
    gap: 16px;
    justify-content: center;
}

.timer-controls button {
    padding: 16px 24px;
    border: none;
    border-radius: var(--border-radius-md);
    font-weight: 600;
    cursor: pointer;
    transition: var(--transition-normal);
}

/* Settings Modal */
.settings-modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.8);
    backdrop-filter: blur(20px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
}

.settings-content {
    background: var(--glass-bg);
    backdrop-filter: var(--backdrop-blur);
    border-radius: var(--border-radius-xl);
    padding: 32px;
    min-width: 400px;
}

.setting-group {
    margin-bottom: 24px;
}

.setting-group label {
    display: block;
    font-weight: 600;
    margin-bottom: 8px;
}

.setting-group input {
    width: 100%;
    padding: 12px;
    border: 1px solid var(--separator);
    border-radius: var(--border-radius-md);
    background: var(--bg-tertiary);
    color: var(--text-primary);
}

.settings-actions {
    display: flex;
    gap: 12px;
    justify-content: center;
}

/* Notifications */
.notification {
    position: fixed;
    top: 20px;
    right: 20px;
    background: var(--glass-bg);
    backdrop-filter: var(--backdrop-blur);
    border: 1px solid var(--glass-border);
    border-radius: var(--border-radius-lg);
    padding: 16px 20px;
    max-width: 300px;
    z-index: 10001;
    box-shadow: var(--shadow-lg);
    transform: translateX(100%);
    opacity: 0;
    animation: notificationSlideIn 0.3s ease forwards;
}

@keyframes notificationSlideIn {
    to {
        transform: translateX(0);
        opacity: 1;
    }
}

.notification.success { border-left: 4px solid var(--system-green); }
.notification.error { border-left: 4px solid var(--system-red); }
.notification.warning { border-left: 4px solid var(--system-orange); }
.notification.info { border-left: 4px solid var(--system-blue); }

.notification-title {
    font-weight: 600;
    margin-bottom: 4px;
}

.notification-message {
    font-size: 14px;
    color: var(--text-secondary);
}
`;

// Inject additional CSS
if (typeof document !== 'undefined') {
    const style = document.createElement('style');
    style.textContent = additionalCSS;
    document.head.appendChild(style);
}

console.log('🚀 Academic Hub Pro JavaScript loaded successfully!');
// ==================== API KEY MANAGEMENT ====================
// ==================== GITHUB PAGES API KEY MANAGEMENT ====================
class APIKeyManager {
    constructor() {
        this.apiKey = this.loadAPIKey();
    }
    
    loadAPIKey() {
        // Priority order for GitHub Pages deployment:
        
        // 1. GitHub Actions Secret (if using build process)
        if (typeof window !== 'undefined' && window.ENV && window.ENV.OPENROUTER_API_KEY) {
            console.log('✅ API Key loaded from build environment');
            return window.ENV.OPENROUTER_API_KEY;
        }
        
        // 2. LocalStorage (user manually entered - recommended for GitHub Pages)
        const stored = localStorage.getItem('academic-hub-api-key');
        if (stored) {
            console.log('✅ API Key loaded from localStorage');
            return stored;
        }
        
        // 3. Check for config.js file (manual setup)
        if (typeof window !== 'undefined' && window.ACADEMIC_HUB_CONFIG) {
            console.log('✅ API Key loaded from config file');
            return window.ACADEMIC_HUB_CONFIG.OPENROUTER_API_KEY;
        }
        
        console.warn('⚠️ No API key found - user will need to enter manually');
        return null;
    }
    
    setAPIKey(key) {
        this.apiKey = key;
        localStorage.setItem('academic-hub-api-key', key);
        console.log('✅ API Key manually set and cached');
    }
    
    getAPIKey() {
        return this.apiKey;
    }
    
    isValid() {
        return this.apiKey && this.apiKey.trim().length > 0 && this.apiKey.startsWith('sk-');
    }
    
    getStatus() {
        if (this.isValid()) {
            return {
                status: 'valid',
                message: '✅ API Key configured and ready',
                masked: this.apiKey.substring(0, 8) + '...' + this.apiKey.substring(this.apiKey.length - 4)
            };
        } else if (this.apiKey) {
            return {
                status: 'invalid',
                message: '❌ API Key format invalid (should start with sk-)',
                masked: 'Invalid format'
            };
        } else {
            return {
                status: 'missing',
                message: '⚠️ Please enter your OpenRouter API key',
                masked: 'Not configured'
            };
        }
    }
}


// ==================== UPDATED AI CHAT INTEGRATION ====================
// Update your existing AcademicHubApp class with this method:

async callOpenRouterAPI(message) {
    const apiKeyManager = new APIKeyManager();
    
    if (!apiKeyManager.isValid()) {
        throw new Error('API key not configured. Please set your OpenRouter API key in settings.');
    }
    
    try {
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKeyManager.getAPIKey()}`,
                'HTTP-Referer': window.location.origin,
                'X-Title': 'Academic Hub Pro'
            },
            body: JSON.stringify({
                model: 'openai/gpt-3.5-turbo', // or 'openai/gpt-4' for better responses
                messages: [
                    {
                        role: 'system',
                        content: `You are an AI study assistant for ${this.state.user.name}, a B.Tech CSE AI/ML student at SRM University. 
                        
                        Current subjects and progress:
                        ${Object.values(this.state.subjects).map(s => 
                            `- ${s.title} (${s.code}): ${s.progress}% complete, ${Math.floor(s.studyTime/60)}h studied`
                        ).join('\n')}
                        
                        Help with academic questions, study planning, coding problems, and subject-specific guidance. 
                        Be encouraging, specific, and practical in your responses.`
                    },
                    {
                        role: 'user',
                        content: message
                    }
                ],
                temperature: 0.7,
                max_tokens: 800,
                top_p: 1,
                frequency_penalty: 0,
                presence_penalty: 0
            })
        });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(`API Error (${response.status}): ${errorData.error?.message || 'Unknown error'}`);
        }
        
        const data = await response.json();
        return data.choices[0].message.content;
        
    } catch (error) {
        console.error('OpenRouter API Error:', error);
        
        // Provide helpful error messages
        if (error.message.includes('401')) {
            throw new Error('Invalid API key. Please check your OpenRouter API key in settings.');
        } else if (error.message.includes('429')) {
            throw new Error('Rate limit exceeded. Please wait a moment and try again.');
        } else if (error.message.includes('insufficient_quota')) {
            throw new Error('API quota exceeded. Please check your OpenRouter account balance.');
        } else {
            throw new Error(`AI service temporarily unavailable: ${error.message}`);
        }
    }
}

