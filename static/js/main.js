// Main JavaScript functionality for the Yarn Purchasing System

document.addEventListener('DOMContentLoaded', function() {
    // Initialize tooltips and interactive elements
    initializeTooltips();
    
    // Initialize drag and drop if on dashboard
    if (document.querySelector('.board-container')) {
        initializeDragAndDrop();
    }
    
    // Initialize chat functionality if on chat page
    if (document.querySelector('.chat-container')) {
        initializeChat();
    }
    
    // Initialize modals
    initializeModals();
    
    // Auto-hide flash messages
    autoHideFlashMessages();
});

function initializeTooltips() {
    // Add tooltips to buttons and interactive elements
    const tooltipElements = document.querySelectorAll('[title]');
    tooltipElements.forEach(element => {
        element.addEventListener('mouseenter', showTooltip);
        element.addEventListener('mouseleave', hideTooltip);
    });
}

function showTooltip(event) {
    const element = event.target;
    const tooltip = document.createElement('div');
    tooltip.className = 'tooltip';
    tooltip.textContent = element.getAttribute('title');
    tooltip.style.cssText = `
        position: absolute;
        background: #333;
        color: white;
        padding: 0.5rem;
        border-radius: 5px;
        font-size: 0.85rem;
        z-index: 1000;
        pointer-events: none;
        opacity: 0;
        transition: opacity 0.3s ease;
    `;
    
    document.body.appendChild(tooltip);
    
    const rect = element.getBoundingClientRect();
    tooltip.style.left = rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2) + 'px';
    tooltip.style.top = rect.top - tooltip.offsetHeight - 10 + 'px';
    
    setTimeout(() => tooltip.style.opacity = '1', 10);
}

function hideTooltip() {
    const tooltip = document.querySelector('.tooltip');
    if (tooltip) {
        tooltip.remove();
    }
}

function initializeDragAndDrop() {
    const cards = document.querySelectorAll('.card');
    const lists = document.querySelectorAll('.cards-container');
    
    cards.forEach(card => {
        card.addEventListener('dragstart', handleDragStart);
        card.addEventListener('dragend', handleDragEnd);
    });
    
    lists.forEach(list => {
        list.addEventListener('dragover', handleDragOver);
        list.addEventListener('drop', handleDrop);
        list.addEventListener('dragenter', handleDragEnter);
        list.addEventListener('dragleave', handleDragLeave);
    });
}

let draggedCard = null;

function handleDragStart(e) {
    draggedCard = this;
    this.classList.add('dragging');
    
    // Add visual feedback
    this.style.opacity = '0.5';
    this.style.transform = 'rotate(5deg)';
}

function handleDragEnd(e) {
    this.classList.remove('dragging');
    this.style.opacity = '1';
    this.style.transform = 'none';
    draggedCard = null;
}

function handleDragOver(e) {
    e.preventDefault();
}

function handleDragEnter(e) {
    e.preventDefault();
    this.classList.add('drag-over');
}

function handleDragLeave(e) {
    this.classList.remove('drag-over');
}

function handleDrop(e) {
    e.preventDefault();
    this.classList.remove('drag-over');
    
    if (draggedCard) {
        const newStatus = this.dataset.status;
        const orderId = draggedCard.dataset.orderId;
        
        // Move card visually
        this.appendChild(draggedCard);
        
        // Send request to server
        moveCard(orderId, newStatus);
    }
}

function moveCard(orderId, newStatus) {
    showLoading(true);
    
    fetch('/move_order', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            order_id: orderId,
            new_status: newStatus
        })
    })
    .then(response => response.json())
    .then(data => {
        showLoading(false);
        if (!data.success) {
            showNotification(data.message, 'error');
            // Revert the move
            location.reload();
        } else {
            showNotification('Order moved successfully!', 'success');
        }
    })
    .catch(error => {
        showLoading(false);
        showNotification('Error moving order', 'error');
        console.error('Error:', error);
    });
}

function initializeChat() {
    const chatForm = document.getElementById('chatForm');
    const messageInput = document.getElementById('messageInput');
    const chatMessages = document.getElementById('chatMessages');
    
    if (chatForm && messageInput) {
        chatForm.addEventListener('submit', handleChatSubmit);
        
        // Auto-resize textarea
        messageInput.addEventListener('input', function() {
            this.style.height = 'auto';
            this.style.height = this.scrollHeight + 'px';
        });
        
        // Auto-scroll to bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;
        
        // Auto-refresh messages every 5 seconds
        setInterval(refreshChatMessages, 5000);
    }
}

function handleChatSubmit(e) {
    e.preventDefault();
    
    const messageInput = document.getElementById('messageInput');
    const orderId = document.getElementById('orderId').value;
    const message = messageInput.value.trim();
    
    if (!message) return;
    
    // Get tagged agents
    const taggedAgents = [];
    const checkboxes = document.querySelectorAll('input[name="tagged_agents"]:checked');
    checkboxes.forEach(checkbox => {
        taggedAgents.push(parseInt(checkbox.value));
    });
    
    // Disable form temporarily
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
    submitBtn.disabled = true;
    
    fetch('/send_message', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            order_id: orderId,
            message: message,
            tagged_agents: taggedAgents
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            addMessageToChat(message, true);
            messageInput.value = '';
            messageInput.style.height = 'auto';
            // Clear checkboxes
            checkboxes.forEach(checkbox => checkbox.checked = false);
        } else {
            showNotification('Error sending message', 'error');
        }
    })
    .catch(error => {
        showNotification('Error sending message', 'error');
        console.error('Error:', error);
    })
    .finally(() => {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    });
}

function addMessageToChat(message, isSent) {
    const chatMessages = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isSent ? 'message-sent' : 'message-received'}`;
    
    const now = new Date();
    const timeString = now.getHours().toString().padStart(2, '0') + ':' + 
                      now.getMinutes().toString().padStart(2, '0');
    
    messageDiv.innerHTML = `
        <div class="message-header">
            <span class="message-sender">${isSent ? 'You' : 'Other'}</span>
            <span class="message-time">${timeString}</span>
        </div>
        <div class="message-content">
            ${escapeHtml(message)}
        </div>
    `;
    
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function refreshChatMessages() {
    // This would typically fetch new messages from the server
    // For now, we'll implement a simple refresh mechanism
    const chatMessages = document.getElementById('chatMessages');
    if (chatMessages) {
        // Check for new messages (simplified implementation)
        // In a real application, you'd make an AJAX request here
    }
}

function initializeModals() {
    // Close modals when clicking outside
    window.addEventListener('click', function(event) {
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        });
    });
    
    // Close modals with Escape key
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            const modals = document.querySelectorAll('.modal');
            modals.forEach(modal => {
                if (modal.style.display === 'block') {
                    modal.style.display = 'none';
                }
            });
        }
    });
}

function autoHideFlashMessages() {
    const flashMessages = document.querySelectorAll('.flash-message');
    flashMessages.forEach(message => {
        setTimeout(() => {
            message.style.opacity = '0';
            setTimeout(() => message.remove(), 300);
        }, 5000);
    });
}

// Utility functions
function showLoading(show) {
    const loadingOverlay = document.getElementById('loadingOverlay') || createLoadingOverlay();
    loadingOverlay.style.display = show ? 'flex' : 'none';
}

function createLoadingOverlay() {
    const overlay = document.createElement('div');
    overlay.id = 'loadingOverlay';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: none;
        justify-content: center;
        align-items: center;
        z-index: 9999;
    `;
    
    const spinner = document.createElement('div');
    spinner.style.cssText = `
        width: 50px;
        height: 50px;
        border: 5px solid #f3f3f3;
        border-top: 5px solid #667eea;
        border-radius: 50%;
        animation: spin 1s linear infinite;
    `;
    
    overlay.appendChild(spinner);
    document.body.appendChild(overlay);
    return overlay;
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 2rem;
        border-radius: 10px;
        color: white;
        font-weight: 500;
        z-index: 10000;
        transform: translateX(100%);
        transition: transform 0.3s ease;
    `;
    
    // Set background color based on type
    const colors = {
        success: '#28a745',
        error: '#dc3545',
        info: '#17a2b8',
        warning: '#ffc107'
    };
    notification.style.background = colors[type] || colors.info;
    
    notification.textContent = message;
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 10);
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => notification.remove(), 300);
    }, 5000);
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Form validation
function validateForm(form) {
    const requiredFields = form.querySelectorAll('[required]');
    let isValid = true;
    
    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            field.style.borderColor = '#dc3545';
            isValid = false;
        } else {
            field.style.borderColor = '#e9ecef';
        }
    });
    
    return isValid;
}

// AJAX helper function
function makeRequest(url, options = {}) {
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
        }
    };
    
    const mergedOptions = { ...defaultOptions, ...options };
    
    return fetch(url, mergedOptions)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        });
}

// Export functions for global use
window.openCreateCardModal = function() {
    document.getElementById('createCardModal').style.display = 'block';
};

window.closeCreateCardModal = function() {
    document.getElementById('createCardModal').style.display = 'none';
    document.getElementById('createCardForm').reset();
};

window.openAssignModal = function(cardId) {
    document.getElementById('assignCardId').value = cardId;
    document.getElementById('assignModal').style.display = 'block';
};

window.closeAssignModal = function() {
    document.getElementById('assignModal').style.display = 'none';
    document.getElementById('assignForm').reset();
};

window.openChat = function(orderId) {
    window.location.href = '/chat/' + orderId;
};

window.deleteOrder = function(orderId) {
    if (confirm('Are you sure you want to delete this order? This action cannot be undone.')) {
        fetch('/delete_order', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                order_id: orderId
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Remove the order card from the DOM
                const orderCard = document.querySelector(`[data-order-id="${orderId}"]`);
                if (orderCard) {
                    orderCard.remove();
                }
                
                // Show success message
                alert('Order deleted successfully');
                
                // Reload the page to update the dashboard
                location.reload();
            } else {
                alert('Error: ' + data.message);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Error deleting order');
        });
    }
};
