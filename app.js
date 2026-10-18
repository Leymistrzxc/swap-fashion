// ============================================
// SWAP FASHION - app.js
// ============================================

const SUPABASE_URL = 'https://nqxsktmultyevshibntr.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_EsafzasmBHFH6VSbsVY8Vw_HIfubHAo';

// ⚠️ PASTE YOUR ACTUAL GOOGLE CLIENT ID HERE
const GOOGLE_CLIENT_ID = '444991159606-botttmmgjoa91thjj0tovshj8o957ko2.apps.googleusercontent.com';

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

// ============================================
// EMAIL SIGN IN
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
        } else {
            localStorage.setItem('user', JSON.stringify(data.user));
            window.location.href = 'home.html';
        }
    });
}

// ============================================
// GOOGLE SIGN IN (UE RESTRICTED)
// ============================================
function signInWithGoogle() {
    if (!window.google) {
        alert("Google script is still loading. Please wait a second and try again.");
        return;
    }

    google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleGoogleLoginResponse
    });

    google.accounts.id.prompt(); 
}

async function handleGoogleLoginResponse(response) {
    // Decode the Google token to get the email
    const base64Url = response.credential.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    
    const userPayload = JSON.parse(jsonPayload);
    const email = userPayload.email;

    // CHECK DOMAIN: If NOT @ue.edu.ph, show the Blocked Screen
    if (!email || !email.endsWith('@ue.edu.ph')) {
        showAccessBlockedModal(email);
        return; 
    }

    // If valid UE email, proceed with Supabase Login
    const dummyPassword = 'GoogleAuth_' + userPayload.sub;
    
    const { data: authData, error: authError } = await db.auth.signInWithPassword({
        email: email,
        password: dummyPassword
    });

    if (authError) {
        // If they don't have an account yet, create one silently
        if (authError.message.includes('Invalid login credentials')) {
            const { data: signUpData, error: signUpError } = await db.auth.signUp({
                email: email,
                password: dummyPassword
            });
            
            if (signUpError) {
                alert("Error creating account: " + signUpError.message);
                return;
            }
        } else {
            alert("Login error: " + authError.message);
            return;
        }
    }

    // Success
    localStorage.setItem('user', JSON.stringify({ email: email }));
    window.location.href = 'home.html';
}

// Show the custom Google Error Modal
function showAccessBlockedModal(blockedEmail) {
    const modalHTML = `
        <div id="googleBlockModal" style="position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.8); z-index: 9999; display: flex; justify-content: center; align-items: center; padding: 20px;">
            <div style="background: #202124; color: #e8eaed; border-radius: 8px; width: 100%; max-width: 450px; overflow: hidden; font-family: 'Google Sans', Roboto, Arial, sans-serif; box-shadow: 0 4px 12px rgba(0,0,0,0.5);">
                <div style="padding: 16px 24px; border-bottom: 1px solid #3c4043; display: flex; align-items: center; gap: 12px;">
                    <svg width="20" height="20" viewBox="0 0 48 48"><path fill="#4285F4" d="M45.12 24.5c0-1.56-.14-3.06-.4-4.5H24v8.51h11.84c-.51 2.75-2.06 5.08-4.39 6.64v5.52h7.11c4.16-3.83 6.56-9.47 6.56-16.17z"/><path fill="#34A853" d="M24 46c5.94 0 10.92-1.97 14.56-5.33l-7.11-5.52c-1.97 1.32-4.49 2.1-7.45 2.1-5.73 0-10.58-3.87-12.31-9.07H4.34v5.7C7.96 41.07 15.4 46 24 46z"/><path fill="#FBBC05" d="M11.69 28.18C11.25 26.86 11 25.45 11 24s.25-2.86.69-4.18v-5.7H4.34C2.85 17.09 2 20.45 2 24s.85 6.91 2.34 9.88l7.35-5.7z"/><path fill="#EA4335" d="M24 10.75c3.23 0 6.13 1.11 8.41 3.29l6.31-6.31C34.91 4.18 29.93 2 24 2 15.4 2 7.96 6.93 4.34 14.12l7.35 5.7c1.73-5.2 6.58-9.07 12.31-9.07z"/></svg>
                    <span style="font-size: 14px; font-weight: 500;">Sign in with Google</span>
                </div>
                <div style="padding: 32px 24px;">
                    <h1 style="font-size: 28px; font-weight: 400; margin: 0 0 16px 0; color: #f28b82;">Access blocked: UE Portal can only be used within its organization</h1>
                    <p style="font-size: 14px; line-height: 1.5; margin-bottom: 24px; color: #bdc1c6;">UE Portal is restricted to users within its organization. If you think you should have access, you can contact the developer.</p>
                    <p style="font-size: 12px; color: #9aa0a6; margin-bottom: 24px;">If you are a developer of UE Portal, see error details.<br><strong>Error 403: org_internal</strong></p>
                </div>
                <div style="padding: 16px 24px; background: #303134; display: flex; align-items: center; gap: 12px;">
                    <div style="width: 28px; height: 28px; border-radius: 50%; background: #f28b82; color: #202124; display: flex; justify-content: center; align-items: center; font-weight: bold; font-size: 12px;">
                        ${blockedEmail.charAt(0).toUpperCase()}
                    </div>
                    <span style="font-size: 13px; color: #bdc1c6;">${blockedEmail}</span>
                    <button onclick="document.getElementById('googleBlockModal').remove()" style="margin-left: auto; background: transparent; border: 1px solid #5f6368; color: #e8eaed; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-size: 12px;">Close</button>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

// ============================================
// SIGN OUT
// ============================================
async function signOut() {
    await db.auth.signOut();
    localStorage.removeItem('user');
    window.location.href = 'index.html';
}

// ============================================
// HOME PAGE
// ============================================
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
}

// ============================================
// PROFILE PAGE
// ============================================
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

// ============================================
// CART PAGE
// ============================================
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

// ============================================
// CHECKOUT PAGE
// ============================================
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

// ============================================
// NOTIFICATIONS PAGE
// ============================================
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

// ============================================
// INBOX & CHAT LOGIC
// ============================================
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

function openChat(name, initials) {
    document.getElementById('inboxListView').style.display = 'none';
    document.getElementById('bottomNav').style.display = 'none';
    document.getElementById('chatView').style.display = 'flex';
    
    document.getElementById('chatName').textContent = name;
    document.getElementById('chatAvatar').textContent = initials;
    
    const chatMessages = document.getElementById('chatMessages');
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function closeChat() {
    document.getElementById('chatView').style.display = 'none';
    document.getElementById('inboxListView').style.display = 'block';
    document.getElementById('bottomNav').style.display = 'flex';
}

function sendMessage() {
    const input = document.getElementById('chatInput');
    const text = input.value.trim();
    if (text === '') return;

    const chatMessages = document.getElementById('chatMessages');
    const newMessage = document.createElement('div');
    newMessage.className = 'message sent';
    newMessage.textContent = text;
    
    chatMessages.appendChild(newMessage);
    input.value = '';
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    setTimeout(() => {
        const reply = document.createElement('div');
        reply.className = 'message received';
        reply.textContent = "Got it! I'll let you know soon. 😊";
        chatMessages.appendChild(reply);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }, 1000);
}

function handleEnter(e) {
    if (e.key === 'Enter') {
        sendMessage();
    }
}

// ============================================
// ADD LISTING PAGE
// ============================================
if (document.querySelector('.add-listing-page')) {
    (async () => {
        const { data: { session } } = await db.auth.getSession();
        if (!session) { window.location.href = 'index.html'; return; }
    })();
}

function setListingType(type, btn) {
    document.querySelectorAll('.type-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const priceGroup = document.getElementById('priceGroup');
    if (type === 'buy') {
        priceGroup.style.display = 'block';
    } else {
        priceGroup.style.display = 'none';
    }
}

function submitItem(e) {
    e.preventDefault();
    alert('Listing posted successfully!\n\nIt will now appear on the Home page.');
    setTimeout(() => { window.location.href = 'home.html'; }, 1000);
}

// ============================================
// ITEM DETAILS PAGE
// ============================================
if (document.querySelector('.item-details-page')) {
    (async () => {
        const { data: { session } } = await db.auth.getSession();
        if (!session) { window.location.href = 'index.html'; return; }
    })();

    const urlParams = new URLSearchParams(window.location.search);
    const itemName = urlParams.get('name');
    const itemPrice = urlParams.get('price');
    const itemType = urlParams.get('type');

    if (itemName) {
        document.getElementById('itemTitle').textContent = decodeURIComponent(itemName);
        document.getElementById('itemPrice').textContent = itemPrice ? '₱' + itemPrice : 'Open to swap';
        
        if (itemType === 'swap') {
            document.getElementById('itemBadge').className = 'badge swap';
            document.getElementById('itemBadge').textContent = 'Swap';
            document.getElementById('itemPrice').style.fontSize = '16px';
        }
    }
}

function selectSize(btn) {
    document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
}

// ============================================
// PWA SERVICE WORKER
// ============================================
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/swap-fashion/sw.js')
            .then(reg => console.log('✅ Service Worker registered:', reg.scope))
            .catch(err => console.log('❌ Service Worker error:', err));
    });
    
}

// ============================================
// CATEGORY PAGE LOGIC
// ============================================
if (document.querySelector('.category-page')) {
    (async () => {
        const { data: { session } } = await db.auth.getSession();
        if (!session) { window.location.href = 'index.html'; return; }
    })();

    // 1. Get the category from the URL
    const urlParams = new URLSearchParams(window.location.search);
    const category = urlParams.get('cat') || 'formal';

    // 2. Set the title
    const titleEl = document.getElementById('categoryTitle');
    const titles = {
        'formal': 'Formal Attire',
        'casual': 'Casual Wear',
        'cosplay': 'Cosplay',
        'sports': 'Sportswear'
    };
    titleEl.textContent = titles[category] || 'Items';

    // 3. Demo Data (Matches your Figma exactly)
    const allItems = [
        { name: 'Black Blazer', price: '350', type: 'buy', cat: 'formal', size: 'Size M' },
        { name: 'Barong Tagalog', price: '', type: 'swap', cat: 'formal', size: 'Size L' },
        { name: 'Pleated Skirt', price: '220', type: 'buy', cat: 'formal', size: 'Size S' },
        { name: 'Basketball Jersey', price: '', type: 'swap', cat: 'sports', size: 'Size L' },
        { name: 'Vintage Denim Jacket', price: '500', type: 'buy', cat: 'casual', size: 'Size M' },
        { name: 'Anime Cosplay Wig', price: '', type: 'swap', cat: 'cosplay', size: 'One Size' }
    ];

    // 4. Filter items by the chosen category
    const filteredItems = allItems.filter(item => item.cat === category);

    // 5. Create HTML for each item and add to grid
    const grid = document.getElementById('categoryGrid');
    
    if (filteredItems.length === 0) {
        grid.innerHTML = '<p style="text-align:center; color:#7A5A5A; grid-column: 1/-1; margin-top: 20px;">No items found in this category yet.</p>';
    } else {
        filteredItems.forEach(item => {
            const badgeClass = item.type === 'buy' ? 'buy' : 'swap';
            const badgeText = item.type === 'buy' ? 'Buy' : 'Swap';
            const priceText = item.type === 'buy' ? `₱${item.price}` : 'Open to swap';
            const priceClass = item.type === 'buy' ? 'item-price' : 'item-price swap-text';

            // Generate the details link
            const link = `item-details.html?name=${encodeURIComponent(item.name)}&price=${item.price}&type=${item.type}`;

            const cardHTML = `
                <div class="item-card" onclick="window.location.href='${link}'">
                    <div class="item-img">
                        <span class="badge ${badgeClass}">${badgeText}</span>
                        <i class="fa-solid fa-shirt item-icon"></i>
                    </div>
                    <h3>${item.name}</h3>
                    <p class="item-meta">${category.charAt(0).toUpperCase() + category.slice(1)} · ${item.size}</p>
                    <p class="${priceClass}">${priceText}</p>
                </div>
            `;
            grid.insertAdjacentHTML('beforeend', cardHTML);
        });
    }
}