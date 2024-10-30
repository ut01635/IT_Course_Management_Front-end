const Greeting = document.getElementById("greeting");

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

async function getEnrollment(enrollmentId) {
    try {
        const enrollmentData = await fetchEnrollmentById(enrollmentId);
        console.log("enrollment:", enrollmentData);
        return enrollmentData
    } catch (error) {
        console.error("Error fetching enrollment:", error);
    }
}

async function getCourse(CourseId) {
    try {
        const CourseData = await fetchCourseById(CourseId);
        console.log("course:", CourseData);
        return CourseData
    } catch (error) {
        console.error("Error fetching enrollment:", error);
    }
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
            <div class="card shadow p-3 mb-5 bg-body-tertiary rounded" id="card">
                <div class="card-body ">
                    <h5 class="card-title fs-2 text-center">${course.courseName}</h5>
                    <p class="card-text text-dark text-center">${course.duration}</p>
                    <p class="card-text text-secondary text-center fw-medium">${course.level}</p>
                    <p class="card-text text-danger text-center">LKR. ${course.fees}.00</p>
                    <div class="d-flex justify-content-center"> <a href="#" class="btn btn-success " onclick="PlanPopup(${course.id})" >Follow</a></div>
                </div>
            </div>  
            `;
            cardRow.appendChild(cardMain);
        });



    } catch (error) {
        console.error('Error populating courses:', error.message);
    }
}




const loggedNic = sessionStorage.getItem('loggedStudent');
let currentCourseId = null;
console.log(loggedNic);


function PlanPopup(CourseId) {
    // Fetch the course details
    fetchAllCourseData().then(courses => {
        const course = courses.find(c => c.id === CourseId);
        if (course) {
            // Get the NIC from session storage


            if (loggedNic) {
                // Fetch enrollment details using the logged NIC
                fetch(`https://localhost:7008/api/Enrollment/by-nic/${loggedNic}`)
                    .then(response => {
                        if (!response.ok) {
                            throw new Error('Network response was not ok');
                        }
                        return response.json();
                    })
                    .then(enrollmentData => {
                        // Check if there's a matching enrollment
                        const existingEnrollment = enrollmentData.find(enrollment => enrollment.courseId === CourseId);
                        if (existingEnrollment) {
                            // Show alert modal
                            const alertModal = new bootstrap.Modal(document.getElementById('alertModal'));
                            alertModal.show();
                            return; // Exit the function if already enrolled
                        } else {
                            // If not enrolled, display course details
                            document.getElementById('courseDetails').innerText = `Course: ${course.courseName}\nFees: ${course.fees}`;
                            currentCourseId = course.id;

                            // Show the payment plan modal
                            const modal = new bootstrap.Modal(document.getElementById('paymentPlanModal'));
                            modal.show();
                        }
                    })
                    .catch(error => {
                        console.error('Error fetching enrollment data:', error.message);
                    });
            } else {
                console.error('No NIC found in session storage.');
            }
        }
    }).catch(error => {
        console.error('Error fetching course data:', error.message);
    });
}



async function confirmEnroll() {
    const selectedPlan = document.getElementById('paymentPlanSelect').value;


    const studentNIC = loggedNic;
    const courseId = currentCourseId;
    const enrollmentDate = new Date().toISOString(); // Current date in ISO format

    const enrollmentData = {
        studentNIC: studentNIC,
        courseId: courseId,
        enrollmentDate: enrollmentDate,
        paymentPlan: selectedPlan,
        status: "pending"
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
        // Optionally close the modal after successful enrollment
        const modal = bootstrap.Modal.getInstance(document.getElementById('paymentPlanModal'));
        modal.hide();
        alert('Enrollment successful!');
        loadCourses()


    } catch (error) {
        console.error('Error enrolling:', error.message);
        alert('Enrollment failed: ' + error.message);
    }
}


// Function to get current greeting based on time
function getGreetingMessage(studentName) {
    const currentHour = new Date().getHours();
    let greeting;

    if (currentHour < 12) {
        greeting = "Good Morning";
    } else if (currentHour < 18) {
        greeting = "Good Afternoon";
    } else {
        greeting = "Good Evening";
    }

    return `${greeting}, ${studentName}!`;
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
        

         // Update greeting message
         const greetingMessage = getGreetingMessage(student.fullName);
         Greeting.innerText = greetingMessage;
 

        document.getElementById('profileNameDisplay').value = student.fullName;
        document.getElementById('profileNICDisplay').value = student.nic;
        document.getElementById('profileEmailDisplay').value = student.email;
        document.getElementById('profilePhoneDisplay').value = student.phone;

    } catch (error) {
        console.error('Error fetching student data:', error.message);
    }
}

// Open modal to update profile
async function openUpdateProfileModal() {
    const nic = sessionStorage.getItem('loggedStudent');
    if (!nic) {
        console.error('No NIC found in session storage.');
        return;
    }

    try {
        const student = await fetchStudentData(nic);
        console.log('Fetched student data for update:', student);
        document.getElementById('updateProfileName').value = student.fullName;
        document.getElementById('updateProfileNIC').value = student.nic; // Keep this disabled if not editable
        document.getElementById('updateProfileEmail').value = student.email;
        document.getElementById('updateProfilePhone').value = student.phone;

        // Use Bootstrap's modal methods to show the modal
        const modal = new bootstrap.Modal(document.getElementById('updateProfileModal'));
        modal.show();
    } catch (error) {
        console.error('Error fetching student data for update:', error.message);
    }
}

// Close update profile modal
function closeUpdateProfileModal() {
    const modal = bootstrap.Modal.getInstance(document.getElementById('updateProfileModal'));
    modal.hide();
}

// Update student profile
async function updateProfile() {
    const nic = sessionStorage.getItem('loggedStudent');
    if (!nic) {
        console.error('No NIC found in session storage.');
        return;
    }

    const name = document.getElementById('updateProfileName').value.trim();
    const email = document.getElementById('updateProfileEmail').value.trim();
    const phoneNumber = document.getElementById('updateProfilePhone').value.trim();

    // Basic validation
    if (!name || !email || !phoneNumber) {
        alert('Please fill out all fields.');
        return;
    }

    const payload = { name, email, phoneNumber };

    try {
        // Show loading indicator (optional)
        const loadingMessage = document.getElementById('loadingMessage');
        loadingMessage.style.display = 'block'; // Show loading message

        const response = await fetch(`https://localhost:7008/api/Student/Update-Student/${nic}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const errorData = await response.json();
            const errorMessage = errorData.message || 'Failed to update profile';
            throw new Error(errorMessage);
        }

        alert('Profile updated successfully!');
        closeUpdateProfileModal();
        loadProfile(); // Reload the profile to reflect changes
    } catch (error) {
        console.error('Error updating profile:', error.message);
        alert(`Error: ${error.message}`); // Show error to user
    } finally {
        // Hide loading indicator
        const loadingMessage = document.getElementById('loadingMessage');
       loadingMessage.style.display = 'none'; // Hide loading message
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

        const notificationData = document.getElementById('notificationData')
        notificationData.innerHTML = '';

        notifications.forEach(notification => {
            let formatdate = new Date(notification.date).toISOString().slice(0, 10);
            const row = document.createElement('tr'); // Create a new row
            row.innerHTML = `
                <td>${formatdate}</td>
                <td>${notification.message}</td>
                <td><button type="button" class="btn btn-outline-danger btn-sm" onclick="deleteNotification(${notification.id})" ><i class="fa-solid fa-trash"></i></button></td>
            `;
            notificationData.appendChild(row); // Append the new row to the table
        });
        
    } catch (error) {
        console.error('Error loading notifications:', error.message);
    }
}

///Delete function for notification message
async function deleteNotification(notificationId) {
    try {
        const response = await fetch(`https://localhost:7008/api/Notification/Delete${notificationId}`, {
            method: 'DELETE',
        });

        if (!response.ok) {
            throw new Error('Failed to delete notification');
        }

        // // Remove the row from the table
        // const row = document.querySelector(`button[data-id="${notificationId}"]`).closest('tr');
        // if (row) {
        //     row.remove();
        // }
        loadNotifications();

        alert('Notification deleted successfully!');
    } catch (error) {
        console.error('Error deleting notification:', error.message);
        alert(`Error: ${error.message}`);
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

    const tableBody = document.getElementById("paymentDetails");
    const payments = await fetchPaymentByNic(nic);

    // Check if payments were fetched
    if (payments) {
        // Use for...of to handle async operations
        for (const payment of payments) {
            console.log(payment);

            const Enrollment = await getEnrollment(payment.enrollmentID);
            console.log("Enrollment data:", Enrollment);

            if (Enrollment) {
                console.log("dfgdrgh",Enrollment.courseId)// Assuming getCourse is also async

                const course = await getCourse(Enrollment.courseId); 
                console.log("dfgdrgh",course)// Assuming getCourse is also async

                if (course) {
                    const formatDate = new Date(payment.paymentDate).toISOString().slice(0, 10);
                    const Row = document.createElement('tr');
                    Row.innerHTML = `
                        <td>${formatDate}</td>
                        <td>${course.courseName}</td>
                        <td>${payment.amount}</td>
                    `;
                    tableBody.appendChild(Row);
                }
            }
        }
    } else {
        const Row = document.createElement('tr');
        Row.innerHTML = `
            <td>Payment details not available...</td>
        `;
        tableBody.appendChild(Row);
    }
}

//     const nic = sessionStorage.getItem('loggedStudent');
//     console.log('NIC from session storage:', nic);

//     if (!nic) {
//         console.error('No NIC found in session storage.');
//         return;
//     }
//         tableBody = document.getElementById("paymentDetails")
//         const payments = await fetchPaymentByNic(nic);
//         // console.log('Payments fetched:', payments);
//         if (payments) {
            
//             payments.forEach(payment =>  {
//                 console.log(payment)
             
//                 const Enrollment =await getEnrollment(payment.enrollmentID)
//                 console.log("dfbsdfvb",Enrollment)

//                 if (Enrollment) {
             
//                     let course = getCourse(Enrollment.courseId)

//                     if (course) {
//                         let formatdate = new Date(payment.paymentDate).toISOString().slice(0, 10);
//                         Row = document.createElement('tr');
//                         Row.innerHTML = `
//                             <td>${formatdate}</td>
//                             <td>${course.courseName}</td>
//                             <td>${payment.amount}</td>
//                         `;
//                         tableBody.appendChild(Row)
//                     }
//                 }
//             })
//         }
//         else {
//             Row = document.createElement('tr');
//             Row.innerHTML = `
//                 <td>Payment details not availabe...</td>
//                 `;
//             tableBody.appendChild(Row)
//         }
    
// }




// Call all loading functions on page load
document.addEventListener('DOMContentLoaded', () => {
    populateCoursesFromAdminPage();
    loadProfile();
    loadCourses();
    loadNotifications();
    loadPayments();
});
