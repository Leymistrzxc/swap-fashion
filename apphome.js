// ============================================
// SWAP FASHION - app.js
// ============================================

const SUPABASE_URL = 'https://nqxsktmultyevshibntr.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_EsafzasmBHFH6VSbsVY8Vw_HIfubHAo';

const { createClient } = supabase;
const db = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ============================================
// Toggle password visibility
// ============================================
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

// ============================================
// Sign In (index.html)
// ============================================
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
            console.error(error);
        } else {
            localStorage.setItem('user', JSON.stringify(data.user));
            window.location.href = 'home.html';
        }
    });
}

// ============================================
// Google Sign In (coming soon)
// ============================================
function signInWithGoogle() {
    alert('Google Sign-In is coming soon! Please use email login for now.');
}

// ============================================
// Sign Out
// ============================================
async function signOut() {
    await db.auth.signOut();
    localStorage.removeItem('user');
    window.location.href = 'index.html';
}

// ============================================
// HOME PAGE LOGIC (runs on home.html)
// ============================================
if (document.querySelector('.home-page')) {

    // Protect the page — redirect if not logged in
    (async () => {
        const { data: { session } } = await db.auth.getSession();
        if (!session) {
            window.location.href = 'index.html';
            return;
        }

        // Show user's name
        const userEmail = session.user.email || '';
        const namePart = userEmail.split('@')[0];
        const displayName = namePart.charAt(0).toUpperCase() + namePart.slice(1);
        const nameEl = document.getElementById('userName');
        if (nameEl) nameEl.textContent = displayName;
    })();

    // Category chips — click to activate
    document.querySelectorAll('.category:not(.add-new)').forEach(cat => {
        cat.addEventListener('click', () => {
            document.querySelectorAll('.category').forEach(c => c.classList.remove('active'));
            cat.classList.add('active');
        });
    });

    // Item cards — click to view detail
    document.querySelectorAll('.item-card').forEach(card => {
        card.addEventListener('click', () => {
            const itemName = card.querySelector('h3').textContent;
            alert('Opening: ' + itemName + '\n\nItem detail page coming soon!');
        });
    });
}

// ============================================
// PROFILE PAGE LOGIC (runs on profile.html)
// ============================================
if (document.querySelector('.profile-page')) {
    (async () => {
        const { data: { session } } = await db.auth.getSession();
        if (!session) {
            window.location.href = 'index.html';
            return;
        }

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