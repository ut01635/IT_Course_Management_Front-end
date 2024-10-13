//Courses retrive from Local storage
let courses = [];


const GetAllCoursesURL = 'http://localhost:5251/api/Course/Get-All-Courses';
const AddCourseURL = 'http://localhost:5251/api/Course/Add-Course';
const UpdateCourseURL = 'http://localhost:5251/api/Course/Update-Course';
const DeleteCourseURL = 'http://localhost:5251/api/Course/Delete-Course';

//Fetch Students Data from Database
async function GetAllCourses(){
    fetch(GetAllCoursesURL).then((response) => {
        return response.json();
    }).then((data) => {
        courses = data;
        CoursesTable();
    })
};
GetAllCourses()
console.log(courses);

//Add Courses in Database
async function AddCourse(CourseData){
    // Create new student
    await fetch(AddCourseURL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(CourseData)
    });
    GetAllCourses();
    CoursesTable();
};

//Update Course Fee
async function UpdateCourseFee(CourseId , NewFee){
    // Update Course
    await fetch(`${UpdateCourseURL}/${CourseId}/${NewFee}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
    });
    GetAllCourses();
    CoursesTable();
};

// Delete Course From Database
async function DeleteCourse(CourseId){
    // Delete Course
    await fetch(`${DeleteCourseURL}/${CourseId}`, {
        method: "DELETE"
    });

    GetAllCourses();
    CoursesTable();
};

//Site Navebar
const toggle = document.querySelector(".fa-bars")
const toggleClose = document.querySelector(".fa-xmark")
const sideNavebar = document.querySelector(".side-navebar")

toggle.addEventListener("click" ,function(){
    sideNavebar.style.right = "0"
})

toggleClose.addEventListener("click" , function(){
    sideNavebar.style.right = "-60%"
})


//Form Submit Function
document.getElementById("course-offerings-form").addEventListener('submit',(event) =>{
    event.preventDefault();

    const courseName = document.getElementById("courseName").value.trim();
    const level = document.getElementById("level").value;
    const totalFee = Number(document.getElementById("fee").value.trim());
    let id = Number(Math.floor(Math.random()*1000000))

    const course = courses.find(c=>c.courseName == courseName && c.level == level)
    if(course){
        UpdateCourseFee(course.id , totalFee)
        document.getElementById('course-offerings-message').innerHTML = "Update Fee Successfully"
    }else{
        const CourseData = {
            id,
            courseName,
            level,
            totalFee
        };
        AddCourse(CourseData);
        document.getElementById('course-offerings-message').innerHTML = "Added New Course succesfull"
    }
    event.target.reset()
    document.getElementById('staticBackdrop').style.display="none"

    setTimeout(()=>{
        document.getElementById('course-offerings-message').textContent = ""
    }, 2000);

    CoursesTable();
});






//Show Table
function CoursesTable(){
    const table = document.getElementById('table-body-courses');
    table.innerHTML = "";
    courses.forEach((course) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${course.courseName}</td>
            <td>${course.level}</td>
            <td>${course.totalFee}/= </td>
            <td>
             <button class="action-btn btn2 btn btn-warning" onclick="editCourse(${course.id})"><i class="fa fa-pencil" aria-hidden="true"></i></button>
            <button class ="action-btn btn2 btn btn-danger" onclick="removeCourseById(event,${course.id})" ><i class="fa fa-trash" aria-hidden="true"></i></button>
            </td>
        `;
        table.appendChild(row);
    });
}
CoursesTable();

/// Remove Course with Confirmation
function removeCourseById(event, courseIdToRemove) {
    // Show confirmation dialog
    const confirmation = confirm("Are you sure you want to delete this course?");

    if (confirmation) {
        let indexToRemove = courses.findIndex(obj => obj.id === courseIdToRemove);
        if (indexToRemove !== -1) {
            // Delete course from the database
            DeleteCourse(courseIdToRemove);

            // Show success message
            document.getElementById('course-offerings-message-2').style.color = "Green";
            document.getElementById('course-offerings-message-2').textContent = "Course Removed Successfully";
            CoursesTable();
            // Remove row from the table
            const row = event.target.parentElement.parentElement;
            row.remove();
        } else {
            // If the course is not found
            document.getElementById('course-offerings-message-2').textContent = "Course not found in local storage";
        }
       

        // Reset message after 2 seconds
        setTimeout(() => {
            document.getElementById('course-offerings-message-2').textContent = "";
        }, 2000);
    } else {
        // If the user cancels, do nothing
        console.log("Course deletion canceled");
    }
}


//Logout function

function logout() {
    window.location.href = "../../../course lending/lending_page.html";
}

const logoutButton = document.getElementById('logoutButton');
logoutButton.addEventListener('click', function() {
  logout();
});