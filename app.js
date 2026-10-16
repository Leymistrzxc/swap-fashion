// ============================================
// SWAP FASHION - app.js
// Connected to Supabase
// ============================================

// ⚠️ REPLACE THESE WITH YOUR ACTUAL VALUES FROM SUPABASE
const SUPABASE_URL = 'https://nqxsktmultyevshibntr.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_EsafzasmBHFH6VSbsVY8Vw_HIfubHAo';

// Connect to Supabase
const { createClient } = supabase;
const db = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ============================================
// Toggle password visibility
// ============================================
function togglePassword() {
    const passwordInput = document.getElementById('password');
    const eyeIcon = document.querySelector('.eye-btn i');
    
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
// Handle Sign In
// ============================================
document.getElementById('loginForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const submitBtn = document.querySelector('.btn-primary');
    
    submitBtn.textContent = 'Signing in...';
    submitBtn.disabled = true;
    
    const { data, error } = await db.auth.signInWithPassword({
        email: email,
        password: password
    });
    
    submitBtn.textContent = 'Sign in';
    submitBtn.disabled = false;
    
    if (error) {
        alert('Login failed: ' + error.message);
        console.error(error);
    } else {
        alert('Welcome back, Warrior!');
        localStorage.setItem('user', JSON.stringify(data.user));
    }
});

// ============================================
// Google Sign In (disabled for now)
// ============================================
async function signInWithGoogle() {
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