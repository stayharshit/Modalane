# Modalane Modernization Roadmap

This repository is a legacy e-commerce demo built with older Next.js patterns, Redux-based state management, and mock-only API data. The goal of this upgrade is to modernize the app into a full-stack ecommerce experience using current tooling, stronger architecture, better UX, and demo payment integration with Stripe or Razorpay.

## Project goals

- Upgrade the app from a legacy codebase to a modern, maintainable stack
- Use current Next.js and React patterns with TypeScript
- Replace outdated UI patterns with modern component architecture
- Add a real backend layer with persistent data and API routes
- Add demo payment flows for Stripe and Razorpay
- Improve performance, accessibility, and developer experience
- Prepare the codebase for further iteration and production-style work

## Current state

- App built with older React/Next patterns
- Redux + persistence used for basic state handling
- Mock data stored in local data files
- Legacy SCSS structure and older component patterns
- Basic product/cart flow exists, but it feels dated and lacks modern architecture

### Phase 1 decisions

- Redux Toolkit remains the application state layer for now. The cart is already persisted through `redux-persist`, and keeping one state model avoids a risky split during the frontend refresh.
- The next state-layer review will happen after the API and order models exist. Zustand remains an option if the backend work shows that Redux is adding unnecessary complexity.
- The Pages Router remains active during this phase. Route structure has been normalized without mixing Pages Router and App Router conventions in the same migration step.

### Phase 2 progress

- Product listing data is now queryable through `/api/products` with `search`, `category`, and `sort` parameters.
- The products page keeps filter and sort state in the URL, and the header search submits directly into that catalog flow.
- Product detail APIs now return a proper 404 response for unknown IDs.
- Prisma 6.7.0 is configured for PostgreSQL; the schema is applied and the existing local SQLite records have been migrated.
- `db:generate`, `db:push`, and `db:seed` are available through pnpm. The seed creates the catalog and `demo@modalane.test` / `modalane-demo`.
- Registration and login now use the database with hashed passwords. Session cookies and database-backed product reads remain the next backend milestone.

## Target stack

### Frontend

- Next.js 15+
- React 18/19-ready patterns
- TypeScript strict mode
- Tailwind CSS
- shadcn/ui or component library primitives
- App Router architecture
- Zustand or Redux Toolkit for app state
- Framer Motion for motion and polish

### Backend / Data

- Next.js API routes or dedicated Node API service
- Prisma ORM + PostgreSQL for persistent data
- Server-side validation and typed DTOs
- Product, cart, user, order, and payment models
- Seed data and demo admin flows

### Payments

- Stripe Checkout Session flow (recommended primary)
- Razorpay order creation + verification flow (secondary / alternate)
- Demo-only keys with mock success handling
- Order creation after successful payment callback

## Upgrade roadmap

### Phase 1: Foundation and modernization

#### Task 1.1: Audit and baseline setup

- Review current pages, components, store structure, and data flow
- Decide whether to keep Redux or migrate to Zustand/RTK
- Establish a clean baseline with TypeScript and linting rules
- Add environment configuration and .env.example

Acceptance criteria:

- project has a clear architecture map
- TypeScript is actively enforced
- baseline app runs consistently

#### Task 1.2: Upgrade app structure

- Move from legacy page structure to App Router conventions
- Introduce app/ directory with route groups and shared layouts
- Separate server and client components properly
- Create reusable components for buttons, cards, inputs, modal, and navigation

Acceptance criteria:

- routes are organized clearly
- UI logic is broken into reusable components
- app is easier to extend without coupling page logic

#### Task 1.3: Replace outdated styling

- Move from old SCSS architecture to Tailwind + design tokens
- Create a component design system with consistent spacing, colors, and typography
- Refactor the home, products, product detail, cart, checkout, and auth screens

Acceptance criteria:

- app has modern responsive layouts
- UI is visually consistent
- major pages feel current and premium

### Phase 2: Full-stack data and API layer

#### Task 2.1: Add a proper backend model

- Create user, product, category, cart, and order models
- Add Prisma schema and seed script
- Replace static mock-only JSON usage with database-backed data

Acceptance criteria:

- product data is persisted in a database
- seeds can recreate demo data reliably
- APIs serve real data instead of local static files

#### Task 2.2: Build API endpoints

- GET /api/products
- GET /api/products/:id
- POST /api/auth/login
- POST /api/auth/register
- POST /api/cart
- GET /api/orders
- POST /api/orders

Acceptance criteria:

- endpoints return typed JSON
- errors are handled consistently
- validation is present for user input

#### Task 2.3: Auth and session flow

- Add session-based auth or JWT-based auth for demo use
- Add protected routes for checkout and account pages
- Add login/register UX improvements

Acceptance criteria:

- users can register and login in the app
- auth state is consistent across pages
- protected actions are enforced on the backend

### Phase 3: Payment integration demo

#### Task 3.1: Stripe demo integration

- Add Stripe SDK usage in server routes
- Create checkout session with product items and total amount
- Add success and cancel handlers
- Simulate demo payment verification flow

Example endpoints:

- POST /api/payments/stripe/create-checkout-session
- GET /api/payments/stripe/success
- GET /api/payments/stripe/cancel

Acceptance criteria:

- checkout session is created successfully
- success flow moves to an order confirmation state
- environment variables are documented clearly

#### Task 3.2: Razorpay demo integration

- Add Razorpay order creation endpoint
- Attach checkout script on client
- Verify payment signature in backend demo flow
- Store demo order after verification

Example endpoints:

- POST /api/payments/razorpay/create-order
- POST /api/payments/razorpay/verify

Acceptance criteria:

- user can complete a demo payment flow from frontend
- payment verification succeeds with mock demo credentials
- no production secrets are required for local use

#### Task 3.3: Order creation and confirmation

- On successful payment, generate a demo order record
- Show confirmation page with order details and summary
- Store payment metadata for traceability

Acceptance criteria:

- successful pay flow ends with a clear order confirmation
- order details are available in frontend and API responses
- payment state is not ambiguous after success/failure

### Phase 4: Product and UX refresh

#### Task 4.1: Product discovery experience

- Add filters and sorting
- Improve search and category browsing
- Add product cards with images, badges, ratings, and CTAs
- Modernize the product listing and detail pages

#### Task 4.2: Cart and checkout experience

- Replace basic cart flow with better quantity controls, totals, and shipping summary
- Add address form and order summary
- Improve checkout UX for desktop and mobile

#### Task 4.3: Marketing and home pages

- Add modern hero section with CTA blocks
- Add feature highlights, category tiles, trending products, and testimonials
- Improve landing page structure and conversion-oriented layout

### Phase 5: Quality, testing, and deployment

#### Task 5.1: Code quality

- Enforce ESLint, Prettier, and TypeScript strict checking
- Add unit tests for API helpers and business logic
- Add component smoke tests for main flows

#### Task 5.2: Performance and accessibility

- Optimize images and font loading
- Improve semantic markup and focus states
- Reduce layout shifts and JS weight

#### Task 5.3: Deployment prep

- Add environment-based config
- Create a Dockerfile or Vercel-ready setup
- Document deployment steps and demo credentials

## Suggested implementation order for today

This is the working plan we can execute in the next session:

- [ ] 1. Create a modern upgrade branch and document the baseline
- [x] 2. Audit the existing pages and decide exact app structure migration
- [x] 3. Set up TypeScript strict baseline and modern app shell
- [ ] 4. Install Tailwind + shadcn/ui foundation
- [x] 5. Refactor homepage and product listing UI
- [ ] 6. Add Prisma schema and seed product data
- [ ] 7. Implement basic product API routes
- [x] 8. Build a Stripe test payment route
- [ ] 9. Build a dummy Razorpay payment route
- [x] 10. Add order confirmation and checkout flow
- [x] 11. Test end-to-end demo payment flow
- [x] 12. Document setup, env values, and next steps

## Demo payment flow expectations

The product should support a demo checkout flow that behaves like a real ecommerce payment integration without production-level security requirements.

### Stripe demo flow

- backend creates a hosted Stripe Checkout Session from database prices
- checkout reserves stock and creates a pending order
- the server verifies payment on the success return and through a signed webhook
- verified payments mark the order paid; expired/cancelled sessions release stock
- use Stripe test keys only for local development

### Razorpay demo flow

- frontend requests an order from backend
- user completes the Razorpay checkout modal
- backend verifies the signature and records order
- success page displays the order confirmation

## Environment variables

Example environment variables to prepare:

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DATABASE?sslmode=require"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
RAZORPAY_KEY_ID=rzp_test_xxx
RAZORPAY_KEY_SECRET=xyz
```

### Run Stripe locally

Install the [Stripe CLI](https://docs.stripe.com/cli), then run `stripe login` and start a listener with:

```sh
stripe listen --forward-to http://localhost:3000/api/payments/stripe/webhook
```

Copy the listener's `whsec_...` value to `STRIPE_WEBHOOK_SECRET` in `.env.local`, restart Next.js, and test checkout with Stripe's published test card `4242 4242 4242 4242`, a future expiry, and any three-digit CVC. Never use live keys or real card details for local testing.

## Definition of done for the modernization effort

The project is considered upgraded when:

- the UI feels modern and current
- the app uses modern Next.js patterns and TypeScript
- data is backed by a real API layer
- checkout flow is functional through demo payments
- architecture is clean enough to extend with real ecommerce features
- setup instructions and roadmap are clearly documented

## Recommended next step

Start with Phase 1 and 2 together: modernize the app shell and break the current product/cart flow into reusable client/server components, while adding a proper database-backed API structure. Once the base is stable, move into Stripe and Razorpay demo integration.

This is the best path because it gives us a stronger foundation before adding payment complexity.
