// Comment: PWA Setup
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/service-worker.js')
        .then(reg => console.log('Service Worker registered', reg))
        .catch(err => console.log('Service Worker registration failed', err));
}

// Comment: LocalStorage Data Structure
const appData = {
    users: { praksharvai: 'srm2025' },
    subjects: [
        {
            name: "Boundary Value Problems",
            code: "2IMABO2IT",
            credits: 4,
            faculty: "Dr. Prince Chelladurai S",
            progress: 65,
            studyTime: 0,
            materials: []
        },
        {
            name: "Data Structures and Algorithms",
            code: "2ICSC2O1J",
            credits: 4,
            faculty: "Dr. J. Marhharan",
            progress: 40,
            studyTime: 0,
            materials: []
        },
        {
            name: "Organization and Architecture",
            code: "2ICSC2O1J",
            credits: 4,
            faculty: "Dr. J. Marhharan",
            progress: 55,
            studyTime: 0,
            materials: []
        },
        {
            name: "Programming",
            code: "2ICSC2O3SP",
            credits: 4,
            faculty: "TBD",
            progress: 30,
            studyTime: 0,
            materials: []
        },
        {
            name: "Operating Systems",
            code: "2ICSC2O2J",
            credits: 4,
            faculty: "TBD",
            progress: 70,
            studyTime: 0,
            materials: []
        },
        {
            name: "Understanding Human Values",
            code: "2ILEM2O2IT",
            credits: 0,
            faculty: "TBD",
            progress: 20,
            studyTime: 0,
            materials: []
        },
        {
            name: "Professional Ethics",
            code: "2ILEM2O2IT",
            credits: 0,
            faculty: "TBD",
            progress: 10,
            studyTime: 0,
            materials: []
        }
    ],
    theme: 'light' // Default theme
};

// Comment: Load Saved Data from localStorage
function loadData() {
    const savedData = localStorage.getItem('academicHubData');
    if (savedData) {
        Object.assign(appData, JSON.parse(savedData));
    }
}

// Comment: Save Data to localStorage
function saveData() {
    localStorage.setItem('academicHubData', JSON.stringify(appData));
}

// Comment: Login Functionality
function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const error = document.getElementById('login-error');

    if (appData.users[username] === password) {
        document.getElementById('login-screen').classList.add('hidden');
        document.getElementById('main-app').classList.remove('hidden');
        loadDashboard();
        saveData();
    } else {
        error.classList.remove('hidden');
    }
}

// Comment: Particle Animation for Login
const canvas = document.getElementById('particle-canvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let particles = [];
for (let i = 0; i < 100; i++) {
    particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: Math.random() * 2 - 1,
        vy: Math.random() * 2 - 1,
        size: Math.random() * 2 + 1
    });
}

function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx = -p.vx;
        if (p.y < 0 || p.y > canvas.height) p.vy = -p.vy;
        ctx.fillStyle = var(--accent-primary);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
    });
    requestAnimationFrame(animateParticles);
}
animateParticles();

// Comment: Theme Toggle
function toggleTheme() {
    const body = document.body;
    body.classList.toggle('dark-theme');
    appData.theme = body.classList.contains('dark-theme') ? 'dark' : 'light';
    saveData();
}

// Comment: Load Dashboard (Generate Subject Cards)
function loadDashboard() {
    const grid = document.querySelector('.subject-grid');
    grid.innerHTML = '';
    appData.subjects.forEach((subject, index) => {
        const card = document.createElement('div');
        card.classList.add('subject-card');
        card.innerHTML = `
            <div class="subject-name">${subject.name}</div>
            <div class="subject-faculty">Faculty: ${subject.faculty}</div>
            <div class="subject-credits">Credits: ${subject.credits}</div>
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${subject.progress}%"></div>
            </div>
            <div class="study-time">Study Time: ${subject.studyTime} minutes</div>
            <div class="file-upload" ondrop="dropFile(event, ${index})" ondragover="allowDrop(event)">
                <div class="file-upload-text">Drag & Drop Files</div>
                <div class="file-upload-subtext">or click to upload materials</div>
            </div>
            <div class="materials-list" id="materials-${index}"></div>
        `;
        grid.appendChild(card);
        renderMaterials(index);
    });
}

// Comment: File Management with Base64 Encoding
function allowDrop(event) {
    event.preventDefault();
}

function dropFile(event, subjectIndex) {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file.size > 10 * 1024 * 1024) {
        alert('File too large (max 10MB)');
        return;
    }

    const reader = new FileReader();
    reader.onload = () => {
        appData.subjects[subjectIndex].materials.push({
            name: file.name,
            type: file.type,
            data: reader.result  // Base64 encoded
        });
        saveData();
        renderMaterials(subjectIndex);
    };
    reader.readAsDataURL(file);
}

function renderMaterials(subjectIndex) {
    const list = document.getElementById(`materials-${subjectIndex}`);
    list.innerHTML = '';
    appData.subjects[subjectIndex].materials.forEach((material, index) => {
        const item = document.createElement('div');
        item.innerHTML = `
            ${material.name} 
            <button onclick="downloadFile(${subjectIndex}, ${index})">Download</button>
            <button onclick="deleteFile(${subjectIndex}, ${index})">Delete</button>
        `;
        list.appendChild(item);
    });
}

function downloadFile(subjectIndex, fileIndex) {
    const material = appData.subjects[subjectIndex].materials[fileIndex];
    const link = document.createElement('a');
    link.href = material.data;
    link.download = material.name;
    link.click();
}

function deleteFile(subjectIndex, fileIndex) {
    if (confirm('Delete this file?')) {
        appData.subjects[subjectIndex].materials.splice(fileIndex, 1);
        saveData();
        renderMaterials(subjectIndex);
    }
}

// Comment: Sidebar Toggle for Mobile
function toggleSidebar() {
    const sidebar = document.querySelector('.sidebar');
    sidebar.classList.toggle('open');
}

// Comment: Navigation (Example for Dashboard)
document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', () => {
        // Handle navigation (add logic for section switching)
        console.log('Navigated to', item.dataset.section);
    });
});

// Comment: Live Clock (Asia/Kolkata)
function updateClock() {
    const now = new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' });
    document.getElementById('live-clock').textContent = now;
}
setInterval(updateClock, 1000);

// Comment: Load Initial Data
loadData();

// Comment: 3D Card Hover Effects (Using CSS for simplicity, enhance with JS if needed)
document.querySelectorAll('.subject-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        card.style.transform = `perspective(1000px) rotateY(${(x - rect.width / 2) / 20}deg) rotateX(${ (rect.height / 2 - y) / 20}deg)`;
    });
    card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(1000px) rotateY(0deg) rotateX(0deg)';
    });
});

// Comment: Service Worker for PWA Offline Caching (service-worker.js)
if (navigator.serviceWorker) {
    navigator.serviceWorker.register('/service-worker.js');
}
