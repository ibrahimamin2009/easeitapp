// Futuristic Admin Panel - Advanced Interactions

// Initialize admin panel functionality
document.addEventListener('DOMContentLoaded', function() {
    initializeAdminPanel();
    initializeUserCards();
    initializeSystemMonitoring();
});

function initializeAdminPanel() {
    // Add glow effects to admin elements
    const adminCards = document.querySelectorAll('.user-card, .setting-card');
    adminCards.forEach(card => {
        card.addEventListener('mouseenter', handleAdminCardHover);
        card.addEventListener('mouseleave', handleAdminCardLeave);
    });
}

function initializeUserCards() {
    const userCards = document.querySelectorAll('.user-card');
    
    userCards.forEach(card => {
        // Add 3D tilt effect on hover
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-8px) rotateX(5deg)';
            this.style.boxShadow = '0 20px 60px rgba(0, 0, 0, 0.4)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = '';
            this.style.boxShadow = '';
        });
    });
}

function initializeSystemMonitoring() {
    // Simulate real-time system monitoring
    updateSystemStats();
    setInterval(updateSystemStats, 5000); // Update every 5 seconds
}

function updateSystemStats() {
    // Simulate dynamic system stats
    const cpuElement = document.querySelector('.setting-info p:nth-child(2)');
    const memoryElement = document.querySelector('.setting-info p:nth-child(3)');
    
    if (cpuElement && memoryElement) {
        const cpu = Math.floor(Math.random() * 20) + 60; // 60-80%
        const memory = Math.floor(Math.random() * 15) + 70; // 70-85%
        
        cpuElement.innerHTML = `CPU: <span style="color: ${cpu > 75 ? 'var(--status-red)' : cpu > 60 ? 'var(--status-yellow)' : 'var(--status-green)'};">${cpu}%</span>`;
        memoryElement.innerHTML = `Memory: <span style="color: ${memory > 80 ? 'var(--status-red)' : memory > 70 ? 'var(--status-yellow)' : 'var(--status-green)'};">${memory}%</span>`;
    }
}

// User management functions
function filterUsers(query) {
    const userCards = document.querySelectorAll('.user-card');
    const searchTerm = query.toLowerCase();
    
    userCards.forEach((card, index) => {
        const searchData = card.dataset.search || '';
        const isVisible = searchData.includes(searchTerm);
        
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

function toggleUserStatus(userId) {
    const card = document.querySelector(`[data-user-id="${userId}"]`);
    const statusElement = card.querySelector('.status-indicator');
    const statusDot = statusElement.querySelector('.status-dot');
    
    // Show loading state
    statusElement.innerHTML = '<div class="loading"></div> Updating...';
    
    // Simulate API call
    setTimeout(() => {
        // Toggle status (in real implementation, this would be an API call)
        const isCurrentlyActive = statusElement.classList.contains('status-active');
        
        if (isCurrentlyActive) {
            statusElement.className = 'status-indicator status-inactive';
            statusElement.innerHTML = '<div class="status-dot"></div><span>Inactive</span>';
        } else {
            statusElement.className = 'status-indicator status-active';
            statusElement.innerHTML = '<div class="status-dot"></div><span>Active</span>';
        }
        
        // Show success notification
        showNotification(`User status updated successfully!`, 'success');
    }, 1000);
}

function editUser(userId) {
    const card = document.querySelector(`[data-user-id="${userId}"]`);
    const username = card.querySelector('h3').textContent;
    const email = card.querySelector('p').textContent;
    const role = card.querySelector('.user-role-badge').textContent.toLowerCase();
    const isActive = card.querySelector('.status-indicator').classList.contains('status-active');
    
    // Populate edit modal
    document.getElementById('editUserId').value = userId;
    document.getElementById('editUsername').value = username;
    document.getElementById('editEmail').value = email;
    document.getElementById('editRole').value = role;
    document.getElementById('editIsActive').checked = isActive;
    
    // Show modal with animation
    const modal = document.getElementById('editUserModal');
    modal.style.display = 'block';
    modal.style.animation = 'modalSlideIn 0.3s ease-out';
}

function closeEditUserModal() {
    const modal = document.getElementById('editUserModal');
    modal.style.display = 'none';
}

function viewUserOrders(userId) {
    // Navigate to user's orders (would be implemented as a new route)
    showNotification('Viewing user orders...', 'info');
    // In real implementation: window.location.href = `/admin/user/${userId}/orders`;
}

function deleteUser(userId) {
    const card = document.querySelector(`[data-user-id="${userId}"]`);
    const username = card.querySelector('h3').textContent;
    
    if (confirm(`Are you sure you want to delete user "${username}"? This action cannot be undone.`)) {
        // Show loading state
        card.style.opacity = '0.5';
        card.style.pointerEvents = 'none';
        
        // Simulate deletion
        setTimeout(() => {
            card.style.animation = 'fadeOut 0.5s ease-out';
            setTimeout(() => {
                card.remove();
                showNotification(`User "${username}" deleted successfully!`, 'success');
            }, 500);
        }, 1000);
    }
}

function openSystemBackup() {
    const modal = document.createElement('div');
    modal.className = 'backup-modal';
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
    
    const backupWindow = document.createElement('div');
    backupWindow.style.cssText = `
        background: var(--glass-bg);
        backdrop-filter: blur(20px);
        border: 1px solid var(--glass-border);
        border-radius: var(--radius-lg);
        padding: 2rem;
        max-width: 500px;
        width: 90%;
        color: #ffffff;
        box-shadow: var(--glow-cyan);
        text-align: center;
    `;
    
    backupWindow.innerHTML = `
        <div style="margin-bottom: 2rem;">
            <div style="font-size: 3rem; margin-bottom: 1rem; color: var(--neon-cyan);">💾</div>
            <h3 style="color: var(--neon-cyan); font-family: var(--font-display);">System Backup</h3>
            <p style="opacity: 0.7; margin-top: 1rem;">Create a complete backup of the system data</p>
        </div>
        
        <div style="margin-bottom: 2rem;">
            <div class="backup-progress" style="
                background: var(--glass-bg);
                border-radius: var(--radius-md);
                padding: 1rem;
                margin-bottom: 1rem;
                display: none;
            ">
                <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                    <span>Backup Progress</span>
                    <span class="progress-percentage">0%</span>
                </div>
                <div style="background: var(--glass-bg); border-radius: var(--radius-sm); height: 8px; overflow: hidden;">
                    <div class="progress-bar" style="
                        background: var(--gradient-amber);
                        height: 100%;
                        width: 0%;
                        transition: width 0.3s ease;
                        box-shadow: var(--glow-amber);
                    "></div>
                </div>
            </div>
        </div>
        
        <div style="display: flex; gap: 1rem; justify-content: center;">
            <button onclick="startBackup(this)" class="btn btn-primary">
                <i class="fas fa-download"></i> Start Backup
            </button>
            <button onclick="this.closest('.backup-modal').remove()" class="btn btn-secondary">
                Cancel
            </button>
        </div>
    `;
    
    modal.appendChild(backupWindow);
    document.body.appendChild(modal);
    
    // Close on background click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

function startBackup(button) {
    const progressContainer = button.parentElement.previousElementSibling.querySelector('.backup-progress');
    const progressBar = progressContainer.querySelector('.progress-bar');
    const progressPercentage = progressContainer.querySelector('.progress-percentage');
    
    // Show progress
    progressContainer.style.display = 'block';
    button.disabled = true;
    button.innerHTML = '<div class="loading"></div> Backing Up...';
    
    // Simulate backup progress
    let progress = 0;
    const interval = setInterval(() => {
        progress += Math.random() * 15;
        if (progress > 100) progress = 100;
        
        progressBar.style.width = progress + '%';
        progressPercentage.textContent = Math.round(progress) + '%';
        
        if (progress >= 100) {
            clearInterval(interval);
            setTimeout(() => {
                showNotification('System backup completed successfully!', 'success');
                document.querySelector('.backup-modal').remove();
            }, 1000);
        }
    }, 200);
}

// Form submission for edit user
document.addEventListener('DOMContentLoaded', function() {
    const editForm = document.getElementById('editUserForm');
    if (editForm) {
        editForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = new FormData(this);
            const userId = formData.get('user_id');
            
            // Show loading state
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<div class="loading"></div> Updating...';
            submitBtn.disabled = true;
            
            // Simulate API call
            setTimeout(() => {
                // Update the user card with new data
                const card = document.querySelector(`[data-user-id="${userId}"]`);
                if (card) {
                    card.querySelector('h3').textContent = formData.get('username');
                    card.querySelector('p').textContent = formData.get('email');
                    card.querySelector('.user-role-badge').textContent = formData.get('role').charAt(0).toUpperCase() + formData.get('role').slice(1);
                    
                    // Update status if changed
                    const isActive = formData.get('is_active') === 'on';
                    const statusElement = card.querySelector('.status-indicator');
                    if (isActive) {
                        statusElement.className = 'status-indicator status-active';
                        statusElement.innerHTML = '<div class="status-dot"></div><span>Active</span>';
                    } else {
                        statusElement.className = 'status-indicator status-inactive';
                        statusElement.innerHTML = '<div class="status-dot"></div><span>Inactive</span>';
                    }
                }
                
                // Reset form and close modal
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
                closeEditUserModal();
                showNotification('User updated successfully!', 'success');
            }, 1500);
        });
    }
});

// Admin card hover effects
function handleAdminCardHover(e) {
    const card = e.currentTarget;
    
    // Add glow effect
    card.style.boxShadow = '0 0 30px rgba(0, 255, 255, 0.3)';
    
    // Create scanning line effect
    const scanLine = document.createElement('div');
    scanLine.className = 'scan-line';
    scanLine.style.cssText = `
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(0, 255, 255, 0.1), transparent);
        pointer-events: none;
        animation: scanLine 2s ease-in-out infinite;
    `;
    
    card.style.position = 'relative';
    card.appendChild(scanLine);
}

function handleAdminCardLeave(e) {
    const card = e.currentTarget;
    
    // Remove glow effect
    card.style.boxShadow = '';
    
    // Remove scan line
    const scanLine = card.querySelector('.scan-line');
    if (scanLine) {
        scanLine.remove();
    }
}

// Add CSS animations for admin panel
const adminStyle = document.createElement('style');
adminStyle.textContent = `
    @keyframes scanLine {
        0% { left: -100%; }
        100% { left: 100%; }
    }
    
    .user-card {
        background: var(--card-bg);
        backdrop-filter: blur(20px);
        border: 1px solid var(--glass-border);
        border-radius: var(--radius-md);
        padding: var(--spacing-lg);
        margin-bottom: var(--spacing-md);
        transition: all 0.3s ease;
        position: relative;
        overflow: hidden;
    }
    
    .user-card:hover {
        transform: translateY(-4px);
        border-color: var(--neon-cyan);
    }
    
    .user-header {
        display: flex;
        align-items: center;
        gap: var(--spacing-md);
        margin-bottom: var(--spacing-md);
    }
    
    .user-avatar {
        position: relative;
    }
    
    .avatar-glow {
        width: 50px;
        height: 50px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--primary-bg);
        font-size: 1.2rem;
        box-shadow: 0 0 20px currentColor;
    }
    
    .user-info {
        flex: 1;
    }
    
    .user-info h3 {
        color: #ffffff;
        margin: 0 0 0.25rem 0;
        font-size: 1.1rem;
    }
    
    .user-info p {
        color: rgba(255, 255, 255, 0.7);
        margin: 0 0 0.5rem 0;
        font-size: 0.9rem;
    }
    
    .user-role-badge {
        background: var(--glass-bg);
        color: var(--neon-cyan);
        padding: 0.25rem 0.5rem;
        border-radius: var(--radius-sm);
        font-size: 0.8rem;
        font-weight: 500;
        border: 1px solid var(--glass-border);
        display: inline-block;
    }
    
    .status-indicator {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.9rem;
        font-weight: 500;
    }
    
    .status-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        box-shadow: 0 0 10px currentColor;
    }
    
    .status-active .status-dot {
        background: var(--status-green);
        color: var(--status-green);
    }
    
    .status-inactive .status-dot {
        background: var(--status-red);
        color: var(--status-red);
    }
    
    .user-details {
        margin-bottom: var(--spacing-md);
    }
    
    .detail-row {
        display: flex;
        justify-content: space-between;
        margin-bottom: 0.5rem;
        font-size: 0.9rem;
    }
    
    .detail-label {
        color: rgba(255, 255, 255, 0.7);
    }
    
    .detail-value {
        color: #ffffff;
        font-weight: 500;
    }
    
    .user-actions {
        display: flex;
        gap: 0.5rem;
        justify-content: flex-end;
    }
    
    .setting-card {
        background: var(--card-bg);
        backdrop-filter: blur(20px);
        border: 1px solid var(--glass-border);
        border-radius: var(--radius-md);
        padding: var(--spacing-lg);
        display: flex;
        align-items: center;
        gap: var(--spacing-md);
        transition: all 0.3s ease;
    }
    
    .setting-card:hover {
        transform: translateY(-2px);
        border-color: var(--neon-cyan);
    }
    
    .setting-icon {
        width: 50px;
        height: 50px;
        background: var(--glass-bg);
        border-radius: var(--radius-md);
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--neon-cyan);
        font-size: 1.5rem;
        border: 1px solid var(--glass-border);
    }
    
    .setting-info {
        flex: 1;
    }
    
    .setting-info h4 {
        color: #ffffff;
        margin: 0 0 0.5rem 0;
        font-size: 1.1rem;
    }
    
    .setting-info p {
        color: rgba(255, 255, 255, 0.7);
        margin: 0.25rem 0;
        font-size: 0.9rem;
    }
    
    .admin-actions {
        display: flex;
        gap: var(--spacing-md);
        align-items: center;
    }
`;
document.head.appendChild(adminStyle);
