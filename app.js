// ========================================================
// BACKEND API ENDPOINT (VERCEL SERVERLESS FUNCTION)
// Credentials are kept secure on the backend - never exposed
// ========================================================
const API_ENDPOINT = '/api/submit-application';

// Check if running on Vercel (production) or localhost (development)
const isProduction = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
const apiUrl = isProduction 
    ? `${window.location.origin}${API_ENDPOINT}`
    : `http://localhost:3000${API_ENDPOINT}`;

// Special Testlab Access Portal Logic
document.addEventListener('DOMContentLoaded', () => {
    // State management
    let state = {
        currentStep: 1,
        formData: {
            name: '',
            email: '',
            phone: '',
            platform: 'youtube',
            socialId: '',
            followers: '',
            pitch: ''
        }
    };

    // DOM Elements
    const elements = {
        steps: document.querySelectorAll('.form-step'),
        progressSteps: document.querySelectorAll('.progress-step'),
        progressFill: document.querySelector('.progress-fill'),
        prevBtn: document.getElementById('prevBtn'),
        nextBtn: document.getElementById('nextBtn'),
        creatorForm: document.getElementById('creatorForm'),
        portalView: document.getElementById('portalView'),
        successCard: document.getElementById('successCard'),
        ticketCode: document.getElementById('ticketCode'),
        socialCards: document.querySelectorAll('.social-select-card'),
        formHeader: document.getElementById('formHeader')
    };

    // Initialize Page States
    updateMultiStepForm();
    setupEventListeners();

    function setupEventListeners() {
        // Form Navigation
        elements.nextBtn.addEventListener('click', handleNextStep);
        elements.prevBtn.addEventListener('click', handlePrevStep);

        // Social Platform Cards Selector
        elements.socialCards.forEach(card => {
            card.addEventListener('click', () => {
                elements.socialCards.forEach(c => c.classList.remove('selected'));
                card.classList.add('selected');
                
                const radio = card.querySelector('input[type="radio"]');
                radio.checked = true;
                state.formData.platform = radio.value;
                
                // Dynamically update form labels and placeholder based on platform
                updatePlatformLabels(radio.value);
            });
        });

        // Dynamic Input Validation Visual Feedback
        const inputs = document.querySelectorAll('.form-control');
        inputs.forEach(input => {
            input.addEventListener('blur', () => validateInput(input));
            input.addEventListener('input', () => {
                if (input.classList.contains('invalid')) {
                    validateInput(input);
                }
            });
        });
    }

    /* ========================================================
       MULTI-STEP FORM IMPLEMENTATION
    ======================================================== */
    function updateMultiStepForm() {
        // Show/Hide steps
        elements.steps.forEach((step, idx) => {
            if (idx + 1 === state.currentStep) {
                step.classList.add('active');
            } else {
                step.classList.remove('active');
            }
        });

        // Update progress bubbles
        elements.progressSteps.forEach((step, idx) => {
            const stepNum = idx + 1;
            if (stepNum < state.currentStep) {
                step.className = 'progress-step completed';
            } else if (stepNum === state.currentStep) {
                step.className = 'progress-step active';
            } else {
                step.className = 'progress-step';
            }
        });

        // Update progress connecting bar line
        const fillPercentage = ((state.currentStep - 1) / (elements.steps.length - 1)) * 80;
        elements.progressFill.style.width = `${fillPercentage}%`;

        // Update Nav buttons
        if (state.currentStep === 1) {
            elements.prevBtn.style.visibility = 'hidden';
            elements.nextBtn.textContent = 'Next Sector';
        } else {
            elements.prevBtn.style.visibility = 'visible';
            if (state.currentStep === elements.steps.length) {
                elements.nextBtn.textContent = 'Submit Application';
                elements.nextBtn.classList.add('btn-primary');
            } else {
                elements.nextBtn.textContent = 'Next Sector';
                elements.nextBtn.classList.remove('btn-primary');
            }
        }
    }

    function handleNextStep() {
        // Validate current step before proceeding
        if (validateStep(state.currentStep)) {
            // Save form values to state
            saveCurrentStepData(state.currentStep);

            if (state.currentStep < elements.steps.length) {
                state.currentStep++;
                updateMultiStepForm();
            } else {
                submitApplication();
            }
        }
    }

    function handlePrevStep() {
        if (state.currentStep > 1) {
            state.currentStep--;
            updateMultiStepForm();
        }
    }

    function updatePlatformLabels(platform) {
        const handleLabel = document.getElementById('platformHandleLabel');
        const handleInput = document.getElementById('socialId');
        const followersLabel = document.getElementById('followersLabel');
        const followersInput = document.getElementById('followers');

        if (platform === 'youtube') {
            handleLabel.innerHTML = 'YouTube Channel Link / Handle <span class="req">*</span>';
            handleInput.placeholder = 'youtube.com/@yourchannel or your channel name';
            followersLabel.innerHTML = 'Subscribers Count <span class="req">*</span>';
            followersInput.placeholder = 'e.g. 25,000';
        } else if (platform === 'instagram') {
            handleLabel.innerHTML = 'Instagram Handle / Profile Link <span class="req">*</span>';
            handleInput.placeholder = '@username or instagram.com/username';
            followersLabel.innerHTML = 'Followers Count <span class="req">*</span>';
            followersInput.placeholder = 'e.g. 15,400';
        }
    }

    /* ========================================================
       VALIDATION LOGIC
    ======================================================== */
    function validateStep(step) {
        let isValid = true;
        if (step === 1) {
            const name = document.getElementById('name');
            const email = document.getElementById('email');
            const phone = document.getElementById('phone');

            isValid = validateInput(name) && isValid;
            isValid = validateInput(email) && isValid;
            isValid = validateInput(phone) && isValid;
        } else if (step === 2) {
            const socialId = document.getElementById('socialId');
            const followers = document.getElementById('followers');

            isValid = validateInput(socialId) && isValid;
            isValid = validateInput(followers) && isValid;
        } else if (step === 3) {
            const pitch = document.getElementById('pitch');
            isValid = validateInput(pitch) && isValid;
        }
        return isValid;
    }

    function validateInput(input) {
        const id = input.id;
        const val = input.value.trim();
        const feedback = document.getElementById(`${id}-feedback`);
        let isValid = true;
        let errorMessage = '';

        if (!val) {
            isValid = false;
            errorMessage = 'This transmission slot is required.';
        } else {
            if (id === 'email') {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(val)) {
                    isValid = false;
                    errorMessage = 'Enter a valid communications vector (email).';
                }
            } else if (id === 'phone') {
                // Allows global country codes, spaces, dashes, brackets, digits (7-15 chars)
                const phoneRegex = /^\+?(\d[\s-]?){7,15}$/;
                if (!phoneRegex.test(val.replace(/[\(\)\s\-]/g, ''))) {
                    isValid = false;
                    errorMessage = 'Provide a valid frequency channel (phone number).';
                }
            } else if (id === 'followers') {
                // Verify number format or simple letters (e.g. 50k, 1M, or 50000)
                const followersCleaned = val.toLowerCase().replace(/,/g, '');
                if (isNaN(parseFloat(followersCleaned)) && !/^[0-9.]+[km]$/.test(followersCleaned)) {
                    isValid = false;
                    errorMessage = 'Audience metrics must be a valid number (e.g. 10,000 or 50K).';
                }
            } else if (id === 'pitch' && val.length < 15) {
                isValid = false;
                errorMessage = 'Pitch must be at least 15 characters of high-quality telemetry.';
            }
        }

        if (!isValid) {
            input.classList.add('invalid');
            input.classList.remove('valid');
            if (feedback) {
                feedback.textContent = errorMessage;
                feedback.style.display = 'block';
            }
        } else {
            input.classList.remove('invalid');
            input.classList.add('valid');
            if (feedback) {
                feedback.style.display = 'none';
            }
        }

        return isValid;
    }

    function saveCurrentStepData(step) {
        if (step === 1) {
            state.formData.name = document.getElementById('name').value.trim();
            state.formData.email = document.getElementById('email').value.trim();
            state.formData.phone = document.getElementById('phone').value.trim();
        } else if (step === 2) {
            state.formData.socialId = document.getElementById('socialId').value.trim();
            state.formData.followers = document.getElementById('followers').value.trim();
        } else if (step === 3) {
            state.formData.pitch = document.getElementById('pitch').value.trim();
        }
    }

    /* ========================================================
       APPLICATION FORM SUBMISSION (SECURE API CALL)
    ======================================================== */
    async function submitApplication() {
        // Collect all data
        saveCurrentStepData(3);
        
        // Add ID, timestamp, and default status
        const uniqueId = 'TL-' + Math.floor(100000 + Math.random() * 900000);
        
        // Map elements to database column structures
        const newApplication = {
            id: uniqueId,
            name: state.formData.name,
            email: state.formData.email,
            phone: state.formData.phone,
            platform: state.formData.platform,
            social_id: state.formData.socialId,
            followers: state.formData.followers,
            pitch: state.formData.pitch,
            status: 'pending'
        };

        // Show loading indicator on submit button
        const nextBtnOriginalText = elements.nextBtn.textContent;
        elements.nextBtn.textContent = 'Transmitting...';
        elements.nextBtn.disabled = true;

        let success = false;

        // Try calling secure backend API
        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(newApplication)
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'API request failed');
            }
            
            console.log('📡 Special Testlab: Secure API uplink successful for', uniqueId);
            success = true;
        } catch (err) {
            console.error('⚠️ Special Testlab: API call failed. Falling back to local buffer.', err);
        }

        // Fallback: Local Storage backup
        if (!success) {
            const newLocalApp = {
                ...newApplication,
                date: new Date().toISOString()
            };
            const existingApplications = JSON.parse(localStorage.getItem('special_testlab_applications')) || [];
            existingApplications.unshift(newLocalApp);
            localStorage.setItem('special_testlab_applications', JSON.stringify(existingApplications));
            console.log('💾 Special Testlab: Telemetry saved inside local storage buffer.');
        }

        // Restore submit button states
        elements.nextBtn.textContent = nextBtnOriginalText;
        elements.nextBtn.disabled = false;

        // Show Success screen
        elements.creatorForm.style.display = 'none';
        document.querySelector('.progress-bar-container').style.display = 'none';
        elements.formHeader.style.display = 'none';
        
        elements.ticketCode.textContent = uniqueId;
        elements.successCard.style.display = 'flex';
    }
});
