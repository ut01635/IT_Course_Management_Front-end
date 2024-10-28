const GetAllStudentsURL = 'https://localhost:7008/api/Student/Get-All-Students';
const GetAllCoursesURL = 'https://localhost:7008/api/Course/GetAllCourses';
const GetEnrollmentsByNICURL = 'https://localhost:7008/api/Enrollment/by-nic/';
const GetPaymentByNICURL = 'https://localhost:7008/api/Payment/GetByNIC/';
const GetCourseByIdURL = 'https://localhost:7008/api/Course/GetById';

// Global variables to hold fetched data
let students = [];
let courses = [];

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
});

// Populate course dropdown based on enrollments
async function populateCourseDropdown(enrolledCourses, nicInput) {
    const courseSelect = document.getElementById("EnrollCourses");
    courseSelect.innerHTML = '<option selected>Following Course</option>'; // Reset the dropdown

    let enrollmentIds = [];

    for (const enrollment of enrolledCourses) {
        const course = await fetchData(GetCourseByIdURL + enrollment.courseId);
        if (course) {
            const option = document.createElement("option");
            option.value = enrollment.id;
            option.textContent = course.courseName;
            courseSelect.appendChild(option);
            enrollmentIds.push(enrollment.id);
        }
    }

    if (enrollmentIds.length > 0) {
        await fetchPaymentDetailsByNIC(nicInput);
    } else {
        alert("No enrolled courses found.");
        clearPaymentDetails();
    }
}

// Fetch payment details using NIC
async function fetchPaymentDetailsByNIC(nic) {
    const response = await fetch(GetPaymentByNICURL + nic);
    if (response.ok) {
        const payments = await response.json();
        if (payments.length > 0) {
            fillPaymentDetails(payments[0]);
        } else {
            alert("No payment details found for this student.");
            clearPaymentDetails();
        }
    } else {
        alert("Payment details not found.");
        clearPaymentDetails();
    }
}

// Function to fill payment details
function fillPaymentDetails(payment) {
    clearPaymentDetails(); // Clear previous values

    document.getElementById("fee").value = payment.amount || ""; // Course Fee
    document.getElementById("full-payment").value = payment.fullPaymentAmount || ""; // Full Payment
    document.getElementById("installments").value = payment.installments || ""; // Installments
    document.getElementById("installment-amount").value = payment.installmentAmount || ""; // Installment Amount
    document.getElementById("payment-date").value = payment.paymentDate || ""; // Payment Date
}

// Function to clear payment details
function clearPaymentDetails() {
    document.getElementById("fee").value = "";
    document.getElementById("full-payment").value = "";
    document.getElementById("installments").value = "";
    document.getElementById("installment-amount").value = "";
    document.getElementById("payment-date").value = "";
}

// Initialize data fetching
GetAllStudents();
