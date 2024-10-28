const GetAllStudentsURL = 'https://localhost:7008/api/Student/Get-All-Students';
const GetAllCoursesURL = 'https://localhost:7008/api/Course/GetAllCourses';
const GetEnrollmentsByNICURL = 'https://localhost:7008/api/Enrollment/by-nic/';
const GetPaymentsByEnrollmentId = 'https://localhost:7008/api/Payment/GetByEnrollment/';
const GetPaymentByNICURL = 'https://localhost:7008/api/Payment/GetByNIC/';
const GetCourseByIdURL = 'https://localhost:7008/api/Course/GetById';
const GetEnrollmentsById = 'https://localhost:7008/api/Enrollment/Get-enrollmetnt-By'

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
            console.log('select Option')
            console.log(enrollment.id)
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

function SelectFectPayment() {
    fillPaymentDetails();
}
// Fetch payment details using NIC
async function fetchPaymentDetailsByNIC(nic) {
    console.log('nic fetcg')
    console.log(nic)
    const response = await fetch(GetPaymentByNICURL + nic);
    if (response.ok) {
        const payments = await response.json();
        if (payments.length > 0) {
            console.log(payments)



       

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
async function fillPaymentDetails() {
    let selectData = document.getElementById('EnrollCourses').value

    const paymentDetails = []
    const enrollments = []
    const courseDetails=[]
    
    await fetch(GetPaymentsByEnrollmentId + selectData)
        .then(data => data.json())
        .then(data => {
            
            console.log("0101");
            console.log(data);
            paymentDetails.push(data)
        })

    await fetch(GetEnrollmentsById + selectData)
        .then(data => data.json())
        .then(data => {
            enrollments.push(data)
        })
    fetch(GetCourseByIdURL + selectData)
        .then(d => d.json())
        .then(d => {
            courseDetails.push(d)

        })


    // let PaidAmount = 0;
    // paymentDetails.forEach(element => {
    //     PaidAmount += element.amount
    // });

    console.log('piralask')
    console.log(courseDetails)
    document.getElementById("fee").value = courseDetails.fees || ""; // Course Fee
    document.getElementById("paymentPlan").value = enrollments[0].paymentPlan || ""; // Full Payment
    document.getElementById("paidAmount").value = paymentDetails.installments || ""; // Installments
    document.getElementById("dueAmount").value = paymentDetails.installmentAmount || ""; // Installment Amount
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
