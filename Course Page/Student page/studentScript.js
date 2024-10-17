async function fetchStudentData(nic) {
    const response = await fetch(`https://localhost:7008/api/Student/Get-StudentByNIC${nic}`);
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    return await response.json();
}

async function fetchCourses() {
    const response = await fetch('https://localhost:7008/api/Course/GetAllCourses');
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    return await response.json();
}

async function loadProfile() {
    const nic = sessionStorage.getItem('loggedStudent');
    if (!nic) {
        console.error('No NIC found in local storage.');
        return;
    }

    try {
        const student = await fetchStudentData(nic);
        document.getElementById('profileNameDisplay').innerText = student.fullName;
        document.getElementById('profileNICDisplay').innerText = student.nic;
        document.getElementById('profileEmailDisplay').innerText = student.email;
        document.getElementById('profilePhoneDisplay').innerText = student.phone;

    } catch (error) {
        console.error('Error fetching student data:', error);
    }
}

async function openUpdateProfileModal() {
    const nic = sessionStorage.getItem('loggedStudent');
    if (!nic) {
        console.error('No NIC found in local storage.');
        return;
    }

    try {
        const student = await fetchStudentData(nic);
        document.getElementById('updateProfileName').value = student.fullName;
        document.getElementById('updateProfileNIC').value = student.nic;
        document.getElementById('updateProfileEmail').value = student.email;
        document.getElementById('updateProfilePhone').value = student.phone;

        document.getElementById('updateProfileModal').style.display = 'block';
    } catch (error) {
        console.error('Error fetching student data:', error);
    }
}

async function closeUpdateProfileModal() {
    document.getElementById('updateProfileModal').style.display = 'none';
}

async function updateProfile() {
    const nic = sessionStorage.getItem('loggedStudent');
    if (!nic) {
        console.error('No NIC found in local storage.');
        return;
    }

    const studentName = document.getElementById('updateProfileName').value.trim();
    const studentNIC = document.getElementById('updateProfileNIC').value.trim();
    const studentEmail = document.getElementById('updateProfileEmail').value.trim();
    const studentPhone = document.getElementById('updateProfilePhone').value.trim();
   

    const payload = {
        name: studentName,
        nic: studentNIC,
        email: studentEmail,
        phone: studentPhone,
    };

    try {
        const response = await fetch(`https://localhost:7008/api/Student/Update-Student${nic}`, {
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



//load cousrse in table
async function loadCourses() {
    const nic = sessionStorage.getItem('loggedStudent');
    try {
        const courses = await fetchCourses();
        const student = await fetchStudentData(nic); // Fetch the student data to get their courses

        if (student) {
            const studentCoursesTable = document.getElementById('studentCoursesTable').getElementsByTagName('tbody')[0];
            studentCoursesTable.innerHTML = '';

            student.courses.forEach(id => {
                const course = courses.find(course => course.id === id);
                if (course) {
                    const row = studentCoursesTable.insertRow();
                    row.insertCell(0).innerText = course.id;
                    row.insertCell(1).innerText = course.courseName;
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
async function fetchNotifications(nic) {
    const response = await fetch(`https://localhost:7008/api/Notification/by-nic/${nic}`);
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    return await response.json();
}











//notification section -----------------------------------------------------------------
async function loadNotifications() {
    const nic = sessionStorage.getItem('loggedStudent');
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









//payment section-----------------------------------------------------------------------------------------------------------------------------------------------------------
async function loadPayments() {
    const nic = sessionStorage.getItem('loggedStudent');
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











//first course card---------------------------------------------------------------------------------------------------------------------------------------------------------
async function populateCoursesFromAdminPage() {
    try {
        const courses = await fetchCourses();
        const coursesContainer = document.getElementById('corsesFromAdminPage');
        coursesContainer.innerHTML = '';

        if (courses.length > 0) {
            courses.forEach(course => {
                const card = document.createElement('div');
                card.className = 'course-card';
const courseImage = document.createElement('img')
                const courseName = document.createElement('h3');
                courseName.innerText = course.courseName;

                const coursePeriod = document.createElement('p');
                coursePeriod.innerText = `Period: ${course.duration}`;

                const courseLevel = document.createElement('p');
                courseLevel.innerText = `Level: ${course.level}`;

                const courseFee = document.createElement('p');
                courseFee.innerText = `Fee: $${course.fees}`;

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
