# Eventra - Event Operations Platform

A comprehensive event management platform designed for organizing and managing cultural events, conferences, and workshops. Built with vanilla HTML, CSS, and JavaScript.

## Features

- **Multi-Role Support**: Coordinator, Finance Manager, Faculty Advisor, and Volunteer roles
- **Event Management**: Create, plan, and track events with detailed information
- **Budget Tracking**: Monitor expenses across different categories with visual charts
- **Task Management**: Assign and track tasks for team members
- **Guest Management**: Handle guest registrations and accommodations
- **Analytics Dashboard**: View comprehensive reports and insights
- **Receipt Scanning**: OCR-powered receipt processing
- **Real-time Notifications**: Stay updated on event activities

## Project Structure

```
eventra/
├── main.html              # Main application file
├── assets/
│   ├── css/
│   │   └── styles.css     # All styling and themes
│   ├── js/
│   │   └── app.js         # Application logic and interactions
│   └── images/            # Event images and assets
├── README.md             # This file
└── .gitignore           # Git ignore rules
```

## Technology Stack

- **HTML5**: Semantic markup and structure
- **CSS3**: Custom properties, Flexbox, Grid, and responsive design
- **JavaScript (ES6+)**: Vanilla JS with modern features
- **Chart.js**: Data visualization for analytics and budgets
- **Tabler Icons**: Scalable icon library
- **Google Fonts**: DM Sans and DM Mono typography

## Getting Started

1. **Clone or Download** the project files
2. **Open** `main.html` in a modern web browser
3. **Navigate** through different sections using the left sidebar
4. **Switch roles** using the role selector in the header

## Key Components

### Navigation
- Dashboard: Overview with KPI cards
- Events: Event creation and management
- Calendar: Event scheduling
- Budget: Expense tracking and allocation
- Tasks: Team task management
- Analytics: Data insights and reports

### Features
- **Modal System**: Dynamic forms for creating events, expenses, tasks, etc.
- **Chart Integration**: Interactive charts for budget burn, analytics, and predictions
- **Responsive Design**: Works on desktop and mobile devices
- **Role-Based UI**: Different features available based on user role

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Development

The project uses external CDNs for:
- Chart.js (4.4.0)
- Tabler Icons (3.19.0)
- Google Fonts (DM Sans, DM Mono)

All custom code is contained in the `assets/` directory for easy maintenance and updates.

## Upload to GitHub

1. **Install Git** (if not already installed):
   - Download from https://git-scm.com/downloads
   - Follow the installation wizard

2. **Initialize Git Repository**:
   ```bash
   cd "path/to/eventra/folder"
   git init
   git add .
   git commit -m "Initial commit: Eventra Event Management Platform"
   ```

3. **Create GitHub Repository**:
   - Go to https://github.com and sign in
   - Click "New repository"
   - Name it "eventra" or your preferred name
   - Don't initialize with README (we already have one)
   - Click "Create repository"

4. **Connect and Push**:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   git branch -M main
   git push -u origin main
   ```

5. **Verify**: Check your GitHub repository to see the uploaded files

## Contributing

This project demonstrates modern web development practices with vanilla technologies. Feel free to fork and enhance with additional features.

## License

This project is for educational and demonstration purposes.