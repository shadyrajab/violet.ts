# Database Migrations

## Setup PostgreSQL

### Using Docker

```bash
docker run --name violet-postgres \
  -e POSTGRES_PASSWORD=yourpassword \
  -e POSTGRES_DB=violet \
  -p 5432:5432 \
  -d postgres:16
```

### Apply Migrations

```bash
psql -h localhost -U postgres -d violet -f migrations/001_initial_schema.sql
```

## Environment Variables

Create a `.env` file in the project root:

```env
TOKEN=your_discord_bot_token
CLIENT_ID=your_discord_client_id

DB_HOST=localhost
DB_PORT=5432
DB_NAME=violet
DB_USER=postgres
DB_PASSWORD=yourpassword

NODE_ENV=development
LOG_LEVEL=info
```

## Database Schema

### Users
- Stores user language preferences

### Servers
- Stores server (guild) configurations
- Tracks temporary channel setup (category and entry channel)

### Voice Rooms
- Stores active temporary voice channels
- Tracks ownership and admin permissions

### Presets
- Stores user-defined channel presets per server
- Includes default name, privacy settings, and member lists

### Subscriptions
- Stores user subscription information (future feature)
- Supports Stripe integration

### User Server Subscriptions
- Links users to servers through subscriptions
- Enables multi-server management per subscription
