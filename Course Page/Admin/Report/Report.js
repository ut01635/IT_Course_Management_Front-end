const GetAllStudentsURL = 'https://localhost:7008/api/Student/Get-All-Students';
const GetAllCoursesURL = 'https://localhost:7008/api/Course/GetAllCourses';
const GetEnrollmentsByNICURL = 'https://localhost:7008/api/Enrollment/by-nic/';
const GetPaymentByNICURL = 'https://localhost:7008/api/Payment/GetByNIC/'; // Updated endpoint for payment by NIC
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
    
    // Populate the course dropdown
    populateCourseDropdown(enrolledCourses, nicInput); // Pass nicInput here
});

// Populate course dropdown based on enrollments
async function populateCourseDropdown(enrolledCourses, nicInput) {
    const courseSelect = document.getElementById("EnrollCourses");
    courseSelect.innerHTML = '<option selected>Following Course</option>'; // Reset the dropdown

    // Store the enrollment IDs for later use
    let enrollmentIds = [];

    for (const enrollment of enrolledCourses) {
        const course = await fetchData(GetCourseByIdURL + enrollment.courseId); // Fetch course by ID
        if (course) {
            const option = document.createElement("option");
            option.value = enrollment.id; // Store the enrollment ID as the value
            option.textContent = course.courseName; // Display the course name
            courseSelect.appendChild(option);
            enrollmentIds.push(enrollment.id); // Collect enrollment IDs
        }
    }

    // If there are enrolled courses, fetch payment info for the student
    if (enrollmentIds.length > 0) {
        fetchPaymentDetailsByNIC(nicInput); // Fetch payment details by NIC
    } else {
        alert("No enrolled courses found.");
        clearPaymentDetails(); // Clear payment details if no courses found
    }
}

// Fetch payment details using NIC
async function fetchPaymentDetailsByNIC(nic) {
    const response = await fetch(GetPaymentByNICURL + nic);
    if (response.ok) {
        const payments = await response.json();
        // Assuming payments is an array and we want to show the first one
        if (payments.length > 0) {
            fillPaymentDetails(payments[0]); // Fill with first payment detail
        } else {
            alert("No payment details found for this student.");
            clearPaymentDetails(); // Clear payment details if not found
        }
    } else {
        alert("Payment details not found.");
        clearPaymentDetails(); // Clear payment details if not found
    }
}

// Function to fill payment details
function fillPaymentDetails(payment) {
    console.log(payment);
    document.getElementById("fee").value = payment.amount || ""; // Ensure safe access
    document.getElementById("plan").value = payment.paymentPlan || ""; // Ensure safe access
    document.getElementById("full-payment").value = payment.amount || ""; // Ensure safe access
    document.getElementById("installments").value = payment.installments || ""; // Ensure safe access
    document.getElementById("installment-amount").value = payment.installmentAmount || ""; // Ensure safe access
    document.getElementById("payment-paid").value = payment.paymentPaid || ""; // Ensure safe access
    document.getElementById("payment-due").value = payment.paymentDue || ""; // Ensure safe access
    document.getElementById("payment-date").value = payment.paymentDate || ""; // Ensure safe access

    // Debugging log for checking values
    console.log("Payment Details:", payment);
}

// Function to clear payment details
function clearPaymentDetails() {
    document.getElementById("fee").value = "";
    document.getElementById("plan").value = "";
    document.getElementById("full-payment").value = "";
    document.getElementById("installments").value = "";
    document.getElementById("installment-amount").value = "";
    document.getElementById("payment-paid").value = "";
    document.getElementById("payment-due").value = "";
    document.getElementById("payment-date").value = "";
}

// Initialize data fetching
GetAllStudents();
