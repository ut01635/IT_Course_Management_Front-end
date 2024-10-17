// Fetch student data by NIC
async function fetchStudentData(nic) {
    const response = await fetch(`https://localhost:7008/api/Student/Get-StudentByNIC${nic}`);
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    return await response.json();
}

// Fetch all courses
async function fetchCourses() {
    const response = await fetch('https://localhost:7008/api/Course/GetAllCourses');
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    return await response.json();
}

// Load student profile
async function loadProfile() {
    const nic = sessionStorage.getItem('loggedStudent');
    if (!nic) {
        console.error('No NIC found in local storage.');
        return;
    }

    try {
        console.log('Fetching student data for NIC:', nic);
        const student = await fetchStudentData(nic);
        console.log('Fetched student data:', student);

        document.getElementById('profileNameDisplay').innerText = student.fullName;
        document.getElementById('profileNICDisplay').innerText = student.nic;
        document.getElementById('profileEmailDisplay').innerText = student.email;
        document.getElementById('profilePhoneDisplay').innerText = student.phone;

    } catch (error) {
        console.error('Error fetching student data:', error.message);
    }
}

// Open modal to update profile
async function openUpdateProfileModal() {
    const nic = sessionStorage.getItem('loggedStudent');
    if (!nic) {
        console.error('No NIC found in local storage.');
        return;
    }

    try {
        const student = await fetchStudentData(nic);
        console.log('Fetched student data for update:', student);
        document.getElementById('updateProfileName').value = student.fullName;
        document.getElementById('updateProfileNIC').value = student.nic; // Keep this disabled if not editable
        document.getElementById('updateProfileEmail').value = student.email;
        document.getElementById('updateProfilePhone').value = student.phone;

        document.getElementById('updateProfileModal').style.display = 'block'; // Show the modal
    } catch (error) {
        console.error('Error fetching student data for update:', error.message);
    }
}

// Close update profile modal
function closeUpdateProfileModal() {
    document.getElementById('updateProfileModal').style.display = 'none'; // Hide the modal
}

// Update student profile
async function updateProfile() {
    const nic = sessionStorage.getItem('loggedStudent');
    if (!nic) {
        console.error('No NIC found in local storage.');
        return;
    }

    const payload = {
        fullName: document.getElementById('updateProfileName').value.trim(), // Use correct property name
        nic: nic, // Use the NIC from session storage
        email: document.getElementById('updateProfileEmail').value.trim(),
        phone: document.getElementById('updateProfilePhone').value.trim(),
    };

    try {
        const response = await fetch(`https://localhost:7008/api/Student/Update-Student/${nic}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            throw new Error('Failed to update profile');
        }

        alert('Profile updated successfully!');
        closeUpdateProfileModal();
        loadProfile(); // Reload the profile to reflect changes
    } catch (error) {
        console.error('Error updating profile:', error.message);
    }
}

// Initial load when the page is ready
document.addEventListener('DOMContentLoaded', () => {
    loadProfile(); // Load the student's profile on page load
});


// Load courses for the student
async function loadCourses() {
    const nic = sessionStorage.getItem('loggedStudent');
    try {
        console.log('Fetching courses...');
        const courses = await fetchCourses();
        console.log('Fetched courses:', courses);

        const student = await fetchStudentData(nic); 
        console.log('Fetched student data for courses:', student);

        if (student && student.courses.length > 0) {
            const studentCoursesTable = document.getElementById('studentCoursesTable').getElementsByTagName('tbody')[0];
            studentCoursesTable.innerHTML = '';

            student.courses.forEach(id => {
                const course = courses.find(course => course.id === id);
                if (course) {
                    const row = studentCoursesTable.insertRow();
                    row.insertCell(0).innerText = course.id;
                    row.insertCell(1).innerText = course.courseName;
                    row.insertCell(2).innerText = course.duration;
                    row.insertCell(3).innerText = course.level;
                    row.insertCell(4).innerText = course.fees;
                }
            });
        } else {
            alert('No courses enrolled.');
        }
    } catch (error) {
        console.error('Error loading courses:', error.message);
    }
}

// Fetch notifications by NIC
async function fetchNotifications(nic) {
    const response = await fetch(`https://localhost:7008/api/Notification/by-nic/${nic}`);
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    return await response.json();
}

// Load notifications
async function loadNotifications() {
    const nic = sessionStorage.getItem('loggedStudent');
    if (!nic) {
        console.error('No NIC found in local storage.');
        return;
    }

    try {
        console.log('Fetching notifications...');
        const notifications = await fetchNotifications(nic);
        console.log('Fetched notifications:', notifications);
        
        const notificationsTable = document.getElementById('notificationTable').getElementsByTagName('tbody')[0];
        notificationsTable.innerHTML = '';

        notifications.forEach(notification => {
            const row = notificationsTable.insertRow(); // Create a new row

            const dateCell = row.insertCell(0); // Insert a new cell for the date
            dateCell.innerText = notification.date; // Set the date text

            const messageCell = row.insertCell(1); // Insert a new cell for the message
            messageCell.innerText = notification.message; // Set the message text
        });
    } catch (error) {
        console.error('Error loading notifications:', error.message);
    }
}

// Load payments for the student
async function loadPayments() {
    const nic = sessionStorage.getItem('loggedStudent');
    try {
        const courses = await fetchCourses();
        const student = await fetchStudentData(nic);

        if (student && student.courses.length > 0) {
            const studentPaymentsTable = document.getElementById('studentPaymentsTable').getElementsByTagName('tbody')[0];
            studentPaymentsTable.innerHTML = '';

            student.courses.forEach(courseId => {
                const course = courses.find(course => course.id === courseId);
                if (course) {
                    const row = studentPaymentsTable.insertRow();
                    row.insertCell(0).innerText = course.courseName;
                    row.insertCell(1).innerText = course.fees;
                    row.insertCell(2).innerText = 'Pending'; // Payment status can be updated accordingly
                    row.insertCell(3).innerText = new Date().toLocaleDateString();
                }
            });
        }
    } catch (error) {
        console.error('Error loading payments:', error.message);
    }
}

// Populate courses from admin page
async function populateCoursesFromAdminPage() {
    try {
        const courses = await fetchCourses();
        const coursesContainer = document.getElementById('corsesFromAdminPage'); // Ensure this matches your HTML ID
        coursesContainer.innerHTML = '';

        if (courses.length > 0) {
            courses.forEach(course => {
                const card = document.createElement('div');
                card.className = 'course-card';

                card.innerHTML = `
                    <img src="${course.imagePath}" alt="${course.courseName}"> <!-- Corrected imagePath -->
                    <h3>${course.courseName}</h3>
                    <p>Period: ${course.duration}</p>
                    <p>Level: ${course.level}</p>
                    <p>Fee: $${course.fees}</p>
                `;

                coursesContainer.appendChild(card);
            });
        } else {
            coursesContainer.innerHTML = '<p>No courses available at the moment. Please contact admin for more details.</p>';
        }
    } catch (error) {
        console.error('Error populating courses:', error.message);
    }
}


// Initialize page by loading necessary data
document.addEventListener('DOMContentLoaded', () => {
    populateCoursesFromAdminPage();
    loadProfile();
    loadCourses();
    loadNotifications();
    loadPayments();
    
});
