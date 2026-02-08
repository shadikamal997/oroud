# Oroud Backend

Production-ready NestJS backend application for Oroud - a platform for managing shops, offers, and local business promotions.

## 🚀 Features

- **Clean Architecture**: Modular structure with separation of concerns
- **TypeScript**: Full type safety and modern JavaScript features
- **PostgreSQL**: Robust relational database
- **Prisma ORM**: Type-safe database access
- **JWT Authentication**: Secure authentication ready to implement
- **Global Validation**: Request validation using class-validator
- **Error Handling**: Comprehensive error handling middleware
- **CORS**: Configurable CORS support
- **Docker**: Local development environment with Docker Compose

## 📦 Modules

- **Auth**: Authentication and authorization
- **Users**: User management
- **Shops**: Shop management and operations
- **Offers**: Promotional offers and deals
- **Cities**: City management
- **Reports**: User reports and moderation
- **Admin**: Administrative operations and dashboard

## 🛠️ Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v15 or higher)
- Docker & Docker Compose (optional, for local development)
- npm or yarn

## 📋 Installation

1. **Clone the repository**
   ```bash
   cd oroud
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your configuration:
   ```env
   NODE_ENV=development
   PORT=3000
   DATABASE_URL="postgresql://oroud:oroud_password@localhost:5433/oroud_db?schema=public"
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   JWT_EXPIRATION=24h
   CORS_ORIGIN=http://localhost:3001
   ```

4. **Start PostgreSQL with Docker**
   ```bash
   docker-compose up -d
   ```

5. **Run Prisma migrations**
   ```bash
   npm run prisma:generate
   npm run prisma:migrate
   ```

6. **Start the application**
   ```bash
   # Development mode
   npm run start:dev

   # Production mode
   npm run build
   npm run start:prod
   ```

## 🗄️ Database

### Prisma Commands

```bash
# Generate Prisma Client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Open Prisma Studio (Database GUI)
npm run prisma:studio
```

### Database Schema

The database includes the following models:

**City**
- Unique name identifier
- One-to-many with Areas and Shops

**Area**
- Belongs to a City
- Optional zone grouping (e.g., "West Amman")
- One-to-many with Shops

**User**
- Phone-based authentication (unique)
- Role: USER, SHOP, ADMIN
- Can own multiple Shops
- Can create Reports

**Shop**
- Belongs to a User (owner)
- Located in City and Area
- Has latitude/longitude coordinates
- Trust score (default 70)
- Premium and verified status flags
- One-to-many with Offers

**Offer**
- Belongs to a Shop
- Price details (original, discounted, percentage)
- Expiry date tracking
- Active status flag
- Report count for moderation

**Report**
- User reports on Offers
- Tracks reason and timestamp
- One-to-many from User and Offer

**AdminLog**
- Audit trail for admin actions
- Tracks entity type and ID

## 🔧 Development

### Available Scripts

```bash
# Start development server
npm run start:dev

# Build for production
npm run build

# Run tests
npm run test

# Run e2e tests
npm run test:e2e

# Lint code
npm run lint

# Format code
npm run format
```

### Project Structure

```
src/
├── modules/          # Feature modules
│   ├── auth/        # Authentication
│   ├── users/       # User management
│   ├── shops/       # Shop operations
│   ├── offers/      # Offer management
│   ├── cities/      # City data
│   ├── reports/     # Report system
│   └── admin/       # Admin panel
├── common/          # Shared utilities
│   ├── filters/     # Exception filters
│   └── interceptors/# Response interceptors
├── config/          # Configuration files
├── prisma/          # Prisma service
├── app.module.ts    # Root module
└── main.ts          # Application entry point

prisma/
├── schema.prisma    # Database schema
└── migrations/      # Database migrations
```

## 🐳 Docker

Start the PostgreSQL database:

```bash
# Start database
docker-compose up -d

# Stop database
docker-compose down

# View logs
docker-compose logs -f
```

## 🔐 Authentication

JWT authentication is prepared but not fully implemented. To complete:

1. Implement password hashing in auth service
2. Add login/register DTOs with validation
3. Create role-based guards (Admin, ShopOwner)
4. Add refresh token mechanism

## 📝 API Endpoints

### Health Check
- `GET /api` - Welcome message
- `GET /api/health` - Health check

### Auth
- `POST /api/auth/login` - Login with phone (auto-creates user)
- `GET /api/auth/profile` - Get user profile (protected)
- `POST /api/auth/verify` - Verify JWT token (protected)

### Users
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Shops
- `GET /api/shops` - Get all shops
- `GET /api/shops/:id` - Get shop by ID
- `POST /api/shops` - Create shop
- `PUT /api/shops/:id` - Update shop
- `DELETE /api/shops/:id` - Delete shop
- `GET /api/shops/:id/offers` - Get shop offers

### Offers
- `GET /api/offers` - Get all offers
- `GET /api/offers/:id` - Get offer by ID
- `POST /api/offers` - Create offer
- `PUT /api/offers/:id` - Update offer
- `DELETE /api/offers/:id` - Delete offer
- `GET /api/offers/active/current` - Get active offers

### Cities
- `GET /api/cities` - Get all cities
- `GET /api/cities/:id` - Get city by ID
- `POST /api/cities` - Create city
- `PUT /api/cities/:id` - Update city
- `DELETE /api/cities/:id` - Delete city
- `GET /api/cities/:id/shops` - Get city shops

### Reports
- `GET /api/reports` - Get all reports
- `GET /api/reports/:id` - Get report by ID
- `POST /api/reports` - Create report
- `PUT /api/reports/:id/status` - Update report status
- `GET /api/reports/shop/:shopId` - Get shop reports

### Admin
- `GET /api/admin/dashboard` - Dashboard statistics
- `GET /api/admin/users` - Get all users
- `PUT /api/admin/users/:id/status` - Update user status
- `GET /api/admin/shops/pending` - Get pending shops
- `PUT /api/admin/shops/:id/verify` - Verify shop
- `GET /api/admin/offers/pending` - Get pending offers
- `PUT /api/admin/offers/:id/approve` - Approve offer
- `PUT /api/admin/offers/:id/reject` - Reject offer
- `GET /api/admin/reports` - Get all reports

## 🔐 Authentication

### JWT Authentication Flow

The backend uses JWT-based authentication with phone numbers:

1. **Login with Phone**: User sends phone number to `/api/auth/login`
2. **Auto-Registration**: If phone doesn't exist, user is automatically created with `USER` role
3. **JWT Token**: Server returns JWT token valid for 7 days
4. **Protected Routes**: Include token in `Authorization: Bearer <token>` header

### User Roles

```typescript
enum UserRole {
  USER   // Regular users
  SHOP   // Shop owners (can create shops and offers)
  ADMIN  // Administrators (full access)
}
```

### Authentication Endpoints

```bash
# Login (auto-creates user if not exists)
POST /api/auth/login
Body: { "phone": "+962791234567" }
Response: { "access_token": "...", "user": {...} }

# Get Profile (protected)
GET /api/auth/profile
Headers: Authorization: Bearer <token>

# Verify Token (protected)
POST /api/auth/verify
Headers: Authorization: Bearer <token>
```

### Role-Based Access Control

Protected routes use `@Roles()` decorator:

- **SHOP Role**: Can create/update shops and offers
- **ADMIN Role**: Full access to admin panel
- **USER Role**: Basic access only

Example protected routes:
```typescript
// Only SHOP or ADMIN can create offers
@Post('/offers')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SHOP, UserRole.ADMIN)
async createOffer() { ... }

// Only ADMIN can access admin panel
@Get('/admin/dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
async getDashboard() { ... }
```

### Testing Authentication

```bash
# 1. Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"phone": "+962791234567"}'

# 2. Use the returned token
TOKEN="your-jwt-token-here"

# 3. Access protected endpoint
curl -X GET http://localhost:3000/api/auth/profile \
  -H "Authorization: Bearer $TOKEN"

# 4. Try creating offer with USER role (will fail)
curl -X POST http://localhost:3000/api/offers \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{}'
# Response: 403 Forbidden - "Access denied. Required roles: SHOP, ADMIN"
```

## 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## 📚 Next Steps

1. Implement authentication logic (password hashing, login, register)
2. Create DTOs with class-validator decorators
3. Add role-based authorization guards
4. Implement pagination for list endpoints
5. Add search and filtering capabilities
6. Implement file uploads for shop and offer images
7. Add email notifications
8. Set up logging (Winston/Pino)
9. Add API documentation (Swagger/OpenAPI)
10. Set up CI/CD pipeline

## 🤝 Contributing

This is a private project. For contributions, please follow the team's coding standards and pull request process.

## 📄 License

UNLICENSED - Private and proprietary

## 👨‍💻 Development Team

For questions or support, contact the development team.

---

Built with ❤️ using NestJS
