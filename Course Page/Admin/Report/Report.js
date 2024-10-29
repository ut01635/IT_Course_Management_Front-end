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

// Initialize data fetching
GetAllStudents();
