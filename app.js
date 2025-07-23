// Synchronized Academic Hub JavaScript
class AcademicHub {
    constructor() {
        this.recognition = null;
        this.isListening = false;
        this.currentExpression = '';
        this.voices = [];
        this.selectedVoice = null;
        this.chatHistory = [];
        this.isDarkTheme = false;
        
        this.init();
    }

    init() {
        this.initVoiceRecognition();
        this.initTextToSpeech();
        this.bindEvents();
        this.loadSavedData();
        this.showNotification('Academic Hub initialized!', 'success');
    }

    // Voice Recognition Setup
    initVoiceRecognition() {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            this.recognition = new SpeechRecognition();
            
            this.recognition.continuous = false;
            this.recognition.interimResults = false;
            this.recognition.lang = 'en-US';
            
            this.recognition.onstart = () => {
                this.isListening = true;
                document.getElementById('voiceButton').classList.add('listening');
                document.getElementById('voiceStatus').textContent = 'Listening... Speak now!';
                document.getElementById('voiceRecording').style.display = 'block';
            };
            
            this.recognition.onend = () => {
                this.isListening = false;
                document.getElementById('voiceButton').classList.remove('listening');
                document.getElementById('voiceStatus').textContent = 'Click to start voice commands';
                document.getElementById('voiceRecording').style.display = 'none';
            };
            
            this.recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript.toLowerCase();
                this.processVoiceCommand(transcript);
            };
            
            this.recognition.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
                this.showNotification('Voice recognition error. Please try again.', 'error');
            };
        }
    }

    // Text to Speech Setup
    initTextToSpeech() {
        if ('speechSynthesis' in window) {
            speechSynthesis.onvoiceschanged = () => {
                this.voices = speechSynthesis.getVoices();
                this.selectedVoice = this.voices.find(voice => 
                    voice.lang.includes('en') && voice.name.toLowerCase().includes('female')
                ) || this.voices[0];
            };
        }
    }

    // Event Bindings
    bindEvents() {
        // Voice button
        document.getElementById('voiceButton').addEventListener('click', () => {
            this.toggleVoiceRecognition();
        });

        // Theme toggle
        document.getElementById('themeToggle').addEventListener('click', () => {
            this.toggleTheme();
        });

        // Chat input
        document.getElementById('chatInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendMessage();
            }
        });

        // Send button
        document.getElementById('sendButton').addEventListener('click', () => {
            this.sendMessage();
        });

        // Stop recording
        document.getElementById('stopRecording').addEventListener('click', () => {
            this.stopVoiceRecognition();
        });

        // Tool cards
        document.getElementById('calculatorTool').addEventListener('click', () => {
            this.openCalculator();
        });

        document.getElementById('timerTool').addEventListener('click', () => {
            this.startStudyTimer();
        });

        document.getElementById('notesTool').addEventListener('click', () => {
            this.openNotes();
        });

        // Calculator events
        this.bindCalculatorEvents();
        
        // Notes events
        this.bindNotesEvents();
    }

    // Calculator Event Bindings
    bindCalculatorEvents() {
        document.getElementById('closeCalculator').addEventListener('click', () => {
            document.getElementById('calculatorWidget').style.display = 'none';
        });

        document.getElementById('clearBtn').addEventListener('click', () => {
            this.clearCalculator();
        });

        document.getElementById('deleteBtn').addEventListener('click', () => {
            this.deleteLastDigit();
        });

        document.getElementById('equalsBtn').addEventListener('click', () => {
            this.calculateResult();
        });

        // Number buttons
        document.querySelectorAll('.calc-btn.number').forEach(btn => {
            btn.addEventListener('click', () => {
                this.addToExpression(btn.dataset.num);
            });
        });

        // Operator buttons
        document.querySelectorAll('.calc-btn.operator').forEach(btn => {
            btn.addEventListener('click', () => {
                this.addToExpression(btn.dataset.op);
            });
        });

        // Decimal button
        document.querySelector('.calc-btn.decimal').addEventListener('click', () => {
            this.addToExpression('.');
        });
    }

    // Notes Event Bindings
    bindNotesEvents() {
        document.getElementById('closeNotes').addEventListener('click', () => {
            document.getElementById('notesWidget').style.display = 'none';
        });

        document.getElementById('saveNotes').addEventListener('click', () => {
            this.saveNotes();
        });

        document.getElementById('clearNotes').addEventListener('click', () => {
            this.clearNotes();
        });
    }

    // Voice Recognition Control
    toggleVoiceRecognition() {
        if (!this.recognition) {
            this.showNotification('Voice recognition not supported', 'error');
            return;
        }

        if (this.isListening) {
            this.recognition.stop();
        } else {
            this.recognition.start();
        }
    }

    stopVoiceRecognition() {
        if (this.recognition && this.isListening) {
            this.recognition.stop();
        }
    }

    // Voice Command Processing
    processVoiceCommand(transcript) {
        console.log('Processing voice command:', transcript);

        // Math calculations
        if (this.isMathCommand(transcript)) {
            this.handleMathCommand(transcript);
            return;
        }

        // Timer commands
        if (transcript.includes('timer') || transcript.includes('set timer')) {
            this.handleTimerCommand(transcript);
            return;
        }

        // Notes commands
        if (transcript.includes('take a note') || transcript.includes('add note')) {
            this.handleNoteCommand(transcript);
            return;
        }

        // Calculator commands
        if (transcript.includes('calculator') || transcript.includes('open calculator')) {
            this.openCalculator();
            this.speak('Calculator opened');
            return;
        }

        // Theme commands
        if (transcript.includes('dark mode') || transcript.includes('dark theme')) {
            this.setTheme('dark');
            this.speak('Switched to dark theme');
            return;
        }

        if (transcript.includes('light mode') || transcript.includes('light theme')) {
            this.setTheme('light');
            this.speak('Switched to light theme');
            return;
        }

        // Default: Send to AI tutor
        this.sendAIMessage(transcript);
    }

    // Math Command Detection
    isMathCommand(transcript) {
        const mathKeywords = ['calculate', 'what is', 'solve', 'plus', 'minus', 'times', 'divided by', 'squared', 'equals'];
        return mathKeywords.some(keyword => transcript.includes(keyword));
    }

    // Math Command Handler
    handleMathCommand(transcript) {
        try {
            let expression = transcript
                .replace(/calculate|what is|solve|equals/g, '')
                .replace(/plus/g, '+')
                .replace(/minus/g, '-')
                .replace(/times|multiplied by/g, '*')
                .replace(/divided by/g, '/')
                .replace(/squared/g, '^2')
                .replace(/cubed/g, '^3')
                .trim();

            const result = math.evaluate(expression);
            
            document.getElementById('calculatorDisplay').textContent = result;
            this.openCalculator();
            
            const response = `The answer is ${result}`;
            this.addChatMessage(response, 'ai');
            this.speak(response);
            
        } catch (error) {
            const errorMsg = 'Sorry, I couldn\'t calculate that. Please try again.';
            this.addChatMessage(errorMsg, 'ai');
            this.speak(errorMsg);
        }
    }

    // Timer Command Handler
    handleTimerCommand(transcript) {
        const timeMatch = transcript.match(/(\d+)\s*(minute|minutes|hour|hours)/);
        
        if (timeMatch) {
            const duration = parseInt(timeMatch[1]);
            const unit = timeMatch[2];
            
            this.startTimer(duration, unit);
            this.speak(`Timer set for ${duration} ${unit}`);
        } else {
            this.startTimer(25, 'minutes');
            this.speak('Started 25-minute study timer');
        }
    }

    // Note Command Handler
    handleNoteCommand(transcript) {
        const noteContent = transcript
            .replace(/take a note|add note|note that/g, '')
            .trim();

        if (noteContent) {
            const timestamp = new Date().toLocaleString();
            const fullNote = `[${timestamp}] ${noteContent}`;
            
            const notesTextarea = document.getElementById('notesTextarea');
            notesTextarea.value += (notesTextarea.value ? '\n\n' : '') + fullNote;
            
            this.openNotes();
            this.speak('Note added');
            this.addChatMessage(`Note added: ${noteContent}`, 'ai');
        }
    }

    // Text to Speech
    speak(text) {
        if ('speechSynthesis' in window && this.selectedVoice && text) {
            speechSynthesis.cancel();
            
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.voice = this.selectedVoice;
            utterance.rate = 0.9;
            utterance.pitch = 1.0;
            
            speechSynthesis.speak(utterance);
        }
    }

    // Chat Functions
    sendMessage() {
        const input = document.getElementById('chatInput');
        const message = input.value.trim();
        
        if (!message) return;
        
        this.addChatMessage(message, 'user');
        input.value = '';
        
        // Simulate AI response
        setTimeout(() => {
            const response = this.generateAIResponse(message);
            this.addChatMessage(response, 'ai');
            this.speak(response.substring(0, 200));
        }, 1000);
    }

    sendAIMessage(message) {
        this.addChatMessage(message, 'user');
        
        setTimeout(() => {
            const response = this.generateAIResponse(message);
            this.addChatMessage(response, 'ai');
            this.speak(response.substring(0, 200));
        }, 1000);
    }

    addChatMessage(message, sender) {
        const chatMessages = document.getElementById('chatMessages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `${sender}-message`;
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        contentDiv.textContent = message;
        
        messageDiv.appendChild(contentDiv);
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        
        this.chatHistory.push({ sender, message, timestamp: new Date() });
        this.saveChatHistory();
    }

    generateAIResponse(message) {
        const lowerMessage = message.toLowerCase();
        
        if (lowerMessage.includes('math') || lowerMessage.includes('calculate')) {
            return "I can help you with mathematics! Try saying 'calculate 2 plus 2' or ask me to explain mathematical concepts.";
        }
        
        if (lowerMessage.includes('science') || lowerMessage.includes('physics') || lowerMessage.includes('chemistry')) {
            return "Science is fascinating! I can explain concepts in physics, chemistry, biology, and more. What would you like to learn about?";
        }
        
        if (lowerMessage.includes('history')) {
            return "History helps us understand our world! I can discuss different time periods, events, and historical figures. What era interests you?";
        }
        
        if (lowerMessage.includes('literature') || lowerMessage.includes('english')) {
            return "I love literature! I can help analyze texts, discuss authors, explain literary devices, and assist with writing. What would you like to explore?";
        }
        
        return "I'm your AI tutor assistant! I can help with any academic subject - mathematics, science, history, literature, and more. What would you like to learn about?";
    }

    // Calculator Functions
    openCalculator() {
        document.getElementById('calculatorWidget').style.display = 'block';
    }

    addToExpression(value) {
        const display = document.getElementById('calculatorDisplay');
        if (display.textContent === '0') {
            display.textContent = value;
        } else {
            display.textContent += value;
        }
        this.currentExpression = display.textContent;
    }

    clearCalculator() {
        document.getElementById('calculatorDisplay').textContent = '0';
        this.currentExpression = '';
    }

    deleteLastDigit() {
        const display = document.getElementById('calculatorDisplay');
        if (display.textContent.length > 1) {
            display.textContent = display.textContent.slice(0, -1);
        } else {
            display.textContent = '0';
        }
        this.currentExpression = display.textContent;
    }

    calculateResult() {
        try {
            const result = math.evaluate(this.currentExpression);
            document.getElementById('calculatorDisplay').textContent = result;
            this.speak(`Result is ${result}`);
        } catch (error) {
            document.getElementById('calculatorDisplay').textContent = 'Error';
            this.speak('Calculation error');
        }
    }

    // Timer Functions
    startTimer(duration, unit) {
        let seconds = duration;
        if (unit.includes('minute')) {
            seconds = duration * 60;
        } else if (unit.includes('hour')) {
            seconds = duration * 3600;
        }

        this.addChatMessage(`Timer started for ${duration} ${unit}`, 'ai');
        
        setTimeout(() => {
            this.showNotification(`Timer complete! ${duration} ${unit} finished.`, 'success');
            this.speak('Timer completed! Time for a break.');
        }, seconds * 1000);
    }

    startStudyTimer() {
        this.startTimer(25, 'minutes');
        this.speak('Started 25-minute Pomodoro study timer');
    }

    // Notes Functions
    openNotes() {
        document.getElementById('notesWidget').style.display = 'block';
    }

    saveNotes() {
        const notes = document.getElementById('notesTextarea').value;
        localStorage.setItem('academicHub_notes', notes);
        this.showNotification('Notes saved!', 'success');
        this.speak('Notes saved successfully');
    }

    clearNotes() {
        if (confirm('Clear all notes?')) {
            document.getElementById('notesTextarea').value = '';
            localStorage.removeItem('academicHub_notes');
            this.showNotification('Notes cleared', 'info');
        }
    }

    // Theme Functions
    toggleTheme() {
        this.isDarkTheme = !this.isDarkTheme;
        this.setTheme(this.isDarkTheme ? 'dark' : 'light');
    }

    setTheme(theme) {
        document.body.setAttribute('data-theme', theme);
        const themeToggle = document.getElementById('themeToggle');
        themeToggle.textContent = theme === 'dark' ? '☀️' : '🌙';
        
        localStorage.setItem('academicHub_theme', theme);
        this.isDarkTheme = theme === 'dark';
    }

    // Notification System
    showNotification(message, type = 'info') {
        const container = document.getElementById('notificationsContainer');
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        container.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 4000);
    }

    // Data Persistence
    saveChatHistory() {
        localStorage.setItem('academicHub_chatHistory', JSON.stringify(this.chatHistory.slice(-50)));
    }

    loadSavedData() {
        // Load theme
        const savedTheme = localStorage.getItem('academicHub_theme');
        if (savedTheme) {
            this.setTheme(savedTheme);
        }

        // Load notes
        const savedNotes = localStorage.getItem('academicHub_notes');
        if (savedNotes) {
            document.getElementById('notesTextarea').value = savedNotes;
        }

        // Load chat history
        const savedChat = localStorage.getItem('academicHub_chatHistory');
        if (savedChat) {
            this.chatHistory = JSON.parse(savedChat);
        }
    }
}

// Initialize Academic Hub
document.addEventListener('DOMContentLoaded', () => {
    window.academicHub = new AcademicHub();
    console.log('🎓 Academic Hub loaded with synchronized components!');
});
