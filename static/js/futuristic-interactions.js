// Futuristic Yarn Management System - Advanced Interactions

// Global state
let currentView = 'board';
let draggedElement = null;
let dragTrail = null;

// Initialize futuristic interactions
document.addEventListener('DOMContentLoaded', function() {
    initializeFuturisticUI();
    initializeAdvancedDragAndDrop();
    initializeHolographicSearch();
    initializeCardAnimations();
    initializeAssistantOrb();
});

// Initialize futuristic UI elements
function initializeFuturisticUI() {
    // Add glow effects to active elements
    const activeElements = document.querySelectorAll('.sidebar-item.active, .toggle-btn.active');
    activeElements.forEach(el => {
        el.classList.add('glow-animation');
    });

    // Initialize card hover effects
    const cards = document.querySelectorAll('.card');
    cards.forEach(card => {
        card.addEventListener('mouseenter', handleCardHover);
        card.addEventListener('mouseleave', handleCardLeave);
    });

    // Add sparkle effects to AI button
    const aiButton = document.querySelector('.ai-sort-btn');
    if (aiButton) {
        aiButton.addEventListener('click', createSparkleEffect);
    }
}

// Advanced drag and drop with visual effects
function initializeAdvancedDragAndDrop() {
    const cards = document.querySelectorAll('.card');
    const columns = document.querySelectorAll('.column');

    cards.forEach(card => {
        card.addEventListener('dragstart', handleAdvancedDragStart);
        card.addEventListener('dragend', handleAdvancedDragEnd);
    });

    columns.forEach(column => {
        column.addEventListener('dragover', handleAdvancedDragOver);
        column.addEventListener('drop', handleAdvancedDrop);
        column.addEventListener('dragenter', handleAdvancedDragEnter);
        column.addEventListener('dragleave', handleAdvancedDragLeave);
    });
}

function handleAdvancedDragStart(e) {
    draggedElement = this;
    this.classList.add('dragging');
    
    // Create drag trail effect
    createDragTrail();
    
    // Add 3D tilt effect
    this.style.transform = 'rotate(5deg) scale(1.05)';
    this.style.zIndex = '1000';
    
    // Create holographic overlay
    createHolographicOverlay(this);
    
    // Set drag image to custom element
    const dragImage = createDragImage(this);
    e.dataTransfer.setDragImage(dragImage, 0, 0);
}

function handleAdvancedDragEnd(e) {
    this.classList.remove('dragging');
    this.style.transform = '';
    this.style.zIndex = '';
    
    // Remove drag trail
    if (dragTrail) {
        dragTrail.remove();
        dragTrail = null;
    }
    
    // Remove holographic overlay
    const overlay = document.querySelector('.holographic-overlay');
    if (overlay) {
        overlay.remove();
    }
    
    draggedElement = null;
}

function handleAdvancedDragOver(e) {
    e.preventDefault();
    
    // Create magnetic snapping effect
    const rect = this.getBoundingClientRect();
    const mouseY = e.clientY - rect.top;
    
    if (mouseY < rect.height * 0.3) {
        this.classList.add('snap-top');
    } else if (mouseY > rect.height * 0.7) {
        this.classList.add('snap-bottom');
    } else {
        this.classList.remove('snap-top', 'snap-bottom');
        this.classList.add('snap-middle');
    }
}

function handleAdvancedDragEnter(e) {
    e.preventDefault();
    this.classList.add('drop-zone');
    
    // Add column glow effect
    this.style.boxShadow = '0 0 30px rgba(0, 255, 255, 0.4)';
}

function handleAdvancedDragLeave(e) {
    this.classList.remove('drop-zone', 'snap-top', 'snap-bottom', 'snap-middle');
    this.style.boxShadow = '';
}

function handleAdvancedDrop(e) {
    e.preventDefault();
    this.classList.remove('drop-zone', 'snap-top', 'snap-bottom', 'snap-middle');
    this.style.boxShadow = '';
    
    if (draggedElement) {
        const newStatus = this.dataset.status;
        const orderId = draggedElement.dataset.orderId;
        
        // Animate card placement
        animateCardPlacement(draggedElement, this);
        
        // Send request to server
        moveCardToStatus(orderId, newStatus);
    }
}

// Create drag trail effect
function createDragTrail() {
    dragTrail = document.createElement('div');
    dragTrail.className = 'drag-trail';
    dragTrail.style.cssText = `
        position: fixed;
        width: 4px;
        height: 4px;
        background: var(--neon-cyan);
        border-radius: 50%;
        pointer-events: none;
        z-index: 9999;
        box-shadow: 0 0 10px var(--neon-cyan);
        animation: trailFade 0.5s ease-out forwards;
    `;
    
    document.body.appendChild(dragTrail);
    
    // Follow mouse
    document.addEventListener('mousemove', updateDragTrail);
}

function updateDragTrail(e) {
    if (dragTrail) {
        dragTrail.style.left = e.clientX - 2 + 'px';
        dragTrail.style.top = e.clientY - 2 + 'px';
    }
}

// Create holographic overlay for dragged element
function createHolographicOverlay(element) {
    const overlay = document.createElement('div');
    overlay.className = 'holographic-overlay';
    overlay.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(45deg, transparent 30%, rgba(0, 255, 255, 0.1) 50%, transparent 70%);
        pointer-events: none;
        animation: holographicScan 1s linear infinite;
        border-radius: inherit;
    `;
    
    element.appendChild(overlay);
}

// Create custom drag image
function createDragImage(element) {
    const dragImage = element.cloneNode(true);
    dragImage.style.cssText = `
        position: absolute;
        top: -1000px;
        left: -1000px;
        opacity: 0.8;
        transform: rotate(5deg);
        box-shadow: 0 0 30px var(--neon-cyan);
    `;
    
    document.body.appendChild(dragImage);
    
    setTimeout(() => {
        document.body.removeChild(dragImage);
    }, 0);
    
    return dragImage;
}

// Animate card placement
function animateCardPlacement(card, targetColumn) {
    const targetCards = targetColumn.querySelector('.cards-container');
    
    // Create placement effect
    const placementEffect = document.createElement('div');
    placementEffect.className = 'placement-effect';
    placementEffect.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: radial-gradient(circle, rgba(0, 255, 255, 0.3) 0%, transparent 70%);
        border-radius: inherit;
        animation: placementPulse 0.6s ease-out;
        pointer-events: none;
    `;
    
    targetColumn.appendChild(placementEffect);
    
    // Move card with animation
    targetCards.appendChild(card);
    
    // Remove effect after animation
    setTimeout(() => {
        if (placementEffect.parentNode) {
            placementEffect.remove();
        }
    }, 600);
}

// Holographic search functionality
function initializeHolographicSearch() {
    const searchBar = document.getElementById('holographicSearch');
    
    if (searchBar) {
        searchBar.addEventListener('focus', handleSearchFocus);
        searchBar.addEventListener('blur', handleSearchBlur);
        searchBar.addEventListener('input', handleSearchInput);
    }
}

function handleSearchFocus(e) {
    e.target.style.transform = 'scale(1.02)';
    e.target.style.boxShadow = '0 0 40px rgba(0, 255, 255, 0.6)';
    
    // Create search glow effect
    createSearchGlow(e.target);
}

function handleSearchBlur(e) {
    e.target.style.transform = '';
    e.target.style.boxShadow = '';
    
    // Remove search glow
    const glow = document.querySelector('.search-glow');
    if (glow) {
        glow.remove();
    }
}

function handleSearchInput(e) {
    const query = e.target.value.toLowerCase();
    
    // Add typing effect
    e.target.style.borderColor = 'var(--neon-cyan)';
    
    // Filter cards with animation
    filterCardsWithAnimation(query);
    
    // Reset border color after typing stops
    clearTimeout(e.target.typingTimeout);
    e.target.typingTimeout = setTimeout(() => {
        e.target.style.borderColor = 'var(--glass-border)';
    }, 1000);
}

function createSearchGlow(element) {
    const glow = document.createElement('div');
    glow.className = 'search-glow';
    glow.style.cssText = `
        position: absolute;
        top: -2px;
        left: -2px;
        right: -2px;
        bottom: -2px;
        background: linear-gradient(45deg, var(--neon-cyan), var(--neon-blue), var(--neon-cyan));
        border-radius: inherit;
        opacity: 0.3;
        z-index: -1;
        animation: searchGlow 2s ease-in-out infinite;
    `;
    
    element.parentNode.style.position = 'relative';
    element.parentNode.appendChild(glow);
}

// Filter cards with smooth animation
function filterCardsWithAnimation(query) {
    const cards = document.querySelectorAll('.card');
    
    cards.forEach((card, index) => {
        const searchData = card.dataset.search || '';
        const isVisible = searchData.includes(query);
        
        // Stagger animation for smooth effect
        setTimeout(() => {
            if (isVisible) {
                card.style.display = 'block';
                card.style.animation = 'fadeInUp 0.3s ease-out';
            } else {
                card.style.animation = 'fadeOut 0.3s ease-out';
                setTimeout(() => {
                    card.style.display = 'none';
                }, 300);
            }
        }, index * 50);
    });
}

// AI Sort Orders functionality
function aiSortOrders() {
    const cards = document.querySelectorAll('.card');
    const sortButton = document.querySelector('.ai-sort-btn');
    
    // Add loading state
    sortButton.innerHTML = '<div class="loading"></div> AI Sorting...';
    sortButton.disabled = true;
    
    // Create AI sorting animation
    createAISortingEffect();
    
    // Simulate AI processing
    setTimeout(() => {
        // Sort by amount (highest first)
        const sortedCards = Array.from(cards).sort((a, b) => {
            const amountA = parseFloat(a.querySelector('.card-details').textContent.match(/\$([\d,]+)/)[1].replace(',', ''));
            const amountB = parseFloat(b.querySelector('.card-details').textContent.match(/\$([\d,]+)/)[1].replace(',', ''));
            return amountB - amountA;
        });
        
        // Animate reordering
        animateAISort(sortedCards);
        
        // Reset button
        sortButton.innerHTML = '✨ AI Sort Orders';
        sortButton.disabled = false;
        
        // Show completion effect
        showAICompletionEffect();
    }, 2000);
}

function createAISortingEffect() {
    const overlay = document.createElement('div');
    overlay.className = 'ai-sorting-overlay';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        backdrop-filter: blur(10px);
    `;
    
    const aiText = document.createElement('div');
    aiText.innerHTML = `
        <div style="text-align: center; color: var(--neon-cyan); font-family: var(--font-display);">
            <div style="font-size: 3rem; margin-bottom: 1rem;">🤖</div>
            <div style="font-size: 1.5rem; margin-bottom: 1rem;">AI Analyzing Orders...</div>
            <div style="font-size: 1rem; opacity: 0.7;">Sorting by priority and value</div>
        </div>
    `;
    
    overlay.appendChild(aiText);
    document.body.appendChild(overlay);
    
    // Remove overlay after sorting
    setTimeout(() => {
        overlay.remove();
    }, 2000);
}

function animateAISort(sortedCards) {
    const columns = document.querySelectorAll('.column');
    
    columns.forEach(column => {
        const cardsContainer = column.querySelector('.cards-container');
        const columnCards = Array.from(cardsContainer.children);
        
        // Clear container
        cardsContainer.innerHTML = '';
        
        // Add cards back in sorted order with animation
        columnCards.forEach((card, index) => {
            setTimeout(() => {
                cardsContainer.appendChild(card);
                card.style.animation = 'fadeInUp 0.5s ease-out';
            }, index * 100);
        });
    });
}

function showAICompletionEffect() {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: var(--glass-bg);
        backdrop-filter: blur(20px);
        border: 1px solid var(--glass-border);
        border-radius: var(--radius-lg);
        padding: 2rem;
        color: var(--neon-cyan);
        font-family: var(--font-display);
        text-align: center;
        z-index: 10001;
        box-shadow: var(--glow-cyan);
        animation: aiCompletion 2s ease-out forwards;
    `;
    
    notification.innerHTML = `
        <div style="font-size: 2rem; margin-bottom: 1rem;">✨</div>
        <div style="font-size: 1.2rem;">Orders sorted by AI!</div>
        <div style="font-size: 0.9rem; opacity: 0.7; margin-top: 0.5rem;">Optimized for efficiency</div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 2000);
}

// Card hover effects
function handleCardHover(e) {
    const card = e.currentTarget;
    const actions = card.querySelector('.card-actions');
    
    if (actions) {
        actions.style.opacity = '1';
    }
    
    // Add hover glow
    card.style.boxShadow = '0 0 30px rgba(0, 255, 255, 0.3)';
    
    // Create yarn trail effect
    createYarnTrailEffect(card);
}

function handleCardLeave(e) {
    const card = e.currentTarget;
    const actions = card.querySelector('.card-actions');
    
    if (actions) {
        actions.style.opacity = '0';
    }
    
    // Remove hover glow
    card.style.boxShadow = '';
    
    // Remove yarn trail
    const trail = document.querySelector('.yarn-trail');
    if (trail) {
        trail.remove();
    }
}

function createYarnTrailEffect(card) {
    const trail = document.createElement('div');
    trail.className = 'yarn-trail';
    trail.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        border: 2px solid var(--neon-cyan);
        border-radius: inherit;
        pointer-events: none;
        opacity: 0.5;
        animation: yarnTrail 2s ease-in-out infinite;
    `;
    
    card.appendChild(trail);
}

// Assistant Orb functionality
function initializeAssistantOrb() {
    const orb = document.querySelector('.assistant-orb');
    
    if (orb) {
        orb.addEventListener('click', openAssistant);
        
        // Add floating animation
        orb.style.animation = 'float 3s ease-in-out infinite';
    }
}

function openAssistant() {
    const modal = document.createElement('div');
    modal.className = 'assistant-modal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        backdrop-filter: blur(10px);
    `;
    
    const assistantWindow = document.createElement('div');
    assistantWindow.style.cssText = `
        background: var(--glass-bg);
        backdrop-filter: blur(20px);
        border: 1px solid var(--glass-border);
        border-radius: var(--radius-lg);
        padding: 2rem;
        max-width: 500px;
        width: 90%;
        color: #ffffff;
        box-shadow: var(--glow-cyan);
    `;
    
    assistantWindow.innerHTML = `
        <div style="text-align: center; margin-bottom: 2rem;">
            <div style="font-size: 3rem; margin-bottom: 1rem;">🤖</div>
            <h3 style="color: var(--neon-cyan); font-family: var(--font-display);">AI Assistant</h3>
        </div>
        
        <div style="margin-bottom: 1.5rem;">
            <h4 style="color: var(--neon-cyan); margin-bottom: 1rem;">Quick Actions:</h4>
            <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                <button onclick="aiSortOrders()" class="btn btn-secondary" style="justify-content: flex-start;">
                    ✨ Sort orders by priority
                </button>
                <button onclick="generateReport()" class="btn btn-secondary" style="justify-content: flex-start;">
                    📊 Generate weekly report
                </button>
                <button onclick="predictDelays()" class="btn btn-secondary" style="justify-content: flex-start;">
                    🔮 Predict delivery delays
                </button>
            </div>
        </div>
        
        <div style="margin-bottom: 1.5rem;">
            <h4 style="color: var(--neon-cyan); margin-bottom: 1rem;">Voice Commands:</h4>
            <p style="opacity: 0.7; font-size: 0.9rem;">
                "Sort orders by value"<br>
                "Show overdue orders"<br>
                "Create new order"
            </p>
        </div>
        
        <button onclick="this.closest('.assistant-modal').remove()" class="btn btn-primary" style="width: 100%;">
            Close Assistant
        </button>
    `;
    
    modal.appendChild(assistantWindow);
    document.body.appendChild(modal);
    
    // Close on background click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

// View switching functionality
function switchView(view) {
    currentView = view;
    
    // Update toggle buttons
    document.querySelectorAll('.toggle-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Switch views
    const boardView = document.getElementById('boardView');
    const dashboardView = document.getElementById('dashboardView');
    
    if (view === 'board') {
        boardView.style.display = 'block';
        dashboardView.style.display = 'none';
    } else {
        boardView.style.display = 'none';
        dashboardView.style.display = 'block';
    }
    
    // Add transition effect
    const activeView = view === 'board' ? boardView : dashboardView;
    activeView.style.animation = 'fadeInUp 0.5s ease-out';
}

// Navigation functionality
function navigateTo(page) {
    switch(page) {
        case 'dashboard':
            window.location.href = '/dashboard';
            break;
        case 'suppliers':
            // Future implementation
            break;
        case 'messages':
            // Future implementation
            break;
        case 'analytics':
            switchView('dashboard');
            break;
        case 'admin':
            window.location.href = '/admin_panel';
            break;
    }
}

function logout() {
    window.location.href = '/logout';
}

// Utility functions
function moveCardToStatus(orderId, newStatus) {
    fetch('/move_order', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            order_id: orderId,
            status: newStatus
        })
    })
    .then(response => response.json())
    .then(data => {
        if (!data.success) {
            showNotification(data.message, 'error');
            // Revert the move
            location.reload();
        } else {
            showNotification('Order moved successfully!', 'success');
        }
    })
    .catch(error => {
        showNotification('Error moving order', 'error');
        console.error('Error:', error);
    });
}

function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type} fade-in`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 2rem;
        border-radius: var(--radius-md);
        color: white;
        font-weight: 500;
        z-index: 10000;
        transform: translateX(100%);
        transition: transform 0.3s ease;
        background: ${type === 'success' ? 'var(--status-green)' : 'var(--status-red)'};
        box-shadow: 0 0 20px rgba(0, 0, 0, 0.3);
    `;
    
    notification.textContent = message;
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 10);
    
    // Auto-hide after 3 seconds
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// AI Functions
function generateReport() {
    showNotification('Generating weekly report...', 'info');
    // Implementation for report generation
}

function predictDelays() {
    showNotification('Analyzing delivery patterns...', 'info');
    // Implementation for delay prediction
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes trailFade {
        0% { opacity: 1; transform: scale(1); }
        100% { opacity: 0; transform: scale(0.5); }
    }
    
    @keyframes holographicScan {
        0% { transform: translateX(-100%); }
        100% { transform: translateX(100%); }
    }
    
    @keyframes placementPulse {
        0% { opacity: 0; transform: scale(0.8); }
        50% { opacity: 0.5; transform: scale(1.1); }
        100% { opacity: 0; transform: scale(1); }
    }
    
    @keyframes searchGlow {
        0%, 100% { opacity: 0.3; }
        50% { opacity: 0.6; }
    }
    
    @keyframes aiCompletion {
        0% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
        50% { opacity: 1; transform: translate(-50%, -50%) scale(1.1); }
        100% { opacity: 0; transform: translate(-50%, -50%) scale(1); }
    }
    
    @keyframes yarnTrail {
        0%, 100% { opacity: 0.3; }
        50% { opacity: 0.7; }
    }
    
    @keyframes float {
        0%, 100% { transform: translateY(0px); }
        50% { transform: translateY(-10px); }
    }
    
    @keyframes fadeOut {
        0% { opacity: 1; transform: scale(1); }
        100% { opacity: 0; transform: scale(0.8); }
    }
`;
document.head.appendChild(style);
