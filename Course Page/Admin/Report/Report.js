// Side NaveBar
const toggle = document.querySelector(".fa-bars");
const toggleClose = document.querySelector(".fa-xmark");
const sideNavebar = document.querySelector(".side-navebar");

toggle.addEventListener("click", function () {
    sideNavebar.style.right = "0";
})

toggleClose.addEventListener("click", function () {
    sideNavebar.style.right = "-60%";
})


let students = [];
let courses = [];
let courseEnrollData = [];
let paymentDetails = [];

// API URLs
const GetAllStudentsURL = 'https://localhost:7008/api/Student/Get-All-Students';
const GetAllCoursesURL = 'https://localhost:7008/api/Course/GetAllCourses';
const GetAllCourseEnrollURL = 'https://localhost:7008/api/Enrollment/Get-all-enrollmetnt';
const GetPaymentByEnrollmentURL = 'https://localhost:7008/api/Payment/enrollment/';

// Fetch Students Data from Database
async function GetAllStudents() {
    const response = await fetch(GetAllStudentsURL);
    students = await response.json();
    await GetAllCourses();
}

// Fetch All Courses
async function GetAllCourses() {
    const response = await fetch(GetAllCoursesURL);
    courses = await response.json();
    await GetAllCourseEnrollData();
}

// Fetch Course Enrollment Data
async function GetAllCourseEnrollData() {
    const response = await fetch(GetAllCourseEnrollURL);
    courseEnrollData = await response.json();
}

// Event Listener for Generate Report Button
const reportGenerateBtn = document.getElementById("report-generate-btn");

reportGenerateBtn.addEventListener("click", async function() {
    const nicInput = document.getElementById("search-by-nic").value;
    if (!nicInput) {
        alert("Please enter NIC number.");
        return;
    }

    const student = students.find(s => s.nic === nicInput);
    if (!student) {
        alert("Student not found.");
        return;
    }

    document.getElementById("nic").value = student.nic;
    document.getElementById("name").value = student.fullName;
    document.getElementById("email").value = student.email;
    document.getElementById("phone").value = student.phone;

    const enrolledCourses = courseEnrollData.filter(enrollment => enrollment.studentNic === nicInput);
    const courseSelect = document.getElementById("EnrollCourses");
    courseSelect.innerHTML = '<option selected>Following Course</option>';

    // Store the enrollment IDs for later use
    let enrollmentIds = [];

    enrolledCourses.forEach(enrollment => {
        const course = courses.find(c => c.id === enrollment.courseId);
        if (course) {
            const option = document.createElement("option");
            option.value = enrollment.id; // Store the enrollment ID as the value
            option.textContent = course.name;
            courseSelect.appendChild(option);
            enrollmentIds.push(enrollment.id); // Collect enrollment IDs
        }
    });

    // If there are enrolled courses, fetch payment info for the first enrollment
    if (enrollmentIds.length > 0) {
        await fetchPaymentDetails(enrollmentIds[0]); // Fetch payment details for the first enrollment
    } else {
        alert("No enrolled courses found.");
    }
});

// Fetch payment details using enrollment ID
async function fetchPaymentDetails(enrollmentId) {
    const response = await fetch(GetPaymentByEnrollmentURL + enrollmentId);
    if (response.ok) {
        const payment = await response.json();
        fillPaymentDetails(payment);
    } else {
        alert("Payment details not found.");
    }
}

// Function to fill payment details
function fillPaymentDetails(payment) {
    document.getElementById("fee").value = payment.courseFee || "";
    document.getElementById("plan").value = payment.paymentPlan || "";
    document.getElementById("full-payment").value = payment.fullPayment || "";
    document.getElementById("installments").value = payment.installments || "";
    document.getElementById("installment-amount").value = payment.installmentAmount || "";
    document.getElementById("payment-paid").value = payment.paymentPaid || "";
    document.getElementById("payment-due").value = payment.paymentDue || "";
    document.getElementById("payment-date").value = payment.paymentDate || "";
}

// Fetch all initial data
GetAllStudents();



//Logout function

function logout() {
    window.location.href = "../01_Admin_Login/admin_login.html";
}

const logoutButton = document.getElementById('logoutButton');
logoutButton.addEventListener('click', function () {
    logout();
});





