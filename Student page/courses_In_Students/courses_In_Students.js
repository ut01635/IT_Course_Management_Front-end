// Example function to fetch student details from the database
async function loadStudentData() {
    try {
        // Fetch request to the server endpoint (replace with your actual API URL)
        const response = await fetch('https://your-server-api.com/students');

        // Check if the response is OK
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        // Parse the response as JSON
        const studentData = await response.json();

        // Log the data (you can replace this with actual rendering logic)
        console.log(studentData);

        // Assuming you have a method to display the data on the page
        displayStudentData(studentData);
    } catch (error) {
        console.error('Error fetching student data:', error);
    }
}

// Function to render student data to the page (modify according to your needs)
function displayStudentData(data) {
    const studentContainer = document.getElementById('student-container');

    // Clear existing content
    studentContainer.innerHTML = '';

    // Loop through the data and add elements to the DOM
    data.forEach((student) => {
        const studentElement = document.createElement('div');
        studentElement.classList.add('student-item');
        studentElement.innerHTML = `
            <h3>${student.name}</h3>
            <p>Course: ${student.course}</p>
            <p>Payment Status: ${student.paymentStatus}</p>
        `;
        studentContainer.appendChild(studentElement);
    });
}

// Call the function to load data when the page loads
window.onload = function() {
    loadStudentData();
};
