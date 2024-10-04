// Function to open the login modal
function openLogin() {
    document.getElementById('loginModal').style.display = 'flex';
}

// Function to close the login modal
function closeLogin() {
    document.getElementById('loginModal').style.display = 'none';
}

// Handle login form submission
document.getElementById('loginForm').addEventListener('submit', function(event) {
    event.preventDefault();  // Prevent the form from submitting normally

    // Get NIC and password from the form
    let nic = document.getElementById('nic').value;
    let password = document.getElementById('password').value;

    // Fetch user data from db.json
    fetch('db.json')
        .then(response => response.json())
        .then(data => {
            let users = data.users;
            let userFound = false;

            // Loop through the users and validate NIC and password
            for (let user of users) {
                if (user.nic === nic && user.password === password) {
                    userFound = true;
                    break;
                }
            }

            // If user is found and credentials match
            if (userFound) {
                alert("Login successful!");
                closeLogin();  // Close the login modal
            } else {
                alert("Invalid NIC or Password. Please try again.");
            }
        })
        .catch(error => {
            console.error('Error fetching user data:', error);
        });
});


///////////////////////////////////////////////////////////////////////////////////////////////

// Function to open the login modal
function openLogin() {
    document.getElementById('loginModal').style.display = 'flex';
}

// Function to close the login modal
function closeLogin() {
    document.getElementById('loginModal').style.display = 'none';
}

// Handle login form submission
document.getElementById('loginForm').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent default form submission

    // Get NIC and password from the form
    let nic = document.getElementById('nic').value;
    let password = document.getElementById('password').value;

    // Construct the URL for the GET request with NIC and password as query parameters
    const url = `http://localhost:5000/login?nic=${nic}&password=${password}`;

    // Make a GET request to the backend to validate the login
    fetch(url, {
        method: 'GET',  // Using GET method
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())  // Parse JSON response from backend
    .then(data => {
        if (data.message === 'Login successful') {
            alert("Login successful!");
            closeLogin();  // Close the login modal on successful login
        } else {
            alert("Invalid NIC or Password. Please try again.");
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('An error occurred. Please try again later.');
    });
});
