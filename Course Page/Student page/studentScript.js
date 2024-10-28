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
async function fetchCourseData(CourseId) {
    const response = await fetch(`https://localhost:7008/api/Course/GetById${CourseId}`);
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    return await response.json();
}

async function fetchAllCourseData() {
    const response = await fetch(`https://localhost:7008/api/Course/GetAllCourses`);
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
    const response = await fetch(`https://localhost:7008/api/Enrollment/Get-enrollmetnt-By${enrollmentId}`);
    console.log(`Fetching enrollment for ID: ${enrollmentId}`); // Log the URL
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    return await response.json();
}

// Fetch course details by ID
async function fetchCourseById(courseId) {
    const response = await fetch(`https://localhost:7008/api/Course/GetById${courseId}`);
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    return await response.json();
}

async function logEnrollment(enrollmentId) {
    try {
        const enrollmentData = await fetchEnrollmentById(enrollmentId);
        console.log("course:", enrollmentData);
    } catch (error) {
        console.error("Error fetching enrollment:", error);
    }
}

logEnrollment(1); // Call the function with the desired enrollment ID



async function populateCoursesFromAdminPage() {
    try {
        const courses = await fetchAllCourseData();
        const cardRow = document.getElementById('card-row');
        // Populate left half
        courses.forEach(course => {
            const cardMain = document.createElement('div')
            cardMain.className = 'col-md-4 mb-3';
            cardMain.innerHTML = `
            <div class="card" id="card">
                <div class="card-body">
                    <h5 class="card-title">${course.courseName}</h5>
                    <p class="card-text text-dark">${course.duration}</p>
                    <p class="card-text text-secondary">${course.level}</p>
                    <p class="card-text text-danger">${course.fees}</p>
                    <a href="#" class="btn btn-success" onclick="PlanPopup(${course.id})" >Follow</a>
                </div>
            </div>  
            `;
            cardRow.appendChild(cardMain);
        });



    } catch (error) {
        console.error('Error populating courses:', error.message);
    }
}


let currentCourseId = null;
function PlanPopup(courseId) {
    // Find the course details from the courses array or from an API
    fetchAllCourseData().then(courses => {
        const course = courses.find(c => c.id === courseId);
        if (course) {
            document.getElementById('courseDetails').innerText = `Course: ${course.courseName}\nFees: ${course.fees}`;
            currentCourseId = course.id;
            // Show the modal
            const modal = new bootstrap.Modal(document.getElementById('paymentPlanModal'));
            modal.show();
        }
    }).catch(error => {
        console.error('Error fetching course data:', error.message);
    });
}

async function confirmEnroll() {
    const selectedPlan = document.getElementById('paymentPlanSelect').value;
    
    // Assuming you have the student's NIC and course ID available in your context
    const studentNIC = "200206601718"; // Replace with actual NIC as needed
    const courseId = currentCourseId;
    const enrollmentDate = new Date().toISOString(); // Current date in ISO format

    const enrollmentData = {
        studentNIC: studentNIC,
        courseId: courseId,
        enrollmentDate: enrollmentDate,
        paymentPlan: selectedPlan,
        status: "pending" // Default status
    };

    try {
        const response = await fetch('https://localhost:7008/api/Enrollment/Create-Enrollment', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(enrollmentData)
        });

        if (!response.ok) {
            throw new Error('Network response was not ok: ' + response.statusText);
        }

        const result = await response.json();
        console.log('Enrollment successful:', result);
        alert('Enrollment successful!');

        // Optionally close the modal after successful enrollment
        const modal = bootstrap.Modal.getInstance(document.getElementById('paymentPlanModal'));
        modal.hide();

    } catch (error) {
        console.error('Error enrolling:', error.message);
        alert('Enrollment failed: ' + error.message);
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
        // console.log('Fetched student data:', student);

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
            // console.log('Course fetched:', course);

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
        // console.log('Fetched notifications:', notifications);

        const notificationsTable = document.getElementById('notificationTable').getElementsByTagName('tbody')[0];
        notificationsTable.innerHTML = '';

        notifications.forEach(notification => {
            const row = notificationsTable.insertRow(); // Create a new row
            let formatdate = new Date(notification.date).toISOString().slice(0, 10);
            const dateCell = row.insertCell(0); // Insert a new cell for the date
            dateCell.innerText = formatdate; // Set the date text

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
        tableBody = document.getElementById("paymentDetails")
        const payments = await fetchPaymentByNic(nic);
        // console.log('Payments fetched:', payments);
        if (payments) {
            payments.forEach(payment => {


                async function getEnrollment(enrollmentId) {
                    try {
                        const enrollmentData = await fetchEnrollmentById(enrollmentId);
                        console.log("enrollment:", enrollmentData);
                        return enrollmentData
                    } catch (error) {
                        console.error("Error fetching enrollment:", error);
                    }
                }
                const Enrollment = getEnrollment(payment.enrollmentId)

                if (Enrollment) {
                    async function getCourse(CourseId) {
                        try {
                            const CourseData = await fetchCourseById(CourseId);
                            console.log("course:", CourseData);
                        } catch (error) {
                            console.error("Error fetching enrollment:", error);
                        }
                    }
                    let course = getCourse(Enrollment.CourseId)

                    if (course) {
                        Row = document.createElement('tr');
                        Row.innerHTML = `
                            <td>${payment.paymentDate}</td>
                            <td>${course.courseName}</td>
                            <td>${payment.amount}</td>
                        `;
                        tableBody.appendChild(Row)
                    }

                }


            })
        }
        else {
            Row = document.createElement('tr');
            Row.innerHTML = `
                <td>Payment details not availabe...</td>
                `;
            tableBody.appendChild(Row)
        }



        //     // if (payments) {
        //     //     courses = 

        //     // }

        //     if (Array.isArray(payments) && payments.length > 0) {
        //         const studentPaymentsTable = document.getElementById('studentPaymentsTable').getElementsByTagName('tbody')[0];
        //         studentPaymentsTable.innerHTML = '';

        //         for (const payment of payments) {
        //             const enrollmentId = payment.enrollmentID;

        //             if (!enrollmentId) {
        //                 console.warn('No enrollment ID found for payment:', payment);
        //                 continue;
        //             }

        //             const enrollment = await fetchEnrollmentById(enrollmentId);
        //             if (enrollment) {
        //                 const course = await fetchCourseById(enrollment.courseId);
        //                 if (course) {
        //                     const row = studentPaymentsTable.insertRow();
        //                     row.insertCell(0).innerText = new Date(payment.paymentDate).toLocaleDateString();
        //                     row.insertCell(1).innerText = course.courseName;
        //                     row.insertCell(2).innerText = payment.amount;
        //                 } else {
        //                     console.warn(`No course found for ID: ${enrollment.courseId}`);
        //                 }
        //             } else {
        //                 console.warn(`No enrollment found for ID: ${enrollmentId}`);
        //             }
        //         }
        //     } else {
        //         alert('No payments found for this student.');
        //     }
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
