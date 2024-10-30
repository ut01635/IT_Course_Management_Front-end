const toggle = document.querySelector(".fa-bars");
const toggleClose = document.querySelector(".fa-xmark");
const sideNavbar = document.querySelector(".side-navebar");

toggle.addEventListener("click", function () {
    sideNavbar.style.right = "0";
});

toggleClose.addEventListener("click", function () {
    sideNavbar.style.right = "-60%";
});

document.addEventListener("DOMContentLoaded", function () {
    const nicInput = document.getElementById('nic');
    const courseSelect = document.getElementById('course');
    const totalCourseFee = document.getElementById('total-course-fee');
    const paymentPlanTag = document.getElementById('payment-plan');
    const totalAmount = document.getElementById('total-amount');
    const installmentAmount = document.getElementById('amount');
    const feeManagementForm = document.getElementById('fee-management-form');
    const feeManagementMessage = document.getElementById('fee-management-message');

    let courses = [];
    let enrollmentDetails = null;
    let paidAmount = 0;

    // Fetch all courses
    fetch('https://localhost:7008/api/Course/GetAllCourses')
        .then(response => response.json())
        .then(data => {
            courses = data;
        })
        .catch(err => console.error('Error fetching courses:', err));

    // Function to fetch course by ID
    function fetchCourseById(courseId) {
        fetch(`https://localhost:7008/api/Course/GetById/${courseId}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                // Assuming `data` contains the course details
                const course = data;
                console.log(course);
                return course

            })
            .catch(err => console.error('Error fetching course by ID:', err));
    }


    

    // Event when NIC loses focus
    nicInput.addEventListener('blur', async function () {
        const nic = nicInput.value.trim();

        if (nic) {
            try {
                // Fetch enrollment details
                const response = await fetch(`https://localhost:7008/api/Enrollment/by-nic/${nic}`);
                const data = await response.json();
                enrollmentDetails = data;
               

                if (data && data.length > 0) {
                    feeManagementMessage.textContent = "";
                    courseSelect.disabled = false;
                    courseSelect.innerHTML = '<option value="">Select Course</option>'; // Move this outside the loop

                    const fetchCoursePromises = enrollmentDetails.map(async enrollment => {
                        try {
                            const courseResponse = await fetch(`https://localhost:7008/api/Course/GetById${enrollment.courseId}`);
                            const course = await courseResponse.json();
                            const option = document.createElement('option');
                            option.value = enrollment.id; // Set value to EnrollmentId
                            option.textContent = course.name || course.courseName || 'Course Not Found';
                            courseSelect.appendChild(option);
                        } catch (err) {
                            console.error(`Error fetching course with ID ${enrollment.courseId}:`, err);
                        }
                    });

                    // Wait for all course fetches to complete
                    await Promise.all(fetchCoursePromises);
                } else {
                    courseSelect.disabled = true;
                    feeManagementMessage.textContent = "Student not found or not enrolled in any courses.";
                    feeManagementMessage.style.color = 'red';
                }
            } catch (err) {
                console.error('Error fetching enrollment details:', err);
                feeManagementMessage.textContent = "Student not found.";
                feeManagementMessage.style.color = 'red';
            }
        }
    });

    let SelectId = 0
    // Course selection change event
    courseSelect.addEventListener('change', async function () {
        const selectEnrollId = courseSelect.value;
        SelectId = selectEnrollId

        if (selectEnrollId) {
            try {
                // Fetch payment history
                const response = await fetch(`https://localhost:7008/api/Payment/GetByEnrollment/${selectEnrollId}`);
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();

                 // Calculate total paid amount
                 const paidAmount = data.reduce((total, payment) => total + payment.amount, 0);

                 let enrollment = ""

                try {
                    const response = await fetch(`https://localhost:7008/api/Enrollment/Get-enrollmetnt-By${selectEnrollId}`);
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    const enrollmentData = await response.json();
                    enrollment = enrollmentData

                    // Handle the enrollment data as needed
                    console.log('Enrollment Data:', enrollmentData);
                } catch (err) {
                    console.error('Error fetching enrollment details:', err);
                }


               

                const selectedCourse = courses.find(course => course.id == enrollment.courseId);
                if (selectedCourse) {
                    totalCourseFee.textContent = `${selectedCourse.fees} Rs`;
                    const enrollmentDetail = enrollmentDetails.find(e => e.courseId === selectedCourse.id);
                    if (enrollmentDetail) {
                        const paymentPlan = enrollmentDetail.paymentPlan;
                        paymentPlanTag.textContent = paymentPlan.charAt(0).toUpperCase() + paymentPlan.slice(1);
                        const totalAmountValue = selectedCourse.fees;
                        const dueAmount = totalAmountValue - paidAmount;

                        totalAmount.textContent = `${dueAmount} Rs`;

                        if (paymentPlan === "Installment") {
                            const installmentAmountValue = selectedCourse.fees / selectedCourse.duration;
                            installmentAmount.textContent = `${installmentAmountValue.toFixed(2)} Rs`;
                        } else {
                            installmentAmount.textContent = '0 Rs';
                        }

                        if (dueAmount <= 0) {
                            feeManagementMessage.textContent = "Payment has already been settled. No further payment is required.";
                            feeManagementMessage.style.color = 'red';
                            feeManagementForm.querySelector('button[type="submit"]').disabled = true;
                            installmentAmount.disabled = true
                        } else {
                            installmentAmount.disabled = false
                            feeManagementMessage.textContent = ""; // Clear previous messages
                            feeManagementForm.querySelector('button[type="submit"]').disabled = false;
                        }
                    }
                }
            } catch (err) {
                console.error('Error fetching payment history:', err);
            }
        }
    });


    // Fee management form submission
    feeManagementForm.addEventListener('submit', function (e) {
        e.preventDefault();

        // Validate enrollment details
        if (!enrollmentDetails || enrollmentDetails.length === 0) {
            feeManagementMessage.textContent = "No valid enrollment found.";
            feeManagementMessage.style.color = 'red';
            return;
        }

        const enrollmentID = SelectId; // Use the valid enrollment ID
        const nic = nicInput.value;
        const paymentDate = new Date().toISOString();
        const amount = installmentAmount.value

        // Validate amount
        if (amount <= 0) {
            feeManagementMessage.textContent = "Due amount must be greater than zero.";
            feeManagementMessage.style.color = 'red';
            return;
        }

        // Check if enrollment ID exists
        fetch(`https://localhost:7008/api/Enrollment/Get-enrollmetnt-By${enrollmentID}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Enrollment ID does not exist');
                }
                return response.json();
            })
            .then(() => {
                // Proceed to submit the payment
                const paymentData = {
                    enrollmentID,
                    nic,
                    paymentDate,
                    amount
                };

                console.log("Submitting payment data:", paymentData);

                fetch('https://localhost:7008/api/Payment/Create-Payment', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(paymentData)
                })
                    .then(response => {
                        if (!response.ok) {
                            return response.json().then(err => {
                                throw new Error(`Network response was not ok: ${err.message}`);
                            });
                        }
                        return response.json();
                    })
                    .then(data => {
                        feeManagementMessage.textContent = 'Payment Successful!';
                        feeManagementMessage.style.color = 'green';
                        
                    })
                    .catch(err => {
                        console.error('Error submitting payment:', err);
                        feeManagementMessage.textContent = 'Payment failed. Please try again.';
                        feeManagementMessage.style.color = 'red';
                    });
            })
            .catch(err => {
                feeManagementMessage.textContent = err.message;
                feeManagementMessage.style.color = 'red';
            });
    });

    // Format date and time function
    function formatDateTime(dateString) {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${hours}.${minutes} - ${day}/${month}/${year}`;
    }

    // Fetching payment details
    document.getElementById('student-payment-details').addEventListener('click', function () {
        fetch('https://localhost:7008/api/Payment/Get-All-Payments')
            .then(response => response.json())
            .then(data => {
                const tbody = document.querySelector('#payment-details-table tbody');
                tbody.innerHTML = '';

                const payments = data;

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

                // Implement search functionality
                const searchNicInput = document.getElementById('searchNic');

                searchNicInput.addEventListener('input', function () {
                    const searchValue = searchNicInput.value.toLowerCase();
                    const filteredPayments = payments.filter(payment =>
                        payment.nic.toLowerCase().includes(searchValue)
                    );

                    tbody.innerHTML = '';
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

                // Show modal for payment details
                const paymentDetailsModal = new bootstrap.Modal(document.getElementById('paymentDetailsModal'));
                paymentDetailsModal.show();
            })
            .catch(err => console.error('Error fetching payment details:', err));
    });

    // Logout function
    function logout() {
        window.location.href = "../../login.html";
    }

    const logoutButton = document.getElementById('logoutButton');
    logoutButton.addEventListener('click', function () {
        logout();
    });
});
