// Futuristic Chat System - Advanced Communication Features

let messageInput;
let messagesContainer;
let isVoiceChatActive = false;
let currentAudioContext = null;

// Initialize chat system
document.addEventListener('DOMContentLoaded', function() {
    initializeChatSystem();
    initializeMessageInput();
    initializeRealTimeUpdates();
    initializeVoiceFeatures();
});

function initializeChatSystem() {
    messageInput = document.getElementById('messageInput');
    messagesContainer = document.getElementById('messagesContainer');
    
    // Auto-scroll to bottom
    scrollToBottom();
    
    // Add typing indicator
    setupTypingIndicator();
    
    // Initialize message animations
    initializeMessageAnimations();
}

function initializeMessageInput() {
    // Auto-resize textarea
    messageInput.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = Math.min(this.scrollHeight, 120) + 'px';
    });
    
    // Focus on load
    messageInput.focus();
}

function initializeRealTimeUpdates() {
    // Real-time updates can be implemented with WebSockets later
    // For now, we'll keep it clean without random messages
}

function initializeVoiceFeatures() {
    // Initialize WebRTC for voice chat
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        setupVoiceChat();
    }
}

// Message handling
function handleMessageKeydown(event) {
    if (event.ctrlKey && event.key === 'Enter') {
        event.preventDefault();
        sendMessage();
    }
}

function sendMessage() {
    const content = messageInput.value.trim();
    if (!content) return;
    
    // Get tagged agents
    const taggedAgents = [];
    const checkboxes = document.querySelectorAll('input[name="tagged_agents"]:checked');
    checkboxes.forEach(checkbox => {
        taggedAgents.push(parseInt(checkbox.value));
    });
    
    // Clear input
    messageInput.value = '';
    messageInput.style.height = 'auto';
    
    // Clear agent checkboxes
    checkboxes.forEach(checkbox => checkbox.checked = false);
    closeAgentTagging();
    
    // Add message to UI immediately
    addMessageToUI(content, true, taggedAgents);
    
    // Send to server
    fetch('/send_message', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            order_id: getOrderIdFromURL(),
            message: content,
            tagged_agents: taggedAgents
        })
    })
    .then(response => response.json())
    .then(data => {
        if (!data.success) {
            showNotification(data.message || 'Failed to send message', 'error');
            // Remove the message from UI if it failed
            const messages = document.querySelectorAll('.message-item');
            if (messages.length > 0) {
                messages[messages.length - 1].remove();
            }
        }
    })
    .catch(error => {
        console.error('Error sending message:', error);
        showNotification('Error sending message', 'error');
        // Remove the message from UI if it failed
        const messages = document.querySelectorAll('.message-item');
        if (messages.length > 0) {
            messages[messages.length - 1].remove();
        }
    });
}

function addMessageToUI(content, isOwnMessage = false, taggedAgents = []) {
    const messageElement = document.createElement('div');
    messageElement.className = `message-item ${isOwnMessage ? 'own-message' : 'other-message'} fade-in`;
    
    const timestamp = new Date().toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
    });
    
    let taggedAgentsHTML = '';
    if (taggedAgents && taggedAgents.length > 0) {
        taggedAgentsHTML = `
            <div class="message-tags">
                <i class="fas fa-tag"></i>
                <span>Tagged ${taggedAgents.length} agent${taggedAgents.length > 1 ? 's' : ''}</span>
            </div>
        `;
    }
    
    messageElement.innerHTML = `
        <div class="message-avatar">
            <div class="avatar-glow" style="background: linear-gradient(45deg, var(--neon-cyan), var(--neon-blue));">
                <i class="fas fa-user"></i>
            </div>
        </div>
        <div class="message-content">
            <div class="message-header">
                <span class="message-author">${isOwnMessage ? 'You' : 'Other User'}</span>
                <span class="message-role">${isOwnMessage ? 'You' : 'Other'}</span>
                <span class="message-time">${timestamp}</span>
            </div>
            <div class="message-text">${content}</div>
            ${taggedAgentsHTML}
        </div>
    `;
    
    messagesContainer.appendChild(messageElement);
    scrollToBottom();
    
    // Add message animation
    setTimeout(() => {
        messageElement.style.animation = 'messageSlideIn 0.3s ease-out';
    }, 10);
}

function scrollToBottom() {
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function setupTypingIndicator() {
    // Typing indicators removed for cleaner interface
    // Can be re-implemented with real WebSocket functionality later
}

function showTypingIndicator() {
    // Disabled for cleaner interface
}

function hideTypingIndicator() {
    // Disabled for cleaner interface
}

function updateTypingIndicators() {
    // Disabled for cleaner interface
}

function checkForNewMessages() {
    // Real-time message checking can be implemented with WebSockets later
    // Removed random message simulation for cleaner interface
}

// Voice chat functionality
function toggleVoiceChat() {
    if (isVoiceChatActive) {
        endVoiceChat();
    } else {
        startVoiceChat();
    }
}

function startVoiceChat() {
    const modal = document.getElementById('voiceChatModal');
    modal.style.display = 'block';
    modal.style.animation = 'modalSlideIn 0.3s ease-out';
    
    // Request microphone access
    navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
            isVoiceChatActive = true;
            currentAudioContext = new AudioContext();
            const source = currentAudioContext.createMediaStreamSource(stream);
            
            // Add audio processing
            const processor = currentAudioContext.createScriptProcessor(4096, 1, 1);
            source.connect(processor);
            processor.connect(currentAudioContext.destination);
            
            showNotification('Voice chat started!', 'success');
        })
        .catch(error => {
            console.error('Error accessing microphone:', error);
            showNotification('Could not access microphone', 'error');
            closeVoiceChat();
        });
}

function endVoiceChat() {
    isVoiceChatActive = false;
    
    if (currentAudioContext) {
        currentAudioContext.close();
        currentAudioContext = null;
    }
    
    closeVoiceChat();
    showNotification('Voice chat ended', 'info');
}

function closeVoiceChat() {
    const modal = document.getElementById('voiceChatModal');
    modal.style.display = 'none';
}

// File attachment functionality
function attachFile() {
    const modal = document.getElementById('fileUploadModal');
    modal.style.display = 'block';
    modal.style.animation = 'modalSlideIn 0.3s ease-out';
}

function attachImage() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = function(e) {
        const file = e.target.files[0];
        if (file) {
            uploadFile(file);
        }
    };
    input.click();
}

function recordVoice() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        showNotification('Voice recording not supported', 'error');
        return;
    }
    
    navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
            const mediaRecorder = new MediaRecorder(stream);
            const chunks = [];
            
            mediaRecorder.ondataavailable = function(e) {
                chunks.push(e.data);
            };
            
            mediaRecorder.onstop = function() {
                const blob = new Blob(chunks, { type: 'audio/wav' });
                uploadFile(blob, 'voice-message.wav');
            };
            
            // Show recording indicator
            showRecordingIndicator();
            
            mediaRecorder.start();
            
            // Stop recording after 30 seconds or when user clicks stop
            setTimeout(() => {
                mediaRecorder.stop();
                hideRecordingIndicator();
            }, 30000);
        })
        .catch(error => {
            console.error('Error recording voice:', error);
            showNotification('Could not record voice message', 'error');
        });
}

function showRecordingIndicator() {
    const indicator = document.createElement('div');
    indicator.className = 'recording-indicator';
    indicator.innerHTML = `
        <div class="recording-content">
            <div class="recording-dot"></div>
            <span>Recording voice message...</span>
            <button onclick="stopRecording()" class="btn btn-sm btn-secondary">
                <i class="fas fa-stop"></i> Stop
            </button>
        </div>
    `;
    
    indicator.style.cssText = `
        position: fixed;
        bottom: 120px;
        left: 50%;
        transform: translateX(-50%);
        background: var(--glass-bg);
        backdrop-filter: blur(20px);
        border: 1px solid var(--glass-border);
        border-radius: var(--radius-md);
        padding: 1rem;
        color: #ffffff;
        z-index: 1000;
        animation: slideInUp 0.3s ease-out;
    `;
    
    document.body.appendChild(indicator);
}

function hideRecordingIndicator() {
    const indicator = document.querySelector('.recording-indicator');
    if (indicator) {
        indicator.remove();
    }
}

function stopRecording() {
    // This would stop the media recorder in a real implementation
    hideRecordingIndicator();
    showNotification('Voice message recorded!', 'success');
}

function uploadFile(file, filename = null) {
    const formData = new FormData();
    formData.append('file', file, filename || file.name);
    formData.append('order_id', getOrderIdFromURL());
    
    // Show upload progress
    showUploadProgress();
    
    fetch('/upload_file', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        hideUploadProgress();
        if (data.success) {
            showNotification('File uploaded successfully!', 'success');
            // Add file message to chat
            addFileMessageToUI(file.name, data.file_id);
        } else {
            showNotification('Failed to upload file', 'error');
        }
    })
    .catch(error => {
        hideUploadProgress();
        console.error('Error uploading file:', error);
        showNotification('Error uploading file', 'error');
    });
}

function showUploadProgress() {
    const progress = document.createElement('div');
    progress.className = 'upload-progress';
    progress.innerHTML = `
        <div class="upload-content">
            <div class="loading"></div>
            <span>Uploading file...</span>
        </div>
    `;
    
    progress.style.cssText = `
        position: fixed;
        bottom: 120px;
        left: 50%;
        transform: translateX(-50%);
        background: var(--glass-bg);
        backdrop-filter: blur(20px);
        border: 1px solid var(--glass-border);
        border-radius: var(--radius-md);
        padding: 1rem;
        color: #ffffff;
        z-index: 1000;
        animation: slideInUp 0.3s ease-out;
    `;
    
    document.body.appendChild(progress);
}

function hideUploadProgress() {
    const progress = document.querySelector('.upload-progress');
    if (progress) {
        progress.remove();
    }
}

function addFileMessageToUI(filename, fileId) {
    const messageElement = document.createElement('div');
    messageElement.className = 'message-item own-message fade-in';
    
    const timestamp = new Date().toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
    });
    
    messageElement.innerHTML = `
        <div class="message-avatar">
            <div class="avatar-glow" style="background: linear-gradient(45deg, var(--neon-cyan), var(--neon-blue));">
                <i class="fas fa-user"></i>
            </div>
        </div>
        <div class="message-content">
            <div class="message-header">
                <span class="message-author">You</span>
                <span class="message-role">User</span>
                <span class="message-time">${timestamp}</span>
            </div>
            <div class="message-attachments">
                <div class="attachment-item">
                    <i class="fas fa-paperclip"></i>
                    <span>${filename}</span>
                    <button onclick="downloadAttachment('${fileId}')" class="btn btn-sm">
                        <i class="fas fa-download"></i>
                    </button>
                </div>
            </div>
        </div>
    `;
    
    messagesContainer.appendChild(messageElement);
    scrollToBottom();
}

function downloadAttachment(attachmentId) {
    // In real implementation, this would download the file
    showNotification('Downloading attachment...', 'info');
    window.open(`/download_attachment/${attachmentId}`, '_blank');
}

function closeFileUpload() {
    const modal = document.getElementById('fileUploadModal');
    modal.style.display = 'none';
}

// Chat actions
function clearChat() {
    if (confirm('Are you sure you want to clear the chat history? This action cannot be undone.')) {
        fetch('/clear_chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                order_id: getOrderIdFromURL()
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                messagesContainer.innerHTML = '';
                showNotification('Chat cleared successfully!', 'success');
            } else {
                showNotification('Failed to clear chat', 'error');
            }
        })
        .catch(error => {
            console.error('Error clearing chat:', error);
            showNotification('Error clearing chat', 'error');
        });
    }
}

function exportChat() {
    const messages = document.querySelectorAll('.message-item');
    let chatContent = `Order Chat Export - ${new Date().toLocaleDateString()}\n\n`;
    
    messages.forEach(message => {
        const author = message.querySelector('.message-author').textContent;
        const time = message.querySelector('.message-time').textContent;
        const text = message.querySelector('.message-text')?.textContent || '[File Attachment]';
        
        chatContent += `[${time}] ${author}: ${text}\n`;
    });
    
    // Download as text file
    const blob = new Blob([chatContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chat-export-${getOrderIdFromURL()}-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    
    showNotification('Chat exported successfully!', 'success');
}

function shareScreen() {
    if (navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) {
        navigator.mediaDevices.getDisplayMedia({ video: true })
            .then(stream => {
                showNotification('Screen sharing started!', 'success');
                // In real implementation, this would start screen sharing
            })
            .catch(error => {
                console.error('Error sharing screen:', error);
                showNotification('Could not start screen sharing', 'error');
            });
    } else {
        showNotification('Screen sharing not supported', 'error');
    }
}

function updateStatus() {
    // In real implementation, this would open a status update modal
    showNotification('Status update feature coming soon!', 'info');
}

// Agent tagging functions
function toggleAgentTagging() {
    const panel = document.getElementById('agentTaggingPanel');
    if (panel) {
        panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
        if (panel.style.display === 'block') {
            panel.style.animation = 'slideDown 0.3s ease-out';
        }
    }
}

function closeAgentTagging() {
    const panel = document.getElementById('agentTaggingPanel');
    if (panel) {
        panel.style.display = 'none';
    }
}

// Utility functions
function getOrderIdFromURL() {
    const path = window.location.pathname;
    const matches = path.match(/\/chat\/(\d+)/);
    return matches ? matches[1] : null;
}

function initializeMessageAnimations() {
    const messages = document.querySelectorAll('.message-item');
    messages.forEach((message, index) => {
        message.style.animationDelay = `${index * 0.1}s`;
        message.classList.add('fade-in');
    });
}

// Add CSS animations for chat
const chatStyle = document.createElement('style');
chatStyle.textContent = `
    @keyframes messageSlideIn {
        from {
            opacity: 0;
            transform: translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    @keyframes slideInUp {
        from {
            opacity: 0;
            transform: translateX(-50%) translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
        }
    }
    
    .chat-container {
        display: flex;
        height: calc(100vh - 200px);
        gap: var(--spacing-lg);
        margin-top: var(--spacing-lg);
    }
    
    .participants-panel {
        width: 300px;
        background: var(--glass-bg);
        backdrop-filter: blur(20px);
        border: 1px solid var(--glass-border);
        border-radius: var(--radius-lg);
        padding: var(--spacing-lg);
        display: flex;
        flex-direction: column;
    }
    
    .messages-area {
        flex: 1;
        background: var(--glass-bg);
        backdrop-filter: blur(20px);
        border: 1px solid var(--glass-border);
        border-radius: var(--radius-lg);
        display: flex;
        flex-direction: column;
    }
    
    .order-details-panel {
        width: 300px;
        background: var(--glass-bg);
        backdrop-filter: blur(20px);
        border: 1px solid var(--glass-border);
        border-radius: var(--radius-lg);
        padding: var(--spacing-lg);
        display: flex;
        flex-direction: column;
    }
    
    .panel-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: var(--spacing-lg);
        padding-bottom: var(--spacing-md);
        border-bottom: 1px solid var(--glass-border);
    }
    
    .panel-header h3 {
        color: var(--neon-cyan);
        font-family: var(--font-display);
        margin: 0;
    }
    
    .participant-count, .message-count {
        background: var(--glass-bg);
        padding: 4px 12px;
        border-radius: var(--radius-sm);
        font-size: 0.9rem;
        font-weight: 500;
        border: 1px solid var(--glass-border);
    }
    
    .participants-list {
        flex: 1;
        overflow-y: auto;
        margin-bottom: var(--spacing-lg);
    }
    
    .participant-item {
        display: flex;
        align-items: center;
        gap: var(--spacing-md);
        padding: var(--spacing-md);
        border-radius: var(--radius-md);
        margin-bottom: var(--spacing-sm);
        transition: all 0.3s ease;
        cursor: pointer;
    }
    
    .participant-item:hover {
        background: var(--glass-bg);
        transform: translateX(5px);
    }
    
    .participant-avatar {
        position: relative;
    }
    
    .online-indicator {
        position: absolute;
        bottom: 0;
        right: 0;
        width: 12px;
        height: 12px;
        border-radius: 50%;
        border: 2px solid var(--primary-bg);
    }
    
    .online-indicator.online {
        background: var(--status-green);
        box-shadow: 0 0 10px var(--status-green);
    }
    
    .online-indicator.offline {
        background: var(--status-red);
    }
    
    .participant-info {
        flex: 1;
    }
    
    .participant-name {
        color: #ffffff;
        font-weight: 500;
        margin-bottom: 0.25rem;
    }
    
    .participant-role {
        color: rgba(255, 255, 255, 0.7);
        font-size: 0.8rem;
        text-transform: uppercase;
        letter-spacing: 1px;
    }
    
    .participant-status {
        color: rgba(255, 255, 255, 0.5);
        font-size: 0.8rem;
        margin-top: 0.25rem;
    }
    
    .messages-container {
        flex: 1;
        overflow-y: auto;
        padding: var(--spacing-lg);
        display: flex;
        flex-direction: column;
        gap: var(--spacing-md);
    }
    
    .message-item {
        display: flex;
        gap: var(--spacing-md);
        animation: messageSlideIn 0.3s ease-out;
    }
    
    .message-item.own-message {
        flex-direction: row-reverse;
    }
    
    .message-avatar {
        flex-shrink: 0;
    }
    
    .message-content {
        max-width: 70%;
        background: var(--glass-bg);
        backdrop-filter: blur(20px);
        border: 1px solid var(--glass-border);
        border-radius: var(--radius-md);
        padding: var(--spacing-md);
        position: relative;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    }
    
    .own-message .message-content {
        background: linear-gradient(135deg, var(--neon-cyan), var(--neon-blue));
        color: var(--primary-bg);
        border-color: var(--neon-cyan);
        box-shadow: 0 2px 15px rgba(0, 255, 255, 0.2);
    }
    
    .message-header {
        display: flex;
        gap: var(--spacing-sm);
        margin-bottom: var(--spacing-sm);
        font-size: 0.8rem;
        opacity: 0.8;
    }
    
    .message-author {
        font-weight: 500;
    }
    
    .message-role {
        text-transform: uppercase;
        letter-spacing: 1px;
    }
    
    .message-time {
        margin-left: auto;
    }
    
    .message-text {
        line-height: 1.4;
        word-wrap: break-word;
    }
    
    .message-input-container {
        padding: var(--spacing-lg);
        border-top: 1px solid var(--glass-border);
    }
    
    .input-wrapper {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-md);
    }
    
    .attachment-options {
        display: flex;
        gap: var(--spacing-sm);
        justify-content: flex-start;
    }
    
    .message-input-wrapper {
        display: flex;
        gap: var(--spacing-md);
        align-items: flex-end;
    }
    
    .message-input {
        flex: 1;
        background: var(--glass-bg);
        border: 1px solid var(--glass-border);
        border-radius: var(--radius-md);
        padding: var(--spacing-md);
        color: #ffffff;
        font-family: inherit;
        font-size: 1rem;
        resize: none;
        min-height: 44px;
        max-height: 120px;
        transition: all 0.3s ease;
    }
    
    .message-input:focus {
        outline: none;
        border-color: var(--neon-cyan);
        box-shadow: var(--glow-cyan);
    }
    
    .message-input::placeholder {
        color: rgba(255, 255, 255, 0.5);
    }
    
    .send-btn {
        flex-shrink: 0;
        width: 44px;
        height: 44px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    
    /* Typing indicators removed for cleaner interface */
    
    .attachment-item {
        display: flex;
        align-items: center;
        gap: var(--spacing-sm);
        padding: var(--spacing-sm);
        background: var(--glass-bg);
        border-radius: var(--radius-sm);
        margin-top: var(--spacing-sm);
    }
    
    .attachment-item i {
        color: var(--neon-cyan);
    }
    
    .recording-indicator .recording-dot {
        width: 12px;
        height: 12px;
        background: var(--status-red);
        border-radius: 50%;
        animation: recordingPulse 1s infinite;
        margin-right: var(--spacing-sm);
    }
    
    @keyframes recordingPulse {
        0% {
            transform: scale(1);
            opacity: 1;
        }
        50% {
            transform: scale(1.2);
            opacity: 0.7;
        }
        100% {
            transform: scale(1);
            opacity: 1;
        }
    }
    
    .detail-section {
        margin-bottom: var(--spacing-lg);
    }
    
    .detail-section h4 {
        color: var(--neon-cyan);
        font-family: var(--font-display);
        margin-bottom: var(--spacing-md);
        font-size: 1rem;
    }
    
    .detail-item {
        display: flex;
        justify-content: space-between;
        margin-bottom: var(--spacing-sm);
        font-size: 0.9rem;
    }
    
    .detail-item .label {
        color: rgba(255, 255, 255, 0.7);
    }
    
    .detail-item .value {
        color: #ffffff;
        font-weight: 500;
    }
    
    .timeline {
        position: relative;
        padding-left: var(--spacing-lg);
    }
    
    .timeline::before {
        content: '';
        position: absolute;
        left: 8px;
        top: 0;
        bottom: 0;
        width: 2px;
        background: var(--glass-border);
    }
    
    .timeline-item {
        position: relative;
        margin-bottom: var(--spacing-lg);
    }
    
    .timeline-dot {
        position: absolute;
        left: -12px;
        top: 4px;
        width: 8px;
        height: 8px;
        background: var(--neon-cyan);
        border-radius: 50%;
        box-shadow: 0 0 10px var(--neon-cyan);
    }
    
    .timeline-title {
        color: #ffffff;
        font-weight: 500;
        margin-bottom: 0.25rem;
    }
    
    .timeline-date {
        color: rgba(255, 255, 255, 0.7);
        font-size: 0.8rem;
    }
    
    .chat-header-content {
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: 100%;
    }
    
    .header-left {
        display: flex;
        align-items: center;
        gap: var(--spacing-lg);
    }
    
    .order-info {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }
    
    .order-details {
        display: flex;
        align-items: center;
        gap: var(--spacing-md);
    }
    
    .order-id {
        color: var(--neon-cyan);
        font-family: var(--font-display);
        font-weight: 600;
    }
    
    .customer-name {
        color: rgba(255, 255, 255, 0.8);
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
    
    .order-summary {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        text-align: right;
    }
    
    .summary-item {
        display: flex;
        gap: var(--spacing-sm);
        font-size: 0.9rem;
    }
    
    .summary-item .label {
        color: rgba(255, 255, 255, 0.7);
    }
    
    .summary-item .value {
        color: #ffffff;
        font-weight: 500;
    }
`;
document.head.appendChild(chatStyle);
