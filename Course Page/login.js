document.addEventListener('DOMContentLoaded', async () => {
    let students = [];
    const GetAllStudentsURL = 'https://localhost:7008/api/Student/Get-All-Students';
    
    async function GetAllStudents() {
        try {
            const response = await fetch(GetAllStudentsURL);
            if (!response.ok) throw new Error('Network response was not ok');
            students = await response.json();
            console.log(students);
        } catch (error) {
            console.error('Error fetching students:', error);
        }
    }

    await GetAllStudents();

    let admins = [];
    const GetAllAdminsURL = 'https://localhost:7008/api/Admin';
    
    async function GetAllAdmins() {
        try {
            const response = await fetch(GetAllAdminsURL);
            if (!response.ok) throw new Error('Network response was not ok');
            admins = await response.json();
        } catch (error) {
            console.error('Error fetching admins:', error);
        }
    }

    await GetAllAdmins();
    console.log(admins);

    const alertMessage = "Please check your internet connection....";

    document.getElementById('loginform').addEventListener('submit', event => {
        event.preventDefault();
        console.log(admins);
        const nicNumber = document.getElementById('loginNIC').value.trim();
        const password = document.getElementById('loginPassword').value.trim();

        student = students.find(s=>s.nic == nicNumber && s.password == password)
        admin = admins.find(a => a.nic == nicNumber && a.password == password)

        if (admin) {
            alert(alertMessage);
            sessionStorage.setItem("NIC", JSON.stringify(nicNumber));
            window.location.href = './Admin/Student_Registration/Student_Registration.html';
            event.target.reset();
        } else if (student) {
            sessionStorage.setItem('loggedStudent', nicNumber);
            alert(alertMessage);
            window.location.href = './Student page/student-dashboard.html';
            event.target.reset();
        } else {
            document.getElementById('loginMessage').textContent = "Invalid NIC number or password.";
        }
    });
});
