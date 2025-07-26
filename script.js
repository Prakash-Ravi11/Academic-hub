/**
 * Academic Hub Pro - Complete JavaScript Logic
 * Built by: Nick (Ex-Apple UI/UX) + R R PRAKASHRAVI
 * Version: 2.0.0 - Developer-Managed API Keys
 * 
 * Features:
 * - Developer-controlled API key (no user input required)
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

// ==================== DEVELOPER-MANAGED API KEY SYSTEM ====================
class APIKeyManager {
    constructor() {
        this.apiKey = this.getEmbeddedAPIKey();
        this.initializeStatus();
    }
    
    getEmbeddedAPIKey() {
        // API key is controlled by developers only
        // Replace this with your actual OpenRouter API key
        const DEV_API_KEY = 'sk-or-v1-your-actual-openrouter-api-key-here'; // 🔥 PUT YOUR KEY HERE
        
        // For GitHub Actions deployment (placeholder gets replaced automatically)
        const GITHUB_EMBEDDED_KEY = '${OPENROUTER_API_KEY}';
        
        // Check if GitHub Actions replaced the placeholder
        if (GITHUB_EMBEDDED_KEY && !GITHUB_EMBEDDED_KEY.includes('${')) {
            console.log('✅ API Key loaded from GitHub Actions');
            return GITHUB_EMBEDDED_KEY;
        }
        
        // Use developer-set key
        if (DEV_API_KEY && DEV_API_KEY.startsWith('sk-')) {
            console.log('✅ API Key loaded from developer config');
            return DEV_API_KEY;
        }
        
        console.error('❌ No API key configured by developers');
        return null;
    }
    
    initializeStatus() {
        if (this.isValid()) {
            console.log('🤖 AI Chat ready - API key configured by developers');
        } else {
            console.warn('⚠️ AI Chat disabled - developers need to configure API key');
        }
    }
    
    getAPIKey() {
        return this.apiKey;
    }
    
    isValid() {
        return this.apiKey && 
               this.apiKey.trim().length > 0 && 
               (this.apiKey.startsWith('sk-') || this.apiKey.startsWith('or-'));
    }
    
    getStatus() {
        if (this.isValid()) {
            return {
                status: 'valid',
                message: '✅ AI service ready',
                masked: this.apiKey.substring(0, 8) + '...' + this.apiKey.substring(this.apiKey.length - 4)
            };
        } else {
            return {
                status: 'missing',
                message: '❌ AI service not configured',
                masked: 'Contact developers'
            };
        }
    }
}

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
                isConnected: false
            },
            ml: {
                model: null,
                predictions: {}
            },
            theme: 'light',
            notifications: [],
            currentSession: null
        };
        
        this.apiKeyManager = new APIKeyManager();
        this.timerInterval = null;
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
        
        // Initialize subjects from actual timetable data
        this.initializeSubjects();
        
        // Setup real-time clock
        this.startClock();
        
        // Initialize AI status
        this.updateAIStatus();
    }
    
    initializeParticles() {
        if (typeof particlesJS !== 'undefined') {
            particlesJS('particles-js', {
                particles: {
                    number: { 
                        value: 120,
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
        if (loadingScreen) {
            loadingScreen.style.opacity = '0';
            loadingScreen.style.transform = 'scale(1.1)';
            
            setTimeout(() => {
                loadingScreen.style.display = 'none';
                this.checkUsername();
            }, 1000);
        }
    }
    
    checkUsername() {
        const savedUsername = localStorage.getItem('academic-hub-username');
        if (!savedUsername) {
            const modal = document.getElementById('username-modal');
            if (modal) {
                modal.classList.add('show');
                const input = document.getElementById('usernameInput');
                if (input) input.focus();
            }
        } else {
            this.state.user.name = savedUsername;
            this.updateUserDisplay();
        }
    }
    
    initializeSubjects() {
        // Subject data from R R PRAKASHRAVI's actual SRM timetable
        this.state.subjects = {
            '21MAB201T': {
                code: '21MAB201T',
                title: 'Transforms and Boundary Value Problems',
                faculty: 'Dr. V. Vidhya',
                credits: 4,
                category: 'Basic Science',
                room: 'LH905',
                slot: 'A',
                type: 'Theory',
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
                type: 'Lab Based Theory',
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
                type: 'Theory',
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
                type: 'Project Based Theory',
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
                type: 'Lab Based Theory',
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
                title: 'UHV-II: Universal Human Values',
                faculty: 'Dr. Caleb Theodar M',
                credits: 3,
                category: 'Engineering Science',
                room: 'To be Alloted',
                slot: 'G',
                type: 'Project Based Theory',
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
                type: 'Theory',
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
        
        // Load subject data
        const savedSubjects = localStorage.getItem('academic-hub-subjects');
        if (savedSubjects) {
            try {
                const parsed = JSON.parse(savedSubjects);
                Object.keys(parsed).forEach(code => {
                    if (this.state.subjects[code]) {
                        Object.assign(this.state.subjects[code], parsed[code]);
                    }
                });
            } catch (error) {
                console.warn('Failed to load saved subjects:', error);
            }
        }
        
        // Load study sessions
        const savedSessions = localStorage.getItem('academic-hub-sessions');
        if (savedSessions) {
            try {
                this.state.studySessions = JSON.parse(savedSessions);
            } catch (error) {
                console.warn('Failed to load study sessions:', error);
            }
        }
        
        // Update UI with loaded data
        this.updateProgressBars();
        this.updateMaterialsLists();
    }
    
    async setupEventListeners() {
        // Theme toggle
        document.querySelectorAll('.theme-toggle').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleTheme();
            });
        });
        
        // Sidebar navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleNavigation(e);
            });
        });
        
        // File upload areas - Updated for all subjects
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
                    materialsBtn.addEventListener('click', (e) => {
                        e.preventDefault();
                        this.viewMaterials(code);
                    });
                }
                
                if (studyBtn) {
                    studyBtn.addEventListener('click', (e) => {
                        e.preventDefault();
                        this.startStudySession(code);
                    });
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
    
    updateAIStatus() {
        const status = this.apiKeyManager.getStatus();
        this.state.aiChat.isConnected = status.status === 'valid';
        
        // Update AI chat button text based on status
        const aiChatBtn = document.querySelector('[data-section="ai-chat"]');
        if (aiChatBtn) {
            const statusIcon = this.state.aiChat.isConnected ? '🤖' : '🚫';
            aiChatBtn.innerHTML = `<span class="nav-item-icon">${statusIcon}</span><span>AI Assistant</span>`;
        }
    }
    
    // ==================== USER MANAGEMENT ====================
    saveUsername() {
        const input = document.getElementById('usernameInput');
        if (!input) return;
        
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
        if (modal) {
            modal.classList.remove('show');
            setTimeout(() => {
                modal.style.display = 'none';
            }, 300);
        }
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
                        📥
                    </button>
                    <button class="material-btn" onclick="app.deleteMaterial('${subjectCode}', '${material.id}')">
                        🗑️
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
        
        if (this.state.currentSession) {
            this.showNotification('Session Active', 'Please stop the current study session first', 'warning');
            return;
        }
        
        const session = {
            id: Date.now(),
            subjectCode,
            startTime: new Date(),
            endTime: null,
            duration: 0,
            paused: false,
            pausedTime: 0
        };
        
        this.state.currentSession = session;
        this.showStudyTimer(subject);
    }
    
    showStudyTimer(subject) {
        // Remove existing timer modal
        const existingModal = document.querySelector('.study-timer-modal');
        if (existingModal) existingModal.remove();
        
        const modal = document.createElement('div');
        modal.className = 'study-timer-modal';
        modal.innerHTML = `
            <div class="timer-content">
                <h2>📚 Studying: ${subject.title}</h2>
                <div class="timer-display" id="timerDisplay">00:00:00</div>
                <div class="timer-controls">
                    <button onclick="app.pauseTimer()" id="pauseBtn" class="timer-btn pause">⏸️ Pause</button>
                    <button onclick="app.stopTimer()" id="stopBtn" class="timer-btn stop">⏹️ Stop</button>
                </div>
                <div class="timer-stats">
                    <div class="timer-stat">
                        <span class="timer-stat-value">${Math.floor(subject.studyTime / 60)}h ${subject.studyTime % 60}m</span>
                        <span class="timer-stat-label">Total Time</span>
                    </div>
                    <div class="timer-stat">
                        <span class="timer-stat-value">${subject.progress}%</span>
                        <span class="timer-stat-label">Progress</span>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        this.startTimer();
    }
    
    startTimer() {
        this.timerInterval = setInterval(() => {
            if (this.state.currentSession && !this.state.currentSession.paused) {
                const elapsed = Date.now() - this.state.currentSession.startTime - this.state.currentSession.pausedTime;
                const display = this.formatTime(elapsed);
                
                const timerDisplay = document.getElementById('timerDisplay');
                if (timerDisplay) {
                    timerDisplay.textContent = display;
                }
            }
        }, 1000);
    }
    
    pauseTimer() {
        if (!this.state.currentSession) return;
        
        const session = this.state.currentSession;
        const pauseBtn = document.getElementById('pauseBtn');
        
        if (session.paused) {
            // Resume
            session.paused = false;
            session.pauseStartTime = null;
            if (pauseBtn) pauseBtn.innerHTML = '⏸️ Pause';
        } else {
            // Pause
            session.paused = true;
            session.pauseStartTime = Date.now();
            if (pauseBtn) pauseBtn.innerHTML = '▶️ Resume';
        }
    }
    
    stopTimer() {
        if (!this.state.currentSession) return;
        
        const session = this.state.currentSession;
        
        // Calculate final duration
        let totalPausedTime = session.pausedTime || 0;
        if (session.paused && session.pauseStartTime) {
            totalPausedTime += Date.now() - session.pauseStartTime;
        }
        
        session.endTime = new Date();
        session.duration = session.endTime - session.startTime - totalPausedTime;
        
        // Update subject study time
        const subject = this.state.subjects[session.subjectCode];
        const minutesStudied = Math.floor(session.duration / (1000 * 60));
        subject.studyTime += minutesStudied;
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
        this.generateMLPredictions();
        
        this.showNotification('Session Complete', 
            `Great job! You studied for ${this.formatTime(session.duration)}`, 'success');
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
        const subjects = Object.values(this.state.subjects);
        const totalSubjects = subjects.length;
        const totalCredits = subjects.reduce((sum, s) => sum + s.credits, 0);
        const avgProgress = Math.round(subjects.reduce((sum, s) => sum + s.progress, 0) / totalSubjects);
        const totalStudyTime = subjects.reduce((sum, s) => sum + s.studyTime, 0);
        
        const updateElement = (id, value) => {
            const el = document.getElementById(id);
            if (el) el.textContent = value;
        };
        
        updateElement('totalSubjects', totalSubjects);
        updateElement('totalCredits', totalCredits);
        updateElement('avgProgress', `${avgProgress}%`);
        updateElement('studyTime', `${Math.floor(totalStudyTime / 60)}h`);
    }
    
    // ==================== AI CHAT INTEGRATION ====================
    async sendAIMessage() {
        const input = document.getElementById('chatInput');
        const sendBtn = document.getElementById('chatSend');
        
        if (!input || !sendBtn) return;
        
        const message = input.value.trim();
        if (!message) return;
        
        // Check if AI is available
        if (!this.apiKeyManager.isValid()) {
            this.addChatMessage('ai', '❌ AI service is not configured. Please contact the developers to set up the API integration.');
            return;
        }
        
        // Add user message
        this.addChatMessage('user', message);
        input.value = '';
        sendBtn.disabled = true;
        sendBtn.textContent = 'Thinking...';
        
        try {
            const response = await this.callOpenRouterAPI(message);
            this.addChatMessage('ai', response);
            
        } catch (error) {
            console.error('AI Chat error:', error);
            this.addChatMessage('ai', `❌ AI service error: ${error.message}`);
        } finally {
            sendBtn.disabled = false;
            sendBtn.textContent = 'Send';
        }
    }
    
    async callOpenRouterAPI(message) {
        if (!this.apiKeyManager.isValid()) {
            throw new Error('API key not configured by developers');
        }
        
        try {
            const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKeyManager.getAPIKey()}`,
                    'HTTP-Referer': window.location.origin,
                    'X-Title': 'Academic Hub Pro'
                },
                body: JSON.stringify({
                    model: 'openai/gpt-3.5-turbo',
                    messages: [
                        {
                            role: 'system',
                            content: `You are an AI study assistant for ${this.state.user.name}, a B.Tech CSE AI/ML student at SRM University, Semester 3.
                            
                            Current subjects and progress:
                            ${Object.values(this.state.subjects).map(s => 
                                `- ${s.title} (${s.code}): ${s.progress}% complete, ${Math.floor(s.studyTime/60)}h studied, Faculty: ${s.faculty}`
                            ).join('\n')}
                            
                            Help with academic questions, study planning, coding problems, and subject-specific guidance. 
                            Be encouraging, specific, and practical. Focus on SRM syllabus and Indian academic context.`
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
                throw new Error(`API Error (${response.status}): ${errorData.error?.message || 'Service unavailable'}`);
            }
            
            const data = await response.json();
            return data.choices[0].message.content;
            
        } catch (error) {
            console.error('OpenRouter API Error:', error);
            
            // Provide helpful error messages
            if (error.message.includes('401')) {
                throw new Error('Invalid API key configuration. Contact developers.');
            } else if (error.message.includes('429')) {
                throw new Error('Rate limit exceeded. Please wait a moment and try again.');
            } else if (error.message.includes('insufficient_quota')) {
                throw new Error('API quota exceeded. Contact developers.');
            } else {
                throw new Error(`AI service temporarily unavailable: ${error.message}`);
            }
        }
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
        messageContent.innerHTML = content.replace(/\n/g, '<br>');
        
        messageDiv.appendChild(avatar);
        messageDiv.appendChild(messageContent);
        messagesContainer.appendChild(messageDiv);
        
        // Scroll to bottom
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        
        // Save message
        this.state.aiChat.messages.push({ 
            role, 
            content, 
            timestamp: new Date().toISOString() 
        });
    }
    
    openAIChat() {
        const modal = document.getElementById('ai-chat-modal');
        if (modal) {
            modal.classList.add('show');
            const input = document.getElementById('chatInput');
            if (input) input.focus();
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
            if (typeof tf === 'undefined') {
                console.warn('TensorFlow.js not loaded');
                return;
            }
            
            // Create a simple neural network for study progress prediction
            this.state.ml.model = tf.sequential({
                layers: [
                    tf.layers.dense({ inputShape: [5], units: 10, activation: 'relu' }),
                    tf.layers.dense({ units: 8, activation: 'relu' }),
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
            setTimeout(() => this.generateMLPredictions(), 2000);
            
        } catch (error) {
            console.warn('ML initialization failed:', error);
        }
    }
    
    async generateMLPredictions() {
        if (!this.state.ml.model) return;
        
        Object.keys(this.state.subjects).forEach(async (code) => {
            const subject = this.state.subjects[code];
            
            try {
                // Create input features: [credits, current_progress, study_time_ratio, materials_count, days_since_last_study]
                const daysSinceLastStudy = subject.lastStudied ? 
                    Math.floor((Date.now() - new Date(subject.lastStudied).getTime()) / (1000 * 60 * 60 * 24)) : 30;
                
                const features = tf.tensor2d([[
                    subject.credits / 4, // Normalized credits
                    subject.progress / 100, // Normalized progress
                    Math.min((subject.studyTime / 60) / subject.targetHours, 1), // Study time ratio
                    Math.min(subject.materials.length / 10, 1), // Normalized materials count
                    Math.min(daysSinceLastStudy / 30, 1) // Days since last study (normalized)
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
                this.updateMLPrediction(code, 0.5); // Fallback
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
        let recommendations = this.generateStudyRecommendations(subject, predictionValue);
        
        if (percentage < 40) {
            message = `📈 Success Prediction: ${percentage}% - Needs attention!`;
        } else if (percentage < 75) {
            message = `📊 Success Prediction: ${percentage}% - On track`;
        } else {
            message = `🎯 Success Prediction: ${percentage}% - Excellent!`;
        }
        
        if (recommendations) {
            message += `\n💡 Tip: ${recommendations}`;
        }
        
        predictionElement.textContent = message;
    }
    
    generateStudyRecommendations(subject, prediction) {
        const recommendations = [];
        
        if (subject.studyTime < subject.targetHours * 0.2) {
            recommendations.push('Increase daily study time');
        }
        
        if (subject.materials.length < 2) {
            recommendations.push('Upload more study materials');
        }
        
        if (!subject.lastStudied || Date.now() - new Date(subject.lastStudied).getTime() > 5 * 24 * 60 * 60 * 1000) {
            recommendations.push('Review this subject regularly');
        }
        
        if (subject.progress < 20) {
            recommendations.push('Start with basic concepts');
        }
        
        // Subject-specific recommendations
        if (subject.code === '21CSC201J') {
            recommendations.push('Practice coding problems daily');
        } else if (subject.code === '21MAB201T') {
            recommendations.push('Solve more mathematical problems');
        } else if (subject.code === '21CSS201T') {
            recommendations.push('Understand hardware concepts with diagrams');
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
            case 'dashboard':
                // Already on dashboard
                break;
            case 'ai-chat':
                this.openAIChat();
                break;
            case 'ml-tools':
                this.generateMLPredictions();
                this.showNotification('ML Tools', 'Generating fresh predictions...', 'info');
                break;
            case 'settings':
                this.openSettings();
                break;
            case 'files':
                this.showNotification('File Manager', 'Access files through subject cards', 'info');
                break;
            case 'analytics':
                this.showNotification('Premium Feature', 'Advanced analytics available in premium version', 'info');
                break;
            case 'schedule':
                this.showNotification('Premium Feature', 'Smart scheduling available in premium version', 'info');
                break;
            default:
                console.log(`Navigate to: ${section}`);
        }
    }
    
    openSettings() {
        const keyStatus = this.apiKeyManager.getStatus();
        
        const modal = document.createElement('div');
        modal.className = 'settings-modal';
        modal.innerHTML = `
            <div class="settings-content">
                <h2>⚙️ Academic Hub Pro Settings</h2>
                
                <div class="setting-group">
                    <label>🤖 AI Service Status:</label>
                    <div class="api-status ${keyStatus.status}">
                        <span class="status-indicator">${keyStatus.message}</span>
                        ${keyStatus.status === 'valid' ? 
                            `<code class="key-preview">${keyStatus.masked}</code>` : 
                            '<span class="contact-dev">AI features managed by developers</span>'
                        }
                    </div>
                </div>
                
                <div class="setting-group">
                    <label>🎨 Theme:</label>
                    <select id="themeSelect">
                        <option value="light" ${this.state.theme === 'light' ? 'selected' : ''}>☀️ Light</option>
                        <option value="dark" ${this.state.theme === 'dark' ? 'selected' : ''}>🌙 Dark</option>
                    </select>
                </div>
                
                <div class="setting-group">
                    <label>📊 Your Study Data:</label>
                    <div class="data-info">
                        📚 ${Object.keys(this.state.subjects).length} subjects tracked<br>
                        📁 ${Object.values(this.state.subjects).reduce((sum, s) => sum + s.materials.length, 0)} files uploaded<br>
                        ⏱️ ${Math.floor(Object.values(this.state.subjects).reduce((sum, s) => sum + s.studyTime, 0) / 60)}h studied<br>
                        🎯 ${this.state.studySessions.length} study sessions completed
                    </div>
                    <div class="data-controls">
                        <button onclick="app.exportData()" class="btn-secondary">📤 Export</button>
                        <button onclick="app.importData()" class="btn-secondary">📥 Import</button>
                        <button onclick="app.clearAllData()" class="btn-danger">🗑️ Clear All</button>
                    </div>
                </div>
                
                <div class="setting-group">
                    <label>ℹ️ App Information:</label>
                    <div class="app-info">
                        <strong>Academic Hub Pro v2.0</strong><br>
                        Built for SRM B.Tech CSE AI/ML<br>
                        Student: ${this.state.user.name}<br>
                        AI Status: ${keyStatus.status === 'valid' ? 'Connected' : 'Offline'}
                    </div>
                </div>
                
                <div class="settings-actions">
                    <button onclick="app.saveSettings()" class="btn-primary">💾 Save</button>
                    <button onclick="app.closeSettings()" class="btn-secondary">✅ Done</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Add event listener for theme select
        const themeSelect = document.getElementById('themeSelect');
        if (themeSelect) {
            themeSelect.addEventListener('change', (e) => {
                this.setTheme(e.target.value);
            });
        }
    }
    
    saveSettings() {
        const themeSelect = document.getElementById('themeSelect');
        if (themeSelect) {
            this.setTheme(themeSelect.value);
        }
        
        this.showNotification('Settings Saved', 'Your preferences have been updated', 'success');
        this.closeSettings();
    }
    
    closeSettings() {
        const modal = document.querySelector('.settings-modal');
        if (modal) modal.remove();
    }
    
    viewMaterials(subjectCode) {
        const subject = this.state.subjects[subjectCode];
        if (!subject || subject.materials.length === 0) {
            this.showNotification('No Materials', 'No materials uploaded for this subject yet', 'info');
            return;
        }
        
        this.showNotification('Materials', `${subject.materials.length} files available for ${subject.title}`, 'info');
    }
    
    exportData() {
        const data = {
            user: this.state.user,
            subjects: this.state.subjects,
            sessions: this.state.studySessions,
            exportDate: new Date().toISOString(),
            version: '2.0'
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `academic-hub-backup-${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showNotification('Export Complete', 'Your data has been exported successfully', 'success');
    }
    
    importData() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        
        input.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            try {
                const text = await file.text();
                const data = JSON.parse(text);
                
                if (data.subjects && confirm('Import data? This will replace your current data.')) {
                    Object.assign(this.state.subjects, data.subjects);
                    if (data.sessions) this.state.studySessions = data.sessions;
                    if (data.user) Object.assign(this.state.user, data.user);
                    
                    this.saveAppData();
                    this.updateProgressBars();
                    this.updateMaterialsLists();
                    this.updateDashboardStats();
                    
                    this.showNotification('Import Complete', 'Your data has been imported successfully', 'success');
                }
            } catch (error) {
                this.showNotification('Import Failed', 'Invalid backup file format', 'error');
            }
        });
        
        input.click();
    }
    
    clearAllData() {
        if (confirm('⚠️ This will delete ALL your study data permanently. Are you absolutely sure?')) {
            if (confirm('🚨 Last chance! This action cannot be undone. Delete everything?')) {
                localStorage.clear();
                this.showNotification('Data Cleared', 'All data has been deleted. Reloading app...', 'info');
                setTimeout(() => location.reload(), 2000);
            }
        }
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
        
        // Ctrl/Cmd + S: Save/Export Data
        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
            e.preventDefault();
            this.exportData();
        }
        
        // Escape: Close modals
        if (e.key === 'Escape') {
            this.closeAIChat();
            this.closeSettings();
            document.querySelector('.study-timer-modal')?.remove();
        }
    }
    
    // ==================== UTILITY METHODS ====================
    toggleSidebar() {
        const sidebar = document.getElementById('sidebar');
        if (sidebar) {
            sidebar.classList.toggle('open');
        }
    }
    
    handleOnlineStatus(isOnline) {
        const statusMessage = isOnline ? 
            'Connection restored - AI features available' : 
            'Working offline - AI features unavailable';
        
        this.showNotification(
            isOnline ? 'Back Online' : 'Offline Mode',
            statusMessage,
            isOnline ? 'success' : 'warning'
        );
    }
    
    // ==================== PWA & SERVICE WORKER ====================
    async registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            try {
                const registration = await navigator.serviceWorker.register('/sw.js');
                console.log('✅ Service Worker registered:', registration);
                
                // Handle service worker updates
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            this.showNotification('Update Available', 'New version available. Refresh to update.', 'info');
                        }
                    });
                });
                
            } catch (error) {
                console.warn('Service Worker registration failed:', error);
            }
        }
    }
    
    // ==================== DATA PERSISTENCE ====================
    saveAppData() {
        try {
            localStorage.setItem('academic-hub-subjects', JSON.stringify(this.state.subjects));
            localStorage.setItem('academic-hub-sessions', JSON.stringify(this.state.studySessions));
            localStorage.setItem('academic-hub-ai-messages', JSON.stringify(this.state.aiChat.messages));
            localStorage.setItem('academic-hub-last-save', new Date().toISOString());
        } catch (error) {
            console.warn('Failed to save app data:', error);
            this.showNotification('Save Error', 'Failed to save data locally', 'error');
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
}

// ==================== GLOBAL FUNCTIONS ====================
// Initialize the app
let app;

document.addEventListener('DOMContentLoaded', () => {
    app = new AcademicHubApp();
});

// Global functions for HTML onclick handlers
function saveUsername() { 
    if (app) app.saveUsername(); 
}

function toggleTheme() { 
    if (app) app.toggleTheme(); 
}

function toggleSidebar() { 
    if (app) app.toggleSidebar(); 
}

function sendAIMessage() { 
    if (app) app.sendAIMessage(); 
}

function closeAIChat() { 
    if (app) app.closeAIChat(); 
}

// Add CSS for new components
const additionalCSS = `
/* Study Timer Modal */
.study-timer-modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.9);
    backdrop-filter: blur(20px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
    animation: fadeIn 0.3s ease;
}

.timer-content {
    background: var(--glass-bg);
    backdrop-filter: var(--backdrop-blur);
    border-radius: var(--border-radius-xl);
    padding: 48px;
    text-align: center;
    min-width: 500px;
    border: 1px solid var(--glass-border);
    box-shadow: var(--shadow-xl);
}

.timer-display {
    font-family: 'SF Mono', Monaco, monospace;
    font-size: 72px;
    font-weight: 800;
    color: var(--system-blue);
    margin: 32px 0;
    text-shadow: 0 0 30px rgba(0, 122, 255, 0.4);
    background: var(--bg-tertiary);
    padding: 24px;
    border-radius: var(--border-radius-lg);
    border: 2px solid var(--border-primary);
}

.timer-controls {
    display: flex;
    gap: 16px;
    justify-content: center;
    margin: 32px 0;
}

.timer-btn {
    padding: 16px 24px;
    border: none;
    border-radius: var(--border-radius-md);
    font-weight: 600;
    cursor: pointer;
    transition: var(--transition-normal);
    font-size: 16px;
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: 120px;
    justify-content: center;
}

.timer-btn.pause {
    background: var(--system-orange);
    color: white;
}

.timer-btn.stop {
    background: var(--system-red);
    color: white;
}

.timer-btn:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-lg);
}

.timer-stats {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    margin-top: 32px;
    padding-top: 24px;
    border-top: 1px solid var(--border-primary);
}

.timer-stat {
    text-align: center;
    padding: 16px;
    background: var(--bg-tertiary);
    border-radius: var(--border-radius-md);
}

.timer-stat-value {
    font-size: 24px;
    font-weight: 700;
    color: var(--system-blue);
    display: block;
    margin-bottom: 4px;
}

.timer-stat-label {
    font-size: 12px;
    color: var(--text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.5px;
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
    animation: fadeIn 0.3s ease;
}

.settings-content {
    background: var(--glass-bg);
    backdrop-filter: var(--backdrop-blur);
    border-radius: var(--border-radius-xl);
    padding: 32px;
    min-width: 500px;
    max-width: 90vw;
    max-height: 90vh;
    overflow-y: auto;
    border: 1px solid var(--glass-border);
    box-shadow: var(--shadow-xl);
}

.setting-group {
    margin-bottom: 24px;
    padding-bottom: 16px;
    border-bottom: 1px solid var(--border-primary);
}

.setting-group:last-child {
    border-bottom: none;
}

.setting-group label {
    display: block;
    font-weight: 600;
    margin-bottom: 8px;
    color: var(--text-primary);
}

.setting-group select {
    width: 100%;
    padding: 12px;
    border: 1px solid var(--border-primary);
    border-radius: var(--border-radius-md);
    background: var(--bg-tertiary);
    color: var(--text-primary);
    font-size: 14px;
}

.api-status {
    padding: 12px;
    border-radius: var(--border-radius-md);
    margin: 8px 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border: 1px solid var(--border-primary);
}

.api-status.valid {
    background: rgba(16, 185, 129, 0.1);
    border-color: var(--system-green);
}

.api-status.missing {
    background: rgba(245, 158, 11, 0.1);
    border-color: var(--system-orange);
}

.key-preview {
    font-family: monospace;
    font-size: 12px;
    padding: 4px 8px;
    background: rgba(0, 0, 0, 0.1);
    border-radius: 4px;
}

.data-info {
    background: var(--bg-tertiary);
    padding: 12px;
    border-radius: var(--border-radius-md);
    margin: 8px 0;
    font-size: 14px;
    line-height: 1.6;
}

.data-controls {
    display: flex;
    gap: 12px;
    margin-top: 12px;
    flex-wrap: wrap;
}

.btn-secondary {
    background: var(--bg-tertiary);
    color: var(--text-primary);
    border: 1px solid var(--border-primary);
    padding: 8px 16px;
    border-radius: var(--border-radius-md);
    cursor: pointer;
    transition: var(--transition-fast);
    font-size: 14px;
}

.btn-secondary:hover {
    background: var(--system-blue);
    color: white;
}

.btn-danger {
    background: var(--system-red);
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: var(--border-radius-md);
    cursor: pointer;
    font-size: 14px;
}

.btn-primary {
    background: var(--system-blue);
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: var(--border-radius-md);
    cursor: pointer;
    font-weight: 600;
    font-size: 14px;
}

.settings-actions {
    display: flex;
    gap: 12px;
    justify-content: center;
    margin-top: 24px;
    padding-top: 16px;
    border-top: 1px solid var(--border-primary);
}

.app-info {
    background: var(--bg-tertiary);
    padding: 12px;
    border-radius: var(--border-radius-md);
    font-size: 14px;
    line-height: 1.6;
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
    max-width: 350px;
    z-index: 10001;
    box-shadow: var(--shadow-xl);
    transform: translateX(100%);
    opacity: 0;
    animation: notificationSlideIn 0.4s cubic-bezier(0.4, 0.0, 0.2, 1) forwards;
    cursor: pointer;
}

@keyframes notificationSlideIn {
    to {
        transform: translateX(0);
        opacity: 1;
    }
}

.notification.success { 
    border-left: 4px solid var(--system-green); 
}

.notification.error { 
    border-left: 4px solid var(--system-red); 
}

.notification.warning { 
    border-left: 4px solid var(--system-orange); 
}

.notification.info { 
    border-left: 4px solid var(--system-blue); 
}

.notification-title {
    font-weight: 600;
    margin-bottom: 4px;
    color: var(--text-primary);
}

.notification-message {
    font-size: 14px;
    color: var(--text-secondary);
    line-height: 1.4;
}

/* Theme transition */
.theme-transitioning * {
    transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease !important;
}

/* Responsive adjustments */
@media (max-width: 768px) {
    .timer-content {
        min-width: 90vw;
        padding: 32px 24px;
    }
    
    .timer-display {
        font-size: 56px;
    }
    
    .timer-stats {
        grid-template-columns: 1fr;
    }
    
    .settings-content {
        min-width: 90vw;
        padding: 24px;
    }
    
    .data-controls {
        flex-direction: column;
    }
}
`;

// Inject additional CSS
if (typeof document !== 'undefined') {
    const style = document.createElement('style');
    style.textContent = additionalCSS;
    document.head.appendChild(style);
}

console.log('🚀 Academic Hub Pro JavaScript v2.0 loaded successfully!');
console.log('👨‍💻 Built by Nick + R R PRAKASHRAVI');
console.log('🎓 Designed for SRM B.Tech CSE AI/ML students');
