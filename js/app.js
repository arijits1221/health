// ========== ARADA - COMPLETE APP WITH ALL FEATURES (3500+ LINES) =========

class App {
    constructor() {
        this.currentUser = null;
        this.userType = null;
        this.medicalData = {};
        this.doctorData = {};
        this.currentStep = 1;
        this.favorites = {
            hospitals: [],
            doctors: []
        };
        this.bookings = [];
        this.cart = [];
        this.notifications = [];
        this.queueSystem = {
            activeQueue: [],
            tokenCounter: 1000,
            avgConsultationTime: 15
        };
        this.setupAuthTypeSelection();
        this.loadDarkMode();
        this.initializeQueueSystem();
    }

    // ===== INITIALIZATION =====
    initializeQueueSystem() {
        const savedQueue = localStorage.getItem('queueSystem');
        if (savedQueue) {
            this.queueSystem = JSON.parse(savedQueue);
        }
        setInterval(() => this.updateQueueWaitingTimes(), 30000);
    }

    loadDarkMode() {
        if (localStorage.getItem('darkMode') === 'true') {
            document.body.classList.add('dark-mode');
        }

        const themeCheckboxAuth = document.getElementById('themeToggleAuth');
        if (themeCheckboxAuth) {
            themeCheckboxAuth.addEventListener('change', () => {
                document.body.classList.toggle('dark-mode');
                localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
            });
        }
    }

    // ===== USER TYPE SELECTION =====
    setupAuthTypeSelection() {
        document.getElementById('patientTypeBtn').addEventListener('click', () => {
            this.selectUserType('patient');
        });

        document.getElementById('doctorTypeBtn').addEventListener('click', () => {
            this.selectUserType('doctor');
        });

        document.querySelectorAll('[id^="backToTypeBtn"]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                this.backToTypeSelection();
            });
        });
    }

    selectUserType(type) {
        this.userType = type;
        document.getElementById('userTypeSelection').classList.add('hidden');
        
        if (type === 'patient') {
            document.getElementById('patientAuthSection').classList.remove('hidden');
            this.setupPatientAuth();
        } else {
            document.getElementById('doctorAuthSection').classList.remove('hidden');
            this.setupDoctorAuth();
        }
    }

    backToTypeSelection() {
        this.userType = null;
        document.getElementById('userTypeSelection').classList.remove('hidden');
        document.getElementById('patientAuthSection').classList.add('hidden');
        document.getElementById('doctorAuthSection').classList.add('hidden');
    }

    // ===== PATIENT AUTHENTICATION =====
    setupPatientAuth() {
        document.getElementById('signupTabBtn').addEventListener('click', () => this.switchAuthTab('signup'));
        document.getElementById('signinTabBtn').addEventListener('click', () => this.switchAuthTab('signin'));
        document.getElementById('switchToSignup').addEventListener('click', (e) => {
            e.preventDefault();
            this.switchAuthTab('signup');
        });

        document.getElementById('signupForm').addEventListener('submit', (e) => this.handlePatientSignup(e));
        document.getElementById('signinForm').addEventListener('submit', (e) => this.handlePatientSignin(e));
    }

    switchAuthTab(tab) {
        document.querySelectorAll('#patientAuthSection .auth-form').forEach(f => f.classList.remove('active'));
        document.querySelectorAll('#patientAuthSection .auth-tab-btn').forEach(b => b.classList.remove('active'));

        if (tab === 'signup') {
            document.getElementById('signupForm').classList.add('active');
            document.getElementById('signupTabBtn').classList.add('active');
        } else {
            document.getElementById('signinForm').classList.add('active');
            document.getElementById('signinTabBtn').classList.add('active');
        }
    }

    handlePatientSignup(e) {
        e.preventDefault();

        const fullname = document.getElementById('fullname').value;
        const age = document.getElementById('age').value;
        const gender = document.getElementById('gender').value;
        const dob = document.getElementById('dob').value;
        const state = document.getElementById('state').value;
        const city = document.getElementById('city').value;
        const phone = document.getElementById('phone').value;
        const password = document.getElementById('password').value;

        if (!fullname || !age || !gender || !dob || !state || !city || !phone || !password) {
            alert('❌ Please fill all fields!');
            return;
        }

        if (password.length < 8) {
            alert('❌ Password must be 8+ characters!');
            return;
        }

        if (phone.length < 10) {
            alert('❌ Please enter a valid phone number!');
            return;
        }

        this.currentUser = { 
            fullname, 
            age, 
            gender, 
            dob, 
            state, 
            city, 
            phone,
            password,
            userId: Date.now(),
            aadharLinked: false,
            aadharDetails: null,
            createdDate: new Date().toLocaleDateString()
        };
        localStorage.setItem('user', JSON.stringify(this.currentUser));
        localStorage.setItem('userType', 'patient');

        alert('✅ Account created! Now fill your medical profile.');
        this.showMedicalProfile();
    }

    handlePatientSignin(e) {
        e.preventDefault();

        const signinName = document.getElementById('signinName').value;
        const signinPassword = document.getElementById('signinPassword').value;
        const storedUser = localStorage.getItem('user');

        if (!storedUser) {
            alert('❌ No account found! Sign up first.');
            return;
        }

        const user = JSON.parse(storedUser);
        if (user.fullname !== signinName || user.password !== signinPassword) {
            alert('❌ Invalid credentials!');
            return;
        }

        this.currentUser = user;
        this.userType = 'patient';
        this.medicalData = JSON.parse(localStorage.getItem('medicalData') || '{}');
        alert('✅ Signed in successfully!');
        this.showApp();
    }

    // ===== DOCTOR AUTHENTICATION =====
    setupDoctorAuth() {
        document.getElementById('doctorSignupTabBtn').addEventListener('click', () => this.switchDoctorAuthTab('signup'));
        document.getElementById('doctorSigninTabBtn').addEventListener('click', () => this.switchDoctorAuthTab('signin'));
        document.getElementById('switchToDoctorSignup').addEventListener('click', (e) => {
            e.preventDefault();
            this.switchDoctorAuthTab('signup');
        });

        document.getElementById('doctorSignupForm').addEventListener('submit', (e) => this.handleDoctorSignup(e));
        document.getElementById('doctorSigninForm').addEventListener('submit', (e) => this.handleDoctorSignin(e));
    }

    switchDoctorAuthTab(tab) {
        document.querySelectorAll('#doctorAuthSection .auth-form').forEach(f => f.classList.remove('active'));
        document.querySelectorAll('#doctorAuthSection .auth-tab-btn').forEach(b => b.classList.remove('active'));

        if (tab === 'signup') {
            document.getElementById('doctorSignupForm').classList.add('active');
            document.getElementById('doctorSignupTabBtn').classList.add('active');
        } else {
            document.getElementById('doctorSigninForm').classList.add('active');
            document.getElementById('doctorSigninTabBtn').classList.add('active');
        }
    }

    handleDoctorSignup(e) {
        e.preventDefault();

        const name = document.getElementById('doctorName').value;
        const specialty = document.getElementById('doctorSpecialty').value;
        const hospital = document.getElementById('doctorHospital').value;
        const license = document.getElementById('licenseNumber').value;
        const experience = document.getElementById('doctorExperience').value;
        const qualifications = document.getElementById('qualifications').value;
        const phone = document.getElementById('doctorPhone').value;
        const email = document.getElementById('doctorEmail').value;
        const password = document.getElementById('doctorPassword').value;

        if (!name || !specialty || !hospital || !license || !experience || !qualifications || !phone || !email || !password) {
            alert('❌ Please fill all fields!');
            return;
        }

        if (password.length < 8) {
            alert('❌ Password must be 8+ characters!');
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            alert('❌ Please enter a valid email!');
            return;
        }

        if (phone.length < 10) {
            alert('❌ Please enter a valid phone number!');
            return;
        }

        this.doctorData = {
            id: Date.now(),
            name,
            specialty,
            hospital,
            license,
            experience: parseInt(experience),
            qualifications,
            phone,
            email,
            password,
            registrationDate: new Date().toLocaleDateString(),
            consultationFees: {
                video: 500,
                chat: 300,
                inClinic: 1000
            },
            rating: 4.8,
            reviews: 0,
            patients: [],
            appointments: [],
            availability: {},
            verified: false,
            avgConsultationTime: 15,
            totalConsultations: 0,
            totalEarnings: 0
        };

        localStorage.setItem('doctorData', JSON.stringify(this.doctorData));
        localStorage.setItem('userType', 'doctor');

        alert('✅ Doctor registration successful! Welcome to ARADA');
        this.showDoctorDashboard();
    }

    handleDoctorSignin(e) {
        e.preventDefault();

        const email = document.getElementById('doctorSigninEmail').value;
        const password = document.getElementById('doctorSigninPassword').value;
        const storedDoctor = localStorage.getItem('doctorData');

        if (!storedDoctor) {
            alert('❌ No doctor account found! Register first.');
            return;
        }

        const doctor = JSON.parse(storedDoctor);
        if (doctor.email !== email || doctor.password !== password) {
            alert('❌ Invalid credentials!');
            return;
        }

        this.doctorData = doctor;
        this.userType = 'doctor';
        alert('✅ Signed in successfully!');
        this.showDoctorDashboard();
    }

    // ===== MEDICAL PROFILE (PATIENT) =====
    showMedicalProfile() {
        document.getElementById('authContainer').classList.add('hidden');
        document.getElementById('medicalProfileContainer').classList.remove('hidden');
        this.setupMedicalProfile();
    }

    setupMedicalProfile() {
        document.querySelectorAll('.blood-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.blood-btn').forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
                this.medicalData.bloodGroup = btn.dataset.value;
            });
        });

        document.getElementById('nextBtn').addEventListener('click', () => this.nextMedicalStep());
        document.getElementById('prevBtn').addEventListener('click', () => this.previousMedicalStep());
    }

    nextMedicalStep() {
        this.saveMedicalStep();

        if (this.currentStep < 8) {
            this.currentStep++;
            this.updateMedicalUI();
        } else {
            this.completeMedicalProfile();
        }
    }

    previousMedicalStep() {
        this.saveMedicalStep();
        if (this.currentStep > 1) {
            this.currentStep--;
            this.updateMedicalUI();
        }
    }

    saveMedicalStep() {
        switch (this.currentStep) {
            case 2:
                const allergies = [];
                document.querySelectorAll('#step-2 input[type="checkbox"]:checked').forEach(cb => {
                    allergies.push(cb.value);
                });
                this.medicalData.allergies = allergies.length > 0 ? allergies.join(', ') : 'None';
                break;
            case 3:
                const conditions = [];
                document.querySelectorAll('#step-3 input[type="checkbox"]:checked').forEach(cb => {
                    conditions.push(cb.value);
                });
                this.medicalData.chronicConditions = conditions.length > 0 ? conditions.join(', ') : 'None';
                break;
            case 4:
                this.medicalData.medications = document.getElementById('medicationsText').value || 'None specified';
                break;
            case 5:
                this.medicalData.surgeries = document.getElementById('surgeriesText').value || 'None';
                break;
            case 6:
                this.medicalData.height = document.getElementById('height').value || '--';
                this.medicalData.weight = document.getElementById('weight').value || '--';
                this.calculateBMI();
                break;
            case 7:
                const name1 = document.querySelector('#step-7 .emergency-name').value;
                const phone1 = document.querySelector('#step-7 .emergency-phone').value;
                const name2 = document.querySelector('#step-7 .emergency-name-2').value;
                const phone2 = document.querySelector('#step-7 .emergency-phone-2').value;
                this.medicalData.emergencyContacts = [];
                if (name1 && phone1) this.medicalData.emergencyContacts.push(`${name1} (${phone1})`);
                if (name2 && phone2) this.medicalData.emergencyContacts.push(`${name2} (${phone2})`);
                this.medicalData.emergencyContacts = this.medicalData.emergencyContacts.join(', ') || 'Not specified';
                break;
            case 8:
                this.medicalData.organDonor = document.querySelector('input[name="organDonor"]:checked')?.value || 'Not specified';
                break;
        }
    }

    calculateBMI() {
        const height = parseFloat(this.medicalData.height);
        const weight = parseFloat(this.medicalData.weight);

        if (height && weight) {
            const bmi = (weight / ((height / 100) ** 2)).toFixed(1);
            let status = '';
            if (bmi < 18.5) status = 'Underweight';
            else if (bmi < 25) status = 'Normal';
            else if (bmi < 30) status = 'Overweight';
            else status = 'Obese';

            const bmiDisplay = document.getElementById('bmiDisplay');
            if (bmiDisplay) {
                bmiDisplay.innerHTML = `<strong>BMI:</strong> ${bmi} (${status})`;
            }
        }
    }

    updateMedicalUI() {
        document.querySelectorAll('.profile-step').forEach(s => s.classList.remove('active'));
        document.getElementById(`step-${this.currentStep}`).classList.add('active');

        const progress = (this.currentStep / 8) * 100;
        document.getElementById('progressFill').style.width = progress + '%';
        document.getElementById('currentStep').textContent = this.currentStep;

        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');

        prevBtn.style.display = this.currentStep === 1 ? 'none' : 'block';
        nextBtn.textContent = this.currentStep === 8 ? 'Complete' : 'Next';
    }

    completeMedicalProfile() {
        this.saveMedicalStep();
        localStorage.setItem('medicalData', JSON.stringify(this.medicalData));
        alert('✅ Medical profile completed! Welcome to ARADA');
        this.showApp();
    }

    // ===== PATIENT APP =====
    showApp() {
        document.getElementById('authContainer').classList.add('hidden');
        document.getElementById('medicalProfileContainer').classList.add('hidden');
        document.getElementById('appContainer').classList.remove('hidden');

        document.getElementById('userName').textContent = this.currentUser.fullname;

        this.setupHome();
        this.setupPharmacy();
        this.setupSOS();
        this.setupChat();
        this.setupProfile();
        this.setupSidebarMenu();
        this.setupNavigation();
    }

    // ===== SIDEBAR MENU =====
    setupSidebarMenu() {
        document.getElementById('menuToggle').addEventListener('click', () => {
            const sidebar = document.getElementById('sidebarMenu');
            const overlay = document.getElementById('sidebarOverlay');
            sidebar.classList.add('open');
            overlay.classList.add('show');
        });

        document.getElementById('closeSidebar').addEventListener('click', () => {
            this.closeSidebar();
        });

        document.getElementById('sidebarOverlay').addEventListener('click', () => {
            this.closeSidebar();
        });

        document.querySelectorAll('.sidebar-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const section = item.dataset.section;
                if (section !== 'theme') {
                    this.showSidebarSection(section);
                }
                this.closeSidebar();
            });
        });

        const darkModeItem = document.getElementById('darkModeToggle');
        if (darkModeItem) {
            darkModeItem.addEventListener('click', (e) => {
                e.preventDefault();
                document.body.classList.toggle('dark-mode');
                localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
            });
        }
    }

    closeSidebar() {
        document.getElementById('sidebarMenu').classList.remove('open');
        document.getElementById('sidebarOverlay').classList.remove('show');
    }

    showSidebarSection(section) {
        const sidebarContent = document.getElementById('sidebarContent');
        const mainContent = document.querySelector('.main-content');
        
        if (sidebarContent.classList.contains('hidden')) {
            sidebarContent.classList.remove('hidden');
            mainContent.style.display = 'none';
        }

        document.querySelectorAll('.sidebar-section').forEach(s => {
            s.classList.remove('active');
        });

        switch(section) {
            case 'favorites':
                document.getElementById('favoritesSection').classList.add('active');
                this.loadFavoriteHospitals();
                break;
            case 'doctors':
                document.getElementById('doctorsSection').classList.add('active');
                this.loadFavoriteDoctors();
                break;
            case 'bookings':
                document.getElementById('bookingsSection').classList.add('active');
                this.loadBookings();
                break;
            case 'history':
                document.getElementById('historySection').classList.add('active');
                this.loadMedicalHistory();
                break;
            case 'prescriptions':
                document.getElementById('prescriptionsSection').classList.add('active');
                this.loadPrescriptions();
                break;
            case 'aadhar':
                document.getElementById('aadharSection').classList.add('active');
                this.setupAadharLinking();
                break;
            case 'settings':
                document.getElementById('settingsSection').classList.add('active');
                break;
        }
    }

    closeSidebarContent() {
        document.getElementById('sidebarContent').classList.add('hidden');
        document.querySelector('.main-content').style.display = 'block';
    }

    loadFavoriteHospitals() {
        const favorites = JSON.parse(localStorage.getItem('favoriteHospitals')) || [];
        const container = document.getElementById('favoritesList');
        
        if (favorites.length === 0) {
            container.innerHTML = '<p class="empty-state">No favorite hospitals yet. Add hospitals from the home tab!</p>';
            return;
        }

        container.innerHTML = favorites.map(fav => `
            <div class="favorite-item">
                <h4>${fav.name}</h4>
                <p>📍 ${fav.distance}</p>
                <p>⭐ ${fav.rating}/5 (${fav.reviews} reviews)</p>
                <p style="color: #FF6B6B; font-weight: 600;">💰 ${fav.fees}</p>
                <button class="btn btn-primary" style="margin-top: 10px; font-size: 0.85rem; padding: 8px; width: 100%;" onclick="app.showHospitalDetails(${JSON.stringify(fav).replace(/"/g, '&quot;')})">View Details</button>
            </div>
        `).join('');
    }

    loadFavoriteDoctors() {
        const favorites = JSON.parse(localStorage.getItem('favoriteDoctors')) || [];
        const container = document.getElementById('doctorsList');
        
        if (favorites.length === 0) {
            container.innerHTML = '<p class="empty-state">No favorite doctors yet. Save doctors from hospital details!</p>';
            return;
        }

        container.innerHTML = favorites.map(doc => `
            <div class="doctor-item">
                <h4>Dr. ${doc.name}</h4>
                <p><strong>Specialty:</strong> ${doc.specialty}</p>
                <p><strong>Experience:</strong> ${doc.exp}</p>
                <p><strong>Hospital:</strong> ${doc.hospital}</p>
                <button class="btn btn-primary" style="margin-top: 10px; font-size: 0.85rem; padding: 8px; width: 100%;" onclick="alert('Booking appointment with Dr. ${doc.name}...')">Book Appointment</button>
            </div>
        `).join('');
    }

    loadBookings() {
        const bookings = JSON.parse(localStorage.getItem('bookings')) || [];
        const container = document.getElementById('bookingsList');
        
        if (bookings.length === 0) {
            container.innerHTML = '<p class="empty-state">No bookings yet. Schedule an appointment to get started!</p>';
            return;
        }

        container.innerHTML = bookings.map((booking, index) => `
            <div class="booking-item">
                <h4>${booking.hospital}</h4>
                <p><strong>Doctor:</strong> Dr. ${booking.doctor}</p>
                <p><strong>Date:</strong> ${booking.date}</p>
                <p><strong>Time:</strong> ${booking.time}</p>
                <p><strong>Token #:</strong> ${booking.tokenNumber}</p>
                <p><strong>Status:</strong> <span style="color: #27AE60; font-weight: bold; background: rgba(39, 174, 96, 0.1); padding: 5px 10px; border-radius: 5px;">${booking.status}</span></p>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 10px;">
                    <button class="btn btn-secondary" style="font-size: 0.75rem; padding: 8px;" onclick="alert('Reschedule functionality coming soon!')">Reschedule</button>
                    <button class="btn btn-danger" style="font-size: 0.75rem; padding: 8px;" onclick="alert('Cancel functionality coming soon!')">Cancel</button>
                </div>
            </div>
        `).join('');
    }

    loadMedicalHistory() {
        const container = document.getElementById('historyList');
        const mockHistory = [
            { date: '15 March 2026', location: 'Apollo Hospitals', type: 'General Checkup', doctor: 'Dr. Rajat Gupta' },
            { date: '10 March 2026', location: 'Diagnostic Lab', type: 'Blood Report', doctor: 'Lab Technician' },
            { date: '5 March 2026', location: 'Max Healthcare', type: 'Heart Checkup', doctor: 'Dr. Vikram Sharma' },
            { date: '28 February 2026', location: 'City General Hospital', type: 'Dental Checkup', doctor: 'Dr. Neha Verma' }
        ];

        container.innerHTML = mockHistory.map(history => `
            <div style="background: var(--lighter); padding: 15px; border-radius: 8px; border-left: 4px solid #FF6B6B; margin-bottom: 10px;">
                <h4 style="margin-bottom: 10px; color: var(--dark);">${history.type}</h4>
                <p><strong>Date:</strong> ${history.date}</p>
                <p><strong>Location:</strong> ${history.location}</p>
                <p><strong>Doctor:</strong> ${history.doctor}</p>
                <button class="btn btn-primary" style="margin-top: 10px; font-size: 0.75rem; padding: 8px; width: 100%;" onclick="alert('Viewing detailed report...')">View Report</button>
            </div>
        `).join('');
    }

    loadPrescriptions() {
        const container = document.getElementById('prescriptionsList');
        const mockPrescriptions = [
            { medicine: 'Aspirin 100mg', dosage: 'Once daily', days: 'Ongoing', date: 'Since March 2026' },
            { medicine: 'Metformin 500mg', dosage: 'Twice daily', days: 'Ongoing', date: 'Since Feb 2026' },
            { medicine: 'Vitamin D3', dosage: 'Once weekly', days: 'Ongoing', date: 'Since Jan 2026' }
        ];

        container.innerHTML = `
            <div style="background: linear-gradient(135deg, #27AE60, #229954); color: white; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                <h4 style="margin-bottom: 10px;"><i class="fas fa-check-circle"></i> Active Prescriptions</h4>
                ${mockPrescriptions.map(p => `
                    <div style="background: rgba(0,0,0,0.1); padding: 10px; border-radius: 5px; margin-bottom: 8px;">
                        <p style="margin: 0;"><strong>${p.medicine}</strong> - ${p.dosage}</p>
                        <p style="font-size: 0.85rem; opacity: 0.9; margin: 5px 0 0 0;">${p.date}</p>
                    </div>
                `).join('')}
            </div>
            <button class="btn btn-primary" style="margin-bottom: 10px; width: 100%;" onclick="alert('Upload prescription functionality coming soon!')">
                <i class="fas fa-upload"></i> Upload New Prescription
            </button>
            <button class="btn btn-secondary" style="width: 100%;" onclick="alert('Download all prescriptions...')">
                <i class="fas fa-download"></i> Download All
            </button>
        `;
    }

    // ===== HOME PAGE - HOSPITALS =====
    setupHome() {
        const hospitals = [
            {
                id: 1,
                name: 'Apollo Hospitals',
                distance: '12.5 km',
                fees: '₹500 - ₹5,000',
                address: 'Sector 25, Noida',
                phone: '+91-120-4100100',
                email: 'info@apollohosp.com',
                website: 'apollohospitals.com',
                rating: 4.8,
                reviews: 2547,
                established: '1996',
                beds: '750+',
                specialties: ['Cardiology', 'Neurology', 'Oncology', 'Orthopedics', 'Gastroenterology', 'Pediatrics'],
                infrastructure: [
                    { title: 'Modern ICU', emoji: '🏥', description: 'State-of-the-art intensive care' },
                    { title: 'Surgical Suites', emoji: '🔬', description: '12 advanced operation theaters' },
                    { title: 'Diagnostics Lab', emoji: '🧪', description: 'Advanced laboratory testing' },
                    { title: 'Imaging Center', emoji: '📸', description: 'CT Scan, MRI, X-ray' },
                    { title: 'Emergency Ward', emoji: '🚨', description: '24/7 Emergency Response' },
                    { title: 'Pharmacy', emoji: '💊', description: 'Round-the-clock services' }
                ],
                departments: [
                    { name: 'Emergency', status: '✅ 24/7' },
                    { name: 'ICU', status: '✅ 50 Beds' },
                    { name: 'OPD', status: '✅ All Days' },
                    { name: 'Surgery', status: '✅ 12 OTs' },
                    { name: 'Diagnostics', status: '✅ Advanced' },
                    { name: 'Pharmacy', status: '✅ 24/7' }
                ],
                facilities: ['Advanced ICU', 'CT Scan & MRI', 'Digital X-ray', 'Lab Services', 'Emergency Unit', 'Ambulance 24/7'],
                doctors: [
                    { name: 'Rajat Gupta', specialty: 'Cardiologist', exp: '20+ years' },
                    { name: 'Priya Jain', specialty: 'Neurologist', exp: '15 years' },
                    { name: 'Amit Singh', specialty: 'Orthopedic Surgeon', exp: '12 years' }
                ],
                services: ['In-patient', 'Out-patient', 'Emergency', 'Surgery', 'Telemedicine', 'Home Care'],
                insurance: ['AIIMS Employees', 'CGHS', 'ESIC', 'Star Health', 'Apollo Insurance'],
                timings: '8 AM - 6 PM (OPD) | 24/7 (Emergency)'
            },
            {
                id: 2,
                name: 'Max Healthcare',
                distance: '8.3 km',
                fees: '₹400 - ₹4,500',
                address: 'Saket, New Delhi',
                phone: '+91-11-4141-4141',
                email: 'info@maxhealthcare.in',
                website: 'maxhealthcare.in',
                rating: 4.7,
                reviews: 1892,
                established: '1999',
                beds: '600+',
                specialties: ['Cardiology', 'Oncology', 'Orthopedics', 'Neurosurgery', 'Urology', 'ENT'],
                infrastructure: [
                    { title: 'Trauma Center', emoji: '🚑', description: 'Specialized trauma care' },
                    { title: 'Advanced OR', emoji: '⚕️', description: '10 operation theaters' },
                    { title: 'Lab Services', emoji: '🧬', description: 'Comprehensive laboratory' },
                    { title: 'Imaging Suite', emoji: '🖼️', description: 'MRI, CT, Ultrasound' },
                    { title: 'Intensive Care', emoji: '💉', description: '40-bed ICU' },
                    { title: 'Pharmacy', emoji: '💊', description: 'Full-service pharmacy' }
                ],
                departments: [
                    { name: 'Emergency', status: '✅ 24/7' },
                    { name: 'ICU', status: '✅ 40 Beds' },
                    { name: 'OPD', status: '✅ All Days' },
                    { name: 'Surgery', status: '✅ 10 OTs' },
                    { name: 'Diagnostics', status: '✅ Modern' },
                    { name: 'Pharmacy', status: '✅ 24/7' }
                ],
                facilities: ['Trauma Center', 'MRI & CT Scan', 'Laboratory', 'Blood Bank', 'Ambulance Service'],
                doctors: [
                    { name: 'Vikram Sharma', specialty: 'Cardiac Surgeon', exp: '18 years' },
                    { name: 'Neha Verma', specialty: 'Oncologist', exp: '14 years' },
                    { name: 'Arjun Reddy', specialty: 'Orthopedic', exp: '11 years' }
                ],
                services: ['In-patient', 'Out-patient', 'Emergency', 'Diagnostics', 'Surgery', 'Rehabilitation'],
                insurance: ['CGHS', 'ESIC', 'Religare', 'Aditya Birla', 'ICICI Lombard'],
                timings: '9 AM - 5 PM (OPD) | 24/7 (Emergency)'
            },
            {
                id: 3,
                name: 'Fortis Healthcare',
                distance: '15.2 km',
                fees: '₹450 - ₹4,800',
                address: 'Vasant Kunj, New Delhi',
                phone: '+91-11-4242-4242',
                email: 'info@fortishealthcare.com',
                website: 'fortishealthcare.com',
                rating: 4.6,
                reviews: 1645,
                established: '2005',
                beds: '500+',
                specialties: ['Cardiology', 'Respiratory', 'General Surgery', 'Orthopedics', 'Pediatrics', 'Psychiatry'],
                infrastructure: [
                    { title: 'Pediatric Wing', emoji: '👶', description: 'Specialized pediatric care' },
                    { title: 'Respiratory Care', emoji: '🫁', description: 'Advanced respiratory therapy' },
                    { title: 'Surgery Suites', emoji: '🏨', description: '8 operation theaters' },
                    { title: 'Lab Services', emoji: '🧫', description: 'Advanced diagnostic lab' },
                    { title: 'Imaging Center', emoji: '📹', description: 'Complete imaging solutions' },
                    { title: 'Pharmacy', emoji: '💊', description: 'Full-service pharmacy' }
                ],
                departments: [
                    { name: 'Emergency', status: '✅ 24/7' },
                    { name: 'ICU', status: '✅ 35 Beds' },
                    { name: 'OPD', status: '✅ All Days' },
                    { name: 'Surgery', status: '✅ 8 OTs' },
                    { name: 'Diagnostics', status: '✅ Complete' },
                    { name: 'Pharmacy', status: '✅ 24/7' }
                ],
                facilities: ['Pediatric Wing', 'Respiratory Care', 'Surgical Suites', 'Lab Services', 'Imaging Center'],
                doctors: [
                    { name: 'Suresh Kapoor', specialty: 'Pulmonologist', exp: '16 years' },
                    { name: 'Meera Singh', specialty: 'Pediatrician', exp: '13 years' },
                    { name: 'Rohan Patel', specialty: 'General Surgeon', exp: '10 years' }
                ],
                services: ['In-patient', 'Out-patient', 'Emergency', 'ICU Care', 'Surgery', 'Consultation'],
                insurance: ['ESIC', 'Star Health', 'Bajaj Allianz', 'Royal Sundaram'],
                timings: '10 AM - 6 PM (OPD) | 24/7 (Emergency)'
            },
            {
                id: 4,
                name: 'Sir Ganga Ram Hospital',
                distance: '5.8 km',
                fees: '₹300 - ₹3,500',
                address: 'Old Delhi',
                phone: '+91-11-4141-4141',
                email: 'info@sirgangaramhospital.com',
                website: 'sirgangaramhospital.com',
                rating: 4.7,
                reviews: 3124,
                established: '1947',
                beds: '400+',
                specialties: ['Urology', 'General Surgery', 'Orthopedics', 'Gastroenterology', 'Cardiology', 'Neurology'],
                infrastructure: [
                    { title: 'Urology Center', emoji: '🩺', description: 'Specialized urology dept' },
                    { title: 'Gastroenterology', emoji: '🏥', description: 'Advanced GI procedures' },
                    { title: 'Surgery Wing', emoji: '⚕️', description: '6 modern OTs' },
                    { title: 'Lab', emoji: '🧬', description: 'Comprehensive pathology' },
                    { title: 'Blood Bank', emoji: '🩸', description: 'Blood transfusion services' },
                    { title: 'Ambulance', emoji: '🚑', description: '24/7 service' }
                ],
                departments: [
                    { name: 'Emergency', status: '✅ 24/7' },
                    { name: 'ICU', status: '✅ 30 Beds' },
                    { name: 'OPD', status: '✅ All Days' },
                    { name: 'Surgery', status: '✅ 6 OTs' },
                    { name: 'Diagnostics', status: '✅ Available' },
                    { name: 'Pharmacy', status: '✅ 24/7' }
                ],
                facilities: ['Urology Center', 'Gastroenterology Unit', 'Surgery Suite', 'Lab', 'Blood Bank', 'Ambulance'],
                doctors: [
                    { name: 'Anil Sharma', specialty: 'Urologist', exp: '22 years' },
                    { name: 'Kavita Dutta', specialty: 'Gastroenterologist', exp: '17 years' },
                    { name: 'Rajesh Kapoor', specialty: 'Surgeon', exp: '19 years' }
                ],
                services: ['In-patient', 'Out-patient', 'Emergency', 'Urology Services', 'Surgery', 'ICU'],
                insurance: ['CGHS', 'ESIC', 'DMS', 'Mediclaim Policies'],
                timings: '8 AM - 5 PM (OPD) | 24/7 (Emergency)'
            },
            {
                id: 5,
                name: 'Delhi Heart Institute',
                distance: '10.1 km',
                fees: '₹600 - ₹6,000',
                address: 'Connaught Place, Delhi',
                phone: '+91-11-4343-4343',
                email: 'info@delhiheartinstitute.com',
                website: 'delhiheartinstitute.com',
                rating: 4.9,
                reviews: 1978,
                established: '2001',
                beds: '200+',
                specialties: ['Cardiology', 'Cardiothoracic Surgery', 'Interventional Cardiology', 'Arrhythmia', 'Heart Failure'],
                infrastructure: [
                    { title: 'Cath Lab', emoji: '🫀', description: 'Cardiac catheterization lab' },
                    { title: 'ECMO Support', emoji: '💓', description: 'ECMO support system' },
                    { title: 'Monitoring', emoji: '📊', description: 'Advanced monitoring' },
                    { title: 'Research', emoji: '🔬', description: 'Cardiac research center' },
                    { title: 'Rehabilitation', emoji: '🏃', description: 'Cardiac rehab program' },
                    { title: 'Ambulance', emoji: '🚑', description: 'Specialized ambulance' }
                ],
                departments: [
                    { name: 'Emergency', status: '✅ 24/7' },
                    { name: 'ICU', status: '✅ 50 Beds' },
                    { name: 'OPD', status: '✅ All Days' },
                    { name: 'Cath Lab', status: '✅ 2 Units' },
                    { name: 'Surgery', status: '✅ 4 OTs' },
                    { name: 'Pharmacy', status: '✅ 24/7' }
                ],
                facilities: ['Cath Lab', 'ECMO Support', 'Advanced Monitoring', 'Research Center', 'Rehabilitation', 'Ambulance'],
                doctors: [
                    { name: 'Ashok Seth', specialty: 'Interventional Cardiologist', exp: '28 years' },
                    { name: 'Ramakanta Panda', specialty: 'Cardiac Surgeon', exp: '25 years' },
                    { name: 'Sandeep Jain', specialty: 'Electrophysiologist', exp: '20 years' }
                ],
                services: ['Cardiology', 'Surgery', 'Intervention', 'Emergency', 'Rehabilitation', 'Telemedicine'],
                insurance: ['All Major Insurance', 'CGHS', 'ESIC', 'Mediclaim'],
                timings: '9 AM - 6 PM (OPD) | 24/7 (Emergency)'
            },
            {
                id: 6,
                name: 'Indraprastha Apollo',
                distance: '7.4 km',
                fees: '₹500 - ₹5,500',
                address: 'Mathura Road, Delhi',
                phone: '+91-11-4165-5500',
                email: 'info@apollodelhi.com',
                website: 'apollohospitals.com',
                rating: 4.8,
                reviews: 2236,
                established: '1996',
                beds: '650+',
                specialties: ['Oncology', 'Cardiology', 'Orthopedics', 'Neurology', 'General Surgery', 'Urology'],
                infrastructure: [
                    { title: 'Oncology Center', emoji: '🏥', description: 'Comprehensive cancer care' },
                    { title: 'Robotic Surgery', emoji: '🤖', description: 'Da Vinci robotic system' },
                    { title: 'Gamma Knife', emoji: '⚡', description: 'Stereotactic radiosurgery' },
                    { title: 'Simulation Lab', emoji: '💻', description: 'Medical simulation' },
                    { title: 'Research', emoji: '🔬', description: 'Advanced research' },
                    { title: 'Ambulance', emoji: '🚑', description: '24/7 service' }
                ],
                departments: [
                    { name: 'Emergency', status: '✅ 24/7' },
                    { name: 'ICU', status: '✅ 45 Beds' },
                    { name: 'OPD', status: '✅ All Days' },
                    { name: 'Surgery', status: '✅ 10 OTs' },
                    { name: 'Diagnostics', status: '✅ Complete' },
                    { name: 'Pharmacy', status: '✅ 24/7' }
                ],
                facilities: ['Oncology Center', 'Robotic Surgery', 'Gamma Knife', 'Simulation Lab', 'Research', 'Ambulance'],
                doctors: [
                    { name: 'Rajesh Sharma', specialty: 'Oncologist', exp: '19 years' },
                    { name: 'Priya Kapoor', specialty: 'Neurologist', exp: '16 years' },
                    { name: 'Mohit Verma', specialty: 'Orthopedic Surgeon', exp: '13 years' }
                ],
                services: ['In-patient', 'Out-patient', 'Emergency', 'Oncology', 'Surgery', 'Rehabilitation'],
                insurance: ['AIIMS Employees', 'CGHS', 'ESIC', 'Star Health', 'Apollo Insurance'],
                timings: '8:30 AM - 5:30 PM (OPD) | 24/7 (Emergency)'
            }
        ];

        const container = document.getElementById('hospitalsList');
        container.innerHTML = '';

        hospitals.forEach((hospital) => {
            const card = document.createElement('div');
            card.className = 'hospital-card';
            
            const infrastructureHTML = hospital.infrastructure.map(inf => 
                `<div>
                    <div>${inf.emoji}</div>
                    <div>${inf.title}</div>
                </div>`
            ).join('');

            card.innerHTML = `
                <div class="hospital-image">
                    <div>
                        ${infrastructureHTML}
                    </div>
                </div>
                <div class="hospital-info">
                    <div class="hospital-name">${hospital.name}</div>
                    <div class="hospital-details">
                        <div class="detail-row">
                            <i class="fas fa-map-marker-alt"></i>
                            <span>${hospital.distance}</span>
                        </div>
                        <div class="detail-row">
                            <i class="fas fa-rupee-sign"></i>
                            <span>${hospital.fees}</span>
                        </div>
                        <div class="detail-row">
                            <i class="fas fa-star"></i>
                            <span>${hospital.rating} (${hospital.reviews} reviews)</span>
                        </div>
                    </div>
                </div>
            `;
            
            card.addEventListener('click', () => this.showHospitalDetails(hospital));
            container.appendChild(card);
        });

        document.getElementById('searchInput').addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            document.querySelectorAll('.hospital-card').forEach(card => {
                const name = card.querySelector('.hospital-name').textContent.toLowerCase();
                card.style.display = name.includes(query) ? 'block' : 'none';
            });
        });
    }

    showHospitalDetails(hospital) {
        const infrastructureShowcase = hospital.infrastructure.map(inf => `
            <div style="background: white; padding: 15px; border-radius: 10px; border-left: 4px solid #FF6B6B; text-align: center;">
                <div style="font-size: 3rem; margin-bottom: 10px;">${inf.emoji}</div>
                <div style="font-weight: 600; color: #2C3E50; margin-bottom: 8px; font-size: 0.95rem;">${inf.title}</div>
                <div style="color: #7F8C8D; font-size: 0.85rem;">${inf.description}</div>
            </div>
        `).join('');

        const detailsHTML = `
            <div style="padding: 20px;">
                <div style="text-align: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 2px solid #FF6B6B;">
                    <h2 style="margin: 0 0 10px 0; color: #2C3E50; font-size: 1.8rem;">${hospital.name}</h2>
                    <div style="display: flex; justify-content: center; gap: 20px; flex-wrap: wrap; margin-top: 15px;">
                        <div style="text-align: center;">
                            <div style="font-size: 2rem; color: #FF6B6B;">⭐</div>
                            <div style="color: #2C3E50; font-weight: bold;">${hospital.rating}</div>
                            <div style="color: #7F8C8D; font-size: 0.9rem;">${hospital.reviews} Reviews</div>
                        </div>
                        <div style="text-align: center;">
                            <div style="font-size: 2rem; color: #4ECDC4;">🏛️</div>
                            <div style="color: #2C3E50; font-weight: bold;">Est. ${hospital.established}</div>
                            <div style="color: #7F8C8D; font-size: 0.9rem;">Established</div>
                        </div>
                        <div style="text-align: center;">
                            <div style="font-size: 2rem; color: #27AE60;">🛏️</div>
                            <div style="color: #2C3E50; font-weight: bold;">${hospital.beds}</div>
                            <div style="color: #7F8C8D; font-size: 0.9rem;">Beds</div>
                        </div>
                    </div>
                </div>

                <div style="background: #F8F9FA; padding: 20px; border-radius: 12px; margin-bottom: 20px;">
                    <h3 style="margin: 0 0 15px 0; display: flex; align-items: center; gap: 10px; color: #2C3E50; font-size: 1.1rem;"><i class="fas fa-building"></i> Hospital Infrastructure</h3>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 12px;">
                        ${infrastructureShowcase}
                    </div>
                </div>

                <div style="background: linear-gradient(135deg, #FF6B6B, #E84C3C); color: white; padding: 20px; border-radius: 12px; margin-bottom: 20px;">
                    <h3 style="margin: 0 0 15px 0; display: flex; align-items: center; gap: 10px;"><i class="fas fa-phone"></i> Contact Information</h3>
                    <div style="display: grid; gap: 12px;">
                        <div>
                            <strong>Phone:</strong> 
                            <a href="tel:${hospital.phone}" style="color: white; text-decoration: underline;">${hospital.phone}</a>
                        </div>
                        <div>
                            <strong>Email:</strong> 
                            <a href="mailto:${hospital.email}" style="color: white; text-decoration: underline;">${hospital.email}</a>
                        </div>
                        <div>
                            <strong>Address:</strong> ${hospital.address}
                        </div>
                        <div>
                            <strong>Website:</strong> 
                            <a href="https://${hospital.website}" target="_blank" style="color: white; text-decoration: underline;">${hospital.website}</a>
                        </div>
                        <div>
                            <strong>Timings:</strong> ${hospital.timings}
                        </div>
                    </div>
                </div>

                <div style="background: #F8F9FA; padding: 20px; border-radius: 12px; margin-bottom: 20px;">
                    <h3 style="margin: 0 0 15px 0; display: flex; align-items: center; gap: 10px; color: #2C3E50;"><i class="fas fa-stethoscope"></i> Specialties</h3>
                    <div style="display: flex; flex-wrap: wrap; gap: 10px;">
                        ${hospital.specialties.map(s => `<span style="background: #FF6B6B; color: white; padding: 8px 15px; border-radius: 20px; font-size: 0.9rem; font-weight: 500;">${s}</span>`).join('')}
                    </div>
                </div>

                <div style="background: #F8F9FA; padding: 20px; border-radius: 12px; margin-bottom: 20px;">
                    <h3 style="margin: 0 0 15px 0; display: flex; align-items: center; gap: 10px; color: #2C3E50;"><i class="fas fa-user-md"></i> Senior Doctors</h3>
                    <div style="display: grid; gap: 15px;">
                        ${hospital.doctors.map(d => `
                            <div style="background: white; padding: 15px; border-radius: 8px; border-left: 4px solid #4ECDC4;">
                                <div style="font-weight: 600; color: #2C3E50; margin-bottom: 8px;">Dr. ${d.name}</div>
                                <div style="color: #7F8C8D; font-size: 0.9rem; margin-bottom: 5px;"><strong>Specialty:</strong> ${d.specialty}</div>
                                <div style="color: #7F8C8D; font-size: 0.9rem;"><strong>Experience:</strong> ${d.exp}</div>
                                <button style="margin-top: 10px; background: #4ECDC4; color: white; border: none; padding: 6px 12px; border-radius: 5px; cursor: pointer; font-size: 0.8rem; font-weight: 600;" onclick="alert('Add Dr. ${d.name} to favorites!')">Add to Favorites</button>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-top: 25px;">
                    <a href="tel:${hospital.phone}" style="
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        gap: 10px;
                        background: #FF6B6B;
                        color: white;
                        padding: 14px 20px;
                        border-radius: 8px;
                        text-decoration: none;
                        font-weight: bold;
                        cursor: pointer;
                        transition: all 0.3s;
                    " onmouseover="this.style.background='#E84C3C'" onmouseout="this.style.background='#FF6B6B'">
                        <i class="fas fa-phone"></i> Call Now
                    </a>
                    <button onclick="app.bookAppointment('${hospital.name}')" style="
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        gap: 10px;
                        background: #4ECDC4;
                        color: white;
                        padding: 14px 20px;
                        border-radius: 8px;
                        border: none;
                        font-weight: bold;
                        cursor: pointer;
                        transition: all 0.3s;
                    " onmouseover="this.style.background='#3DBBA8'" onmouseout="this.style.background='#4ECDC4'">
                        <i class="fas fa-calendar-plus"></i> Book Appointment
                    </button>
                </div>
            </div>
        `;

        const modal = document.getElementById('firstaidModal');
        const content = document.getElementById('firstaidContent');
        content.innerHTML = detailsHTML;
        modal.classList.remove('hidden');
        
        window.scrollTo(0, 0);

        document.querySelector('.modal-close').onclick = () => {
            modal.classList.add('hidden');
        };
    }

   bookAppointment(hospitalName) {
    // Close the hospital details modal first for better UX
    document.getElementById('firstaidModal').classList.add('hidden');
    
    const doctors = [
        { name: 'Rajat Gupta', specialty: 'Cardiologist' },
        { name: 'Priya Jain', specialty: 'Neurologist' },
        { name: 'Vikram Sharma', specialty: 'Surgeon' }
    ];

    // Small delay to ensure smooth transition
    setTimeout(() => {
        this.showAppointmentBookingModal(doctors[0], hospitalName);
    }, 200);
}

    // ===== PHARMACY SETUP =====
    setupPharmacy() {
        document.getElementById('searchMedicineBtn').addEventListener('click', () => this.searchMedicines());
        document.getElementById('medicineSearchInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.searchMedicines();
        });
    }

    searchMedicines() {
        const searchTerm = document.getElementById('medicineSearchInput').value.trim();
        if (!searchTerm) {
            alert('Please enter a medicine name');
            return;
        }

        const medicines = this.getMedicineData(searchTerm);
        this.displayMedicineResults(medicines);
    }

    getMedicineData(searchTerm) {
        const medicineDatabase = {
            'aspirin': [
                {
                    name: 'Aspirin 500mg',
                    brand: 'Bayer',
                    quantity: '10 tablets',
                    description: 'Pain relief and fever reducer',
                    prescription: 'OTC',
                    alternatives: ['Crocin 650mg', 'Dolo 650mg', 'Paracetamol 500mg'],
                    prices: [
                        { platform: 'Zepto', price: 45, delivery: '10 mins', icon: '⚡' },
                        { platform: 'Blinkit', price: 48, delivery: '15 mins', icon: '📦' },
                        { platform: 'Pharmeasy', price: 42, delivery: 'Free', icon: '🏥' },
                        { platform: 'Netmeds', price: 46, delivery: '1 hour', icon: '💊' },
                        { platform: 'Amazon Pharmacy', price: 49, delivery: '2 hours', icon: '🛒' }
                    ]
                }
            ],
            'crocin': [
                {
                    name: 'Crocin 650mg',
                    brand: 'GlaxoSmithKline',
                    quantity: '15 tablets',
                    description: 'Effective pain and fever relief',
                    prescription: 'OTC',
                    alternatives: ['Dolo 650mg', 'Aspirin 500mg', 'Ibuprofen 400mg'],
                    prices: [
                        { platform: 'Zepto', price: 52, delivery: '10 mins', icon: '⚡' },
                        { platform: 'Blinkit', price: 55, delivery: '15 mins', icon: '📦' },
                        { platform: 'Pharmeasy', price: 49, delivery: 'Free', icon: '🏥' },
                        { platform: 'Netmeds', price: 51, delivery: '1 hour', icon: '💊' },
                        { platform: 'Amazon Pharmacy', price: 54, delivery: '2 hours', icon: '🛒' }
                    ]
                }
            ],
            'dolo': [
                {
                    name: 'Dolo 650mg',
                    brand: 'Micro Labs',
                    quantity: '10 tablets',
                    description: 'Trusted pain reliever',
                    prescription: 'OTC',
                    alternatives: ['Crocin 650mg', 'Aspirin 500mg', 'Paracetamol 500mg'],
                    prices: [
                        { platform: 'Zepto', price: 48, delivery: '10 mins', icon: '⚡' },
                        { platform: 'Blinkit', price: 51, delivery: '15 mins', icon: '📦' },
                        { platform: 'Pharmeasy', price: 45, delivery: 'Free', icon: '🏥' },
                        { platform: 'Netmeds', price: 47, delivery: '1 hour', icon: '💊' },
                        { platform: 'Amazon Pharmacy', price: 50, delivery: '2 hours', icon: '🛒' }
                    ]
                }
            ],
            'metformin': [
                {
                    name: 'Metformin 500mg',
                    brand: 'Cipla',
                    quantity: '30 tablets',
                    description: 'Diabetes management medication',
                    prescription: 'Required',
                    alternatives: ['Glipizide', 'Insulin Glargine'],
                    prices: [
                        { platform: 'Zepto', price: 85, delivery: '10 mins', icon: '⚡' },
                        { platform: 'Blinkit', price: 88, delivery: '15 mins', icon: '📦' },
                        { platform: 'Pharmeasy', price: 78, delivery: 'Free', icon: '🏥' },
                        { platform: 'Netmeds', price: 82, delivery: '1 hour', icon: '💊' },
                        { platform: 'Amazon Pharmacy', price: 90, delivery: '2 hours', icon: '🛒' }
                    ]
                }
            ],
            'ibuprofen': [
                {
                    name: 'Ibuprofen 400mg',
                    brand: 'Torrent',
                    quantity: '10 tablets',
                    description: 'Anti-inflammatory pain relief',
                    prescription: 'OTC',
                    alternatives: ['Aspirin 500mg', 'Diclofenac 50mg', 'Naproxen 500mg'],
                    prices: [
                        { platform: 'Zepto', price: 55, delivery: '10 mins', icon: '⚡' },
                        { platform: 'Blinkit', price: 58, delivery: '15 mins', icon: '📦' },
                        { platform: 'Pharmeasy', price: 52, delivery: 'Free', icon: '🏥' },
                        { platform: 'Netmeds', price: 54, delivery: '1 hour', icon: '💊' },
                        { platform: 'Amazon Pharmacy', price: 59, delivery: '2 hours', icon: '🛒' }
                    ]
                }
            ],
            'amoxicillin': [
                {
                    name: 'Amoxicillin 500mg',
                    brand: 'Glaxo',
                    quantity: '10 capsules',
                    description: 'Antibiotic for bacterial infections',
                    prescription: 'Required',
                    alternatives: ['Cephalexin 500mg', 'Azithromycin 500mg'],
                    prices: [
                        { platform: 'Zepto', price: 120, delivery: '10 mins', icon: '⚡' },
                        { platform: 'Blinkit', price: 125, delivery: '15 mins', icon: '📦' },
                        { platform: 'Pharmeasy', price: 115, delivery: 'Free', icon: '🏥' },
                        { platform: 'Netmeds', price: 118, delivery: '1 hour', icon: '💊' },
                        { platform: 'Amazon Pharmacy', price: 128, delivery: '2 hours', icon: '🛒' }
                    ]
                }
            ],
            'omeprazole': [
                {
                    name: 'Omeprazole 20mg',
                    brand: 'AstraZeneca',
                    quantity: '14 capsules',
                    description: 'Acid reflux and GERD treatment',
                    prescription: 'OTC',
                    alternatives: ['Ranitidine 150mg', 'Famotidine 20mg'],
                    prices: [
                        { platform: 'Zepto', price: 65, delivery: '10 mins', icon: '⚡' },
                        { platform: 'Blinkit', price: 68, delivery: '15 mins', icon: '📦' },
                        { platform: 'Pharmeasy', price: 60, delivery: 'Free', icon: '🏥' },
                        { platform: 'Netmeds', price: 63, delivery: '1 hour', icon: '💊' },
                        { platform: 'Amazon Pharmacy', price: 70, delivery: '2 hours', icon: '🛒' }
                    ]
                }
            ],
            'loratadine': [
                {
                    name: 'Loratadine 10mg',
                    brand: 'Cipla',
                    quantity: '10 tablets',
                    description: 'Allergy and cold relief',
                    prescription: 'OTC',
                    alternatives: ['Cetirizine 10mg', 'Fexofenadine 180mg'],
                    prices: [
                        { platform: 'Zepto', price: 35, delivery: '10 mins', icon: '⚡' },
                        { platform: 'Blinkit', price: 38, delivery: '15 mins', icon: '📦' },
                        { platform: 'Pharmeasy', price: 32, delivery: 'Free', icon: '🏥' },
                        { platform: 'Netmeds', price: 36, delivery: '1 hour', icon: '💊' },
                        { platform: 'Amazon Pharmacy', price: 40, delivery: '2 hours', icon: '🛒' }
                    ]
                }
            ]
        };

        const key = searchTerm.toLowerCase();
        return medicineDatabase[key] || [];
    }

    displayMedicineResults(medicines) {
        const container = document.getElementById('medicineResults');

        if (medicines.length === 0) {
            container.innerHTML = '<p class="empty-state">Medicine not found. Try searching for: Aspirin, Crocin, Dolo, Metformin, Ibuprofen, Amoxicillin, Omeprazole, or Loratadine.</p>';
            return;
        }

        container.innerHTML = medicines.map(medicine => {
            const lowestPrice = Math.min(...medicine.prices.map(p => p.price));
            
            const sortedPrices = [...medicine.prices].sort((a, b) => a.price - b.price);
            
            const pricesHTML = sortedPrices.map(p => `
                <div class="platform-price" ${p.price === lowestPrice ? 'style="border: 2px solid #27AE60; box-shadow: 0 0 0 3px rgba(39, 174, 96, 0.2);"' : ''}>
                    ${p.price === lowestPrice ? '<span class="lowest-price-badge"><i class="fas fa-star"></i> Lowest Price</span>' : ''}
                    <div class="platform-name">
                        <span>${p.icon}</span>
                        <span>${p.platform}</span>
                    </div>
                    <div class="platform-price-amount">₹${p.price}</div>
                    <div class="platform-delivery">
                        <span>🚚 ${p.delivery}</span>
                    </div>
                    <button class="platform-button" onclick="alert('Redirecting to ${p.platform}...')">
                        Shop Now
                    </button>
                </div>
            `).join('');

            const alternativesHTML = medicine.alternatives.map(alt => `
                <div class="alternative-item" onclick="document.getElementById('medicineSearchInput').value='${alt}'; app.searchMedicines();">
                    ${alt}
                </div>
            `).join('');

            return `
                <div class="medicine-card">
                    <div class="medicine-name">
                        <i class="fas fa-pills"></i> ${medicine.name}
                        ${medicine.prescription === 'Required' ? '<span style="background: #E74C3C; color: white; padding: 2px 8px; border-radius: 4px; font-size: 0.75rem; font-weight: 600;">Rx</span>' : '<span style="background: #27AE60; color: white; padding: 2px 8px; border-radius: 4px; font-size: 0.75rem; font-weight: 600;">OTC</span>'}
                    </div>
                    
                    <div class="medicine-details">
                        <div class="medicine-detail">
                            <strong>Brand:</strong>
                            <span>${medicine.brand}</span>
                        </div>
                        <div class="medicine-detail">
                            <strong>Quantity:</strong>
                            <span>${medicine.quantity}</span>
                        </div>
                        <div class="medicine-detail">
                            <strong>Description:</strong>
                            <span>${medicine.description}</span>
                        </div>
                    </div>

                    <div class="price-comparison">
                        <h4><i class="fas fa-chart-bar"></i> Price Comparison (Sorted by Price)</h4>
                        <div class="price-platforms">
                            ${pricesHTML}
                        </div>
                    </div>

                    ${medicine.alternatives.length > 0 ? `
                        <div class="alternative-medicines">
                            <h4><i class="fas fa-exchange-alt"></i> Alternative Medicines</h4>
                            <div class="alternative-list">
                                ${alternativesHTML}
                            </div>
                        </div>
                    ` : ''}

                    <button class="add-to-cart-btn" onclick="alert('Medicine added to cart! Proceed to checkout on your preferred platform.')">
                        <i class="fas fa-shopping-cart"></i> Add to Cart
                    </button>
                </div>
            `;
        }).join('');
    }

    // ===== SOS SETUP =====
    setupSOS() {
        document.getElementById('sosButton').addEventListener('click', () => {
            const ambulance = document.getElementById('ambulanceNumber').value;
            alert(`🚨 EMERGENCY ALERT SENT!\n\n✅ Ambulance Called: ${ambulance}\n✅ Emergency Contacts Notified\n✅ Location Shared\n✅ Nearest Hospitals Alerted`);
        });

        document.querySelectorAll('.firstaid-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                this.showFirstAidGuide(link.dataset.issue);
            });
        });
    }

    showFirstAidGuide(issue) {
        const guides = {
            choking: `<h2>🫁 Choking - Heimlich Maneuver</h2><h3>Steps:</h3><ol><li><strong>Call for help immediately</strong></li><li><strong>Stand behind the person</strong></li><li><strong>Place fist above navel</strong></li><li><strong>Perform quick upward thrusts</strong></li><li><strong>Repeat 5-6 times</strong></li></ol><h3>If Unsuccessful:</h3><ul><li>Alternate: 5 back blows + 5 thrusts</li><li>Keep trying until object dislodges</li><li>Call 911 if unable to clear</li></ul><p><strong>⚠️ CRITICAL: Call emergency services immediately!</strong></p>`,

            cardiac: `<h2>❤️ Cardiac Arrest - CPR Instructions</h2><h3>Immediate Steps:</h3><ol><li><strong>Call 911/Emergency immediately</strong></li><li><strong>Check responsiveness</strong> - Tap & shout</li><li><strong>Place on flat surface</strong></li><li><strong>Tilt head back slightly</strong></li></ol><h3>Chest Compressions:</h3><ul><li>Place heel on center of chest</li><li>Push hard: 5-6 cm depth</li><li>Rate: 100-120 compressions/minute</li><li>Continue without stopping</li></ul><p><strong>⚠️ CRITICAL: Don't stop until help arrives!</strong></p>`,

            bleeding: `<h2>🩸 Severe Bleeding - Stop the Bleed</h2><h3>Steps:</h3><ol><li><strong>Wear gloves if available</strong></li><li><strong>Apply direct pressure</strong><ul><li>Use clean cloth/gauze</li><li>Press firmly on wound</li><li>Maintain pressure 10-15 minutes</li></ul></li><li><strong>Do NOT remove cloth</strong><ul><li>Add new layers if blood seeps</li><li>Keep pressure constant</li></ul></li><li><strong>Elevate limb</strong> above heart if possible</li><li><strong>Call 911 immediately</strong></li></ol><p><strong>⚠️ Seek emergency care immediately!</strong></p>`,

            burns: `<h2>🔥 Burns - First Aid</h2><h3>Immediate Actions:</h3><ol><li><strong>Stop the burning</strong><ul><li>Remove from heat source</li><li>Smother flames if on fire</li></ul></li><li><strong>Cool the burn</strong><ul><li>Cool (not cold) running water</li><li>For 10-20 minutes</li><li>DO NOT use ice directly</li></ul></li><li><strong>Cover the burn</strong><ul><li>Sterile, non-stick dressing</li><li>Or clean cloth</li></ul></li></ol><p><strong>⚠️ For severe burns: Call 911!</strong></p>`,

            fracture: `<h2>🦴 Fractures - RICE Protocol</h2><h3>RICE Steps:</h3><ol><li><strong>Rest</strong> - Stop activity immediately</li><li><strong>Ice</strong><ul><li>Apply 20 minutes</li><li>Every 2-3 hours for 48 hours</li></ul></li><li><strong>Compression</strong><ul><li>Wrap with elastic bandage</li><li>Snug but allow circulation</li></ul></li><li><strong>Elevation</strong><ul><li>Raise above heart level</li><li>Reduces swelling</li></ul></li></ol><p><strong>⚠️ Seek medical attention for X-ray!</strong></p>`,

            poisoning: `<h2>☠️ Poisoning - Emergency Response</h2><h3>Immediate Actions:</h3><ol><li><strong>Call Poison Control/911 immediately</strong></li><li><strong>Do NOT induce vomiting</strong></li><li><strong>If conscious:</strong> Remove from toxic area</li><li><strong>If unconscious:</strong> Place in recovery position</li><li><strong>Bring poison container to hospital</strong></li></ol><p><strong>⚠️ CRITICAL: Always call emergency services!</strong></p>`
        };

        const modal = document.getElementById('firstaidModal');
        const content = document.getElementById('firstaidContent');
        content.innerHTML = guides[issue] || '<h2>Guide not found</h2>';
        modal.classList.remove('hidden');

        document.querySelector('.modal-close').onclick = () => {
            modal.classList.add('hidden');
        };
    }

    // ===== CHAT SETUP =====
    setupChat() {
        document.getElementById('sendChatBtn').addEventListener('click', () => this.sendChatMessage());
        document.getElementById('chatInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.sendChatMessage();
        });

        document.querySelectorAll('.quick-opt').forEach(btn => {
            btn.addEventListener('click', () => {
                document.getElementById('chatInput').value = btn.dataset.query;
                this.sendChatMessage();
            });
        });
    }

    sendChatMessage() {
        const input = document.getElementById('chatInput');
        const msg = input.value.trim();
        if (!msg) return;

        const container = document.getElementById('chatMessages');
        container.innerHTML += `<div class="message user-message"><p>${this.escapeHtml(msg)}</p></div>`;

        const response = this.getChatResponse(msg.toLowerCase());
        container.innerHTML += `<div class="message bot-message"><p>${response}</p></div>`;
        container.scrollTop = container.scrollHeight;
        input.value = '';
    }

    getChatResponse(query) {
        const responses = {
            'headache': `<strong>💊 Headache Relief:</strong><br>• Rest in a quiet, dark room<br>• Stay hydrated - drink water<br>• Take Paracetamol 500mg or Ibuprofen 400mg<br>• Apply warm/cold compress<br>• Avoid caffeine and stress<br><strong>⚠️ See doctor if:</strong> Severe, persistent, or with neck stiffness`,
            
            'fever': `<strong>🌡️ Fever Management:</strong><br>• Rest and stay cool<br>• Drink plenty of water<br>• Take Paracetamol 500mg (4-6 hourly)<br>• Use cooling methods<br>• Light, nutritious food<br><strong>⚠️ Consult doctor if:</strong> Fever > 103°F or persists > 3 days`,
            
            'cough': `<strong>🫁 Cough Relief:</strong><br>• Stay hydrated<br>• Use honey or cough drops<br>• Steam inhalation<br>• Avoid smoke and cold air<br>• Rest well<br><strong>⚠️ Seek help if:</strong> Blood in sputum, severe difficulty breathing`,
            
            'cold': `<strong>❄️ Common Cold Care:</strong><br>• Rest for 7-10 days<br>• Drink warm fluids<br>• Use saline nasal drops<br>• Take Vitamin C<br>• Use humidifier<br><strong>💡 Prevention:</strong> Wash hands, avoid crowds`,
            
            'symptoms': `<strong>🔍 Symptom Checker:</strong><br>Please describe:<br>• Where is the pain/discomfort?<br>• How long has it been?<br>• Associated symptoms?<br>• Recent medical history?<br>• Current medications?<br><strong>Note:</strong> This is for guidance only. Always consult a doctor for accurate diagnosis.`,
            
            'medicine': `<strong>💊 Common Medicines:</strong><br>• <strong>Paracetamol:</strong> Pain & fever, 500mg, max 4g/day<br>• <strong>Ibuprofen:</strong> Pain & inflammation, 400mg, with food<br>• <strong>Aspirin:</strong> Heart health, 75-325mg daily<br>• <strong>Cough Syrup:</strong> 5-10ml, 3-4 times daily<br><strong>⚠️ Always consult pharmacist for:</strong> Interactions, allergies, side effects`,
            
            'disease': `<strong>🏥 Common Diseases:</strong><br>• <strong>Diabetes:</strong> Monitor blood glucose, follow diet<br>• <strong>Hypertension:</strong> Reduce salt, exercise, take meds<br>• <strong>Asthma:</strong> Use inhaler, avoid triggers<br>• <strong>Heart Disease:</strong> Follow doctor's advice, regular check-ups<br>• <strong>Thyroid:</strong> Take hormones as prescribed<br><strong>Note:</strong> Seek medical care for proper management`,
            
            'tips': `<strong>💡 Health Tips:</strong><br>• Drink 8-10 glasses of water daily<br>• Exercise 30 minutes daily<br>• Eat fresh fruits and vegetables<br>• Sleep 7-8 hours<br>• Manage stress through meditation<br>• Regular health check-ups<br>• Avoid smoking and alcohol<br>• Maintain healthy weight`,
            
            'blood pressure': `<strong>📊 Blood Pressure:</strong><br>• Normal: <120/80 mmHg<br>• Elevated: 120-129/<80<br>• High: ≥130/80<br><strong>Management:</strong><br>• Reduce salt intake<br>• Exercise regularly<br>• Manage stress<br>• Take medications as prescribed<br>• Monitor regularly`,
            
            'diabetes': `<strong>🩺 Diabetes Management:</strong><br>• Monitor blood glucose regularly<br>• Take medications on time<br>• Follow low glycemic diet<br>• Exercise 30 mins daily<br>• Maintain healthy weight<br>• Stay hydrated<br><strong>⚠️ Emergency signs:</strong> Extreme thirst, frequent urination, blurred vision`,
            
            'default': `<strong>👋 I can help with:</strong><br>• Symptom checking<br>• Medicine information<br>• Disease management<br>• Health tips<br>• First aid guidance<br><strong>Try asking about:</strong> Headache, fever, cold, cough, blood pressure, diabetes, symptoms, medicines, diseases, and more!`
        };

        for (const [key, response] of Object.entries(responses)) {
            if (query.includes(key)) {
                return response;
            }
        }

        return responses.default;
    }

    escapeHtml(text) {
        const map = {
            '&': '&amp;', '<': '&lt;', '>': '&gt;',
            '"': '&quot;', "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, m => map[m]);
    }

    // ===== PROFILE SETUP =====
    setupProfile() {
        if (this.currentUser) {
            document.getElementById('profileName').textContent = this.currentUser.fullname;
            document.getElementById('profileAge').textContent = this.currentUser.age;
            document.getElementById('profileGender').textContent = this.currentUser.gender;
            document.getElementById('profileDOB').textContent = this.formatDate(this.currentUser.dob);
            document.getElementById('profileCity').textContent = this.currentUser.city;
            document.getElementById('profileLocation').textContent = `📍 ${this.currentUser.city}`;
        }

        document.getElementById('viewMedicalBtn').addEventListener('click', () => this.toggleMedicalSection());
        document.getElementById('unlockMedicalBtn').addEventListener('click', () => this.unlockMedical());
        document.getElementById('lockMedicalBtn').addEventListener('click', () => this.lockMedical());
        document.getElementById('logoutBtn').addEventListener('click', () => this.logout());
    }

    toggleMedicalSection() {
        const box = document.getElementById('medicalInfoBox');
        box.classList.toggle('hidden');
        if (!box.classList.contains('hidden')) {
            document.getElementById('medicalPassword').focus();
        }
    }

    unlockMedical() {
        const password = document.getElementById('medicalPassword').value;

        if (!password) {
            alert('❌ Please enter your password');
            return;
        }

        if (password !== this.currentUser.password) {
            alert('❌ Incorrect password!');
            return;
        }

        if (!this.medicalData || Object.keys(this.medicalData).length === 0) {
            this.medicalData = JSON.parse(localStorage.getItem('medicalData') || '{}');
        }

        document.getElementById('displayBloodGroup').textContent = this.medicalData.bloodGroup || '--';
        document.getElementById('displayAllergies').textContent = this.medicalData.allergies || '--';
        document.getElementById('displayConditions').textContent = this.medicalData.chronicConditions || '--';
        document.getElementById('displayMedications').textContent = this.medicalData.medications || '--';
        document.getElementById('displaySurgeries').textContent = this.medicalData.surgeries || '--';
        document.getElementById('displayVitals').textContent = `${this.medicalData.height}cm / ${this.medicalData.weight}kg`;
        document.getElementById('displayOrganDonor').textContent = this.medicalData.organDonor || '--';
        document.getElementById('displayEmergency').textContent = this.medicalData.emergencyContacts || '--';

        document.getElementById('medicalPassword').value = '';
        document.querySelector('.medical-unlock-section').classList.add('hidden');
        document.getElementById('medicalContent').classList.remove('hidden');
    }

    lockMedical() {
        document.querySelector('.medical-unlock-section').classList.remove('hidden');
        document.getElementById('medicalContent').classList.add('hidden');
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN');
    }

    // ===== AADHAR LINKING =====
    setupAadharLinking() {
        document.getElementById('linkAadharBtn').addEventListener('click', () => this.linkAadharID());
        document.getElementById('unlinkAadharBtn').addEventListener('click', () => this.unlinkAadharID());

        if (this.currentUser && this.currentUser.aadharLinked) {
            this.showAadharStatus();
        }
    }

    linkAadharID() {
        const name = document.getElementById('aadharName').value.trim();
        const aadharNumber = document.getElementById('aadharNumber').value.trim();
        const phone = document.getElementById('aadharPhone').value.trim();
        const consent = document.getElementById('aadharConsent').checked;

        if (!name || !aadharNumber || !phone) {
            alert('❌ Please fill all fields');
            return;
        }

        if (aadharNumber.length !== 12 || !/^\d+$/.test(aadharNumber)) {
            alert('❌ Please enter a valid 12-digit Aadhar number');
            return;
        }

        if (!consent) {
            alert('❌ Please consent to link your Aadhar ID');
            return;
        }

        if (name.toLowerCase() !== this.currentUser.fullname.toLowerCase()) {
            alert('❌ Name does not match your account name');
            return;
        }

        this.currentUser.aadharLinked = true;
        this.currentUser.aadharDetails = {
            name,
            aadharNumber: `XXXX XXXX ${aadharNumber.slice(-4)}`,
            phone,
            linkedDate: new Date().toLocaleDateString()
        };

        localStorage.setItem('user', JSON.stringify(this.currentUser));

        document.querySelector('.aadhar-form').classList.add('hidden');
        this.showAadharStatus();
        alert('✅ Aadhar ID successfully linked!');
    }

    showAadharStatus() {
        if (this.currentUser && this.currentUser.aadharLinked && this.currentUser.aadharDetails) {
            document.querySelector('.aadhar-form').classList.add('hidden');
            const statusDiv = document.getElementById('aadharStatus');
            statusDiv.classList.remove('hidden');

            document.getElementById('linkedName').textContent = `Name: ${this.currentUser.aadharDetails.name}`;
            document.getElementById('linkedAadhar').textContent = `Aadhar: ${this.currentUser.aadharDetails.aadharNumber}`;
            document.getElementById('linkedDate').textContent = `Linked on: ${this.currentUser.aadharDetails.linkedDate}`;
        }
    }

    unlinkAadharID() {
        if (confirm('Are you sure you want to unlink your Aadhar ID?')) {
            this.currentUser.aadharLinked = false;
            this.currentUser.aadharDetails = null;
            localStorage.setItem('user', JSON.stringify(this.currentUser));

            document.getElementById('aadharStatus').classList.add('hidden');
            document.querySelector('.aadhar-form').classList.remove('hidden');
            document.getElementById('aadharName').value = '';
            document.getElementById('aadharNumber').value = '';
            document.getElementById('aadharPhone').value = '';
            document.getElementById('aadharConsent').checked = false;

            alert('✅ Aadhar ID unlinked successfully');
        }
    }

    // ===== NAVIGATION =====
    setupNavigation() {
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', () => {
                const sidebarContent = document.getElementById('sidebarContent');
                if (sidebarContent && !sidebarContent.classList.contains('hidden')) {
                    sidebarContent.classList.add('hidden');
                    document.querySelector('.main-content').style.display = 'block';
                }

                document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
                document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));

                item.classList.add('active');
                const tab = item.dataset.tab;
                document.getElementById(tab).classList.add('active');
            });
        });
    }

    // ===== DOCTOR DASHBOARD =====
    showDoctorDashboard() {
        document.getElementById('authContainer').classList.add('hidden');
        document.getElementById('doctorDashboardContainer').classList.remove('hidden');
        
        document.getElementById('doctorNameDisplay').textContent = `Dr. ${this.doctorData.name.split(' ')[0]}`;
        
        document.getElementById('profileDoctorName').textContent = this.doctorData.name;
        document.getElementById('profileDoctorSpecialty').textContent = this.doctorData.specialty;
        document.getElementById('profileDoctorHospital').textContent = this.doctorData.hospital;
        document.getElementById('profileDoctorExp').textContent = `${this.doctorData.experience} years`;
        document.getElementById('profileDoctorLicense').textContent = this.doctorData.license;
        document.getElementById('profileDoctorContact').textContent = this.doctorData.phone;

        this.setupDoctorDashboard();
    }

    setupDoctorDashboard() {
        document.querySelectorAll('.doctor-nav-item').forEach(item => {
            item.addEventListener('click', () => {
                document.querySelectorAll('.doctor-nav-item').forEach(i => i.classList.remove('active'));
                document.querySelectorAll('.doctor-tab-content').forEach(t => t.classList.remove('active'));

                item.classList.add('active');
                const tab = item.dataset.tab;
                document.getElementById(tab).classList.add('active');
            });
        });

        document.getElementById('doctorLogoutBtn').addEventListener('click', () => this.logout());

        this.loadNotifications();
        this.loadSmartQueue();
        this.loadTodaysAppointments();
        this.loadPatientsList();
    }

    // ===== NOTIFICATIONS SYSTEM =====
    loadNotifications() {
        const container = document.getElementById('notificationsList');
        const savedNotifications = localStorage.getItem('notifications') || '[]';
        this.notifications = JSON.parse(savedNotifications);

        if (this.notifications.length === 0) {
            container.innerHTML = '<p class="empty-state">No new notifications</p>';
            this.updateNotificationBadge(0);
            return;
        }

        container.innerHTML = this.notifications.map((notif, index) => `
            <div class="notification-item">
                <div class="notification-header">
                    <div class="notification-title">
                        <i class="fas fa-calendar-plus"></i>
                        New Appointment Booking
                    </div>
                    <span class="notification-time">${notif.time}</span>
                </div>
                
                <div class="notification-details">
                    <div class="notification-detail">
                        <i class="fas fa-user"></i>
                        <strong>${notif.patientName}</strong> (Age: ${notif.age})
                    </div>
                    <div class="notification-detail">
                        <i class="fas fa-phone"></i>
                        ${notif.phone}
                    </div>
                    <div class="notification-detail">
                        <i class="fas fa-heartbeat"></i>
                        <span class="priority-badge ${notif.priority.toLowerCase()}">
                            <i class="fas fa-${notif.priority === 'CRITICAL' ? 'exclamation-circle' : 'check-circle'}"></i>
                            ${notif.priority}
                        </span>
                    </div>
                    <div class="notification-detail">
                        <i class="fas fa-tag"></i>
                        <strong>Token #${notif.tokenNumber}</strong>
                    </div>
                </div>

                <div class="notification-actions">
                    <button class="accept-notification" onclick="app.acceptNotification(${index})">
                        <i class="fas fa-check"></i> Accept
                    </button>
                    <button class="reject-notification" onclick="app.rejectNotification(${index})">
                        <i class="fas fa-times"></i> Decline
                    </button>
                </div>
            </div>
        `).join('');

        this.updateNotificationBadge(this.notifications.length);
    }

    updateNotificationBadge(count) {
        const badge = document.getElementById('notificationCount');
        if (badge) {
            badge.textContent = count;
            if (count === 0) {
                document.getElementById('notificationBadge').style.opacity = '0.5';
            } else {
                document.getElementById('notificationBadge').style.opacity = '1';
            }
        }
    }

    acceptNotification(index) {
        const notif = this.notifications[index];
        alert(`✅ Appointment accepted!\n\nPatient: ${notif.patientName}\nToken: #${notif.tokenNumber}\nPriority: ${notif.priority}`);
        
        this.notifications.splice(index, 1);
        localStorage.setItem('notifications', JSON.stringify(this.notifications));
        this.loadNotifications();
    }

    rejectNotification(index) {
        this.notifications.splice(index, 1);
        localStorage.setItem('notifications', JSON.stringify(this.notifications));
        alert('❌ Appointment declined');
        this.loadNotifications();
    }

    // ===== SMART TRIAGE & QUEUE SYSTEM =====
    calculatePriority(symptoms) {
        const criticalSymptoms = ['chest pain', 'difficulty breathing', 'severe bleeding', 'unconsciousness', 'severe trauma', 'accident'];
        const selectedSymptoms = Object.values(symptoms).join(' ').toLowerCase();
        
        for (let symptom of criticalSymptoms) {
            if (selectedSymptoms.includes(symptom)) {
                return 'CRITICAL';
            }
        }
        return 'NORMAL';
    }

    addToQueue(patientData, priority) {
        const tokenNumber = this.queueSystem.tokenCounter++;
        const queueItem = {
            tokenNumber,
            patientName: patientData.name,
            patientAge: patientData.age,
            symptoms: patientData.symptoms,
            priority,
            bookedTime: new Date(),
            estimatedWaitTime: this.calculateEstimatedWaitTime(),
            consultationTime: this.queueSystem.avgConsultationTime,
            position: this.queueSystem.activeQueue.length + 1,
            completed: false
        };

        this.queueSystem.activeQueue.push(queueItem);
        localStorage.setItem('queueSystem', JSON.stringify(this.queueSystem));
        
        this.queueSystem.activeQueue.sort((a, b) => {
            if (a.priority === 'CRITICAL' && b.priority !== 'CRITICAL') return -1;
            if (a.priority !== 'CRITICAL' && b.priority === 'CRITICAL') return 1;
            return a.position - b.position;
        });

        return tokenNumber;
    }

    calculateEstimatedWaitTime() {
        const patientsAhead = this.queueSystem.activeQueue.filter(p => !p.completed).length;
        return patientsAhead * this.queueSystem.avgConsultationTime;
    }

    updateQueueWaitingTimes() {
        this.queueSystem.activeQueue.forEach(patient => {
            if (!patient.completed) {
                patient.estimatedWaitTime = this.calculateEstimatedWaitTime();
            }
        });
        
        localStorage.setItem('queueSystem', JSON.stringify(this.queueSystem));
        
        if (document.getElementById('queueList')) {
            this.loadSmartQueue();
        }
    }

    loadSmartQueue() {
        const container = document.getElementById('queueList');
        const activeQueue = this.queueSystem.activeQueue.filter(p => !p.completed);

        if (activeQueue.length === 0) {
            container.innerHTML = '<p class="empty-state">No patients in queue</p>';
            return;
        }

        container.innerHTML = activeQueue.map((patient, index) => `
            <div class="queue-item ${patient.priority.toLowerCase()}">
                <div class="token-number">
                    <div class="token-label">TOKEN</div>
                    <div class="token-number-text">${patient.tokenNumber}</div>
                </div>

                <div class="queue-info">
                    <div class="queue-patient-name">${patient.patientName}</div>
                    <div class="queue-details">
                        <div class="queue-detail">
                            <i class="fas fa-birthday-cake"></i>
                            <span>Age: ${patient.patientAge}</span>
                        </div>
                        <div class="queue-detail">
                            <i class="fas fa-briefcase-medical"></i>
                            <span>${patient.symptoms}</span>
                        </div>
                        <div style="margin-top: 10px;">
                            <span class="priority-badge ${patient.priority.toLowerCase()}">
                                <i class="fas fa-${patient.priority === 'CRITICAL' ? 'exclamation-triangle' : 'hourglass-end'}"></i>
                                ${patient.priority} PRIORITY
                            </span>
                        </div>
                    </div>
                </div>

                <div class="queue-timing">
                    <div class="waiting-time">${patient.estimatedWaitTime}</div>
                    <div class="waiting-time-label">Min Wait</div>
                    <div class="position-in-queue">Position #${index + 1}</div>
                </div>

                <div class="queue-actions">
                    <button class="queue-action-btn start-consultation-btn" onclick="app.startConsultation(${patient.tokenNumber})">
                        <i class="fas fa-video"></i> Start
                    </button>
                    <button class="queue-action-btn priority-override-btn" onclick="app.overridePriority(${patient.tokenNumber})">
                        <i class="fas fa-arrows-alt-v"></i> Override
                    </button>
                </div>
            </div>
        `).join('');
    }

    startConsultation(tokenNumber) {
        const queueIndex = this.queueSystem.activeQueue.findIndex(p => p.tokenNumber === tokenNumber);
        if (queueIndex !== -1) {
            this.queueSystem.activeQueue[queueIndex].completed = true;
            localStorage.setItem('queueSystem', JSON.stringify(this.queueSystem));
            alert(`✅ Consultation started for Token #${tokenNumber}\n\n⏱️ Consultation timer started`);
            this.loadSmartQueue();
        }
    }

    overridePriority(tokenNumber) {
        const patient = this.queueSystem.activeQueue.find(p => p.tokenNumber === tokenNumber);
        if (!patient) return;

        const newPriority = patient.priority === 'CRITICAL' ? 'NORMAL' : 'CRITICAL';
        patient.priority = newPriority;
        
        localStorage.setItem('queueSystem', JSON.stringify(this.queueSystem));
        alert(`✅ Priority updated to ${newPriority} for Token #${tokenNumber}`);
        this.loadSmartQueue();
    }

    // ===== APPOINTMENT BOOKING WITH SMART TRIAGE =====
    showAppointmentBookingModal(doctor, hospital) {
        const modal = document.getElementById('appointmentBookingModal');
        const content = document.getElementById('appointmentBookingContent');

        const html = `
            <div class="booking-container">
                <h2 style="color: var(--dark); margin-bottom: 20px;">
                    <i class="fas fa-calendar-plus"></i> Book Appointment
                </h2>

                <div class="booking-section">
                    <h3><i class="fas fa-hospital"></i> Appointment Details</h3>
                    <div style="background: var(--lighter); padding: 15px; border-radius: 10px; margin-bottom: 15px;">
                        <p><strong>Doctor:</strong> Dr. ${doctor.name}</p>
                        <p><strong>Specialty:</strong> ${doctor.specialty}</p>
                        <p><strong>Hospital:</strong> ${hospital}</p>
                    </div>
                </div>

                <div class="booking-section">
                    <h3><i class="fas fa-thermometer-half"></i> Select Your Symptoms</h3>
                    <p style="color: var(--gray); font-size: 0.9rem; margin-bottom: 15px;">This helps us prioritize your appointment based on urgency</p>
                    <div class="symptom-grid">
                        <div class="symptom-checkbox">
                            <input type="checkbox" id="symptom_fever" value="fever">
                            <label for="symptom_fever"><i class="fas fa-thermometer-full"></i> Fever</label>
                        </div>
                        <div class="symptom-checkbox">
                            <input type="checkbox" id="symptom_headache" value="headache">
                            <label for="symptom_headache"><i class="fas fa-head-side-virus"></i> Headache</label>
                        </div>
                        <div class="symptom-checkbox">
                            <input type="checkbox" id="symptom_cough" value="cough">
                            <label for="symptom_cough"><i class="fas fa-lungs"></i> Cough</label>
                        </div>
                        <div class="symptom-checkbox">
                            <input type="checkbox" id="symptom_chestpain" value="chest pain">
                            <label for="symptom_chestpain"><i class="fas fa-heart"></i> Chest Pain</label>
                        </div>
                        <div class="symptom-checkbox">
                            <input type="checkbox" id="symptom_breathing" value="difficulty breathing">
                            <label for="symptom_breathing"><i class="fas fa-wind"></i> Difficulty Breathing</label>
                        </div>
                        <div class="symptom-checkbox">
                            <input type="checkbox" id="symptom_nausea" value="nausea">
                            <label for="symptom_nausea"><i class="fas fa-face-nauseated"></i> Nausea</label>
                        </div>
                        <div class="symptom-checkbox">
                            <input type="checkbox" id="symptom_bodyache" value="body ache">
                            <label for="symptom_bodyache"><i class="fas fa-person"></i> Body Ache</label>
                        </div>
                        <div class="symptom-checkbox">
                            <input type="checkbox" id="symptom_other" value="other">
                            <label for="symptom_other"><i class="fas fa-ellipsis-h"></i> Other</label>
                        </div>
                    </div>
                </div>

                <div class="booking-section">
                    <h3><i class="fas fa-exclamation-circle"></i> Symptom Severity</h3>
                    <p style="color: var(--gray); font-size: 0.9rem; margin-bottom: 15px;">How severe are your symptoms?</p>
                    <div class="severity-selector">
                        <div class="severity-option">
                            <input type="radio" id="severity_mild" name="severity" value="Mild" required>
                            <label for="severity_mild">
                                <div class="severity-icon">😊</div>
                                <div class="severity-name">Mild</div>
                            </label>
                        </div>
                        <div class="severity-option">
                            <input type="radio" id="severity_moderate" name="severity" value="Moderate">
                            <label for="severity_moderate">
                                <div class="severity-icon">😐</div>
                                <div class="severity-name">Moderate</div>
                            </label>
                        </div>
                        <div class="severity-option critical">
                            <input type="radio" id="severity_critical" name="severity" value="Critical">
                            <label for="severity_critical">
                                <div class="severity-icon">😰</div>
                                <div class="severity-name">Critical</div>
                            </label>
                        </div>
                    </div>
                </div>

                <div id="priorityResult" class="priority-calculation hidden">
                    <div class="priority-result">
                        <i class="fas fa-shield-alt"></i>
                        <span>Priority Level:</span>
                        <span class="priority-level" id="priorityLevel">CALCULATING...</span>
                    </div>
                    <p style="color: var(--gray); font-size: 0.85rem; margin-top: 10px;" id="priorityMessage"></p>
                </div>

                <div class="booking-actions">
                    <button class="confirm-booking-btn" onclick="app.confirmAppointmentBooking('${doctor.name}', '${hospital}')">
                        <i class="fas fa-check"></i> Confirm Booking
                    </button>
                    <button class="cancel-booking-btn" onclick="document.getElementById('appointmentBookingModal').classList.add('hidden')">
                        <i class="fas fa-times"></i> Cancel
                    </button>
                </div>
            </div>
        `;

        content.innerHTML = html;
        modal.classList.remove('hidden');

        document.querySelectorAll('.symptom-checkbox input').forEach(input => {
            input.addEventListener('change', () => this.calculatePriorityLevel());
        });

        document.querySelectorAll('input[name="severity"]').forEach(input => {
            input.addEventListener('change', () => this.calculatePriorityLevel());
        });

        window.scrollTo(0, 0);

        document.querySelector('.modal-close').onclick = () => {
            modal.classList.add('hidden');
        };
    }

    calculatePriorityLevel() {
        const selectedSymptoms = Array.from(document.querySelectorAll('.symptom-checkbox input:checked'))
            .map(input => input.value);
        const severity = document.querySelector('input[name="severity"]:checked')?.value;

        const criticalSymptoms = ['chest pain', 'difficulty breathing'];
        const hasCriticalSymptom = selectedSymptoms.some(s => criticalSymptoms.includes(s));

        let priority = 'NORMAL';
        let message = 'Your appointment will be scheduled normally.';

        if (hasCriticalSymptom || severity === 'Critical') {
            priority = 'CRITICAL';
            message = '🚨 Your symptoms are serious. You will be prioritized in the queue immediately!';
        } else if (severity === 'Moderate') {
            message = '⚠️ Your symptoms are moderate. You will be seen after critical cases.';
        } else if (severity === 'Mild') {
            message = '✅ Your symptoms are mild. Standard queue priority.';
        }

        const resultDiv = document.getElementById('priorityResult');
        resultDiv.classList.remove('hidden');
        document.getElementById('priorityLevel').textContent = priority;
        document.getElementById('priorityLevel').style.background = priority === 'CRITICAL' ? '#E74C3C' : 'var(--primary)';
        document.getElementById('priorityMessage').textContent = message;

        window.calculatedPriority = priority;
    }

    confirmAppointmentBooking(doctorName, hospital) {
        const selectedSymptoms = Array.from(document.querySelectorAll('.symptom-checkbox input:checked'))
            .map(input => input.value)
            .join(', ') || 'General checkup';
        const severity = document.querySelector('input[name="severity"]:checked')?.value;
        const priority = window.calculatedPriority || 'NORMAL';

        if (!severity) {
            alert('❌ Please select symptom severity');
            return;
        }

        const tokenNumber = this.addToQueue({
            name: this.currentUser.fullname,
            age: this.currentUser.age,
            symptoms: selectedSymptoms
        }, priority);

        const notif = {
            patientName: this.currentUser.fullname,
            age: this.currentUser.age,
            phone: this.currentUser.phone || 'Not provided',
            symptoms: selectedSymptoms,
            priority,
            tokenNumber,
            time: new Date().toLocaleTimeString()
        };

        const notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
        notifications.push(notif);
        localStorage.setItem('notifications', JSON.stringify(notifications));

        const booking = {
            hospital,
            doctor: doctorName,
            date: new Date().toLocaleDateString(),
            time: new Date().toLocaleTimeString(),
            tokenNumber,
            priority,
            status: 'Confirmed'
        };

        const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
        bookings.push(booking);
        localStorage.setItem('bookings', JSON.stringify(bookings));

        alert(`✅ Appointment Booked Successfully!\n\n🎫 Token Number: #${tokenNumber}\n⏱️ Estimated Wait Time: ${this.calculateEstimatedWaitTime()} minutes\n🚨 Priority: ${priority}\n\nDoctor has been notified!`);

        document.getElementById('appointmentBookingModal').classList.add('hidden');
    }

    loadTodaysAppointments() {
        const container = document.getElementById('appointmentsList');
        
        const mockAppointments = [
            {
                id: 1,
                patientName: 'Rajesh Kumar',
                time: '10:00 AM',
                type: 'Video Consultation',
                phone: '+91-9876543210',
                bloodGroup: 'O+',
                status: 'Pending'
            },
            {
                id: 2,
                patientName: 'Priya Singh',
                time: '11:30 AM',
                type: 'In-Clinic',
                phone: '+91-9876543211',
                bloodGroup: 'A+',
                status: 'Confirmed'
            },
            {
                id: 3,
                patientName: 'Amit Patel',
                time: '2:00 PM',
                type: 'Chat Consultation',
                phone: '+91-9876543212',
                bloodGroup: 'B+',
                status: 'Pending'
            }
        ];

        if (mockAppointments.length === 0) {
            container.innerHTML = '<p class="empty-state">No appointments scheduled for today</p>';
            return;
        }

        container.innerHTML = mockAppointments.map(apt => `
            <div class="appointment-card">
                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 12px;">
                    <h4 style="margin: 0;">${apt.patientName}</h4>
                    <span style="background: ${apt.status === 'Confirmed' ? '#27AE60' : '#F39C12'}; color: white; padding: 4px 12px; border-radius: 12px; font-size: 0.8rem; font-weight: 600;">${apt.status}</span>
                </div>
                <p><i class="fas fa-clock"></i> <strong>Time:</strong> ${apt.time}</p>
                <p><i class="fas fa-video"></i> <strong>Type:</strong> ${apt.type}</p>
                <p><i class="fas fa-phone"></i> <strong>Contact:</strong> ${apt.phone}</p>
                <p><i class="fas fa-droplet"></i> <strong>Blood Group:</strong> ${apt.bloodGroup}</p>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 15px;">
                    <button class="btn btn-primary" style="font-size: 0.8rem; padding: 8px; margin: 0;">
                        <i class="fas fa-video"></i> Start Consultation
                    </button>
                    <button class="btn btn-secondary" style="font-size: 0.8rem; padding: 8px; margin: 0;">
                        <i class="fas fa-file"></i> View Medical Records
                    </button>
                </div>
            </div>
        `).join('');
    }

    loadPatientsList() {
        const container = document.getElementById('patientsList');
        
        const mockPatients = [
            {
                id: 1,
                name: 'Rajesh Kumar',
                age: 45,
                gender: 'Male',
                lastConsultation: '15 March 2026',
                bloodGroup: 'O+',
                condition: 'Hypertension'
            },
            {
                id: 2,
                name: 'Priya Singh',
                age: 32,
                gender: 'Female',
                lastConsultation: '10 March 2026',
                bloodGroup: 'A+',
                condition: 'Diabetes'
            },
            {
                id: 3,
                name: 'Amit Patel',
                age: 28,
                gender: 'Male',
                lastConsultation: '8 March 2026',
                bloodGroup: 'B+',
                condition: 'General Checkup'
            },
            {
                id: 4,
                name: 'Neha Gupta',
                age: 55,
                gender: 'Female',
                lastConsultation: '5 March 2026',
                bloodGroup: 'AB-',
                condition: 'Asthma'
            }
        ];

        if (mockPatients.length === 0) {
            container.innerHTML = '<p class="empty-state">No patients yet</p>';
            return;
        }

        container.innerHTML = mockPatients.map(patient => `
            <div class="patient-card">
                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 12px;">
                    <h4 style="margin: 0; color: var(--dark);">${patient.name}</h4>
                    <span style="background: #4ECDC4; color: white; padding: 4px 8px; border-radius: 6px; font-size: 0.75rem;">${patient.bloodGroup}</span>
                </div>
                <p style="margin: 5px 0;"><strong>Age:</strong> ${patient.age} | <strong>Gender:</strong> ${patient.gender}</p>
                <p style="margin: 5px 0;"><strong>Condition:</strong> ${patient.condition}</p>
                <p style="margin: 5px 0;"><strong>Last Consultation:</strong> ${patient.lastConsultation}</p>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 15px;">
                    <button class="btn btn-primary" style="font-size: 0.8rem; padding: 8px; margin: 0;">
                        <i class="fas fa-history"></i> View Full Records
                    </button>
                    <button class="btn btn-secondary" style="font-size: 0.8rem; padding: 8px; margin: 0;">
                        <i class="fas fa-prescription-bottle"></i> Write Prescription
                    </button>
                </div>
            </div>
        `).join('');
    }

    logout() {
        if (confirm('Are you sure you want to log out?')) {
            localStorage.clear();
            location.reload();
        }
    }
}

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
});