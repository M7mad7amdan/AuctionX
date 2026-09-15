# AuctionX

AuctionX is a full-stack real-time auction platform where users can list products, create auctions, place bids, track auction activity, save favorites, and complete orders after winning an auction.

The project was built as a full-stack learning project with a focus on backend architecture, database design, authentication, real-time communication, concurrency, and responsive UI development.

---

## Features

### Authentication

- User registration and login
- Password hashing with bcrypt
- JWT authentication
- Google authentication
- Protected routes
- User and admin roles
- Account suspension support

### Auctions

- Create product listings
- Create auctions
- Starting price
- Minimum bid increase
- Auction start and end times
- Live, upcoming, ended, and cancelled auction states
- Automatic auction finalization
- Winner selection
- Seller auction management

### Bidding

- Real-time bidding
- Bid validation
- Current highest bid tracking
- Minimum bid enforcement
- Sellers cannot bid on their own auctions
- Concurrent bid protection using PostgreSQL transactions and row locking
- Bid history
- Personal bidding history

### Products

- Product creation
- Product condition
- Multiple product images
- Supabase Storage integration
- Product categories
- Product search and filtering

### Favorites

- Add auctions to favorites
- Remove auctions from favorites
- View saved auctions
- Duplicate favorites prevented at database level

### Orders

- Winners can create an order after an auction is finalized
- Shipping information
- Winning price stored from the database
- Duplicate orders prevented
- Buyer and seller authorization

### Admin

- Cancel auctions
- Suspend and unsuspend users
- Manage categories
- Moderation support

---

## Tech Stack

### Frontend

- React
- Vite
- JavaScript
- Tailwind CSS
- React Router
- Axios
- Lucide React
- Framer Motion
- Sonner
- Socket.IO Client

### Backend

- Node.js
- Express.js
- PostgreSQL
- Socket.IO
- JWT
- bcrypt
- Zod
- Multer
- Google Auth Library

### Storage

- Supabase Storage

### Testing

- Postman
- k6

---

## Project Structure

```text
AuctionX/
│
├── client/
│   ├── src/
│   ├── public/
│   └── package.json
│
├── server/
│   ├── controllers/
│   ├── middleware/
│   ├── routes/
│   ├── services/
│   ├── validation/
│   ├── db.js
│   ├── socket.js
│   ├── server.js
│   └── package.json
│
├── load-tests/
│   ├── baseline.js
│   ├── bidding.js
│   ├── realistic.js
│   └── mixed-load.js
│
├── .gitignore
└── README.md
```

---

## Database

AuctionX uses PostgreSQL as its relational database.

Main tables include:

- Users
- Products
- ProductImages
- Categories
- Auctions
- Bids
- Favorites
- Orders

Relationships and constraints are used to maintain data integrity between users, products, auctions, bids, and orders.

---

## Concurrent Bidding

One of the main technical challenges in AuctionX is handling multiple users bidding on the same auction at the same time.

Bid creation uses PostgreSQL transactions and row-level locking.

```text
BEGIN

        ↓

Lock Auction Row
SELECT ... FOR UPDATE

        ↓

Validate Auction

        ↓

Read Highest Bid

        ↓

Validate New Bid

        ↓

Insert Bid

        ↓

COMMIT
```

This prevents multiple concurrent requests from incorrectly accepting bids based on the same previous highest price.

Socket.IO events are emitted after the database transaction successfully commits.

---

## Auction Finalization

AuctionX includes an automatic auction finalization process.

When an auction reaches its end time, the backend determines the highest bidder and stores the winner.

The finalization process uses database locking and a `Finalized` state to prevent the same auction from being finalized incorrectly multiple times.

---

## Load Testing

The backend was tested locally using k6.

### Auction Browsing

At 100 virtual users:

```text
Requests:       3000
Failed:         0
Average:        23.81 ms
P95:            122.92 ms
Max:            214.97 ms
Throughput:     ~96.89 requests/sec
```

### Concurrent Bidding

A test with 100 users simultaneously attempting to bid on the same auction completed without server errors.

```text
Virtual Users:  100
P95:            331.92 ms
Max:            371.79 ms
Server Errors:  0
```

Rejected bid requests were expected business-rule responses when another concurrent bid had already raised the minimum acceptable bid.

### Realistic Browsing Test

100 concurrent virtual users browsing auctions, auction details, and bid history:

```text
Requests:       2937
Checks Passed:  2937 / 2937
Failed:         0
Average:        14.31 ms
P95:            22.27 ms
Max:            290.23 ms
```

### Mixed Browsing + Bidding

100 virtual users browsing the platform while some users simultaneously placed bids:

```text
Checks Passed:       3121 / 3121

Browse P95:          22.65 ms
Bid P95:             25.67 ms

Server Errors:       0
```

These results represent local development testing and should not be interpreted as production capacity benchmarks.

---

## Security

The application includes:

- Password hashing with bcrypt
- JWT authentication
- Protected API routes
- Role-based authorization
- Input validation with Zod
- Auction ownership validation
- Bid authorization
- Order authorization
- PostgreSQL parameterized queries
- Database constraints
- Environment variables for secrets
- Server-side Supabase credentials

Sensitive environment variables are excluded from Git using `.gitignore`.

---

## Environment Variables

Environment variables are required to run the application.

Example backend configuration:

```env
DATABASE_URL=
JWT_SECRET=

SUPABASE_URL=
SUPABASE_SECRET_KEY=
SUPABASE_BUCKET=

GOOGLE_CLIENT_ID=
```

Do not commit real credentials or `.env` files to GitHub.

---

## Running Locally

### Clone the repository

```bash
git clone <repository-url>
cd AuctionX
```

### Backend

```bash
cd server
npm install
npm run dev
```

### Frontend

Open another terminal:

```bash
cd client
npm install
npm run dev
```

The Vite development server will display the local frontend URL in the terminal.

---

## API Overview

Some of the main API resources include:

```text
/auth
/auctions
/bids
/products
/product-images
/categories
/favorites
/orders
```

Protected endpoints require a JWT access token.

---

## Real-Time Communication

Socket.IO is used for real-time auction events.

Examples include:

- New bids
- Auction cancellation
- Auction updates

Clients can join auction-specific rooms:

```text
auction:{auctionId}
```

This allows events to be sent only to users currently interested in a specific auction.

---

## Future Improvements

Possible future improvements include:

- Full frontend Socket.IO integration
- Payment integration
- Seller order management
- Notifications
- Messaging between buyers and sellers
- Auction editing workflow
- Improved production scheduling for auction finalization
- Email verification
- Password reset
- Advanced search
- Production monitoring and logging

---

## Purpose

AuctionX was developed as a practical full-stack project to apply concepts including:

- REST API development
- Relational database design
- Authentication and authorization
- Real-time systems
- Transaction management
- Concurrency control
- File storage
- Frontend/backend integration
- Load testing

The project is part of my journey toward becoming a full-stack developer.

---

## Author

**Mohamed Daoud Fuad Hamdan**

Computer Engineering Student  
Junior Full-Stack Developer & UX/UI Designer

GitHub: M7mad7amdan
