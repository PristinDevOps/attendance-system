// DOM Elements
const totalStudentsElement = document.getElementById('totalStudents');
const presentTodayElement = document.getElementById('presentToday');
const absentTodayElement = document.getElementById('absentToday');
const attendanceRateElement = document.getElementById('attendanceRate');
const activityListElement = document.getElementById('activityList');
const logoutBtn = document.getElementById('logoutBtn');

// Check if user is logged in
function checkAuth() {
    const isAdminLoggedIn = localStorage.getItem('isAdminLoggedIn') === 'true';
    if (!isAdminLoggedIn) {
        window.location.href = 'index.html';
    }
}

// Load dashboard data
function loadDashboardData() {
    // Get students from localStorage
    const students = JSON.parse(localStorage.getItem('students')) || [];
    
    // Get attendance records from localStorage
    const attendanceRecords = JSON.parse(localStorage.getItem('attendanceRecords')) || [];
    
    // Get today's date
    const today = new Date().toISOString().split('T')[0];
    
    // Filter records for today
    const todayRecords = attendanceRecords.filter(record => record.date === today);
    
    // Calculate statistics
    const totalStudents = students.length;
    const presentToday = todayRecords.filter(record => record.status === 'present').length;
    const absentToday = todayRecords.filter(record => record.status === 'absent').length;
    const attendanceRate = totalStudents > 0 ? Math.round((presentToday / totalStudents) * 100) : 0;
    
    // Update dashboard elements
    totalStudentsElement.textContent = totalStudents;
    presentTodayElement.textContent = presentToday;
    absentTodayElement.textContent = absentToday;
    attendanceRateElement.textContent = `${attendanceRate}%`;
    
    // Load recent activities
    loadActivities();
}

// Load recent activities
function loadActivities() {
    // Get activities from localStorage
    const activities = JSON.parse(localStorage.getItem('activities')) || [];
    
    // Clear existing activities
    activityListElement.innerHTML = '';
    
    // If no activities, show message
    if (activities.length === 0) {
        activityListElement.innerHTML = '<div class="no-activities">No recent activities found.</div>';
        return;
    }
    
    // Sort activities by timestamp (newest first)
    activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    // Add activities to list
    activities.forEach(activity => {
        const activityItem = document.createElement('div');
        activityItem.className = 'activity-item';
        
        // Set icon based on activity type
        let icon = 'fas fa-info-circle';
        if (activity.type === 'student') {
            icon = 'fas fa-user-graduate';
        } else if (activity.type === 'attendance') {
            icon = 'fas fa-clipboard-check';
        } else if (activity.type === 'report') {
            icon = 'fas fa-chart-bar';
        }
        
        // Format timestamp
        const timestamp = new Date(activity.timestamp);
        const formattedTime = timestamp.toLocaleString();
        
        activityItem.innerHTML = `
            <div class="activity-icon">
                <i class="${icon}"></i>
            </div>
            <div class="activity-details">
                <p>${activity.description}</p>
                <span class="activity-time">${formattedTime}</span>
            </div>
        `;
        
        activityListElement.appendChild(activityItem);
    });
}

// Add logout functionality
if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        
        // Clear login status
        localStorage.removeItem('isAdminLoggedIn');
        localStorage.removeItem('isStudentLoggedIn');
        localStorage.removeItem('loggedInStudentId');
        
        // Redirect to login page
        window.location.href = 'index.html';
    });
}

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    loadDashboardData();
});