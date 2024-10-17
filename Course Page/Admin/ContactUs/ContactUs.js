//Site Navebar
const toggle = document.querySelector(".fa-bars")
const toggleClose = document.querySelector(".fa-xmark")
const sideNavebar = document.querySelector(".side-navebar")

toggle.addEventListener("click", function () {
    sideNavebar.style.right = "0"
})

toggleClose.addEventListener("click", function () {
    sideNavebar.style.right = "-60%"
})



////////////////////////////////////////////////////////////
const contactUsURL = 'https://localhost:7008/api/ContactUs/GetAll';
const deleteURL = 'https://localhost:7008/api/ContactUs/Delete'



// Function to format the date in the desired format (dd-mm-yyyy / hh.mm)
function formatDateTime(dateString) {
    const date = new Date(dateString);

    const day = String(date.getDate()).padStart(2, '0');       // Get day and pad with leading zero if necessary
    const month = String(date.getMonth() + 1).padStart(2, '0');  // Get month (0-based) and pad with leading zero
    const year = date.getFullYear();                            // Get full year

    const hours = String(date.getHours()).padStart(2, '0');    // Get hours and pad with leading zero
    const minutes = String(date.getMinutes()).padStart(2, '0'); // Get minutes and pad with leading zero

    // Return the formatted date and time
    return  `${hours}.${minutes} - ${day}/${month}/${year} `;
}


// Function to fetch and display contact us details
async function fetchContactUsDetails() {
    try {
        const response = await fetch(contactUsURL);
        if (!response.ok) throw new Error('Network response was not ok');
        
        const contacts = await response.json();
        const contactTableBody = document.getElementById("ContactUS-details-table");

        // Clear existing table rows
        contactTableBody.innerHTML = '';

        // Populate table with contact details
        contacts.forEach(contact => {
            const row = document.createElement('tr');

            row.innerHTML = `
                <td>${formatDateTime(contact.submitDate)}</td>
                <td>${contact.name}</td>
                <td>${contact.email}</td>
                <td>${contact.message}</td>
                <td>
                    <button class="btn btn-danger" onclick="deleteContact('${contact.id}')">Delete</button>
                </td>
            `;

            contactTableBody.appendChild(row);
        });
    } catch (error) {
        console.error('Error fetching contact details:', error);
    }
}

// Function to delete a contact entry
async function deleteContact(contactId) {
    const deleteUrl = `${deleteURL}${contactId}`;
    try {
        const response = await fetch(deleteUrl, {
            method: 'DELETE'
        });

        if (response.ok) {
            alert('Contact deleted successfully!');
            fetchContactUsDetails(); // Refresh the table
        } else {
            alert('Failed to delete contact.');
        }
    } catch (error) {
        console.error('Error deleting contact:', error);
    }
}

// Initial fetch of contact details when the page loads
fetchContactUsDetails();
