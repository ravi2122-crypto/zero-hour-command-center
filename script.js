// ==================== STATE MANAGEMENT ====================
let appState = {
    targets: [],
    completedTargets: [],
    currentBusiness: 'viraaj'
};

// Load state from localStorage
function loadState() {
    const saved = localStorage.getItem('zeroHourState');
    if (saved) {
        appState = JSON.parse(saved);
    }
}

// Save state to localStorage
function saveState() {
    localStorage.setItem('zeroHourState', JSON.stringify(appState));
}

// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', () => {
    loadState();
    initializeApp();
});

function initializeApp() {
    setupNavigation();
    setupTargetForm();
    setupBusinessTabs();
    setupMobileMenu();
    updateStatusBar();
    updateMetrics();
    renderTargets();
    setInterval(updateStatusBar, 1000);
    setInterval(updateDeadlineCountdown, 1000);
}

// ==================== NAVIGATION ====================
function setupNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    const sections = document.querySelectorAll('.content-section');

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Remove active class from all items and sections
            navItems.forEach(i => i.classList.remove('active'));
            sections.forEach(s => s.classList.remove('active'));
            
            // Add active class to clicked item
            item.classList.add('active');
            
            // Show corresponding section
            const sectionId = item.getAttribute('data-section');
            const section = document.getElementById(sectionId);
            if (section) {
                section.classList.add('active');
            }
            
            // Close mobile menu
            document.getElementById('sidebar').classList.remove('open');
        });
    });
}

// ==================== MOBILE MENU ====================
function setupMobileMenu() {
    const toggle = document.getElementById('mobileMenuToggle');
    const sidebar = document.getElementById('sidebar');

    toggle.addEventListener('click', () => {
        sidebar.classList.toggle('open');
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!sidebar.contains(e.target) && !toggle.contains(e.target)) {
            sidebar.classList.remove('open');
        }
    });
}

// ==================== STATUS BAR ====================
function updateStatusBar() {
    const now = new Date();
    const time = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    document.getElementById('statusTime').textContent = time;
    
    // Simulate battery
    const battery = Math.floor(Math.random() * 20) + 70;
    document.getElementById('statusBattery').textContent = battery + '⚡';
}

// ==================== METRICS UPDATE ====================
function updateMetrics() {
    const completed = appState.completedTargets.length;
    const total = appState.targets.length;
    const inProgress = total - completed;

    document.getElementById('dailyTargets').textContent = total;
    document.getElementById('targetsLocked').textContent = total;
    document.getElementById('targetsCompleted').textContent = completed;
    document.getElementById('targetsInProgress').textContent = inProgress;

    const successRate = total > 0 ? Math.round((completed / total) * 100) : 0;
    document.getElementById('successRate').textContent = successRate + '%';

    // Update active missions
    updateActiveMissions();
}

function updateActiveMissions() {
    const container = document.getElementById('activeMissions');
    const inProgressTargets = appState.targets.filter(t => !appState.completedTargets.includes(t.id));

    if (inProgressTargets.length === 0) {
        container.innerHTML = '<p class="empty-state">No active missions. Lock your first target! 🚀</p>';
        return;
    }

    container.innerHTML = inProgressTargets.map(target => {
        const completed = appState.completedTargets.includes(target.id);
        const progress = completed ? 100 : Math.floor(Math.random() * 80) + 20;
        
        return `
            <div class="mission-card">
                <p class="mission-title">${target.name}</p>
                <p class="mission-status">${target.category}</p>
                <div class="mission-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${progress}%"></div>
                    </div>
                </div>
                <div class="mission-info">
                    <span>${target.date}</span>
                    <span>${target.time}</span>
                </div>
            </div>
        `;
    }).join('');
}

function updateDeadlineCountdown() {
    if (appState.targets.length === 0) {
        document.getElementById('timeToDeadline').textContent = 'No targets';
        return;
    }

    const now = new Date();
    const nextTarget = appState.targets[0];
    const [hours, minutes] = nextTarget.time.split(':');
    const deadline = new Date();
    deadline.setHours(parseInt(hours), parseInt(minutes), 0);

    if (deadline < now) {
        deadline.setDate(deadline.getDate() + 1);
    }

    const diff = deadline - now;
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);

    document.getElementById('timeToDeadline').textContent = `${h}h ${m}m`;
}

// ==================== TARGET FORM ====================
function setupTargetForm() {
    const form = document.getElementById('targetForm');
    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const name = document.getElementById('targetName').value;
        const date = document.getElementById('targetDate').value;
        const time = document.getElementById('targetTime').value;
        const category = document.getElementById('targetCategory').value;

        if (!name || !date || !time || !category) {
            alert('Please fill in all fields');
            return;
        }

        const target = {
            id: Date.now(),
            name,
            date,
            time,
            category,
            createdAt: new Date().toISOString()
        };

        appState.targets.push(target);
        saveState();
        renderTargets();
        updateMetrics();
        form.reset();

        // Show success feedback
        showNotification('Target Locked! 🎯');
    });

    // Set today's date as default
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('targetDate').value = today;
}

// ==================== RENDER TARGETS ====================
function renderTargets() {
    const container = document.getElementById('targetsList');
    
    if (appState.targets.length === 0) {
        container.innerHTML = '<p class="empty-state">No targets locked yet. Create your first mission above! 🚀</p>';
        return;
    }

    container.innerHTML = appState.targets.map(target => {
        const isCompleted = appState.completedTargets.includes(target.id);
        
        return `
            <div class="target-item ${isCompleted ? 'completed' : ''}">
                <div class="target-content">
                    <p class="target-name">${isCompleted ? '✓' : '○'} ${target.name}</p>
                    <div class="target-meta">
                        <span class="target-date">📅 ${target.date}</span>
                        <span class="target-time">⏰ ${target.time}</span>
                        <span class="target-category">${target.category}</span>
                    </div>
                </div>
                <div class="target-actions">
                    ${!isCompleted ? `<button class="btn-complete" onclick="completeTarget(${target.id})">Mark Complete</button>` : ''}
                    <button class="btn-delete" onclick="deleteTarget(${target.id})">Delete</button>
                </div>
            </div>
        `;
    }).join('');
}

function completeTarget(id) {
    if (!appState.completedTargets.includes(id)) {
        appState.completedTargets.push(id);
        saveState();
        renderTargets();
        updateMetrics();
        showNotification('Target Completed! ✅');
    }
}

function deleteTarget(id) {
    if (confirm('Delete this target?')) {
        appState.targets = appState.targets.filter(t => t.id !== id);
        appState.completedTargets = appState.completedTargets.filter(c => c !== id);
        saveState();
        renderTargets();
        updateMetrics();
        showNotification('Target Deleted! ✗');
    }
}

// ==================== BUSINESS TABS ====================
function setupBusinessTabs() {
    const tabs = document.querySelectorAll('.business-tab');
    const modules = document.querySelectorAll('.business-module');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            modules.forEach(m => m.classList.remove('active'));

            tab.classList.add('active');
            const business = tab.getAttribute('data-business');
            const module = document.getElementById(`${business}-module`);
            if (module) {
                module.classList.add('active');
            }
            
            appState.currentBusiness = business;
            saveState();
        });
    });

    // Set initial active state
    const initialTab = document.querySelector(`[data-business="${appState.currentBusiness}"]`);
    if (initialTab) {
        initialTab.click();
    }
}

// ==================== QUICK ACTIONS ====================
function shareWhatsApp() {
    const text = 'Check out my ZERO HOUR - Live Command Center Dashboard! 🚀';
    const url = window.location.href;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`;
    window.open(whatsappUrl, '_blank');
}

function shareInstagram() {
    alert('📸 Opening Instagram...\n\nShare: Check out my ZERO HOUR Command Center! 🚀⏰');
    window.open('https://instagram.com', '_blank');
}

function shareLinkedIn() {
    const text = 'Excited to share my ZERO HOUR - Live Command Center! Managing business operations with precision. 💼🚀';
    const url = window.location.href;
    const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
    window.open(linkedinUrl, '_blank');
}

function generateReport() {
    const report = {
        generatedAt: new Date().toLocaleString(),
        totalTargets: appState.targets.length,
        completedTargets: appState.completedTargets.length,
        successRate: appState.targets.length > 0 ? 
            Math.round((appState.completedTargets.length / appState.targets.length) * 100) + '%' : '0%',
        targets: appState.targets.map(t => ({
            name: t.name,
            date: t.date,
            time: t.time,
            category: t.category,
            status: appState.completedTargets.includes(t.id) ? 'Completed' : 'In Progress'
        }))
    };

    const csv = `ZERO HOUR - Performance Report\nGenerated: ${report.generatedAt}\n\n
Total Targets: ${report.totalTargets}
Completed: ${report.completedTargets}
Success Rate: ${report.successRate}\n\n
TARGET,DATE,TIME,CATEGORY,STATUS\n${
        report.targets.map(t => `"${t.name}","${t.date}","${t.time}","${t.category}","${t.status}"`).join('\n')
    }`;

    downloadFile(csv, 'ZERO_HOUR_Report.csv');
}

function sendEmail() {
    alert('📧 Opening email client...\n\nSubject: ZERO HOUR Dashboard - Business Update');
    window.location.href = 'mailto:';
}

function scheduleMeeting() {
    alert('📅 Opening calendar...\n\nSchedule a meeting with your team or clients');
    window.open('https://calendar.google.com', '_blank');
}

function callClient(name) {
    alert(`📞 Calling ${name}...`);
}

function whatsappClient(name) {
    alert(`💬 Opening WhatsApp for ${name}...`);
    window.open(`https://wa.me/?text=Hello ${name}`, '_blank');
}

// ==================== UTILITY FUNCTIONS ====================
function showNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 50px;
        right: 20px;
        background: linear-gradient(135deg, #ffd700, #00d4ff);
        color: #000;
        padding: 15px 25px;
        border-radius: 8px;
        font-weight: 600;
        z-index: 999;
        animation: slideIn 0.3s ease-out;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

function downloadFile(content, filename) {
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(content));
    element.setAttribute('download', filename);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
}

// ==================== ADD CSS ANIMATIONS ====================
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }

    .mobile-menu-toggle {
        display: none;
    }

    @media (max-width: 768px) {
        .mobile-menu-toggle {
            display: block;
        }
    }
`;
document.head.appendChild(style);