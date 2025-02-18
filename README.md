
# Online Meetings

**Online Meetings** is a web-based platform for creating and managing virtual meetings with built-in chat, file uploads, user management, two-factor authentication (2FA), and own testing system. The system supports real-time communication using WebSockets, user profiles with avatar uploads, and meeting invitation management.

The demo of application is already hosted at `https://qalyn.top`.
### Manual Launch (Using Web Interface)
- `cd electron`
- `npm i`
- `npm start`

## Table of Contents
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)
- [Role Management](#role-management)
- [Meeting Management](#meeting-management)
- [Profile Settings](#profile-settings)
- [Security](#security)
- [Contributing](#contributing)
- [License](#license)

## Features

### User Authentication
- **JWT-based authentication**: Secure login and registration for users.
- **Two-Factor Authentication (2FA)**: Optional 2FA for added security using `speakeasy`.

### Role-Based Access Control
- **User roles**: Admin, Teacher, and Student, each with different permissions.
- **Admin Panel**: Admins can:
  - Create and delete meeting invites.
  - Promote or demote user roles (e.g., student to teacher).
  - View all scheduled meetings through a quick view panel.

### Meeting Management
- **Create Meetings**: Admins and teachers can create meetings.
- **Mute and Unmute Participants**: During meetings, users can toggle their microphone.
- **Real-time Chat**: Users can participate in a live chat during meetings.
- **File Sharing**: Upload files in the chat using Multer for file handling.

### Profile Settings
- **User Profiles**: Update email, password, and avatar.
- **2FA Setup**: Users can enable or disable 2FA for extra account protection.
- **Avatar Upload**: Users can upload profile pictures using the avatar upload feature.

### Real-time Communication
- **WebSockets**: Powered by `Socket.io` for real-time messaging and notifications.

### Meeting Invitations
- **Invite Management**: Admins can send invites to users for specific meetings.

## Tech Stack

### Back-end
- **Node.js** with **Express.js**: For building a REST API and handling requests.
- **Socket.io**: For real-time messaging and notifications.
- **JWT (JSON Web Token)**: For authentication and authorization.
- **Multer**: For handling file uploads (avatars and chat file sharing).
- **Speakeasy**: For Two-Factor Authentication (2FA).

### Database
- **JSON Files**: A simple file-based database solution(Has an ability to quick implement any db u want).

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/enoughdrama/online-meetings.git
   ```
   
2. Navigate into the project directory:
   ```bash
   cd online-meetings
   ```

3. Install dependencies:
   ```bash
   cd frontend
   npm i

   cd ..
   cd backend
   npm i
   ```

5. Run the application:
   ```bash
   cd frontend
   npm start

   cd ..
   cd backend
   npm start
   ```

- The server will start at `http://localhost:5000`.
- The application will start at `http://localhost:3000`.

## Usage

Once the application is running:

1. **Register/Login**: Users can register and log in.
2. **User Roles**: Users will be assigned the default role of a "student".
3. **Admin Access**: Admins can access the admin panel to manage roles, meetings, and invites.
4. **Meeting Management**: Admins and teachers can create meetings. Participants can join meetings, send chat messages, share files, and mute/unmute their microphones.
5. **Profile Management**: Users can update their profile details, including uploading avatars, changing emails/passwords, and enabling 2FA.

## API Endpoints

Here is a summary of the key API endpoints:

### Authentication
- `POST /api/register`: Register a new user.
- `POST /api/login`: Log in and receive a JWT token.

### Profile
- `GET /api/profile`: Get user profile data.
- `POST /api/profile/update`: Update email, password, and avatar.
- `POST /api/profile/2fa/enable`: Enable 2FA.
- `POST /api/profile/2fa/disable`: Disable 2FA.

### Meetings
- `POST /api/meetings/create`: Create a new meeting (admins and teachers only).
- `GET /api/meetings`: Get a list of upcoming meetings.
- `POST /api/meetings/invite`: Send a meeting invite (admins only).

### Chat and Files
- `POST /api/chat/send`: Send a chat message in a meeting.
- `POST /api/chat/upload`: Upload a file in the meeting chat.

### Admin
- `GET /api/admin/users`: Get a list of all users.
- `POST /api/admin/user/update-role`: Update a user role (admin only).
- `POST /api/admin/invites/create`: Create an invite link for a meeting.
- `POST /api/admin/invites/delete`: Delete an invite.

## Role Management

The platform supports three main roles:
- **Admin**: Full access to create and manage meetings, users, and invites.
- **Teacher**: Can create meetings but cannot manage other users or send invites.
- **Student**: Can join meetings and participate in chat.

Admins can quickly switch user roles and grant access to various features from the admin panel.

## Meeting Management

Only admins and teachers can create meetings. The admin panel provides an overview of all scheduled meetings. During a meeting, users can:
- Mute/unmute their microphones.
- Participate in real-time chat.
- Upload files in the chat for collaboration.

## Profile Settings

Users can access their profile page to:
- Update their email and password.
- Upload a profile avatar.
- Enable/disable 2FA for enhanced security.

## Security

- **JWT Authentication**: Used for secure user sessions.
- **Two-Factor Authentication**: Users can optionally set up 2FA via Google Authenticator or another compatible app.
- **Role-Based Access**: Features are gated by user roles, ensuring that only authorized users can access certain functionality.

## Contributing

We welcome contributions to enhance the platform! Please fork the repository, create a feature branch, and submit a pull request. All contributions are subject to code review and must adhere to our [contribution guidelines](CONTRIBUTING.md).

## License

This project is licensed under the Apache 2.0 License - see the [LICENSE](LICENSE) file for details.
