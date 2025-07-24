// ========== ENHANCED ACADEMIC HUB SCRIPT ==========
// Version: 2.0 - Complete Feature Set
// Last Updated: 2024

// ========== APPLICATION STATE MANAGEMENT ==========
let appState = {
    subjects: {
        math: {
            id: 'math',
            name: 'Transforms and Boundary Value Problems',
            code: '21MAB201T',
            faculty: 'Dr. V. Vidhya',
            credits: 4,
            category: 'Basic Science',
            icon: '📐',
            color: '#667eea',
            studyTime: 0,
            materials: [],
            sessions: [],
            goals: [],
            notes: []
        },
        dsa: {
            id: 'dsa',
            name: 'Data Structures and Algorithms',
            code: '21CSC201J',
            faculty: 'Dr. Kalpana C',
            credits: 4,
            category: 'Professional Core',
            icon: '🌳',
            color: '#4ecdc4',
            studyTime: 0,
            materials: [],
            sessions: [],
            goals: [],
            notes: []
        },
        coa: {
            id: 'coa',
            name: 'Computer Organization and Architecture',
            code: '21CSS201T',
            faculty: 'Dr. Meenakshi M',
            credits: 4,
            category: 'Engineering Science',
            icon: '🏗️',
            color: '#45b7d1',
            studyTime: 0,
            materials: [],
            sessions: [],
            goals: [],
            notes: []
        },
        prog: {
            id: 'prog',
            name: 'Advanced Programming Practice',
            code: '21CSC203P',
            faculty: 'Dr. Prince Chelladurai S',
            credits: 4,
            category: 'Professional Core',
            icon: '👨‍💻',
            color: '#f9ca24',
            studyTime: 0,
            materials: [],
            sessions: [],
            goals: [],
            notes: []
        },
        os: {
            id: 'os',
            name: 'Operating Systems',
            code: '21CSC202J',
            faculty: 'Dr. G. Priyadharshini',
            credits: 4,
            category: 'Professional Core',
            icon: '⚙️',
            color: '#f0932b',
            studyTime: 0,
            materials: [],
            sessions: [],
            goals: [],
            notes: []
        },
        uhv: {
            id: 'uhv',
            name: 'Universal Human Values - II',
            code: '21LEM202T',
            faculty: 'Dr. Caleb Theodar M',
            credits: 3,
            category: 'Engineering Science',
            icon: '🧠',
            color: '#eb4d4b',
            studyTime: 0,
            materials: [],
            sessions: [],
            goals: [],
            notes: []
        }
    },
    timer: {
        currentSubject: null,
        startTime: null,
        pausedTime: 0,
        isRunning: false,
        interval: null,
        totalSessions: 0,
        pomodoroCount: 0
    },
    settings: {
        openrouterKey: '',
        preferredModel: 'openai/gpt-4-turbo',
        dailyGoal: 4,
        theme: 'dark',
        notifications: true,
        pomodoroEnabled: true,
        workDuration: 25,
        breakDuration: 5,
        longBreakDuration: 15,
        autoStartBreaks: false
    },
    analytics: {
        dailyData: {},
        weeklyData: {},
        monthlyData: {},
        achievements: [],
        streak: 0,
        totalStudyTime: 0,
        averageSessionLength: 0,
        productivityScore: 0
    },
    goals: [],
    notes: [],
    schedule: [],
    weather: null,
    charts: {},
    isOnline: navigator.onLine,
    lastSync: null
};

// Runtime variables
let currentStudySubject = null;
let currentMaterialsSubject = null;
let studyTimer = null;
let startTime = null;
let pausedTime = 0;
let progressCharts = {};
let achievementQueue = [];
let weatherTimer = null;

// ========== ENHANCED API KEY MANAGEMENT ==========
function getOpenRouterKey() {
    // Method 1: Check Codespace environment variables
    if (typeof window !== 'undefined' && window.CODESPACE_VSCODE_FOLDER) {
        // Running in GitHub Codespace
        const envKey = localStorage.getItem('CODESPACE_OPENROUTER_KEY');
        if (envKey) return envKey;
    }
    
    // Method 2: Check process environment (Node.js context)
    if (typeof process !== 'undefined' && process.env && process.env.OPENROUTER_API_KEY) {
        return process.env.OPENROUTER_API_KEY;
    }
    
    // Method 3: Check global window variable (injected by Codespace)
    if (typeof window !== 'undefined' && window.OPENROUTER_API_KEY) {
        return window.OPENROUTER_API_KEY;
    }
    
    // Method 4: Local storage fallback
    const stored = localStorage.getItem('academic-hub-ai-config');
    if (stored) {
        try {
            const config = JSON.parse(stored);
            return config.openrouterKey || '';
        } catch (e) {
            console.warn('Failed to parse AI config:', e);
        }
    }
    
    return '';
}

// Auto-detect API key from Codespace environment
function detectCodespaceAPIKey() {
    // Check if running in Codespace
    if (window.location.hostname.includes('github.dev') || 
        window.location.hostname.includes('codespaces.new') ||
        document.querySelector('meta[name="environment"][content="codespace"]')) {
        
        // Try to get from Codespace secrets
        fetch('/.codespace/environment.json')
            .then(response => response.json())
            .then(data => {
                if (data.OPENROUTER_API_KEY) {
                    appState.settings.openrouterKey = data.OPENROUTER_API_KEY;
                    localStorage.setItem('CODESPACE_OPENROUTER_KEY', data.OPENROUTER_API_KEY);
                    showNotification('API Key Detected', 'OpenRouter API key loaded from Codespace environment', 'success');
                    checkAIStatus();
                }
            })
            .catch(() => {
                // Fallback: Check localStorage or prompt user
                console.log('No Codespace environment file found, using stored key');
            });
    }
}

// ========== ENHANCED INITIALIZATION ==========
document.addEventListener('DOMContentLoaded', function() {
    console.log('🎓 Academic Hub Pro Loading...');
    
    // Initialize in correct order
    loadAppData();
    detectCodespaceAPIKey();
    initializeTheme();
    initializeNavigation();
    initializeClock();
    initializeWeather();
    initializeAI();
    initializeEventListeners();
    initializeOfflineSupport();
    initializePerformanceMonitoring();
    
    // Update UI
    updateAllProgress();
    initializeCharts();
    updateDashboardStats();
    renderAchievements();
    
    // Start background tasks
    startBackgroundTasks();
    
    console.log('✅ Academic Hub Pro Ready!');
    logPerformance();
});

// ========== ENHANCED EVENT LISTENERS ==========
function initializeEventListeners() {
    // Theme toggle buttons with animation
    document.querySelectorAll('[id^="themeToggle"]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            toggleThemeWithAnimation();
        });
    });
    
    // Enhanced file upload areas
    document.querySelectorAll('.file-upload-area').forEach(area => {
        area.addEventListener('click', function() {
            const subjectId = getSubjectFromElement(this);
            if (subjectId) handleFileUpload(subjectId);
        });
        
        area.addEventListener('dragover', handleDragOver);
        area.addEventListener('dragleave', handleDragLeave);
        area.addEventListener('drop', handleDrop);
    });
    
    // Enhanced search with real-time filtering
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        let searchTimeout;
        searchInput.addEventListener('input', function() {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                const query = this.value.toLowerCase();
                filterSubjectsAdvanced(query);
            }, 300);
        });
    }
    
    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeyboardShortcuts);
    
    // Chat improvements
    const chatInput = document.getElementById('chatInput');
    if (chatInput) {
        chatInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });
    }
    
    // Modal management
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            closeAllModals();
        }
    });
    
    // Online/offline detection
    window.addEventListener('online', handleOnlineStatus);
    window.addEventListener('offline', handleOfflineStatus);
    
    // Page visibility for performance
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Responsive navigation
    initializeMobileNavigation();
}

// ========== ENHANCED THEME MANAGEMENT ==========
function initializeTheme() {
    const savedTheme = localStorage.getItem('academic-hub-theme') || 'dark';
    const systemPreference = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    
    // Use saved theme or system preference
    const initialTheme = savedTheme === 'auto' ? systemPreference : savedTheme;
    
    document.body.setAttribute('data-theme', initialTheme);
    appState.settings.theme = initialTheme;
    updateThemeToggleIcons(initialTheme);
    
    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (appState.settings.theme === 'auto') {
            const newTheme = e.matches ? 'dark' : 'light';
            document.body.setAttribute('data-theme', newTheme);
            updateThemeToggleIcons(newTheme);
            updateChartsTheme();
        }
    });
}

function toggleThemeWithAnimation() {
    const currentTheme = appState.settings.theme;
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    // Add transition class
    document.body.classList.add('theme-transitioning');
    
    // Change theme
    document.body.setAttribute('data-theme', newTheme);
    appState.settings.theme = newTheme;
    localStorage.setItem('academic-hub-theme', newTheme);
    updateThemeToggleIcons(newTheme);
    
    // Update charts after animation
    setTimeout(() => {
        updateChartsTheme();
        document.body.classList.remove('theme-transitioning');
    }, 300);
    
    saveAppData();
    showNotification('Theme Changed', `Switched to ${newTheme} mode`, 'success');
}

function updateThemeToggleIcons(theme) {
    const icon = theme === 'dark' ? '☀️' : '🌙';
    document.querySelectorAll('[id^="themeToggle"]').forEach(btn => {
        btn.textContent = icon;
        btn.setAttribute('aria-label', `Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`);
    });
}

// ========== ENHANCED NAVIGATION ==========
function initializeNavigation() {
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const content = this.getAttribute('data-content');
            if (content) {
                switchContentWithAnimation(content);
                
                // Update active nav item
                document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
                this.classList.add('active');
                
                // Initialize content-specific features
                setTimeout(() => {
                    switch(content) {
                        case 'progress':
                            initializeProgressCharts();
                            break;
                        case 'ai-chat':
                            checkAIStatus();
                            break;
                        case 'schedule':
                            initializeSchedule();
                            break;
                        case 'goals':
                            renderGoals();
                            break;
                        case 'notes':
                            initializeNotesEditor();
                            break;
                    }
                }, 100);
            }
        });
    });
}

function switchContentWithAnimation(contentId) {
    const currentActive = document.querySelector('.content-area.active:not(#subjects-content)');
    const targetContent = document.getElementById(contentId + '-content');
    
    if (currentActive && currentActive !== targetContent) {
        currentActive.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            currentActive.classList.remove('active');
        }, 300);
    }
    
    if (targetContent && contentId !== 'subjects') {
        setTimeout(() => {
            targetContent.classList.add('active');
            targetContent.style.animation = 'slideIn 0.3s ease';
        }, contentId !== 'subjects' ? 150 : 0);
    }
}

// ========== ENHANCED CLOCK & WEATHER ==========
function initializeClock() {
    updateEnhancedClock();
    setInterval(updateEnhancedClock, 1000);
}

function updateEnhancedClock() {
    const now = new Date();
    
    // Enhanced date formatting
    const dateOptions = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    };
    
    const timeOptions = { 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit',
        hour12: false
    };
    
    const dateStr = now.toLocaleDateString('en-US', dateOptions);
    const timeStr = now.toLocaleTimeString('en-US', timeOptions);
    
    // Update all date/time displays
    document.querySelectorAll('[id$="Date"], [id^="current"][id$="Date"]').forEach(el => {
        if (el) {
            el.textContent = dateStr;
            el.classList.add('date-updated');
            setTimeout(() => el.classList.remove('date-updated'), 100);
        }
    });
    
    document.querySelectorAll('[id$="Time"], [id^="current"][id$="Time"]').forEach(el => {
        if (el) {
            el.textContent = timeStr;
            el.classList.add('time-updated');
            setTimeout(() => el.classList.remove('time-updated'), 100);
        }
    });
    
    // Update relative time displays
    updateRelativeTimeDisplays();
}

function initializeWeather() {
    fetchWeatherData();
    // Update weather every 30 minutes
    weatherTimer = setInterval(fetchWeatherData, 30 * 60 * 1000);
}

async function fetchWeatherData() {
    try {
        // Using OpenMeteo API (no key required)
        const response = await fetch('https://api.open-meteo.com/v1/forecast?latitude=28.6139&longitude=77.2090&current_weather=true&timezone=Asia/Kolkata');
        const data = await response.json();
        
        if (data.current_weather) {
            const weather = data.current_weather;
            const temp = Math.round(weather.temperature);
            const weatherCode = weather.weathercode;
            const weatherIcon = getWeatherIcon(weatherCode);
            
            appState.weather = {
                temperature: temp,
                condition: weatherIcon,
                code: weatherCode,
                lastUpdated: new Date().toISOString()
            };
            
            // Update weather displays
            document.querySelectorAll('.weather-info').forEach(el => {
                el.textContent = `📍 Delhi • ${weatherIcon} ${temp}°C`;
            });
        }
    } catch (error) {
        console.warn('Weather fetch failed:', error);
        // Fallback weather display
        document.querySelectorAll('.weather-info').forEach(el => {
            el.textContent = '📍 India • 🌤️ 28°C';
        });
    }
}

function getWeatherIcon(code) {
    const weatherCodes = {
        0: '☀️', 1: '🌤️', 2: '⛅', 3: '☁️',
        45: '🌫️', 48: '🌫️',
        51: '🌦️', 53: '🌦️', 55: '🌦️',
        61: '🌧️', 63: '🌧️', 65: '🌧️',
        80: '🌦️', 81: '🌦️', 82: '🌦️',
        95: '⛈️', 96: '⛈️', 99: '⛈️'
    };
    return weatherCodes[code] || '🌤️';
}

// ========== ENHANCED SUBJECT MANAGEMENT ==========
function showSubjectMenu(subjectId, event) {
    event.stopPropagation();
    
    const subject = appState.subjects[subjectId];
    if (!subject) return;
    
    // Create context menu
    const menu = document.createElement('div');
    menu.className = 'context-menu glass';
    menu.style.cssText = `
        position: fixed;
        background: var(--glass-bg);
        backdrop-filter: blur(20px);
        border: 1px solid var(--glass-border);
        border-radius: 12px;
        box-shadow: var(--shadow-lg);
        z-index: 1000;
        min-width: 200px;
        overflow: hidden;
        animation: menuSlideIn 0.2s ease;
    `;
    
    const menuItems = [
        { icon: '✏️', text: 'Edit Subject', action: () => editSubjectAdvanced(subjectId) },
        { icon: '📋', text: 'Duplicate', action: () => duplicateSubject(subjectId) },
        { icon: '📊', text: 'View Analytics', action: () => viewSubjectAnalytics(subjectId) },
        { icon: '🎯', text: 'Set Goal', action: () => createSubjectGoal(subjectId) },
        { icon: '📝', text: 'Add Note', action: () => createSubjectNote(subjectId) },
        { icon: '📤', text: 'Export Data', action: () => exportSubjectData(subjectId) },
        { icon: '🗑️', text: 'Delete', action: () => deleteSubjectWithConfirmation(subjectId), danger: true }
    ];
    
    menu.innerHTML = menuItems.map(item => `
        <div class="menu-item ${item.danger ? 'danger' : ''}" style="
            padding: 12px 16px;
            display: flex;
            align-items: center;
            gap: 12px;
            cursor: pointer;
            transition: all 0.2s ease;
            color: ${item.danger ? 'var(--accent-danger)' : 'var(--text-primary)'};
        " onclick="${item.action.name}('${subjectId}')">
            <span style="font-size: 16px;">${item.icon}</span>
            <span>${item.text}</span>
        </div>
    `).join('');
    
    // Position menu
    const rect = event.target.getBoundingClientRect();
    menu.style.left = (rect.left - 100) + 'px';
    menu.style.top = (rect.bottom + 5) + 'px';
    
    document.body.appendChild(menu);
    
    // Store action functions globally for onclick access
    window.editSubjectAdvanced = editSubjectAdvanced;
    window.duplicateSubject = duplicateSubject;
    window.viewSubjectAnalytics = viewSubjectAnalytics;
    window.createSubjectGoal = createSubjectGoal;
    window.createSubjectNote = createSubjectNote;
    window.exportSubjectData = exportSubjectData;
    window.deleteSubjectWithConfirmation = deleteSubjectWithConfirmation;
    
    // Remove menu on click outside
    setTimeout(() => {
        document.addEventListener('click', function removeMenu(e) {
            if (!menu.contains(e.target)) {
                menu.remove();
                document.removeEventListener('click', removeMenu);
            }
        });
    }, 10);
}

function editSubjectAdvanced(subjectId) {
    const subject = appState.subjects[subjectId];
    if (!subject) return;
    
    // Create advanced edit modal
    const modal = document.createElement('div');
    modal.className = 'modal show';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2 class="modal-title">✏️ Edit ${subject.name}</h2>
                <button class="modal-close" onclick="this.closest('.modal').remove()">×</button>
            </div>
            
            <form onsubmit="saveSubjectEdits('${subjectId}', event)">
                <div class="form-group">
                    <label class="form-label">Subject Name</label>
                    <input type="text" class="form-input" id="edit-name" value="${subject.name}" required>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Subject Code</label>
                    <input type="text" class="form-input" id="edit-code" value="${subject.code}" required>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Faculty Name</label>
                    <input type="text" class="form-input" id="edit-faculty" value="${subject.faculty}" required>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Credits</label>
                    <input type="number" class="form-input" id="edit-credits" value="${subject.credits}" min="1" max="8" required>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Category</label>
                    <select class="form-input" id="edit-category" required>
                        <option value="Basic Science" ${subject.category === 'Basic Science' ? 'selected' : ''}>Basic Science</option>
                        <option value="Professional Core" ${subject.category === 'Professional Core' ? 'selected' : ''}>Professional Core</option>
                        <option value="Engineering Science" ${subject.category === 'Engineering Science' ? 'selected' : ''}>Engineering Science</option>
                        <option value="Professional Elective" ${subject.category === 'Professional Elective' ? 'selected' : ''}>Professional Elective</option>
                        <option value="Open Elective" ${subject.category === 'Open Elective' ? 'selected' : ''}>Open Elective</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Icon</label>
                    <div class="icon-picker">
                        <input type="text" class="form-input" id="edit-icon" value="${subject.icon}" maxlength="2">
                        <div class="icon-suggestions">
                            ${['📚', '🔬', '💻', '⚙️', '📐', '🧮', '🎯', '📝', '🏗️', '🌳'].map(icon => 
                                `<span class="icon-option" onclick="document.getElementById('edit-icon').value='${icon}'">${icon}</span>`
                            ).join('')}
                        </div>
                    </div>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Color</label>
                    <div class="color-picker">
                        <input type="color" class="form-input" id="edit-color" value="${subject.color}">
                        <div class="color-presets">
                            ${['#667eea', '#4ecdc4', '#45b7d1', '#f9ca24', '#f0932b', '#eb4d4b', '#6c5ce7', '#fd79a8'].map(color => 
                                `<div class="color-preset" style="background: ${color};" onclick="document.getElementById('edit-color').value='${color}'"></div>`
                            ).join('')}
                        </div>
                    </div>
                </div>
                
                <div style="display: flex; gap: 12px; justify-content: center; margin-top: 24px;">
                    <button type="submit" class="btn btn-primary">💾 Save Changes</button>
                    <button type="button" class="btn btn-secondary" onclick="this.closest('.modal').remove()">❌ Cancel</button>
                </div>
            </form>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Store save function globally
    window.saveSubjectEdits = function(subjectId, event) {
        event.preventDefault();
        
        const updatedSubject = {
            ...appState.subjects[subjectId],
            name: document.getElementById('edit-name').value,
            code: document.getElementById('edit-code').value,
            faculty: document.getElementById('edit-faculty').value,
            credits: parseInt(document.getElementById('edit-credits').value),
            category: document.getElementById('edit-category').value,
            icon: document.getElementById('edit-icon').value,
            color: document.getElementById('edit-color').value
        };
        
        appState.subjects[subjectId] = updatedSubject;
        saveAppData();
        location.reload(); // Refresh to show changes
        showNotification('Subject Updated', `${updatedSubject.name} has been updated successfully!`, 'success');
    };
}

function duplicateSubject(subjectId) {
    const subject = appState.subjects[subjectId];
    if (!subject) return;
    
    const newId = `${subjectId}_copy_${Date.now()}`;
    const duplicatedSubject = {
        ...subject,
        id: newId,
        name: `${subject.name} (Copy)`,
        studyTime: 0,
        materials: [],
        sessions: [],
        goals: [],
        notes: []
    };
    
    appState.subjects[newId] = duplicatedSubject;
    saveAppData();
    location.reload();
    showNotification('Subject Duplicated', `Created a copy of ${subject.name}`, 'success');
}

function viewSubjectAnalytics(subjectId) {
    const subject = appState.subjects[subjectId];
    if (!subject) return;
    
    // Switch to progress view and filter by subject
    switchContentWithAnimation('progress');
    document.querySelector('[data-content="progress"]').classList.add('active');
    document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
    document.querySelector('[data-content="progress"]').classList.add('active');
    
    // Highlight subject in charts
    setTimeout(() => {
        if (progressCharts.subject) {
            progressCharts.subject.setActiveElements([{datasetIndex: 0, index: Object.keys(appState.subjects).indexOf(subjectId)}]);
            progressCharts.subject.update();
        }
    }, 500);
    
    showNotification('Analytics View', `Showing analytics for ${subject.name}`, 'info');
}

function createSubjectGoal(subjectId) {
    const subject = appState.subjects[subjectId];
    if (!subject) return;
    
    const goal = prompt(`Set a study goal for ${subject.name}:\n\nExample: "Complete 5 hours this week"`);
    if (goal && goal.trim()) {
        const newGoal = {
            id: Date.now(),
            subject: subjectId,
            title: goal.trim(),
            target: 0,
            current: 0,
            deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            created: new Date().toISOString(),
            status: 'active'
        };
        
        appState.goals.push(newGoal);
        if (!subject.goals) subject.goals = [];
        subject.goals.push(newGoal.id);
        
        saveAppData();
        showNotification('Goal Created', `New goal set for ${subject.name}`, 'success');
    }
}

function createSubjectNote(subjectId) {
    const subject = appState.subjects[subjectId];
    if (!subject) return;
    
    const noteTitle = prompt(`Create a note for ${subject.name}:\n\nNote title:`);
    if (noteTitle && noteTitle.trim()) {
        const newNote = {
            id: Date.now(),
            subject: subjectId,
            title: noteTitle.trim(),
            content: '',
            created: new Date().toISOString(),
            updated: new Date().toISOString(),
            tags: []
        };
        
        appState.notes.push(newNote);
        if (!subject.notes) subject.notes = [];
        subject.notes.push(newNote.id);
        
        saveAppData();
        showNotification('Note Created', `New note created for ${subject.name}`, 'success');
        
        // Switch to notes view
        setTimeout(() => {
            switchContentWithAnimation('notes');
            document.querySelector('[data-content="notes"]').classList.add('active');
        }, 1000);
    }
}

function deleteSubjectWithConfirmation(subjectId) {
    const subject = appState.subjects[subjectId];
    if (!subject) return;
    
    const confirmation = confirm(`⚠️ Delete "${subject.name}"?\n\nThis will permanently remove:\n• All study time data (${formatTime(subject.studyTime)})\n• All uploaded materials (${subject.materials.length} files)\n• All session history (${subject.sessions.length} sessions)\n• All related goals and notes\n\nThis action cannot be undone!\n\nType "DELETE" to confirm:`);
    
    if (confirmation) {
        const finalConfirm = prompt(`Type "DELETE" to permanently remove ${subject.name}:`);
        if (finalConfirm === 'DELETE') {
            // Remove related data
            appState.goals = appState.goals.filter(goal => goal.subject !== subjectId);
            appState.notes = appState.notes.filter(note => note.subject !== subjectId);
            
            delete appState.subjects[subjectId];
            saveAppData();
            location.reload();
            showNotification('Subject Deleted', `${subject.name} has been permanently removed`, 'success');
        } else {
            showNotification('Deletion Cancelled', 'Subject was not deleted', 'info');
        }
    }
}

function addNewSubject() {
    // Create advanced add subject modal
    const modal = document.createElement('div');
    modal.className = 'modal show';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2 class="modal-title">➕ Add New Subject</h2>
                <button class="modal-close" onclick="this.closest('.modal').remove()">×</button>
            </div>
            
            <form onsubmit="saveNewSubjectAdvanced(event)">
                <div class="form-group">
                    <label class="form-label">Subject Name *</label>
                    <input type="text" class="form-input" id="new-name" placeholder="e.g., Advanced Mathematics" required>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Subject Code *</label>
                    <input type="text" class="form-input" id="new-code" placeholder="e.g., MATH301" required>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Faculty Name *</label>
                    <input type="text" class="form-input" id="new-faculty" placeholder="e.g., Dr. Smith" required>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Credits *</label>
                    <input type="number" class="form-input" id="new-credits" value="4" min="1" max="8" required>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Category *</label>
                    <select class="form-input" id="new-category" required>
                        <option value="">Select Category</option>
                        <option value="Basic Science">Basic Science</option>
                        <option value="Professional Core">Professional Core</option>
                        <option value="Engineering Science">Engineering Science</option>
                        <option value="Professional Elective">Professional Elective</option>
                        <option value="Open Elective">Open Elective</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Icon</label>
                    <div class="icon-picker">
                        <input type="text" class="form-input" id="new-icon" value="📚" maxlength="2">
                        <div class="icon-suggestions">
                            ${['📚', '🔬', '💻', '⚙️', '📐', '🧮', '🎯', '📝', '🏗️', '🌳'].map(icon => 
                                `<span class="icon-option" onclick="document.getElementById('new-icon').value='${icon}'">${icon}</span>`
                            ).join('')}
                        </div>
                    </div>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Color</label>
                    <div class="color-picker">
                        <input type="color" class="form-input" id="new-color" value="#667eea">
                        <div class="color-presets">
                            ${['#667eea', '#4ecdc4', '#45b7d1', '#f9ca24', '#f0932b', '#eb4d4b', '#6c5ce7', '#fd79a8'].map(color => 
                                `<div class="color-preset" style="background: ${color};" onclick="document.getElementById('new-color').value='${color}'"></div>`
                            ).join('')}
                        </div>
                    </div>
                </div>
                
                <div style="display: flex; gap: 12px; justify-content: center; margin-top: 24px;">
                    <button type="submit" class="btn btn-primary">💾 Add Subject</button>
                    <button type="button" class="btn btn-secondary" onclick="this.closest('.modal').remove()">❌ Cancel</button>
                </div>
            </form>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Store save function globally
    window.saveNewSubjectAdvanced = function(event) {
        event.preventDefault();
        
        const name = document.getElementById('new-name').value.trim();
        const code = document.getElementById('new-code').value.trim();
        const faculty = document.getElementById('new-faculty').value.trim();
        const credits = parseInt(document.getElementById('new-credits').value);
        const category = document.getElementById('new-category').value;
        const icon = document.getElementById('new-icon').value || '📚';
        const color = document.getElementById('new-color').value;
        
        if (!name || !code || !faculty || !category) {
            showNotification('Missing Information', 'Please fill in all required fields', 'error');
            return;
        }
        
        // Generate unique ID
        const newId = name.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 8) + '_' + Date.now().toString().slice(-6);
        
        const newSubject = {
            id: newId,
            name: name,
            code: code,
            faculty: faculty,
            credits: credits,
            category: category,
            icon: icon,
            color: color,
            studyTime: 0,
            materials: [],
            sessions: [],
            goals: [],
            notes: []
        };
        
        appState.subjects[newId] = newSubject;
        saveAppData();
        location.reload();
        showNotification('Subject Added', `${name} has been added successfully!`, 'success');
    };
}

// ========== ENHANCED FILE HANDLING ==========
function handleDragOver(e) {
    e.preventDefault();
    this.classList.add('dragover');
    this.style.transform = 'scale(1.02)';
}

function handleDragLeave(e) {
    e.preventDefault();
    this.classList.remove('dragover');
    this.style.transform = 'scale(1)';
}

function handleDrop(e) {
    e.preventDefault();
    this.classList.remove('dragover');
    this.style.transform = 'scale(1)';
    
    const files = Array.from(e.dataTransfer.files);
    const subjectId = getSubjectFromElement(this);
    if (subjectId) {
        uploadFilesWithProgress(subjectId, files);
    }
}

function handleFileUpload(subjectId) {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.accept = '.pdf,.doc,.docx,.ppt,.pptx,.txt,.jpg,.jpeg,.png,.gif,.mp4,.avi,.mov';
    
    input.onchange = function(e) {
        const files = Array.from(e.target.files);
        uploadFilesWithProgress(subjectId, files);
    };
    
    input.click();
}

function uploadFilesWithProgress(subjectId, files) {
    const subject = appState.subjects[subjectId];
    if (!subject) return;
    
    if (!files || files.length === 0) return;
    
    // Create progress modal
    const progressModal = createUploadProgressModal(files.length);
    document.body.appendChild(progressModal);
    
    let uploadedCount = 0;
    const totalFiles = files.length;
    let totalSize = 0;
    let uploadedSize = 0;
    
    // Calculate total size
    files.forEach(file => totalSize += file.size);
    
    files.forEach((file, index) => {
        if (file.size > 50 * 1024 * 1024) { // 50MB limit
            updateUploadProgress(progressModal, index, file.name, 'error', 'File too large (max 50MB)');
            uploadedCount++;
            if (uploadedCount === totalFiles) {
                setTimeout(() => progressModal.remove(), 2000);
            }
            return;
        }
        
        const reader = new FileReader();
        
        reader.onprogress = function(e) {
            if (e.lengthComputable) {
                const progress = (e.loaded / e.total) * 100;
                updateUploadProgress(progressModal, index, file.name, 'uploading', `${Math.round(progress)}%`);
            }
        };
        
        reader.onload = function(e) {
            const fileData = {
                id: Date.now() + Math.random(),
                name: file.name,
                size: file.size,
                type: file.type,
                data: e.target.result,
                uploadedAt: new Date().toISOString(),
                tags: [],
                description: ''
            };
            
            subject.materials.push(fileData);
            uploadedCount++;
            uploadedSize += file.size;
            
            updateUploadProgress(progressModal, index, file.name, 'success', '✅ Uploaded');
            
            if (uploadedCount === totalFiles) {
                saveAppData();
                updateMaterialsCount(subjectId);
                
                setTimeout(() => {
                    progressModal.remove();
                    showNotification('Upload Complete', 
                        `${totalFiles} file(s) uploaded to ${subject.name}\nTotal size: ${formatFileSize(uploadedSize)}`, 'success');
                }, 1000);
            }
        };
        
        reader.onerror = function() {
            updateUploadProgress(progressModal, index, file.name, 'error', '❌ Failed');
            uploadedCount++;
            if (uploadedCount === totalFiles) {
                setTimeout(() => progressModal.remove(), 2000);
            }
        };
        
        reader.readAsDataURL(file);
    });
}

function createUploadProgressModal(fileCount) {
    const modal = document.createElement('div');
    modal.className = 'modal show';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2 class="modal-title">📤 Uploading Files</h2>
            </div>
            <div class="upload-progress-list" id="uploadProgressList">
                ${Array(fileCount).fill(0).map((_, i) => `
                    <div class="upload-item" id="upload-item-${i}">
                        <div class="upload-filename">Preparing...</div>
                        <div class="upload-status">⏳ Waiting</div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
    return modal;
}

function updateUploadProgress(modal, index, filename, status, message) {
    const item = modal.querySelector(`#upload-item-${index}`);
    if (item) {
        const filenameEl = item.querySelector('.upload-filename');
        const statusEl = item.querySelector('.upload-status');
        
        filenameEl.textContent = filename;
        statusEl.textContent = message;
        
        item.className = `upload-item ${status}`;
    }
}

// ========== ENHANCED MATERIALS MODAL ==========
function viewMaterials(subjectId) {
    const subject = appState.subjects[subjectId];
    if (!subject) return;
    
    currentMaterialsSubject = subjectId;
    
    // Create enhanced materials modal
    const modal = document.createElement('div');
    modal.className = 'modal show';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 800px;">
            <div class="modal-header">
                <h2 class="modal-title">${subject.icon} ${subject.name} Materials</h2>
                <button class="modal-close" onclick="this.closest('.modal').remove()">×</button>
            </div>
            
            <div class="materials-toolbar">
                <div class="materials-stats">
                    <span class="stat">📁 ${subject.materials.length} files</span>
                    <span class="stat">💾 ${formatFileSize(subject.materials.reduce((sum, f) => sum + f.size, 0))}</span>
                </div>
                <div class="materials-actions">
                    <button class="btn btn-secondary" onclick="sortMaterials('name')">🔤 Sort by Name</button>
                    <button class="btn btn-secondary" onclick="sortMaterials('date')">📅 Sort by Date</button>
                    <button class="btn btn-secondary" onclick="sortMaterials('size')">📊 Sort by Size</button>
                    <button class="btn btn-primary" onclick="uploadFile('${subjectId}')">📎 Upload Files</button>
                </div>
            </div>
            
            <div class="materials-list" id="materialsList">
                ${renderMaterialsList(subject.materials, subjectId)}
            </div>
            
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="this.closest('.modal').remove()">❌ Close</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Store sort function globally
    window.sortMaterials = function(criteria) {
        const materials = subject.materials;
        
        switch(criteria) {
            case 'name':
                materials.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case 'date':
                materials.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));
                break;
            case 'size':
                materials.sort((a, b) => b.size - a.size);
                break;
        }
        
        document.getElementById('materialsList').innerHTML = renderMaterialsList(materials, subjectId);
        showNotification('Materials Sorted', `Sorted by ${criteria}`, 'info');
    };
}

function renderMaterialsList(materials, subjectId) {
    if (materials.length === 0) {
        return `
            <div style="text-align: center; padding: 60px 20px; color: var(--text-secondary);">
                <div style="font-size: 64px; margin-bottom: 20px;">📁</div>
                <h3 style="margin-bottom: 12px; color: var(--text-primary);">No materials uploaded yet</h3>
                <p style="margin-bottom: 24px;">Upload your study materials to get started</p>
                <button class="btn btn-primary" onclick="uploadFile('${subjectId}')">📎 Upload Files</button>
            </div>
        `;
    }
    
    return materials.map(file => {
        const fileIcon = getAdvancedFileIcon(file.type, file.name);
        const uploadDate = new Date(file.uploadedAt);
        const relativeTime = getRelativeTime(uploadDate);
        
        return `
            <div class="file-item enhanced">
                <div class="file-icon-container">
                    <div class="file-icon">${fileIcon}</div>
                    <div class="file-type">${getFileExtension(file.name).toUpperCase()}</div>
                </div>
                <div class="file-info">
                    <div class="file-name">${file.name}</div>
                    <div class="file-meta">
                        <span class="file-size">${formatFileSize(file.size)}</span>
                        <span class="file-date" title="${uploadDate.toLocaleString()}">${relativeTime}</span>
                        ${file.description ? `<span class="file-desc">${file.description}</span>` : ''}
                    </div>
                    ${file.tags && file.tags.length > 0 ? `
                        <div class="file-tags">
                            ${file.tags.map(tag => `<span class="file-tag">${tag}</span>`).join('')}
                        </div>
                    ` : ''}
                </div>
                <div class="file-actions">
                    <button class="file-btn" onclick="previewFile('${subjectId}', '${file.id}')" title="Preview">👁️</button>
                    <button class="file-btn" onclick="downloadFile('${subjectId}', '${file.id}')" title="Download">📥</button>
                    <button class="file-btn" onclick="shareFile('${subjectId}', '${file.id}')" title="Share">🔗</button>
                    <button class="file-btn" onclick="editFileInfo('${subjectId}', '${file.id}')" title="Edit Info">✏️</button>
                    <button class="file-btn danger" onclick="deleteFileWithConfirmation('${subjectId}', '${file.id}')" title="Delete">🗑️</button>
                </div>
            </div>
        `;
    }).join('');
}

function getAdvancedFileIcon(mimeType, filename) {
    const ext = getFileExtension(filename).toLowerCase();
    
    // Video files
    if (mimeType.includes('video') || ['mp4', 'avi', 'mov', 'wmv', 'flv'].includes(ext)) return '🎥';
    
    // Audio files
    if (mimeType.includes('audio') || ['mp3', 'wav', 'flac', 'm4a'].includes(ext)) return '🎵';
    
    // Code files
    if (['js', 'html', 'css', 'py', 'java', 'cpp', 'c', 'php', 'rb'].includes(ext)) return '💻';
    
    // Archive files
    if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) return '📦';
    
    // Existing mappings
    if (mimeType.includes('pdf')) return '📄';
    if (mimeType.includes('word') || mimeType.includes('document') || ext === 'docx') return '📝';
    if (mimeType.includes('powerpoint') || mimeType.includes('presentation') || ext === 'pptx') return '📊';
    if (mimeType.includes('spreadsheet') || ext === 'xlsx') return '📈';
    if (mimeType.includes('image')) return '🖼️';
    if (mimeType.includes('text') || ext === 'txt') return '📃';
    
    return '📁';
}

function getFileExtension(filename) {
    return filename.split('.').pop() || '';
}

function getRelativeTime(date) {
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    
    if (diffDays > 7) return date.toLocaleDateString();
    if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    if (diffHours > 0) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffMinutes > 0) return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
    return 'Just now';
}

// ========== STUDY TIMER ENHANCEMENTS ==========
function startStudying(subjectId) {
    const subject = appState.subjects[subjectId];
    if (!subject) return;
    
    currentStudySubject = subjectId;
    appState.timer.currentSubject = subjectId;
    
    // Create enhanced timer modal
    const modal = document.createElement('div');
    modal.className = 'modal show';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2 class="modal-title">${subject.icon} Studying ${subject.name}</h2>
                <button class="modal-close" onclick="closeTimerModal()">×</button>
            </div>
            
            <div class="timer-container">
                <div class="timer-display" id="timerDisplay">00:00:00</div>
                
                <div class="timer-mode-selector">
                    <button class="mode-btn active" data-mode="study" onclick="setTimerMode('study')">📚 Study</button>
                    <button class="mode-btn" data-mode="pomodoro" onclick="setTimerMode('pomodoro')">🍅 Pomodoro</button>
                    <button class="mode-btn" data-mode="break" onclick="setTimerMode('break')">☕ Break</button>
                </div>
                
                <div class="timer-controls">
                    <button class="timer-btn start" id="startBtn" onclick="startTimer()">▶️ Start</button>
                    <button class="timer-btn pause hidden" id="pauseBtn" onclick="pauseTimer()">⏸️ Pause</button>
                    <button class="timer-btn stop hidden" id="stopBtn" onclick="stopTimer()">⏹️ Stop</button>
                    <button class="timer-btn reset" id="resetBtn" onclick="resetTimer()">🔄 Reset</button>
                </div>
                
                <div class="timer-stats">
                    <div class="timer-stat">
                        <span class="timer-stat-value" id="sessionTime">0:00</span>
                        <span class="timer-stat-label">Session Time</span>
                    </div>
                    <div class="timer-stat">
                        <span class="timer-stat-value" id="dailyProgress">${Math.round((subject.studyTime / (appState.settings.dailyGoal * 3600)) * 100)}%</span>
                        <span class="timer-stat-label">Daily Goal</span>
                    </div>
                    <div class="timer-stat">
                        <span class="timer-stat-value" id="totalSessions">${subject.sessions.length}</span>
                        <span class="timer-stat-label">Total Sessions</span>
                    </div>
                    <div class="timer-stat">
                        <span class="timer-stat-value" id="streakCount">${calculateSubjectStreak(subjectId)}</span>
                        <span class="timer-stat-label">Streak (Days)</span>
                    </div>
                </div>
                
                <div class="daily-goal-progress">
                    <div class="goal-ring">
                        <svg class="goal-ring-svg" viewBox="0 0 120 120">
                            <circle cx="60" cy="60" r="50" fill="none" stroke="var(--bg-tertiary)" stroke-width="8"/>
                            <circle cx="60" cy="60" r="50" fill="none" stroke="var(--accent-primary)" stroke-width="8" 
                                stroke-dasharray="314" stroke-dashoffset="${314 - (314 * (subject.studyTime / (appState.settings.dailyGoal * 3600)))}" 
                                stroke-linecap="round" transform="rotate(-90 60 60)" id="goalProgressRing"/>
                        </svg>
                        <div class="goal-ring-text">
                            <div class="goal-ring-value">${Math.round((subject.studyTime / (appState.settings.dailyGoal * 3600)) * 100)}%</div>
                            <div class="goal-ring-label">Daily Goal</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    resetTimer();
    
    // Store global functions
    window.closeTimerModal = function() {
        modal.remove();
        resetTimer();
        currentStudySubject = null;
        appState.timer.currentSubject = null;
    };
    
    window.setTimerMode = function(mode) {
        document.querySelectorAll('.mode-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelector(`[data-mode="${mode}"]`).classList.add('active');
        appState.timer.mode = mode;
        
        // Set different durations based on mode
        switch(mode) {
            case 'pomodoro':
                appState.timer.duration = appState.settings.workDuration * 60;
                break;
            case 'break':
                appState.timer.duration = appState.settings.breakDuration * 60;
                break;
            default:
                appState.timer.duration = null; // Unlimited for study mode
        }
        
        resetTimer();
    };
}

function startTimer() {
    if (studyTimer) return;
    
    startTime = Date.now() - pausedTime;
    studyTimer = setInterval(updateEnhancedTimer, 1000);
    appState.timer.isRunning = true;
    
    toggleTimerButtons('running');
    
    // Show notification
    const subject = appState.subjects[currentStudySubject];
    showNotification('Timer Started', `Study session for ${subject.name} has begun!`, 'success');
    
    // Add visual feedback
    document.body.classList.add('timer-running');
}

function pauseTimer() {
    if (!studyTimer) return;
    
    clearInterval(studyTimer);
    studyTimer = null;
    pausedTime = Date.now() - startTime;
    appState.timer.isRunning = false;
    
    toggleTimerButtons('paused');
    showNotification('Timer Paused', 'Study session paused', 'warning');
    
    document.body.classList.remove('timer-running');
}

function stopTimer() {
    if (!studyTimer && pausedTime === 0) return;
    
    const sessionTime = studyTimer ? Date.now() - startTime : pausedTime;
    const sessionSeconds = Math.floor(sessionTime / 1000);
    
    // Only count sessions longer than 1 minute
    if (sessionSeconds < 60) {
        showNotification('Session Too Short', 'Sessions must be at least 1 minute to be counted', 'warning');
        resetTimer();
        return;
    }
    
    // Update subject data
    const subject = appState.subjects[currentStudySubject];
    if (subject) {
        subject.studyTime += sessionSeconds;
        
        // Add detailed session record
        const sessionRecord = {
            id: Date.now(),
            date: new Date().toISOString(),
            duration: sessionSeconds,
            type: appState.timer.mode || 'study',
            startTime: new Date(startTime).toISOString(),
            endTime: new Date().toISOString(),
            pauseCount: 0, // Could track pauses in future
            productivity: Math.random() * 20 + 80 // Placeholder productivity score
        };
        
        subject.sessions.push(sessionRecord);
        
        // Record for analytics
        recordEnhancedStudySession(currentStudySubject, sessionSeconds, sessionRecord);
        
        // Check for achievements
        checkAchievements(currentStudySubject, sessionSeconds);
    }
    
    if (studyTimer) {
        clearInterval(studyTimer);
        studyTimer = null;
    }
    
    appState.timer.isRunning = false;
    appState.timer.totalSessions++;
    
    updateProgress(currentStudySubject);
    saveAppData();
    
    // Enhanced completion notification
    const sessionMinutes = Math.floor(sessionSeconds / 60);
    const sessionHours = Math.floor(sessionMinutes / 60);
    const displayTime = sessionHours > 0 ? 
        `${sessionHours}h ${sessionMinutes % 60}m` : 
        `${sessionMinutes}m`;
    
    showNotification('Study Session Complete', 
        `🎉 Great job! You studied for ${displayTime}.\n📈 Progress updated!\n🔥 Keep the momentum going!`, 'success');
    
    document.body.classList.remove('timer-running');
    
    // Auto-close timer after 3 seconds
    setTimeout(() => {
        const modal = document.querySelector('.modal:has(#timerDisplay)');
        if (modal) modal.remove();
        currentStudySubject = null;
        appState.timer.currentSubject = null;
    }, 3000);
}

function updateEnhancedTimer() {
    if (!startTime) return;
    
    const elapsed = Date.now() - startTime;
    const totalSeconds = Math.floor(elapsed / 1000);
    
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    const display = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    
    const timerDisplay = document.getElementById('timerDisplay');
    if (timerDisplay) {
        timerDisplay.textContent = display;
        
        // Add pulsing effect every second
        timerDisplay.classList.add('pulse');
        setTimeout(() => timerDisplay.classList.remove('pulse'), 100);
    }
    
    // Update session time stat
    const sessionTimeEl = document.getElementById('sessionTime');
    if (sessionTimeEl) {
        const sessionMinutes = Math.floor(totalSeconds / 60);
        sessionTimeEl.textContent = sessionMinutes > 0 ? `${Math.floor(sessionMinutes / 60)}:${(sessionMinutes % 60).toString().padStart(2, '0')}` : '0:00';
    }
    
    // Update daily goal ring
    if (currentStudySubject) {
        updateDailyGoalRing(currentStudySubject, totalSeconds);
    }
    
    // Pomodoro mode countdown
    if (appState.timer.mode === 'pomodoro' && appState.timer.duration) {
        const remaining = appState.timer.duration - totalSeconds;
        if (remaining <= 0) {
            // Pomodoro completed
            pauseTimer();
            showNotification('Pomodoro Complete!', '🍅 Time for a break! Take 5 minutes to recharge.', 'success');
            // Auto-switch to break mode
            setTimeout(() => {
                if (document.querySelector('[data-mode="break"]')) {
                    document.querySelector('[data-mode="break"]').click();
                }
            }, 1000);
        }
    }
}

function updateDailyGoalRing(subjectId, additionalSeconds = 0) {
    const subject = appState.subjects[subjectId];
    if (!subject) return;
    
    const totalTime = subject.studyTime + additionalSeconds;
    const goalTime = appState.settings.dailyGoal * 3600;
    const progress = Math.min(totalTime / goalTime, 1);
    
    const ring = document.getElementById('goalProgressRing');
    const ringText = document.querySelector('.goal-ring-value');
    
    if (ring) {
        const circumference = 314;
        const offset = circumference - (circumference * progress);
        ring.style.strokeDashoffset = offset;
        
        // Change color based on progress
        if (progress >= 1) {
            ring.style.stroke = '#10b981'; // Green when complete
        } else if (progress >= 0.8) {
            ring.style.stroke = '#f59e0b'; // Orange when close
        } else {
            ring.style.stroke = 'var(--accent-primary)'; // Default color
        }
    }
    
    if (ringText) {
        ringText.textContent = `${Math.round(progress * 100)}%`;
    }
}

function toggleTimerButtons(state) {
    const startBtn = document.getElementById('startBtn');
    const pauseBtn = document.getElementById('pauseBtn');
    const stopBtn = document.getElementById('stopBtn');
    const resetBtn = document.getElementById('resetBtn');
    
    if (startBtn && pauseBtn && stopBtn) {
        switch(state) {
            case 'running':
                startBtn.classList.add('hidden');
                pauseBtn.classList.remove('hidden');
                stopBtn.classList.remove('hidden');
                if (resetBtn) resetBtn.disabled = true;
                break;
            case 'paused':
                startBtn.classList.remove('hidden');
                pauseBtn.classList.add('hidden');
                stopBtn.classList.remove('hidden');
                if (resetBtn) resetBtn.disabled = false;
                break;
            case 'stopped':
            default:
                startBtn.classList.remove('hidden');
                pauseBtn.classList.add('hidden');
                stopBtn.classList.add('hidden');
                if (resetBtn) resetBtn.disabled = false;
                break;
        }
    }
}

function resetTimer() {
    if (studyTimer) {
        clearInterval(studyTimer);
        studyTimer = null;
    }
    
    startTime = null;
    pausedTime = 0;
    appState.timer.isRunning = false;
    
    const timerDisplay = document.getElementById('timerDisplay');
    if (timerDisplay) {
        timerDisplay.textContent = '00:00:00';
    }
    
    const sessionTimeEl = document.getElementById('sessionTime');
    if (sessionTimeEl) {
        sessionTimeEl.textContent = '0:00';
    }
    
    toggleTimerButtons('stopped');
    document.body.classList.remove('timer-running');
}

function calculateSubjectStreak(subjectId) {
    const subject = appState.subjects[subjectId];
    if (!subject || !subject.sessions.length) return 0;
    
    let streak = 0;
    const today = new Date();
    
    for (let i = 0; i < 365; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toDateString();
        
        const hasSession = subject.sessions.some(session => 
            new Date(session.date).toDateString() === dateStr
        );
        
        if (hasSession) {
            streak++;
        } else if (i > 0) {
            break;
        }
    }
    
    return streak;
}

// ========== ENHANCED PROGRESS TRACKING ==========
function recordEnhancedStudySession(subjectId, duration, sessionRecord) {
    const today = new Date().toDateString();
    const thisWeek = getWeekKey(new Date());
    const thisMonth = getMonthKey(new Date());
    
    // Update analytics data
    if (!appState.analytics.dailyData[today]) {
        appState.analytics.dailyData[today] = { total: 0, subjects: {} };
    }
    appState.analytics.dailyData[today].total += duration;
    appState.analytics.dailyData[today].subjects[subjectId] = 
        (appState.analytics.dailyData[today].subjects[subjectId] || 0) + duration;
    
    if (!appState.analytics.weeklyData[thisWeek]) {
        appState.analytics.weeklyData[thisWeek] = { total: 0, subjects: {} };
    }
    appState.analytics.weeklyData[thisWeek].total += duration;
    appState.analytics.weeklyData[thisWeek].subjects[subjectId] = 
        (appState.analytics.weeklyData[thisWeek].subjects[subjectId] || 0) + duration;
    
    if (!appState.analytics.monthlyData[thisMonth]) {
        appState.analytics.monthlyData[thisMonth] = { total: 0, subjects: {} };
    }
    appState.analytics.monthlyData[thisMonth].total += duration;
    appState.analytics.monthlyData[thisMonth].subjects[subjectId] = 
        (appState.analytics.monthlyData[thisMonth].subjects[subjectId] || 0) + duration;
    
    // Update global stats
    appState.analytics.totalStudyTime += duration;
    
    // Calculate average session length
    const allSessions = Object.values(appState.subjects).flatMap(s => s.sessions || []);
    appState.analytics.averageSessionLength = allSessions.length > 0 ? 
        allSessions.reduce((sum, s) => sum + s.duration, 0) / allSessions.length : 0;
    
    // Calculate productivity score (based on session consistency and duration)
    appState.analytics.productivityScore = calculateProductivityScore();
    
    // Update streak
    appState.analytics.streak = calculateOverallStreak();
    
    saveAppData();
    updateAllProgress();
    updateDashboardStats();
    
    // Update charts if visible
    if (progressCharts.weekly) {
        updateChartsData();
    }
}

function getWeekKey(date) {
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - date.getDay());
    return startOfWeek.toISOString().split('T')[0];
}

function getMonthKey(date) {
    return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
}

function calculateProductivityScore() {
    const last7Days = [];
    const today = new Date();
    
    for (let i = 0; i < 7; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toDateString();
        const dayData = appState.analytics.dailyData[dateStr];
        last7Days.push(dayData ? dayData.total : 0);
    }
    
    // Score based on consistency (how many days studied) and average time
    const studyDays = last7Days.filter(time => time > 0).length;
    const avgTime = last7Days.reduce((sum, time) => sum + time, 0) / 7;
    const goalTime = appState.settings.dailyGoal * 3600;
    
    const consistencyScore = (studyDays / 7) * 50; // Max 50 points for consistency
    const timeScore = Math.min((avgTime / goalTime) * 50, 50); // Max 50 points for meeting time goals
    
    return Math.round(consistencyScore + timeScore);
}

function calculateOverallStreak() {
    let streak = 0;
    const today = new Date();
    
    for (let i = 0; i < 365; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toDateString();
        
        const dayData = appState.analytics.dailyData[dateStr];
        if (dayData && dayData.total > 0) {
            streak++;
        } else if (i > 0) {
            break;
        }
    }
    
    return streak;
}

// ========== ACHIEVEMENT SYSTEM ==========
function checkAchievements(subjectId, sessionDuration) {
    const achievements = [
        {
            id: 'first_session',
            title: 'Getting Started',
            description: 'Complete your first study session',
            icon: '🌟',
            condition: () => appState.analytics.totalStudyTime > 0,
            points: 10
        },
        {
            id: 'study_streak_3',
            title: 'Consistency Builder',
            description: 'Study for 3 days in a row',
            icon: '🔥',
            condition: () => appState.analytics.streak >= 3,
            points: 25
        },
        {
            id: 'study_streak_7',
            title: 'Week Warrior',
            description: 'Study for 7 days in a row',
            icon: '💪',
            condition: () => appState.analytics.streak >= 7,
            points: 50
        },
        {
            id: 'long_session',
            title: 'Marathon Studier',
            description: 'Complete a 2+ hour study session',
            icon: '⏰',
            condition: () => sessionDuration >= 7200,
            points: 30
        },
        {
            id: 'daily_goal',
            title: 'Goal Crusher',
            description: 'Meet your daily study goal',
            icon: '🎯',
            condition: () => {
                const today = new Date().toDateString();
                const todayData = appState.analytics.dailyData[today];
                return todayData && todayData.total >= (appState.settings.dailyGoal * 3600);
            },
            points: 20
        },
        {
            id: 'early_bird',
            title: 'Early Bird',
            description: 'Study before 8 AM',
            icon: '🌅',
            condition: () => new Date().getHours() < 8,
            points: 15
        },
        {
            id: 'night_owl',
            title: 'Night Owl',
            description: 'Study after 10 PM',
            icon: '🦉',
            condition: () => new Date().getHours() >= 22,
            points: 15
        },
        {
            id: 'subject_master',
            title: 'Subject Master',
            description: 'Study a subject for 20+ hours',
            icon: '🏆',
            condition: () => appState.subjects[subjectId] && appState.subjects[subjectId].studyTime >= 72000,
            points: 100
        },
        {
            id: 'productivity_hero',
            title: 'Productivity Hero',
            description: 'Achieve 90+ productivity score',
            icon: '🚀',
            condition: () => appState.analytics.productivityScore >= 90,
            points: 75
        }
    ];
    
    achievements.forEach(achievement => {
        // Check if already earned
        if (appState.analytics.achievements.find(a => a.id === achievement.id)) {
            return;
        }
        
        // Check if condition is met
        if (achievement.condition()) {
            // Award achievement
            const earnedAchievement = {
                ...achievement,
                earnedAt: new Date().toISOString(),
                sessionId: Date.now()
            };
            
            appState.analytics.achievements.push(earnedAchievement);
            
            // Add to achievement queue for display
            achievementQueue.push(earnedAchievement);
            
            // Show achievement notification
            showAchievementNotification(earnedAchievement);
        }
    });
    
    saveAppData();
}

function showAchievementNotification(achievement) {
    // Create achievement notification
    const notification = document.createElement('div');
    notification.className = 'achievement-notification';
    notification.innerHTML = `
        <div class="achievement-content">
            <div class="achievement-icon">${achievement.icon}</div>
            <div class="achievement-text">
                <div class="achievement-title">Achievement Unlocked!</div>
                <div class="achievement-name">${achievement.title}</div>
                <div class="achievement-desc">${achievement.description}</div>
                <div class="achievement-points">+${achievement.points} points</div>
            </div>
        </div>
    `;
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #667eea, #764ba2);
        color: white;
        padding: 20px;
        border-radius: 12px;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
        z-index: 10001;
        max-width: 350px;
        animation: achievementSlideIn 0.5s ease;
        cursor: pointer;
    `;
    
    document.body.appendChild(notification);
    
    // Play achievement sound (if audio is enabled)
    try {
        const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmMiCEaY1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmMiCEaY1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmMiCEaY1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmMiCEaY1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmMiCEaY1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmMiCE');
        audio.volume = 0.3;
        audio.play().catch(() => {}); // Ignore errors if audio fails
    } catch (e) {}
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        notification.style.animation = 'achievementSlideOut 0.5s ease';
        setTimeout(() => notification.remove(), 500);
    }, 5000);
    
    // Click to dismiss
    notification.addEventListener('click', () => {
        notification.style.animation = 'achievementSlideOut 0.5s ease';
        setTimeout(() => notification.remove(), 500);
    });
}

function renderAchievements() {
    const achievementsGrid = document.getElementById('achievementsGrid');
    if (!achievementsGrid) return;
    
    const allAchievements = [
        { id: 'first_session', title: 'Getting Started', description: 'Complete your first study session', icon: '🌟' },
        { id: 'study_streak_3', title: 'Consistency Builder', description: 'Study for 3 days in a row', icon: '🔥' },
        { id: 'study_streak_7', title: 'Week Warrior', description: 'Study for 7 days in a row', icon: '💪' },
        { id: 'long_session', title: 'Marathon Studier', description: 'Complete a 2+ hour study session', icon: '⏰' },
        { id: 'daily_goal', title: 'Goal Crusher', description: 'Meet your daily study goal', icon: '🎯' },
        { id: 'early_bird', title: 'Early Bird', description: 'Study before 8 AM', icon: '🌅' },
        { id: 'night_owl', title: 'Night Owl', description: 'Study after 10 PM', icon: '🦉' },
        { id: 'subject_master', title: 'Subject Master', description: 'Study a subject for 20+ hours', icon: '🏆' },
        { id: 'productivity_hero', title: 'Productivity Hero', description: 'Achieve 90+ productivity score', icon: '🚀' }
    ];
    
    achievementsGrid.innerHTML = allAchievements.map(achievement => {
        const earned = appState.analytics.achievements.find(a => a.id === achievement.id);
        return `
            <div class="achievement-badge ${earned ? 'unlocked' : 'locked'}">
                <div class="achievement-icon">${achievement.icon}</div>
                <div class="achievement-title">${achievement.title}</div>
                <div class="achievement-desc">${achievement.description}</div>
                ${earned ? `<div class="achievement-date">Earned ${new Date(earned.earnedAt).toLocaleDateString()}</div>` : ''}
            </div>
        `;
    }).join('');
}

// ========== ENHANCED CHARTS ==========
function initializeProgressCharts() {
    if (typeof Chart === 'undefined') {
        console.warn('Chart.js not loaded');
        return;
    }
    
    initializeWeeklyChart();
    initializeSubjectChart();
    initializePerformanceChart();
    initializeGoalsChart();
    initializeHeatmap();
}

function initializeWeeklyChart() {
    const ctx = document.getElementById('weeklyProgressChart');
    if (!ctx) return;
    
    const theme = document.body.getAttribute('data-theme');
    const textColor = theme === 'dark' ? '#ffffff' : '#0f172a';
    const gridColor = theme === 'dark' ? '#2d2e36' : '#e2e8f0';
    
    if (progressCharts.weekly) {
        progressCharts.weekly.destroy();
    }
    
    progressCharts.weekly = new Chart(ctx, {
        type: 'line',
        data: {
            labels: getLast7Days(),
            datasets: [{
                label: 'Study Hours',
                data: getWeeklyStudyData(),
                borderColor: '#667eea',
                backgroundColor: 'rgba(102, 126, 234, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#667eea',
                pointBorderColor: '#ffffff',
                pointBorderWidth: 2,
                pointRadius: 6,
                pointHoverRadius: 8
            }, {
                label: 'Goal',
                data: Array(7).fill(appState.settings.dailyGoal),
                borderColor: '#10b981',
                backgroundColor: 'transparent',
                borderWidth: 2,
                borderDash: [5, 5],
                pointRadius: 0,
                fill: false
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                intersect: false,
                mode: 'index'
            },
            plugins: {
                legend: {
                    labels: { 
                        color: textColor,
                        usePointStyle: true,
                        padding: 20
                    }
                },
                tooltip: {
                    backgroundColor: theme === 'dark' ? '#1a1b23' : '#ffffff',
                    titleColor: textColor,
                    bodyColor: textColor,
                    borderColor: gridColor,
                    borderWidth: 1,
                    cornerRadius: 8,
                    displayColors: false,
                    callbacks: {
                        label: function(context) {
                            return `${context.dataset.label}: ${context.raw}h`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { 
                        color: textColor,
                        callback: function(value) {
                            return value + 'h';
                        }
                    },
                    grid: { color: gridColor }
                },
                x: {
                    ticks: { color: textColor },
                    grid: { color: gridColor }
                }
            }
        }
    });
}

function initializeSubjectChart() {
    const ctx = document.getElementById('subjectProgressChart');
    if (!ctx) return;
    
    const theme = document.body.getAttribute('data-theme');
    const textColor = theme === 'dark' ? '#ffffff' : '#0f172a';
    
    if (progressCharts.subject) {
        progressCharts.subject.destroy();
    }
    
    const subjects = Object.values(appState.subjects);
    const data = subjects.map(subject => Math.max((subject.studyTime || 0) / 3600, 0.01));
    const colors = subjects.map(subject => subject.color);
    const labels = subjects.map(subject => subject.name);
    
    progressCharts.subject = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: colors,
                borderWidth: 3,
                borderColor: theme === 'dark' ? '#1a1b23' : '#ffffff',
                cutout: '60%',
                hoverOffset: 10
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { 
                        color: textColor,
                        usePointStyle: true,
                        padding: 15,
                        font: {
                            size: 12
                        }
                    }
                },
                tooltip: {
                    backgroundColor: theme === 'dark' ? '#1a1b23' : '#ffffff',
                    titleColor: textColor,
                    bodyColor: textColor,
                    borderColor: colors[0],
                    borderWidth: 1,
                    cornerRadius: 8,
                    callbacks: {
                        label: function(context) {
                            const hours = Math.floor(context.raw);
                            const minutes = Math.floor((context.raw - hours) * 60);
                            return `${context.label}: ${hours}h ${minutes}m`;
                        }
                    }
                }
            }
        }
    });
}

function initializePerformanceChart() {
    const ctx = document.getElementById('performanceTrendChart');
    if (!ctx) return;
    
    const theme = document.body.getAttribute('data-theme');
    const textColor = theme === 'dark' ? '#ffffff' : '#0f172a';
    const gridColor = theme === 'dark' ? '#2d2e36' : '#e2e8f0';
    
    if (progressCharts.performance) {
        progressCharts.performance.destroy();
    }
    
    progressCharts.performance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: getLast7Days(),
            datasets: [{
                label: 'Daily Efficiency %',
                data: getPerformanceData(),
                backgroundColor: 'rgba(102, 126, 234, 0.8)',
                borderColor: '#667eea',
                borderWidth: 2,
                borderRadius: 6,
                borderSkipped: false
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: { color: textColor }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    ticks: { 
                        color: textColor,
                        callback: function(value) {
                            return value + '%';
                        }
                    },
                    grid: { color: gridColor }
                },
                x: {
                    ticks: { color: textColor },
                    grid: { color: gridColor }
                }
            }
        }
    });
}

function initializeGoalsChart() {
    const ctx = document.getElementById('goalProgressChart');
    if (!ctx) return;
    
    const theme = document.body.getAttribute('data-theme');
    const textColor = theme === 'dark' ? '#ffffff' : '#0f172a';
    const gridColor = theme === 'dark' ? '#2d2e36' : '#e2e8f0';
    
    if (progressCharts.goals) {
        progressCharts.goals.destroy();
    }
    
    const subjects = Object.values(appState.subjects);
    const currentProgress = subjects.map(subject => {
        const dailyGoalSeconds = appState.settings.dailyGoal * 3600;
        return Math.min((subject.studyTime / dailyGoalSeconds) * 100, 100);
    });
    
    progressCharts.goals = new Chart(ctx, {
        type: 'radar',
        data: {
            labels: subjects.map(s => s.name),
            datasets: [{
                label: 'Current Progress',
                data: currentProgress,
                borderColor: '#667eea',
                backgroundColor: 'rgba(102, 126, 234, 0.2)',
                borderWidth: 2,
                pointBackgroundColor: '#667eea',
                pointBorderColor: '#ffffff',
                pointBorderWidth: 2
            }, {
                label: 'Target (100%)',
                data: Array(subjects.length).fill(100),
                borderColor: '#10b981',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                borderWidth: 2,
                borderDash: [5, 5],
                pointRadius: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: { color: textColor }
                }
            },
            scales: {
                r: {
                    beginAtZero: true,
                    max: 100,
                    ticks: { 
                        color
