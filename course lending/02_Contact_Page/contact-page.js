const ContactUsURL = 'https://localhost:7008/api/ContactUs/CreateContactUs';

async function AddContactUs(ContactUsDetails) {
    try {
        const response = await fetch(ContactUsURL, {
            method: 'POST',
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(ContactUsDetails)
        });

        if (!response.ok) {
            throw new Error('Failed to send message');
        }

        return await response.json();  // Assuming the server sends back a response
    } catch (error) {
        console.error('Error:', error);
        throw error;  // Re-throw to be handled by the caller
    }
}

document.getElementById('contactUsForm').addEventListener("submit", async (event) => {
    event.preventDefault();

    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const message = document.getElementById('message').value;
    const today = new Date();
    let id = Number(Math.floor(Math.random() * 1000000));

    const ContactUsDetails = {
        id,
        name,
        email,
        message,
        submitDate: today
    };

    try {
        // Send the contact details
        await AddContactUs(ContactUsDetails);
        
        // Show success message
        document.getElementById('contactUsMessage').textContent = "Your message was successfully sent!";
        document.getElementById('contactUsMessage').style.color = "green";

        setTimeout(() => {
            messageElem.textContent = '';
        }, 10000);
        
    } catch (error) {
        // Show error message
        document.getElementById('contactUsMessage').textContent = "Your message was not sent. Please try again.";
        document.getElementById('contactUsMessage').style.color = "red";
        setTimeout(() => {
            messageElem.textContent = '';
        }, 100);
    }

    // Reset the form after submission
    event.target.reset();
});
