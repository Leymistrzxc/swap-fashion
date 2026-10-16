// ============================================
// SWAP FASHION - app.js
// ============================================

const SUPABASE_URL = 'https://nqxsktmultyevshibntr.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_EsafzasmBHFH6VSbsVY8Vw_HIfubHAo';

const { createClient } = supabase;
const db = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Toggle password visibility
function togglePassword() {
    const passwordInput = document.getElementById('password');
    const eyeIcon = document.querySelector('.eye-btn i');
    if (!passwordInput || !eyeIcon) return;
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        eyeIcon.classList.remove('fa-eye');
        eyeIcon.classList.add('fa-eye-slash');
    } else {
        passwordInput.type = 'password';
        eyeIcon.classList.remove('fa-eye-slash');
        eyeIcon.classList.add('fa-eye');
    }
}

// SIGN IN
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const submitBtn = document.querySelector('.btn-primary');
        submitBtn.textContent = 'Signing in...';
        submitBtn.disabled = true;
        const { data, error } = await db.auth.signInWithPassword({ email, password });
        submitBtn.textContent = 'Sign in';
        submitBtn.disabled = false;
        if (error) {
            alert('Login failed: ' + error.message);
        } else {
            localStorage.setItem('user', JSON.stringify(data.user));
            window.location.href = 'home.html';
        }
    });
}

function signInWithGoogle() {
    alert('Google Sign-In is coming soon! Please use email login for now.');
}

async function signOut() {
    await db.auth.signOut();
    localStorage.removeItem('user');
    window.location.href = 'index.html';
}

// HOME PAGE
if (document.querySelector('.home-page')) {
    (async () => {
        const { data: { session } } = await db.auth.getSession();
        if (!session) { window.location.href = 'index.html'; return; }
        const userEmail = session.user.email || '';
        const namePart = userEmail.split('@')[0];
        const displayName = namePart.charAt(0).toUpperCase() + namePart.slice(1);
        const nameEl = document.getElementById('userName');
        if (nameEl) nameEl.textContent = displayName;
    })();

    document.querySelectorAll('.category:not(.add-new)').forEach(cat => {
        cat.addEventListener('click', () => {
            document.querySelectorAll('.category').forEach(c => c.classList.remove('active'));
            cat.classList.add('active');
        });
    });

    document.querySelectorAll('.item-card').forEach(card => {
        card.addEventListener('click', () => {
            const itemName = card.querySelector('h3').textContent;
            alert('Opening: ' + itemName + '\n\nItem detail page coming soon!');
        });
    });
}

// PROFILE PAGE
if (document.querySelector('.profile-page')) {
    (async () => {
        const { data: { session } } = await db.auth.getSession();
        if (!session) { window.location.href = 'index.html'; return; }
        const userEmail = session.user.email || '';
        const namePart = userEmail.split('@')[0];
        const displayName = namePart.charAt(0).toUpperCase() + namePart.slice(1);
        const emailEl = document.getElementById('profileEmail');
        const nameEl = document.getElementById('profileName');
        if (nameEl) nameEl.textContent = displayName;
        if (emailEl) emailEl.textContent = userEmail;
    })();

    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            if (confirm('Log out of Swap Fashion?')) signOut();
        });
    }
}

// CART PAGE
if (document.querySelector('.cart-page')) {
    (async () => {
        const { data: { session } } = await db.auth.getSession();
        if (!session) { window.location.href = 'index.html'; return; }
    })();
    updateCartCount();
}

function setMode(mode) {
    document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(mode === 'swap' ? 'modeSwap' : 'modePurchase').classList.add('active');

    const offerBox = document.getElementById('offerBox');
    const modeHint = document.getElementById('modeHint');
    const orderSummary = document.getElementById('orderSummary');
    const barLabel = document.getElementById('barLabel');
    const barCount = document.getElementById('barCount');
    const checkoutBtn = document.getElementById('checkoutBtn');

    if (mode === 'purchase') {
        offerBox.style.display = 'none';
        modeHint.textContent = 'Pay for your items, then the seller ships them to you.';
        orderSummary.style.display = 'block';
        barLabel.textContent = 'Total';
        barCount.textContent = calculateTotal();
        checkoutBtn.textContent = 'Checkout';
        checkoutBtn.onclick = () => window.location.href = 'checkout.html';
    } else {
        offerBox.style.display = 'block';
        modeHint.textContent = 'Offer one of your own items. The owner will accept or decline.';
        orderSummary.style.display = 'none';
        barLabel.textContent = 'Items';
        const count = document.querySelectorAll('.cart-item').length;
        barCount.textContent = count + (count === 1 ? ' item' : ' items');
        checkoutBtn.textContent = 'Continue to swap';
        checkoutBtn.onclick = continueToSwap;
    }
}

function calculateTotal() {
    let total = 0;
    document.querySelectorAll('.cart-item').forEach(item => {
        const priceText = item.querySelector('.cart-item-price').textContent.replace('₱', '').replace(',', '').trim();
        total += parseInt(priceText) || 0;
    });
    return '₱' + total.toLocaleString();
}

function removeItem(btn) {
    const item = btn.closest('.cart-item');
    item.style.transition = 'opacity 0.2s, transform 0.2s';
    item.style.opacity = '0';
    item.style.transform = 'translateX(-20px)';
    setTimeout(() => {
        item.remove();
        updateCartCount();
        if (document.getElementById('orderSummary').style.display === 'block') setMode('purchase');
    }, 200);
}

function clearCart() {
    if (confirm('Remove all items from your cart?')) {
        document.getElementById('cartList').innerHTML = '';
        updateCartCount();
    }
}

function updateCartCount() {
    const count = document.querySelectorAll('.cart-item').length;
    const barCount = document.getElementById('barCount');
    const itemCountText = document.getElementById('itemCountText');
    const summaryCount = document.getElementById('summaryCount');
    const inPurchaseMode = document.getElementById('orderSummary').style.display === 'block';

    if (barCount) {
        barCount.textContent = inPurchaseMode ? calculateTotal() : count + (count === 1 ? ' item' : ' items');
    }
    if (itemCountText) itemCountText.textContent = count;
    if (summaryCount) summaryCount.textContent = count;

    const summarySubtotal = document.getElementById('summarySubtotal');
    const summaryTotal = document.getElementById('summaryTotal');
    const total = calculateTotal();
    if (summarySubtotal) summarySubtotal.textContent = total;
    if (summaryTotal) summaryTotal.textContent = total;
}

function continueToSwap() {
    const count = document.querySelectorAll('.cart-item').length;
    if (count === 0) { alert('Your cart is empty!'); return; }
    window.location.href = 'checkout.html';
}

// CHECKOUT PAGE
if (document.querySelector('.checkout-page')) {
    (async () => {
        const { data: { session } } = await db.auth.getSession();
        if (!session) { window.location.href = 'index.html'; return; }
    })();
}

function selectDate(btn) {
    document.querySelectorAll('.date-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    updateScheduleText();
}

function selectTime(btn) {
    if (btn.classList.contains('disabled')) return;
    document.querySelectorAll('.time-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    updateScheduleText();
}

function updateScheduleText() {
    const dateBtn = document.querySelector('.date-btn.active');
    const timeBtn = document.querySelector('.time-btn.active');
    const summary = document.getElementById('scheduleText');
    if (!dateBtn || !timeBtn || !summary) return;
    const day = dateBtn.querySelector('span').textContent;
    const num = dateBtn.querySelector('strong').textContent;
    const time = timeBtn.textContent.trim();
    summary.textContent = `${day}, Oct ${num} · ${time} · UE Caloocan`;
}

function placeOrder() {
    const dateBtn = document.querySelector('.date-btn.active');
    const timeBtn = document.querySelector('.time-btn.active');
    if (!dateBtn || !timeBtn) {
        alert('Please pick a date and time for the meetup.');
        return;
    }
    const day = dateBtn.querySelector('span').textContent;
    const num = dateBtn.querySelector('strong').textContent;
    const time = timeBtn.textContent.trim();
    alert(`Order placed!\n\nMeetup: ${day}, Oct ${num} at ${time}\nLocation: UE Caloocan\n\nSee you there, Warrior!`);
    setTimeout(() => window.location.href = 'home.html', 1200);
}

// NOTIFICATIONS PAGE
if (document.querySelector('.notifications-page')) {
    (async () => {
        const { data: { session } } = await db.auth.getSession();
        if (!session) { window.location.href = 'index.html'; return; }
    })();
}

function filterNotifs(type, btn) {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    document.querySelectorAll('.notif-card').forEach(card => {
        card.style.display = (type === 'all' || card.dataset.type === type) ? 'flex' : 'none';
    });
}

function markAllRead() {
    document.querySelectorAll('.notif-card.unread').forEach(card => {
        card.classList.remove('unread');
        const dot = card.querySelector('.unread-dot');
        if (dot) dot.remove();
    });
}

// INBOX PAGE
if (document.querySelector('.inbox-page')) {
    (async () => {
        const { data: { session } } = await db.auth.getSession();
        if (!session) { window.location.href = 'index.html'; return; }
    })();

    document.querySelectorAll('.inbox-filters .filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.inbox-filters .filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });
}