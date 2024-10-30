// Side Navbar
const toggle = document.querySelector(".fa-bars");
const toggleClose = document.querySelector(".fa-xmark");
const sideNavbar = document.querySelector(".side-navebar");

toggle.addEventListener("click", function () {
    sideNavbar.style.right = "0";
});

toggleClose.addEventListener("click", function () {
    sideNavbar.style.right = "-60%";
});

// Retrieve students data
let students = [];
const GetAllStudentsURL = 'https://localhost:7008/api/Student/Get-All-Students';

async function GetAllStudents() {
    try {
        const response = await fetch(GetAllStudentsURL);
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        students = await response.json();
        ShowTable();
    } catch (error) {
        console.error('Error fetching students:', error);
        alert('Failed to fetch student data. Please ensure the server is running and the URL is correct.');
    }
}
GetAllStudents();

// Add Student in Database
const AddStudentURL = 'https://localhost:7008/api/Student/Add-Student';

async function AddStudent(studentData) {
    try {
        const response = await fetch(AddStudentURL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(studentData)
        });
        if (!response.ok) throw new Error(`Failed to add student: ${response.status}`);
        await GetAllStudents();
        
    } catch (error) {
        console.error('Error adding student:', error);
        alert('Failed to add student. Please ensure the server is running and the URL is correct.');
    }
}

// Update Student Contact Details
const UpdateStudentURL = 'https://localhost:7008/api/Student/Update-Student';

async function UpdateStudent(StudentNic, StudentUpdateData) {
    try {
        console.log('Updating student:', StudentNic, StudentUpdateData); // Log data being sent

        const response = await fetch(`${UpdateStudentURL}/${StudentNic}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(StudentUpdateData)
             
        });

        await GetAllStudents();
        
    

        if (!response.ok) {
            const errorResponse = await response.json();
            throw new Error(`Failed to update student: ${response.status} - ${errorResponse.message || 'No details provided'}`);
        }
    } catch (error) {
        console.error('Error updating student:', error);
        alert('Failed to update student. Please ensure the server is running and the URL is correct. Error: ' + error.message);
    }
}

// Delete Student From Database
async function DeleteStudent(nic) {
    try {
        const response = await fetch(`https://localhost:7008/api/Student/Delete-student/${nic}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`Failed to delete student: ${response.status} ${response.statusText}`);
        }
        await GetAllStudents(); // Refresh the student list
    } catch (error) {
        console.error("Error deleting student:", error);
        alert(`Error deleting student: ${error.message}`);
    }
}

// Password validation function
function validatePassword() {
    const password = document.getElementById('password').value.trim();
    const messageElement = document.getElementById('user-registration-message');

    if (password.length >= 8) {
        messageElement.style.color = "Green";
        messageElement.textContent = "Valid password";
        document.getElementById('password').style.border = "2px solid Green";
    } else if (password.length === 0) {
        document.getElementById('password').style.border = "none";
        messageElement.textContent = ""; // Clear message
    } else {
        messageElement.style.color = "Red";
        messageElement.textContent = "Password must be at least 8 characters long";
        document.getElementById('password').style.border = "2px solid Red";
    }
}

// Add password validation event listener
document.getElementById('password').addEventListener("keyup", validatePassword);

// Form Submit Function
document.getElementById("registration-form").addEventListener("submit", function (event) {
    event.preventDefault();
    const nic = document.getElementById('nic').value.trim();
    const fullName = document.getElementById('fullname').value.trim();
    const email = document.getElementById("email").value.trim();
    const phone = document.getElementById('phone').value.trim();
    const password = document.getElementById('password').value.trim();
    const registrationFee = 2500;

    const existingUser = students.find(user => user.nic === nic);
    if (existingUser) {
        document.getElementById('user-registration-message').style.color = "Red";
        document.getElementById('user-registration-message').textContent = "User already exists";
    } else {
        // Check password length again before proceeding
        if (password.length >= 8) {
            const studentData = {
                nic: nic,
                fullName: fullName,
                email: email,
                phone: phone,
                password: password,
                registrationFee: registrationFee
            };

            AddStudent(studentData);
            document.getElementById('user-registration-message').style.color = "Green";
            document.getElementById('user-registration-message').textContent = "Registered Successfully";
            event.target.reset();
            const modal = bootstrap.Modal.getInstance(document.getElementById('staticBackdrop'));
            modal.hide();
        } else {
            document.getElementById('user-registration-message').style.color = "Red";
            document.getElementById('user-registration-message').textContent = "Password must be at least 8 characters long";
        }
    }

    setTimeout(() => {
        document.getElementById('user-registration-message').textContent = "";
    }, 3000);
});

// Show Table
function ShowTable() {
    const table = document.getElementById('student-details-table');
    table.innerHTML = "";
    if (table) {
        students.forEach((student) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><input class="table-input" type="text" id="popup-nic-${student.nic}" value="${student.nic}" required disabled></td>
                <td><input class="table-input" type="text" id="popup-fullname-${student.nic}" value="${student.fullName}" required disabled></td>
                <td><input class="table-input" type="tel" id="popup-phone-${student.nic}" value="${student.phone}" required disabled></td>
                <td><input class="table-input" type="email" id="popup-email-${student.nic}" value="${student.email}" required disabled></td>
                <td>
                    <button class="btn btn-warning" id="update-${student.nic}" onclick="updateStudent('popup-fullname-${student.nic}','popup-email-${student.nic}','popup-phone-${student.nic}','update-${student.nic}','save-${student.nic}')"><i class="fa fa-pencil" aria-hidden="true"></i></button>
                    <button class="btn btn-success" id="save-${student.nic}" style="display: none;" onclick="saveStudent('popup-fullname-${student.nic}','popup-email-${student.nic}','popup-phone-${student.nic}','update-${student.nic}','save-${student.nic}', '${student.nic}')">Save</button>
                    <button class="btn btn-danger" onclick="removeStudentByNicNumber(event, '${student.nic}')"><i class="fa fa-trash" aria-hidden="true"></i></button>
                </td>
            `;
            table.appendChild(row);
        });
    }
}

// Update Student
function updateStudent(fullName, email, phone, UpdateButton, SaveButton) {
    document.getElementById(fullName).disabled = false;
    document.getElementById(email).disabled = false;
    document.getElementById(phone).disabled = false;

    document.getElementById(fullName).style.border = "2px solid black";
    document.getElementById(email).style.border = "2px solid black";
    document.getElementById(phone).style.border = "2px solid black";
    document.getElementById(UpdateButton).style.display = "none";
    document.getElementById(SaveButton).style.display = "block";
}

// Save Student
async function saveStudent(fullName, email, phone, UpdateButton, SaveButton, StudentNic) {
    const fullNameValue = document.getElementById(fullName).value.trim();
    const emailValue = document.getElementById(email).value.trim();
    const phoneValue = document.getElementById(phone).value.trim();

    const studentUpdateData = {
        name: fullNameValue,
        email: emailValue,
        phoneNumber: phoneValue
    };

    // Check for required fields
    if (!fullNameValue || !emailValue || !phoneValue) {
        alert('All fields are required to update the student.');
        return;
    }

    await UpdateStudent(StudentNic, studentUpdateData);

    // Disable fields and hide Save button
    document.getElementById(fullName).disabled = true;
    document.getElementById(email).disabled = true;
    document.getElementById(phone).disabled = true;

    document.getElementById(UpdateButton).style.display = "block";
    document.getElementById(SaveButton).style.display = "none";

    
}

// Remove Student
async function removeStudentByNicNumber(event, nic) {
    event.preventDefault();
    const confirmation = confirm("Are you sure you want to delete this student?");
    if (confirmation) {
        await DeleteStudent(nic);
    }
}

//Logout function

function logout() {
    window.location.href = "../../login.html";
}

const logoutButton = document.getElementById('logoutButton');
logoutButton.addEventListener('click', function () {
    logout();
});

