// DOM Elements
const attendanceDateInput = document.getElementById('attendanceDate');
const searchStudentInput = document.getElementById('searchStudent');
const searchBtn = document.getElementById('searchBtn');
const markAllPresentBtn = document.getElementById('markAllPresent');
const markAllAbsentBtn = document.getElementById('markAllAbsent');
const saveAttendanceBtn = document.getElementById('saveAttendance');
const attendanceTableBody = document.getElementById('attendanceTableBody');
const logoutBtn = document.getElementById('logoutBtn');

// Check if user is logged in
function checkAuth() {
    const isAdminLoggedIn = localStorage.getItem('isAdminLoggedIn') === 'true';
    if (!isAdminLoggedIn) {
        window.location.href = 'index.html';
    }
}

// Set default date to today
function setDefaultDate() {
    const today = new Date().toISOString().split('T')[0];
    attendanceDateInput.value = today;
}

// Load students for attendance
function loadStudentsForAttendance(searchTerm = '') {
    // Get students from localStorage
    const students = JSON.parse(localStorage.getItem('students')) || [];
    
    // Get selected date
    const selectedDate = attendanceDateInput.value;
    
    // Get attendance records for selected date
    const attendanceRecords = JSON.parse(localStorage.getItem('attendanceRecords')) || [];
    const dateRecords = attendanceRecords.filter(record => record.date === selectedDate);
    
    // Clear existing rows
    attendanceTableBody.innerHTML = '';
    
    // Filter students if search term provided
    const filteredStudents = searchTerm 
        ? students.filter(student => 
            student.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
            `${student.firstName} ${student.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
          )
        : students;
    
    // If no students, show message
    if (filteredStudents.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = '<td colspan="5" class="text-center">No students found.</td>';
        attendanceTableBody.appendChild(row);
        return;
    }
    
    // Add rows for each student
    filteredStudents.forEach(student => {
        const row = document.createElement('tr');
        row.setAttribute('data-id', student.studentId);
        
        // Check if attendance record exists for this student on selected date
        const existingRecord = dateRecords.find(record => record.studentId === student.studentId);
        const status = existingRecord ? existingRecord.status : '';
        
        row.innerHTML = `
            <td>${student.studentId}</td>
            <td>${student.firstName} ${student.lastName}</td>
            <td>${student.course || 'N/A'}</td>
            <td class="status-cell">${status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Not marked'}</td>
            <td>
                <button class="btn-present ${status === 'present' ? 'active' : ''}" data-status="present">
                    <i class="fas fa-check-circle"></i>
                </button>
                <button class="btn-absent ${status === 'absent' ? 'active' : ''}" data-status="absent">
                    <i class="fas fa-times-circle"></i>
                </button>
            </td>
        `;
        
        attendanceTableBody.appendChild(row);
    });
    
       // Add event listeners to present/absent buttons
       document.querySelectorAll('.btn-present, .btn-absent').forEach(btn => {
        btn.addEventListener('click', () => {
            const row = btn.closest('tr');
            const statusCell = row.querySelector('.status-cell');
            const status = btn.getAttribute('data-status');
            
            // Update status cell
            statusCell.textContent = status.charAt(0).toUpperCase() + status.slice(1);
            
            // Remove active class from both buttons
            row.querySelector('.btn-present').classList.remove('active');
            row.querySelector('.btn-absent').classList.remove('active');
            
            // Add active class to clicked button
            btn.classList.add('active');
        });
    });
}

// Mark all students as present
if (markAllPresentBtn) {
    markAllPresentBtn.addEventListener('click', () => {
        const rows = attendanceTableBody.querySelectorAll('tr');
        rows.forEach(row => {
            const statusCell = row.querySelector('.status-cell');
            const presentBtn = row.querySelector('.btn-present');
            const absentBtn = row.querySelector('.btn-absent');
            
            if (statusCell) {
                statusCell.textContent = 'Present';
                presentBtn.classList.add('active');
                absentBtn.classList.remove('active');
            }
        });
    });
}

// Mark all students as absent
if (markAllAbsentBtn) {
    markAllAbsentBtn.addEventListener('click', () => {
        const rows = attendanceTableBody.querySelectorAll('tr');
        rows.forEach(row => {
            const statusCell = row.querySelector('.status-cell');
            const presentBtn = row.querySelector('.btn-present');
            const absentBtn = row.querySelector('.btn-absent');
            
            if (statusCell) {
                statusCell.textContent = 'Absent';
                absentBtn.classList.add('active');
                presentBtn.classList.remove('active');
            }
        });
    });
}

// Save attendance
if (saveAttendanceBtn) {
    saveAttendanceBtn.addEventListener('click', () => {
        // Get selected date
        const selectedDate = attendanceDateInput.value;
        
        if (!selectedDate) {
            alert('Please select a date.');
            return;
        }
        
        // Get all rows
        const rows = attendanceTableBody.querySelectorAll('tr');
        
        // Get existing attendance records
        const attendanceRecords = JSON.parse(localStorage.getItem('attendanceRecords')) || [];
        
        // Remove existing records for selected date
        const filteredRecords = attendanceRecords.filter(record => record.date !== selectedDate);
        
        // Create new records
        const newRecords = [];
        
        rows.forEach(row => {
            const studentId = row.getAttribute('data-id');
            if (!studentId) return; // Skip if no student ID (e.g., "No students found" row)
            
            const statusCell = row.querySelector('.status-cell');
            const status = statusCell.textContent.toLowerCase();
            
            if (status === 'present' || status === 'absent') {
                newRecords.push({
                    date: selectedDate,
                    studentId,
                    status
                });
            }
        });
        
        // Combine filtered and new records
        const updatedRecords = [...filteredRecords, ...newRecords];
        
        // Save to localStorage
        localStorage.setItem('attendanceRecords', JSON.stringify(updatedRecords));
        
        // Add activity to log
        addActivity('attendance', `Attendance marked for ${selectedDate}`);
        
        alert('Attendance saved successfully!');
    });
}

// Search functionality
if (searchBtn) {
    searchBtn.addEventListener('click', () => {
        const searchTerm = searchStudentInput.value.trim();
        loadStudentsForAttendance(searchTerm);
    });
}

if (searchStudentInput) {
    searchStudentInput.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') {
            const searchTerm = searchStudentInput.value.trim();
            loadStudentsForAttendance(searchTerm);
        }
    });
}

// Date change event
if (attendanceDateInput) {
    attendanceDateInput.addEventListener('change', () => {
        loadStudentsForAttendance();
    });
}

// Add activity to activity log
function addActivity(type, description) {
    // Get existing activities from localStorage
    const activities = JSON.parse(localStorage.getItem('activities')) || [];
    
    // Create new activity
    const newActivity = {
        type,
        description,
        timestamp: new Date().toISOString()
    };
    
    // Add new activity to array
    activities.push(newActivity);
    
    // Limit activities to 50
    if (activities.length > 50) {
        activities.shift();
    }
    
    // Save updated activities array to localStorage
    localStorage.setItem('activities', JSON.stringify(activities));
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
    setDefaultDate();
    loadStudentsForAttendance();
});