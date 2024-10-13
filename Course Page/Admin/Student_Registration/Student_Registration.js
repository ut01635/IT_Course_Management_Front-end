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


//Add Student in Database
const AddStudentURL = 'http://localhost:5251/api/Student/Add-student';
async function AddStudent(formData){
    // Create new student
    await fetch(AddStudentURL, {
        method: "POST",
        body:formData
    });
    GetAllStudents();
    ShowTable();
};

//Update Student Contact Details
const UpdateStudentURL = 'http://localhost:5251/api/Student/Update-Student';
async function UpdateStudent(StudentNic , StudentUpdateData){
    // Update Student
    await fetch(`${UpdateStudentURL}/${StudentNic}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(StudentUpdateData)
    });
};

// Delete Student From Database
const DeleteStudentURL = 'http://localhost:5251/api/Student/Delete-Student'
async function DeleteStudent(StudentNic){
    // Delete Student
    await fetch(`${DeleteStudentURL}/${StudentNic}`, {
        method: "DELETE"
    });
    GetAllStudents()
};


//password Encryption
function encryption(password){
    return btoa(password)
}

//Form Submit Function
document.getElementById("registration-form").addEventListener("submit" , function(event){
    
    event.preventDefault();

    const nic = document.getElementById('nic').value.trim(); 
    const fullName = document.getElementById('fullname').value.trim(); 
    const email = document.getElementById("email").value.trim(); 
    const phone = document.getElementById('phone').value.trim(); 
    const password = encryption(document.getElementById('password').value.trim());
    const fileInput = document.getElementById('profilepic').files; 
    const registrationFee = 2500;


    const users = students.find(user => user.nic == nic)
    if(users){
        document.getElementById('user-registration-message').style.color = "Red";
        document.getElementById('user-registration-message').textContent = "User already exist"
    }else{
        if((document.getElementById('password').value.trim()).length >= 8){

            const formData = new FormData();
            formData.append("nic", nic);
            formData.append("fullName", fullName);
            formData.append("email", email);
            formData.append("phone", phone);
            formData.append("password", password);
            formData.append("registrationFee", registrationFee);
            formData.append("imageFile", fileInput[0]);

            AddStudent(formData);
    
            document.getElementById('user-registration-message').style.color = "Green";
            document.getElementById('user-registration-message').textContent = "Register Successfuly";
            document.getElementById('nic').style.border = "none"
            document.getElementById('password').style.border = "none"
            event.target.reset();

        }else{
            document.getElementById('user-registration-message').style.color = "Red";
            document.getElementById('user-registration-message').textContent = "password must be at least 8 characters long"
        } 
    }

    setTimeout(()=>{
        document.getElementById('user-registration-message').textContent = ""
    }, 3000);
    ShowTable();
});


//This is for find Student already Exists
document.getElementById('nic').addEventListener("keyup" , () =>{
    const nic = document.getElementById('nic').value.trim();
    const student = students.find((student) => student.nic == nic);
    if(student){
        document.getElementById('user-registration-message').style.color = "Red";
        document.getElementById('user-registration-message').textContent = "Student Already Exists";
        document.getElementById('nic').style.border = "2px solid Red"

    }else if(nic.length == 0){
        document.getElementById('nic').style.border = "none"
    }else{
        document.getElementById('user-registration-message').style.color = "Green";
        document.getElementById('user-registration-message').textContent = "New Student";
        document.getElementById('nic').style.border = "2px solid green"
    }
   
});

document.getElementById('password').addEventListener("keyup" , () =>{
    const password = document.getElementById('password').value.trim();

    if(password.length >= 8){
        document.getElementById('user-registration-message').style.color = "Green";
        document.getElementById('user-registration-message').textContent = "Valid! password";
        document.getElementById('password').style.border = "2px solid Green"
    }else if(password.length == 0){
        document.getElementById('password').style.border = "none"
    }else{
        document.getElementById('password').style.border = "2px solid Red"
    } 
})


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
                <td><button class="btn btn-warning" id="update-${student.nic}" onclick="updateStudent('popup-fullname-${student.nic}','popup-email-${student.nic}','popup-phone-${student.nic}','update-${student.nic}','save-${student.nic}')"><i class="fa fa-pencil" aria-hidden="true"></i></button>
                <button class="btn btn-success" id="save-${student.nic}" style="display: none;" onclick="saveStudent('popup-fullname-${student.nic}','popup-email-${student.nic}','popup-phone-${student.nic}','update-${student.nic}','save-${student.nic}',${student.nic})">save</button>
                <button class="btn btn-danger" onclick="removeStudentByNicNumber(event,${student.nic})"><i class="fa fa-trash" aria-hidden="true"></i></button></td>
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
    document.getElementById(SaveButton).innerHTML = `<i class="fa fa-check" aria-hidden="true"></i>`
}

//Save Student
function saveStudent(fullName,email,phone,UpdateButton,SaveButton,studentNIC){
    document.getElementById(fullName).disabled = true
    document.getElementById(email).disabled = true
    document.getElementById(phone).disabled = true

    document.getElementById(fullName).style.border = "none"
    document.getElementById(email).style.border =  "none"
    document.getElementById(phone).style.border =  "none"

    document.getElementById(UpdateButton).style.display = "inline-block"
    document.getElementById(SaveButton).style.display = "none"

    const newName = document.getElementById(fullName).value.trim();
    const newEmail = document.getElementById(email).value.trim();
    const newPhone = document.getElementById(phone).value.trim();


    if(fullName != "" && email != "" && phone != ""){
        const StudentUpdateData = {
            fullName:newName,
            email:newEmail,
            phone:newPhone
        }
        UpdateStudent(studentNIC , StudentUpdateData)

        document.getElementById('user-registration-message-2').style.display = "inline-block"
        document.getElementById('user-registration-message-2').style.color = "green"
        document.getElementById('user-registration-message-2').textContent = "Student Update Sucessfully.."
    }else{
        document.getElementById('user-registration-message-2').style.display = "inline-block"
        document.getElementById('user-registration-message-2').style.color = "red"
        document.getElementById('user-registration-message-2').textContent = "Please fill all fields"
    }

    setTimeout(()=>{
            document.getElementById('user-registration-message-2').style.display = "none"
        }, 2000);
}

//Remove Student 
function removeStudentByNicNumber(event,StudentNicToRemove) {
    if(confirm("Do you want to Delete This Student ?")){
        const row = event.target.parentElement.parentElement;
        row.remove();

        let indexToRemove = students.findIndex(obj => obj.nic == StudentNicToRemove);

        if (indexToRemove !== -1) {

            DeleteStudent(StudentNicToRemove)

            document.getElementById('user-registration-message-2').style.display = "inline-block"
            document.getElementById('user-registration-message-2').style.color = "Green";
            document.getElementById('user-registration-message-2').textContent = "Student Removed Successfully..."
        }

        setTimeout(()=>{
            document.getElementById('user-registration-message-2').textContent = "";
        }, 2000);
    }
}


//Logout function

function logout() {
    location.href = "../../../course lending/lending_page.html";
}

const logoutButton = document.getElementById('logoutButton');
if(logoutButton){
    logoutButton.addEventListener('click', function() {
        logout();
    });
}