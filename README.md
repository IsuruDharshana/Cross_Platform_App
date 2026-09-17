# EventHub

EventHub is a cross-platform event discovery, booking, and management application built with React Native, Expo, TypeScript, Express, Prisma, and SQLite.

The application provides separate interfaces and facilities for normal users and event organizers.

## Features

### User

- Register and log in
- Browse upcoming events
- Search events by name, location, or description
- Filter events by category
- View event details and ticket availability
- Select ticket quantities
- Book events
- View booking details
- Cancel confirmed bookings
- Edit profile information
- Log out

### Organizer

- Access the Organizer Center dashboard
- View event and booking statistics
- Create events
- View owned events
- Edit owned events
- Delete owned events
- View bookings and attendees for each event
- Edit organizer profile
- Log out

## Technology Stack

### Frontend

- React Native
- Expo
- TypeScript
- Expo Router
- AsyncStorage

### Backend

- Node.js
- Express
- TypeScript
- Prisma ORM
- SQLite
- JSON Web Tokens
- bcrypt
- Zod

## Project Structure

```text
Cross_Platform_App/
├── EventHub/                 # Expo frontend
│   ├── assets/
│   ├── src/
│   │   ├── app/              # Screens and Expo Router layouts
│   │   ├── components/       # Reusable UI components
│   │   ├── constants/        # Theme and colors
│   │   ├── context/          # Authentication context
│   │   ├── lib/              # API helpers
│   │   └── types.ts
│   ├── app.json
│   └── package.json
│
└── server/                   # Express backend
    ├── prisma/
    │   └── schema.prisma
    ├── src/
    │   ├── lib/
    │   ├── middleware/
    │   └── index.ts
    ├── .env.example
    └── package.json
```

## Prerequisites

Install the following software:

- [Node.js](https://nodejs.org/)
- npm
- [Expo Go](https://expo.dev/go) for physical-device testing
- Android Studio for Android emulator testing

## Installation

Clone the repository:

```bash
git clone https://github.com/hashminethmindi/Cross_Platform_App.git
cd Cross_Platform_App
```

## Backend Setup

Open the backend directory:

```bash
cd server
```

Install dependencies:

```bash
npm install
```

Create the environment file.

Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

macOS or Linux:

```bash
cp .env.example .env
```

The `.env` file should contain:

```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="replace-with-a-long-random-secret"
PORT=3001
```

Create the SQLite database and generate the Prisma client:

```bash
npm run db:push
npm run prisma:generate
```

Start the backend:

```bash
npm run dev
```

The API will run at:

```text
http://localhost:3001/api
```

## Frontend Setup

Open another terminal from the repository root:

```bash
cd EventHub
```

Install dependencies:

```bash
npm install
```

Start Expo:

```bash
npm start
```

Start the web version:

```bash
npm run web
```

Start the Android version:

```bash
npm run android
```

## API Configuration

The frontend uses the following API addresses by default:

| Platform | API URL |
|---|---|
| Web | `http://localhost:3001/api` |
| Android Emulator | `http://10.0.2.2:3001/api` |
| Physical Device | `http://YOUR_COMPUTER_IP:3001/api` |

### Running on a Physical Device

A physical phone cannot access the backend through `localhost`.

Connect the phone and computer to the same network. Find the computer's local IPv4 address and set it before starting Expo.

Example using PowerShell:

```powershell
$env:EXPO_PUBLIC_API_URL="http://192.168.1.10:3001/api"
npm start
```

Replace `192.168.1.10` with the computer's actual IPv4 address.

## Demo Accounts

The server automatically creates demo accounts and sample events when the database is empty.

### User Account

```text
Email: user@eventhub.com
Password: User12345
```

### Organizer Account

```text
Email: organizer@eventhub.com
Password: Organizer123
```

## Role-Based Navigation

### User Navigation

- Home
- Explore
- Bookings
- Profile

### Organizer Navigation

- Dashboard
- My Events
- Create Event
- Profile

Users are redirected away from organizer routes. Organizers are redirected away from customer discovery and booking routes.

## API Endpoints

### Authentication

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Create an account |
| POST | `/api/auth/login` | Log in |
| GET | `/api/auth/me` | Get the authenticated session |

### Profile

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/users/me` | Get the current profile |
| PUT | `/api/users/me` | Update the current profile |

### Events

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/events` | Get all events |
| GET | `/api/events/:id` | Get one event |
| POST | `/api/events` | Create an event |
| PUT | `/api/events/:id` | Update an event |
| DELETE | `/api/events/:id` | Delete an event |

### Bookings

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/bookings` | Create a booking |
| GET | `/api/bookings/my` | Get the current user's bookings |
| PATCH | `/api/bookings/:id/cancel` | Cancel a booking |

### Organizer

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/organizer/events` | Get the organizer's events |
| GET | `/api/organizer/events/:id/bookings` | Get bookings for an owned event |

## Available Scripts

### Frontend

| Command | Description |
|---|---|
| `npm start` | Start Expo |
| `npm run web` | Run the web application |
| `npm run android` | Run on Android |
| `npm run ios` | Run on iOS |
| `npm run lint` | Run ESLint |

### Backend

| Command | Description |
|---|---|
| `npm run dev` | Start the development server |
| `npm run build` | Compile TypeScript |
| `npm start` | Start the compiled server |
| `npm run db:push` | Apply the Prisma schema |
| `npm run prisma:generate` | Generate the Prisma client |

## Validation

Run TypeScript and ESLint checks for the frontend:

```bash
cd EventHub
npx tsc --noEmit
npm run lint
```

Build the backend:

```bash
cd server
npm run build
```

## Authentication

EventHub uses JWT authentication.

After a successful login or registration:

1. The backend returns a JWT and user information.
2. The frontend stores the session using AsyncStorage.
3. Authenticated API requests include the JWT.
4. Frontend and backend role checks protect restricted facilities.

## Database

The application uses SQLite through Prisma ORM.

The database contains three primary models:

- `User`
- `Event`
- `Booking`

Local database files are excluded from Git. Run `npm run db:push` after cloning the repository to create the database.

## Notes

- Start the backend before using the frontend.
- Do not commit `.env` files or SQLite database files.
- Event images are loaded from remote image URLs.
- Firebase helper code is optional; the active authentication system uses the Express API and JWT sessions.

## License

This project was developed for educational purposes.