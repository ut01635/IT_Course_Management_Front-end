const contactUsURL = 'https://localhost:7008/api/ContactUs';

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
                <td>${new Date(contact.date).toLocaleDateString()}</td>
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
    const deleteUrl = `${contactUsURL}/${contactId}`;
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
