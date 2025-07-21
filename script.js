// Academic Hub - Complete Implementation
class AcademicHub {
    constructor() {
        // Initialize data storage
        this.storage = {
            materials: JSON.parse(localStorage.getItem('academic_hub_materials') || '[]'),
            assignments: JSON.parse(localStorage.getItem('academic_hub_assignments') || '[]'),
            sessions: JSON.parse(localStorage.getItem('academic_hub_sessions') || '[]'),
            alarms: JSON.parse(localStorage.getItem('academic_hub_alarms') || '[]'),
            progress: JSON.parse(localStorage.getItem('academic_hub_progress') || '{}'),
            notifications: JSON.parse(localStorage.getItem('academic_hub_notifications') || '[]'),
            settings: JSON.parse(localStorage.getItem('academic_hub_settings') || '{"theme": "dark"}')
        };

        // Timer state
        this.timer = {
            isRunning: false,
            startTime: null,
            elapsedTime: 0,
            interval: null,
            currentSubject: null
        };

        // Current file for preview
        this.currentFile = null;

        // Search index
        this.searchIndex = [];

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupNavigation();
        this.setupTheme();
        this.setupSearch();
        this.setupFileUpload();
        this.setupTimer();
        this.setupNotifications();
        this.setupAlarms();
        this.updateAllDisplays();
        this.updateGreeting();
        this.buildSearchIndex();
    }

    // Event Listeners Setup
    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                this.showSection(link.dataset.section);
                this.updateActiveNav(link);
            });
        });

        // Theme toggle
        document.getElementById('themeBtn').addEventListener('click', () => {
            this.toggleTheme();
        });

        // Notification button
        document.getElementById('notificationBtn').addEventListener('click', () => {
            this.toggleNotificationPanel();
        });

        // Sync button
        document.getElementById('syncBtn').addEventListener('click', () => {
            this.syncData();
        });

        // Alarm button
        document.getElementById('alarmBtn').addEventListener('click', () => {
            this.showSection('alarms');
        });

        // Assignment filters
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.filterAssignments(btn.dataset.filter);
                this.updateActiveFilter(btn);
            });
        });

        // Subject filter for materials
        const subjectFilter = document.getElementById('subjectFilter');
        if (subjectFilter) {
            subjectFilter.addEventListener('change', (e) => {
                this.filterMaterials(e.target.value);
            });
        }

        // Modal close events
        document.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const modal = e.target.closest('.modal');
                this.hideModal(modal.id);
            });
        });

        // Click outside modal to close
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.hideModal(modal.id);
                }
            });
        });
    }

    // Navigation
    setupNavigation() {
        this.showSection('dashboard');
    }

    showSection(sectionName) {
        // Hide all sections
        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.remove('active');
        });

        // Show target section
        const targetSection = document.getElementById(sectionName);
        if (targetSection) {
            targetSection.classList.add('active');
        }

        // Update navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        const activeLink = document.querySelector(`[data-section="${sectionName}"]`);
        if (activeLink) {
            activeLink.classList.add('active');
        }

        // Update content based on section
        switch (sectionName) {
            case 'dashboard':
                this.updateDashboard();
                break;
            case 'materials':
                this.updateMaterialsDisplay();
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
        }
    }

    updateActiveNav(activeLink) {
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        activeLink.classList.add('active');
    }

    // Theme Management
    setupTheme() {
        const savedTheme = this.storage.settings.theme || 'dark';
        this.applyTheme(savedTheme);
    }

    toggleTheme() {
        const currentTheme = document.body.classList.contains('light-theme') ? 'light' : 'dark';
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        this.applyTheme(newTheme);
        this.storage.settings.theme = newTheme;
        this.saveSettings();
    }

    applyTheme(theme) {
        const themeBtn = document.getElementById('themeBtn');
        if (theme === 'light') {
            document.body.classList.add('light-theme');
            themeBtn.textContent = '☀️';
        } else {
            document.body.classList.remove('light-theme');
            themeBtn.textContent = '🌙';
        }
    }

    // Search Functionality
    setupSearch() {
        const searchInput = document.getElementById('globalSearch');
        const searchResults = document.querySelector('.search-results');

        if (searchInput && searchResults) {
            let searchTimeout;

            searchInput.addEventListener('input', (e) => {
                clearTimeout(searchTimeout);
                const query = e.target.value.trim();

                if (query.length === 0) {
                    searchResults.classList.remove('show');
                    return;
                }

                searchTimeout = setTimeout(() => {
                    this.performSearch(query);
                }, 300);
            });

            searchInput.addEventListener('focus', () => {
                if (searchInput.value.trim().length > 0) {
                    searchResults.classList.add('show');
                }
            });

            document.addEventListener('click', (e) => {
                if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
                    searchResults.classList.remove('show');
                }
            });
        }
    }

    buildSearchIndex() {
        this.searchIndex = [];

        // Index materials
        this.storage.materials.forEach(material => {
            this.searchIndex.push({
                type: 'material',
                title: material.name,
                subtitle: this.getSubjectName(material.subject),
                data: material,
                keywords: [material.name, material.subject, this.getSubjectName(material.subject)]
            });
        });

        // Index assignments
        this.storage.assignments.forEach(assignment => {
            this.searchIndex.push({
                type: 'assignment',
                title: assignment.title,
                subtitle: this.getSubjectName(assignment.subject),
                data: assignment,
                keywords: [assignment.title, assignment.subject, this.getSubjectName(assignment.subject)]
            });
        });

        // Index subjects
        const subjects = [
            { id: 'math', name: 'Transforms and Boundary Value Problems', code: '21MAB201T' },
            { id: 'dsa', name: 'Data Structures and Algorithms', code: '21CSC201J' },
            { id: 'coa', name: 'Computer Organization and Architecture', code: '21CSS201T' },
            { id: 'programming', name: 'Advanced Programming Practice', code: '21CSC203P' },
            { id: 'os', name: 'Operating Systems', code: '21CSC202J' },
            { id: 'uhv', name: 'Universal Human Values - II', code: '21LEM202T' },
            { id: 'ethics', name: 'Professional Ethics', code: '21LEM201T' }
        ];

        subjects.forEach(subject => {
            this.searchIndex.push({
                type: 'subject',
                title: subject.name,
                subtitle: subject.code,
                data: subject,
                keywords: [subject.name, subject.code, subject.id]
            });
        });
    }

    performSearch(query) {
        const results = this.searchIndex.filter(item => {
            return item.keywords.some(keyword => 
                keyword.toLowerCase().includes(query.toLowerCase())
            );
        }).slice(0, 5);

        this.displaySearchResults(results);
    }

    displaySearchResults(results) {
        const searchResults = document.querySelector('.search-results');
        
        if (results.length === 0) {
            searchResults.innerHTML = '<div class="search-result-item">No results found</div>';
        } else {
            searchResults.innerHTML = results.map(result => `
                <div class="search-result-item" onclick="academicHub.handleSearchResult('${result.type}', '${result.data.id || result.data.name}')">
                    <div class="search-result-title">${result.title}</div>
                    <div class="search-result-subtitle">${result.subtitle}</div>
                </div>
            `).join('');
        }

        searchResults.classList.add('show');
    }

    handleSearchResult(type, id) {
        const searchResults = document.querySelector('.search-results');
        searchResults.classList.remove('show');

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

        if (fileInput && uploadArea) {
            fileInput.addEventListener('change', (e) => {
                this.handleFiles(e.target.files);
            });

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
        }
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

    getDefaultSubject() {
        // You can implement logic to auto-detect subject based on filename
        return 'math'; // Default to math for now
    }

    updateMaterialsDisplay() {
        const grid = document.getElementById('materialsGrid');
        const fileCount = document.getElementById('fileCount');
        
        if (!grid) return;

        const filter = document.getElementById('subjectFilter')?.value || 'all';
        let materials = this.storage.materials;

        if (filter !== 'all') {
            materials = materials.filter(m => m.subject === filter);
        }

        if (fileCount) {
            fileCount.textContent = materials.length;
        }

        if (materials.length === 0) {
            grid.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">📚</div>
                    <h3>No materials found</h3>
                    <p>Upload some study materials to get started</p>
                </div>
            `;
            return;
        }

        grid.innerHTML = materials.map(file => this.createFileCard(file)).join('');
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

        this.currentFile = file;
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

        if (startBtn) {
            startBtn.addEventListener('click', () => this.startTimer());
        }
        if (pauseBtn) {
            pauseBtn.addEventListener('click', () => this.pauseTimer());
        }
        if (resetBtn) {
            resetBtn.addEventListener('click', () => this.resetTimer());
        }

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
            }, 1000);

            this.updateTimerButtons();
            this.showToast('Timer started!', 'success');
        }
    }

    pauseTimer() {
        if (this.timer.isRunning) {
            clearInterval(this.timer.interval);
            this.timer.isRunning = false;
            
            // Save session
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
        
        this.updateTimerDisplay();
        this.updateTimerButtons();
        this.showToast('Timer reset!', 'info');
    }

    updateTimerDisplay() {
        const timerDisplay = document.getElementById('timerDisplay');
        if (timerDisplay) {
            const time = this.formatTime(this.timer.elapsedTime);
            timerDisplay.textContent = time;
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

    saveStudySession() {
        if (this.timer.elapsedTime > 0 && this.timer.currentSubject) {
            const session = {
                id: Date.now(),
                subject: this.timer.currentSubject,
                duration: this.timer.elapsedTime,
                date: new Date().toISOString(),
                endTime: new Date().toISOString()
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

        if (todaySessions.length === 0) {
            sessionsList.innerHTML = `
                <div class="empty-state">
                    <p>No study sessions today</p>
                    <small>Start a timer to track your study time</small>
                </div>
            `;
            return;
        }

        sessionsList.innerHTML = todaySessions.map(session => `
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
            
            const status = assignment.completed ? 'completed' : 'marked as pending';
            this.showToast(`Assignment ${status}!`, 'success');
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
        // Implementation for filtering assignments
        const assignments = this.storage.assignments;
        let filtered;

        switch (filter) {
            case 'pending':
                filtered = assignments.filter(a => !a.completed && new Date(a.dueDate) >= new Date());
                break;
            case 'completed':
                filtered = assignments.filter(a => a.completed);
                break;
            case 'overdue':
                filtered = assignments.filter(a => !a.completed && new Date(a.dueDate) < new Date());
                break;
            default:
                filtered = assignments;
        }

        // Update display with filtered assignments
        this.displayFilteredAssignments(filtered);
    }

    displayFilteredAssignments(assignments) {
        const assignmentsList = document.getElementById('assignmentsList');
        if (!assignmentsList) return;

        if (assignments.length === 0) {
            assignmentsList.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">📝</div>
                    <h3>No assignments found</h3>
                    <p>No assignments match the current filter</p>
                </div>
            `;
            return;
        }

        assignmentsList.innerHTML = assignments.map(assignment => 
            this.createAssignmentCard(assignment)
        ).join('');
    }

    updateActiveFilter(activeBtn) {
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        activeBtn.classList.add('active');
    }

    // Notifications
    setupNotifications() {
        this.checkUpcomingDeadlines();
        this.checkStudyReminders();
        
        // Check every minute
        setInterval(() => {
            this.checkUpcomingDeadlines();
            this.checkStudyReminders();
        }, 60000);
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

    checkStudyReminders() {
        // Check if any alarms should trigger
        const now = new Date();
        const currentDay = now.toLocaleDateString('en', { weekday: 'short' }).toLowerCase();
        const currentTime = now.toTimeString().slice(0, 5); // HH:MM format

        this.storage.alarms.forEach(alarm => {
            if (alarm.active && alarm.days.includes(currentDay)) {
                const alarmTime = alarm.time;
                const timeDiff = Math.abs(new Date(`1970/01/01 ${currentTime}`) - new Date(`1970/01/01 ${alarmTime}`));
                
                // If within 1 minute of alarm time and not already triggered today
                if (timeDiff < 60000 && !alarm.triggeredToday) {
                    this.triggerAlarm(alarm);
                    alarm.triggeredToday = true;
                    this.saveAlarms();
                }
            }
        });

        // Reset triggered flags at midnight
        if (currentTime === '00:00') {
            this.storage.alarms.forEach(alarm => {
                alarm.triggeredToday = false;
            });
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

        // Browser notification if permission granted
        if (Notification.permission === 'granted') {
            new Notification('Study Reminder', {
                body: alarm.name,
                icon: 'icon-192.png'
            });
        }

        this.showToast(`⏰ ${alarm.name}`, 'info');
    }

    addNotification(notification) {
        notification.id = Date.now();
        this.storage.notifications.unshift(notification);
        
        // Keep only last 50 notifications
        this.storage.notifications = this.storage.notifications.slice(0, 50);
        
        this.saveNotifications();
        this.updateNotificationBadge();
    }

    updateNotificationBadge() {
        const badge = document.getElementById('notificationBadge');
        const unreadCount = this.storage.notifications.filter(n => !n.read).length;
        
        if (badge) {
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

        if (this.storage.notifications.length === 0) {
            notificationsList.innerHTML = '<div class="empty-state"><p>No notifications</p></div>';
            return;
        }

        notificationsList.innerHTML = this.storage.notifications.map(notification => `
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
        // Request notification permission
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }

    updateAlarmsDisplay() {
        const alarmsList = document.getElementById('alarmsList');
        if (!alarmsList) return;

        if (this.storage.alarms.length === 0) {
            alarmsList.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">⏰</div>
                    <h3>No alarms set</h3>
                    <p>Set study alarms to stay on track</p>
                </div>
            `;
            return;
        }

        alarmsList.innerHTML = this.storage.alarms.map(alarm => 
            this.createAlarmCard(alarm)
        ).join('');
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
            
            const status = alarm.active ? 'enabled' : 'disabled';
            this.showToast(`Alarm ${status}!`, 'success');
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
        const weeklyHours = this.calculateWeeklyHours();
        return weeklyHours / 7;
    }

    calculateGoalProgress() {
        const weeklyGoal = 20 * 60 * 60 * 1000; // 20 hours in milliseconds
        const weeklyHours = this.calculateWeeklyHours();
        return Math.min(Math.round((weeklyHours / weeklyGoal) * 100), 100);
    }

    createProgressCharts() {
        this.createWeeklyChart();
        this.createSubjectChart();
    }

    createWeeklyChart() {
        const canvas = document.getElementById('weeklyChart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        
        // Get data for the last 7 days
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
                .reduce((total, session) => total + session.duration, 0) / (60 * 60 * 1000); // Convert to hours
            
            days.push(dayName);
            hours.push(dayHours);
        }

        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: days,
                datasets: [{
                    label: 'Study Hours',
                    data: hours,
                    backgroundColor: 'rgba(0, 122, 255, 0.8)',
                    borderColor: 'rgba(0, 122, 255, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    createSubjectChart() {
        const canvas = document.getElementById('subjectChart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        
        // Calculate time spent per subject
        const subjectTime = {};
        this.storage.sessions.forEach(session => {
            if (!subjectTime[session.subject]) {
                subjectTime[session.subject] = 0;
            }
            subjectTime[session.subject] += session.duration;
        });

        const subjects = Object.keys(subjectTime);
        const times = subjects.map(subject => subjectTime[subject] / (60 * 60 * 1000)); // Convert to hours
        const colors = [
            '#667eea', '#43e97b', '#4facfe', '#f093fb', 
            '#fa709a', '#a8edea', '#ffecd2'
        ];

        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: subjects.map(subject => this.getSubjectName(subject)),
                datasets: [{
                    data: times,
                    backgroundColor: colors.slice(0, subjects.length),
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }

    // Dashboard
    updateDashboard() {
        this.updateDashboardStats();
        this.updateRecentActivity();
        this.updateUpcomingDeadlines();
    }

    updateDashboardStats() {
        const stats = {
            totalSubjects: 7,
            completedTasks: this.storage.assignments.filter(a => a.completed).length,
            totalStudyTime: this.storage.sessions.reduce((total, session) => total + session.duration, 0),
            overallProgress: this.calculateOverallProgress()
        };

        const elements = {
            totalSubjects: document.getElementById('totalSubjects'),
            completedTasks: document.getElementById('completedTasks'),
            totalStudyTime: document.getElementById('totalStudyTime'),
            overallProgress: document.getElementById('overallProgress')
        };

        if (elements.totalSubjects) elements.totalSubjects.textContent = stats.totalSubjects;
        if (elements.completedTasks) elements.completedTasks.textContent = stats.completedTasks;
        if (elements.totalStudyTime) elements.totalStudyTime.textContent = this.formatTime(stats.totalStudyTime);
        if (elements.overallProgress) elements.overallProgress.textContent = `${stats.overallProgress}%`;
    }

    calculateOverallProgress() {
        const totalAssignments = this.storage.assignments.length;
        const completedAssignments = this.storage.assignments.filter(a => a.completed).length;
        
        if (totalAssignments === 0) return 0;
        return Math.round((completedAssignments / totalAssignments) * 100);
    }

    updateRecentActivity() {
        const activityList = document.getElementById('activityList');
        if (!activityList) return;

        const recentSessions = this.storage.sessions
            .slice(-5)
            .reverse()
            .map(session => ({
                type: 'study',
                title: `Studied ${this.getSubjectName(session.subject)}`,
                subtitle: `${this.formatTime(session.duration)} session`,
                time: this.formatRelativeTime(session.endTime)
            }));

        const recentAssignments = this.storage.assignments
            .filter(a => a.completed && a.completedDate)
            .slice(-3)
            .reverse()
            .map(assignment => ({
                type: 'assignment',
                title: `Completed ${assignment.title}`,
                subtitle: this.getSubjectName(assignment.subject),
                time: this.formatRelativeTime(assignment.completedDate)
            }));

        const allActivity = [...recentSessions, ...recentAssignments]
            .sort((a, b) => new Date(b.time) - new Date(a.time))
            .slice(0, 5);

        if (allActivity.length === 0) {
            activityList.innerHTML = `
                <div class="empty-state">
                    <p>No recent activity</p>
                    <small>Start studying to see your progress here</small>
                </div>
            `;
            return;
        }

        activityList.innerHTML = allActivity.map(activity => `
            <div class="activity-item ${activity.type}">
                <div class="activity-content">
                    <h4>${activity.title}</h4>
                    <p>${activity.subtitle}</p>
                    <span class="activity-time">${activity.time}</span>
                </div>
            </div>
        `).join('');
    }

    updateUpcomingDeadlines() {
        const deadlineList = document.getElementById('deadlineList');
        if (!deadlineList) return;

        const upcomingDeadlines = this.storage.assignments
            .filter(a => !a.completed && new Date(a.dueDate) >= new Date())
            .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
            .slice(0, 5);

        if (upcomingDeadlines.length === 0) {
            deadlineList.innerHTML = `
                <div class="empty-state">
                    <p>No upcoming deadlines</p>
                    <small>Add assignments to track deadlines</small>
                </div>
            `;
            return;
        }

        deadlineList.innerHTML = upcomingDeadlines.map(assignment => {
            const dueDate = new Date(assignment.dueDate);
            const daysLeft = Math.ceil((dueDate - new Date()) / (24 * 60 * 60 * 1000));
            
            return `
                <div class="deadline-item ${daysLeft <= 1 ? 'urgent' : ''}">
                    <div class="deadline-content">
                        <h4>${assignment.title}</h4>
                        <p>${this.getSubjectName(assignment.subject)}</p>
                        <span class="deadline-time">
                            ${daysLeft === 0 ? 'Due today' : daysLeft === 1 ? 'Due tomorrow' : `${daysLeft} days left`}
                        </span>
                    </div>
                </div>
            `;
        }).join('');
    }

    // Modal Management
    showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('show');
            modal.style.display = 'flex';
        }
    }

    hideModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('show');
            modal.style.display = 'none';
        }
    }

    // Global Functions for HTML onclick handlers
    updateAllDisplays() {
        this.updateStats();
        this.updateMaterialsDisplay();
        this.updateAssignmentsDisplay();
        this.updateAlarmsDisplay();
        this.updateNotificationBadge();
        this.updateTodaySessions();
    }

    updateStats() {
        const materialsCount = this.storage.materials.length;
        const assignmentsCount = this.storage.assignments.filter(a => !a.completed).length;
        const totalStudyTime = this.storage.sessions.reduce((total, session) => total + session.duration, 0);

        // Update sidebar stats
        const elements = {
            materials: document.getElementById('materials'),
            assignments: document.getElementById('assignments'),
            studyHours: document.getElementById('studyHours'),
            assignmentCount: document.getElementById('assignmentCount')
        };

        if (elements.materials) elements.materials.textContent = materialsCount;
        if (elements.assignments) elements.assignments.textContent = assignmentsCount;
        if (elements.studyHours) elements.studyHours.textContent = this.formatTime(totalStudyTime);
        if (elements.assignmentCount) elements.assignmentCount.textContent = assignmentsCount;
    }

    updateGreeting() {
        const greetingElement = document.getElementById('greetingText');
        if (!greetingElement) return;

        const hour = new Date().getHours();
        let greeting;

        if (hour < 12) {
            greeting = 'Good morning, Prakash!';
        } else if (hour < 17) {
            greeting = 'Good afternoon, Prakash!';
        } else {
            greeting = 'Good evening, Prakash!';
        }

        greetingElement.textContent = greeting;
    }

    syncData() {
        // Simulate sync animation
        const syncBtn = document.getElementById('syncBtn');
        if (syncBtn) {
            syncBtn.style.animation = 'spin 1s linear';
            setTimeout(() => {
                syncBtn.style.animation = '';
                this.showToast('Data synced successfully!', 'success');
            }, 1000);
        }
    }

    // Utility Functions
    getFileIcon(type) {
        if (type.includes('pdf')) return '📄';
        if (type.includes('word') || type.includes('document')) return '📝';
        if (type.includes('powerpoint') || type.includes('presentation')) return '📊';
        if (type.includes('image')) return '🖼️';
        if (type.includes('text')) return '📃';
        if (type.includes('video')) return '🎥';
        if (type.includes('audio')) return '🎵';
        return '📁';
    }

    getSubjectName(subject) {
        const subjects = {
            'math': 'Mathematics',
            'dsa': 'Data Structures',
            'coa': 'Computer Organization',
            'programming': 'Advanced Programming',
            'os': 'Operating Systems',
            'uhv': 'Universal Human Values',
            'ethics': 'Professional Ethics'
        };
        return subjects[subject] || 'General';
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    formatTime(milliseconds) {
        const totalSeconds = Math.floor(milliseconds / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        
        if (hours > 0) {
            return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        } else {
            return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
    }

    formatTime12Hour(time24) {
        const [hours, minutes] = time24.split(':');
        const hour12 = hours % 12 || 12;
        const ampm = hours < 12 ? 'AM' : 'PM';
        return `${hour12}:${minutes} ${ampm}`;
    }

    formatRelativeTime(timestamp) {
        const now = new Date();
        const time = new Date(timestamp);
        const diffMs = now - time;
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffMs < 1000 * 60) return 'Just now';
        if (diffMs < 1000 * 60 * 60) return `${Math.floor(diffMs / (1000 * 60))}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return time.toLocaleDateString();
    }

    truncateText(text, length) {
        return text.length > length ? text.substring(0, length) + '...' : text;
    }

    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;

        const container = document.getElementById('toastContainer');
        if (container) {
            container.appendChild(toast);

            // Trigger animation
            setTimeout(() => toast.classList.add('show'), 100);

            // Remove toast after 3 seconds
            setTimeout(() => {
                toast.classList.remove('show');
                setTimeout(() => {
                    if (container.contains(toast)) {
                        container.removeChild(toast);
                    }
                }, 300);
            }, 3000);
        }
    }

    // Storage Functions
    saveMaterials() {
        localStorage.setItem('academic_hub_materials', JSON.stringify(this.storage.materials));
    }

    saveAssignments() {
        localStorage.setItem('academic_hub_assignments', JSON.stringify(this.storage.assignments));
    }

    saveSessions() {
        localStorage.setItem('academic_hub_sessions', JSON.stringify(this.storage.sessions));
    }

    saveAlarms() {
        localStorage.setItem('academic_hub_alarms', JSON.stringify(this.storage.alarms));
    }

    saveNotifications() {
        localStorage.setItem('academic_hub_notifications', JSON.stringify(this.storage.notifications));
    }

    saveSettings() {
        localStorage.setItem('academic_hub_settings', JSON.stringify(this.storage.settings));
    }
}

// Global Functions for HTML onclick handlers
function openMaterials(subject) {
    academicHub.showSection('materials');
    
    // Update navigation
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
    document.querySelector('[data-section="materials"]').classList.add('active');
    
    // Set subject filter
    const subjectFilter = document.getElementById('subjectFilter');
    if (subjectFilter) {
        subjectFilter.value = subject;
        academicHub.filterMaterials(subject);
    }
}

// Assignment Modal Functions
function showAddAssignmentModal() {
    academicHub.showModal('assignmentModal');
}

function hideAddAssignmentModal() {
    academicHub.hideModal('assignmentModal');
}

function saveAssignment() {
    const title = document.getElementById('assignmentTitle').value;
    const subject = document.getElementById('assignmentSubject').value;
    const dueDate = document.getElementById('assignmentDueDate').value;
    const description = document.getElementById('assignmentDescription').value;

    if (!title || !subject || !dueDate) {
        academicHub.showToast('Please fill in all required fields', 'error');
        return;
    }

    const assignment = {
        id: Date.now(),
        title,
        subject,
        dueDate,
        description,
        completed: false,
        createdDate: new Date().toISOString()
    };

    academicHub.storage.assignments.push(assignment);
    academicHub.saveAssignments();
    academicHub.updateAssignmentsDisplay();
    academicHub.updateStats();
    academicHub.buildSearchIndex();
    
    // Clear form
    document.getElementById('assignmentTitle').value = '';
    document.getElementById('assignmentSubject').value = 'math';
    document.getElementById('assignmentDueDate').value = '';
    document.getElementById('assignmentDescription').value = '';
    
    academicHub.hideModal('assignmentModal');
    academicHub.showToast('Assignment added successfully!', 'success');
}

// Alarm Modal Functions
function showAddAlarmModal() {
    academicHub.showModal('alarmModal');
}

function hideAddAlarmModal() {
    academicHub.hideModal('alarmModal');
}

function saveAlarm() {
    const name = document.getElementById('alarmName').value;
    const time = document.getElementById('alarmTime').value;
    const subject = document.getElementById('alarmSubject').value;
    
    const dayCheckboxes = document.querySelectorAll('.day-option input:checked');
    const days = Array.from(dayCheckboxes).map(cb => cb.value);

    if (!name || !time || days.length === 0) {
        academicHub.showToast('Please fill in all required fields', 'error');
        return;
    }

    const alarm = {
        id: Date.now(),
        name,
        time,
        days,
        subject,
        active: true,
        createdDate: new Date().toISOString()
    };

    academicHub.storage.alarms.push(alarm);
    academicHub.saveAlarms();
    academicHub.updateAlarmsDisplay();
    
    // Clear form
    document.getElementById('alarmName').value = '';
    document.getElementById('alarmTime').value = '';
    document.getElementById('alarmSubject').value = '';
    document.querySelectorAll('.day-option input').forEach(cb => cb.checked = false);
    
    academicHub.hideModal('alarmModal');
    academicHub.showToast('Alarm created successfully!', 'success');
}

// File Modal Functions
function closeFileModal() {
    academicHub.hideModal('fileModal');
}

function downloadCurrentFile() {
    if (academicHub.currentFile) {
        academicHub.downloadFile(academicHub.currentFile.id);
        closeFileModal();
    }
}

function deleteCurrentFile() {
    if (academicHub.currentFile && confirm('Are you sure you want to delete this file?')) {
        academicHub.deleteFile(academicHub.currentFile.id);
        closeFileModal();
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    window.academicHub = new AcademicHub();
    
    // Add CSS for animations
    const style = document.createElement('style');
    style.textContent = `
        @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }
        
        .switch {
            position: relative;
            display: inline-block;
            width: 60px;
            height: 34px;
        }
        
        .switch input {
            opacity: 0;
            width: 0;
            height: 0;
        }
        
        .slider {
            position: absolute;
            cursor: pointer;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: var(--bg-tertiary);
            transition: .4s;
            border-radius: 34px;
        }
        
        .slider:before {
            position: absolute;
            content: "";
            height: 26px;
            width: 26px;
            left: 4px;
            bottom: 4px;
            background-color: white;
            transition: .4s;
            border-radius: 50%;
        }
        
        input:checked + .slider {
            background-color: var(--accent-blue);
        }
        
        input:checked + .slider:before {
            transform: translateX(26px);
        }
        
        .notification-panel {
            position: fixed;
            top: 64px;
            right: 20px;
            width: 350px;
            max-height: 500px;
            background: var(--bg-secondary);
            border: 1px solid var(--border-color);
            border-radius: var(--radius-md);
            box-shadow: var(--shadow-heavy);
            z-index: 1000;
            transform: translateX(400px);
            transition: transform 0.3s ease;
        }
        
        .notification-panel.show {
            transform: translateX(0);
        }
        
        .panel-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 16px 20px;
            border-bottom: 1px solid var(--border-color);
        }
        
        .notifications-list {
            max-height: 400px;
            overflow-y: auto;
        }
        
        .notification-item {
            padding: 12px 20px;
            border-bottom: 1px solid var(--border-color);
            cursor: pointer;
            transition: background 0.2s ease;
        }
        
        .notification-item:hover {
            background: var(--bg-tertiary);
        }
        
        .notification-item.unread {
            background: rgba(0, 122, 255, 0.05);
            border-left: 3px solid var(--accent-blue);
        }
        
        .days-selector {
            display: flex;
            gap: 8px;
            flex-wrap: wrap;
        }
        
        .day-option {
            display: flex;
            align-items: center;
            gap: 4px;
            font-size: 14px;
        }
        
        .btn-sm {
            padding: 6px 12px;
            font-size: 12px;
        }
        
        .assignment-card, .alarm-card {
            background: var(--bg-card);
            border: 1px solid var(--border-color);
            border-radius: var(--radius-md);
            padding: 16px;
            margin-bottom: 12px;
        }
        
        .assignment-card.completed {
            opacity: 0.7;
        }
        
        .assignment-card.overdue {
            border-color: var(--accent-red);
        }
        
        .alarm-card.inactive {
            opacity: 0.6;
        }
    `;
    document.head.appendChild(style);
});
// Add this AFTER all existing code in script.js - at the very bottom

// ==== MISSING BUTTON FUNCTIONS - ADD THESE ====

// View Materials button function
function openMaterials(subject) {
    console.log('Opening materials for:', subject);
    
    // Switch to materials section
    academicHub.showSection('materials');
    
    // Update active navigation
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
    const materialsLink = document.querySelector('[data-section="materials"]');
    if (materialsLink) {
        materialsLink.classList.add('active');
    }
    
    // Filter materials by subject
    const subjectFilter = document.getElementById('subjectFilter');
    if (subjectFilter) {
        subjectFilter.value = subject;
        academicHub.filterMaterials(subject);
    }
    
    academicHub.showToast(`Viewing ${academicHub.getSubjectName(subject)} materials`, 'info');
}

// Start Studying button function  
function startStudying(subject) {
    console.log('Starting study for:', subject);
    
    // Switch to timer section
    academicHub.showSection('timer');
    
    // Update active navigation
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
    const timerLink = document.querySelector('[data-section="timer"]');
    if (timerLink) {
        timerLink.classList.add('active');
    }
    
    // Set subject in timer
    const timerSubject = document.getElementById('timerSubject');
    if (timerSubject) {
        timerSubject.value = subject;
        academicHub.timer.currentSubject = subject;
    }
    
    academicHub.showToast(`Ready to study ${academicHub.getSubjectName(subject)}!`, 'success');
}

// Fix the file upload functionality
function fixFileUploadIssue() {
    console.log('Fixing file upload...');
    
    const fileInput = document.getElementById('fileInput');
    const uploadArea = document.getElementById('uploadArea');
    
    if (!fileInput) {
        console.error('File input not found!');
        return;
    }
    
    if (!uploadArea) {
        console.error('Upload area not found!');
        return;
    }
    
    // Clear any existing event listeners
    fileInput.onchange = null;
    
    // Add working file change event
    fileInput.addEventListener('change', function(e) {
        console.log('Files selected:', e.target.files.length);
        if (e.target.files.length > 0) {
            academicHub.handleFiles(e.target.files);
        }
    });
    
    // Fix drag and drop
    uploadArea.ondragover = function(e) {
        e.preventDefault();
        uploadArea.style.borderColor = '#007AFF';
        uploadArea.style.backgroundColor = 'rgba(0, 122, 255, 0.1)';
    };
    
    uploadArea.ondragleave = function(e) {
        e.preventDefault();
        uploadArea.style.borderColor = '';
        uploadArea.style.backgroundColor = '';
    };
    
    uploadArea.ondrop = function(e) {
        e.preventDefault();
        uploadArea.style.borderColor = '';
        uploadArea.style.backgroundColor = '';
        
        const files = e.dataTransfer.files;
        console.log('Files dropped:', files.length);
        if (files.length > 0) {
            academicHub.handleFiles(files);
        }
    };
    
    // Fix click to upload
    uploadArea.onclick = function() {
        console.log('Upload area clicked');
        fileInput.click();
    };
    
    console.log('File upload fixed successfully!');
}

// Fix the handleFiles function in academicHub if it's not working
if (window.academicHub) {
    // Override the handleFiles function to make it work properly
    academicHub.handleFiles = async function(files) {
        console.log('Processing files:', files.length);
        
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            console.log('Processing file:', file.name);
            
            try {
                await this.addFile(file);
                console.log('File added successfully:', file.name);
            } catch (error) {
                console.error('Error adding file:', error);
            }
        }
        
        this.updateMaterialsDisplay();
        this.updateStats();
        this.buildSearchIndex();
        this.showToast(`${files.length} file(s) uploaded successfully!`, 'success');
    };
    
    // Fix the addFile function
    academicHub.addFile = function(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                try {
                    const fileData = {
                        id: Date.now() + Math.random(),
                        name: file.name,
                        size: file.size,
                        type: file.type,
                        subject: 'math', // Default subject
                        uploadDate: new Date().toISOString(),
                        data: e.target.result
                    };

                    this.storage.materials.push(fileData);
                    this.saveMaterials();
                    console.log('File saved to storage:', file.name);
                    resolve(fileData);
                } catch (error) {
                    console.error('Error processing file:', error);
                    reject(error);
                }
            };
            
            reader.onerror = (error) => {
                console.error('FileReader error:', error);
                reject(error);
            };
            
            reader.readAsDataURL(file);
        });
    };
}

// Initialize fixes when everything is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Wait for academicHub to be fully initialized
    setTimeout(() => {
        console.log('Initializing fixes...');
        fixFileUploadIssue();
    }, 2000);
});

// Also fix when switching to materials section
const originalShowSection = academicHub?.showSection;
if (originalShowSection) {
    academicHub.showSection = function(sectionName) {
        originalShowSection.call(this, sectionName);
        
        if (sectionName === 'materials') {
            setTimeout(() => {
                fixFileUploadIssue();
            }, 100);
        }
    };
}

// ==== FIX FOR STUDY MATERIALS AND ASSIGNMENTS ====

// Fix the materials display function
function fixMaterialsDisplay() {
    console.log('Fixing materials display...');
    
    const materialsGrid = document.getElementById('materialsGrid');
    if (!materialsGrid) {
        console.error('Materials grid not found!');
        return;
    }
    
    // Check if we have materials in storage
    const materials = JSON.parse(localStorage.getItem('academic_hub_materials') || '[]');
    console.log('Found materials:', materials.length);
    
    if (materials.length === 0) {
        materialsGrid.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">📚</div>
                <h3>No materials uploaded yet</h3>
                <p>Upload your first study material to get started</p>
            </div>
        `;
    } else {
        materialsGrid.innerHTML = materials.map(material => createMaterialCard(material)).join('');
    }
    
    // Update file count
    const fileCount = document.getElementById('fileCount');
    if (fileCount) {
        fileCount.textContent = materials.length;
    }
}

// Create material card function
function createMaterialCard(material) {
    const fileIcon = getFileIconFromType(material.type);
    const fileSize = formatBytes(material.size);
    const uploadDate = new Date(material.uploadDate).toLocaleDateString();
    
    return `
        <div class="file-card" onclick="previewMaterial('${material.id}')">
            <div class="file-header">
                <div class="file-icon">${fileIcon}</div>
                <div class="file-info">
                    <h4 title="${material.name}">${material.name}</h4>
                    <div class="file-subject">${getSubjectDisplayName(material.subject)}</div>
                </div>
            </div>
            <div class="file-meta">
                <span>${fileSize}</span>
                <span>${uploadDate}</span>
            </div>
            <div class="file-actions" onclick="event.stopPropagation()">
                <button class="btn btn-outline btn-sm" onclick="downloadMaterial('${material.id}')">Download</button>
                <button class="btn btn-danger btn-sm" onclick="deleteMaterial('${material.id}')">Delete</button>
            </div>
        </div>
    `;
}

// Helper functions
function getFileIconFromType(type) {
    if (type.includes('pdf')) return '📄';
    if (type.includes('word') || type.includes('document')) return '📝';
    if (type.includes('powerpoint') || type.includes('presentation')) return '📊';
    if (type.includes('image')) return '🖼️';
    if (type.includes('text')) return '📃';
    return '📁';
}

function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function getSubjectDisplayName(subject) {
    const subjects = {
        'math': 'Mathematics',
        'dsa': 'Data Structures',
        'coa': 'Computer Organization',
        'programming': 'Advanced Programming',
        'os': 'Operating Systems',
        'uhv': 'Universal Human Values',
        'ethics': 'Professional Ethics'
    };
    return subjects[subject] || 'General';
}

// Fix file upload functionality
function setupFileUploadFix() {
    console.log('Setting up file upload...');
    
    const fileInput = document.getElementById('fileInput');
    const uploadArea = document.getElementById('uploadArea');
    
    if (!fileInput || !uploadArea) {
        console.error('File input or upload area not found!');
        return;
    }
    
    // Clear existing listeners
    fileInput.onchange = null;
    uploadArea.onclick = null;
    
    // File input change event
    fileInput.addEventListener('change', function(e) {
        console.log('Files selected:', e.target.files.length);
        handleFileUpload(e.target.files);
    });
    
    // Upload area click
    uploadArea.addEventListener('click', function() {
        console.log('Upload area clicked');
        fileInput.click();
    });
    
    // Drag and drop
    uploadArea.addEventListener('dragover', function(e) {
        e.preventDefault();
        uploadArea.style.borderColor = '#007AFF';
        uploadArea.style.backgroundColor = 'rgba(0, 122, 255, 0.1)';
    });
    
    uploadArea.addEventListener('dragleave', function(e) {
        e.preventDefault();
        uploadArea.style.borderColor = '';
        uploadArea.style.backgroundColor = '';
    });
    
    uploadArea.addEventListener('drop', function(e) {
        e.preventDefault();
        uploadArea.style.borderColor = '';
        uploadArea.style.backgroundColor = '';
        
        console.log('Files dropped:', e.dataTransfer.files.length);
        handleFileUpload(e.dataTransfer.files);
    });
}

// Handle file upload
async function handleFileUpload(files) {
    console.log('Processing', files.length, 'files...');
    
    const materials = JSON.parse(localStorage.getItem('academic_hub_materials') || '[]');
    
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        console.log('Processing file:', file.name);
        
        try {
            const base64 = await fileToBase64(file);
            
            const material = {
                id: Date.now() + i,
                name: file.name,
                size: file.size,
                type: file.type,
                subject: 'math', // Default subject
                uploadDate: new Date().toISOString(),
                data: base64
            };
            
            materials.push(material);
            console.log('File added:', file.name);
            
        } catch (error) {
            console.error('Error processing file:', error);
        }
    }
    
    // Save to localStorage
    localStorage.setItem('academic_hub_materials', JSON.stringify(materials));
    
    // Refresh display
    fixMaterialsDisplay();
    
    // Show success message
    showSuccessToast(`${files.length} file(s) uploaded successfully!`);
}

// Convert file to base64
function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

// Material actions
function previewMaterial(id) {
    console.log('Previewing material:', id);
    const materials = JSON.parse(localStorage.getItem('academic_hub_materials') || '[]');
    const material = materials.find(m => m.id == id);
    
    if (material) {
        showSuccessToast(`Opening ${material.name}`);
    }
}

function downloadMaterial(id) {
    console.log('Downloading material:', id);
    const materials = JSON.parse(localStorage.getItem('academic_hub_materials') || '[]');
    const material = materials.find(m => m.id == id);
    
    if (material) {
        const link = document.createElement('a');
        link.href = material.data;
        link.download = material.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        showSuccessToast(`${material.name} downloaded!`);
    }
}

function deleteMaterial(id) {
    if (confirm('Are you sure you want to delete this file?')) {
        console.log('Deleting material:', id);
        let materials = JSON.parse(localStorage.getItem('academic_hub_materials') || '[]');
        materials = materials.filter(m => m.id != id);
        
        localStorage.setItem('academic_hub_materials', JSON.stringify(materials));
        fixMaterialsDisplay();
        showSuccessToast('File deleted successfully!');
    }
}

// Fix assignments display
function fixAssignmentsDisplay() {
    console.log('Fixing assignments display...');
    
    const assignmentsList = document.getElementById('assignmentsList');
    if (!assignmentsList) {
        console.error('Assignments list not found!');
        return;
    }
    
    const assignments = JSON.parse(localStorage.getItem('academic_hub_assignments') || '[]');
    console.log('Found assignments:', assignments.length);
    
    if (assignments.length === 0) {
        assignmentsList.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">📝</div>
                <h3>No assignments yet</h3>
                <p>Add your first assignment to get started</p>
            </div>
        `;
    } else {
        assignmentsList.innerHTML = assignments.map(assignment => createAssignmentCard(assignment)).join('');
    }
}

// Create assignment card
function createAssignmentCard(assignment) {
    const dueDate = new Date(assignment.dueDate).toLocaleDateString();
    const isOverdue = new Date(assignment.dueDate) < new Date() && !assignment.completed;
    
    return `
        <div class="assignment-card ${assignment.completed ? 'completed' : ''} ${isOverdue ? 'overdue' : ''}">
            <div class="assignment-header">
                <h4>${assignment.title}</h4>
                <div class="assignment-subject">${getSubjectDisplayName(assignment.subject)}</div>
            </div>
            <div class="assignment-content">
                <p>${assignment.description || 'No description'}</p>
                <div class="assignment-meta">
                    <span>Due: ${dueDate}</span>
                    <span class="status ${assignment.completed ? 'completed' : (isOverdue ? 'overdue' : 'pending')}">
                        ${assignment.completed ? 'Completed' : (isOverdue ? 'Overdue' : 'Pending')}
                    </span>
                </div>
            </div>
            <div class="assignment-actions">
                <button class="btn btn-outline btn-sm" onclick="toggleAssignment('${assignment.id}')">
                    ${assignment.completed ? 'Mark Incomplete' : 'Mark Complete'}
                </button>
                <button class="btn btn-danger btn-sm" onclick="deleteAssignment('${assignment.id}')">Delete</button>
            </div>
        </div>
    `;
}

// Assignment actions
function toggleAssignment(id) {
    let assignments = JSON.parse(localStorage.getItem('academic_hub_assignments') || '[]');
    const assignment = assignments.find(a => a.id == id);
    
    if (assignment) {
        assignment.completed = !assignment.completed;
        localStorage.setItem('academic_hub_assignments', JSON.stringify(assignments));
        fixAssignmentsDisplay();
        showSuccessToast(assignment.completed ? 'Assignment completed!' : 'Assignment marked as pending');
    }
}

function deleteAssignment(id) {
    if (confirm('Are you sure you want to delete this assignment?')) {
        let assignments = JSON.parse(localStorage.getItem('academic_hub_assignments') || '[]');
        assignments = assignments.filter(a => a.id != id);
        
        localStorage.setItem('academic_hub_assignments', JSON.stringify(assignments));
        fixAssignmentsDisplay();
        showSuccessToast('Assignment deleted!');
    }
}

// Show success toast
function showSuccessToast(message) {
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #34C759;
        color: white;
        padding: 12px 16px;
        border-radius: 8px;
        z-index: 1000;
        font-weight: 500;
    `;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        document.body.removeChild(toast);
    }, 3000);
}

// Override the showSection function to fix displays
const originalShowSection = window.academicHub?.showSection;
if (originalShowSection) {
    window.academicHub.showSection = function(sectionName) {
        originalShowSection.call(this, sectionName);
        
        // Fix specific sections
        setTimeout(() => {
            if (sectionName === 'materials') {
                setupFileUploadFix();
                fixMaterialsDisplay();
            } else if (sectionName === 'assignments') {
                fixAssignmentsDisplay();
            }
        }, 100);
    };
}

// Initialize fixes when page loads
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        console.log('Initializing section fixes...');
        setupFileUploadFix();
        fixMaterialsDisplay();
        fixAssignmentsDisplay();
    }, 2000);
});

// Fix when sections are clicked
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', function() {
        const section = this.dataset.section;
        setTimeout(() => {
            if (section === 'materials') {
                setupFileUploadFix();
                fixMaterialsDisplay();
            } else if (section === 'assignments') {
                fixAssignmentsDisplay();
            }
        }, 200);
    });
});

console.log('Materials and Assignments fix loaded!');
// Assignment modal functions
function showAddAssignmentModal() {
    const modal = document.getElementById('assignmentModal');
    if (modal) {
        modal.style.display = 'flex';
    }
}

function hideAddAssignmentModal() {
    const modal = document.getElementById('assignmentModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

function saveAssignment() {
    const title = document.getElementById('assignmentTitle').value;
    const subject = document.getElementById('assignmentSubject').value;
    const dueDate = document.getElementById('assignmentDueDate').value;
    const description = document.getElementById('assignmentDescription').value;

    if (!title || !subject || !dueDate) {
        alert('Please fill in all required fields');
        return;
    }

    const assignments = JSON.parse(localStorage.getItem('academic_hub_assignments') || '[]');
    
    const assignment = {
        id: Date.now(),
        title,
        subject,
        dueDate,
        description,
        completed: false,
        createdDate: new Date().toISOString()
    };

    assignments.push(assignment);
    localStorage.setItem('academic_hub_assignments', JSON.stringify(assignments));
    
    // Clear form
    document.getElementById('assignmentTitle').value = '';
    document.getElementById('assignmentSubject').value = 'math';
    document.getElementById('assignmentDueDate').value = '';
    document.getElementById('assignmentDescription').value = '';
    
    hideAddAssignmentModal();
    fixAssignmentsDisplay();
    showSuccessToast('Assignment added successfully!');
}


