// DOM Elements
const reportTypeSelect = document.getElementById('reportType');
const dateFilterGroup = document.getElementById('dateFilterGroup');
const weekFilterGroup = document.getElementById('weekFilterGroup');
const monthFilterGroup = document.getElementById('monthFilterGroup');
const studentFilterGroup = document.getElementById('studentFilterGroup');
const reportDateInput = document.getElementById('reportDate');
const reportWeekInput = document.getElementById('reportWeek');
const reportMonthInput = document.getElementById('reportMonth');
const studentIdInput = document.getElementById('studentId');
const generateReportBtn = document.getElementById('generateReport');
const exportExcelBtn = document.getElementById('exportExcel');
const exportPDFBtn = document.getElementById('exportPDF');
const printReportBtn = document.getElementById('printReport');
const reportContent = document.getElementById('reportContent');
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
    const today = new Date();
    
    // Set date
    const dateStr = today.toISOString().split('T')[0];
    if (reportDateInput) reportDateInput.value = dateStr;
    
    // Set week
    const weekStr = getWeekString(today);
    if (reportWeekInput) reportWeekInput.value = weekStr;
    
    // Set month
    const monthStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
    if (reportMonthInput) reportMonthInput.value = monthStr;
}

// Get week string (YYYY-Www) for a date
function getWeekString(date) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 3 - (d.getDay() + 6) % 7);
    const week = Math.floor((d.getTime() - new Date(d.getFullYear(), 0, 4).getTime()) / 86400000 / 7) + 1;
    return `${d.getFullYear()}-W${String(week).padStart(2, '0')}`;
}

// Toggle filter groups based on report type
if (reportTypeSelect) {
    reportTypeSelect.addEventListener('change', () => {
        const reportType = reportTypeSelect.value;
        
        // Hide all filter groups
        dateFilterGroup.classList.add('hidden');
        weekFilterGroup.classList.add('hidden');
        monthFilterGroup.classList.add('hidden');
        studentFilterGroup.classList.add('hidden');
        
        // Show relevant filter group
        if (reportType === 'daily') {
            dateFilterGroup.classList.remove('hidden');
        } else if (reportType === 'weekly') {
            weekFilterGroup.classList.remove('hidden');
        } else if (reportType === 'monthly') {
            monthFilterGroup.classList.remove('hidden');
        } else if (reportType === 'student') {
            studentFilterGroup.classList.remove('hidden');
        }
    });
}

// Generate report
if (generateReportBtn) {
    generateReportBtn.addEventListener('click', () => {
        const reportType = reportTypeSelect.value;
        
        if (reportType === 'daily') {
            generateDailyReport();
        } else if (reportType === 'weekly') {
            generateWeeklyReport();
        } else if (reportType === 'monthly') {
            generateMonthlyReport();
        } else if (reportType === 'student') {
            generateStudentReport();
        }
    });
}

// Generate daily report
function generateDailyReport() {
    const date = reportDateInput.value;
    
    if (!date) {
        alert('Please select a date.');
        return;
    }
    
    // Get students
    const students = JSON.parse(localStorage.getItem('students')) || [];
    
    // Get attendance records for selected date
    const attendanceRecords = JSON.parse(localStorage.getItem('attendanceRecords')) || [];
    const dateRecords = attendanceRecords.filter(record => record.date === date);
    
    // Calculate statistics
    const totalStudents = students.length;
    const presentCount = dateRecords.filter(record => record.status === 'present').length;
    const absentCount = dateRecords.filter(record => record.status === 'absent').length;
    const notMarkedCount = totalStudents - presentCount - absentCount;
    const attendanceRate = totalStudents > 0 ? Math.round((presentCount / totalStudents) * 100) : 0;
    
    // Format date
    const formattedDate = new Date(date).toLocaleDateString();
    
    // Generate report HTML
    let reportHTML = `
        <h2>Daily Attendance Report</h2>
        <p class="report-date">Date: ${formattedDate}</p>
        
        <div class="report-summary">
            <div class="summary-item">
                <h3>Total Students</h3>
                <p>${totalStudents}</p>
            </div>
            <div class="summary-item">
                <h3>Present</h3>
                <p>${presentCount}</p>
            </div>
            <div class="summary-item">
                <h3>Absent</h3>
                <p>${absentCount}</p>
            </div>
            <div class="summary-item">
                <h3>Not Marked</h3>
                <p>${notMarkedCount}</p>
            </div>
            <div class="summary-item">
                <h3>Attendance Rate</h3>
                <p>${attendanceRate}%</p>
            </div>
        </div>
        
        <h3>Attendance Details</h3>
    `;
    
    // Add table
    reportHTML += `
        <table class="report-table">
            <thead>
                <tr>
                    <th>Student ID</th>
                    <th>Name</th>
                    <th>Course</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    // Add rows for each student
    students.forEach(student => {
        const record = dateRecords.find(r => r.studentId === student.studentId);
        const status = record ? record.status : 'Not marked';
        const statusClass = status === 'present' ? 'present' : (status === 'absent' ? 'absent' : '');
        
        reportHTML += `
            <tr>
                <td>${student.studentId}</td>
                <td>${student.firstName} ${student.lastName}</td>
                <td>${student.course || 'N/A'}</td>
                <td class="${statusClass}">${status.charAt(0).toUpperCase() + status.slice(1)}</td>
            </tr>
        `;
    });
    
    reportHTML += `
            </tbody>
        </table>
    `;
    
    // Update report content
    reportContent.innerHTML = reportHTML;
    
    // Add activity to log
    addActivity('report', `Generated daily attendance report for ${formattedDate}`);
}

// Generate weekly report
function generateWeeklyReport() {
    const weekStr = reportWeekInput.value;
    
    if (!weekStr) {
        alert('Please select a week.');
        return;
    }
    
    // Parse week string (YYYY-Www)
    const year = parseInt(weekStr.substring(0, 4));
    const week = parseInt(weekStr.substring(6));
    
    // Calculate start and end dates of the week
    const startDate = getDateOfWeek(year, week);
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);
    
    // Format dates
    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];
    const formattedStartDate = startDate.toLocaleDateString();
    const formattedEndDate = endDate.toLocaleDateString();
    
    // Get students
    const students = JSON.parse(localStorage.getItem('students')) || [];
    
    // Get attendance records for the week
    const attendanceRecords = JSON.parse(localStorage.getItem('attendanceRecords')) || [];
    const weekRecords = attendanceRecords.filter(record => {
        const recordDate = new Date(record.date);
        return recordDate >= startDate && recordDate <= endDate;
    });
    
    // Group records by date
    const recordsByDate = {};
    weekRecords.forEach(record => {
        if (!recordsByDate[record.date]) {
            recordsByDate[record.date] = [];
        }
        recordsByDate[record.date].push(record);
    });
    
    // Calculate statistics
    const totalStudents = students.length;
    const daysInWeek = Object.keys(recordsByDate).length;
    const totalPossibleAttendance = totalStudents * daysInWeek;
    const presentCount = weekRecords.filter(record => record.status === 'present').length;
    const absentCount = weekRecords.filter(record => record.status === 'absent').length;
    const attendanceRate = totalPossibleAttendance > 0 ? Math.round((presentCount / totalPossibleAttendance) * 100) : 0;
    
    // Generate report HTML
    let reportHTML = `
        <h2>Weekly Attendance Report</h2>
        <p class="report-date">Week: ${formattedStartDate} to ${formattedEndDate}</p>
        
        <div class="report-summary">
            <div class="summary-item">
                <h3>Total Students</h3>
                <p>${totalStudents}</p>
            </div>
            <div class="summary-item">
                <h3>Days Recorded</h3>
                <p>${daysInWeek}</p>
            </div>
            <div class="summary-item">
                <h3>Present</h3>
                <p>${presentCount}</p>
            </div>
            <div class="summary-item">
                <h3>Absent</h3>
                <p>${absentCount}</p>
            </div>
            <div class="summary-item">
                <h3>Attendance Rate</h3>
                <p>${attendanceRate}%</p>
            </div>
        </div>
        
        <h3>Daily Breakdown</h3>
    `;
    
    // Add table
    reportHTML += `
        <table class="report-table">
            <thead>
                <tr>
                    <th>Date</th>
                    <th>Present</th>
                    <th>Absent</th>
                    <th>Not Marked</th>
                    <th>Attendance Rate</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    // Get all dates in the week
    const dates = [];
    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
        dates.push(currentDate.toISOString().split('T')[0]);
        currentDate.setDate(currentDate.getDate() + 1);
    }
    
    // Add rows for each date
    dates.forEach(date => {
        const dateRecords = recordsByDate[date] || [];
        const presentCount = dateRecords.filter(record => record.status === 'present').length;
        const absentCount = dateRecords.filter(record => record.status === 'absent').length;
        const notMarkedCount = totalStudents - presentCount - absentCount;
        const attendanceRate = totalStudents > 0 ? Math.round((presentCount / totalStudents) * 100) : 0;
        
        const formattedDate = new Date(date).toLocaleDateString();
        
        reportHTML += `
            <tr>
                <td>${formattedDate}</td>
                <td>${presentCount}</td>
                <td>${absentCount}</td>
                <td>${notMarkedCount}</td>
                <td>${attendanceRate}%</td>
            </tr>
        `;
    });
    
    reportHTML += `
            </tbody>
        </table>
    `;
    
    // Update report content
    reportContent.innerHTML = reportHTML;
    
    // Add activity to log
    addActivity('report', `Generated weekly attendance report for ${formattedStartDate} to ${formattedEndDate}`);
}

// Get date of week (Monday)
function getDateOfWeek(year, week) {
    const date = new Date(year, 0, 1);
    const dayOffset = date.getDay() === 0 ? 6 : date.getDay() - 1;
    date.setDate(date.getDate() - dayOffset + (week - 1) * 7);
    return date;
}

// Generate monthly report
function generateMonthlyReport() {
    const monthStr = reportMonthInput.value;
    
    if (!monthStr) {
        alert('Please select a month.');
        return;
    }
    
    // Parse month string (YYYY-MM)
    const year = parseInt(monthStr.substring(0, 4));
    const month = parseInt(monthStr.substring(5)) - 1; // JavaScript months are 0-indexed
    
    // Calculate start and end dates of the month
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0);
    
    // Format dates
    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];
    const formattedMonth = startDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    
    // Get students
    const students = JSON.parse(localStorage.getItem('students')) || [];
    
    // Get attendance records for the month
    const attendanceRecords = JSON.parse(localStorage.getItem('attendanceRecords')) || [];
    const monthRecords = attendanceRecords.filter(record => {
        const recordDate = new Date(record.date);
        return recordDate >= startDate && recordDate <= endDate;
    });
    
    // Group records by student
    const recordsByStudent = {};
    students.forEach(student => {
        recordsByStudent[student.studentId] = {
            student,
            records: monthRecords.filter(record => record.studentId === student.studentId)
        };
    });
    
    // Calculate statistics
    const totalStudents = students.length;
    const daysInMonth = Object.keys(monthRecords.reduce((acc, record) => {
        acc[record.date] = true;
        return acc;
    }, {})).length;
    const totalPossibleAttendance = totalStudents * daysInMonth;
    const presentCount = monthRecords.filter(record => record.status === 'present').length;
    const absentCount = monthRecords.filter(record => record.status === 'absent').length;
    const attendanceRate = totalPossibleAttendance > 0 ? Math.round((presentCount / totalPossibleAttendance) * 100) : 0;
    
    // Generate report HTML
    let reportHTML = `
        <h2>Monthly Attendance Report</h2>
        <p class="report-date">Month: ${formattedMonth}</p>
        
        <div class="report-summary">
            <div class="summary-item">
                <h3>Total Students</h3>
                <p>${totalStudents}</p>
            </div>
            <div class="summary-item">
                <h3>Days Recorded</h3>
                <p>${daysInMonth}</p>
            </div>
            <div class="summary-item">
                <h3>Present</h3>
                <p>${presentCount}</p>
            </div>
            <div class="summary-item">
                <h3>Absent</h3>
                <p>${absentCount}</p>
            </div>
            <div class="summary-item">
                <h3>Attendance Rate</h3>
                <p>${attendanceRate}%</p>
            </div>
        </div>
        
        <h3>Student Breakdown</h3>
    `;
    
    // Add table
    reportHTML += `
        <table class="report-table">
            <thead>
                <tr>
                    <th>Student ID</th>
                    <th>Name</th>
                    <th>Present Days</th>
                    <th>Absent Days</th>
                    <th>Attendance Rate</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    // Add rows for each student
    students.forEach(student => {
        const studentData = recordsByStudent[student.studentId];
        const records = studentData.records;
        const presentDays = records.filter(record => record.status === 'present').length;
        const absentDays = records.filter(record => record.status === 'absent').length;
        const attendanceRate = daysInMonth > 0 ? Math.round((presentDays / daysInMonth) * 100) : 0;
        
        reportHTML += `
            <tr>
                <td>${student.studentId}</td>
                <td>${student.firstName} ${student.lastName}</td>
                <td>${presentDays}</td>
                <td>${absentDays}</td>
                <td>${attendanceRate}%</td>
            </tr>
        `;
    });
    
    reportHTML += `
            </tbody>
        </table>
    `;
    
    // Update report content
    reportContent.innerHTML = reportHTML;
    
    // Add activity to log
    addActivity('report', `Generated monthly attendance report for ${formattedMonth}`);
}

// Generate student report
function generateStudentReport() {
    const studentId = studentIdInput.value.trim();
    
    if (!studentId) {
        alert('Please enter a student ID.');
        return;
    }
    
    // Get students
    const students = JSON.parse(localStorage.getItem('students')) || [];
    
    // Find the student
    const student = students.find(s => s.studentId === studentId);
    if (!student) {
        alert('Student not found.');
        return;
    }
    
    // Get attendance records for the student
    const attendanceRecords = JSON.parse(localStorage.getItem('attendanceRecords')) || [];
    const studentRecords = attendanceRecords.filter(record => record.studentId === studentId);
    
    // Calculate statistics
    const totalDays = studentRecords.length;
    const presentDays = studentRecords.filter(record => record.status === 'present').length;
    const absentDays = studentRecords.filter(record => record.status === 'absent').length;
    const attendanceRate = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;
    
    // Generate report HTML
    let reportHTML = `
        <h2>Student Attendance Report</h2>
        <p class="report-date">Student: ${student.firstName} ${student.lastName} (${student.studentId})</p>
        
        <div class="report-summary">
            <div class="summary-item">
                <h3>Total Days</h3>
                <p>${totalDays}</p>
            </div>
            <div class="summary-item">
                <h3>Present Days</h3>
                <p>${presentDays}</p>
            </div>
            <div class="summary-item">
                <h3>Absent Days</h3>
                <p>${absentDays}</p>
            </div>
            <div class="summary-item">
                <h3>Attendance Rate</h3>
                <p>${attendanceRate}%</p>
            </div>
        </div>
        
        <h3>Attendance History</h3>
    `;
    
    // Add table
    reportHTML += `
        <table class="report-table">
            <thead>
                <tr>
                    <th>Date</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    // Sort records by date (newest first)
    studentRecords.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Add rows for each record
    studentRecords.forEach(record => {
        const formattedDate = new Date(record.date).toLocaleDateString();
        const statusClass = record.status === 'present' ? 'present' : 'absent';
        
        reportHTML += `
            <tr>
                <td>${formattedDate}</td>
                <td class="${statusClass}">${record.status.charAt(0).toUpperCase() + record.status.slice(1)}</td>
            </tr>
        `;
    });
    
    reportHTML += `
            </tbody>
        </table>
    `;
    
    // Update report content
    reportContent.innerHTML = reportHTML;
    
    // Add activity to log
    addActivity('report', `Generated attendance report for student ${student.firstName} ${student.lastName} (${student.studentId})`);
}

// Export to Excel
if (exportExcelBtn) {
    exportExcelBtn.addEventListener('click', () => {
        alert('Export to Excel functionality would be implemented here.');
        // In a real application, this would generate an Excel file
    });
}

// Export to PDF
if (exportPDFBtn) {
    exportPDFBtn.addEventListener('click', () => {
        alert('Export to PDF functionality would be implemented here.');
        // In a real application, this would generate a PDF file
    });
}

// Print report
if (printReportBtn) {
    printReportBtn.addEventListener('click', () => {
        window.print();
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
});