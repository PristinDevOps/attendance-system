// DOM Elements
const addStudentForm = document.getElementById('addStudentForm');
const editStudentForm = document.getElementById('editStudentForm');
const studentListBody = document.getElementById('studentListBody');
const searchStudentInput = document.getElementById('searchStudentList');
const searchStudentBtn = document.getElementById('searchStudentBtn');
const editStudentModal = document.getElementById('editStudentModal');
const closeModalButtons = document.querySelectorAll('.close-modal');
const logoutBtn = document.getElementById('logoutBtn');

// Check if user is logged in
function checkAuth() {
    const isAdminLoggedIn = localStorage.getItem('isAdminLoggedIn') === 'true';
    if (!isAdminLoggedIn) {
        window.location.href = 'index.html';
    }
}

// Add Student Form Submission
if (addStudentForm) {
    addStudentForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Get form values
        const studentId = document.getElementById('studentId').value;
        const firstName = document.getElementById('firstName').value;
        const lastName = document.getElementById('lastName').value;
        const email = document.getElementById('email').value;
        const phone = document.getElementById('phone').value;
        const dob = document.getElementById('dob').value;
        const gender = document.getElementById('gender').value;
        const course = document.getElementById('course').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        
        // Validate phone number
        if (phone && (phone.length < 10 || phone.length > 10)) {
            alert('Phone number must be exactly 10 digits.');
            return;
        }
        
        // Validate passwords match
        if (password !== confirmPassword) {
            alert('Passwords do not match. Please try again.');
            return;
        }
        
        // Get existing students from localStorage
        const students = JSON.parse(localStorage.getItem('students')) || [];
        
        // Check if student ID already exists
        if (students.some(s => s.studentId === studentId)) {
            alert('Student ID already exists. Please use a different ID.');
            return;
        }
        
        // Create new student object
        const newStudent = {
            studentId,
            firstName,
            lastName,
            email,
            phone,
            dob,
            gender,
            course,
            password,
            registrationDate: new Date().toISOString()
        };
        
        // Add new student to array
        students.push(newStudent);
        
        // Save updated students array to localStorage
        localStorage.setItem('students', JSON.stringify(students));
        
        // Add activity to log
        addActivity('student', `Added new student: ${firstName} ${lastName} (${studentId})`);
        
        alert('Student added successfully!');
        
        // Reset form
        addStudentForm.reset();
        
        // Refresh student list
        loadStudents();
    });
}

// Load students into the table
function loadStudents(searchTerm = '') {
    if (!studentListBody) return;
    
    // Get students from localStorage
    const students = JSON.parse(localStorage.getItem('students')) || [];
    
    // Clear existing rows
    studentListBody.innerHTML = '';
    
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
        row.innerHTML = '<td colspan="6" class="text-center">No students found.</td>';
        studentListBody.appendChild(row);
        return;
    }
    
    // Add rows for each student
    filteredStudents.forEach(student => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${student.studentId}</td>
            <td>${student.firstName} ${student.lastName}</td>
            <td>${student.email}</td>
            <td>${student.phone || 'N/A'}</td>
            <td>${student.course || 'N/A'}</td>
            <td class="action-buttons">
                <button class="btn-edit" data-id="${student.studentId}">Edit</button>
                <button class="btn-delete" data-id="${student.studentId}">Delete</button>
            </td>
        `;
        studentListBody.appendChild(row);
    });
    
    // Add event listeners to edit and delete buttons
    document.querySelectorAll('.btn-edit').forEach(btn => {
        btn.addEventListener('click', () => {
            const studentId = btn.getAttribute('data-id');
            openEditModal(studentId);
        });
    });
    
    document.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', () => {
            const studentId = btn.getAttribute('data-id');
            deleteStudent(studentId);
        });
    });
}

// Open edit student modal
function openEditModal(studentId) {
    // Get students from localStorage
    const students = JSON.parse(localStorage.getItem('students')) || [];
    
    // Find the student
    const student = students.find(s => s.studentId === studentId);
    if (!student) {
        alert('Student not found.');
        return;
    }
    
    // Fill form with student data
    document.getElementById('editStudentId').value = student.studentId;
    document.getElementById('editFirstName').value = student.firstName;
    document.getElementById('editLastName').value = student.lastName;
    document.getElementById('editEmail').value = student.email;
    document.getElementById('editPhone').value = student.phone || '';
    document.getElementById('editDob').value = student.dob || '';
    document.getElementById('editGender').value = student.gender || '';
    document.getElementById('editCourse').value = student.course || '';
    
    // Show modal
    editStudentModal.classList.remove('hidden');
}

// Close modal
if (closeModalButtons) {
    closeModalButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            editStudentModal.classList.add('hidden');
        });
    });
}

// Edit Student Form Submission
if (editStudentForm) {
    editStudentForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Get form values
        const studentId = document.getElementById('editStudentId').value;
        const firstName = document.getElementById('editFirstName').value;
        const lastName = document.getElementById('editLastName').value;
        const email = document.getElementById('editEmail').value;
        const phone = document.getElementById('editPhone').value;
        const dob = document.getElementById('editDob').value;
        const gender = document.getElementById('editGender').value;
        const course = document.getElementById('editCourse').value;
        
        // Validate phone number
        if (phone && (phone.length < 10 || phone.length > 10)) {
            alert('Phone number must be exactly 10 digits.');
            return;
        }
        
        // Get students from localStorage
        const students = JSON.parse(localStorage.getItem('students')) || [];
        
        // Find the student index
        const studentIndex = students.findIndex(s => s.studentId === studentId);
        if (studentIndex === -1) {
            alert('Student not found.');
            return;
        }
        
        // Update student data (preserve password and registration date)
        students[studentIndex] = {
            ...students[studentIndex],
            firstName,
            lastName,
            email,
            phone,
            dob,
            gender,
            course
        };
        
        // Save updated students array to localStorage
        localStorage.setItem('students', JSON.stringify(students));
        
        // Add activity to log
        addActivity('student', `Updated student: ${firstName} ${lastName} (${studentId})`);
        
        alert('Student updated successfully!');
        
        // Close modal
        editStudentModal.classList.add('hidden');
        
        // Refresh student list
        loadStudents();
    });
}

// Delete student
function deleteStudent(studentId) {
    // Confirm deletion
    if (!confirm('Are you sure you want to delete this student? This action cannot be undone.')) {
        return;
    }
    
    // Get students from localStorage
    const students = JSON.parse(localStorage.getItem('students')) || [];
    
    // Find the student
    const student = students.find(s => s.studentId === studentId);
    if (!student) {
        alert('Student not found.');
        return;
    }
    
    // Filter out the student
    const updatedStudents = students.filter(s => s.studentId !== studentId);
    
    // Save updated students array to localStorage
    localStorage.setItem('students', JSON.stringify(updatedStudents));
    
    // Add activity to log
    addActivity('student', `Deleted student: ${student.firstName} ${student.lastName} (${studentId})`);
    
    alert('Student deleted successfully!');
    
    // Refresh student list
    loadStudents();
}

// Search functionality
if (searchStudentBtn) {
    searchStudentBtn.addEventListener('click', () => {
        const searchTerm = searchStudentInput.value.trim();
        loadStudents(searchTerm);
    });
}

if (searchStudentInput) {
    searchStudentInput.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') {
            const searchTerm = searchStudentInput.value.trim();
            loadStudents(searchTerm);
        }
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
    loadStudents();
});