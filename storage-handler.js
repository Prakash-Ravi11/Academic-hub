// ============ Advanced Storage Handler for Study Buddy Pro ============
class StudyBuddyStorage {
    constructor() {
        this.dbName = 'StudyBuddyPro';
        this.dbVersion = 1;
        this.db = null;
        this.initializeIndexedDB();
    }

    // ============ IndexedDB Setup ============
    async initializeIndexedDB() {
        try {
            const request = indexedDB.open(this.dbName, this.dbVersion);
            
            request.onerror = () => {
                console.error('IndexedDB failed to open');
                this.fallbackToLocalStorage();
            };

            request.onsuccess = (event) => {
                this.db = event.target.result;
                console.log('✅ IndexedDB initialized successfully');
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                
                // Create object stores
                if (!db.objectStoreNames.contains('users')) {
                    const userStore = db.createObjectStore('users', { keyPath: 'email' });
                    userStore.createIndex('id', 'id', { unique: true });
                }

                if (!db.objectStoreNames.contains('tasks')) {
                    const taskStore = db.createObjectStore('tasks', { keyPath: 'id' });
                    taskStore.createIndex('userEmail', 'userEmail', { unique: false });
                }

                if (!db.objectStoreNames.contains('files')) {
                    const fileStore = db.createObjectStore('files', { keyPath: 'id' });
                    fileStore.createIndex('userEmail', 'userEmail', { unique: false });
                    fileStore.createIndex('type', 'type', { unique: false });
                }

                if (!db.objectStoreNames.contains('settings')) {
                    const settingsStore = db.createObjectStore('settings', { keyPath: 'userEmail' });
                }
            };
        } catch (error) {
            console.error('IndexedDB initialization error:', error);
            this.fallbackToLocalStorage();
        }
    }

    // ============ File Upload & Processing ============
    async uploadFile(file, userEmail) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            const fileId = Date.now().toString();
            
            reader.onload = async (event) => {
                try {
                    const fileData = {
                        id: fileId,
                        userEmail: userEmail,
                        name: file.name,
                        type: file.type,
                        size: file.size,
                        data: event.target.result,
                        uploadedAt: new Date().toISOString(),
                        processed: false,
                        extractedTasks: []
                    };

                    // Process file based on type
                    const processedData = await this.processFile(fileData);
                    
                    // Store in IndexedDB
                    await this.storeFile(processedData);
                    
                    resolve(processedData);
                } catch (error) {
                    reject(error);
                }
            };

            reader.onerror = () => {
                reject(new Error('Failed to read file'));
            };

            // Read file as appropriate format
            if (file.type.startsWith('image/')) {
                reader.readAsDataURL(file);
            } else if (file.type === 'application/pdf') {
                reader.readAsArrayBuffer(file);
            } else {
                reader.readAsText(file);
            }
        });
    }

    // ============ File Processing Engine ============
    async processFile(fileData) {
        try {
            const extension = this.getFileExtension(fileData.name);
            let extractedTasks = [];

            switch (extension) {
                case '.txt':
                    extractedTasks = this.processTxtFile(fileData.data);
                    break;
                case '.json':
                    extractedTasks = this.processJsonFile(fileData.data);
                    break;
                case '.csv':
                    extractedTasks = this.processCsvFile(fileData.data);
                    break;
                case '.pdf':
                    extractedTasks = await this.processPdfFile(fileData.data);
                    break;
                case '.jpg':
                case '.jpeg':
                case '.png':
                    extractedTasks = await this.processImageFile(fileData.data);
                    break;
                default:
                    extractedTasks = this.processGenericTextFile(fileData.data);
            }

            fileData.extractedTasks = extractedTasks;
            fileData.processed = true;
            fileData.processedAt = new Date().toISOString();

            return fileData;
        } catch (error) {
            console.error('File processing error:', error);
            fileData.processed = false;
            fileData.error = error.message;
            return fileData;
        }
    }

    // ============ File Type Processors ============
    processTxtFile(content) {
        const lines = content.split('\n').filter(line => line.trim());
        const tasks = [];

        lines.forEach((line, index) => {
            const taskMatch = this.extractTaskFromLine(line);
            if (taskMatch) {
                tasks.push({
                    id: `txt_${Date.now()}_${index}`,
                    title: taskMatch.title,
                    time: taskMatch.time,
                    priority: taskMatch.priority || 'medium',
                    source: 'txt_file',
                    completed: false
                });
            }
        });

        return tasks;
    }

    processJsonFile(content) {
        try {
            const data = JSON.parse(content);
            const tasks = [];

            // Handle different JSON structures
            if (Array.isArray(data)) {
                data.forEach((item, index) => {
                    const task = this.normalizeJsonTask(item, index);
                    if (task) tasks.push(task);
                });
            } else if (data.tasks && Array.isArray(data.tasks)) {
                data.tasks.forEach((item, index) => {
                    const task = this.normalizeJsonTask(item, index);
                    if (task) tasks.push(task);
                });
            } else if (typeof data === 'object') {
                const task = this.normalizeJsonTask(data, 0);
                if (task) tasks.push(task);
            }

            return tasks;
        } catch (error) {
            console.error('JSON parsing error:', error);
            return [];
        }
    }

    processCsvFile(content) {
        const lines = content.split('\n').filter(line => line.trim());
        const tasks = [];

        if (lines.length < 2) return tasks;

        const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
        const titleIndex = headers.findIndex(h => h.includes('task') || h.includes('title') || h.includes('name'));
        const timeIndex = headers.findIndex(h => h.includes('time') || h.includes('date') || h.includes('due'));
        const priorityIndex = headers.findIndex(h => h.includes('priority') || h.includes('importance'));

        for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(',').map(v => v.trim());
            
            if (values.length >= Math.max(titleIndex + 1, 1)) {
                tasks.push({
                    id: `csv_${Date.now()}_${i}`,
                    title: values[titleIndex] || values[0] || `Task ${i}`,
                    time: values[timeIndex] || null,
                    priority: values[priorityIndex] || 'medium',
                    source: 'csv_file',
                    completed: false
                });
            }
        }

        return tasks;
    }

    async processPdfFile(arrayBuffer) {
        // Simulated PDF processing (would use PDF.js in real implementation)
        return new Promise((resolve) => {
            setTimeout(() => {
                const simulatedTasks = [
                    {
                        id: `pdf_${Date.now()}_1`,
                        title: 'Complete Assignment 1',
                        time: '2024-02-15 14:00',
                        priority: 'high',
                        source: 'pdf_file',
                        completed: false
                    },
                    {
                        id: `pdf_${Date.now()}_2`,
                        title: 'Study Chapter 5-7',
                        time: '2024-02-20 10:00',
                        priority: 'medium',
                        source: 'pdf_file',
                        completed: false
                    },
                    {
                        id: `pdf_${Date.now()}_3`,
                        title: 'Prepare for Final Exam',
                        time: '2024-03-01 09:00',
                        priority: 'high',
                        source: 'pdf_file',
                        completed: false
                    }
                ];
                resolve(simulatedTasks);
            }, 2000);
        });
    }

    async processImageFile(dataUrl) {
        // Simulated OCR processing (would use Tesseract.js in real implementation)
        return new Promise((resolve) => {
            setTimeout(() => {
                const simulatedTasks = [
                    {
                        id: `img_${Date.now()}_1`,
                        title: 'Review handwritten notes',
                        time: null,
                        priority: 'medium',
                        source: 'image_ocr',
                        completed: false
                    },
                    {
                        id: `img_${Date.now()}_2`,
                        title: 'Follow up on meeting points',
                        time: null,
                        priority: 'low',
                        source: 'image_ocr',
                        completed: false
                    }
                ];
                resolve(simulatedTasks);
            }, 3000);
        });
    }

    processGenericTextFile(content) {
        const lines = content.split(/[\n\r]+/).filter(line => line.trim());
        const tasks = [];

        lines.forEach((line, index) => {
            if (line.length > 5) { // Ignore very short lines
                const taskMatch = this.extractTaskFromLine(line);
                if (taskMatch) {
                    tasks.push({
                        id: `generic_${Date.now()}_${index}`,
                        title: taskMatch.title,
                        time: taskMatch.time,
                        priority: taskMatch.priority || 'medium',
                        source: 'text_file',
                        completed: false
                    });
                }
            }
        });

        return tasks;
    }

    // ============ Task Extraction Helpers ============
    extractTaskFromLine(line) {
        // Clean the line
        const cleanLine = line.trim().replace(/^[-*•]\s*/, '');
        
        // Skip empty or very short lines
        if (cleanLine.length < 3) return null;

        // Skip lines that look like headers or metadata
        if (/^(date|time|priority|status|notes?):/i.test(cleanLine)) return null;

        // Extract time patterns
        const timePatterns = [
            /(\d{1,2}:\d{2}\s*(AM|PM)?)/i,
            /(\d{1,2}\/\d{1,2}\/\d{2,4})/,
            /(monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i,
            /(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+\d{1,2}/i
        ];

        let extractedTime = null;
        let cleanTitle = cleanLine;

        timePatterns.forEach(pattern => {
            const match = cleanLine.match(pattern);
            if (match) {
                extractedTime = match[1];
                cleanTitle = cleanLine.replace(match[0], '').trim();
            }
        });

        // Extract priority indicators
        const priorityPatterns = [
            { pattern: /(!{3,}|urgent|URGENT|high|HIGH)/i, priority: 'high' },
            { pattern: /(!{1,2}|medium|MEDIUM|normal)/i, priority: 'medium' },
            { pattern: /(low|LOW|later|optional)/i, priority: 'low' }
        ];

        let priority = 'medium';
        priorityPatterns.forEach(({ pattern, priority: prio }) => {
            if (pattern.test(cleanTitle)) {
                priority = prio;
                cleanTitle = cleanTitle.replace(pattern, '').trim();
            }
        });

        // Clean up the title
        cleanTitle = cleanTitle
            .replace(/^(task|todo|do|complete|finish):\s*/i, '')
            .replace(/\s+/g, ' ')
            .trim();

        // Must have a meaningful title
        if (cleanTitle.length < 3) return null;

        return {
            title: cleanTitle,
            time: extractedTime,
            priority: priority
        };
    }

    normalizeJsonTask(item, index) {
        if (typeof item !== 'object') return null;

        const title = item.title || item.task || item.name || item.description || `Task ${index + 1}`;
        const time = item.time || item.date || item.due || item.deadline || null;
        const priority = (item.priority || item.importance || 'medium').toLowerCase();

        return {
            id: `json_${Date.now()}_${index}`,
            title: title.toString().trim(),
            time: time,
            priority: ['high', 'medium', 'low'].includes(priority) ? priority : 'medium',
            source: 'json_file',
            completed: item.completed || item.done || false
        };
    }

    getFileExtension(filename) {
        return filename.toLowerCase().substring(filename.lastIndexOf('.'));
    }

    // ============ IndexedDB Operations ============
    async storeFile(fileData) {
        if (!this.db) {
            return this.storeInLocalStorage('files', fileData);
        }

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['files'], 'readwrite');
            const store = transaction.objectStore('files');
            const request = store.put(fileData);

            request.onsuccess = () => resolve(fileData);
            request.onerror = () => reject(request.error);
        });
    }

    async getFilesByUser(userEmail) {
        if (!this.db) {
            return this.getFromLocalStorage('files').filter(f => f.userEmail === userEmail);
        }

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['files'], 'readonly');
            const store = transaction.objectStore('files');
            const index = store.index('userEmail');
            const request = index.getAll(userEmail);

            request.onsuccess = () => resolve(request.result || []);
            request.onerror = () => reject(request.error);
        });
    }

    async deleteFile(fileId) {
        if (!this.db) {
            const files = this.getFromLocalStorage('files');
            const updated = files.filter(f => f.id !== fileId);
            localStorage.setItem('studybuddy_files', JSON.stringify(updated));
            return;
        }

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['files'], 'readwrite');
            const store = transaction.objectStore('files');
            const request = store.delete(fileId);

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    // ============ Data Export/Import ============
    async exportUserData(userEmail) {
        try {
            const userData = await this.getUserData(userEmail);
            const files = await this.getFilesByUser(userEmail);
            
            const exportData = {
                user: userData,
                files: files.map(f => ({
                    ...f,
                    data: f.data.length > 100000 ? '[Large file data omitted]' : f.data
                })),
                exportDate: new Date().toISOString(),
                version: '1.0'
            };

            const blob = new Blob([JSON.stringify(exportData, null, 2)], {
                type: 'application/json'
            });

            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `study-buddy-backup-${userEmail}-${new Date().toISOString().split('T')[0]}.json`;
            a.click();
            URL.revokeObjectURL(url);

            return true;
        } catch (error) {
            console.error('Export error:', error);
            throw error;
        }
    }

    async importUserData(file, userEmail) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = async (event) => {
                try {
                    const importData = JSON.parse(event.target.result);
                    
                    // Validate import data structure
                    if (!importData.user || !importData.files) {
                        throw new Error('Invalid backup file format');
                    }

                    // Import user data
                    const userData = { ...importData.user, email: userEmail };
                    await this.storeUserData(userData);

                    // Import files
                    for (const fileData of importData.files) {
                        fileData.userEmail = userEmail;
                        fileData.id = `imported_${Date.now()}_${Math.random()}`;
                        await this.storeFile(fileData);
                    }

                    resolve({
                        success: true,
                        tasksImported: importData.files.reduce((total, f) => total + f.extractedTasks.length, 0),
                        filesImported: importData.files.length
                    });
                } catch (error) {
                    reject(error);
                }
            };

            reader.onerror = () => reject(new Error('Failed to read backup file'));
            reader.readAsText(file);
        });
    }

    // ============ Cloud Storage Integration (Mock) ============
    async syncToCloud(userEmail) {
        // Simulated cloud sync
        return new Promise((resolve) => {
            setTimeout(() => {
                const syncResult = {
                    success: true,
                    timestamp: new Date().toISOString(),
                    filesUploaded: Math.floor(Math.random() * 10) + 1,
                    dataSize: Math.floor(Math.random() * 1000) + 100 + ' KB'
                };
                resolve(syncResult);
            }, 2000);
        });
    }

    async syncFromCloud(userEmail) {
        // Simulated cloud sync
        return new Promise((resolve) => {
            setTimeout(() => {
                const syncResult = {
                    success: true,
                    timestamp: new Date().toISOString(),
                    filesDownloaded: Math.floor(Math.random() * 5) + 1,
                    newTasks: Math.floor(Math.random() * 15) + 1
                };
                resolve(syncResult);
            }, 1500);
        });
    }

    // ============ LocalStorage Fallback ============
    fallbackToLocalStorage() {
        console.warn('Using localStorage fallback for data storage');
        this.db = null;
    }

    storeInLocalStorage(type, data) {
        const key = `studybuddy_${type}`;
        const existing = JSON.parse(localStorage.getItem(key) || '[]');
        existing.push(data);
        localStorage.setItem(key, JSON.stringify(existing));
        return data;
    }

    getFromLocalStorage(type) {
        const key = `studybuddy_${type}`;
        return JSON.parse(localStorage.getItem(key) || '[]');
    }

    // ============ User Data Management ============
    async storeUserData(userData) {
        if (!this.db) {
            localStorage.setItem('studybuddy_user', JSON.stringify(userData));
            return userData;
        }

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['users'], 'readwrite');
            const store = transaction.objectStore('users');
            const request = store.put(userData);

            request.onsuccess = () => resolve(userData);
            request.onerror = () => reject(request.error);
        });
    }

    async getUserData(userEmail) {
        if (!this.db) {
            return JSON.parse(localStorage.getItem('studybuddy_user') || 'null');
        }

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['users'], 'readonly');
            const store = transaction.objectStore('users');
            const request = store.get(userEmail);

            request.onsuccess = () => resolve(request.result || null);
            request.onerror = () => reject(request.error);
        });
    }

    // ============ File Management UI Helpers ============
    createFilePreview(fileData) {
        const preview = document.createElement('div');
        preview.className = 'file-preview';
        preview.innerHTML = `
            <div class="file-header">
                <div class="file-icon">${this.getFileIcon(fileData.type)}</div>
                <div class="file-info">
                    <h4>${fileData.name}</h4>
                    <p>${this.formatFileSize(fileData.size)} • ${fileData.extractedTasks.length} tasks</p>
                </div>
                <button class="btn btn-danger btn-sm" onclick="storage.deleteFile('${fileData.id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
            <div class="file-tasks">
                ${fileData.extractedTasks.map(task => `
                    <div class="task-preview">
                        <span class="task-title">${task.title}</span>
                        ${task.time ? `<span class="task-time">${task.time}</span>` : ''}
                    </div>
                `).join('')}
            </div>
        `;
        return preview;
    }

    getFileIcon(fileType) {
        const icons = {
            'text/plain': '📄',
            'application/json': '📋',
            'text/csv': '📊',
            'application/pdf': '📕',
            'image/jpeg': '🖼️',
            'image/png': '🖼️',
            'image/jpg': '🖼️'
        };
        return icons[fileType] || '📁';
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // ============ Error Handling ============
    handleError(error, context) {
        console.error(`Storage error in ${context}:`, error);
        
        // Show user-friendly error message
        if (window.app && window.app.showNotification) {
            window.app.showNotification(`Storage error: ${error.message}`, 'error');
        }
        
        // Fallback to localStorage if IndexedDB fails
        if (error.name === 'InvalidStateError' || error.name === 'NotFoundError') {
            this.fallbackToLocalStorage();
        }
    }
}

// ============ Initialize Storage Handler ============
const storage = new StudyBuddyStorage();

// Export for use in main application
if (typeof module !== 'undefined' && module.exports) {
    module.exports = StudyBuddyStorage;
}
