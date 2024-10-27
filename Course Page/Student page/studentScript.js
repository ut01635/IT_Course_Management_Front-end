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

// Fetch notifications by NIC
async function fetchNotifications(nic) {
    const response = await fetch(`https://localhost:7008/api/Notification/by-nic/${nic}`);
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    return await response.json();
}

// Fetch enrollments for the student by NIC
async function fetchEnrollmentsByNic(nic) {
    const response = await fetch(`https://localhost:7008/api/Enrollment/by-nic/${nic}`);
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    return await response.json();
}

// Fetch course details by course ID
async function fetchCourseData(courseId) {
    const response = await fetch(`https://localhost:7008/api/Course/GetById${courseId}`);
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    return await response.json();
}

// Fetch payment details by NIC
async function fetchPaymentByNic(nic) {
    const response = await fetch(`https://localhost:7008/api/Payment/GetByNIC/${nic}`);
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    return await response.json();
}

// Fetch enrollment details by ID
async function fetchEnrollmentById(enrollmentId) {
    const response = await fetch(`https://localhost:7008/api/Enrollment/${enrollmentId}`);
    console.log(`Fetching enrollment for ID: ${enrollmentId}`); // Log the URL
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    return await response.json();
}

// Fetch course details by ID
async function fetchCourseById(courseId) {
    const response = await fetch(`https://localhost:7008/api/Course/${courseId}`);
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    return await response.json();
}

// Populate courses from admin page
// async function populateCoursesFromAdminPage() {
//     try {
//         const courses = await fetchCourses();
//         const coursesContainer = document.getElementById('corsesFromAdminPage'); // Ensure this matches your HTML ID
//         coursesContainer.innerHTML = '';

//         if (courses.length > 0) {
//             courses.forEach(course => {
//                 const card = document.createElement('div');
//                 card.className = 'course-card';

//                 card.innerHTML = `

//                     <h3>${course.courseName}</h3>
//                     <p>Period: ${course.duration}</p>
//                     <p>Level: ${course.level}</p>
//                     <p>Fee: $${course.fees}</p>
//                 `;

//                 coursesContainer.appendChild(card);
//             });
//         } else {
//             coursesContainer.innerHTML = '<p>No courses available at the moment. Please contact admin for more details.</p>';
//         }
//     } catch (error) {
//         console.error('Error populating courses:', error.message);
//     }
// }

async function populateCoursesFromAdminPage() {
    try {
        const courses = await fetchCourses();
        const leftCoursesContainer = document.getElementById('leftCoursesFromAdminPage');
        const rightCoursesContainer = document.getElementById('rightCoursesFromAdminPage');

        leftCoursesContainer.innerHTML = '';
        rightCoursesContainer.innerHTML = '';

        const midIndex = Math.ceil(courses.length / 2); // Find the middle index
        const leftCourses = courses.slice(0, midIndex); // First half
        const rightCourses = courses.slice(midIndex); // Second half

        // Populate left half
        leftCourses.forEach(course => {
            const card = document.getElementById('card');
            card.className = 'course-card';
            card.innerHTML = `
                <div class="card-body">
                    <h5 class="card-title">${course.courseName}</h5>
                    <p class="card-text text-dark">${course.duration}</p>
                    <p class="card-text text-secondary">${course.level}</p>
                    <p class="card-text text-danger">${course.fees}</p>
                    <a href="#" class="btn btn-success">Follow</a>
                /div>
            `;
            leftCoursesContainer.appendChild(card);
        });

        // Populate right half
        rightCourses.forEach(course => {
            const card = document.createElement('div');
            card.className = 'course-card';
            card.innerHTML = `
                <h3>${course.courseName}</h3>
                <p>Period: ${course.duration}</p>
                <p>Level: ${course.level}</p>
                <p>Fee: $${course.fees}</p>
            `;
            rightCoursesContainer.appendChild(card);
        });

    } catch (error) {
        console.error('Error populating courses:', error.message);
    }
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

// Load courses for the student
async function loadCourses() {
    const nic = sessionStorage.getItem('loggedStudent');
    if (!nic) {
        console.error('No NIC found in session storage.');
        return;
    }

    try {
        console.log('Fetching enrollments for NIC:', nic);
        const enrollments = await fetchEnrollmentsByNic(nic);
        console.log('Enrollments fetched:', enrollments);

        if (enrollments.length === 0) {
            alert('No courses enrolled.');
            return;
        }

        const studentCoursesTable = document.getElementById('studentCoursesTable').getElementsByTagName('tbody')[0];
        studentCoursesTable.innerHTML = ''; // Clear existing rows

        // Fetch course details for each enrollment using forEach
        enrollments.forEach(async (enrollment) => {
            const course = await fetchCourseData(enrollment.courseId);
            console.log('Course fetched:', course);

            // Populate the table
            const row = studentCoursesTable.insertRow();
            row.insertCell(0).innerText = course.id;               // Course ID
            row.insertCell(1).innerText = course.courseName;       // Course Name
            row.insertCell(2).innerText = course.duration;          // Duration
            row.insertCell(3).innerText = course.level;             // Level
            row.insertCell(4).innerText = course.fees;              // Fees
            row.insertCell(5).innerText = enrollment.paymentPlan;   // Payment Plan
        });
    } catch (error) {
        console.error('Error loading courses:', error.message);
    }
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
    console.log('NIC from session storage:', nic);

    if (!nic) {
        console.error('No NIC found in session storage.');
        return;
    }

    try {
        const payments = await fetchPaymentByNic(nic);
        console.log('Payments fetched:', payments);

        if (Array.isArray(payments) && payments.length > 0) {
            const studentPaymentsTable = document.getElementById('studentPaymentsTable').getElementsByTagName('tbody')[0];
            studentPaymentsTable.innerHTML = '';

            for (const payment of payments) {
                const enrollmentId = payment.enrollmentID;

                if (!enrollmentId) {
                    console.warn('No enrollment ID found for payment:', payment);
                    continue;
                }

                const enrollment = await fetchEnrollmentById(enrollmentId);
                if (enrollment) {
                    const course = await fetchCourseById(enrollment.courseId);
                    if (course) {
                        const row = studentPaymentsTable.insertRow();
                        row.insertCell(0).innerText = new Date(payment.paymentDate).toLocaleDateString();
                        row.insertCell(1).innerText = course.courseName;
                        row.insertCell(2).innerText = payment.amount;
                    } else {
                        console.warn(`No course found for ID: ${enrollment.courseId}`);
                    }
                } else {
                    console.warn(`No enrollment found for ID: ${enrollmentId}`);
                }
            }
        } else {
            alert('No payments found for this student.');
        }
    } catch (error) {
        console.error('Error loading payments:', error.message);
    }
}


// Call all loading functions on page load
document.addEventListener('DOMContentLoaded', () => {
    populateCoursesFromAdminPage();
    loadProfile();
    loadCourses();
    loadNotifications();
    loadPayments();
});
