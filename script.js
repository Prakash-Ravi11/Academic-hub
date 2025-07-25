// Loading Screen
window.addEventListener('load', () => {
    setTimeout(() => {
        document.getElementById('loading-screen').style.opacity = '0';
        setTimeout(() => {
            document.getElementById('loading-screen').style.display = 'none';
            checkUsername();
        }, 1000);
    }, 2000); // Stunning effect duration
});

// Username Prompt and Display
function checkUsername() {
    const savedName = localStorage.getItem('userName');
    if (!savedName) {
        document.getElementById('username-modal').style.display = 'flex';
    } else {
        document.getElementById('main-app').style.display = 'block';
        document.getElementById('user-name-display').textContent = `Welcome, ${savedName}`;
    }
}

function saveUsername() {
    const name = document.getElementById('username-input').value.trim();
    if (name) {
        localStorage.setItem('userName', name);
        document.getElementById('username-modal').style.display = 'none';
        document.getElementById('main-app').style.display = 'block';
        document.getElementById('user-name-display').textContent = `Welcome, ${name}`;
    }
}

// Theme Toggle
function toggleTheme() {
    document.body.classList.toggle('dark-theme');
    localStorage.setItem('theme', document.body.classList.contains('dark-theme') ? 'dark' : 'light');
}

// Load Saved Theme
if (localStorage.getItem('theme') === 'dark') {
    document.body.classList.add('dark-theme');
}

// File Drop Handling with Base64
function handleDrop(event, subject) {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    const reader = new FileReader();
    reader.onload = () => {
        const base64 = reader.result;
        let files = JSON.parse(localStorage.getItem(subject) || '[]');
        files.push(base64);
        localStorage.setItem(subject, JSON.stringify(files));
        alert('File uploaded and encoded!');
    };
    reader.readAsDataURL(file);
}

// OpenRouter API Integration (ChatGPT)
async function chatWithAI(message, apiKey) {
    if (!apiKey) {
        alert('Enter OpenRouter API key in settings');
        return;
    }
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: 'gpt-3.5-turbo',
            messages: [{ role: 'user', content: message }]
        })
    });
    const data = await response.json();
    console.log(data.choices[0].message.content); // Display in app UI
}

// TensorFlow.js Integration (Simple Prediction Example)
async function predictProgress() {
    const model = tf.sequential();
    model.add(tf.layers.dense({units: 1, inputShape: [1]}));
    model.compile({loss: 'meanSquaredError', optimizer: 'sgd'});
    // Train with dummy data
    const xs = tf.tensor2d([1, 2, 3, 4], [4, 1]);
    const ys = tf.tensor2d([1, 3, 5, 7], [4, 1]);
    await model.fit(xs, ys, {epochs: 10});
    const prediction = model.predict(tf.tensor2d([5], [1, 1]));
    console.log(prediction.dataSync()[0]); // Use in progress bar
}
predictProgress();

// Java Integration (Simple Embedded Example - Use for calculations)
class SimpleCalculator {
    static int add(int a, int b) {
        return a + b;
    }
}
// Note: Java isn't native in browser; simulate or use JS equivalent. For real Java, need backend.

// Cloud Storage Simulation (Using localStorage as fallback)
function syncToCloud(data, apiKey) {
    // Simulate cloud sync with OpenRouter (not storage API, so local fallback)
    localStorage.setItem('cloudData', JSON.stringify(data));
    console.log('Synced to "cloud" (localStorage)');
}
brython(); // Initialize Brython
// Run Python code
document.body.insertAdjacentHTML('beforeend', '<script type="text/python">from python_script import *</script>');
