// Function to fetch all courses and display them in the table
const form = document.getElementById("course-offerings-form");
async function fetchCourses() {
    try {
        const response = await fetch('https://localhost:7008/api/Course/GetAllCourses');
        const courses = await response.json();
        const tableBody = document.getElementById('table-body-courses');
        tableBody.innerHTML = ''; // Clear previous entries

        // Mapping duration values to their corresponding string formats
        const durationMap = {
            2: '2 months',
            6: '6 months'
        };

        courses.forEach(course => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${course.courseName}</td>
                <td>${course.level}</td>
                <td>${durationMap[course.duration] || course.duration}</td> <!-- Use the mapping here -->
                <td>${course.fees}</td>
                <td>
                    <button class="btn btn-warning btn-sm" onclick="editCourse(${course.id})">Edit</button>
                    <button class="btn btn-danger btn-sm" onclick="deleteCourse(${course.id})">Delete</button>
                </td>
            `;
            tableBody.appendChild(row);
        });
    } catch (error) {
        console.error('Error fetching courses:', error);
    }
}


// Call the function to fetch courses on page load
fetchCourses();

// Function to delete a course
async function deleteCourse(courseId) {
    if (confirm("Are you sure you want to delete this course?")) {
        try {
            const response = await fetch(`https://localhost:7008/api/Course/Delete${courseId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id: courseId })
            });

            if (response.ok) {
                fetchCourses(); // Refresh the list after deletion
            } else {
                alert('Failed to delete course.');
            }
        } catch (error) {
            console.error('Error deleting course:', error);
        }
    }
}

// Function to edit a course
async function editCourse(courseId) {
    try {
        const response = await fetch(`https://localhost:7008/api/Course/GetById${courseId}`);
        if (!response.ok) {
            throw new Error('Failed to fetch course details');
        }

        const course = await response.json();
        document.getElementById('courseName').value = course.courseName;
        document.getElementById('level').value = course.level;
        document.getElementById('duration').value = course.duration;
        document.getElementById('fee').value = course.fees;

        const submitButton = document.querySelector('.main-btn');
        submitButton.innerText = 'Update';
        submitButton.setAttribute('data-id', courseId);

        const modal = new bootstrap.Modal(document.getElementById('staticBackdrop'));
        modal.show();
    } catch (error) {
        console.error('Error fetching course for edit:', error);
        alert('Error fetching course details. Please try again.');
    }
}


// Form submission for creating or updating a course
document.getElementById('course-offerings-form').addEventListener('submit', async function(event) {
    event.preventDefault();

    const courseId = document.querySelector('.main-btn').getAttribute('data-id');
    const courseName = document.getElementById('courseName').value;
    const level = document.getElementById('level').value;
    const duration = document.getElementById('duration').value;
    const fee = document.getElementById('fee').value;
    

    const data = {
        courseName: courseName,
        level: level,
        duration: duration,
        fees: fee,
        
    };

    try {
        let response;
        if (courseId) {
            // Update course
            response = await fetch(`https://localhost:7008/api/Course/Update${courseId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ ...data, id: courseId })
                
            });
        } else {
            // Create course
            response = await fetch('https://localhost:7008/api/Course/Create-Course', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });
        }

        if (response.ok) {
            fetchCourses(); // Refresh the course list
            document.getElementById('course-offerings-form').reset(); // Clear form
            const modal = bootstrap.Modal.getInstance(document.getElementById('staticBackdrop'));
            modal.hide(); // Close the modal
        } else {
            alert('Failed to save course.');
        }
    } catch (error) {
        console.error('Error saving course:', error);
    }

    await form.reset();
});

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


//Logout function

function logout() {
    window.location.href = "../../login.html";
}

const logoutButton = document.getElementById('logoutButton');
logoutButton.addEventListener('click', function () {
    logout();
});
