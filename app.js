// ============================================
// SWAP FASHION - app.js
// Connected to Supabase
// ============================================

// ⚠️ PASTE YOUR OWN VALUES HERE
const SUPABASE_URL = 'https://nqxsktmultyevshibntr.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_Esafz...'; // ← Paste the full key from Supabase

// Connect to Supabase
const { createClient } = supabase;
const db = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ============================================
// Toggle password visibility (eye icon)
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
    
    // Show loading state
    submitBtn.textContent = 'Signing in...';
    submitBtn.disabled = true;
    
    // Call Supabase
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
        // Success!
        alert('Welcome back, Warrior!');
        localStorage.setItem('user', JSON.stringify(data.user));
        // window.location.href = 'home.html'; // Uncomment when home.html exists
    }
});

// ============================================
// Handle Google / UE Gmail Sign In
// ============================================
async function signInWithGoogle() {
    const { data, error } = await db.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: window.location.origin + '/index.html'
        }
    });
    
    if (error) {
        alert('Google sign-in failed: ' + error.message);
    }
}

// ============================================
// Sign Out (for later pages)
// ============================================
async function signOut() {
    await db.auth.signOut();
    localStorage.removeItem('user');
    window.location.href = 'index.html';
}