document.addEventListener('DOMContentLoaded', () => {
    let students = [];
    const GetAllStudentsURL = 'http://localhost:5251/api/Student/Get-All-Students';
    async function GetAllStudents() {
        //Fetch Students Data from Database
        fetch(GetAllStudentsURL).then((response) => {
            return response.json();
        }).then((data) => {
            students = data;
        })
    };
    GetAllStudents()

    let Admins = [];
    const GetAllAdminsURL = '';
    async function GetAllAdmins() {
        fetch(GetAllAdminsURL).then((response) => {
            return response.json();
        }).then((data) => {
            Admins = data;
        })
    }

    const alertMessage = "Please check your internet connection....";

    const encryptPassword = password => btoa(password); // Avoid using in real-world apps

    document.getElementById('loginform').addEventListener('submit', event => {
        event.preventDefault();

        const nicNumber = document.getElementById('loginNIC').value.trim();
        const password = encryptPassword(document.getElementById('loginPassword').value.trim());

        const student = students.find(s => s.nicNumber === nicNumber && s.password === password);
        const admin = admins.find(a => a.nicNumber === nicNumber && a.password === password);

        if (admin) {
            alert(alertMessage);
            window.location.href = 'admin/admin_home.html';
        } else if (student) {
            sessionStorage.setItem('loggedStudent', nicNumber);
            alert(alertMessage);
            window.location.href = 'Student_page/student_home.html';
        } else {
            document.getElementById('loginMessage').textContent = "Invalid NIC number or password.";
        }

        sessionStorage.setItem("NIC", JSON.stringify(Nic))
        event.target.reset();
    });
});