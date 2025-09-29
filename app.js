// Application Data from provided JSON
const appData = {
    owner: {
        name: "Saify Ahmed",
        phone: "+91 98765 43210",
        upiId: "saify.tt@paytm",
        businessName: "Saify TT House"
    },
    table: {
        id: 1,
        name: "Table Tennis Table",
        hourlyRate: 50
    },
    timeSlots: [
        "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00", "21:00"
    ],
    durations: [
        {value: 1, label: "1 Hour", multiplier: 1},
        {value: 2, label: "2 Hours", multiplier: 2},
        {value: 3, label: "3 Hours", multiplier: 3},
        {value: 4, label: "4 Hours", multiplier: 4}
    ],
    paymentMethods: [
        {value: "cash", label: "Cash Payment", icon: "💵", description: "Pay cash at the facility"},
        {value: "upi", label: "UPI Payment", icon: "📱", description: "Scan QR code to pay instantly"}
    ],
    cancellationPolicy: {
        freeUntil: 2,
        partialRefund: 0.5,
        noRefund: 0
    },
    ownerPassword: "owner123"
};

// Sample bookings data
const sampleBookings = [
    {
        id: "STT001",
        date: "2025-09-30",
        time: "10:00",
        duration: 2,
        customerName: "Rahul Kumar",
        phone: "9876543210",
        amount: 100,
        paymentMethod: "upi",
        paymentStatus: "paid",
        bookingStatus: "active",
        bookingTime: "2025-09-30T08:00:00"
    },
    {
        id: "STT002",
        date: "2025-09-30",
        time: "14:00",
        duration: 1,
        customerName: "Priya Singh",
        phone: "9988776655",
        amount: 50,
        paymentMethod: "cash",
        paymentStatus: "paid",
        bookingStatus: "active",
        bookingTime: "2025-09-30T09:00:00"
    },
    {
        id: "STT003",
        date: "2025-09-30",
        time: "16:00",
        duration: 3,
        customerName: "Amit Sharma",
        phone: "9988776655",
        amount: 150,
        paymentMethod: "upi",
        paymentStatus: "paid",
        bookingStatus: "cancelled",
        bookingTime: "2025-09-30T10:00:00",
        cancellationTime: "2025-09-30T11:00:00",
        refundAmount: 150,
        cancellationReason: "Emergency came up"
    },
    {
        id: "STT004",
        date: "2025-10-01",
        time: "11:00",
        duration: 2,
        customerName: "Sneha Patel",
        phone: "9876543210",
        amount: 100,
        paymentMethod: "cash",
        paymentStatus: "paid",
        bookingStatus: "active",
        bookingTime: "2025-09-30T14:00:00"
    }
];

// Global state
let bookings = [...sampleBookings];
let currentBookingId = 5;
let currentBookingData = null;
let isOwnerLoggedIn = false;
let selectedBookingForCancellation = null;

// Screen Navigation Functions - Fixed
function showWelcomeScreen() {
    hideAllScreens();
    const welcomeScreen = document.getElementById('welcome-screen');
    if (welcomeScreen) {
        welcomeScreen.classList.add('active');
    }
    isOwnerLoggedIn = false;
    // Clear any forms when returning to welcome
    clearAllForms();
}

function showBookingScreen() {
    hideAllScreens();
    const bookingScreen = document.getElementById('booking-screen');
    if (bookingScreen) {
        bookingScreen.classList.add('active');
    }
    initializeBookingForm();
}

function showCancellationScreen() {
    hideAllScreens();
    const cancellationScreen = document.getElementById('cancellation-screen');
    if (cancellationScreen) {
        cancellationScreen.classList.add('active');
    }
    clearCancellationSearch();
}

function showDashboardLogin() {
    hideAllScreens();
    const dashboardLoginScreen = document.getElementById('dashboard-login-screen');
    if (dashboardLoginScreen) {
        dashboardLoginScreen.classList.add('active');
    }
    const passwordField = document.getElementById('owner-password');
    if (passwordField) {
        passwordField.value = '';
    }
}

function showDashboard() {
    if (!isOwnerLoggedIn) {
        showDashboardLogin();
        return;
    }
    hideAllScreens();
    const dashboardScreen = document.getElementById('dashboard-screen');
    if (dashboardScreen) {
        dashboardScreen.classList.add('active');
    }
    updateDashboardStats();
    displayDashboardBookings();
}

function hideAllScreens() {
    const screens = document.querySelectorAll('.screen');
    screens.forEach(screen => {
        if (screen) {
            screen.classList.remove('active');
        }
    });
}

function clearAllForms() {
    // Clear booking form
    const bookingForm = document.getElementById('booking-form');
    if (bookingForm) {
        bookingForm.reset();
    }
    
    // Clear cancellation search
    clearCancellationSearch();
    
    // Clear login form
    const passwordField = document.getElementById('owner-password');
    if (passwordField) {
        passwordField.value = '';
    }
}

// Initialize Application
function initializeApp() {
    // Set minimum date to today
    const bookingDateField = document.getElementById('booking-date');
    if (bookingDateField) {
        const today = new Date().toISOString().split('T')[0];
        bookingDateField.setAttribute('min', today);
        bookingDateField.value = today;
    }
    
    // Populate form options
    populateTimeSlots();
    populateDurations();
    
    // Add event listeners
    setupEventListeners();
    
    // Make navigation functions globally available
    window.showWelcomeScreen = showWelcomeScreen;
    window.showBookingScreen = showBookingScreen;
    window.showCancellationScreen = showCancellationScreen;
    window.showDashboardLogin = showDashboardLogin;
    window.showDashboard = showDashboard;
    
    // Make other functions globally available
    window.searchBookingForCancellation = searchBookingForCancellation;
    window.initiateCancellation = initiateCancellation;
    window.confirmCancellation = confirmCancellation;
    window.closeCancellationModal = closeCancellationModal;
    window.closePaymentModal = closePaymentModal;
    window.completeBooking = completeBooking;
    window.closeSuccessModal = closeSuccessModal;
    window.ownerCancelBooking = ownerCancelBooking;
    window.markBookingComplete = markBookingComplete;
}

function setupEventListeners() {
    // Booking form changes
    const bookingForm = document.getElementById('booking-form');
    if (bookingForm) {
        const formInputs = bookingForm.querySelectorAll('select, input');
        
        formInputs.forEach(input => {
            input.addEventListener('change', updateBookingSummary);
            input.addEventListener('input', updateBookingSummary);
        });
        
        bookingForm.addEventListener('submit', handleBookingSubmission);
    }
    
    // Login form
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleOwnerLogin);
    }
    
    // Dashboard filters
    const statusFilter = document.getElementById('status-filter');
    const dashboardSearch = document.getElementById('dashboard-search');
    
    if (statusFilter) {
        statusFilter.addEventListener('change', filterDashboardBookings);
    }
    
    if (dashboardSearch) {
        dashboardSearch.addEventListener('input', debounce(filterDashboardBookings, 300));
    }
}

// Populate Form Options
function populateTimeSlots() {
    const timeSelect = document.getElementById('booking-time');
    if (!timeSelect) return;
    
    timeSelect.innerHTML = '<option value="">Choose time...</option>';
    
    appData.timeSlots.forEach(time => {
        const option = document.createElement('option');
        option.value = time;
        option.textContent = time;
        timeSelect.appendChild(option);
    });
}

function populateDurations() {
    const durationSelect = document.getElementById('booking-duration');
    if (!durationSelect) return;
    
    durationSelect.innerHTML = '<option value="">Select duration...</option>';
    
    appData.durations.forEach(duration => {
        const option = document.createElement('option');
        option.value = duration.value;
        option.textContent = duration.label;
        option.dataset.multiplier = duration.multiplier;
        durationSelect.appendChild(option);
    });
}

// Booking Form Functions
function initializeBookingForm() {
    const bookingForm = document.getElementById('booking-form');
    if (bookingForm) {
        bookingForm.reset();
    }
    
    const bookingDateField = document.getElementById('booking-date');
    if (bookingDateField) {
        const today = new Date().toISOString().split('T')[0];
        bookingDateField.value = today;
    }
    
    updateBookingSummary();
}

function updateBookingSummary() {
    const dateField = document.getElementById('booking-date');
    const timeField = document.getElementById('booking-time');
    const durationField = document.getElementById('booking-duration');
    const playerNameField = document.getElementById('player-name');
    const paymentMethodField = document.getElementById('payment-method');
    const detailsContainer = document.getElementById('booking-details');
    const totalCostElement = document.getElementById('total-cost');
    
    if (!dateField || !timeField || !durationField || !detailsContainer || !totalCostElement) {
        return;
    }
    
    const date = dateField.value;
    const time = timeField.value;
    const durationValue = durationField.value;
    const playerName = playerNameField ? playerNameField.value : '';
    const paymentMethod = paymentMethodField ? paymentMethodField.value : '';
    
    detailsContainer.innerHTML = '';
    totalCostElement.textContent = '0';
    
    if (!date || !time || !durationValue) {
        return;
    }
    
    const duration = appData.durations.find(d => d.value == durationValue);
    const totalCost = appData.table.hourlyRate * duration.multiplier;
    
    const dateObj = new Date(date + 'T00:00:00');
    const formattedDate = dateObj.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    const details = [
        { label: 'Date', value: formattedDate },
        { label: 'Time', value: time },
        { label: 'Duration', value: duration.label },
        { label: 'Table', value: appData.table.name },
        { label: 'Rate', value: `₹${appData.table.hourlyRate}/hour` }
    ];
    
    if (playerName.trim()) {
        details.splice(4, 0, { label: 'Player', value: playerName.trim() });
    }
    
    if (paymentMethod) {
        const payment = appData.paymentMethods.find(p => p.value === paymentMethod);
        if (payment) {
            details.push({ label: 'Payment', value: payment.label });
        }
    }
    
    details.forEach(detail => {
        const detailItem = document.createElement('div');
        detailItem.className = 'booking-detail-item';
        detailItem.innerHTML = `
            <span class="booking-detail-label">${detail.label}:</span>
            <span class="booking-detail-value">${detail.value}</span>
        `;
        detailsContainer.appendChild(detailItem);
    });
    
    totalCostElement.textContent = totalCost.toString();
}

function handleBookingSubmission(event) {
    event.preventDefault();
    
    const bookingData = {
        id: `STT${String(currentBookingId).padStart(3, '0')}`,
        date: document.getElementById('booking-date').value,
        time: document.getElementById('booking-time').value,
        duration: parseInt(document.getElementById('booking-duration').value),
        customerName: document.getElementById('player-name').value.trim(),
        phone: document.getElementById('player-phone').value.trim(),
        paymentMethod: document.getElementById('payment-method').value,
        bookingStatus: 'active',
        bookingTime: new Date().toISOString(),
        paymentStatus: 'pending'
    };
    
    if (!validateBookingData(bookingData)) {
        return;
    }
    
    if (hasBookingConflict(bookingData)) {
        showMessage('This time slot is already booked. Please choose a different time.', 'error');
        return;
    }
    
    const duration = appData.durations.find(d => d.value === bookingData.duration);
    bookingData.amount = appData.table.hourlyRate * duration.multiplier;
    
    currentBookingData = bookingData;
    showPaymentModal(bookingData);
}

function validateBookingData(data) {
    const requiredFields = ['date', 'time', 'duration', 'customerName', 'phone', 'paymentMethod'];
    
    for (const field of requiredFields) {
        if (!data[field]) {
            showMessage('Please fill in all required fields.', 'error');
            return false;
        }
    }
    
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(data.phone)) {
        showMessage('Please enter a valid 10-digit phone number.', 'error');
        return false;
    }
    
    const selectedDate = new Date(data.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
        showMessage('Please select a future date.', 'error');
        return false;
    }
    
    return true;
}

function hasBookingConflict(newBooking) {
    return bookings.some(booking => 
        booking.date === newBooking.date &&
        booking.time === newBooking.time &&
        booking.bookingStatus === 'active'
    );
}

// Payment Modal Functions
function showPaymentModal(bookingData) {
    const modal = document.getElementById('payment-modal');
    const cashSection = document.getElementById('cash-payment');
    const upiSection = document.getElementById('upi-payment');
    
    if (!modal || !cashSection || !upiSection) return;
    
    // Update amounts
    const cashAmountElem = document.getElementById('cash-amount');
    const upiAmountElem = document.getElementById('upi-amount');
    const upiAmountTextElem = document.getElementById('upi-amount-text');
    
    if (cashAmountElem) cashAmountElem.textContent = bookingData.amount;
    if (upiAmountElem) upiAmountElem.textContent = bookingData.amount;
    if (upiAmountTextElem) upiAmountTextElem.textContent = bookingData.amount;
    
    // Show appropriate payment section
    if (bookingData.paymentMethod === 'cash') {
        cashSection.classList.remove('hidden');
        upiSection.classList.add('hidden');
    } else {
        cashSection.classList.add('hidden');
        upiSection.classList.remove('hidden');
    }
    
    // Show booking preview
    updateBookingConfirmationPreview(bookingData);
    
    modal.classList.remove('hidden');
}

function updateBookingConfirmationPreview(bookingData) {
    const preview = document.getElementById('booking-confirmation-preview');
    if (!preview) return;
    
    const duration = appData.durations.find(d => d.value === bookingData.duration);
    const payment = appData.paymentMethods.find(p => p.value === bookingData.paymentMethod);
    
    const dateObj = new Date(bookingData.date + 'T00:00:00');
    const formattedDate = dateObj.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric'
    });
    
    const items = [
        { label: 'Booking ID', value: bookingData.id },
        { label: 'Customer', value: bookingData.customerName },
        { label: 'Phone', value: bookingData.phone },
        { label: 'Date', value: formattedDate },
        { label: 'Time', value: bookingData.time },
        { label: 'Duration', value: duration.label },
        { label: 'Payment Method', value: payment.label },
        { label: 'Total Amount', value: `₹${bookingData.amount}` }
    ];
    
    preview.innerHTML = items.map(item => `
        <div class="confirmation-item">
            <span>${item.label}:</span>
            <strong>${item.value}</strong>
        </div>
    `).join('');
}

function closePaymentModal() {
    const modal = document.getElementById('payment-modal');
    if (modal) {
        modal.classList.add('hidden');
    }
    currentBookingData = null;
}

function completeBooking() {
    if (!currentBookingData) return;
    
    currentBookingData.paymentStatus = 'paid';
    bookings.push(currentBookingData);
    currentBookingId++;
    
    closePaymentModal();
    showSuccessModal('Booking Confirmed!', 
        `Your booking ${currentBookingData.id} has been confirmed successfully! Thank you for choosing ${appData.owner.businessName}.`,
        createBookingSuccessDetails(currentBookingData)
    );
    
    const bookingId = currentBookingData.id;
    currentBookingData = null;
    
    // Auto-redirect to welcome screen after success
    setTimeout(() => {
        closeSuccessModal();
        showWelcomeScreen();
    }, 4000);
}

function createBookingSuccessDetails(bookingData) {
    const duration = appData.durations.find(d => d.value === bookingData.duration);
    const dateObj = new Date(bookingData.date + 'T00:00:00');
    const formattedDate = dateObj.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric'
    });
    
    const items = [
        { label: 'Booking ID', value: bookingData.id },
        { label: 'Customer', value: bookingData.customerName },
        { label: 'Date & Time', value: `${formattedDate} at ${bookingData.time}` },
        { label: 'Duration', value: duration.label },
        { label: 'Amount Paid', value: `₹${bookingData.amount}` }
    ];
    
    return items.map(item => `
        <div class="success-item">
            <span>${item.label}:</span>
            <strong>${item.value}</strong>
        </div>
    `).join('');
}

// Cancellation Functions - Fixed
function clearCancellationSearch() {
    const bookingIdField = document.getElementById('search-booking-id');
    const phoneField = document.getElementById('search-phone');
    const resultsContainer = document.getElementById('booking-search-results');
    
    if (bookingIdField) bookingIdField.value = '';
    if (phoneField) phoneField.value = '';
    if (resultsContainer) resultsContainer.innerHTML = '';
    
    selectedBookingForCancellation = null;
}

function searchBookingForCancellation() {
    const bookingIdField = document.getElementById('search-booking-id');
    const phoneField = document.getElementById('search-phone');
    
    const bookingId = bookingIdField ? bookingIdField.value.trim().toUpperCase() : '';
    const phone = phoneField ? phoneField.value.trim() : '';
    
    if (!bookingId && !phone) {
        showMessage('Please enter either Booking ID or Phone Number.', 'error');
        return;
    }
    
    let foundBookings = [];
    
    if (bookingId) {
        foundBookings = bookings.filter(booking => 
            booking.id === bookingId && booking.bookingStatus === 'active'
        );
    } else if (phone) {
        foundBookings = bookings.filter(booking => 
            booking.phone === phone && booking.bookingStatus === 'active'
        );
    }
    
    displayBookingSearchResults(foundBookings);
}

function displayBookingSearchResults(foundBookings) {
    const resultsContainer = document.getElementById('booking-search-results');
    if (!resultsContainer) return;
    
    if (foundBookings.length === 0) {
        resultsContainer.innerHTML = `
            <div class="booking-found" style="text-align: center; background: var(--color-bg-4);">
                <h4 style="color: var(--color-error);">❌ No Active Bookings Found</h4>
                <p style="color: var(--color-text-secondary);">
                    Please check your Booking ID or Phone Number and try again.
                </p>
            </div>
        `;
        return;
    }
    
    resultsContainer.innerHTML = foundBookings.map(booking => {
        const duration = appData.durations.find(d => d.value === booking.duration);
        const dateObj = new Date(booking.date + 'T00:00:00');
        const formattedDate = dateObj.toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric'
        });
        
        return `
            <div class="booking-found fade-in">
                <h4>✅ Booking Found</h4>
                <div class="booking-info-grid">
                    <div class="info-item">
                        <div class="info-label">Booking ID</div>
                        <div class="info-value">${booking.id}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Customer Name</div>
                        <div class="info-value">${booking.customerName}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Phone Number</div>
                        <div class="info-value">${booking.phone}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Date & Time</div>
                        <div class="info-value">${formattedDate} at ${booking.time}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Duration</div>
                        <div class="info-value">${duration.label}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Amount Paid</div>
                        <div class="info-value">₹${booking.amount}</div>
                    </div>
                </div>
                <div class="booking-actions">
                    <button class="btn btn--danger btn--full-width" onclick="initiateCancellation('${booking.id}')">
                        Cancel This Booking
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

function initiateCancellation(bookingId) {
    const booking = bookings.find(b => b.id === bookingId);
    if (!booking || booking.bookingStatus !== 'active') {
        showMessage('Booking not found or already cancelled.', 'error');
        return;
    }
    
    selectedBookingForCancellation = booking;
    showCancellationModal(booking);
}

function showCancellationModal(booking) {
    const modal = document.getElementById('cancellation-modal');
    const detailsContainer = document.getElementById('cancellation-details');
    
    if (!modal || !detailsContainer) return;
    
    // Calculate refund based on cancellation policy
    const refundInfo = calculateRefund(booking);
    const duration = appData.durations.find(d => d.value === booking.duration);
    const dateObj = new Date(booking.date + 'T00:00:00');
    const formattedDate = dateObj.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric'
    });
    
    detailsContainer.innerHTML = `
        <h4>Booking Details</h4>
        <div class="booking-info-grid">
            <div class="info-item">
                <div class="info-label">Booking ID</div>
                <div class="info-value">${booking.id}</div>
            </div>
            <div class="info-item">
                <div class="info-label">Customer</div>
                <div class="info-value">${booking.customerName}</div>
            </div>
            <div class="info-item">
                <div class="info-label">Date & Time</div>
                <div class="info-value">${formattedDate} at ${booking.time}</div>
            </div>
            <div class="info-item">
                <div class="info-label">Duration</div>
                <div class="info-value">${duration.label}</div>
            </div>
        </div>
        
        <h4 style="margin-top: var(--space-16); color: var(--color-primary);">💰 Refund Information</h4>
        <div class="refund-info">
            <span>Original Amount:</span>
            <span>₹${booking.amount}</span>
        </div>
        <div class="refund-info">
            <span>Cancellation Fee:</span>
            <span>₹${booking.amount - refundInfo.refundAmount}</span>
        </div>
        <div class="refund-info">
            <span><strong>Refund Amount:</strong></span>
            <span><strong>₹${refundInfo.refundAmount}</strong></span>
        </div>
        <div style="margin-top: var(--space-12); padding: var(--space-12); background: var(--color-bg-2); border-radius: var(--radius-base);">
            <small style="color: var(--color-text-secondary);">
                <strong>Policy:</strong> ${refundInfo.message}
            </small>
        </div>
    `;
    
    // Clear previous reason
    const reasonField = document.getElementById('cancellation-reason');
    if (reasonField) {
        reasonField.value = '';
    }
    
    modal.classList.remove('hidden');
}

function calculateRefund(booking) {
    const bookingDateTime = new Date(booking.date + 'T' + booking.time + ':00');
    const now = new Date();
    const hoursUntilBooking = (bookingDateTime - now) / (1000 * 60 * 60);
    
    if (hoursUntilBooking >= appData.cancellationPolicy.freeUntil) {
        return {
            refundAmount: booking.amount,
            message: `Free cancellation (more than ${appData.cancellationPolicy.freeUntil} hours before booking)`
        };
    } else if (hoursUntilBooking > 0) {
        return {
            refundAmount: Math.round(booking.amount * appData.cancellationPolicy.partialRefund),
            message: `50% refund (less than ${appData.cancellationPolicy.freeUntil} hours before booking)`
        };
    } else {
        return {
            refundAmount: 0,
            message: 'No refund (booking time has passed)'
        };
    }
}

function closeCancellationModal() {
    const modal = document.getElementById('cancellation-modal');
    if (modal) {
        modal.classList.add('hidden');
    }
    selectedBookingForCancellation = null;
}

function confirmCancellation() {
    if (!selectedBookingForCancellation) return;
    
    const reasonField = document.getElementById('cancellation-reason');
    const reason = reasonField ? reasonField.value.trim() : '';
    const refundInfo = calculateRefund(selectedBookingForCancellation);
    
    // Update booking status
    const bookingIndex = bookings.findIndex(b => b.id === selectedBookingForCancellation.id);
    if (bookingIndex !== -1) {
        bookings[bookingIndex].bookingStatus = 'cancelled';
        bookings[bookingIndex].cancellationTime = new Date().toISOString();
        bookings[bookingIndex].refundAmount = refundInfo.refundAmount;
        if (reason) {
            bookings[bookingIndex].cancellationReason = reason;
        }
    }
    
    const bookingId = selectedBookingForCancellation.id;
    
    closeCancellationModal();
    
    // Show enhanced success message
    showSuccessModal('Booking Cancelled Successfully!', 
        `Your booking ${bookingId} has been cancelled. ${refundInfo.refundAmount > 0 ? `A refund of ₹${refundInfo.refundAmount} will be processed within 3-5 business days.` : 'No refund applicable as per our cancellation policy.'}`,
        `<div class="success-item">
            <span>Cancelled Booking:</span>
            <strong>${bookingId}</strong>
        </div>
        <div class="success-item">
            <span>Refund Amount:</span>
            <strong>₹${refundInfo.refundAmount}</strong>
        </div>
        <div class="success-item">
            <span>Processing Time:</span>
            <strong>${refundInfo.refundAmount > 0 ? '3-5 business days' : 'N/A'}</strong>
        </div>`
    );
    
    // Clear search results and reset form
    clearCancellationSearch();
    selectedBookingForCancellation = null;
    
    // Auto-redirect to welcome screen after showing success message
    setTimeout(() => {
        closeSuccessModal();
        showWelcomeScreen();
    }, 5000);
}

// Dashboard Functions
function handleOwnerLogin(event) {
    event.preventDefault();
    const passwordField = document.getElementById('owner-password');
    if (!passwordField) return;
    
    const password = passwordField.value;
    
    if (password === appData.ownerPassword) {
        isOwnerLoggedIn = true;
        showDashboard();
        showMessage('Welcome to the Dashboard!', 'success');
    } else {
        showMessage('Invalid password. Please try again.', 'error');
        passwordField.value = '';
    }
}

function updateDashboardStats() {
    const totalBookings = bookings.length;
    const activeBookings = bookings.filter(b => b.bookingStatus === 'active').length;
    const cancelledBookings = bookings.filter(b => b.bookingStatus === 'cancelled').length;
    const completedBookings = bookings.filter(b => b.bookingStatus === 'completed').length;
    
    // Calculate net revenue (excluding cancelled bookings)
    const totalRevenue = bookings
        .filter(b => b.bookingStatus !== 'cancelled')
        .reduce((sum, booking) => sum + booking.amount, 0);
    
    const totalBookingsElem = document.getElementById('total-bookings');
    const activeBookingsElem = document.getElementById('active-bookings');
    const cancelledBookingsElem = document.getElementById('cancelled-bookings');
    const totalRevenueElem = document.getElementById('total-revenue');
    
    if (totalBookingsElem) totalBookingsElem.textContent = totalBookings;
    if (activeBookingsElem) activeBookingsElem.textContent = activeBookings;
    if (cancelledBookingsElem) cancelledBookingsElem.textContent = cancelledBookings;
    if (totalRevenueElem) totalRevenueElem.textContent = totalRevenue;
}

function displayDashboardBookings(filteredBookings = null) {
    const bookingsToShow = filteredBookings || bookings;
    const container = document.getElementById('dashboard-bookings-list');
    
    if (!container) return;
    
    if (bookingsToShow.length === 0) {
        container.innerHTML = `
            <div class="text-center" style="padding: var(--space-32);">
                <div style="font-size: 60px; opacity: 0.5; margin-bottom: var(--space-16);">📋</div>
                <h3>No bookings found</h3>
                <p style="color: var(--color-text-secondary);">No bookings match your current filter criteria.</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = bookingsToShow.map(booking => {
        const duration = appData.durations.find(d => d.value === booking.duration);
        const dateObj = new Date(booking.date + 'T00:00:00');
        const formattedDate = dateObj.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric'
        });
        
        const statusClass = booking.bookingStatus === 'active' ? 'status-active' : 
                           booking.bookingStatus === 'cancelled' ? 'status-cancelled' : 'status-completed';
        
        return `
            <div class="dashboard-booking-card fade-in">
                <div class="booking-header">
                    <div class="booking-id">${booking.id}</div>
                    <div class="booking-status ${statusClass}">
                        ${booking.bookingStatus.charAt(0).toUpperCase() + booking.bookingStatus.slice(1)}
                    </div>
                </div>
                <div class="booking-info-grid">
                    <div class="info-item">
                        <div class="info-label">Customer</div>
                        <div class="info-value">${booking.customerName}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Phone</div>
                        <div class="info-value">${booking.phone}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Date & Time</div>
                        <div class="info-value">${formattedDate} at ${booking.time}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Duration</div>
                        <div class="info-value">${duration.label}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Amount</div>
                        <div class="info-value">₹${booking.amount}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Payment</div>
                        <div class="info-value">${booking.paymentMethod.toUpperCase()}</div>
                    </div>
                </div>
                ${booking.bookingStatus === 'cancelled' && booking.refundAmount !== undefined ? `
                    <div style="margin-top: var(--space-12); padding: var(--space-12); background: var(--color-bg-4); border-radius: var(--radius-base);">
                        <small><strong>Refunded:</strong> ₹${booking.refundAmount}</small>
                        ${booking.cancellationReason ? `<br><small><strong>Reason:</strong> ${booking.cancellationReason}</small>` : ''}
                    </div>
                ` : ''}
                <div class="booking-actions">
                    ${booking.bookingStatus === 'active' ? `
                        <button class="btn btn--sm btn--danger" onclick="ownerCancelBooking('${booking.id}')">
                            Cancel Booking
                        </button>
                        <button class="btn btn--sm btn--success" onclick="markBookingComplete('${booking.id}')">
                            Mark Complete
                        </button>
                    ` : ''}
                </div>
            </div>
        `;
    }).join('');
}

function filterDashboardBookings() {
    const statusFilterElem = document.getElementById('status-filter');
    const searchElem = document.getElementById('dashboard-search');
    
    const statusFilter = statusFilterElem ? statusFilterElem.value : 'all';
    const searchTerm = searchElem ? searchElem.value.toLowerCase().trim() : '';
    
    let filteredBookings = bookings;
    
    // Filter by status
    if (statusFilter !== 'all') {
        filteredBookings = filteredBookings.filter(booking => booking.bookingStatus === statusFilter);
    }
    
    // Filter by search term
    if (searchTerm) {
        filteredBookings = filteredBookings.filter(booking => 
            booking.customerName.toLowerCase().includes(searchTerm) ||
            booking.phone.includes(searchTerm) ||
            booking.id.toLowerCase().includes(searchTerm)
        );
    }
    
    displayDashboardBookings(filteredBookings);
}

function ownerCancelBooking(bookingId) {
    const booking = bookings.find(b => b.id === bookingId);
    if (!booking || booking.bookingStatus !== 'active') {
        showMessage('Booking not found or already processed.', 'error');
        return;
    }
    
    if (confirm(`Cancel booking ${bookingId} for ${booking.customerName}?\n\nThis will cancel the customer's booking and process any applicable refund according to the cancellation policy.`)) {
        const refundInfo = calculateRefund(booking);
        
        const bookingIndex = bookings.findIndex(b => b.id === bookingId);
        if (bookingIndex !== -1) {
            bookings[bookingIndex].bookingStatus = 'cancelled';
            bookings[bookingIndex].cancellationTime = new Date().toISOString();
            bookings[bookingIndex].refundAmount = refundInfo.refundAmount;
            bookings[bookingIndex].cancellationReason = 'Cancelled by owner';
        }
        
        showMessage(`Booking ${bookingId} cancelled successfully. Refund: ₹${refundInfo.refundAmount}`, 'success');
        updateDashboardStats();
        displayDashboardBookings();
    }
}

function markBookingComplete(bookingId) {
    if (confirm(`Mark booking ${bookingId} as complete?`)) {
        const bookingIndex = bookings.findIndex(b => b.id === bookingId);
        if (bookingIndex !== -1) {
            bookings[bookingIndex].bookingStatus = 'completed';
            bookings[bookingIndex].completionTime = new Date().toISOString();
            
            showMessage(`Booking ${bookingId} marked as complete.`, 'success');
            updateDashboardStats();
            displayDashboardBookings();
        }
    }
}

// Modal Functions
function showSuccessModal(title, message, details = '') {
    const modal = document.getElementById('success-modal');
    const titleElem = document.getElementById('success-title');
    const messageElem = document.getElementById('success-message');
    const detailsElem = document.getElementById('success-details');
    
    if (!modal) return;
    
    if (titleElem) titleElem.textContent = title;
    if (messageElem) messageElem.textContent = message;
    if (detailsElem) detailsElem.innerHTML = details;
    
    modal.classList.remove('hidden');
}

function closeSuccessModal() {
    const modal = document.getElementById('success-modal');
    if (modal) {
        modal.classList.add('hidden');
    }
}

// Utility Functions
function showMessage(message, type = 'info') {
    const messageDiv = document.createElement('div');
    messageDiv.className = `status status--${type}`;
    messageDiv.textContent = message;
    messageDiv.style.position = 'fixed';
    messageDiv.style.top = '20px';
    messageDiv.style.right = '20px';
    messageDiv.style.zIndex = '1001';
    messageDiv.style.animation = 'fadeIn 0.3s ease-in';
    messageDiv.style.maxWidth = '350px';
    messageDiv.style.wordWrap = 'break-word';
    messageDiv.style.boxShadow = 'var(--shadow-lg)';
    
    document.body.appendChild(messageDiv);
    
    const duration = type === 'success' ? 4000 : type === 'error' ? 5000 : 3000;
    
    setTimeout(() => {
        messageDiv.style.animation = 'fadeOut 0.3s ease-out';
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.parentNode.removeChild(messageDiv);
            }
        }, 300);
    }, duration);
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Add fadeOut animation
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeOut {
        from { opacity: 1; transform: translateY(0); }
        to { opacity: 0; transform: translateY(-10px); }
    }
`;
document.head.appendChild(style);

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeApp);