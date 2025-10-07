// This variable will hold the details of the currently logged-in user.
let currentUser = null;

// This object holds all the sample data for the application.
const mockData = {
    inventory: [
        { group: 'A+', units: 35, status: 'available' }, { group: 'A-', units: 12, status: 'low' },
        { group: 'B+', units: 28, status: 'available' }, { group: 'B-', units: 8, status: 'low' },
        { group: 'AB+', units: 15, status: 'available' }, { group: 'AB-', units: 4, status: 'critical' },
        { group: 'O+', units: 45, status: 'available' }, { group: 'O-', units: 22, status: 'available' },
    ],
    donors: [
        { id: 1, name: 'Atharv Gaikwad', email: 'atharv@email.com', group: 'A+', phone: '123-456-7890', lastDonation: '2025-07-15', totalDonations: 5 },
        { id: 2, name: 'Shreyash Shendage', email: 'shreyash.s@example.com', group: 'O-', phone: '987-654-3210', lastDonation: '2025-08-02', totalDonations: 8 },
        { id: 3, name: 'Dharam Pote', email: 'dharam.p@example.com', group: 'B+', phone: '555-123-4567', lastDonation: '2025-06-20', totalDonations: 3 },
        { id: 4, name: 'Om Shinde', email: 'om.s@example.com', group: 'AB+', phone: '555-987-6543', lastDonation: '2025-09-01', totalDonations: 12 },
    ],
    patients: [
         { id: 1, name: 'Shubham Hole', email: 'shubham@email.com', group: 'A-', phone: '876-543-2109' },
         { id: 2, name: 'Yshodeep Khatate', email: 'yshodeep.k@example.com', group: 'O+', phone: '765-432-1098' },
         { id: 3, name: 'Mangesh Darekar', email: 'mangesh.d@example.com', group: 'B-', phone: '654-321-0987' },
    ],
    requests: [
        { id: 1, patient: 'Shubham Hole', group: 'A-', units: 2, date: '2025-09-25', status: 'pending' },
        { id: 2, patient: 'Yshodeep Khatate', group: 'O+', units: 4, date: '2025-09-24', status: 'approved' },
        { id: 3, patient: 'Mangesh Darekar', group: 'B-', units: 1, date: '2025-09-22', status: 'rejected' },
    ],
    campaigns: [
        { id: 1, name: 'City Hall Blood Drive', location: 'Downtown Plaza', date: '2025-10-15', status: 'Upcoming', unitsCollected: 0 },
        { id: 2, name: 'Community Center Camp', location: 'Greenwood Park', date: '2025-08-10', status: 'Completed', unitsCollected: 52 },
    ],
    appointments: [
        { id: 1, date: '2025-10-02', location: 'Downtown Plaza', status: 'Confirmed', donor: 'atharv@email.com' },
    ],
    donationHistory: [
        { date: '2025-07-15', location: 'Central Hospital', units: 1, donor: 'atharv@email.com' },
        { date: '2025-08-02', location: 'Greenwood Park', units: 1, donor: 'shreyash.s@example.com' },
        { date: '2025-06-20', location: 'Central Hospital', units: 1, donor: 'dharam.p@example.com' },
        { date: '2025-09-01', location: 'Downtown Plaza', units: 1, donor: 'om.s@example.com' },
    ],
    trends: [
        { month: 'Mar', donations: 80, usage: 40 }, { month: 'Apr', donations: 81, usage: 19 },
        { month: 'May', donations: 56, usage: 86 }, { month: 'Jun', donations: 55, usage: 27 },
        { month: 'Jul', donations: 40, usage: 90 },
    ]
};

// --- AUTHENTICATION & PAGE ROUTING ---

function checkAuth(requiredRole) {
    const userStr = sessionStorage.getItem('currentUser');
    if (!userStr) {
        window.location.href = 'index.html'; // Redirect if not logged in
        return;
    }
    currentUser = JSON.parse(userStr);
    if (currentUser.role !== requiredRole) {
        alert('Access Denied!');
        logout();
    }
}

function initializeUsers() {
    if (!localStorage.getItem('users')) {
        const defaultUsers = [
            { email: 'admin@lifecare.com', password: 'password', role: 'admin', name: 'Admin', bloodBankName: 'Life Care Central' },
            { email: 'atharv@email.com', password: 'password', role: 'donor', name: 'Atharv Gaikwad', bloodGroup: 'A+'},
            { email: 'shubham@email.com', password: 'password', role: 'patient', name: 'Shubham Hole', bloodGroup: 'A-'},
        ];
        localStorage.setItem('users', JSON.stringify(defaultUsers));
    }
}

function handleLogin(role, form) {
    const email = form.querySelector('input[type="email"]').value;
    const password = form.querySelector('input[type="password"]').value;
    const errorEl = form.closest('.form-box').querySelector('.form-error');
    if(errorEl) errorEl.textContent = '';

    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(u => u.email === email && u.role === role);

    if (user && user.password === password) {
        sessionStorage.setItem('currentUser', JSON.stringify(user));
        window.location.href = `${role}_dashboard.html`;
    } else {
        if(errorEl) errorEl.textContent = 'Invalid email or password.';
    }
}

function handleRegister(role, form) {
    const inputs = form.querySelectorAll('input, select');
    const errorEl = form.querySelector('.form-error');
    if (errorEl) errorEl.textContent = '';

    let newUser = { role };
    let password, confirmPassword;

    if (role === 'admin') {
        newUser.name = inputs[0].value;
        newUser.email = inputs[1].value;
        newUser.bloodBankName = inputs[2].value;
        password = inputs[3].value;
        confirmPassword = inputs[4].value;
    } else { // For donor and patient
        newUser.name = inputs[0].value;
        newUser.email = inputs[1].value;
        newUser.bloodGroup = inputs[2].value;
        password = inputs[3].value;
        confirmPassword = inputs[4].value;
    }

    if (password !== confirmPassword) {
        if (errorEl) errorEl.textContent = 'Passwords do not match.';
        return;
    }
    newUser.password = password;

    let users = JSON.parse(localStorage.getItem('users')) || [];
    if (users.find(u => u.email === newUser.email)) {
        if (errorEl) errorEl.textContent = 'An account with this email already exists.';
        return;
    }

    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    
    alert('Registration Successful! You can now log in.');
    toggleRegister(false); // Switch back to login view
}

function logout() {
    sessionStorage.removeItem('currentUser');
    window.location.href = 'index.html';
}

// --- LOGIN PAGE UI FUNCTIONS ---

function toggleRegister(showRegister) {
    const loginForm = document.querySelector('.login-form');
    const registerForm = document.querySelector('.register-form');
    
    if (showRegister) {
        loginForm.style.display = 'none';
        registerForm.style.display = 'block';
    } else {
        loginForm.style.display = 'block';
        registerForm.style.display = 'none';
    }
}

// --- ADMIN DASHBOARD UI FUNCTIONS ---

function showAdminSection(sectionId) {
    document.querySelectorAll('.admin-section').forEach(section => section.classList.remove('active'));
    document.getElementById(sectionId).classList.add('active');
    document.querySelectorAll('.admin-nav-link').forEach(nav => nav.classList.remove('active'));
    document.querySelector(`.admin-nav-link[onclick="showAdminSection('${sectionId}')"]`).classList.add('active');
    const sidebar = document.getElementById('admin-sidebar');
    if (window.innerWidth < 768 && sidebar) sidebar.classList.remove('open');
}

function showModal() {
    document.getElementById('main-modal').classList.add('visible');
}

function hideModal() {
    document.getElementById('main-modal').classList.remove('visible');
}

// --- DATA RENDERING & TABLE CREATION ---

function createTable(data, headers) {
    let table = '<table><thead><tr>';
    headers.forEach(h => table += `<th>${h.label}</th>`);
    table += '</tr></thead><tbody>';
    if (data.length === 0) {
        table += `<tr><td colspan="${headers.length}" style="text-align:center; padding:1.5rem;">No data available.</td></tr>`;
    } else {
        data.forEach(row => {
            table += '<tr>';
            headers.forEach(h => {
                let value = row[h.key];
                if (h.render) value = h.render(row);
                table += `<td>${value || ''}</td>`;
            });
            table += '</tr>';
        });
    }
    table += '</tbody></table>';
    return table;
}

function renderAdminDashboard() {
    // KPI Cards
    const totalUnits = mockData.inventory.reduce((sum, item) => sum + item.units, 0);
    const pendingRequests = mockData.requests.filter(r => r.status === 'pending').length;
    document.getElementById('admin-kpi-cards').innerHTML = `<div class="card kpi-card"><div class="card-body"><h3>Total Units</h3><p>${totalUnits}</p></div></div><div class="card kpi-card"><div class="card-body"><h3>Pending Requests</h3><p>${pendingRequests}</p></div></div><div class="card kpi-card"><div class="card-body"><h3>Registered Donors</h3><p>${mockData.donors.length}</p></div></div><div class="card kpi-card"><div class="card-body"><h3>Campaigns</h3><p>${mockData.campaigns.length}</p></div></div>`;
    
    // Main Dashboard Tables
    const inventoryHeaders = [{ key: 'group', label: 'Blood Group' }, { key: 'units', label: 'Units' }, { key: 'status', label: 'Status', render: (row) => `<span class="status-badge status-${row.status}">${row.status}</span>` }];
    document.getElementById('dashboard-inventory-table').innerHTML = createTable(mockData.inventory, inventoryHeaders);
    const trendsHeaders = [{ key: 'month', label: 'Month' }, { key: 'donations', label: 'Donations (Units)' }, { key: 'usage', label: 'Usage (Units)' }];
    document.getElementById('dashboard-trends-table').innerHTML = createTable(mockData.trends, trendsHeaders);

    // Inventory Page Table
    document.getElementById('admin-inventory-table').innerHTML = createTable(mockData.inventory, inventoryHeaders);
    
    // Requests Page Table
    const requestHeaders = [{ key: 'patient', label: 'Patient' }, { key: 'group', label: 'Blood Group' }, { key: 'units', label: 'Units' }, { key: 'date', label: 'Date' }, { key: 'status', label: 'Status', render: (row) => `<span class="status-badge status-${row.status}">${row.status}</span>` }, { key: 'actions', label: 'Actions', render: (row) => row.status === 'pending' ? `<div style="display:flex; gap:0.5rem;"><button class="action-btn approve" onclick="handleRequestAction(${row.id}, 'approved')">Approve</button><button class="action-btn reject" onclick="handleRequestAction(${row.id}, 'rejected')">Reject</button></div>` : 'N/A' }];
    document.getElementById('admin-requests-table').innerHTML = createTable(mockData.requests, requestHeaders);
    
    // Management Page Tables
    const patientInfoHeaders = [{ key: 'name', label: 'Name' }, { key: 'email', label: 'Email' }, { key: 'group', label: 'Blood Group' }, { key: 'phone', label: 'Contact' }];
    document.getElementById('admin-patients-info-table').innerHTML = createTable(mockData.patients, patientInfoHeaders);
    const donorInfoHeaders = [{ key: 'name', label: 'Name' }, { key: 'email', label: 'Email' }, { key: 'group', label: 'Blood Group' }, { key: 'phone', label: 'Contact' }];
    document.getElementById('admin-donors-info-table').innerHTML = createTable(mockData.donors, donorInfoHeaders);
    const donorHistoryHeaders = [{ key: 'name', label: 'Donor Name' }, { key: 'group', label: 'Blood Group' }, { key: 'lastDonation', label: 'Last Donation' }, { key: 'totalDonations', label: 'Total Donations' }];
    document.getElementById('admin-donors-history-table').innerHTML = createTable(mockData.donors, donorHistoryHeaders);
    
    // Campaigns Page Table
    const campaignHeaders = [{ key: 'name', label: 'Name' }, { key: 'location', label: 'Location' }, { key: 'date', label: 'Date' }, { key: 'status', label: 'Status', render: (row) => `<span class="status-badge status-${row.status.toLowerCase()}">${row.status}</span>` }];
    document.getElementById('admin-campaigns-table').innerHTML = createTable(mockData.campaigns, campaignHeaders);

    // Reports Page Tables
    const donationLogData = mockData.donationHistory.map(log => {
        const donor = mockData.donors.find(d => d.email === log.donor);
        return {
            ...log,
            donorName: donor ? donor.name : 'Unknown'
        };
    });
    const donationLogHeaders = [{ key: 'donorName', label: 'Donor Name'}, { key: 'date', label: 'Date'}, { key: 'location', label: 'Location'}, { key: 'units', label: 'Units Donated'}];
    document.getElementById('report-donation-log-table').innerHTML = createTable(donationLogData, donationLogHeaders);

    const campaignSummaryHeaders = [{ key: 'name', label: 'Campaign Name'}, { key: 'date', label: 'Date'}, { key: 'status', label: 'Status'}, { key: 'unitsCollected', label: 'Units Collected'}];
    document.getElementById('report-campaign-summary-table').innerHTML = createTable(mockData.campaigns, campaignSummaryHeaders);
}

function renderPatientDashboard() {
    document.getElementById('patient-welcome-message').textContent = `Welcome, ${currentUser.name}!`;
    const inventoryHeaders = [{ key: 'group', label: 'Blood Group' }, { key: 'status', label: 'Availability', render: (row) => `<span class="status-badge status-${row.status}">${row.status}</span>` }];
    document.getElementById('patient-inventory-table').innerHTML = createTable(mockData.inventory, inventoryHeaders);
    const requestHeaders = [{ key: 'date', label: 'Date' }, { key: 'group', label: 'Blood Group' }, { key: 'units', label: 'Units' }, { key: 'status', label: 'Status', render: (row) => `<span class="status-badge status-${row.status}">${row.status}</span>` }];
    const myRequests = mockData.requests.filter(r => r.patient === currentUser.name);
    document.getElementById('patient-requests-table').innerHTML = createTable(myRequests, requestHeaders);
}

function renderDonorDashboard() {
    document.getElementById('donor-welcome-message').textContent = `Welcome, ${currentUser.name}!`;
    document.getElementById('donor-health-info').innerHTML = `<div><strong>Blood Type:</strong> <span style="color:var(--primary-color); font-weight:700;">${currentUser.bloodGroup}</span></div><div><strong>Last Iron Level:</strong> 14.2 g/dL</div><div><strong>Last Blood Pressure:</strong> 120/80 mmHg</div>`;
    const historyHeaders = [{ key: 'date', label: 'Date' }, { key: 'location', label: 'Location' }, { key: 'units', label: 'Units Donated' }];
    const myHistory = mockData.donationHistory.filter(h => h.donor === currentUser.email);
    document.getElementById('donor-history-table').innerHTML = createTable(myHistory, historyHeaders);
    const campaignHeaders = [{ key: 'name', label: 'Campaign' }, { key: 'location', label: 'Location' }, {key: 'date', label: 'Date'}];
    document.getElementById('donor-campaigns-table').innerHTML = createTable(mockData.campaigns.filter(c => c.status === 'Upcoming'), campaignHeaders);
    const appointmentHeaders = [{ key: 'date', label: 'Date' }, { key: 'location', label: 'Location' }, {key: 'status', label: 'Status', render: (row) => `<span class="status-badge status-approved">${row.status}</span>`}];
    const myAppointments = mockData.appointments.filter(a => a.donor === currentUser.email);
    document.getElementById('donor-appointments-table').innerHTML = createTable(myAppointments, appointmentHeaders);
}

// --- DYNAMIC ACTIONS & FORM HANDLING ---

function handleRequestAction(requestId, newStatus) {
    const request = mockData.requests.find(r => r.id === requestId);
    if (request) { request.status = newStatus; renderAdminDashboard(); }
}

function handleAddCampaign(event) {
    event.preventDefault();
    const form = event.target;
    const newCampaign = { id: mockData.campaigns.length + 1, name: form.name.value, location: form.location.value, date: form.date.value, status: 'Upcoming', unitsCollected: 0 };
    mockData.campaigns.push(newCampaign);
    form.reset();
    hideModal();
    renderAdminDashboard();
}

function handleAddDonor(event) {
    event.preventDefault();
    const form = event.target;

    // Check if a donor with the same email already exists to prevent duplicates.
    if (mockData.donors.some(d => d.email === form.email.value)) {
        alert('A donor with this email already exists.');
        return;
    }

    const newDonor = {
        id: mockData.donors.length + 1,
        name: form.name.value,
        email: form.email.value,
        group: form.group.value,
        phone: form.phone.value,
        lastDonation: form.lastDonation.value,
        totalDonations: parseInt(form.totalDonations.value, 10)
    };
    mockData.donors.push(newDonor);

    // Also create a corresponding record in the donation history log.
    mockData.donationHistory.push({
        date: form.lastDonation.value,
        location: 'Admin Manual Entry',
        units: parseInt(form.totalDonations.value, 10),
        donor: form.email.value
    });

    form.reset();
    renderAdminDashboard(); // Re-render all admin tables to reflect the new data.
    alert('New donor added successfully!');
}

function handlePatientRequest(event) {
    event.preventDefault();
    if(!currentUser) return;
    const form = event.target;
    const newRequest = { id: mockData.requests.length + 1, patient: currentUser.name, group: form.group.value, units: parseInt(form.units.value), date: new Date().toISOString().split('T')[0], status: 'pending' };
    mockData.requests.push(newRequest);
    form.reset();
    renderPatientDashboard();
    alert('Your blood request has been submitted.');
}

function handleAppointmentSubmit(event) {
    event.preventDefault();
    if(!currentUser) return;
    const form = event.target;
    const newAppointment = { id: mockData.appointments.length + 1, date: form.date.value, location: form.location.value, status: 'Confirmed', donor: currentUser.email };
    mockData.appointments.push(newAppointment);
    form.reset();
    renderDonorDashboard();
    alert('Your donation appointment has been confirmed.');
}

// --- EVENT LISTENERS & INITIALIZATION ---

document.addEventListener('DOMContentLoaded', () => {
    // Determine the current page type
    const isDashboard = document.body.id.includes('_dashboard');
    const isLoginPage = window.location.pathname.includes('_login.html');

    if (isDashboard) {
        const role = document.body.id.split('_')[0]; // e.g., 'admin' from 'admin_dashboard'
        checkAuth(role);
        if (role === 'admin') {
            renderAdminDashboard();
            showAdminSection('admin-dashboard-main');
            document.getElementById('admin-menu-btn').addEventListener('click', () => {
                document.getElementById('admin-sidebar').classList.toggle('open');
            });
        } else if (role === 'patient') {
            renderPatientDashboard();
        } else if (role === 'donor') {
            renderDonorDashboard();
        }
    } else if (isLoginPage) {
        initializeUsers();
    } else { // For index.html
        initializeUsers();
    }
});
