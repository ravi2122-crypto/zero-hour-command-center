// ==================== ZERO HOUR APP - MAIN SCRIPT ====================

// ==================== STATE MANAGEMENT ====================
let appState = {
    userCode: null,
    personalGoals: [],
    teamGoals: [],
    completedGoals: [],
    currentBusiness: 'viraaj'
};

// ==================== LOAD/SAVE STATE ====================
function loadState() {
    const saved = localStorage.getItem('zeroHourAppState');
    if (saved) {
        appState = JSON.parse(saved);
    }
    
    const userCode = localStorage.getItem('userCode');
    if (userCode) {
        appState.userCode = userCode;
    }
}

function saveState() {
    localStorage.setItem('zeroHourAppState', JSON.stringify(appState));
    if (appState.userCode) {
        localStorage.setItem('userCode', appState.userCode);
    }
}

// ==================== SPLASH SCREEN & LOGIN ====================
function showSplashScreen() {
    const splashScreen = document.getElementById('splashScreen');
    
    // Generate random Geeta shloka
    const geetaShlokas = [
        { text: 'कर्मण्येवाधिकारस्ते मा फलेषु कदाचन', meaning: 'Focus on action, not results' },
        { text: 'योगः कर्मसु कौशलम्', meaning: 'Yoga is skill in action' },
        { text: 'समत्वं योग उच्यते', meaning: 'Equanimity is called Yoga' }
    ];
    
    const shloka = geetaShlokas[Math.floor(Math.random() * geetaShlokas.length)];
    document.getElementById('splashGeeta').textContent = `"${shloka.text}"`;
    document.getElementById('splashMeaning').textContent = shloka.meaning;
    
    // Hide splash after 2.5 seconds
    setTimeout(() => {
        const userCode = localStorage.getItem('userCode');
        if (userCode) {
            loginWithCode(userCode);
        } else {
            showCodeLogin();
        }
        splashScreen.style.display = 'none';
    }, 2500);
}

function showCodeLogin() {
    document.getElementById('splashScreen').style.display = 'none';
    document.getElementById('codeLoginScreen').style.display = 'flex';
}

function loginWithCode(code = null) {
    const userCode = code || document.getElementById('userCodeInput').value.toUpperCase().trim();
    
    if (!userCode || userCode.length < 3) {
        alert('Please enter a valid code (minimum 3 characters)');
        return;
    }
    
    // Save code
    appState.userCode = userCode;
    localStorage.setItem('userCode', userCode);
    saveState();
    
    // Load user's specific data
    loadUserData(userCode);
    
    // Hide login screen
    document.getElementById('codeLoginScreen').style.display = 'none';
    document.getElementById('mainContent').style.display = 'block';
    document.getElementById('sidebar').style.display = 'flex';
    document.getElementById('statusBar').style.display = 'flex';
    document.getElementById('quoteTickerBar').style.display = 'flex';
    document.getElementById('appFooter').style.display = 'block';
    document.getElementById('mobileMenuToggle').style.display = 'block';
    
    // Update profile
    updateProfile(userCode);
    
    // Initialize app
    setupNavigation();
    setupForms();
    setupQuoteSystem();
    updateMetrics();
}

function logout() {
    if (confirm('Switch to a different code? Your data will be saved.')) {
        localStorage.removeItem('userCode');
        location.reload();
    }
}

// ==================== USER DATA MANAGEMENT ====================
function loadUserData(userCode) {
    const userDataKey = `userData_${userCode}`;
    const saved = localStorage.getItem(userDataKey);
    
    if (saved) {
        const userData = JSON.parse(saved);
        appState.personalGoals = userData.personalGoals || [];
        appState.teamGoals = userData.teamGoals || [];
        appState.completedGoals = userData.completedGoals || [];
    }
}

function saveUserData() {
    if (!appState.userCode) return;
    
    const userDataKey = `userData_${appState.userCode}`;
    const userData = {
        personalGoals: appState.personalGoals,
        teamGoals: appState.teamGoals,
        completedGoals: appState.completedGoals,
        lastUpdate: new Date().toISOString()
    };
    
    localStorage.setItem(userDataKey, JSON.stringify(userData));
}

function updateProfile(userCode) {
    const initials = userCode.substring(0, 1);
    document.getElementById('profileAvatar').textContent = initials;
    document.getElementById('profileName').textContent = `User: ${userCode}`;
    document.getElementById('displayUserCode').textContent = userCode;
    document.getElementById('settingUserCode').textContent = userCode;
}

// ==================== NAVIGATION ====================
function setupNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    const sections = document.querySelectorAll('.content-section');
    
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            
            navItems.forEach(i => i.classList.remove('active'));
            sections.forEach(s => s.classList.remove('active'));
            
            item.classList.add('active');
            
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
document.addEventListener('DOMContentLoaded', () => {
    const toggle = document.getElementById('mobileMenuToggle');
    const sidebar = document.getElementById('sidebar');
    
    if (toggle) {
        toggle.addEventListener('click', () => {
            sidebar.classList.toggle('open');
        });
        
        document.addEventListener('click', (e) => {
            if (!sidebar.contains(e.target) && !toggle.contains(e.target)) {
                sidebar.classList.remove('open');
            }
        });
    }
});

// ==================== STATUS BAR ====================
function updateStatusBar() {
    const now = new Date();
    const time = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    document.getElementById('statusTime').textContent = time;
    
    const battery = Math.floor(Math.random() * 20) + 70;
    document.getElementById('statusBattery').textContent = battery + '⚡';
}

setInterval(updateStatusBar, 1000);

// ==================== QUOTE SYSTEM ====================
function setupQuoteSystem() {
    if (window.quoteSystem) {
        window.quoteSystem.startRunningQuotes();
    }
}

// ==================== FORMS SETUP ====================
function setupForms() {
    const personalGoalForm = document.getElementById('personalGoalForm');
    const teamGoalForm = document.getElementById('teamGoalForm');
    
    if (personalGoalForm) {
        personalGoalForm.addEventListener('submit', (e) => {
            e.preventDefault();
            addPersonalGoal();
        });
    }
    
    if (teamGoalForm) {
        teamGoalForm.addEventListener('submit', (e) => {
            e.preventDefault();
            addTeamGoal();
        });
    }
}

// ==================== PERSONAL GOALS ====================
function addPersonalGoal() {
    const name = document.getElementById('goalName').value;
    const date = document.getElementById('goalDate').value;
    const category = document.getElementById('goalCategory').value;
    const description = document.getElementById('goalDescription').value;
    
    if (!name || !date || !category) {
        alert('Please fill all required fields');
        return;
    }
    
    const goal = {
        id: Date.now(),
        name,
        date,
        category,
        description,
        completed: false,
        createdAt: new Date().toISOString()
    };
    
    appState.personalGoals.push(goal);
    saveUserData();
    renderPersonalGoals();
    document.getElementById('personalGoalForm').reset();
    showNotification('✓ Personal goal created!');
    updateMetrics();
}

function renderPersonalGoals() {
    const container = document.getElementById('personalGoalsList');
    
    if (appState.personalGoals.length === 0) {
        container.innerHTML = '<p class="empty-state">No personal goals yet. Create your first goal! 🚀</p>';
        return;
    }
    
    container.innerHTML = appState.personalGoals.map(goal => {
        const isCompleted = appState.completedGoals.includes(goal.id);
        return `
            <div class="target-item ${isCompleted ? 'completed' : ''}">
                <div class="target-content">
                    <p class="target-name">${isCompleted ? '✓' : '○'} ${goal.name}</p>
                    <div class="target-meta">
                        <span class="target-date">📅 ${goal.date}</span>
                        <span class="target-category">${goal.category}</span>
                    </div>
                    ${goal.description ? `<p class="target-desc">${goal.description}</p>` : ''}
                </div>
                <div class="target-actions">
                    ${!isCompleted ? `<button class="btn-complete" onclick="completeGoal(${goal.id})">✓ Complete</button>` : ''}
                    <button class="btn-delete" onclick="deleteGoal(${goal.id})">Delete</button>
                </div>
            </div>
        `;
    }).join('');
}

function completeGoal(goalId) {
    if (!appState.completedGoals.includes(goalId)) {
        appState.completedGoals.push(goalId);
        saveUserData();
        renderPersonalGoals();
        showNotification('🎉 Goal completed! Amazing!');
        updateMetrics();
    }
}

function deleteGoal(goalId) {
    if (confirm('Delete this goal?')) {
        appState.personalGoals = appState.personalGoals.filter(g => g.id !== goalId);
        appState.completedGoals = appState.completedGoals.filter(c => c !== goalId);
        saveUserData();
        renderPersonalGoals();
        updateMetrics();
    }
}

// ==================== TEAM GOALS ====================
function addTeamGoal() {
    const name = document.getElementById('teamGoalName').value;
    const teamCode = document.getElementById('teamCode').value.toUpperCase();
    const deadline = document.getElementById('teamDeadline').value;
    
    if (!name || !teamCode || !deadline) {
        alert('Please fill all fields');
        return;
    }
    
    const goal = {
        id: Date.now(),
        name,
        teamCode,
        deadline,
        members: [appState.userCode],
        progress: 0,
        createdAt: new Date().toISOString()
    };
    
    appState.teamGoals.push(goal);
    saveUserData();
    renderTeamGoals();
    document.getElementById('teamGoalForm').reset();
    showNotification('👥 Team goal created!');
}

function renderTeamGoals() {
    const container = document.getElementById('teamGoalsList');
    
    if (appState.teamGoals.length === 0) {
        container.innerHTML = '<p class="empty-state">No team goals yet. Create one to collaborate! 🤝</p>';
        return;
    }
    
    container.innerHTML = appState.teamGoals.map(goal => `
        <div class="target-item">
            <div class="target-content">
                <p class="target-name">👥 ${goal.name}</p>
                <div class="target-meta">
                    <span class="target-date">📅 ${goal.deadline}</span>
                    <span class="target-category">Team: ${goal.teamCode}</span>
                </div>
            </div>
            <div class="target-actions">
                <button class="btn-delete" onclick="deleteTeamGoal(${goal.id})">Delete</button>
            </div>
        </div>
    `).join('');
}

function deleteTeamGoal(goalId) {
    if (confirm('Delete this team goal?')) {
        appState.teamGoals = appState.teamGoals.filter(g => g.id !== goalId);
        saveUserData();
        renderTeamGoals();
    }
}

// ==================== METRICS ====================
function updateMetrics() {
    const completed = appState.completedGoals.length;
    const total = appState.personalGoals.length;
    const inProgress = total - completed;
    
    document.getElementById('totalPersonalGoals').textContent = total;
    document.getElementById('goalsCreated').textContent = total;
    document.getElementById('goalsCompleted').textContent = completed;
    document.getElementById('goalsInProgress').textContent = inProgress;
    
    const successRate = total > 0 ? Math.round((completed / total) * 100) : 0;
    document.getElementById('successRate').textContent = successRate + '%';
    
    // Health score
    if (window.healthTracker) {
        const score = window.healthTracker.getHealthScore();
        document.getElementById('healthScore').textContent = score + '%';
        document.getElementById('healthScoreValue').textContent = score + '%';
    }
}

// ==================== NOTIFICATIONS ====================
function showNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 100px;
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

// ==================== QUICK ACTIONS ====================
function shareWhatsApp() {
    const text = '🚀 ZERO HOUR - Live Command Center\nYour personal mission control + health tracking + finance management + motivation\n\nhttps://zerohour-by-ravisuyal.netlify.app';
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
}

function shareInstagram() {
    alert('📸 Open Instagram and share your achievements!\n\nZERO HOUR - Live Command Center\nhttps://zerohour-by-ravisuyal.netlify.app');
    window.open('https://instagram.com', '_blank');
}

function shareLinkedIn() {
    const text = 'Excited to use ZERO HOUR - Live Command Center! Managing my goals, health, and business all in one place. #Productivity #LifeManagement\n\nhttps://zerohour-by-ravisuyal.netlify.app';
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent('https://zerohour-by-ravisuyal.netlify.app')}`;
    window.open(url, '_blank');
}

function shareApp() {
    const text = '🚀 ZERO HOUR - Live Command Center\n\nYour personal mission control + health tracking + finance management + motivation\n\nBuilt by Ravi Suyal - "The AI Insider"\n\nhttps://zerohour-by-ravisuyal.netlify.app';
    
    if (navigator.share) {
        navigator.share({
            title: 'ZERO HOUR - Live Command Center',
            text: text,
            url: 'https://zerohour-by-ravisuyal.netlify.app'
        }).catch(err => console.log('Share error:', err));
    } else {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        showNotification('Link copied to clipboard!');
    }
}

function generateReport() {
    const report = `ZERO HOUR - Personal Report\nGenerated: ${new Date().toLocaleString()}\n\nGoals Created: ${appState.personalGoals.length}\nGoals Completed: ${appState.completedGoals.length}\n\nGoals:\n${appState.personalGoals.map(g => `- ${g.name} (${g.category})`).join('\n')}`;
    
    const blob = new Blob([report], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ZERO_HOUR_Report.txt';
    a.click();
}

// ==================== SETTINGS ====================
function copyUserCode() {
    const code = appState.userCode;
    const textarea = document.createElement('textarea');
    textarea.value = code;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    showNotification('Code copied!');
}

function exportData() {
    const data = {
        userCode: appState.userCode,
        personalGoals: appState.personalGoals,
        completedGoals: appState.completedGoals,
        exportedAt: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ZERO_HOUR_Backup_${appState.userCode}.json`;
    a.click();
}

function clearAllData() {
    if (confirm('Delete ALL your data? This cannot be undone!')) {
        localStorage.clear();
        location.reload();
    }
}

function showAbout() {
    const about = `ZERO HOUR - Live Command Center
Version 2.0

A comprehensive platform for:
✅ Personal & team goal tracking
✅ Health & wellness management
✅ Personal & business finance tracking
✅ 50+ Inspirational stories
✅ AI chatbot motivation
✅ Career & business growth
✅ Countdown timers
✅ Live analytics

Built by: Ravi Suyal
"The AI Insider"

Made with ❤️ for your success

© 2026 All rights reserved`;
    
    alert(about);
}

function reportBug() {
    const feedback = prompt('Please describe the issue or suggestion:');
    if (feedback) {
        const report = {
            timestamp: new Date().toISOString(),
            userCode: appState.userCode,
            feedback: feedback
        };
        
        let reports = JSON.parse(localStorage.getItem('bugReports') || '[]');
        reports.push(report);
        localStorage.setItem('bugReports', JSON.stringify(reports));
        
        showNotification('Thank you for your feedback! 🙏');
    }
}

// ==================== HEALTH FUNCTIONS ====================
function addWater() {
    if (window.healthTracker) {
        window.healthTracker.addWater();
        updateMetrics();
    }
}

function logSleep() {
    const hours = prompt('How many hours did you sleep?', '8');
    if (hours && !isNaN(hours)) {
        if (window.healthTracker) {
            window.healthTracker.setSleep(parseFloat(hours));
            updateMetrics();
        }
    }
}

function logExercise() {
    const minutes = prompt('How many minutes did you exercise?', '30');
    if (minutes && !isNaN(minutes)) {
        if (window.healthTracker) {
            window.healthTracker.addExercise(parseInt(minutes));
            updateMetrics();
        }
    }
}

// ==================== APP INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', () => {
    loadState();
    showSplashScreen();
});

// CSS for animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(400px); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(400px); opacity: 0; }
    }
`;
document.head.appendChild(style);