# Yarn Purchasing System

A comprehensive web application for managing yarn purchasing workflows, inspired by Trello's card-based system. Built with Flask, HTML, CSS, and JavaScript.

## Features

### User Roles & Permissions

- **Admin**: Full access to all cards, can assign agents, chat with agents
- **Agent**: Can only see assigned cards, chat with admin
- **User**: Can create cards, see cards in "New Contracts", "Booked", "Contract Received", and "Archived" lists, move cards between lists

### Core Functionality

- **Card Management**: Create, move, and manage yarn purchasing cards
- **Drag & Drop**: Intuitive card movement between lists
- **Real-time Chat**: Admin-Agent communication per card
- **Role-based Access**: Secure permissions based on user roles
- **Responsive Design**: Modern, mobile-friendly interface
- **Search & Filtering**: Find cards quickly with advanced search
- **User Profiles**: Manage user information and view activity
- **Admin Statistics**: Comprehensive dashboard with analytics
- **Email Notifications**: Automatic notifications for card assignments
- **Data Export**: Export card data to CSV format

## Installation

1. **Clone or download the project**
   ```bash
   cd /Users/user/Desktop/easeitapp
   ```

2. **Create virtual environment and install dependencies**
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   ```

3. **Run the application**
   ```bash
   source venv/bin/activate
   python app.py
   ```

4. **Access the application**
   Open your browser and go to `http://localhost:5001`

## Default Login

- **Admin Account**: 
  - Username: `admin`
  - Password: `admin123`

## Usage

### Getting Started

1. **Register new users** with different roles (admin, agent, user)
2. **Login** with your credentials
3. **Create cards** (users only) for new yarn purchasing requests
4. **Assign agents** to cards (admin only)
5. **Move cards** between lists to track progress
6. **Chat** with team members about specific cards

### Card Lists

- **New Contracts**: Initial cards created by users
- **Booked**: Cards that have been booked
- **Contract Received**: Cards with received contracts
- **Archived**: Completed or archived cards

### Chat System

- **Admin ↔ Agent**: Direct communication per card
- **User**: Can chat about their own cards
- **Real-time**: Messages appear instantly
- **Card-specific**: Each card has its own chat thread

### Advanced Features

- **Search & Filter**: Find cards by title, description, list, or assignment
- **User Profiles**: View and edit personal information, see activity history
- **Admin Dashboard**: Comprehensive statistics and analytics
- **Email Notifications**: Automatic alerts when cards are assigned
- **Data Export**: Download card data as CSV files
- **Mobile Responsive**: Works perfectly on all device sizes

## Project Structure

```
easeitapp/
├── app.py                 # Main Flask application
├── requirements.txt       # Python dependencies
├── templates/            # HTML templates
│   ├── base.html         # Base template
│   ├── login.html        # Login page
│   ├── register.html     # Registration page
│   ├── dashboard.html    # Main dashboard
│   └── chat.html         # Chat interface
├── static/
│   ├── css/
│   │   └── style.css     # Main stylesheet
│   └── js/
│       └── main.js       # JavaScript functionality
└── yarn_system.db        # SQLite database (created automatically)
```

## Technology Stack

- **Backend**: Flask (Python)
- **Database**: SQLite with SQLAlchemy ORM
- **Frontend**: HTML5, CSS3, JavaScript
- **Styling**: Custom CSS with modern design
- **Icons**: Font Awesome
- **Authentication**: Session-based with password hashing

## Security Features

- Password hashing with Werkzeug
- Session management
- Role-based access control
- Input validation and sanitization
- CSRF protection (Flask built-in)

## Customization

### Adding New Lists
Edit the `create_tables()` function in `app.py` to add new card lists.

### Modifying User Permissions
Update the role-based logic in the dashboard route and templates.

### Styling Changes
Modify `static/css/style.css` to customize the appearance.

## Troubleshooting

### Common Issues

1. **Database errors**: Delete `yarn_system.db` and restart the app
2. **Port conflicts**: Change the port in `app.run(port=5001)`
3. **Permission errors**: Ensure the app has write permissions in the directory

### Development Mode

The app runs in debug mode by default. For production:
- Set `debug=False` in `app.run()`
- Use a production WSGI server like Gunicorn
- Configure proper database (PostgreSQL, MySQL)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the MIT License.
