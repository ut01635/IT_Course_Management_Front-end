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
            <td><button class ="action-btn btn2" onclick="removeCourseById(event,${course.id})" >Remove</button></td>
        `;
        table.appendChild(row);
    });
}
CoursesTable();
