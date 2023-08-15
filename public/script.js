// TO COLLECT CANDIDATE FORM DATA
document.addEventListener('DOMContentLoaded', () => {
    populateTable();
    const candidateForm = document.getElementById('candidateForm');
    const loadingAnimation = document.getElementById('loader');

    candidateForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const name = document.getElementById('name').value;
        const age = document.getElementById('age').value;
        const email = document.getElementById('email').value;
        const contact = document.getElementById('contact').value;
        const resumeInput = document.getElementById('resume');
        const resumeFile = resumeInput.files[0];

        loadingAnimation.style.display = 'block';
        const formData = new FormData();
        formData.append('name', name);
        formData.append('age', age);
        formData.append('email', email);
        formData.append('contact', contact);
        formData.append('resume', resumeFile);

        try {
            const response = await fetch('/addResume', {
                method: 'POST',
                body: formData
            });
            if (response.ok) {
                console.log('Student data added successfully');
                populateTable();
                clearFormInputs();
            } else {
                console.error('Error adding student data');
            }
        } catch (error) {
            console.error('Error:', error);
        }finally {
            loadingAnimation.style.display = 'none';
        }
    });

    // TO FILL CANDIDATE DATA INTO TABLE
    async function populateTable() {
        const tableBody = document.querySelector('#tableContainer table tbody');
        tableBody.innerHTML = '';

        try {
            const response = await fetch('/getResume');
            const data = await response.json();

            // Sort data array in descending order based on score
            data.sort((a, b) => b.score - a.score);

            data.forEach(student => {
                const row = document.createElement('tr');
                const encodedResumeLink = encodeURIComponent(student.resume);
                const resumeLink = `<a href="/viewResume/${encodedResumeLink}" target="_blank">View Resume</a>`;
                row.innerHTML = `
                    <td>${student.name}</td>
                    <td>${student.age}</td>
                    <td>${student.email}</td>
                    <td>${student.contact}</td>
                    <td>${resumeLink}</td>
                    <td>${student.score}</td>
                    <td><input type="checkbox"></td>
                `;
                tableBody.appendChild(row);
            });
        } catch (error) {
            console.error('Error fetching student data:', error);
        }
    }

    // TO CLEAR FORM INPUT 
    function clearFormInputs() {

        const nameInput = document.getElementById('name');
        const ageInput = document.getElementById('age');
        const emailInput = document.getElementById('email');
        const contactInput = document.getElementById('contact');
        const resumeInput = document.getElementById('resume');

        nameInput.value = '';
        ageInput.value = '';
        emailInput.value = '';
        contactInput.value = '';
        resumeInput.value = '';

    }

});

// TO SEND AN EMAIL
document.addEventListener('DOMContentLoaded', () => {
    const sendEmailBtn = document.getElementById('sendEmailBtn');
    const loadingAnimation = document.getElementById('loader');

    sendEmailBtn.addEventListener('click', async () => {
        const selectedCandidates = getSelectedCandidates();
        
        if (selectedCandidates.length === 0) {
            alert('Please select at least one candidate to send an email.');
            return;
        }

        loadingAnimation.style.display = 'block';
        const emailData = {
            selectedCandidates: selectedCandidates
        };
        try {
            const response = await fetch('/sendEmail', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(emailData)
            });
            if (response.ok) {
                console.log('Email sent successfully');
                const checkboxes = document.querySelectorAll('#tableContainer table tbody input[type="checkbox"]:checked');
                checkboxes.forEach(checkbox => {
                    checkbox.checked = false;
                });
            } else {
                console.error('Error sending email');
            }
        } catch (error) {
            console.error('Error:', error);
        }finally {
            loadingAnimation.style.display = 'none';
        }
    });

    function getSelectedCandidates() {
        const selectedCandidates = [];
        const checkboxes = document.querySelectorAll('#tableContainer table tbody input[type="checkbox"]:checked');
        
        checkboxes.forEach(checkbox => {
            const candidateRow = checkbox.parentElement.parentElement;
            const email = candidateRow.querySelector('td:nth-child(3)').textContent;
            
            selectedCandidates.push({
                email: email
            });
        });

        return selectedCandidates;
    }
});

// TO SUBMIT JOB DESCRIPTION FORM
document.addEventListener('DOMContentLoaded', () => {
    const jobdSubmitBtn = document.getElementById('jobd-submit');
    const loadingAnimation = document.getElementById('loader');
    const jobdRestoreBtn = document.getElementById('jobd-restore');

    jobdSubmitBtn.addEventListener('click', async (event) => {
        event.preventDefault(); 
        const jobTitleInput = document.getElementById('jobTitle').value; 
        const jobdInput = document.getElementById('jobd');
        const jobdFile = jobdInput.files[0];
        
        loadingAnimation.style.display = 'block';
        const jobdFormData = new FormData();
        jobdFormData.append('jobTitle', jobTitleInput);
        jobdFormData.append('jobd', jobdFile);

        try {
            const response = await fetch('/uploadJobDescription', {
                method: 'POST',
                body: jobdFormData,
            });
            if (response.ok) {
                console.log('Job Description Uploaded successfully');
                document.getElementById('jobDescriptionForm').reset();
                checkProcessingStatus();
            } else {
                console.error('Error uploading job description');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    });

    async function checkProcessingStatus() {
        try {
            const response = await fetch('/checkProcessingStatus'); 
            const status = await response.json();

            if (status === 'done') {
                fetchScore();
                pdfContainer.style.display = 'block';
                loadingAnimation.style.display = 'none';
            } else {
                setTimeout(checkProcessingStatus, 1000); 
            }
        } catch (error) {
            console.error('Error checking processing status:', error);
        }
    }

    async function fetchScore() {
        try {
            const response = await fetch('/getScore'); 
            const score = await response.json();

            const scoreContainer = document.getElementById('scoreContainer');
            const scoreValueElement = document.getElementById('scoreValue');
            scoreValueElement.textContent = score;
            scoreContainer.style.display = 'block';
        } catch (error) {
            console.error('Error fetching score:', error);
        }
    }

    jobdRestoreBtn.addEventListener('click', async () => {
        loadingAnimation.style.display = 'block';

        try {
            const response = await fetch('/restoreOriginalJobDescription', {
                method: 'POST',
            });
            if (response.ok) {
                console.log('Original Job Description Restored successfully');
                const pdfViewer = document.getElementById('pdfViewer');
                pdfViewer.setAttribute('src', '/job_description_final/jd.pdf');
                loadingAnimation.style.display = 'none';
            } else {
                console.error('Error restoring original job description');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    });
    
});

