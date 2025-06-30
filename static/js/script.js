// Global variables
let currentStream = null;
let currentImageData = null;

// Switch between tabs
function switchTab(tabName) {
    // Remove active class from all tabs
    document.querySelectorAll('.nav-tab').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

    // Add active class to selected tab
    document.querySelector(`[onclick="switchTab('${tabName}')"]`).classList.add('active');
    document.getElementById(tabName + '-tab').classList.add('active');

    // Hide results when switching tabs
    hideResults();
}

// Handle file upload
function handleFileUpload(event) {
    const file = event.target.files[0];
    if (file) {
        if (file.size > 5 * 1024 * 1024) {
            alert('Ukuran file terlalu besar. Maksimal 5MB.');
            return;
        }

        const reader = new FileReader();
        reader.onload = function(e) {
            currentImageData = e.target.result;
            showPreview(e.target.result);
        };
        reader.readAsDataURL(file);
    }
}

// Camera functions
async function startCamera() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { 
                facingMode: 'environment',
                width: { ideal: 1280 },
                height: { ideal: 720 }
            } 
        });
        currentStream = stream;
        document.getElementById('video').srcObject = stream;
    } catch (error) {
        alert('Tidak dapat mengakses kamera. Pastikan izin kamera telah diberikan.');
        console.error('Camera error:', error);
    }
}

function capturePhoto() {
    const video = document.getElementById('video');
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');

    if (video.videoWidth === 0) {
        alert('Kamera belum siap. Silakan mulai kamera terlebih dahulu.');
        return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);

    const imageData = canvas.toDataURL('image/jpeg', 0.8);
    currentImageData = imageData;
    showPreview(imageData);
}

function stopCamera() {
    if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
        currentStream = null;
        document.getElementById('video').srcObject = null;
    }
}

// Show image preview
function showPreview(imageSrc) {
    const preview = document.getElementById('preview');
    const previewSection = document.getElementById('preview-section');
    
    preview.src = imageSrc;
    previewSection.classList.remove('hidden');
    hideResults();
}

// Simulate AI analysis
function analyzeImage() {
    if (!currentImageData) {
        alert('Tidak ada gambar untuk dianalisis.');
        return;
    }

    showLoading();

    // Simulate API call with timeout
    setTimeout(() => {
        hideLoading();
        showResults();
    }, 3000);
}

function showLoading() {
    document.getElementById('loading-section').style.display = 'block';
}

function hideLoading() {
    document.getElementById('loading-section').style.display = 'none';
}

// Show mock results
function showResults() {
    const diseases = [
        { name: 'Hawar Daun Bakteri', confidence: 85, color: '#f44336' },
        { name: 'Bercak Daun Coklat', confidence: 72, color: '#ff9800' },
        { name: 'Blast Padi', confidence: 68, color: '#ff5722' },
        { name: 'Sehat', confidence: 15, color: '#4caf50' }
    ];

    const resultsList = document.getElementById('results-list');
    resultsList.innerHTML = '';

    diseases.forEach((disease, index) => {
        const resultItem = document.createElement('div');
        resultItem.className = 'result-item';
        resultItem.style.animationDelay = `${index * 0.1}s`;
        
        resultItem.innerHTML = `
            <div>
                <strong>${disease.name}</strong>
                <div style="color: #666; font-size: 0.9rem;">Tingkat Kepercayaan: ${disease.confidence}%</div>
            </div>
            <div class="confidence-bar">
                <div class="confidence-fill" style="width: ${disease.confidence}%; background-color: ${disease.color};"></div>
            </div>
        `;
        
        resultsList.appendChild(resultItem);
    });

    document.getElementById('results-section').classList.remove('hidden');
}

function hideResults() {
    document.getElementById('results-section').classList.add('hidden');
    document.getElementById('preview-section').classList.add('hidden');
}

// Auto-start camera on mobile for better UX
window.addEventListener('load', () => {
    if (window.innerWidth <= 768) {
        // Mobile device - could auto-start camera
        console.log('Mobile device detected');
    }
});

// Drag and drop functionality
const uploadArea = document.querySelector('.upload-area');

['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    uploadArea.addEventListener(eventName, preventDefaults, false);
});

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

['dragenter', 'dragover'].forEach(eventName => {
    uploadArea.addEventListener(eventName, highlight, false);
});

['dragleave', 'drop'].forEach(eventName => {
    uploadArea.addEventListener(eventName, unhighlight, false);
});

function highlight(e) {
    uploadArea.style.borderColor = '#2E7D32';
    uploadArea.style.backgroundColor = '#e8f5e8';
}

function unhighlight(e) {
    uploadArea.style.borderColor = '#4CAF50';
    uploadArea.style.backgroundColor = 'linear-gradient(135deg, #f8fff8, #e8f5e8)';
}

uploadArea.addEventListener('drop', handleDrop, false);

function handleDrop(e) {
    const dt = e.dataTransfer;
    const files = dt.files;
    if (files.length > 0) {
        handleFileUpload({ target: { files: files } });
    }
}