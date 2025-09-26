# State Street Cursor Test - Next.js App

A Next.js application with TypeScript that provides role-based access control using Box.com userID authentication.

## Features

- **Box.com Authentication**: Uses userID from URL parameters for authentication
- **Role-based Access Control**: Different interfaces for admin and regular users
- **Admin Dashboard**: Full access to AdminView, Recertification, and Container Recertification Details
- **User Interface**: Access to Recertification and Container Recertification Details only
- **Responsive Design**: Built with Tailwind CSS for mobile and desktop compatibility

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables by copying `.env.local` and updating the values:
   ```bash
   cp .env.local .env.local.local
   ```

4. Update the environment variables in `.env.local`:
   ```
   # Box.com API Configuration
   BOX_CLIENT_ID=your_box_client_id
   BOX_CLIENT_SECRET=your_box_client_secret
   BOX_ENTERPRISE_ID=your_box_enterprise_id

   # Admin User IDs (comma-separated list)
   ADMIN_USER_IDS=user1,user2,user3

   # Next.js Configuration
   NEXTAUTH_URL=http://localhost:3000
   ```

### Running the Application

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

### Authentication

The application requires a `userID` parameter in the URL to authenticate users. The userID should correspond to a Box.com user ID.

**Example URLs:**
- Admin user: `http://localhost:3000?userID=admin_user_1`
- Regular user: `http://localhost:3000?userID=regular_user_1`

### Admin Users

Admin users have access to:
- **AdminView**: Dashboard with statistics and quick actions
- **Recertification**: Manage user certifications
- **Container Recertification Details**: Manage container certifications

### Regular Users

Regular users have access to:
- **Recertification**: View and manage their own certifications
- **Container Recertification Details**: View container certification details

### Setting Admin Users

To make a user an admin, add their userID to the `ADMIN_USER_IDS` environment variable:

```
ADMIN_USER_IDS=user1,user2,user3
```

## Project Structure

```
src/
├── app/
│   ├── admin/
│   │   └── page.tsx          # Admin dashboard page
│   ├── recertification/
│   │   └── page.tsx          # Recertification page
│   ├── container-details/
│   │   └── page.tsx          # Container details page
│   ├── layout.tsx            # Root layout
│   └── page.tsx              # Home page with routing logic
├── components/
│   ├── AdminView.tsx         # Admin dashboard component
│   ├── ContainerRecertificationDetails.tsx
│   ├── Layout.tsx            # Main layout wrapper
│   ├── Navbar.tsx            # Navigation component
│   └── Recertification.tsx   # Recertification component
├── lib/
│   └── auth.ts               # Authentication utilities
└── types/
    └── auth.ts               # TypeScript type definitions
```

## Technologies Used

- **Next.js 15** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Box Node SDK** - Box.com integration (ready for implementation)

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `BOX_CLIENT_ID` | Box.com API client ID | Yes |
| `BOX_CLIENT_SECRET` | Box.com API client secret | Yes |
| `BOX_ENTERPRISE_ID` | Box.com enterprise ID | Yes |
| `ADMIN_USER_IDS` | Comma-separated list of admin user IDs | Yes |
| `NEXTAUTH_URL` | Application URL | Yes |

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Adding New Features

1. Create new components in `src/components/`
2. Add new pages in `src/app/`
3. Update the navbar in `src/components/Navbar.tsx` if needed
4. Update authentication logic in `src/lib/auth.ts` if needed

## Security Notes

- User authentication is based on URL parameters (for demo purposes)
- In production, implement proper Box.com OAuth2 flow
- Store sensitive data securely
- Implement proper session management
- Add input validation and sanitization

## License

This project is for demonstration purposes only.