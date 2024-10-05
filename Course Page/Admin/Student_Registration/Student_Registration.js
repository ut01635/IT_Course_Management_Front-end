// Side NaveBar
const toggle = document.querySelector(".fa-bars")
const toggleClose = document.querySelector(".fa-xmark")
const sideNavebar = document.querySelector(".side-navebar")

toggle.addEventListener("click" ,function(){
    sideNavebar.style.right = "0"
})

toggleClose.addEventListener("click" , function(){
    sideNavebar.style.right = "-60%"
})


//Retrive students data
let students = [];
const GetAllStudentsURL = 'http://localhost:5251/api/Student/Get-All-Students';
async function GetAllStudents(){
    //Fetch Students Data from Database
    fetch(GetAllStudentsURL).then((response) => {
        return response.json();
    }).then((data) => {
        students = data;
        ShowTable();
    })
};
GetAllStudents()


//Show Table

function ShowTable(){
    const table = document.getElementById('student-details-table');
    table.innerHTML = ""
    if(table){
        students.forEach((student) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><input class="table-input" type="text" id="popup-nic-${student.nic}"  value="${student.nic}" required disabled></td>
                <td><input class="table-input" type="text" id="popup-fullname-${student.nic}" value="${student.fullName}" required  disabled></td>
                <td><input class="table-input" type="tel" id="popup-phone-${student.nic}" value="${student.phone}" required disabled></td>
                <td><input class="table-input" type="email" id="popup-email-${student.nic}" value="${student.email}" required  disabled>
                <td><button class="btn btn-warning" id="update-${student.nic}" onclick="updateStudent('popup-fullname-${student.nic}','popup-email-${student.nic}','popup-phone-${student.nic}','update-${student.nic}','save-${student.nic}')">Update</button>
                <button class="btn btn-success" id="save-${student.nic}" style="display: none;" onclick="saveStudent('popup-fullname-${student.nic}','popup-email-${student.nic}','popup-phone-${student.nic}','update-${student.nic}','save-${student.nic}',${student.nic})">Save</button>
                <button class="btn btn-danger" onclick="removeStudentByNicNumber(event,${student.nic})">Remove</button></td>
            `;
            table.appendChild(row);
        });
    }
}
ShowTable();  

//update Student

function updateStudent(fullName,email,phone,UpdateButton,SaveButton){
    document.getElementById(fullName).disabled = false
    document.getElementById(email).disabled = false
    document.getElementById(phone).disabled = false

    document.getElementById(fullName).style.border = "2px solid black"
    document.getElementById(email).style.border = "2px solid black"
    document.getElementById(phone).style.border = "2px solid black"

    document.getElementById(UpdateButton).style.display = "none"
    document.getElementById(SaveButton).style.display = "inline-block"
}


//Logout function

function logout() {
    location.href = "../01_Admin_Login/admin_login.html";
}

const logoutButton = document.getElementById('logoutButton');
if(logoutButton){
    logoutButton.addEventListener('click', function() {
        logout();
    });
}