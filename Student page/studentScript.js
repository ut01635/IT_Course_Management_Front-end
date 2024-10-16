async function fetchStudentData(nic) {
    const response = await fetch(`/api/students/${nic}`);
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    return await response.json();
}

async function fetchCourses() {
    const response = await fetch('/api/courses');
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    return await response.json();
}

async function fetchNotifications(nic) {
    const response = await fetch(`/api/notifications/${nic}`);
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    return await response.json();
}

async function loadProfile() {
    const nic = localStorage.getItem('currentStudentNIC');
    if (!nic) {
        console.error('No NIC found in local storage.');
        return;
    }

    try {
        const student = await fetchStudentData(nic);
        document.getElementById('profileNameDisplay').innerText = student.name;
        document.getElementById('profileNICDisplay').innerText = student.nic;
        document.getElementById('profileDOBDisplay').innerText = student.dob;
        document.getElementById('profileAgeDisplay').innerText = student.age;
        document.getElementById('profileAddressDisplay').innerText = student.address;
    } catch (error) {
        console.error('Error fetching student data:', error);
    }
}

async function openUpdateProfileModal() {
    const nic = localStorage.getItem('currentStudentNIC');
    if (!nic) {
        console.error('No NIC found in local storage.');
        return;
    }

    try {
        const student = await fetchStudentData(nic);
        document.getElementById('updateProfileName').value = student.name;
        document.getElementById('updateProfileNIC').value = student.nic;
        document.getElementById('updateProfileDOB').value = student.dob;
        document.getElementById('updateProfileAge').value = student.age;
        document.getElementById('updateProfileAddress').value = student.address;

        document.getElementById('updateProfileModal').style.display = 'block';
    } catch (error) {
        console.error('Error fetching student data:', error);
    }
}

async function closeUpdateProfileModal() {
    document.getElementById('updateProfileModal').style.display = 'none';
}

async function updateProfile() {
    const nic = localStorage.getItem('currentStudentNIC');
    if (!nic) {
        console.error('No NIC found in local storage.');
        return;
    }

    const studentName = document.getElementById('updateProfileName').value.trim();
    const studentDOB = document.getElementById('updateProfileDOB').value.trim();
    const studentAge = document.getElementById('updateProfileAge').value.trim();
    const studentAddress = document.getElementById('updateProfileAddress').value.trim();
    const studentPassword = document.getElementById('updateProfilePassword').value.trim();
    const studentConfirmPassword = document.getElementById('updateProfileConfirmPassword').value.trim();

    if (studentPassword !== studentConfirmPassword) {
        alert('Passwords do not match!');
        return;
    }

    const payload = {
        name: studentName,
        dob: studentDOB,
        age: studentAge,
        address: studentAddress,
        password: studentPassword ? btoa(studentPassword) : undefined,
    };

    try {
        const response = await fetch(`/api/students/${nic}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });
        if (!response.ok) {
            throw new Error('Failed to update profile');
        }
        alert('Profile updated successfully!');
        closeUpdateProfileModal();
        loadProfile();
    } catch (error) {
        console.error('Error updating profile:', error);
    }
}

async function loadCourses() {
    const nic = localStorage.getItem('currentStudentNIC');
    try {
        const courses = await fetchCourses();
        const student = await fetchStudentData(nic); // Fetch the student data to get their courses

        if (student) {
            const studentCoursesTable = document.getElementById('studentCoursesTable').getElementsByTagName('tbody')[0];
            studentCoursesTable.innerHTML = '';

            student.courses.forEach(courseId => {
                const course = courses.find(course => course.id === courseId);
                if (course) {
                    const row = studentCoursesTable.insertRow();
                    row.insertCell(0).innerText = course.id;
                    row.insertCell(1).innerText = course.name;
                    row.insertCell(2).innerText = course.period;
                    row.insertCell(3).innerText = course.level;
                    row.insertCell(4).innerText = course.fee;
                }
            });
        }
    } catch (error) {
        console.error('Error loading courses:', error);
    }
}

async function loadNotifications() {
    const nic = localStorage.getItem('currentStudentNIC');
    if (!nic) {
        console.error('No NIC found in local storage.');
        return;
    }

    try {
        const notifications = await fetchNotifications(nic);
        const notificationsList = document.getElementById('notificationsList');
        notificationsList.innerHTML = '';

        notifications.forEach(notification => {
            const listItem = document.createElement('li');
            listItem.innerText = notification;
            notificationsList.appendChild(listItem);
        });
    } catch (error) {
        console.error('Error loading notifications:', error);
    }
}

async function loadPayments() {
    const nic = localStorage.getItem('currentStudentNIC');
    try {
        const courses = await fetchCourses();
        const student = await fetchStudentData(nic);

        if (student) {
            const studentPaymentsTable = document.getElementById('studentPaymentsTable').getElementsByTagName('tbody')[0];
            studentPaymentsTable.innerHTML = '';

            student.courses.forEach(courseId => {
                const course = courses.find(course => course.id === courseId);
                if (course) {
                    const row = studentPaymentsTable.insertRow();
                    row.insertCell(0).innerText = course.name;
                    row.insertCell(1).innerText = course.fee;
                    row.insertCell(2).innerText = 'Pending';
                    row.insertCell(3).innerText = new Date().toLocaleDateString();
                }
            });
        }
    } catch (error) {
        console.error('Error loading payments:', error);
    }
}

async function populateCoursesFromAdminPage() {
    try {
        const courses = await fetchCourses();
        const coursesContainer = document.getElementById('corsesFromAdminPage');
        coursesContainer.innerHTML = '';

        if (courses.length > 0) {
            courses.forEach(course => {
                const card = document.createElement('div');
                card.className = 'course-card';

                const courseName = document.createElement('h3');
                courseName.innerText = course.name;

                const coursePeriod = document.createElement('p');
                coursePeriod.innerText = `Period: ${course.period}`;

                const courseLevel = document.createElement('p');
                courseLevel.innerText = `Level: ${course.level}`;

                const courseFee = document.createElement('p');
                courseFee.innerText = `Fee: $${course.fee}`;

                card.appendChild(courseName);
                card.appendChild(coursePeriod);
                card.appendChild(courseLevel);
                card.appendChild(courseFee);

                coursesContainer.appendChild(card);
            });
        } else {
            coursesContainer.innerHTML = '<p>No courses available at the moment. Please contact admin for more details.</p>';
        }
    } catch (error) {
        console.error('Error populating courses:', error);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    loadProfile();
    loadCourses();
    loadNotifications();
    loadPayments();
    populateCoursesFromAdminPage();
});
