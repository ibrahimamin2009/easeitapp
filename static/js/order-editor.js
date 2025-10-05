// Futuristic Order Editor - Advanced Form Management

let formData = {};
let originalFormData = {};
let hasUnsavedChanges = false;

// Initialize order editor
document.addEventListener('DOMContentLoaded', function() {
    initializeOrderEditor();
    initializeFormValidation();
    initializeAutoSave();
    initializeFieldEffects();
});

function initializeOrderEditor() {
    // Store original form data
    storeOriginalFormData();
    
    // Add real-time form monitoring
    const form = document.getElementById('orderForm');
    const inputs = form.querySelectorAll('input, select, textarea');
    
    inputs.forEach(input => {
        input.addEventListener('input', handleFieldChange);
        input.addEventListener('change', handleFieldChange);
    });
    
    // Add yarn type preview update
    const yarnTypeInput = document.getElementById('yarnType');
    if (yarnTypeInput) {
        yarnTypeInput.addEventListener('input', updateYarnPreview);
    }
    
    // Add character counter for notes
    const notesTextarea = document.getElementById('notes');
    if (notesTextarea) {
        notesTextarea.addEventListener('input', updateCharacterCount);
        updateCharacterCount(); // Initial count
    }
    
    // Warn before leaving with unsaved changes
    window.addEventListener('beforeunload', handleBeforeUnload);
}

function storeOriginalFormData() {
    const form = document.getElementById('orderForm');
    const inputs = form.querySelectorAll('input, select, textarea');
    
    inputs.forEach(input => {
        if (input.name) {
            originalFormData[input.name] = input.value;
        }
    });
}

function handleFieldChange(event) {
    const field = event.target;
    const fieldName = field.name;
    
    if (fieldName) {
        formData[fieldName] = field.value;
        hasUnsavedChanges = true;
        
        // Update section status
        updateSectionStatus(field);
        
        // Validate field
        validateField(field);
        
        // Update yarn preview if it's the yarn type field
        if (fieldName === 'yarn_type') {
            updateYarnPreview();
        }
    }
}

function updateSectionStatus(field) {
    const section = field.closest('.form-section');
    if (section) {
        const statusIndicator = section.querySelector('.status-indicator');
        if (statusIndicator) {
            statusIndicator.style.color = 'var(--status-yellow)';
            statusIndicator.title = 'Modified';
        }
    }
}

function updateYarnPreview() {
    const yarnType = document.getElementById('yarnType').value.toLowerCase();
    const preview = document.querySelector('.yarn-preview-large');
    
    if (preview) {
        let gradient = '#667eea, #764ba2'; // Default
        
        if (yarnType.includes('cotton')) {
            gradient = '#ff6b6b, #4ecdc4';
        } else if (yarnType.includes('wool')) {
            gradient = '#a8e6cf, #ffd93d';
        } else if (yarnType.includes('silk')) {
            gradient = '#ff9a9e, #fecfef';
        } else if (yarnType.includes('polyester')) {
            gradient = '#667eea, #764ba2';
        } else if (yarnType.includes('acrylic')) {
            gradient = '#4facfe, #00f2fe';
        } else if (yarnType.includes('blend')) {
            gradient = '#fa709a, #fee140';
        }
        
        preview.style.background = `linear-gradient(45deg, ${gradient})`;
        
        // Add animation effect
        preview.style.animation = 'yarnPreviewUpdate 0.5s ease-out';
        setTimeout(() => {
            preview.style.animation = '';
        }, 500);
    }
}

function updateCharacterCount() {
    const textarea = document.getElementById('notes');
    const counter = document.getElementById('notesCount');
    
    if (textarea && counter) {
        const count = textarea.value.length;
        counter.textContent = count;
        
        // Change color based on character count
        if (count > 900) {
            counter.style.color = 'var(--status-red)';
        } else if (count > 700) {
            counter.style.color = 'var(--status-yellow)';
        } else {
            counter.style.color = 'var(--neon-cyan)';
        }
    }
}

// Form validation
function initializeFormValidation() {
    const form = document.getElementById('orderForm');
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        if (validateForm()) {
            submitForm();
        } else {
            showValidationErrors();
        }
    });
}

function validateForm() {
    let isValid = true;
    const form = document.getElementById('orderForm');
    const requiredFields = form.querySelectorAll('[required]');
    
    requiredFields.forEach(field => {
        if (!validateField(field)) {
            isValid = false;
        }
    });
    
    return isValid;
}

function validateField(field) {
    const value = field.value.trim();
    const fieldName = field.name;
    const validationDiv = field.parentElement.querySelector('.field-validation');
    
    // Clear previous validation
    if (validationDiv) {
        validationDiv.innerHTML = '';
        validationDiv.className = 'field-validation';
    }
    
    // Required field validation
    if (field.hasAttribute('required') && !value) {
        showFieldError(field, 'This field is required');
        return false;
    }
    
    // Specific field validations
    switch (fieldName) {
        case 'customer_name':
            if (value && value.length < 2) {
                showFieldError(field, 'Customer name must be at least 2 characters');
                return false;
            }
            break;
            
        case 'quantity_kg':
            if (value && (parseFloat(value) <= 0 || parseFloat(value) > 10000)) {
                showFieldError(field, 'Quantity must be between 0.01 and 10,000 kg');
                return false;
            }
            break;
            
        case 'amount_usd':
            if (value && (parseFloat(value) <= 0 || parseFloat(value) > 1000000)) {
                showFieldError(field, 'Amount must be between $0.01 and $1,000,000');
                return false;
            }
            break;
            
        case 'startup_date':
            if (value) {
                const selectedDate = new Date(value);
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                
                if (selectedDate < today) {
                    showFieldError(field, 'Startup date cannot be in the past');
                    return false;
                }
            }
            break;
    }
    
    // Show success state
    if (validationDiv) {
        validationDiv.innerHTML = '<i class="fas fa-check" style="color: var(--status-green);"></i>';
        validationDiv.className = 'field-validation valid';
    }
    
    return true;
}

function showFieldError(field, message) {
    const validationDiv = field.parentElement.querySelector('.field-validation');
    
    if (validationDiv) {
        validationDiv.innerHTML = `<i class="fas fa-exclamation-triangle" style="color: var(--status-red);"></i> ${message}`;
        validationDiv.className = 'field-validation error';
    }
    
    // Add error styling to field
    field.style.borderColor = 'var(--status-red)';
    field.style.boxShadow = '0 0 10px rgba(255, 51, 102, 0.3)';
    
    // Remove error styling after a delay
    setTimeout(() => {
        field.style.borderColor = '';
        field.style.boxShadow = '';
    }, 3000);
}

function showValidationErrors() {
    const summary = document.getElementById('validationSummary');
    
    if (summary) {
        summary.innerHTML = `
            <div class="validation-error">
                <i class="fas fa-exclamation-triangle"></i>
                Please fix the errors above before submitting the form.
            </div>
        `;
        summary.style.display = 'block';
        
        // Scroll to first error
        const firstError = document.querySelector('.field-validation.error');
        if (firstError) {
            firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }
}

// Auto-save functionality
function initializeAutoSave() {
    // Auto-save every 30 seconds
    setInterval(autoSave, 30000);
    
    // Auto-save on blur for important fields
    const importantFields = ['customer_name', 'yarn_type', 'quantity_kg', 'amount_usd'];
    importantFields.forEach(fieldName => {
        const field = document.querySelector(`[name="${fieldName}"]`);
        if (field) {
            field.addEventListener('blur', () => {
                if (hasUnsavedChanges) {
                    autoSave();
                }
            });
        }
    });
}

function autoSave() {
    if (!hasUnsavedChanges) return;
    
    const form = document.getElementById('orderForm');
    const formData = new FormData(form);
    
    // Show auto-save indicator
    showAutoSaveIndicator();
    
    fetch('/auto_save_order', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            hasUnsavedChanges = false;
            showAutoSaveSuccess();
        }
    })
    .catch(error => {
        console.error('Auto-save error:', error);
        showAutoSaveError();
    });
}

function showAutoSaveIndicator() {
    const indicator = document.createElement('div');
    indicator.id = 'autoSaveIndicator';
    indicator.innerHTML = '<i class="fas fa-save"></i> Auto-saving...';
    indicator.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: var(--glass-bg);
        backdrop-filter: blur(20px);
        border: 1px solid var(--glass-border);
        border-radius: var(--radius-md);
        padding: 1rem;
        color: var(--status-yellow);
        z-index: 10000;
        animation: slideInRight 0.3s ease-out;
    `;
    
    document.body.appendChild(indicator);
}

function showAutoSaveSuccess() {
    const indicator = document.getElementById('autoSaveIndicator');
    if (indicator) {
        indicator.innerHTML = '<i class="fas fa-check"></i> Auto-saved';
        indicator.style.color = 'var(--status-green)';
        
        setTimeout(() => {
            indicator.remove();
        }, 2000);
    }
}

function showAutoSaveError() {
    const indicator = document.getElementById('autoSaveIndicator');
    if (indicator) {
        indicator.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Auto-save failed';
        indicator.style.color = 'var(--status-red)';
        
        setTimeout(() => {
            indicator.remove();
        }, 3000);
    }
}

// Field effects
function initializeFieldEffects() {
    const inputs = document.querySelectorAll('.form-control');
    
    inputs.forEach(input => {
        // Add focus effects
        input.addEventListener('focus', function() {
            this.style.transform = 'scale(1.02)';
            this.style.borderColor = 'var(--neon-cyan)';
            this.style.boxShadow = 'var(--glow-cyan)';
        });
        
        input.addEventListener('blur', function() {
            this.style.transform = '';
            this.style.borderColor = '';
            this.style.boxShadow = '';
        });
        
        // Add typing animation
        input.addEventListener('input', function() {
            this.style.animation = 'fieldTyping 0.1s ease-out';
            setTimeout(() => {
                this.style.animation = '';
            }, 100);
        });
    });
}

// Form actions
function resetForm() {
    if (hasUnsavedChanges) {
        if (confirm('Are you sure you want to reset all changes? This action cannot be undone.')) {
            const form = document.getElementById('orderForm');
            const inputs = form.querySelectorAll('input, select, textarea');
            
            inputs.forEach(input => {
                if (input.name && originalFormData[input.name] !== undefined) {
                    input.value = originalFormData[input.name];
                }
            });
            
            hasUnsavedChanges = false;
            updateYarnPreview();
            updateCharacterCount();
            
            // Reset section status indicators
            const statusIndicators = document.querySelectorAll('.status-indicator');
            statusIndicators.forEach(indicator => {
                indicator.style.color = 'var(--neon-cyan)';
                indicator.title = '';
            });
            
            showNotification('Form reset to original values', 'info');
        }
    }
}

function saveDraft() {
    const form = document.getElementById('orderForm');
    const formData = new FormData(form);
    
    fetch('/save_draft', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            hasUnsavedChanges = false;
            showNotification('Draft saved successfully!', 'success');
        } else {
            showNotification('Failed to save draft', 'error');
        }
    })
    .catch(error => {
        console.error('Error saving draft:', error);
        showNotification('Error saving draft', 'error');
    });
}

function submitForm() {
    const form = document.getElementById('orderForm');
    const formData = new FormData(form);
    
    // Show loading state
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<div class="loading"></div> Updating...';
    submitBtn.disabled = true;
    
    fetch('/update_order', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            hasUnsavedChanges = false;
            showNotification('Order updated successfully!', 'success');
            
            // Redirect to dashboard after a delay
            setTimeout(() => {
                window.location.href = '/dashboard';
            }, 1500);
        } else {
            showNotification(data.message || 'Failed to update order', 'error');
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    })
    .catch(error => {
        console.error('Error updating order:', error);
        showNotification('Error updating order', 'error');
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    });
}

function previewOrder() {
    const form = document.getElementById('orderForm');
    const formData = new FormData(form);
    
    // Generate preview HTML
    const previewHTML = generatePreviewHTML(formData);
    
    // Show preview modal
    const modal = document.getElementById('previewModal');
    const content = document.getElementById('previewContent');
    
    content.innerHTML = previewHTML;
    modal.style.display = 'block';
    modal.style.animation = 'modalSlideIn 0.3s ease-out';
}

function generatePreviewHTML(formData) {
    return `
        <div class="order-preview-content">
            <div class="preview-header">
                <h3>Order Preview</h3>
                <div class="preview-yarn">
                    <div class="yarn-preview-large" style="background: linear-gradient(45deg, #667eea, #764ba2);">
                        <div class="yarn-texture"></div>
                    </div>
                </div>
            </div>
            
            <div class="preview-grid">
                <div class="preview-item">
                    <span class="label">Order ID:</span>
                    <span class="value">${formData.get('order_id') || 'N/A'}</span>
                </div>
                <div class="preview-item">
                    <span class="label">Customer:</span>
                    <span class="value">${formData.get('customer_name') || 'N/A'}</span>
                </div>
                <div class="preview-item">
                    <span class="label">Yarn Type:</span>
                    <span class="value">${formData.get('yarn_type') || 'N/A'}</span>
                </div>
                <div class="preview-item">
                    <span class="label">Quantity:</span>
                    <span class="value">${formData.get('quantity_kg') || 'N/A'} kg</span>
                </div>
                <div class="preview-item">
                    <span class="label">Order Type:</span>
                    <span class="value">${formData.get('order_type') || 'N/A'}</span>
                </div>
                <div class="preview-item">
                    <span class="label">Startup Date:</span>
                    <span class="value">${formData.get('startup_date') || 'N/A'}</span>
                </div>
                <div class="preview-item">
                    <span class="label">Amount:</span>
                    <span class="value">$${formData.get('amount_usd') || 'N/A'}</span>
                </div>
                <div class="preview-item">
                    <span class="label">Status:</span>
                    <span class="value">${formData.get('status') || 'N/A'}</span>
                </div>
            </div>
            
            ${formData.get('notes') ? `
                <div class="preview-notes">
                    <h4>Notes:</h4>
                    <p>${formData.get('notes')}</p>
                </div>
            ` : ''}
        </div>
    `;
}

function closePreview() {
    const modal = document.getElementById('previewModal');
    modal.style.display = 'none';
}

function duplicateOrder() {
    if (confirm('Create a duplicate of this order?')) {
        const orderId = document.querySelector('input[name="order_id"]').value;
        window.location.href = `/duplicate_order/${orderId}`;
    }
}

function viewHistory() {
    const modal = document.getElementById('historyModal');
    const timeline = document.getElementById('historyTimeline');
    
    // Generate history timeline
    timeline.innerHTML = `
        <div class="history-item">
            <div class="history-dot"></div>
            <div class="history-content">
                <div class="history-title">Order Created</div>
                <div class="history-date">2024-01-15 10:30</div>
                <div class="history-description">Order was initially created in the system</div>
            </div>
        </div>
        <div class="history-item">
            <div class="history-dot"></div>
            <div class="history-content">
                <div class="history-title">Status Updated</div>
                <div class="history-date">2024-01-16 14:20</div>
                <div class="history-description">Status changed from "New Order" to "Under Booking"</div>
            </div>
        </div>
        <div class="history-item">
            <div class="history-dot"></div>
            <div class="history-content">
                <div class="history-title">Agent Assigned</div>
                <div class="history-date">2024-01-17 09:15</div>
                <div class="history-description">Agent John Doe was assigned to this order</div>
            </div>
        </div>
    `;
    
    modal.style.display = 'block';
    modal.style.animation = 'modalSlideIn 0.3s ease-out';
}

function closeHistory() {
    const modal = document.getElementById('historyModal');
    modal.style.display = 'none';
}

function openChat() {
    const orderId = document.querySelector('input[name="order_id"]').value;
    window.location.href = `/chat/${orderId}`;
}

function handleBeforeUnload(event) {
    if (hasUnsavedChanges) {
        event.preventDefault();
        event.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
    }
}

// Add CSS animations for order editor
const orderEditorStyle = document.createElement('style');
orderEditorStyle.textContent = `
    @keyframes yarnPreviewUpdate {
        0% { transform: scale(1); }
        50% { transform: scale(1.1); }
        100% { transform: scale(1); }
    }
    
    @keyframes fieldTyping {
        0% { transform: scale(1); }
        50% { transform: scale(1.01); }
        100% { transform: scale(1); }
    }
    
    .order-editor-form {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-xl);
        max-width: 1200px;
        margin: 0 auto;
    }
    
    .order-overview-card {
        background: var(--glass-bg);
        backdrop-filter: blur(20px);
        border: 1px solid var(--glass-border);
        border-radius: var(--radius-lg);
        padding: var(--spacing-xl);
        margin-bottom: var(--spacing-lg);
    }
    
    .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: var(--spacing-lg);
    }
    
    .card-header h3 {
        color: var(--neon-cyan);
        font-family: var(--font-display);
        margin: 0;
    }
    
    .yarn-preview-large {
        width: 80px;
        height: 80px;
        border-radius: 50%;
        position: relative;
        overflow: hidden;
        border: 3px solid var(--glass-border);
        box-shadow: 0 0 20px rgba(0, 255, 255, 0.3);
    }
    
    .yarn-texture {
        position: absolute;
        top: 50%;
        left: 50%;
        width: 30px;
        height: 30px;
        background: rgba(255, 255, 255, 0.3);
        border-radius: 50%;
        transform: translate(-50%, -50%);
    }
    
    .overview-stats {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: var(--spacing-lg);
    }
    
    .stat-item {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }
    
    .stat-label {
        color: rgba(255, 255, 255, 0.7);
        font-size: 0.9rem;
        text-transform: uppercase;
        letter-spacing: 1px;
    }
    
    .stat-value {
        color: #ffffff;
        font-weight: 600;
        font-size: 1.1rem;
    }
    
    .form-sections {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-xl);
    }
    
    .form-section {
        background: var(--glass-bg);
        backdrop-filter: blur(20px);
        border: 1px solid var(--glass-border);
        border-radius: var(--radius-lg);
        padding: var(--spacing-xl);
    }
    
    .section-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: var(--spacing-lg);
        padding-bottom: var(--spacing-md);
        border-bottom: 1px solid var(--glass-border);
    }
    
    .section-header h3 {
        color: var(--neon-cyan);
        font-family: var(--font-display);
        margin: 0;
    }
    
    .section-status {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.9rem;
        color: rgba(255, 255, 255, 0.7);
    }
    
    .status-indicator {
        color: var(--neon-cyan);
        font-size: 1rem;
    }
    
    .form-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: var(--spacing-lg);
    }
    
    .form-group {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }
    
    .form-group label {
        color: var(--neon-cyan);
        font-weight: 500;
        font-size: 0.9rem;
    }
    
    .form-control {
        background: var(--glass-bg);
        border: 1px solid var(--glass-border);
        border-radius: var(--radius-md);
        padding: var(--spacing-md);
        color: #ffffff;
        font-family: inherit;
        font-size: 1rem;
        transition: all 0.3s ease;
    }
    
    .form-control:focus {
        outline: none;
        border-color: var(--neon-cyan);
        box-shadow: var(--glow-cyan);
    }
    
    .form-control:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }
    
    .form-control[readonly] {
        background: rgba(255, 255, 255, 0.05);
        cursor: default;
    }
    
    .form-text {
        color: rgba(255, 255, 255, 0.5);
        font-size: 0.8rem;
        margin-top: 0.25rem;
    }
    
    .field-validation {
        font-size: 0.8rem;
        margin-top: 0.25rem;
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }
    
    .field-validation.error {
        color: var(--status-red);
    }
    
    .field-validation.valid {
        color: var(--status-green);
    }
    
    .character-count {
        text-align: right;
        font-size: 0.8rem;
        color: rgba(255, 255, 255, 0.5);
        margin-top: 0.25rem;
    }
    
    .agents-list {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
        gap: var(--spacing-md);
        margin-top: var(--spacing-md);
    }
    
    .agent-checkbox {
        cursor: pointer;
    }
    
    .agent-checkbox input[type="checkbox"] {
        display: none;
    }
    
    .agent-card {
        background: var(--card-bg);
        border: 1px solid var(--glass-border);
        border-radius: var(--radius-md);
        padding: var(--spacing-md);
        display: flex;
        align-items: center;
        gap: var(--spacing-md);
        transition: all 0.3s ease;
    }
    
    .agent-checkbox input[type="checkbox"]:checked + .agent-card {
        border-color: var(--neon-cyan);
        background: rgba(0, 255, 255, 0.1);
        box-shadow: var(--glow-cyan);
    }
    
    .agent-avatar {
        flex-shrink: 0;
    }
    
    .agent-info {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
    }
    
    .agent-name {
        color: #ffffff;
        font-weight: 500;
    }
    
    .agent-role {
        color: rgba(255, 255, 255, 0.7);
        font-size: 0.8rem;
        text-transform: uppercase;
        letter-spacing: 1px;
    }
    
    .form-actions {
        background: var(--glass-bg);
        backdrop-filter: blur(20px);
        border: 1px solid var(--glass-border);
        border-radius: var(--radius-lg);
        padding: var(--spacing-xl);
        margin-top: var(--spacing-xl);
    }
    
    .action-buttons {
        display: flex;
        gap: var(--spacing-md);
        justify-content: center;
        margin-bottom: var(--spacing-lg);
    }
    
    .form-validation {
        text-align: center;
    }
    
    .validation-summary {
        display: none;
    }
    
    .validation-error {
        color: var(--status-red);
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
    }
    
    .quick-actions-floating {
        display: flex;
        gap: var(--spacing-md);
        background: var(--glass-bg);
        backdrop-filter: blur(20px);
        border: 1px solid var(--glass-border);
        border-radius: var(--radius-lg);
        padding: var(--spacing-md);
    }
    
    .order-info {
        display: flex;
        align-items: center;
        gap: var(--spacing-md);
        margin-top: 0.5rem;
    }
    
    .order-id {
        color: var(--neon-cyan);
        font-family: var(--font-display);
        font-weight: 600;
    }
    
    .order-status {
        padding: 4px 8px;
        border-radius: var(--radius-sm);
        font-size: 0.8rem;
        font-weight: 500;
        text-transform: uppercase;
        letter-spacing: 1px;
    }
    
    .status-new-order {
        background: var(--status-red);
        color: var(--primary-bg);
    }
    
    .status-under-booking {
        background: var(--status-yellow);
        color: var(--primary-bg);
    }
    
    .status-booked {
        background: var(--status-green);
        color: var(--primary-bg);
    }
    
    .status-received-contract {
        background: var(--status-blue);
        color: var(--primary-bg);
    }
    
    .order-preview-content {
        color: #ffffff;
    }
    
    .preview-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: var(--spacing-lg);
    }
    
    .preview-header h3 {
        color: var(--neon-cyan);
        font-family: var(--font-display);
        margin: 0;
    }
    
    .preview-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: var(--spacing-lg);
        margin-bottom: var(--spacing-lg);
    }
    
    .preview-item {
        display: flex;
        justify-content: space-between;
        padding: var(--spacing-md);
        background: var(--card-bg);
        border-radius: var(--radius-md);
        border: 1px solid var(--glass-border);
    }
    
    .preview-item .label {
        color: rgba(255, 255, 255, 0.7);
        font-weight: 500;
    }
    
    .preview-item .value {
        color: #ffffff;
        font-weight: 600;
    }
    
    .preview-notes {
        background: var(--card-bg);
        border-radius: var(--radius-md);
        padding: var(--spacing-lg);
        border: 1px solid var(--glass-border);
    }
    
    .preview-notes h4 {
        color: var(--neon-cyan);
        margin-bottom: var(--spacing-md);
    }
    
    .preview-notes p {
        color: rgba(255, 255, 255, 0.8);
        line-height: 1.6;
    }
    
    .history-timeline {
        position: relative;
        padding-left: var(--spacing-lg);
    }
    
    .history-timeline::before {
        content: '';
        position: absolute;
        left: 8px;
        top: 0;
        bottom: 0;
        width: 2px;
        background: var(--glass-border);
    }
    
    .history-item {
        position: relative;
        margin-bottom: var(--spacing-lg);
    }
    
    .history-dot {
        position: absolute;
        left: -12px;
        top: 4px;
        width: 8px;
        height: 8px;
        background: var(--neon-cyan);
        border-radius: 50%;
        box-shadow: 0 0 10px var(--neon-cyan);
    }
    
    .history-title {
        color: #ffffff;
        font-weight: 600;
        margin-bottom: 0.25rem;
    }
    
    .history-date {
        color: var(--neon-cyan);
        font-size: 0.8rem;
        margin-bottom: 0.5rem;
    }
    
    .history-description {
        color: rgba(255, 255, 255, 0.7);
        font-size: 0.9rem;
        line-height: 1.4;
    }
`;
document.head.appendChild(orderEditorStyle);
