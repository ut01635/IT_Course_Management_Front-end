document.addEventListener("DOMContentLoaded", () => {
    const profileDetails = document.getElementById("profile-details");
    const editProfileForm = document.getElementById("editProfileForm");
    const profilePicContainer = document.getElementById("profilepic-container");
    let currentProfile;

    // Fetch profile details
    async function fetchProfile() {
        try {
            const response = await fetch('https://api.example.com/profile'); // Replace with your API URL
            currentProfile = await response.json();
            displayProfile(currentProfile);
        } catch (error) {
            console.error('Error fetching profile:', error);
        }
    }

    function displayProfile(profile) {
        profileDetails.innerHTML = `
            <div class="text-center">
                <img src="${profile.profilePicture}" alt="Profile Picture" class="img-fluid" style="width: 150px; height: 150px;" />
            </div>
            <h3>${profile.name}</h3>
            <p>Email: ${profile.email}</p>
            <button onclick="openEditModal()">Edit</button>
        `;
        profilePicContainer.innerHTML = `<img src="${profile.profilePicture}" alt="Profile Picture" />`;
    }

    // Open modal
    window.openEditModal = () => {
        document.getElementById("name").value = currentProfile.name;
        document.getElementById("email").value = currentProfile.email;
        document.getElementById("editProfileModal").style.display = "block";
    };

    // Close modal
    window.closeEditModal = () => {
        document.getElementById("editProfileModal").style.display = "none";
    };

    // Handle form submission
    editProfileForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        
        const updatedProfile = {
            name: document.getElementById("name").value,
            email: document.getElementById("email").value,
            profilePicture: currentProfile.profilePicture, // You can handle file upload here if necessary
        };

        try {
            const response = await fetch('https://api.example.com/profile', { // Replace with your API URL
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedProfile),
            });
            if (response.ok) {
                alert('Profile updated successfully!');
                fetchProfile(); // Refresh the profile details
                closeEditModal(); // Close the modal
            } else {
                alert('Failed to update profile.');
            }
        } catch (error) {
            console.error('Error updating profile:', error);
        }
    });

    // Initial fetch
    fetchProfile();
});
