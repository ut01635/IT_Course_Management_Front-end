//Site Navebar
const toggle = document.querySelector(".fa-bars")
const toggleClose = document.querySelector(".fa-xmark")
const sideNavebar = document.querySelector(".side-navebar")

toggle.addEventListener("click", function () {
    sideNavebar.style.right = "0"
})

toggleClose.addEventListener("click", function () {
    sideNavebar.style.right = "-60%"
})


// JavaScript to manage the fee form and payment plans

document.addEventListener("DOMContentLoaded", function () {
    const nicInput = document.getElementById('nic');
    const courseSelect = document.getElementById('course');
    const totalCourseFee = document.getElementById('total-course-fee');
    const paymentPlanTag = document.getElementById('payment-plan'); // To show the payment plan
    const totalAmount = document.getElementById('total-amount');
    const installmentAmount = document.getElementById('installment-amount');
    const feeManagementForm = document.getElementById('fee-management-form');
    const feeManagementMessage = document.getElementById('fee-management-message');
    
    let courses = [];
    let enrollmentDetails = null;

    // Fetch all courses
    fetch('https://localhost:7008/api/Course/GetAllCourses')
        .then(response => response.json())
        .then(data => {
            courses = data;
        })
        .catch(err => console.error('Error fetching courses:', err));

    // Fetch enrollment details by NIC
    nicInput.addEventListener('blur', function () {
        const nic = nicInput.value.trim();
        if (nic) {
            fetch(`https://localhost:7008/api/Enrollment/by-nic/${nic}`)
                .then(response => response.json())
                .then(data => {
                    enrollmentDetails = data;
                    if (data && data.length > 0) {
                        feeManagementMessage.textContent = ""; // Clear any previous messages
                        // Enable course selection dropdown
                        courseSelect.disabled = false;
                        // Filter courses based on the enrollment details
                        const enrolledCourseIds = data.map(e => e.courseId);
                        const filteredCourses = courses.filter(course => enrolledCourseIds.includes(course.id));

                        // Clear the course dropdown and populate with the filtered courses
                        courseSelect.innerHTML = '<option value="">Select Course</option>';
                        filteredCourses.forEach(course => {
                            const option = document.createElement('option');
                            option.value = course.id;
                            option.textContent = course.name;
                            option.style.color = "black"
                            courseSelect.appendChild(option);
                        });
                    } else {
                        courseSelect.disabled = true;
                        feeManagementMessage.textContent = "Student not found or not enrolled in any courses.";
                        feeManagementMessage.style.color = 'red';
                    }
                })
                .catch(err => {
                    console.error('Error fetching enrollment details:', err);
                    feeManagementMessage.textContent = "Student not found.";
                    feeManagementMessage.style.color = 'red';
                });
        }
    });

    // When a course is selected
    courseSelect.addEventListener('change', function () {
        const selectedCourse = courses.find(course => course.id == courseSelect.value);
        if (selectedCourse) {
            totalCourseFee.textContent = `${selectedCourse.fees} Rs`; // Show course fee
            const enrollmentDetail = enrollmentDetails.find(e => e.courseId === selectedCourse.id);
            if (enrollmentDetail) {
                // Display the payment plan as text in the <p> tag
                const paymentPlan = enrollmentDetail.paymentPlan; // Assuming paymentPlan is part of enrollment details
                paymentPlanTag.textContent = `${paymentPlan.charAt(0).toUpperCase() + paymentPlan.slice(1)}`;

                // Set the total amount based on payment plan
                if (paymentPlan === "fullpayment") {
                    totalAmount.textContent = `${selectedCourse.fees} Rs`; // Full course fee
                    installmentAmount.textContent = `0 Rs`; // No installments for full payment
                } else if (paymentPlan === "installment") {
                    const installmentAmountValue = selectedCourse.fees / selectedCourse.duration; // Assuming duration is the number of months
                    totalAmount.textContent = `${selectedCourse.fees} Rs`; // Total course fee
                    installmentAmount.textContent = `${installmentAmountValue.toFixed(2)} Rs`; // Installment amount
                }
            }
        }
    });

    // Handle form submission
    feeManagementForm.addEventListener('submit', function (e) {
        e.preventDefault();
        const enrollId = enrollmentDetails[0].id;
        const nic = nicInput.value;
        const date = new Date().toISOString();
        const amount = parseFloat(totalAmount.textContent.replace(' Rs', ''));

        const paymentData = {
            enrollId,
            nic,
            date,
            amount
        };

        // Send payment data to the backend
        fetch('https://localhost:7008/api/Payment/Create-Payment', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(paymentData)
        })
        .then(response => response.json())
        .then(data => {
            feeManagementMessage.textContent = 'Payment Successful!';
            feeManagementMessage.style.color = 'green';
        })
        .catch(err => {
            console.error('Error submitting payment:', err);
            feeManagementMessage.textContent = 'Payment failed. Please try again.';
            feeManagementMessage.style.color = 'red';
        });
    });





    // Function to format the date in the desired format (dd-mm-yyyy / hh.mm)
    function formatDateTime(dateString) {
        const date = new Date(dateString);

        const day = String(date.getDate()).padStart(2, '0');       // Get day and pad with leading zero if necessary
        const month = String(date.getMonth() + 1).padStart(2, '0');  // Get month (0-based) and pad with leading zero
        const year = date.getFullYear();                            // Get full year

        const hours = String(date.getHours()).padStart(2, '0');    // Get hours and pad with leading zero
        const minutes = String(date.getMinutes()).padStart(2, '0'); // Get minutes and pad with leading zero

        // Return the formatted date and time
        return  `${hours}.${minutes} - ${day}/${month}/${year} `;
    }

    // Triggering the modal and fetching payment details
    document.getElementById('student-payment-details').addEventListener('click', function () {
        fetch('https://localhost:7008/api/Payment/Get-All-PAyments')
            .then(response => response.json())
            .then(data => {
                const tbody = document.querySelector('#payment-details-table tbody');
                tbody.innerHTML = '';  // Clear previous table rows

                // Store the payment data in a variable for later use
                const payments = data;

                // Populate the table with payment details
                payments.forEach(payment => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                    <td>${formatDateTime(payment.paymentDate)}</td>
                    <td>${payment.id}</td>
                    <td>${payment.enrollmentID}</td>
                    <td>${payment.nic}</td>
                    <td>${payment.amount} Rs</td>
                `;
                    tbody.appendChild(row);
                });

                // Now apply the search functionality
                const searchNicInput = document.getElementById('searchNic');

                searchNicInput.addEventListener('input', function () {
                    const searchValue = searchNicInput.value.toLowerCase();
                    const filteredPayments = payments.filter(payment =>
                        payment.nic.toLowerCase().includes(searchValue)
                    );

                    // Re-render the table based on the filtered results
                    tbody.innerHTML = '';  // Clear the current rows
                    filteredPayments.forEach(payment => {
                        const row = document.createElement('tr');
                        row.innerHTML = `
                        <td>${formatDateTime(payment.paymentDate)}</td>
                        <td>${payment.id}</td>
                        <td>${payment.enrollmentID}</td>
                        <td>${payment.nic}</td>
                        <td>${payment.amount} Rs</td>
                    `;
                        tbody.appendChild(row);
                    });
                });

                // Show the modal after populating the data
                const paymentDetailsModal = new bootstrap.Modal(document.getElementById('paymentDetailsModal'));
                paymentDetailsModal.show();
            })
            .catch(err => console.error('Error fetching payment details:', err));
    });

});


//Logout function

function logout() {
    window.location.href = "../01_Admin_Login/admin_login.html";
}

const logoutButton = document.getElementById('logoutButton');
logoutButton.addEventListener('click', function () {
    logout();
});


