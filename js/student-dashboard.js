// DOM Elements
const studentNameElement = document.getElementById('studentName');
const presentDaysElement = document.getElementById('presentDays');
const absentDaysElement = document.getElementById('absentDays');
const attendanceRateElement = document.getElementById('attendanceRate');
const studentCourseElement = document.getElementById('studentCourse');
const profileStudentIdElement = document.getElementById('profileStudentId');
const profileFullNameElement = document.getElementById('profileFullName');
const profileEmailElement = document.getElementById('profileEmail');
const profileCourseElement = document.getElementById('profileCourse');
const profileRegDateElement = document.getElementById('profileRegDate');
const attendanceHistoryBody = document.getElementById('attendanceHistoryBody');
const attendanceHistorySection = document.getElementById('attendanceHistorySection');
const viewAttendanceBtn = document.getElementById('viewAttendanceBtn');
const profileBtn = document.getElementById('profileBtn');
const logoutBtn = document.getElementById('logoutBtn');

// Check if user is logged in
function checkAuth() {
    const isStudentLoggedIn = localStorage.getItem('isStudentLoggedIn') === 'true';
    if (!isStudentLoggedIn) {
        window.location.href = 'index.html';
    }
}

// Load student data
function loadStudentData() {
    // Get student ID from localStorage
    const studentId = localStorage.getItem('loggedInStudentId');
    
    // Get students from localStorage
    const students = JSON.parse(localStorage.getItem('students')) || [];
    
    // Find the student
    const student = students.find(s => s.studentId === studentId);
    if (!student) {
        alert('Student not found. Please log in again.');
        window.location.href = 'index.html';
        return;
    }
    
    // Update student info
    studentNameElement.textContent = `${student.firstName} ${student.lastName}`;
    studentCourseElement.textContent = student.course || 'N/A';
    
    // Update profile details
    profileStudentIdElement.textContent = student.studentId;
    profileFullNameElement.textContent = `${student.firstName} ${student.lastName}`;
    profileEmailElement.textContent = student.email;
    profileCourseElement.textContent = student.course || 'N/A';
    
    // Format registration date
    const regDate = new Date(student.registrationDate);
    profileRegDateElement.textContent = regDate.toLocaleDateString();
    
    // Load attendance statistics
    loadAttendanceStats(studentId);
}

// Load attendance statistics
function loadAttendanceStats(studentId) {
    // Get attendance records from localStorage
    const attendanceRecords = JSON.parse(localStorage.getItem('attendanceRecords')) || [];
    
    // Filter records for this student
    const studentRecords = attendanceRecords.filter(record => record.studentId === studentId);
    
    // Calculate statistics
    const presentDays = studentRecords.filter(record => record.status === 'present').length;
    const absentDays = studentRecords.filter(record => record.status === 'absent').length;
    const totalDays = presentDays + absentDays;
    const attendanceRate = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;
    
    // Update dashboard elements
    presentDaysElement.textContent = presentDays;
    absentDaysElement.textContent = absentDays;
    attendanceRateElement.textContent = `${attendanceRate}%`;
}

// Load attendance history
function loadAttendanceHistory(studentId) {
    // Get attendance records from localStorage
    const attendanceRecords = JSON.parse(localStorage.getItem('attendanceRecords')) || [];
    
    // Filter records for this student
    const studentRecords = attendanceRecords.filter(record => record.studentId === studentId);
    
    // Clear existing rows
    attendanceHistoryBody.innerHTML = '';
    
    // If no records, show message
    if (studentRecords.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = '<td colspan="2" class="text-center">No attendance records found.</td>';
        attendanceHistoryBody.appendChild(row);
        return;
    }
    
    // Sort records by date (newest first)
    studentRecords.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Add rows for each record
    studentRecords.forEach(record => {
        const row = document.createElement('tr');
        
        // Format date
        const date = new Date(record.date);
        const formattedDate = date.toLocaleDateString();
        
        // Set status class
        const statusClass = record.status === 'present' ? 'present' : 'absent';
        
        row.innerHTML = `
            <td>${formattedDate}</td>
            <td class="${statusClass}">${record.status.charAt(0).toUpperCase() + record.status.slice(1)}</td>
        `;
        
        attendanceHistoryBody.appendChild(row);
    });
}

// View Attendance button
if (viewAttendanceBtn) {
    viewAttendanceBtn.addEventListener('click', (e) => {
        e.preventDefault();
        attendanceHistorySection.classList.remove('hidden');
        document.querySelector('.student-profile').classList.add('hidden');
        
        // Update active navigation
        document.querySelectorAll('.nav-links li').forEach(item => item.classList.remove('active'));
        viewAttendanceBtn.closest('li').classList.add('active');
        
        // Refresh attendance data
        const studentId = localStorage.getItem('loggedInStudentId');
        loadAttendanceHistory(studentId);
    });
}

// Profile button
if (profileBtn) {
    profileBtn.addEventListener('click', (e) => {
        e.preventDefault();
        document.querySelector('.student-profile').classList.remove('hidden');
        attendanceHistorySection.classList.add('hidden');
        
        // Update active navigation
        document.querySelectorAll('.nav-links li').forEach(item => item.classList.remove('active'));
        profileBtn.closest('li').classList.add('active');
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
    loadStudentData();
});