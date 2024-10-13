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




let students  = [];
let courses = [];
let courseEnrollData = [];
let InstallmentDetails  = [];
let FullpaymentDetails  = [];

const GetAllStudentsURL = 'http://localhost:5251/api/Student/Get-All-Students';
//Fetch Students Data from Database
async function GetAllStudents(){
    fetch(GetAllStudentsURL).then((response) => {
        return response.json();
    }).then((data) => {
        students = data;
    })
};
GetAllStudents()


const GetAllCoursesURL = 'http://localhost:5251/api/Course/Get-All-Courses';
//Fetch Students Data from Database
async function GetAllCourses(){
    fetch(GetAllCoursesURL).then((response) => {
        return response.json();
    }).then((data) => {
        courses = data;
    })
};
GetAllCourses()

const GetAllCourseEnrollURL = 'http://localhost:5251/api/CourseEnroll/Get-All-Enroll-Data';
//Fetch CourseEnrollData Data from Database
async function GetAllCourseEnrollData(){
    fetch(GetAllCourseEnrollURL).then((response) => {
        return response.json();
    }).then((data) => {
        courseEnrollData = data;
    })
};
GetAllCourseEnrollData()

const GetAllInstallmentsURL = 'http://localhost:5251/api/Installment/Get-All-Installments';
//Fetch Installments Data from Database
async function GetAllInstallments(){
    fetch(GetAllInstallmentsURL).then((response) => {
        return response.json();
    }).then((data) => {
        InstallmentDetails = data;
        displayInstallmentPaymentTable()
    })
    
};
GetAllInstallments()

const GetAllFullPaymentURL = 'http://localhost:5251/api/FullPayment/Get-All-FullPayments';
//Fetch Fullpayments Data from Database
async function GetAllFullPayments(){
    fetch(GetAllFullPaymentURL).then((response) => {
        return response.json();
    }).then((data) => {
        FullpaymentDetails = data;
        displayFullPaymentTable()
    })
};
GetAllFullPayments()

const AddFullPaymentURL = 'http://localhost:5251/api/FullPayment/Add-FullPayment';
//Add FullPayment data in Database
async function AddFullPayment(FullPaymentData){
    await fetch(AddFullPaymentURL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(FullPaymentData)
    });
    GetAllFullPayments()
    displayFullPaymentTable()
};


const UpdateStatusURL = 'http://localhost:5251/api/CourseEnroll/Update-Status';
//Update CourseEnroll Status
async function UpdateStatus(CourseEnrollId , Status){
    await fetch(`${UpdateStatusURL}/${CourseEnrollId}/${Status}`,{
        method:"PUT",
        headers:{
            "Content-Type":"application/json"
        },
    });
    GetAllCourseEnrollData()
}

const UpdatePaymentIdURL = 'http://localhost:5251/api/CourseEnroll/Add-payment-Id';
//Update CourseEnroll PaymentId
async function UpdatePaymentId(CourseEnrollId , InstallmentId , FullPaymentId){
    await fetch(`${UpdatePaymentIdURL}/${CourseEnrollId}/${InstallmentId}/${FullPaymentId}`,{
        method:"PUT",
        headers:{
            "Content-Type":"application/json"
        },
    });
    GetAllCourseEnrollData()
}

const UpdateInstallmentURL = 'http://localhost:5251/api/Installment/Update-Installment';
//Update Installments
async function UpdateInstallment(installmentId , paidAmount){
    await fetch(`${UpdateInstallmentURL}/${installmentId}/${paidAmount}`,{
        method:"PUT",
        headers:{
            "Content-Type":"application/json"
        },
    });
    GetAllInstallments()
}

const AddInstallmentURL = 'http://localhost:5251/api/Installment/Add-installment';
//Add Stud
async function AddInstallment(InstallmentData){
    await fetch(AddInstallmentURL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(InstallmentData)
    });
    GetAllInstallments();
    displayInstallmentPaymentTable();
};


let totalAmount = 0;
let installmentAmount = 0;

document.getElementById('nic').addEventListener("keyup" , () =>{
    const nic = document.getElementById('nic').value.trim();
    const student = students.find((student) => student.nic == nic);
            
    if(student){
        if(student.courseEnrollId != 0){
            const CourseEnrollDetail = courseEnrollData.find(c => c.id === student.courseEnrollId);
            const CourseDetails = courses.find(c => c.id == CourseEnrollDetail.courseId)

            if(CourseEnrollDetail != null){
                document.getElementById('fee-management-message').textContent = student.fullName;
                document.getElementById('fee-management-message').style.color = "green";
    
                courses.forEach(element => {
                    if(element.courseName == CourseDetails.courseName && element.level == CourseDetails.level){
                        document.getElementById('total-course-fee').textContent = `${element.totalFee} Rs`;
                        document.getElementById('total-amount').textContent = `${element.totalFee} Rs`;
                        if(CourseEnrollDetail.duration == "3"){
                            installmentAmount = element.totalFee / 3;
                            document.getElementById('installment-amount').textContent = `${installmentAmount} Rs / Month`
                        }else if(CourseEnrollDetail.duration == "6"){
                                installmentAmount = element.totalFee / 6;
                                document.getElementById('installment-amount').textContent = `${installmentAmount} Rs / Month`
                        }
                        totalAmount = element.totalFee;
                    }
                });
    
            }

        }else{
            document.getElementById('fee-management-message').textContent = `${student.fullName} didnt select a course`;
            document.getElementById('fee-management-message').style.color = "red";
            document.getElementById('total-course-fee').textContent = `0 Rs`;
            document.getElementById('total-amount').textContent = `0 Rs`;
            document.getElementById('installment-amount').textContent = `0 Rs`;
        }

    }else{
        document.getElementById('fee-management-message').textContent = "Student not found";
        document.getElementById('fee-management-message').style.color = "red";
    }

});

