# Hey-O! Game

A fun, colorful mobile web app game with user authentication and game features.

## Features

- User authentication (login/register)
- Whitelisted admin account
- Mobile-optimized interface
- Fun, colorful design with cool CSS effects
- Games page for future game implementations

## Admin Account

- Username: JHarvey
- Email: jimheiniger@yahoo.com
- Password: HeyOApp!

## Setup and Installation

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

### Installation

1. Clone this repository
2. Install the dependencies:

```bash
npm run setup
```

### Running the app locally

To run both the server and client simultaneously:

```bash
npm run dev-full
```

Or, you can run them separately:

- Server only: `npm run dev`
- Client only: `npm run client`

The app will be available at `http://localhost:3000` and the API at `http://localhost:5000`.

## Technology Stack

- Frontend: React with TypeScript
- CSS: Tailwind CSS with custom animations
- Backend: Node.js with Express
- Database: SQLite
- Authentication: JWT 