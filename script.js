// Academic Hub - Complete and Fixed Implementation
class AcademicHub {
    constructor() {
        // Initialize data storage
        this.storage = {
            materials: JSON.parse(localStorage.getItem('academic_hub_materials') || '[]'),
            assignments: JSON.parse(localStorage.getItem('academic_hub_assignments') || '[]'),
            sessions: JSON.parse(localStorage.getItem('academic_hub_sessions') || '[]'),
            alarms: JSON.parse(localStorage.getItem('academic_hub_alarms') || '[]'),
            notifications: JSON.parse(localStorage.getItem('academic_hub_notifications') || '[]'),
            settings: JSON.parse(localStorage.getItem('academic_hub_settings') || '{"theme": "dark", "language": "en", "autoSave": true}'),
            progress: JSON.parse(localStorage.getItem('academic_hub_progress') || '{}')
        };

        // Timer state
        this.timer = {
            isRunning: false,
            startTime: null,
            elapsedTime: 0,
            interval: null,
            currentSubject: null,
            targetDuration: 25 * 60 * 1000, // Default to 25-minute Pomodoro
            isBreakTime: false,
            breakDuration: 5 * 60 * 1000,
            goalReached: false
        };

        // Application state
        this.app = {
            currentFile: null,
            currentModal: null,
            searchIndex: [],
            isOnline: navigator.onLine,
            lastSync: new Date().toISOString(),
            version: '2.1.0'
        };

        // Initialize
        this.init();
    }

    init() {
        try {
            this.setupEventListeners();
            this.setupNavigation();
            this.setupTheme();
            this.setupSearch();
            this.setupFileUpload();
            this.setupTimer();
            this.setupNotifications();
            this.setupAlarms();
            this.setupKeyboardShortcuts();
            this.updateAllDisplays();
            this.updateGreeting();
            this.buildSearchIndex();
        } catch (error) {
            this.handleError(error, 'initialization');
        }
    }

    // Event Listeners
    setupEventListeners() {
        try {
            // Navigation
            document.querySelectorAll('.nav-link').forEach(link => {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.showSection(link.dataset.section);
                    this.updateActiveNav(link);
                });
            });

            // Header buttons
            const themeBtn = document.getElementById('themeBtn');
            if (themeBtn) themeBtn.addEventListener('click', () => this.toggleTheme());

            const notificationBtn = document.getElementById('notificationBtn');
            if (notificationBtn) notificationBtn.addEventListener('click', () => this.toggleNotificationPanel());

            const syncBtn = document.getElementById('syncBtn');
            if (syncBtn) syncBtn.addEventListener('click', () => this.syncData());

            const alarmBtn = document.getElementById('alarmBtn');
            if (alarmBtn) alarmBtn.addEventListener('click', () => this.showSection('alarms'));

            // Assignment filters
            document.querySelectorAll('.filter-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    this.filterAssignments(btn.dataset.filter);
                    this.updateActiveFilter(btn);
                });
            });

            // Subject filter
            const subjectFilter = document.getElementById('subjectFilter');
            if (subjectFilter) subjectFilter.addEventListener('change', (e) => this.filterMaterials(e.target.value));

            // Modal close
            document.querySelectorAll('.modal-close').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const modal = e.target.closest('.modal');
                    this.hideModal(modal.id);
                });
            });

            // Click outside modal
            document.querySelectorAll('.modal').forEach(modal => {
                modal.addEventListener('click', (e) => {
                    if (e.target === modal) this.hideModal(modal.id);
                });
            });

            // Window events
            window.addEventListener('online', () => this.app.isOnline = true);
            window.addEventListener('offline', () => this.app.isOnline = false);
        } catch (error) {
            this.handleError(error, 'setup_event_listeners');
        }
    }

    // Navigation
    setupNavigation() {
        this.showSection('dashboard');
    }

    showSection(sectionName) {
        try {
            document.querySelectorAll('.content-section').forEach(section => {
                section.classList.remove('active');
                section.style.opacity = '0';
            });

            const targetSection = document.getElementById(sectionName);
            if (targetSection) {
                targetSection.classList.add('active');
                targetSection.style.opacity = '1';
            }

            document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
            const activeLink = document.querySelector(`[data-section="${sectionName}"]`);
            if (activeLink) activeLink.classList.add('active');

            setTimeout(() => this.updateSectionContent(sectionName), 100);
        } catch (error) {
            this.handleError(error, 'show_section');
        }
    }

    updateSectionContent(sectionName) {
        try {
            switch (sectionName) {
                case 'dashboard':
                    this.updateDashboard();
                    break;
                case 'materials':
                    this.updateMaterialsDisplay();
                    this.setupFileUpload();
                    break;
                case 'assignments':
                    this.updateAssignmentsDisplay();
                    break;
                case 'progress':
                    this.updateProgressDisplay();
                    break;
                case 'alarms':
                    this.updateAlarmsDisplay();
                    break;
                case 'timer':
                    this.updateTodaySessions();
                    break;
            }
        } catch (error) {
            this.handleError(error, 'update_section_content');
        }
    }

    updateActiveNav(activeLink) {
        document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
        activeLink.classList.add('active');
    }

    // Theme Management
    setupTheme() {
        const savedTheme = this.storage.settings.theme || 'dark';
        this.applyTheme(savedTheme);
    }

    toggleTheme() {
        const newTheme = document.body.classList.contains('light-theme') ? 'dark' : 'light';
        this.applyTheme(newTheme);
        this.storage.settings.theme = newTheme;
        this.saveSettings();
        this.showToast(`Switched to ${newTheme} theme`, 'info');
    }

    applyTheme(theme) {
        const themeBtn = document.getElementById('themeBtn');
        document.body.classList.toggle('light-theme', theme === 'light');
        if (themeBtn) themeBtn.textContent = theme === 'light' ? '☀️' : '🌙';
    }

    // Search Functionality
    setupSearch() {
        const searchInput = document.getElementById('globalSearch');
        const searchResults = document.querySelector('.search-results');
        if (!searchInput || !searchResults) return;

        let searchTimeout;
        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            const query = e.target.value.trim();
            if (!query) {
                searchResults.classList.remove('show');
                return;
            }
            searchTimeout = setTimeout(() => this.performSearch(query), 300);
        });

        searchInput.addEventListener('focus', () => {
            if (searchInput.value.trim()) searchResults.classList.add('show');
        });

        document.addEventListener('click', (e) => {
            if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
                searchResults.classList.remove('show');
            }
        });
    }

    buildSearchIndex() {
        this.app.searchIndex = [];

        // Index materials
        this.storage.materials.forEach(material => {
            this.app.searchIndex.push({
                type: 'material',
                id: material.id,
                title: material.name,
                subtitle: this.getSubjectName(material.subject),
                keywords: [material.name, material.subject, this.getSubjectName(material.subject)]
            });
        });

        // Index assignments
        this.storage.assignments.forEach(assignment => {
            this.app.searchIndex.push({
                type: 'assignment',
                id: assignment.id,
                title: assignment.title,
                subtitle: this.getSubjectName(assignment.subject),
                keywords: [assignment.title, assignment.subject, this.getSubjectName(assignment.subject)]
            });
        });

        // Index subjects
        this.getSubjectsList().forEach(subject => {
            this.app.searchIndex.push({
                type: 'subject',
                id: subject.id,
                title: subject.name,
                subtitle: subject.code,
                keywords: [subject.name, subject.code, subject.id]
            });
        });
    }

    performSearch(query) {
        const results = this.app.searchIndex
            .filter(item => item.keywords.some(keyword => keyword.toLowerCase().includes(query.toLowerCase())))
            .slice(0, 5);
        this.displaySearchResults(results);
    }

    displaySearchResults(results) {
        const searchResults = document.querySelector('.search-results');
        searchResults.innerHTML = results.length === 0
            ? '<div class="search-result-item">No results found</div>'
            : results.map(result => `
                <div class="search-result-item" onclick="academicHub.handleSearchResult('${result.type}', '${result.id}')">
                    <div class="search-result-title">${result.title}</div>
                    <div class="search-result-subtitle">${result.subtitle}</div>
                </div>
            `).join('');
        searchResults.classList.add('show');
    }

    handleSearchResult(type, id) {
        document.querySelector('.search-results').classList.remove('show');
        switch (type) {
            case 'material':
                this.showSection('materials');
                break;
            case 'assignment':
                this.showSection('assignments');
                break;
            case 'subject':
                this.showSection('subjects');
                break;
        }
    }

    // File Management
    setupFileUpload() {
        const fileInput = document.getElementById('fileInput');
        const uploadArea = document.getElementById('uploadArea');
        if (!fileInput || !uploadArea) return;

        fileInput.onchange = null;
        uploadArea.onclick = null;
        uploadArea.ondragover = null;
        uploadArea.ondragleave = null;
        uploadArea.ondrop = null;

        fileInput.addEventListener('change', (e) => this.handleFiles(e.target.files));
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('dragover');
        });
        uploadArea.addEventListener('dragleave', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
        });
        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
            this.handleFiles(e.dataTransfer.files);
        });
        uploadArea.addEventListener('click', (e) => {
            if (e.target === uploadArea || e.target.classList.contains('upload-content') || 
                e.target.classList.contains('upload-icon') || e.target.tagName === 'H3' || e.target.tagName === 'P') {
                fileInput.click();
            }
        });
    }

    async handleFiles(files) {
        const uploadPromises = Array.from(files).map(file => this.addFile(file));
        await Promise.all(uploadPromises);
        this.updateMaterialsDisplay();
        this.updateStats();
        this.buildSearchIndex();
        this.showToast(`${files.length} file(s) uploaded successfully!`, 'success');
    }

    addFile(file) {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const fileData = {
                    id: Date.now() + Math.random(),
                    name: file.name,
                    size: file.size,
                    type: file.type,
                    subject: this.getDefaultSubject(),
                    uploadDate: new Date().toISOString(),
                    data: e.target.result
                };
                this.storage.materials.push(fileData);
                this.saveMaterials();
                resolve(fileData);
            };
            reader.readAsDataURL(file);
        });
    }

    updateMaterialsDisplay() {
        const grid = document.getElementById('materialsGrid');
        const fileCount = document.getElementById('fileCount');
        if (!grid) return;

        const filter = document.getElementById('subjectFilter')?.value || 'all';
        let materials = filter === 'all' ? this.storage.materials : this.storage.materials.filter(m => m.subject === filter);

        if (fileCount) fileCount.textContent = materials.length;

        grid.innerHTML = materials.length === 0
            ? `
                <div class="empty-state">
                    <div class="empty-icon">📚</div>
                    <h3>No materials found</h3>
                    <p>Upload some study materials to get started</p>
                </div>
            `
            : materials.map(file => this.createFileCard(file)).join('');
    }

    createFileCard(file) {
        const fileIcon = this.getFileIcon(file.type);
        const fileSize = this.formatFileSize(file.size);
        const uploadDate = new Date(file.uploadDate).toLocaleDateString();
        const subjectName = this.getSubjectName(file.subject);

        return `
            <div class="file-card" onclick="academicHub.previewFile('${file.id}')">
                <div class="file-header">
                    <div class="file-icon">${fileIcon}</div>
                    <div class="file-info">
                        <h4 title="${file.name}">${this.truncateText(file.name, 30)}</h4>
                        <div class="file-subject">${subjectName}</div>
                    </div>
                </div>
                <div class="file-meta">
                    <span>${fileSize}</span>
                    <span>${uploadDate}</span>
                </div>
                <div class="file-actions" onclick="event.stopPropagation()">
                    <button class="btn btn-outline btn-sm" onclick="academicHub.downloadFile('${file.id}')">Download</button>
                    <button class="btn btn-danger btn-sm" onclick="academicHub.deleteFile('${file.id}')">Delete</button>
                </div>
            </div>
        `;
    }

    previewFile(id) {
        const file = this.storage.materials.find(f => f.id == id);
        if (!file) return;

        this.app.currentFile = file;
        document.getElementById('modalFileName').textContent = file.name;
        const modalBody = document.getElementById('modalBody');
        if (file.type.includes('image')) {
            modalBody.innerHTML = `<img src="${file.data}" style="max-width: 100%; height: auto;" alt="${file.name}">`;
        } else {
            modalBody.innerHTML = `
                <div style="text-align: center; padding: 40px;">
                    <div style="font-size: 48px; margin-bottom: 16px;">${this.getFileIcon(file.type)}</div>
                    <h3>${file.name}</h3>
                    <p>Size: ${this.formatFileSize(file.size)}</p>
                    <p>Subject: ${this.getSubjectName(file.subject)}</p>
                    <p>Uploaded: ${new Date(file.uploadDate).toLocaleDateString()}</p>
                </div>
            `;
        }
        this.showModal('fileModal');
    }

    downloadFile(id) {
        const file = this.storage.materials.find(f => f.id == id);
        if (!file) return;

        const link = document.createElement('a');
        link.href = file.data;
        link.download = file.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        this.showToast(`${file.name} downloaded!`, 'success');
    }

    deleteFile(id) {
        if (confirm('Are you sure you want to delete this file?')) {
            this.storage.materials = this.storage.materials.filter(f => f.id != id);
            this.saveMaterials();
            this.updateMaterialsDisplay();
            this.updateStats();
            this.buildSearchIndex();
            this.showToast('File deleted successfully!', 'success');
        }
    }

    filterMaterials(subject) {
        this.updateMaterialsDisplay();
    }

    // Timer Functionality
    setupTimer() {
        const startBtn = document.getElementById('startTimer');
        const pauseBtn = document.getElementById('pauseTimer');
        const resetBtn = document.getElementById('resetTimer');

        if (startBtn) startBtn.addEventListener('click', () => this.startTimer());
        if (pauseBtn) pauseBtn.addEventListener('click', () => this.pauseTimer());
        if (resetBtn) resetBtn.addEventListener('click', () => this.resetTimer());

        this.updateTimerDisplay();
    }

    startTimer() {
        if (!this.timer.isRunning) {
            const subjectSelect = document.getElementById('timerSubject');
            this.timer.currentSubject = subjectSelect ? subjectSelect.value : 'general';
            this.timer.startTime = Date.now() - this.timer.elapsedTime;
            this.timer.isRunning = true;
            this.timer.interval = setInterval(() => {
                this.timer.elapsedTime = Date.now() - this.timer.startTime;
                this.updateTimerDisplay();
                this.checkTimerGoals();
            }, 1000);
            this.updateTimerButtons();
            this.showToast('Timer started!', 'success');
        }
    }

    pauseTimer() {
        if (this.timer.isRunning) {
            clearInterval(this.timer.interval);
            this.timer.isRunning = false;
            this.saveStudySession();
            this.updateTimerButtons();
            this.showToast('Timer paused and session saved!', 'info');
        }
    }

    resetTimer() {
        clearInterval(this.timer.interval);
        this.timer.isRunning = false;
        this.timer.elapsedTime = 0;
        this.timer.startTime = null;
        this.timer.currentSubject = null;
        this.timer.goalReached = false;
        this.updateTimerDisplay();
        this.updateTimerButtons();
        this.showToast('Timer reset!', 'info');
    }

    updateTimerDisplay() {
        const timerDisplay = document.getElementById('timerDisplay');
        if (timerDisplay) {
            timerDisplay.textContent = this.formatTime(this.timer.elapsedTime);
        }
        const timerCircle = document.querySelector('.timer-circle');
        if (timerCircle) {
            timerCircle.classList.toggle('active', this.timer.isRunning);
        }
    }

    updateTimerButtons() {
        const startBtn = document.getElementById('startTimer');
        const pauseBtn = document.getElementById('pauseTimer');
        const resetBtn = document.getElementById('resetTimer');

        if (startBtn) startBtn.disabled = this.timer.isRunning;
        if (pauseBtn) pauseBtn.disabled = !this.timer.isRunning;
        if (resetBtn) resetBtn.disabled = false;
    }

    checkTimerGoals() {
        if (this.timer.targetDuration > 0 && this.timer.elapsedTime >= this.timer.targetDuration && !this.timer.goalReached) {
            this.timer.goalReached = true;
            this.showTimerCompletionNotification();
            this.pauseTimer();
            if (this.timer.breakDuration > 0) {
                this.suggestBreak();
            }
        }
    }

    showTimerCompletionNotification() {
        if (Notification.permission === 'granted') {
            new Notification('Study Session Complete!', {
                body: `You've completed your ${Math.round(this.timer.targetDuration / 60000)}-minute study session.`,
                icon: 'icon-192.png'
            });
        }
        this.showToast('🎉 Study session completed!', 'success');
    }

    suggestBreak() {
        const breakMinutes = Math.round(this.timer.breakDuration / 60000);
        if (confirm(`Great job! Take a ${breakMinutes}-minute break?`)) {
            this.startBreakTimer();
        }
    }

    startBreakTimer() {
        this.timer.isBreakTime = true;
        this.timer.elapsedTime = 0;
        this.timer.targetDuration = this.timer.breakDuration;
        this.startTimer();
        this.showToast(`Break time! ${Math.round(this.timer.breakDuration / 60000)} minutes`, 'info');
    }

    saveStudySession() {
        if (this.timer.elapsedTime > 0 && this.timer.currentSubject) {
            const session = {
                id: Date.now(),
                subject: this.timer.currentSubject,
                duration: this.timer.elapsedTime,
                date: new Date().toISOString(),
                endTime: new Date().toISOString(),
                type: this.timer.isBreakTime ? 'break' : 'study'
            };
            this.storage.sessions.push(session);
            this.saveSessions();
            this.updateStats();
            this.updateTodaySessions();
        }
    }

    updateTodaySessions() {
        const sessionsList = document.getElementById('sessionsList');
        if (!sessionsList) return;

        const today = new Date().toDateString();
        const todaySessions = this.storage.sessions.filter(session => 
            new Date(session.date).toDateString() === today
        );

        sessionsList.innerHTML = todaySessions.length === 0
            ? `
                <div class="empty-state">
                    <p>No study sessions today</p>
                    <small>Start a timer to track your study time</small>
                </div>
            `
            : todaySessions.map(session => `
                <div class="session-item">
                    <div class="session-subject">${this.getSubjectName(session.subject)}</div>
                    <div class="session-duration">${this.formatTime(session.duration)}</div>
                    <div class="session-time">${new Date(session.endTime).toLocaleTimeString()}</div>
                </div>
            `).join('');
    }

    // Assignment Management
    updateAssignmentsDisplay() {
        const assignmentsList = document.getElementById('assignmentsList');
        if (!assignmentsList) return;

        if (this.storage.assignments.length === 0) {
            assignmentsList.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">📝</div>
                    <h3>No assignments yet</h3>
                    <p>Add your first assignment to get started</p>
                </div>
            `;
            return;
        }

        assignmentsList.innerHTML = this.storage.assignments.map(assignment => 
            this.createAssignmentCard(assignment)
        ).join('');
    }

    createAssignmentCard(assignment) {
        const dueDate = new Date(assignment.dueDate);
        const isOverdue = dueDate < new Date() && !assignment.completed;
        const dueDateFormatted = dueDate.toLocaleDateString();

        return `
            <div class="assignment-card ${assignment.completed ? 'completed' : ''} ${isOverdue ? 'overdue' : ''}">
                <div class="assignment-header">
                    <h4>${assignment.title}</h4>
                    <div class="assignment-subject">${this.getSubjectName(assignment.subject)}</div>
                </div>
                <div class="assignment-content">
                    <p>${assignment.description || 'No description provided'}</p>
                    <div class="assignment-meta">
                        <span class="due-date">Due: ${dueDateFormatted}</span>
                        <span class="status ${assignment.completed ? 'completed' : (isOverdue ? 'overdue' : 'pending')}">
                            ${assignment.completed ? 'Completed' : (isOverdue ? 'Overdue' : 'Pending')}
                        </span>
                    </div>
                </div>
                <div class="assignment-actions">
                    <button class="btn btn-outline btn-sm" onclick="academicHub.toggleAssignmentStatus('${assignment.id}')">
                        ${assignment.completed ? 'Mark Incomplete' : 'Mark Complete'}
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="academicHub.deleteAssignment('${assignment.id}')">
                        Delete
                    </button>
                </div>
            </div>
        `;
    }

    toggleAssignmentStatus(id) {
        const assignment = this.storage.assignments.find(a => a.id == id);
        if (assignment) {
            assignment.completed = !assignment.completed;
            assignment.completedDate = assignment.completed ? new Date().toISOString() : null;
            this.saveAssignments();
            this.updateAssignmentsDisplay();
            this.updateStats();
            this.showToast(`Assignment ${assignment.completed ? 'completed' : 'marked as pending'}!`, 'success');
        }
    }

    deleteAssignment(id) {
        if (confirm('Are you sure you want to delete this assignment?')) {
            this.storage.assignments = this.storage.assignments.filter(a => a.id != id);
            this.saveAssignments();
            this.updateAssignmentsDisplay();
            this.updateStats();
            this.buildSearchIndex();
            this.showToast('Assignment deleted!', 'success');
        }
    }

    filterAssignments(filter) {
        const assignmentsList = document.getElementById('assignmentsList');
        if (!assignmentsList) return;

        let filtered;
        switch (filter) {
            case 'pending':
                filtered = this.storage.assignments.filter(a => !a.completed && new Date(a.dueDate) >= new Date());
                break;
            case 'completed':
                filtered = this.storage.assignments.filter(a => a.completed);
                break;
            case 'overdue':
                filtered = this.storage.assignments.filter(a => !a.completed && new Date(a.dueDate) < new Date());
                break;
            default:
                filtered = this.storage.assignments;
        }

        assignmentsList.innerHTML = filtered.length === 0
            ? `
                <div class="empty-state">
                    <div class="empty-icon">📝</div>
                    <h3>No assignments found</h3>
                    <p>No assignments match the current filter</p>
                </div>
            `
            : filtered.map(assignment => this.createAssignmentCard(assignment)).join('');
    }

    updateActiveFilter(activeBtn) {
        document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
        activeBtn.classList.add('active');
    }

    // Notifications
    setupNotifications() {
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
        this.checkUpcomingDeadlines();
        setInterval(() => this.checkUpcomingDeadlines(), 60000);
    }

    checkUpcomingDeadlines() {
        const now = new Date();
        const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

        this.storage.assignments.forEach(assignment => {
            if (!assignment.completed && !assignment.notified) {
                const dueDate = new Date(assignment.dueDate);
                if (dueDate <= tomorrow && dueDate > now) {
                    this.addNotification({
                        type: 'deadline',
                        title: 'Assignment Due Soon',
                        message: `${assignment.title} is due ${dueDate.toLocaleDateString()}`,
                        timestamp: new Date().toISOString(),
                        read: false
                    });
                    assignment.notified = true;
                    this.saveAssignments();
                }
            }
        });
    }

    addNotification(notification) {
        notification.id = Date.now();
        this.storage.notifications.unshift(notification);
        this.storage.notifications = this.storage.notifications.slice(0, 50);
        this.saveNotifications();
        this.updateNotificationBadge();
    }

    updateNotificationBadge() {
        const badge = document.getElementById('notificationBadge');
        if (badge) {
            const unreadCount = this.storage.notifications.filter(n => !n.read).length;
            badge.textContent = unreadCount;
            badge.style.display = unreadCount > 0 ? 'block' : 'none';
        }
    }

    toggleNotificationPanel() {
        const panel = document.getElementById('notificationPanel');
        if (panel) {
            panel.classList.toggle('show');
            this.updateNotificationsDisplay();
        }
    }

    updateNotificationsDisplay() {
        const notificationsList = document.getElementById('notificationsList');
        if (!notificationsList) return;

        notificationsList.innerHTML = this.storage.notifications.length === 0
            ? '<div class="empty-state"><p>No notifications</p></div>'
            : this.storage.notifications.map(notification => `
                <div class="notification-item ${notification.read ? 'read' : 'unread'}" onclick="academicHub.markNotificationRead('${notification.id}')">
                    <div class="notification-content">
                        <h4>${notification.title}</h4>
                        <p>${notification.message}</p>
                        <span class="notification-time">${this.formatRelativeTime(notification.timestamp)}</span>
                    </div>
                </div>
            `).join('');
    }

    markNotificationRead(id) {
        const notification = this.storage.notifications.find(n => n.id == id);
        if (notification && !notification.read) {
            notification.read = true;
            this.saveNotifications();
            this.updateNotificationBadge();
            this.updateNotificationsDisplay();
        }
    }

    clearAllNotifications() {
        this.storage.notifications = [];
        this.saveNotifications();
        this.updateNotificationBadge();
        this.updateNotificationsDisplay();
        this.showToast('All notifications cleared!', 'info');
    }

    // Alarms Management
    setupAlarms() {
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
        setInterval(() => this.checkStudyReminders(), 60000);
    }

    checkStudyReminders() {
        const now = new Date();
        const currentDay = now.toLocaleDateString('en', { weekday: 'short' }).toLowerCase();
        const currentTime = now.toTimeString().slice(0, 5);

        this.storage.alarms.forEach(alarm => {
            if (alarm.active && alarm.days.includes(currentDay)) {
                if (currentTime === alarm.time && !alarm.triggeredToday) {
                    this.triggerAlarm(alarm);
                    alarm.triggeredToday = true;
                    this.saveAlarms();
                }
            }
        });

        if (currentTime === '00:00') {
            this.storage.alarms.forEach(alarm => alarm.triggeredToday = false);
            this.saveAlarms();
        }
    }

    triggerAlarm(alarm) {
        this.addNotification({
            type: 'alarm',
            title: 'Study Reminder',
            message: alarm.name,
            timestamp: new Date().toISOString(),
            read: false
        });

        if (Notification.permission === 'granted') {
            new Notification('Study Reminder', {
                body: alarm.name,
                icon: 'icon-192.png'
            });
        }
        this.showToast(`⏰ ${alarm.name}`, 'info');
    }

    updateAlarmsDisplay() {
        const alarmsList = document.getElementById('alarmsList');
        if (!alarmsList) return;

        alarmsList.innerHTML = this.storage.alarms.length === 0
            ? `
                <div class="empty-state">
                    <div class="empty-icon">⏰</div>
                    <h3>No alarms set</h3>
                    <p>Set study alarms to stay on track</p>
                </div>
            `
            : this.storage.alarms.map(alarm => this.createAlarmCard(alarm)).join('');
    }

    createAlarmCard(alarm) {
        const daysText = alarm.days.map(day => day.charAt(0).toUpperCase() + day.slice(1)).join(', ');
        return `
            <div class="alarm-card ${alarm.active ? 'active' : 'inactive'}">
                <div class="alarm-header">
                    <h4>${alarm.name}</h4>
                    <div class="alarm-toggle">
                        <label class="switch">
                            <input type="checkbox" ${alarm.active ? 'checked' : ''} onchange="academicHub.toggleAlarm('${alarm.id}')">
                            <span class="slider"></span>
                        </label>
                    </div>
                </div>
                <div class="alarm-content">
                    <div class="alarm-time">${this.formatTime12Hour(alarm.time)}</div>
                    <div class="alarm-days">${daysText}</div>
                    ${alarm.subject ? `<div class="alarm-subject">${this.getSubjectName(alarm.subject)}</div>` : ''}
                </div>
                <div class="alarm-actions">
                    <button class="btn btn-outline btn-sm" onclick="academicHub.editAlarm('${alarm.id}')">Edit</button>
                    <button class="btn btn-danger btn-sm" onclick="academicHub.deleteAlarm('${alarm.id}')">Delete</button>
                </div>
            </div>
        `;
    }

    toggleAlarm(id) {
        const alarm = this.storage.alarms.find(a => a.id == id);
        if (alarm) {
            alarm.active = !alarm.active;
            this.saveAlarms();
            this.updateAlarmsDisplay();
            this.showToast(`Alarm ${alarm.active ? 'enabled' : 'disabled'}!`, 'success');
        }
    }

    editAlarm(id) {
        const alarm = this.storage.alarms.find(a => a.id == id);
        if (alarm) {
            document.getElementById('alarmName').value = alarm.name;
            document.getElementById('alarmTime').value = alarm.time;
            document.getElementById('alarmSubject').value = alarm.subject || '';
            document.querySelectorAll('.day-option input').forEach(cb => {
                cb.checked = alarm.days.includes(cb.value);
            });
            this.showModal('alarmModal');
        }
    }

    deleteAlarm(id) {
        if (confirm('Are you sure you want to delete this alarm?')) {
            this.storage.alarms = this.storage.alarms.filter(a => a.id != id);
            this.saveAlarms();
            this.updateAlarmsDisplay();
            this.showToast('Alarm deleted!', 'success');
        }
    }

    // Progress Analytics
    updateProgressDisplay() {
        this.updateProgressStats();
        this.createProgressCharts();
    }

    updateProgressStats() {
        const weeklyHours = this.calculateWeeklyHours();
        const monthlyHours = this.calculateMonthlyHours();
        const dailyAverage = this.calculateDailyAverage();
        const goalProgress = this.calculateGoalProgress();

        const elements = {
            weeklyHours: document.getElementById('weeklyHours'),
            monthlyHours: document.getElementById('monthlyHours'),
            dailyAverage: document.getElementById('dailyAverage'),
            goalProgress: document.getElementById('goalProgress')
        };

        if (elements.weeklyHours) elements.weeklyHours.textContent = this.formatTime(weeklyHours);
        if (elements.monthlyHours) elements.monthlyHours.textContent = this.formatTime(monthlyHours);
        if (elements.dailyAverage) elements.dailyAverage.textContent = this.formatTime(dailyAverage);
        if (elements.goalProgress) elements.goalProgress.textContent = `${goalProgress}%`;
    }

    calculateWeeklyHours() {
        const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        return this.storage.sessions
            .filter(session => new Date(session.date) >= oneWeekAgo)
            .reduce((total, session) => total + session.duration, 0);
    }

    calculateMonthlyHours() {
        const oneMonthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        return this.storage.sessions
            .filter(session => new Date(session.date) >= oneMonthAgo)
            .reduce((total, session) => total + session.duration, 0);
    }

    calculateDailyAverage() {
        return this.calculateWeeklyHours() / 7;
    }

    calculateGoalProgress() {
        const weeklyGoal = 20 * 60 * 60 * 1000;
        const weeklyHours = this.calculateWeeklyHours();
        return Math.min(Math.round((weeklyHours / weeklyGoal) * 100), 100);
    }

    createProgressCharts() {
        if (typeof Chart === 'undefined') return;
        this.createWeeklyChart();
        this.createSubjectChart();
    }

    createWeeklyChart() {
        const canvas = document.getElementById('weeklyChart');
        if (!canvas) return;

        const days = [];
        const hours = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
            const dayName = date.toLocaleDateString('en', { weekday: 'short' });
            const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
            const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);

            const dayHours = this.storage.sessions
                .filter(session => {
                    const sessionDate = new Date(session.date);
                    return sessionDate >= dayStart && sessionDate < dayEnd;
                })
                .reduce((total, session) => total + session.duration, 0) / (60 * 60 * 1000);

            days.push(dayName);
            hours.push(dayHours);
        }

        ```chartjs
        {
            type: 'bar',
            data: {
                labels: days,
                datasets: [{
                    label: 'Study Hours',
                    data: hours,
                    backgroundColor: '#667eea',
                    borderColor: '#4c51bf',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Hours'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Day'
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        }
