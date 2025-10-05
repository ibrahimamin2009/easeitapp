// Futuristic Authentication System - Advanced Login/Register Features

let passwordVisible = false;
let isSubmitting = false;

// Initialize authentication system
document.addEventListener('DOMContentLoaded', function() {
    initializeAuthSystem();
    initializePasswordValidation();
    initializeFormAnimations();
    initializeSecurityEffects();
});

function initializeAuthSystem() {
    const forms = document.querySelectorAll('.auth-form');
    
    forms.forEach(form => {
        form.addEventListener('submit', handleFormSubmit);
        
        // Add real-time validation
        const inputs = form.querySelectorAll('.auth-input');
        inputs.forEach(input => {
            input.addEventListener('input', handleInputChange);
            input.addEventListener('focus', handleInputFocus);
            input.addEventListener('blur', handleInputBlur);
        });
    });
    
    // Initialize security scanner
    initializeSecurityScanner();
}

function initializePasswordValidation() {
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    
    if (passwordInput) {
        passwordInput.addEventListener('input', validatePassword);
        passwordInput.addEventListener('input', checkPasswordMatch);
    }
    
    if (confirmPasswordInput) {
        confirmPasswordInput.addEventListener('input', checkPasswordMatch);
    }
}

function initializeFormAnimations() {
    // Add stagger animation to form elements
    const formGroups = document.querySelectorAll('.form-group');
    formGroups.forEach((group, index) => {
        group.style.animationDelay = `${index * 0.1}s`;
        group.classList.add('fade-in-up');
    });
    
    // Add hover effects to inputs
    const inputs = document.querySelectorAll('.auth-input');
    inputs.forEach(input => {
        input.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.02)';
            this.style.boxShadow = '0 0 20px rgba(0, 255, 255, 0.3)';
        });
        
        input.addEventListener('mouseleave', function() {
            this.style.transform = '';
            this.style.boxShadow = '';
        });
    });
}

function initializeSecurityEffects() {
    // Add random security scanning effects
    setInterval(createSecurityScan, 5000);
    
    // Add particle effects
    createParticleEffect();
    
    // Add floating element animations
    animateFloatingElements();
}

function handleFormSubmit(event) {
    event.preventDefault();
    
    if (isSubmitting) return;
    
    const form = event.target;
    const submitBtn = form.querySelector('.auth-btn');
    const btnText = submitBtn.querySelector('.btn-text');
    const btnLoading = submitBtn.querySelector('.btn-loading');
    
    // Show loading state
    isSubmitting = true;
    btnText.style.display = 'none';
    btnLoading.style.display = 'flex';
    submitBtn.disabled = true;
    
    // Add security scanning effect
    triggerSecurityScan();
    
    // Simulate processing time for visual effect
    setTimeout(() => {
        form.submit();
    }, 2000);
}

function handleInputChange(event) {
    const input = event.target;
    const container = input.closest('.input-container');
    
    // Add typing effect
    input.style.animation = 'inputTyping 0.1s ease-out';
    setTimeout(() => {
        input.style.animation = '';
    }, 100);
    
    // Validate input in real-time
    validateInput(input);
}

function handleInputFocus(event) {
    const input = event.target;
    const container = input.closest('.input-container');
    const glow = container.querySelector('.input-glow');
    
    // Add focus glow effect
    if (glow) {
        glow.style.opacity = '1';
        glow.style.animation = 'inputGlow 2s ease-in-out infinite';
    }
    
    // Add focus animation to container
    container.style.transform = 'scale(1.02)';
    container.style.boxShadow = '0 0 30px rgba(0, 255, 255, 0.4)';
}

function handleInputBlur(event) {
    const input = event.target;
    const container = input.closest('.input-container');
    const glow = container.querySelector('.input-glow');
    
    // Remove focus effects
    if (glow) {
        glow.style.opacity = '0';
        glow.style.animation = '';
    }
    
    container.style.transform = '';
    container.style.boxShadow = '';
}

function validateInput(input) {
    const value = input.value.trim();
    const inputType = input.type;
    const container = input.closest('.input-container');
    
    // Clear previous validation
    container.classList.remove('valid', 'invalid');
    
    if (!value) {
        return;
    }
    
    let isValid = false;
    
    switch (inputType) {
        case 'email':
            isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
            break;
        case 'password':
            isValid = validatePasswordStrength(value);
            break;
        case 'text':
            if (input.name === 'username') {
                isValid = value.length >= 3 && /^[a-zA-Z0-9_]+$/.test(value);
            } else {
                isValid = value.length >= 2;
            }
            break;
    }
    
    if (isValid) {
        container.classList.add('valid');
    } else {
        container.classList.add('invalid');
    }
}

function validatePassword(password) {
    const strengthIndicator = document.getElementById('passwordStrength');
    const strengthFill = document.getElementById('strengthFill');
    const strengthText = document.getElementById('strengthText');
    
    if (!strengthIndicator) return;
    
    const strength = calculatePasswordStrength(password);
    
    // Show/hide strength indicator
    if (password.length > 0) {
        strengthIndicator.style.display = 'block';
    } else {
        strengthIndicator.style.display = 'none';
        return;
    }
    
    // Update strength bar
    strengthFill.style.width = strength.score + '%';
    
    // Update strength text and color
    strengthText.textContent = strength.text;
    strengthFill.className = `strength-fill ${strength.class}`;
    
    // Update requirements
    updatePasswordRequirements(password);
}

function calculatePasswordStrength(password) {
    let score = 0;
    const requirements = {
        length: password.length >= 8,
        uppercase: /[A-Z]/.test(password),
        lowercase: /[a-z]/.test(password),
        number: /\d/.test(password),
        special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };
    
    // Calculate score
    Object.values(requirements).forEach(met => {
        if (met) score += 20;
    });
    
    // Determine strength level
    if (score < 40) {
        return { score, text: 'Weak', class: 'weak' };
    } else if (score < 80) {
        return { score, text: 'Medium', class: 'medium' };
    } else {
        return { score, text: 'Strong', class: 'strong' };
    }
}

function updatePasswordRequirements(password) {
    const requirements = {
        length: password.length >= 8,
        uppercase: /[A-Z]/.test(password),
        lowercase: /[a-z]/.test(password),
        number: /\d/.test(password),
        special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };
    
    Object.keys(requirements).forEach(req => {
        const element = document.getElementById(`req-${req}`);
        if (element) {
            const icon = element.querySelector('i');
            const isMet = requirements[req];
            
            if (isMet) {
                icon.className = 'fas fa-check';
                element.style.color = 'var(--status-green)';
            } else {
                icon.className = 'fas fa-times';
                element.style.color = 'var(--status-red)';
            }
        }
    });
}

function checkPasswordMatch() {
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    
    if (!passwordInput || !confirmPasswordInput) return;
    
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;
    
    if (confirmPassword.length === 0) return;
    
    const container = confirmPasswordInput.closest('.input-container');
    
    if (password === confirmPassword) {
        container.classList.add('valid');
        container.classList.remove('invalid');
    } else {
        container.classList.add('invalid');
        container.classList.remove('valid');
    }
}

function togglePassword(inputId = null) {
    const input = inputId ? document.getElementById(inputId) : document.querySelector('input[type="password"]');
    const toggle = input.nextElementSibling;
    const icon = toggle.querySelector('i');
    
    if (input.type === 'password') {
        input.type = 'text';
        icon.className = 'fas fa-eye-slash';
        passwordVisible = true;
    } else {
        input.type = 'password';
        icon.className = 'fas fa-eye';
        passwordVisible = false;
    }
}

function initializeSecurityScanner() {
    const scanner = document.querySelector('.security-scanner');
    if (!scanner) return;
    
    // Create scanning animation
    setInterval(() => {
        scanner.style.animation = 'securityScan 3s ease-in-out';
        setTimeout(() => {
            scanner.style.animation = '';
        }, 3000);
    }, 8000);
}

function triggerSecurityScan() {
    const scanner = document.querySelector('.security-scanner');
    if (scanner) {
        scanner.style.animation = 'securityScan 2s ease-in-out';
    }
}

function createSecurityScan() {
    const scanLine = document.createElement('div');
    scanLine.className = 'security-scan-line';
    scanLine.style.cssText = `
        position: fixed;
        top: 0;
        left: -100%;
        width: 100%;
        height: 2px;
        background: linear-gradient(90deg, transparent, var(--neon-cyan), transparent);
        z-index: 1000;
        animation: securityScanLine 2s ease-in-out;
    `;
    
    document.body.appendChild(scanLine);
    
    setTimeout(() => {
        scanLine.remove();
    }, 2000);
}

function createParticleEffect() {
    const container = document.querySelector('.auth-background .floating-particles');
    if (!container) return;
    
    for (let i = 0; i < 20; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.cssText = `
            position: absolute;
            width: ${Math.random() * 4 + 1}px;
            height: ${Math.random() * 4 + 1}px;
            background: var(--neon-cyan);
            border-radius: 50%;
            left: ${Math.random() * 100}%;
            top: ${Math.random() * 100}%;
            animation: particleFloat ${Math.random() * 10 + 10}s linear infinite;
            opacity: ${Math.random() * 0.5 + 0.2};
        `;
        
        container.appendChild(particle);
    }
}

function animateFloatingElements() {
    const floatingIcons = document.querySelectorAll('.floating-icon');
    
    floatingIcons.forEach((icon, index) => {
        icon.style.animation = `floatingIcon ${5 + index}s ease-in-out infinite`;
    });
}

// Add CSS animations for authentication
const authStyle = document.createElement('style');
authStyle.textContent = `
    .auth-body {
        background: var(--primary-bg);
        overflow: hidden;
    }
    
    .auth-background {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: -1;
    }
    
    .floating-particles {
        position: absolute;
        width: 100%;
        height: 100%;
    }
    
    .grid-overlay {
        position: absolute;
        width: 100%;
        height: 100%;
        background-image: 
            linear-gradient(rgba(0, 255, 255, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 255, 255, 0.1) 1px, transparent 1px);
        background-size: 50px 50px;
        animation: gridMove 20s linear infinite;
    }
    
    .auth-container {
        display: flex;
        min-height: 100vh;
        position: relative;
        z-index: 1;
    }
    
    .auth-left-panel {
        flex: 1;
        background: linear-gradient(135deg, var(--primary-bg) 0%, var(--secondary-bg) 100%);
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
        overflow: hidden;
    }
    
    .auth-right-panel {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: var(--spacing-xl);
        position: relative;
    }
    
    .brand-content {
        text-align: center;
        color: #ffffff;
        z-index: 2;
        position: relative;
    }
    
    .logo-container {
        margin-bottom: var(--spacing-xl);
    }
    
    .logo-glow {
        width: 120px;
        height: 120px;
        background: var(--neon-cyan);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto;
        font-size: 3rem;
        color: var(--primary-bg);
        box-shadow: 0 0 50px rgba(0, 255, 255, 0.5);
        animation: logoGlow 3s ease-in-out infinite;
    }
    
    .brand-title {
        font-family: var(--font-display);
        font-size: 3rem;
        font-weight: 700;
        margin-bottom: var(--spacing-md);
        background: linear-gradient(135deg, var(--neon-cyan), var(--neon-blue));
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
    }
    
    .brand-subtitle {
        font-size: 1.2rem;
        color: rgba(255, 255, 255, 0.8);
        margin-bottom: var(--spacing-xl);
    }
    
    .brand-features {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-md);
    }
    
    .feature-item {
        display: flex;
        align-items: center;
        gap: var(--spacing-md);
        padding: var(--spacing-md);
        background: var(--glass-bg);
        border-radius: var(--radius-md);
        border: 1px solid var(--glass-border);
        backdrop-filter: blur(20px);
    }
    
    .feature-item i {
        color: var(--neon-cyan);
        font-size: 1.2rem;
    }
    
    .auth-form-container {
        width: 100%;
        max-width: 500px;
        background: var(--glass-bg);
        backdrop-filter: blur(20px);
        border: 1px solid var(--glass-border);
        border-radius: var(--radius-xl);
        padding: var(--spacing-xl);
        box-shadow: var(--glow-cyan);
    }
    
    .form-header {
        text-align: center;
        margin-bottom: var(--spacing-xl);
    }
    
    .form-header h2 {
        color: var(--neon-cyan);
        font-family: var(--font-display);
        font-size: 2rem;
        margin-bottom: var(--spacing-sm);
    }
    
    .form-header p {
        color: rgba(255, 255, 255, 0.7);
        font-size: 1rem;
    }
    
    .auth-form {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-lg);
    }
    
    .form-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: var(--spacing-md);
    }
    
    .form-group {
        position: relative;
    }
    
    .input-container {
        position: relative;
        transition: all 0.3s ease;
    }
    
    .input-icon {
        position: absolute;
        left: var(--spacing-md);
        top: 50%;
        transform: translateY(-50%);
        color: var(--neon-cyan);
        z-index: 2;
    }
    
    .auth-input {
        width: 100%;
        padding: var(--spacing-md) var(--spacing-md) var(--spacing-md) 3rem;
        background: var(--card-bg);
        border: 1px solid var(--glass-border);
        border-radius: var(--radius-md);
        color: #ffffff;
        font-size: 1rem;
        transition: all 0.3s ease;
        outline: none;
    }
    
    .auth-input:focus {
        border-color: var(--neon-cyan);
        box-shadow: 0 0 20px rgba(0, 255, 255, 0.3);
    }
    
    .auth-input::placeholder {
        color: rgba(255, 255, 255, 0.5);
    }
    
    .input-glow {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(90deg, transparent, rgba(0, 255, 255, 0.1), transparent);
        border-radius: inherit;
        opacity: 0;
        pointer-events: none;
    }
    
    .password-toggle {
        position: absolute;
        right: var(--spacing-md);
        top: 50%;
        transform: translateY(-50%);
        background: none;
        border: none;
        color: var(--neon-cyan);
        cursor: pointer;
        z-index: 2;
        transition: all 0.3s ease;
    }
    
    .password-toggle:hover {
        color: var(--neon-blue);
    }
    
    .form-options {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin: var(--spacing-md) 0;
    }
    
    .checkbox-container {
        display: flex;
        align-items: center;
        gap: var(--spacing-sm);
        cursor: pointer;
        color: rgba(255, 255, 255, 0.8);
        font-size: 0.9rem;
    }
    
    .checkbox-container input[type="checkbox"] {
        display: none;
    }
    
    .checkmark {
        width: 18px;
        height: 18px;
        border: 1px solid var(--glass-border);
        border-radius: 3px;
        position: relative;
        transition: all 0.3s ease;
    }
    
    .checkbox-container input[type="checkbox"]:checked + .checkmark {
        background: var(--neon-cyan);
        border-color: var(--neon-cyan);
    }
    
    .checkbox-container input[type="checkbox"]:checked + .checkmark::after {
        content: '✓';
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        color: var(--primary-bg);
        font-size: 0.8rem;
        font-weight: bold;
    }
    
    .forgot-password {
        color: var(--neon-cyan);
        text-decoration: none;
        font-size: 0.9rem;
        transition: all 0.3s ease;
    }
    
    .forgot-password:hover {
        color: var(--neon-blue);
        text-shadow: 0 0 10px var(--neon-cyan);
    }
    
    .auth-btn {
        position: relative;
        width: 100%;
        padding: var(--spacing-lg);
        background: var(--neon-cyan);
        color: var(--primary-bg);
        border: none;
        border-radius: var(--radius-md);
        font-size: 1.1rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
        overflow: hidden;
        text-transform: uppercase;
        letter-spacing: 1px;
    }
    
    .auth-btn:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 10px 30px rgba(0, 255, 255, 0.4);
    }
    
    .auth-btn:disabled {
        opacity: 0.7;
        cursor: not-allowed;
    }
    
    .btn-glow {
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
        transition: left 0.5s ease;
    }
    
    .auth-btn:hover .btn-glow {
        left: 100%;
    }
    
    .loading-spinner {
        width: 20px;
        height: 20px;
        border: 2px solid transparent;
        border-top: 2px solid currentColor;
        border-radius: 50%;
        animation: spin 1s linear infinite;
    }
    
    .auth-footer {
        text-align: center;
        margin-top: var(--spacing-lg);
        color: rgba(255, 255, 255, 0.7);
    }
    
    .auth-link {
        color: var(--neon-cyan);
        text-decoration: none;
        transition: all 0.3s ease;
    }
    
    .auth-link:hover {
        color: var(--neon-blue);
        text-shadow: 0 0 10px var(--neon-cyan);
    }
    
    .security-scanner {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 1000;
    }
    
    .scanner-line {
        width: 100%;
        height: 2px;
        background: linear-gradient(90deg, transparent, var(--neon-cyan), transparent);
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
    }
    
    .floating-elements {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: -1;
    }
    
    .floating-icon {
        position: absolute;
        color: var(--neon-cyan);
        font-size: 2rem;
        opacity: 0.1;
    }
    
    .password-strength {
        margin-top: var(--spacing-md);
        padding: var(--spacing-md);
        background: var(--card-bg);
        border-radius: var(--radius-md);
        border: 1px solid var(--glass-border);
    }
    
    .strength-label {
        color: rgba(255, 255, 255, 0.8);
        font-size: 0.9rem;
        margin-bottom: var(--spacing-sm);
    }
    
    .strength-bar {
        width: 100%;
        height: 6px;
        background: var(--glass-bg);
        border-radius: 3px;
        overflow: hidden;
        margin-bottom: var(--spacing-sm);
    }
    
    .strength-fill {
        height: 100%;
        transition: all 0.3s ease;
        border-radius: 3px;
    }
    
    .strength-fill.weak {
        background: var(--status-red);
        width: 25%;
    }
    
    .strength-fill.medium {
        background: var(--status-yellow);
        width: 60%;
    }
    
    .strength-fill.strong {
        background: var(--status-green);
        width: 100%;
    }
    
    .strength-text {
        color: #ffffff;
        font-weight: 500;
        font-size: 0.9rem;
    }
    
    .password-requirements {
        margin-top: var(--spacing-md);
        display: flex;
        flex-direction: column;
        gap: var(--spacing-xs);
    }
    
    .requirement-item {
        display: flex;
        align-items: center;
        gap: var(--spacing-sm);
        font-size: 0.8rem;
        color: var(--status-red);
        transition: all 0.3s ease;
    }
    
    .requirement-item i {
        font-size: 0.7rem;
    }
    
    .input-container.valid .auth-input {
        border-color: var(--status-green);
        box-shadow: 0 0 10px rgba(0, 255, 136, 0.3);
    }
    
    .input-container.invalid .auth-input {
        border-color: var(--status-red);
        box-shadow: 0 0 10px rgba(255, 51, 102, 0.3);
    }
    
    .auth-flash-messages {
        margin-bottom: var(--spacing-lg);
    }
    
    .auth-flash-message {
        background: var(--glass-bg);
        backdrop-filter: blur(20px);
        border: 1px solid var(--glass-border);
        border-radius: var(--radius-md);
        padding: var(--spacing-md);
        margin-bottom: var(--spacing-sm);
        color: #ffffff;
        display: flex;
        align-items: center;
        justify-content: space-between;
        animation: slideInDown 0.3s ease-out;
    }
    
    .flash-success {
        border-left: 4px solid var(--status-green);
    }
    
    .flash-error {
        border-left: 4px solid var(--status-red);
    }
    
    .flash-info {
        border-left: 4px solid var(--neon-cyan);
    }
    
    /* Animations */
    @keyframes logoGlow {
        0%, 100% { box-shadow: 0 0 50px rgba(0, 255, 255, 0.5); }
        50% { box-shadow: 0 0 80px rgba(0, 255, 255, 0.8); }
    }
    
    @keyframes gridMove {
        0% { transform: translate(0, 0); }
        100% { transform: translate(50px, 50px); }
    }
    
    @keyframes particleFloat {
        0% { transform: translateY(100vh) translateX(0); }
        100% { transform: translateY(-100px) translateX(100px); }
    }
    
    @keyframes floatingIcon {
        0%, 100% { transform: translateY(0px) rotate(0deg); }
        50% { transform: translateY(-20px) rotate(180deg); }
    }
    
    @keyframes securityScan {
        0% { transform: translateY(-100vh); }
        100% { transform: translateY(100vh); }
    }
    
    @keyframes securityScanLine {
        0% { left: -100%; }
        100% { left: 100%; }
    }
    
    @keyframes inputTyping {
        0% { transform: scale(1); }
        50% { transform: scale(1.01); }
        100% { transform: scale(1); }
    }
    
    @keyframes inputGlow {
        0%, 100% { opacity: 0.3; }
        50% { opacity: 0.6; }
    }
    
    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translateY(30px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    @keyframes slideInDown {
        from {
            opacity: 0;
            transform: translateY(-20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    .fade-in-up {
        animation: fadeInUp 0.6s ease-out;
    }
    
    /* Responsive Design */
    @media (max-width: 768px) {
        .auth-container {
            flex-direction: column;
        }
        
        .auth-left-panel {
            min-height: 40vh;
        }
        
        .brand-title {
            font-size: 2rem;
        }
        
        .form-row {
            grid-template-columns: 1fr;
        }
        
        .form-options {
            flex-direction: column;
            gap: var(--spacing-md);
            align-items: flex-start;
        }
    }
`;
document.head.appendChild(authStyle);
