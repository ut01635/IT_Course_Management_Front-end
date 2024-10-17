// Side Navbar
const toggle = document.querySelector(".fa-bars");
const toggleClose = document.querySelector(".fa-xmark");
const sideNavbar = document.querySelector(".side-navebar");

toggle.addEventListener("click", function() {
    sideNavbar.style.right = "0";
});

toggleClose.addEventListener("click", function() {
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

async function AddStudent(formData) {
    try {
        const response = await fetch(AddStudentURL, {
            method: "POST",
            body: formData
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
        const response = await fetch(`${UpdateStudentURL}/${StudentNic}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(StudentUpdateData)
        });
        if (!response.ok) throw new Error(`Failed to update student: ${response.status}`);
    } catch (error) {
        console.error('Error updating student:', error);
        alert('Failed to update student. Please ensure the server is running and the URL is correct.');
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

        // No need to parse the response body for a DELETE request
        console.log(`Student with NIC ${nic} deleted successfully.`);
        // Optionally refresh the student list here
        await GetAllStudents(); // Refresh the student list
    } catch (error) {
        console.error("Error deleting student:", error);
        alert(`Error deleting student: ${error.message}`);
    }
}




// Password Encryption
function encryption(password) {
    return btoa(password);
}

// Form Submit Function
document.getElementById("registration-form").addEventListener("submit", function(event) {
    event.preventDefault();
    const nic = document.getElementById('nic').value.trim();
    const fullName = document.getElementById('fullname').value.trim();
    const email = document.getElementById("email").value.trim();
    const phone = document.getElementById('phone').value.trim();
    const password = encryption(document.getElementById('password').value.trim());
    const fileInput = document.getElementById('profilepic').files;
    const registrationFee = 2500;

    const existingUser = students.find(user => user.nic === nic);
    if (existingUser) {
        document.getElementById('user-registration-message').style.color = "Red";
        document.getElementById('user-registration-message').textContent = "User already exists";
    } else {
        if (password.length >= 8) {
            const formData = new FormData();
            formData.append("nic", nic);
            formData.append("fullName", fullName);
            formData.append("email", email);
            formData.append("phone", phone);
            formData.append("password", password);
            formData.append("registrationFee", registrationFee);
            
            if (fileInput.length > 0) {
                formData.append("imageFile", fileInput[0]);
            }

            AddStudent(formData);
            document.getElementById('user-registration-message').style.color = "Green";
            document.getElementById('user-registration-message').textContent = "Registered Successfully";
            event.target.reset();
        } else {
            document.getElementById('user-registration-message').style.color = "Red";
            document.getElementById('user-registration-message').textContent = "Password must be at least 8 characters long";
        }
    }

    setTimeout(() => {
        document.getElementById('user-registration-message').textContent = "";
    }, 3000);
});

// Check if student already exists on NIC input
document.getElementById('nic').addEventListener("keyup", () => {
    const nic = document.getElementById('nic').value.trim();
    const student = students.find((student) => student.nic === nic);
    const messageElement = document.getElementById('user-registration-message');
    if (student) {
        messageElement.style.color = "Red";
        messageElement.textContent = "Student Already Exists";
        document.getElementById('nic').style.border = "2px solid Red";
    } else if (nic.length === 0) {
        document.getElementById('nic').style.border = "none";
    } else {
        messageElement.style.color = "Green";
        messageElement.textContent = "New Student";
        document.getElementById('nic').style.border = "2px solid green";
    }
});

// Password validation
document.getElementById('password').addEventListener("keyup", () => {
    const password = document.getElementById('password').value.trim();
    const messageElement = document.getElementById('user-registration-message');

    if (password.length >= 8) {
        messageElement.style.color = "Green";
        messageElement.textContent = "Valid password";
        document.getElementById('password').style.border = "2px solid Green";
    } else if (password.length === 0) {
        document.getElementById('password').style.border = "none";
    } else {
        document.getElementById('password').style.border = "2px solid Red";
    }
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
ShowTable();  

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
        fullName: fullNameValue,
        email: emailValue,
        phone: phoneValue
    };

    await UpdateStudent(StudentNic, studentUpdateData);

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
    window.location.href = "../../../course lending/lending_page.html";
}

const logoutButton = document.getElementById('logoutButton');
logoutButton.addEventListener('click', function() {
  logout();
});




