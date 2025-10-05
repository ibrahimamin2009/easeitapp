from flask import Flask, render_template, request, redirect, url_for, flash, session, jsonify
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime
import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

app = Flask(__name__)

# Get configuration from environment variables
SECRET_KEY = os.environ.get('SECRET_KEY', 'your-secret-key-here')
DATABASE_URL = os.environ.get('DATABASE_URL', 'sqlite:///yarn_system.db')

app.config['SECRET_KEY'] = SECRET_KEY
app.config['SQLALCHEMY_DATABASE_URI'] = DATABASE_URL
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Print configuration for debugging (remove in production)
print(f"SECRET_KEY configured: {'Yes' if SECRET_KEY != 'your-secret-key-here' else 'No'}")
print(f"DATABASE_URL configured: {'Yes' if DATABASE_URL != 'sqlite:///yarn_system.db' else 'No'}")

db = SQLAlchemy(app)

# Database Models
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(120), nullable=False)
    role = db.Column(db.String(20), nullable=False)  # admin, agent, user
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    is_active = db.Column(db.Boolean, default=True)

class Order(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    order_id = db.Column(db.String(50), unique=True, nullable=False)  # e.g., PO-1052
    customer_name = db.Column(db.String(200), nullable=False)
    yarn_type = db.Column(db.String(100), nullable=False)
    quantity_kg = db.Column(db.Float, nullable=False)
    startup_date = db.Column(db.Date, nullable=False)
    order_type = db.Column(db.String(20), nullable=False)  # Local / Export
    amount_usd = db.Column(db.Float, nullable=False)
    status = db.Column(db.String(50), nullable=False, default='New Order')
    created_by = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    assigned_agent = db.Column(db.Integer, db.ForeignKey('user.id'))  # Primary agent
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    creator = db.relationship('User', foreign_keys=[created_by], backref='created_orders')
    agent = db.relationship('User', foreign_keys=[assigned_agent], backref='assigned_orders')

class OrderAgent(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    order_id = db.Column(db.Integer, db.ForeignKey('order.id'), nullable=False)
    agent_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    assigned_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    order = db.relationship('Order', backref='assigned_agents')
    agent = db.relationship('User', backref='order_assignments')

class Contract(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    order_id = db.Column(db.Integer, db.ForeignKey('order.id'), nullable=False)
    filename = db.Column(db.String(255), nullable=False)
    file_path = db.Column(db.String(500), nullable=False)
    uploaded_by = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    uploaded_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    order = db.relationship('Order', backref='contracts')
    uploader = db.relationship('User', backref='uploaded_contracts')

class AuditLog(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    action = db.Column(db.String(100), nullable=False)
    entity_type = db.Column(db.String(50), nullable=False)  # order, user, contract
    entity_id = db.Column(db.Integer, nullable=False)
    details = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    user = db.relationship('User', backref='audit_logs')

class ChatMessage(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    order_id = db.Column(db.Integer, db.ForeignKey('order.id'), nullable=False)
    sender_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    message = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    order = db.relationship('Order', backref='chat_messages')
    sender = db.relationship('User', foreign_keys=[sender_id], backref='sent_messages')
    tagged_agents = db.relationship('ChatTag', backref='message', cascade='all, delete-orphan')

class ChatTag(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    message_id = db.Column(db.Integer, db.ForeignKey('chat_message.id'), nullable=False)
    agent_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    
    # Relationships
    agent = db.relationship('User', backref='tagged_messages')

# Email notification function
def send_notification_email(to_email, subject, message):
    """Send email notification (simplified version for demo)"""
    try:
        # In a real application, you would configure SMTP settings
        # For demo purposes, we'll just log the email
        print(f"Email Notification:")
        print(f"To: {to_email}")
        print(f"Subject: {subject}")
        print(f"Message: {message}")
        print("-" * 50)
        return True
    except Exception as e:
        print(f"Email notification failed: {e}")
        return False

# Audit logging function
def log_audit(user_id, action, entity_type, entity_id, details=None):
    """Log user actions for audit trail"""
    try:
        audit_log = AuditLog(
            user_id=user_id,
            action=action,
            entity_type=entity_type,
            entity_id=entity_id,
            details=details
        )
        db.session.add(audit_log)
        db.session.commit()
    except Exception as e:
        print(f"Audit logging failed: {e}")

# Generate order ID
def generate_order_id():
    """Generate unique order ID like PO-1052"""
    import random
    return f"PO-{random.randint(1000, 9999)}"

# Order status progression
ORDER_STATUSES = {
    'New Order': 1,
    'Under Booking': 2,
    'Booked': 3,
    'Received Contract': 4,
    'Archived': 5
}

def can_move_order(user_role, from_status, to_status):
    """Check if user can move order from one status to another"""
    if user_role == 'admin':
        return True
    elif user_role == 'agent':
        # Agents can only move forward/back one step, no archive
        from_level = ORDER_STATUSES.get(from_status, 0)
        to_level = ORDER_STATUSES.get(to_status, 0)
        return abs(from_level - to_level) == 1 and to_status != 'Archived'
    else:  # user
        return False

# Routes
@app.route('/')
def index():
    if 'user_id' not in session:
        return redirect(url_for('login'))
    return redirect(url_for('dashboard'))

@app.route('/health')
def health_check():
    """Simple health check endpoint for debugging"""
    return jsonify({
        'status': 'healthy',
        'database_url': 'configured' if app.config.get('SQLALCHEMY_DATABASE_URI') else 'missing',
        'secret_key': 'configured' if app.config.get('SECRET_KEY') else 'missing'
    })

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        
        user = User.query.filter_by(username=username).first()
        
        if user and check_password_hash(user.password_hash, password):
            session['user_id'] = user.id
            session['username'] = user.username
            session['role'] = user.role
            flash('Login successful!', 'success')
            return redirect(url_for('dashboard'))
        else:
            flash('Invalid username or password', 'error')
    
    return render_template('futuristic-login.html')

@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        username = request.form['username']
        email = request.form['email']
        password = request.form['password']
        role = request.form['role']
        
        # Check if user already exists
        if User.query.filter_by(username=username).first():
            flash('Username already exists', 'error')
            return render_template('futuristic-register.html')
        
        if User.query.filter_by(email=email).first():
            flash('Email already exists', 'error')
            return render_template('futuristic-register.html')
        
        # Create new user
        user = User(
            username=username,
            email=email,
            password_hash=generate_password_hash(password),
            role=role
        )
        
        db.session.add(user)
        db.session.commit()
        
        flash('Registration successful! Please login.', 'success')
        return redirect(url_for('login'))
    
    return render_template('futuristic-register.html')

@app.route('/dashboard')
def dashboard():
    if 'user_id' not in session:
        return redirect(url_for('login'))
    
    user = User.query.get(session['user_id'])
    
    # Get search and filter parameters
    search_query = request.args.get('search', '')
    status_filter = request.args.get('status', '')
    agent_filter = request.args.get('agent', '')
    order_type_filter = request.args.get('order_type', '')
    
    # Get orders based on user role
    if user.role == 'admin':
        orders_query = Order.query
    elif user.role == 'agent':
        # Agent can only see orders where they are the primary assigned agent
        # For confirmed orders, only the assigned agent can see them
        # For other orders, agents can see if they are assigned (primary or in OrderAgent table)
        orders_query = Order.query.filter(
            db.or_(
                # Confirmed orders - only primary assigned agent can see
                db.and_(Order.status == 'Confirmed', Order.assigned_agent == user.id),
                # Other orders - can see if assigned (primary or in OrderAgent table)
                db.and_(
                    Order.status != 'Confirmed',
                    db.or_(
                        Order.assigned_agent == user.id,
                        Order.id.in_(
                            db.session.query(OrderAgent.order_id).filter_by(agent_id=user.id)
                        )
                    )
                )
            )
        )
    else:  # user
        orders_query = Order.query.filter_by(created_by=user.id)
    
    # Apply search filter
    if search_query:
        orders_query = orders_query.filter(
            (Order.order_id.contains(search_query)) |
            (Order.customer_name.contains(search_query)) |
            (Order.yarn_type.contains(search_query))
        )
    
    # Apply status filter
    if status_filter:
        orders_query = orders_query.filter_by(status=status_filter)
    
    # Apply agent filter (admin only)
    if agent_filter and user.role == 'admin':
        orders_query = orders_query.filter_by(assigned_agent=agent_filter)
    
    # Apply order type filter
    if order_type_filter:
        orders_query = orders_query.filter_by(order_type=order_type_filter)
    
    orders = orders_query.order_by(Order.created_at.desc()).all()
    
    # Organize orders by status
    orders_by_status = {}
    for status in ORDER_STATUSES.keys():
        orders_by_status[status] = [order for order in orders if order.status == status]
    
    # Get agents for admin to assign orders
    agents = User.query.filter_by(role='agent').all() if user.role == 'admin' else []
    
    # For agents, get their assigned order IDs for template use
    agent_assigned_order_ids = []
    if user.role == 'agent':
        agent_assigned_order_ids = [oa.order_id for oa in user.order_assignments]
    
    # Calculate dashboard statistics
    all_orders = [order for order_list in orders_by_status.values() for order in order_list]
    total_orders = len(all_orders)
    active_orders = total_orders - len(orders_by_status.get('Archived', []))
    total_value = sum(order.amount_usd for order in all_orders)
    completion_rate = (len(orders_by_status.get('Archived', [])) / total_orders * 100) if total_orders > 0 else 0
    
    # Calculate yarn type distribution
    yarn_types = {}
    for order in all_orders:
        yarn_types[order.yarn_type] = yarn_types.get(order.yarn_type, 0) + 1
    
    return render_template('futuristic-dashboard.html', 
                         orders_by_status=orders_by_status, 
                         user=user, 
                         agents=agents,
                         agent_assigned_order_ids=agent_assigned_order_ids,
                         search_query=search_query,
                         status_filter=status_filter,
                         agent_filter=agent_filter,
                         order_type_filter=order_type_filter,
                         ORDER_STATUSES=ORDER_STATUSES,
                         total_orders=total_orders,
                         active_orders=active_orders,
                         total_value=total_value,
                         completion_rate=completion_rate,
                         yarn_types=yarn_types)

@app.route('/create_order', methods=['POST'])
def create_order():
    if 'user_id' not in session:
        return redirect(url_for('login'))
    
    user = User.query.get(session['user_id'])
    
    # Only users and admins can create orders
    if user.role not in ['user', 'admin']:
        flash('Permission denied', 'error')
        return redirect(url_for('dashboard'))
    
    try:
        # Get agent IDs from form
        agent_ids = request.form.getlist('agent_ids')
        
        order = Order(
            order_id=generate_order_id(),
            customer_name=request.form['customer_name'],
            yarn_type=request.form['yarn_type'],
            quantity_kg=float(request.form['quantity_kg']),
            startup_date=datetime.strptime(request.form['startup_date'], '%Y-%m-%d').date(),
            order_type=request.form['order_type'],
            amount_usd=float(request.form['amount_usd']),
            created_by=user.id,
            assigned_agent=int(agent_ids[0]) if agent_ids and user.role == 'admin' else None
        )
        
        db.session.add(order)
        db.session.flush()  # Get the order ID
        
        # Add multiple agent assignments if admin
        if user.role == 'admin' and agent_ids:
            for agent_id in agent_ids:
                agent_id = int(agent_id)
                agent = User.query.get(agent_id)
                if agent and agent.role == 'agent':
                    order_agent = OrderAgent(order_id=order.id, agent_id=agent_id)
                    db.session.add(order_agent)
        
        db.session.commit()
        
        # Log audit
        agent_names = [User.query.get(int(aid)).username for aid in agent_ids] if agent_ids else []
        log_audit(user.id, 'order_created', 'order', order.id, 
                 f"Created order {order.order_id} with agents: {', '.join(agent_names)}" if agent_names else f"Created order {order.order_id} for {order.customer_name}")
        
        flash('Order created successfully!', 'success')
        
        # Send notification emails to all assigned agents
        if agent_ids:
            for agent_id in agent_ids:
                agent = User.query.get(int(agent_id))
                if agent and agent.role == 'agent':
                    subject = f"New Order Assignment: {order.order_id}"
                    message = f"Hello {agent.username},\n\nYou have been assigned to a new order:\n\nOrder ID: {order.order_id}\nCustomer: {order.customer_name}\nYarn Type: {order.yarn_type}\nQuantity: {order.quantity_kg} kg\nAmount: ${order.amount_usd}\n\nPlease log in to view and work on this order.\n\nBest regards,\nOrder Management System"
                    send_notification_email(agent.email, subject, message)
        
    except Exception as e:
        flash(f'Error creating order: {str(e)}', 'error')
    
    return redirect(url_for('dashboard'))

@app.route('/move_order', methods=['POST'])
def move_order():
    if 'user_id' not in session:
        return redirect(url_for('login'))
    
    user = User.query.get(session['user_id'])
    order_id = request.json['order_id']
    new_status = request.json['status']
    
    order = Order.query.get(order_id)
    if not order:
        return jsonify({'success': False, 'message': 'Order not found'})
    
    # Check permissions
    if user.role == 'user':
        return jsonify({'success': False, 'message': 'Permission denied'})
    elif user.role == 'agent':
        return jsonify({'success': False, 'message': 'Agents cannot move orders between lists'})
    
    # Check if move is allowed
    if not can_move_order(user.role, order.status, new_status):
        return jsonify({'success': False, 'message': 'Invalid status transition'})
    
    old_status = order.status
    order.status = new_status
    db.session.commit()
    
    # Log audit
    log_audit(user.id, 'order_moved', 'order', order.id, 
             f"Moved order {order.order_id} from {old_status} to {new_status}")
    
    return jsonify({'success': True})

@app.route('/assign_order', methods=['POST'])
def assign_order():
    if 'user_id' not in session:
        return redirect(url_for('login'))
    
    user = User.query.get(session['user_id'])
    if user.role != 'admin':
        return jsonify({'success': False, 'message': 'Permission denied'})
    
    order_id = request.json['order_id']
    agent_ids = request.json.get('agent_ids', [])  # Support multiple agents
    
    order = Order.query.get(order_id)
    if not order:
        return jsonify({'success': False, 'message': 'Order not found'})
    
    # Validate agents
    agents = []
    for agent_id in agent_ids:
        agent = User.query.get(agent_id)
        if not agent or agent.role != 'agent':
            return jsonify({'success': False, 'message': f'Invalid agent ID: {agent_id}'})
        agents.append(agent)
    
    # Set primary agent (first one)
    if agents:
        order.assigned_agent = agents[0].id
    else:
        order.assigned_agent = None
    
    # Clear existing assignments and add new ones
    OrderAgent.query.filter_by(order_id=order_id).delete()
    
    for agent in agents:
        order_agent = OrderAgent(order_id=order_id, agent_id=agent.id)
        db.session.add(order_agent)
    
    db.session.commit()
    
    # Log audit
    agent_names = [agent.username for agent in agents]
    log_audit(user.id, 'order_assigned', 'order', order.id, 
             f"Assigned order {order.order_id} to agents: {', '.join(agent_names)}")
    
    # Send notification emails
    for agent in agents:
        subject = f"Order Assignment: {order.order_id}"
        message = f"Hello {agent.username},\n\nYou have been assigned to an order:\n\nOrder ID: {order.order_id}\nCustomer: {order.customer_name}\nYarn Type: {order.yarn_type}\nQuantity: {order.quantity_kg} kg\nAmount: ${order.amount_usd}\nStatus: {order.status}\n\nPlease log in to view and work on this order.\n\nBest regards,\nOrder Management System"
        send_notification_email(agent.email, subject, message)
    
    return jsonify({'success': True})

@app.route('/assign_multiple_agents', methods=['POST'])
def assign_multiple_agents():
    if 'user_id' not in session:
        return redirect(url_for('login'))
    
    user = User.query.get(session['user_id'])
    if user.role != 'admin':
        return jsonify({'success': False, 'message': 'Permission denied'})
    
    order_id = request.json['order_id']
    agent_ids = request.json['agent_ids']
    
    order = Order.query.get(order_id)
    if not order:
        return jsonify({'success': False, 'message': 'Order not found'})
    
    # Validate agents
    agents = []
    for agent_id in agent_ids:
        agent = User.query.get(agent_id)
        if not agent or agent.role != 'agent':
            return jsonify({'success': False, 'message': f'Invalid agent ID: {agent_id}'})
        agents.append(agent)
    
    # Set primary agent (first one)
    if agents:
        order.assigned_agent = agents[0].id
    else:
        order.assigned_agent = None
    
    # Clear existing assignments and add new ones
    OrderAgent.query.filter_by(order_id=order_id).delete()
    
    for agent in agents:
        order_agent = OrderAgent(order_id=order_id, agent_id=agent.id)
        db.session.add(order_agent)
    
    db.session.commit()
    
    # Log audit
    agent_names = [agent.username for agent in agents]
    log_audit(user.id, 'order_assigned_multiple', 'order', order.id, 
             f"Assigned order {order.order_id} to agents: {', '.join(agent_names)}")
    
    # Send notification emails
    for agent in agents:
        subject = f"Order Assignment: {order.order_id}"
        message = f"Hello {agent.username},\n\nYou have been assigned to an order:\n\nOrder ID: {order.order_id}\nCustomer: {order.customer_name}\nYarn Type: {order.yarn_type}\nQuantity: {order.quantity_kg} kg\nAmount: ${order.amount_usd}\nStatus: {order.status}\n\nPlease log in to view and work on this order.\n\nBest regards,\nOrder Management System"
        send_notification_email(agent.email, subject, message)
    
    return jsonify({'success': True})

@app.route('/chat/<int:order_id>')
def chat(order_id):
    if 'user_id' not in session:
        return redirect(url_for('login'))
    
    user = User.query.get(session['user_id'])
    order = Order.query.get(order_id)
    
    if not order:
        flash('Order not found', 'error')
        return redirect(url_for('dashboard'))
    
    # Check permissions
    if user.role == 'agent':
        # For confirmed orders, only the primary assigned agent can access
        # For other orders, agents can access if assigned (primary or in OrderAgent table)
        if order.status == 'Confirmed':
            is_assigned = (order.assigned_agent == user.id)
        else:
            is_assigned = (order.assigned_agent == user.id or 
                          OrderAgent.query.filter_by(order_id=order_id, agent_id=user.id).first())
        if not is_assigned:
            flash('Permission denied', 'error')
            return redirect(url_for('dashboard'))
    elif user.role == 'user' and order.created_by != user.id:
        flash('Permission denied', 'error')
        return redirect(url_for('dashboard'))
    
    # Get chat messages based on privacy rules
    print(f"DEBUG: User role: {user.role}, Order ID: {order_id}")
    
    if user.role == 'admin':
        # Admin sees all messages for this order
        messages = ChatMessage.query.filter_by(order_id=order_id).order_by(ChatMessage.created_at).all()
        print(f"DEBUG: Admin found {len(messages)} messages for order {order_id}")
        for msg in messages:
            print(f"DEBUG: Message from {msg.sender.username}: {msg.message[:50]}...")
    elif user.role == 'agent':
        # Agent sees messages where:
        # 1. They sent the message (only visible to admin, but agent can see their own)
        # 2. They are tagged in the message (only tagged agents can see)
        # 3. Message has no tags AND sender is admin (admin messages visible to all agents)
        messages = ChatMessage.query.filter(
            ChatMessage.order_id == order_id,
            db.or_(
                ChatMessage.sender_id == user.id,  # Messages they sent
                db.and_(
                    ChatMessage.tagged_agents.any(ChatTag.agent_id == user.id),  # Messages where they are tagged
                    ChatMessage.sender.has(User.role == 'admin')  # Only admin messages when tagged
                ),
                db.and_(
                    ~ChatMessage.tagged_agents.any(),  # Messages with no tags
                    ChatMessage.sender.has(User.role == 'admin')  # Only admin messages visible to all agents
                )
            )
        ).order_by(ChatMessage.created_at).all()
        print(f"DEBUG: Agent {user.username} found {len(messages)} messages for order {order_id}")
        for msg in messages:
            tags = [tag.agent.username for tag in msg.tagged_agents] if msg.tagged_agents else []
            print(f"DEBUG: Message from {msg.sender.username}: {msg.message[:30]}... Tags: {tags}")
    else:
        # Regular users see their own messages
        messages = ChatMessage.query.filter(
            ChatMessage.order_id == order_id,
            ChatMessage.sender_id == user.id
        ).order_by(ChatMessage.created_at).all()
    
    # Get available agents for admin to tag
    available_agents = []
    if user.role == 'admin':
        assigned_agents = OrderAgent.query.filter_by(order_id=order_id).all()
        available_agents = [oa.agent for oa in assigned_agents]
        if order.assigned_agent and order.agent not in available_agents:
            available_agents.append(order.agent)
    
    return render_template('futuristic-chat.html', order=order, messages=messages, user=user, available_agents=available_agents, participants=participants, online_users=online_users)



@app.route('/send_message', methods=['POST'])
def send_message():
    if 'user_id' not in session:
        return redirect(url_for('login'))
    
    user = User.query.get(session['user_id'])
    order_id = request.json['order_id']
    message = request.json['message']
    tagged_agent_ids = request.json.get('tagged_agents', [])
    
    print(f"DEBUG: Received tagged_agent_ids: {tagged_agent_ids}")
    
    order = Order.query.get(order_id)
    if not order:
        return jsonify({'success': False, 'message': 'Order not found'})
    
    # Check permissions
    if user.role == 'agent':
        # Check if agent is assigned to this order
        is_assigned = (order.assigned_agent == user.id or 
                      OrderAgent.query.filter_by(order_id=order_id, agent_id=user.id).first())
        if not is_assigned:
            return jsonify({'success': False, 'message': 'Permission denied'})
    elif user.role == 'user':
        if order.created_by != user.id:
            return jsonify({'success': False, 'message': 'Permission denied'})
    
    # Validate tagged agents (only admin can tag agents)
    if user.role == 'admin' and tagged_agent_ids:
        for agent_id in tagged_agent_ids:
            agent = User.query.get(agent_id)
            if not agent or agent.role != 'agent':
                return jsonify({'success': False, 'message': f'Invalid agent ID: {agent_id}'})
            # Check if agent is assigned to this order
            is_assigned = (order.assigned_agent == agent.id or 
                          OrderAgent.query.filter_by(order_id=order_id, agent_id=agent.id).first())
            if not is_assigned:
                return jsonify({'success': False, 'message': f'Agent {agent.username} not assigned to this order'})
    
    # Create chat message
    chat_message = ChatMessage(
        order_id=order_id,
        sender_id=user.id,
        message=message
    )
    
    db.session.add(chat_message)
    db.session.flush()  # Get the message ID
    
    print(f"DEBUG: Created message ID {chat_message.id} from {user.username}: {message[:50]}...")
    
    # Add tags for agents
    if user.role == 'admin' and tagged_agent_ids:
        for agent_id in tagged_agent_ids:
            chat_tag = ChatTag(message_id=chat_message.id, agent_id=agent_id)
            db.session.add(chat_tag)
            print(f"DEBUG: Added tag for agent {agent_id}")
    
    db.session.commit()
    print(f"DEBUG: Message committed to database")
    
    # Log audit
    tag_info = f" tagged {len(tagged_agent_ids)} agents" if tagged_agent_ids else ""
    log_audit(user.id, 'message_sent', 'chat', chat_message.id, 
             f"Sent message in order {order.order_id}{tag_info}")
    
    return jsonify({'success': True})


@app.route('/edit_order/<int:order_id>')
def edit_order(order_id):
    if 'user_id' not in session:
        return redirect(url_for('login'))
    
    user = User.query.get(session['user_id'])
    order = Order.query.get(order_id)
    
    if not order:
        flash('Order not found', 'error')
        return redirect(url_for('dashboard'))
    
    # Check permissions
    if user.role == 'agent':
        # Check if agent is assigned to this order
        is_assigned = (order.assigned_agent == user.id or 
                      OrderAgent.query.filter_by(order_id=order_id, agent_id=user.id).first())
        if not is_assigned:
            flash('Permission denied', 'error')
            return redirect(url_for('dashboard'))
    elif user.role == 'user' and order.created_by != user.id:
        flash('Permission denied', 'error')
        return redirect(url_for('dashboard'))
    
    # Get agents for admin to assign
    agents = User.query.filter_by(role='agent').all() if user.role == 'admin' else []
    
    return render_template('futuristic-edit-order.html', order=order, user=user, agents=agents, ORDER_STATUSES=ORDER_STATUSES)

@app.route('/update_order', methods=['POST'])
def update_order():
    if 'user_id' not in session:
        return redirect(url_for('login'))
    
    user = User.query.get(session['user_id'])
    order_id = request.form['order_id']
    order = Order.query.get(order_id)
    
    if not order:
        flash('Order not found', 'error')
        return redirect(url_for('dashboard'))
    
    # Check permissions
    if user.role == 'agent':
        # Check if agent is assigned to this order
        is_assigned = (order.assigned_agent == user.id or 
                      OrderAgent.query.filter_by(order_id=order_id, agent_id=user.id).first())
        if not is_assigned:
            flash('Permission denied', 'error')
            return redirect(url_for('dashboard'))
    elif user.role == 'user' and order.created_by != user.id:
        flash('Permission denied', 'error')
        return redirect(url_for('dashboard'))
    
    try:
        # Update order fields
        order.customer_name = request.form['customer_name']
        order.yarn_type = request.form['yarn_type']
        order.quantity_kg = float(request.form['quantity_kg'])
        order.startup_date = datetime.strptime(request.form['startup_date'], '%Y-%m-%d').date()
        order.order_type = request.form['order_type']
        order.amount_usd = float(request.form['amount_usd'])
        
        # Only admin can change status and assign agents
        if user.role == 'admin':
            order.status = request.form['status']
            agent_id = request.form.get('assigned_agent', '')
            order.assigned_agent = int(agent_id) if agent_id else None
            
            # Update agent assignments
            OrderAgent.query.filter_by(order_id=order_id).delete()
            agent_ids = request.form.getlist('agent_ids')
            for agent_id in agent_ids:
                agent_id = int(agent_id)
                agent = User.query.get(agent_id)
                if agent and agent.role == 'agent':
                    order_agent = OrderAgent(order_id=order_id, agent_id=agent_id)
                    db.session.add(order_agent)
        
        order.updated_at = datetime.utcnow()
        db.session.commit()
        
        # Log audit
        log_audit(user.id, 'order_updated', 'order', order.id, f"Updated order {order.order_id}")
        
        flash('Order updated successfully!', 'success')
        
    except Exception as e:
        flash(f'Error updating order: {str(e)}', 'error')
    
    return redirect(url_for('dashboard'))

@app.route('/edit_user/<int:user_id>')
def edit_user(user_id):
    if 'user_id' not in session:
        return redirect(url_for('login'))
    
    current_user = User.query.get(session['user_id'])
    if current_user.role != 'admin':
        flash('Access denied. Admin privileges required.', 'error')
        return redirect(url_for('dashboard'))
    
    user = User.query.get(user_id)
    if not user:
        flash('User not found', 'error')
        return redirect(url_for('admin_panel'))
    
    return render_template('edit_user.html', user=user, current_user=current_user)

@app.route('/contracts')
def contracts():
    if 'user_id' not in session:
        return redirect(url_for('login'))
    
    user = User.query.get(session['user_id'])
    
    # Get orders that are Booked or Received Contract
    if user.role == 'admin':
        orders = Order.query.filter(Order.status.in_(['Booked', 'Received Contract'])).all()
    elif user.role == 'agent':
        orders = Order.query.filter(
            Order.status.in_(['Booked', 'Received Contract']),
            Order.assigned_agent == user.id
        ).all()
    else:
        orders = Order.query.filter(
            Order.status.in_(['Booked', 'Received Contract']),
            Order.created_by == user.id
        ).all()
    
    return render_template('contracts.html', orders=orders, user=user)

@app.route('/upload_contract', methods=['POST'])
def upload_contract():
    if 'user_id' not in session:
        return redirect(url_for('login'))
    
    user = User.query.get(session['user_id'])
    if user.role not in ['admin', 'agent']:
        flash('Permission denied', 'error')
        return redirect(url_for('contracts'))
    
    order_id = request.form['order_id']
    order = Order.query.get(order_id)
    
    if not order:
        flash('Order not found', 'error')
        return redirect(url_for('contracts'))
    
    # Check permissions
    if user.role == 'agent' and order.assigned_agent != user.id:
        flash('Permission denied', 'error')
        return redirect(url_for('contracts'))
    
    if 'contract_file' not in request.files:
        flash('No file selected', 'error')
        return redirect(url_for('contracts'))
    
    file = request.files['contract_file']
    if file.filename == '':
        flash('No file selected', 'error')
        return redirect(url_for('contracts'))
    
    if file:
        # Save file (simplified - in production use proper file handling)
        filename = f"{order.order_id}_{file.filename}"
        file_path = f"uploads/{filename}"
        
        # Create uploads directory if it doesn't exist
        os.makedirs('uploads', exist_ok=True)
        file.save(file_path)
        
        # Save contract record
        contract = Contract(
            order_id=order.id,
            filename=filename,
            file_path=file_path,
            uploaded_by=user.id
        )
        
        db.session.add(contract)
        
        # Update order status to Received Contract
        if order.status == 'Booked':
            order.status = 'Received Contract'
        
        db.session.commit()
        
        # Log audit
        log_audit(user.id, 'contract_uploaded', 'contract', contract.id, 
                 f"Uploaded contract for order {order.order_id}")
        
        flash('Contract uploaded successfully!', 'success')
    
    return redirect(url_for('contracts'))

@app.route('/reports')
def reports():
    if 'user_id' not in session:
        return redirect(url_for('login'))
    
    user = User.query.get(session['user_id'])
    if user.role != 'admin':
        flash('Access denied. Admin privileges required.', 'error')
        return redirect(url_for('dashboard'))
    
    # Get filter parameters
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')
    agent_filter = request.args.get('agent')
    customer_filter = request.args.get('customer')
    order_type_filter = request.args.get('order_type')
    
    # Build query
    orders_query = Order.query
    
    if start_date:
        orders_query = orders_query.filter(Order.startup_date >= datetime.strptime(start_date, '%Y-%m-%d').date())
    if end_date:
        orders_query = orders_query.filter(Order.startup_date <= datetime.strptime(end_date, '%Y-%m-%d').date())
    if agent_filter:
        orders_query = orders_query.filter_by(assigned_agent=agent_filter)
    if customer_filter:
        orders_query = orders_query.filter(Order.customer_name.contains(customer_filter))
    if order_type_filter:
        orders_query = orders_query.filter_by(order_type=order_type_filter)
    
    orders = orders_query.all()
    
    # Calculate statistics
    total_orders = len(orders)
    total_amount = sum(order.amount_usd for order in orders)
    
    orders_by_status = {}
    for status in ORDER_STATUSES.keys():
        orders_by_status[status] = [order for order in orders if order.status == status]
    
    orders_by_type = {}
    for order_type in ['Local', 'Export']:
        orders_by_type[order_type] = [order for order in orders if order.order_type == order_type]
    
    # Get agents for filter
    agents = User.query.filter_by(role='agent').all()
    
    return render_template('reports.html', 
                         orders=orders,
                         orders_by_status=orders_by_status,
                         orders_by_type=orders_by_type,
                         total_orders=total_orders,
                         total_amount=total_amount,
                         agents=agents,
                         start_date=start_date,
                         end_date=end_date,
                         agent_filter=agent_filter,
                         customer_filter=customer_filter,
                         order_type_filter=order_type_filter)

@app.route('/profile')
def profile():
    if 'user_id' not in session:
        return redirect(url_for('login'))
    
    user = User.query.get(session['user_id'])
    return render_template('profile.html', user=user)

@app.route('/update_profile', methods=['POST'])
def update_profile():
    if 'user_id' not in session:
        return redirect(url_for('login'))
    
    user = User.query.get(session['user_id'])
    
    # Update user information
    if request.form.get('username'):
        user.username = request.form['username']
    if request.form.get('email'):
        user.email = request.form['email']
    if request.form.get('password'):
        user.password_hash = generate_password_hash(request.form['password'])
    
    db.session.commit()
    flash('Profile updated successfully!', 'success')
    return redirect(url_for('profile'))

@app.route('/admin_stats')
def admin_stats():
    if 'user_id' not in session:
        return redirect(url_for('login'))
    
    user = User.query.get(session['user_id'])
    if user.role != 'admin':
        flash('Access denied. Admin privileges required.', 'error')
        return redirect(url_for('dashboard'))
    
    # Get statistics
    total_orders = Order.query.count()
    total_users = User.query.count()
    total_agents = User.query.filter_by(role='agent').count()
    total_admins = User.query.filter_by(role='admin').count()
    total_regular_users = User.query.filter_by(role='user').count()
    
    # Orders by status
    orders_by_status = {}
    for status in ORDER_STATUSES.keys():
        count = Order.query.filter_by(status=status).count()
        orders_by_status[status] = count
    
    # Orders by agent
    orders_by_agent = {}
    for agent in User.query.filter_by(role='agent').all():
        count = Order.query.filter_by(assigned_agent=agent.id).count()
        orders_by_agent[agent.username] = count
    
    # Revenue statistics
    total_revenue = db.session.query(db.func.sum(Order.amount_usd)).scalar() or 0
    local_revenue = db.session.query(db.func.sum(Order.amount_usd)).filter_by(order_type='Local').scalar() or 0
    export_revenue = db.session.query(db.func.sum(Order.amount_usd)).filter_by(order_type='Export').scalar() or 0
    
    # Recent activity
    recent_orders = Order.query.order_by(Order.created_at.desc()).limit(10).all()
    recent_messages = ChatMessage.query.order_by(ChatMessage.created_at.desc()).limit(10).all()
    
    return render_template('admin_stats.html', 
                         user=user,
                         total_orders=total_orders,
                         total_users=total_users,
                         total_agents=total_agents,
                         total_admins=total_admins,
                         total_regular_users=total_regular_users,
                         orders_by_status=orders_by_status,
                         orders_by_agent=orders_by_agent,
                         total_revenue=total_revenue,
                         local_revenue=local_revenue,
                         export_revenue=export_revenue,
                         recent_orders=recent_orders,
                         recent_messages=recent_messages)

@app.route('/export_orders')
def export_orders():
    if 'user_id' not in session:
        return redirect(url_for('login'))
    
    user = User.query.get(session['user_id'])
    if user.role != 'admin':
        flash('Access denied. Admin privileges required.', 'error')
        return redirect(url_for('dashboard'))
    
    # Get all orders
    orders = Order.query.all()
    
    # Create CSV content
    csv_content = "Order ID,Customer Name,Yarn Type,Quantity (kg),Startup Date,Order Type,Amount (USD),Status,Created By,Assigned Agent,Created At,Updated At\n"
    
    for order in orders:
        csv_content += f"{order.order_id},{order.customer_name},{order.yarn_type},{order.quantity_kg},{order.startup_date},{order.order_type},{order.amount_usd},{order.status},{order.creator.username},{order.agent.username if order.agent else 'Unassigned'},{order.created_at},{order.updated_at}\n"
    
    # Return CSV file
    from flask import Response
    return Response(
        csv_content,
        mimetype='text/csv',
        headers={'Content-Disposition': 'attachment; filename=orders_export.csv'}
    )

@app.route('/admin_panel')
def admin_panel():
    if 'user_id' not in session:
        return redirect(url_for('login'))
    
    user = User.query.get(session['user_id'])
    if user.role != 'admin':
        flash('Access denied. Admin privileges required.', 'error')
        return redirect(url_for('dashboard'))
    
    # Get all users
    users = User.query.all()
    
    # Get all orders
    all_orders = Order.query.order_by(Order.created_at.desc()).all()
    
    # Get unassigned orders
    unassigned_orders = Order.query.filter_by(assigned_agent=None).all()
    
    return render_template('futuristic-admin-panel.html', users=users, all_orders=all_orders, unassigned_orders=unassigned_orders, user=user)

@app.route('/update_user', methods=['POST'])
def update_user():
    if 'user_id' not in session:
        return redirect(url_for('login'))
    
    user = User.query.get(session['user_id'])
    if user.role != 'admin':
        return jsonify({'success': False, 'message': 'Permission denied'})
    
    user_id = request.json['user_id']
    action = request.json['action']
    
    target_user = User.query.get(user_id)
    if not target_user:
        return jsonify({'success': False, 'message': 'User not found'})
    
    if action == 'deactivate':
        target_user.is_active = False
        db.session.commit()
        
        # Log audit
        log_audit(user.id, 'user_deactivated', 'user', user_id, 
                 f"Deactivated user {target_user.username}")
        
        return jsonify({'success': True, 'message': 'User deactivated'})
    elif action == 'activate':
        target_user.is_active = True
        db.session.commit()
        
        # Log audit
        log_audit(user.id, 'user_activated', 'user', user_id, 
                 f"Activated user {target_user.username}")
        
        return jsonify({'success': True, 'message': 'User activated'})
    
    return jsonify({'success': False, 'message': 'Invalid action'})

@app.route('/download_contract/<int:contract_id>')
def download_contract(contract_id):
    if 'user_id' not in session:
        return redirect(url_for('login'))
    
    user = User.query.get(session['user_id'])
    contract = Contract.query.get(contract_id)
    
    if not contract:
        flash('Contract not found', 'error')
        return redirect(url_for('contracts'))
    
    # Check permissions
    if user.role == 'agent' and contract.order.assigned_agent != user.id:
        flash('Permission denied', 'error')
        return redirect(url_for('contracts'))
    elif user.role == 'user' and contract.order.created_by != user.id:
        flash('Permission denied', 'error')
        return redirect(url_for('contracts'))
    
    # Log audit
    log_audit(user.id, 'contract_downloaded', 'contract', contract_id, 
             f"Downloaded contract {contract.filename}")
    
    from flask import send_file
    return send_file(contract.file_path, as_attachment=True, download_name=contract.filename)

@app.route('/logout')
def logout():
    session.clear()
    flash('You have been logged out', 'info')
    return redirect(url_for('login'))

# Initialize database
def create_tables():
    try:
        with app.app_context():
            db.create_all()
            
            # Create admin user if it doesn't exist
            if User.query.filter_by(role='admin').count() == 0:
                admin = User(
                    username='admin',
                    email='admin@yarnsystem.com',
                    password_hash=generate_password_hash('admin123'),
                    role='admin'
                )
                db.session.add(admin)
                db.session.commit()
            
            # Create sample agents if none exist
            if User.query.filter_by(role='agent').count() == 0:
                agents = [
                    User(username='agent1', email='agent1@yarnsystem.com', password_hash=generate_password_hash('agent123'), role='agent'),
                    User(username='agent2', email='agent2@yarnsystem.com', password_hash=generate_password_hash('agent123'), role='agent'),
                    User(username='agent3', email='agent3@yarnsystem.com', password_hash=generate_password_hash('agent123'), role='agent'),
                    User(username='agent4', email='agent4@yarnsystem.com', password_hash=generate_password_hash('agent123'), role='agent'),
                    User(username='agent5', email='agent5@yarnsystem.com', password_hash=generate_password_hash('agent123'), role='agent')
                ]
                for agent in agents:
                    db.session.add(agent)
                db.session.commit()
            
            # Create sample users if none exist
            if User.query.filter_by(role='user').count() == 0:
                users = [
                    User(username='user1', email='user1@yarnsystem.com', password_hash=generate_password_hash('user123'), role='user'),
                    User(username='user2', email='user2@yarnsystem.com', password_hash=generate_password_hash('user123'), role='user'),
                    User(username='user3', email='user3@yarnsystem.com', password_hash=generate_password_hash('user123'), role='user'),
                    User(username='user4', email='user4@yarnsystem.com', password_hash=generate_password_hash('user123'), role='user'),
                    User(username='user5', email='user5@yarnsystem.com', password_hash=generate_password_hash('user123'), role='user')
                ]
                for user in users:
                    db.session.add(user)
                db.session.commit()
    except Exception as e:
        print(f"Database initialization error: {e}")
        # Don't crash the app if database initialization fails
        pass

@app.route('/confirm_order/<int:order_id>')
def confirm_order(order_id):
    if 'user_id' not in session:
        return redirect(url_for('login'))
    
    user = User.query.get(session['user_id'])
    if user.role != 'admin':
        flash('Permission denied', 'error')
        return redirect(url_for('dashboard'))
    
    order = Order.query.get(order_id)
    if not order:
        flash('Order not found', 'error')
        return redirect(url_for('dashboard'))
    
    # Get all assigned agents
    assigned_agents = OrderAgent.query.filter_by(order_id=order_id).all()
    agents = [oa.agent for oa in assigned_agents]
    if order.assigned_agent and order.agent not in agents:
        agents.append(order.agent)
    
    return render_template('confirm_order.html', order=order, agents=agents, user=user)

@app.route('/test_message/<int:order_id>')
def test_message(order_id):
    if 'user_id' not in session:
        return redirect(url_for('login'))
    
    user = User.query.get(session['user_id'])
    if user.role != 'admin':
        return "Admin only", 403
    
    order = Order.query.get(order_id)
    if not order:
        return "Order not found", 404
    
    # Create a test message
    test_message = ChatMessage(
        order_id=order_id,
        sender_id=user.id,
        message="Test message from admin"
    )
    
    db.session.add(test_message)
    db.session.commit()
    
    return f"Test message created for order {order_id}"

@app.route('/confirm_order_action', methods=['POST'])
def confirm_order_action():
    if 'user_id' not in session:
        return redirect(url_for('login'))
    
    user = User.query.get(session['user_id'])
    if user.role != 'admin':
        return jsonify({'success': False, 'message': 'Permission denied'})
    
    order_id = request.json['order_id']
    selected_agent_id = request.json['selected_agent_id']
    
    order = Order.query.get(order_id)
    if not order:
        return jsonify({'success': False, 'message': 'Order not found'})
    
    # Update order status to Confirmed and assign single agent
    order.status = 'Confirmed'
    order.assigned_agent = selected_agent_id
    
    # Remove all other agent assignments
    OrderAgent.query.filter_by(order_id=order_id).delete()
    
    db.session.commit()
    
    # Log audit
    log_audit(user.id, 'order_confirmed', 'order', order.id, 
             f"Confirmed order {order.order_id} and assigned to agent {User.query.get(selected_agent_id).username}")
    
    return jsonify({'success': True, 'message': 'Order confirmed and assigned to selected agent'})


@app.route('/delete_order', methods=['POST'])
def delete_order():
    if 'user_id' not in session:
        return redirect(url_for('login'))
    
    user = User.query.get(session['user_id'])
    if user.role != 'admin':
        return jsonify({'success': False, 'message': 'Permission denied'})
    
    order_id = request.json['order_id']
    
    order = Order.query.get(order_id)
    if not order:
        return jsonify({'success': False, 'message': 'Order not found'})
    
    # Store order info for audit log before deletion
    order_info = f"Order {order.order_id} - {order.customer_name} - ${order.amount_usd}"
    
    # Delete related records first (due to foreign key constraints)
    ChatMessage.query.filter_by(order_id=order_id).delete()
    OrderAgent.query.filter_by(order_id=order_id).delete()
    Contract.query.filter_by(order_id=order_id).delete()
    AuditLog.query.filter_by(entity_type='order', entity_id=order_id).delete()
    
    # Delete the order
    db.session.delete(order)
    db.session.commit()
    
    # Log audit
    log_audit(user.id, 'order_deleted', 'order', order_id, f"Deleted {order_info}")
    
    return jsonify({'success': True, 'message': 'Order deleted successfully'})

if __name__ == '__main__':
    create_tables()
    app.run(debug=True, port=5001)

# Initialize database when imported (for serverless)
try:
    create_tables()
except Exception as e:
    print(f"Initial database setup failed: {e}")
    # Continue anyway - tables will be created on first request

# Add a simple test route for debugging
@app.route('/api/test')
def api_test():
    return jsonify({
        'status': 'working',
        'environment': {
            'SECRET_KEY': 'configured' if app.config.get('SECRET_KEY') != 'your-secret-key-here' else 'missing',
            'DATABASE_URL': 'configured' if app.config.get('SQLALCHEMY_DATABASE_URI') != 'sqlite:///yarn_system.db' else 'missing'
        }
    })
