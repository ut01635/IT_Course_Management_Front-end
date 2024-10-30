const toggle = document.querySelector(".fa-bars");
const toggleClose = document.querySelector(".fa-xmark");
const sideNavbar = document.querySelector(".side-navebar");

toggle.addEventListener("click", function () {
    sideNavbar.style.right = "0";
});

toggleClose.addEventListener("click", function () {
    sideNavbar.style.right = "-60%";
});

const BASE_URL = 'https://localhost:7008/api';
const GetAllStudentsURL = `${BASE_URL}/Student/Get-All-Students`;
const GetAllCoursesURL = `${BASE_URL}/Course/GetAllCourses`;
const GetEnrollmentsByNICURL = `${BASE_URL}/Enrollment/by-nic/`;
const GetPaymentsByEnrollmentId = `${BASE_URL}/Payment/GetByEnrollment/`;
const GetPaymentByNICURL = `${BASE_URL}/Payment/GetByNIC/`;
const GetCourseByIdURL = `${BASE_URL}/Course/GetById`;
const GetEnrollmentsById = `${BASE_URL}/Enrollment/Get-enrollmetnt-By`;

// Global variables to hold fetched data
let students = [];
let courses = [];
const nicInput = document.getElementById("search-by-nic").value.trim();

// Fetch all initial data
async function fetchData(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Error: ${response.statusText}`);
        return await response.json();
    } catch (error) {
        alert(error.message);
    }
}

async function GetAllStudents() {
    students = await fetchData(GetAllStudentsURL);
    if (students) await GetAllCourses();
}

async function GetAllCourses() {
    courses = await fetchData(GetAllCoursesURL);
}
// Fetch course details by ID
async function fetchCourseById(courseId) {
    const response = await fetch(`https://localhost:7008/api/Course/GetById${courseId}`);
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    return await response.json();
}
//Course get by id
async function getCourse(CourseId) {
    try {
        const CourseData = await fetchCourseById(CourseId);
        return CourseData
    } catch (error) {
        console.error("Error fetching enrollment:", error);
    }
}

// Fetch enrollment details by ID
async function fetchEnrollmentById(enrollmentId) {
    const response = await fetch(`https://localhost:7008/api/Enrollment/Get-enrollmetnt-By${enrollmentId}`);
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    return await response.json();
}

//Get enrollment BY Id
async function getEnrollment(enrollmentId) {
    try {
        const enrollmentData = await fetchEnrollmentById(enrollmentId);
        return enrollmentData
    } catch (error) {
        console.error("Error fetching enrollment:", error);
    }
}

// Event Listener for Generate Report Button
const reportGenerateBtn = document.getElementById("report-generate-btn");

reportGenerateBtn.addEventListener("click", async function () {
    const nicInput = document.getElementById("search-by-nic").value.trim();
    if (!nicInput) {
        alert("Please enter NIC number.");
        return;
    }

    const student = students.find(s => s.nic === nicInput);
    if (!student) {
        alert("Student not found.");
        return;
    }

    // Fill student personal details
    document.getElementById("nic").value = student.nic;
    document.getElementById("name").value = student.fullName;
    document.getElementById("email").value = student.email;
    document.getElementById("phone").value = student.phone;

    // Fetch enrolled courses for the student by NIC
    const enrolledCourses = await fetchData(GetEnrollmentsByNICURL + nicInput);
    await populateCourseDropdown(enrolledCourses, nicInput);
    loadPayments(nicInput)
});

// Populate course dropdown based on enrollments
async function populateCourseDropdown(enrolledCourses, nicInput) {
    const courseSelect = document.getElementById("EnrollCourses");
    courseSelect.innerHTML = '<option selected>Following Course</option>'; // Reset the dropdown

    if (enrolledCourses.length === 0) {
        alert("No enrolled courses found.");
        clearPaymentDetails();
        return;
    }

    for (const enrollment of enrolledCourses) {
        try {
            const course = await fetchData(`${GetCourseByIdURL}${enrollment.courseId}`);
            if (course) {
                const option = document.createElement("option");
                option.value = enrollment.id; // Enrollment ID
                option.textContent = course.courseName;
                courseSelect.appendChild(option);
            }
        } catch (error) {
            console.error(`Failed to fetch course with ID ${enrollment.courseId}: ${error.message}`);
            alert(`Course with ID ${enrollment.courseId} not found.`);
        }
    }
}

// Fetch payment details using NIC
async function fetchPaymentDetailsByNIC(nic) {
    const response = await fetch(GetPaymentByNICURL + nic);
    if (response.ok) {
        const payments = await response.json();
        if (payments.length > 0) {
            return payments;
        } else {
            alert("No payment details found for this student.");
            clearPaymentDetails();
        }
    } else {
        alert("Payment details not found.");
        clearPaymentDetails();
    }
}

// Function to handle the selection of a course
async function SelectFectPayment() {
    const selectedEnrollmentId = document.getElementById('EnrollCourses').value;
    if (!selectedEnrollmentId) return;

    const paymentDetails = await fetch(GetPaymentsByEnrollmentId + selectedEnrollmentId).then(res => res.json());
    const enrollmentDetails = await fetch(GetEnrollmentsById + selectedEnrollmentId).then(res => res.json());
    const courseDetails = await fetch(`${GetCourseByIdURL}${selectedEnrollmentId}`).then(res => res.json());

    // Calculate values
    const courseFee = courseDetails.fees || 0;
    const paymentPlan = enrollmentDetails.paymentPlan || "N/A";
    const paidAmount = paymentDetails.reduce((total, payment) => total + payment.amount, 0);
    const dueAmount = courseFee - paidAmount;

    // Fill payment details
    document.getElementById("fee").value = courseFee; // Course Fee
    document.getElementById("paymentPlan").value = paymentPlan; // Payment Plan
    document.getElementById("paidAmount").value = paidAmount; // Total Paid Amount
    document.getElementById("dueAmount").value = dueAmount > 0 ? dueAmount : 0; // Remaining Amount
}

// Function to clear payment details
function clearPaymentDetails() {
    document.getElementById("fee").value = "";
    document.getElementById("paymentPlan").value = "";
    document.getElementById("paidAmount").value = "";
    document.getElementById("dueAmount").value = "";
}


async function loadPayments(nic) {
    if (!nic) {
        console.error('Please enter NIC');
        return;
    }

    const tableBody = document.getElementById("paymentDetails");
    const payments = await fetchPaymentDetailsByNIC(nic);

    // Check if payments were fetched
    if (payments) {
        // Use for...of to handle async operations
        for (const payment of payments) {
            console.log(payment);

            const Enrollment = await getEnrollment(payment.enrollmentID);

            if (Enrollment) {
               

                const course = await getCourse(Enrollment.courseId); 
               
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

// Initialize data fetching
GetAllStudents();


//Logout function

function logout() {
    window.location.href = "../../login.html";
}

const logoutButton = document.getElementById('logoutButton');
logoutButton.addEventListener('click', function () {
    logout();
});

