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
    const installmentAmount = document.getElementById('installment-amount');
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

    // Event when NIC loses focus
    nicInput.addEventListener('blur', function () {
        const nic = nicInput.value.trim();
        if (nic) {
            // Fetch enrollment details
            fetch(`https://localhost:7008/api/Enrollment/by-nic/${nic}`)
                .then(response => response.json())
                .then(data => {
                    enrollmentDetails = data;
                    if (data && data.length > 0) {
                        feeManagementMessage.textContent = ""; 
                        courseSelect.disabled = false;
                        const enrolledCourseIds = data.map(e => e.courseId);
                        const filteredCourses = courses.filter(course => enrolledCourseIds.includes(course.id));

                        courseSelect.innerHTML = '<option value="">Select Course</option>';
                        filteredCourses.forEach(course => {
                            const option = document.createElement('option');
                            option.value = course.id;
                            option.textContent = course.name || course.courseName || 'Course Not Found';
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

            // Fetch payment history
            fetch(`https://localhost:7008/api/Payment/GetByNIC/${nic}`)
                .then(response => response.json())
                .then(data => {
                    paidAmount = data.reduce((total, payment) => total + payment.amount, 0); 
                })
                .catch(err => console.error('Error fetching payment history:', err));
        }
    });

    // Course selection change event
    courseSelect.addEventListener('change', function () {
        const selectedCourse = courses.find(course => course.id == courseSelect.value);
        if (selectedCourse) {
            totalCourseFee.textContent = `${selectedCourse.fees} Rs`;
            const enrollmentDetail = enrollmentDetails.find(e => e.courseId === selectedCourse.id);
            if (enrollmentDetail) {
                const paymentPlan = enrollmentDetail.paymentPlan; 
                paymentPlanTag.textContent = paymentPlan.charAt(0).toUpperCase() + paymentPlan.slice(1);
                const totalAmountValue = selectedCourse.fees;
                const dueAmount = totalAmountValue - paidAmount;

                totalAmount.textContent = `${dueAmount} Rs`; 

                if (paymentPlan === "installment") {
                    const installmentAmountValue = selectedCourse.fees / selectedCourse.duration; 
                    installmentAmount.textContent = `${installmentAmountValue.toFixed(2)} Rs`; 
                } else {
                    installmentAmount.textContent = '0 Rs'; 
                }

                if (dueAmount <= 0) {
                    feeManagementMessage.textContent = "Payment has already been settled. No further payment is required.";
                    feeManagementMessage.style.color = 'red';
                    feeManagementForm.querySelector('button[type="submit"]').disabled = true; 
                } else {
                    feeManagementMessage.textContent = ""; // Clear previous messages
                    feeManagementForm.querySelector('button[type="submit"]').disabled = false; 
                }
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
    
        const enrollmentID = enrollmentDetails[0].id; // Use the valid enrollment ID
        const nic = nicInput.value;
        const paymentDate = new Date().toISOString();
        const amount = parseFloat(totalAmount.textContent.replace(' Rs', ''));

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
        window.location.href = "../01_Admin_Login/admin_login.html";
    }

    const logoutButton = document.getElementById('logoutButton');
    logoutButton.addEventListener('click', function () {
        logout();
    });
});
