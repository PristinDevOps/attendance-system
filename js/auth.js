// DOM Elements
const adminLoginForm = document.getElementById('adminLoginForm');
const studentLoginForm = document.getElementById('studentLoginForm');
const studentRegisterForm = document.getElementById('studentRegisterForm');
const toggleButtons = document.querySelectorAll('.toggle-btn');
const registerLink = document.getElementById('registerLink');
const loginLink = document.getElementById('loginLink');

// Toggle between admin and student forms
toggleButtons.forEach(button => {
    button.addEventListener('click', () => {
        // Remove active class from all buttons
        toggleButtons.forEach(btn => btn.classList.remove('active'));
        
        // Add active class to clicked button
        button.classList.add('active');
        
        // Get target form
        const target = button.getAttribute('data-target');
        
        // Hide all forms
        document.querySelectorAll('.form-container').forEach(form => {
            form.classList.add('hidden');
        });
        
        // Show target form
        if (target === 'admin') {
            document.querySelector('.admin-form').classList.remove('hidden');
        } else if (target === 'student') {
            document.querySelector('.student-form').classList.remove('hidden');
        }
    });
});

// Show registration form
if (registerLink) {
    registerLink.addEventListener('click', (e) => {
        e.preventDefault();
        document.querySelector('.student-form').classList.add('hidden');
        document.querySelector('.register-form').classList.remove('hidden');
    });
}

// Show login form
if (loginLink) {
    loginLink.addEventListener('click', (e) => {
        e.preventDefault();
        document.querySelector('.register-form').classList.add('hidden');
        document.querySelector('.student-form').classList.remove('hidden');
    });
}

// Admin Login Form Submission
if (adminLoginForm) {
    adminLoginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Get form values
        const username = document.getElementById('adminUsername').value;
        const password = document.getElementById('adminPassword').value;
        
        // Check credentials (in a real app, this would be a server request)
        if (username === 'admin' && password === 'admin123') {
            // Set login status in localStorage
            localStorage.setItem('isAdminLoggedIn', 'true');
            
            // Add activity to log
            addActivity('admin', 'Admin logged in');
            
            // Redirect to dashboard
            window.location.href = 'dashboard.html';
        } else {
            alert('Invalid username or password. Please try again.');
        }
    });
}

// Student Login Form Submission
if (studentLoginForm) {
    studentLoginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Get form values
        const studentId = document.getElementById('studentId').value;
        const password = document.getElementById('studentPassword').value;
        
        // Get students from localStorage
        const students = JSON.parse(localStorage.getItem('students')) || [];
        
        // Find student with matching ID and password
        const student = students.find(s => s.studentId === studentId && s.password === password);
        
        if (student) {
            // Set login status in localStorage
            localStorage.setItem('isStudentLoggedIn', 'true');
            localStorage.setItem('loggedInStudentId', student.studentId);
            
            // Add activity to log
            addActivity('student', `Student ${student.firstName} ${student.lastName} (${student.studentId}) logged in`);
            
            // Redirect to student dashboard
            window.location.href = 'student-dashboard.html';
        } else {
            alert('Invalid student ID or password. Please try again.');
        }
    });
}

// Student Registration Form Submission
if (studentRegisterForm) {
    studentRegisterForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Get form values
        const studentId = document.getElementById('regStudentId').value;
        const firstName = document.getElementById('regFirstName').value;
        const lastName = document.getElementById('regLastName').value;
        const email = document.getElementById('regEmail').value;
        const password = document.getElementById('regPassword').value;
        const confirmPassword = document.getElementById('regConfirmPassword').value;
        
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
            password,
            registrationDate: new Date().toISOString()
        };
        
        // Add new student to array
        students.push(newStudent);
        
        // Save updated students array to localStorage
        localStorage.setItem('students', JSON.stringify(students));
        
        // Add activity to log
        addActivity('student', `New student registered: ${firstName} ${lastName} (${studentId})`);
        
        alert('Registration successful! You can now log in with your student ID and password.');
        
        // Show login form
        document.querySelector('.register-form').classList.add('hidden');
        document.querySelector('.student-form').classList.remove('hidden');
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