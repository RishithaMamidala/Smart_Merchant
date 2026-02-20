# Tasks: Smart Merchant Command Center - E-Commerce Platform

**Input**: Design documents from `/specs/001-ecommerce-platform/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Not explicitly requested - test tasks omitted. Add test tasks if TDD approach desired.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Backend**: `backend/src/`
- **Frontend**: `frontend/src/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Create project structure with `backend/` and `frontend/` directories per implementation plan
- [x] T002 Initialize backend Node.js project with Express.js, Mongoose, and dependencies in `backend/package.json`
- [x] T003 [P] Initialize frontend Vite + React project with dependencies in `frontend/package.json`
- [x] T004 [P] Configure ESLint and Prettier for backend in `backend/.eslintrc.js` and `backend/.prettierrc`
- [x] T005 [P] Configure ESLint and Prettier for frontend in `frontend/.eslintrc.js` and `frontend/.prettierrc`
- [x] T006 [P] Create backend JSDoc configuration in `backend/jsconfig.json`
- [x] T007 [P] Create frontend JSDoc configuration in `frontend/jsconfig.json`
- [x] T008 [P] Create backend environment template in `backend/.env.example`
- [x] T009 [P] Create frontend environment template in `frontend/.env.example`
- [x] T010 Configure Tailwind CSS in `frontend/tailwind.config.js` and `frontend/src/index.css`
- [x] T011 Setup Vite configuration in `frontend/vite.config.js`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**CRITICAL**: No user story work can begin until this phase is complete

### Database & Configuration

- [x] T012 Create MongoDB connection configuration in `backend/src/config/database.js`
- [x] T013 Create environment configuration loader in `backend/src/config/env.js`
- [x] T014 [P] Create Stripe configuration in `backend/src/config/stripe.js`
- [x] T015 [P] Create SendGrid configuration in `backend/src/config/sendgrid.js`
- [x] T016 [P] Create Cloudinary configuration in `backend/src/config/cloudinary.js`

### Core Mongoose Models

- [x] T017 Create Merchant model with schema and indexes in `backend/src/models/Merchant.js`
- [x] T018 [P] Create Customer model with embedded Address schema in `backend/src/models/Customer.js`
- [x] T019 [P] Create Category model in `backend/src/models/Category.js`
- [x] T020 Create Product model with embedded ProductImage and OptionType schemas in `backend/src/models/Product.js`
- [x] T021 Create Variant model with embedded OptionValue schema in `backend/src/models/Variant.js`
- [x] T022 [P] Create Cart model with embedded CartItem schema in `backend/src/models/Cart.js`
- [x] T023 Create Order model with embedded OrderItem and Address schemas in `backend/src/models/Order.js`
- [x] T024 [P] Create Notification model in `backend/src/models/Notification.js`
- [x] T025 Create model index file exporting all models in `backend/src/models/index.js`

### Authentication Infrastructure

- [x] T026 Implement password hashing utility with bcrypt in `backend/src/utils/password.js`
- [x] T027 Implement JWT token generation and verification in `backend/src/utils/jwt.js`
- [x] T028 Create authentication middleware in `backend/src/middleware/auth.js`
- [x] T029 Create merchant authentication routes (register, login, refresh, logout, me) in `backend/src/routes/auth.merchant.js`
- [x] T030 Create customer authentication routes (register, login, refresh, logout, me) in `backend/src/routes/auth.customer.js`
- [x] T031 Create auth controller with business logic in `backend/src/controllers/authController.js`

### Base Middleware & Utilities

- [x] T032 Create error handling middleware in `backend/src/middleware/errorHandler.js`
- [x] T033 [P] Create request validation middleware using express-validator in `backend/src/middleware/validate.js`
- [x] T034 [P] Create rate limiting middleware in `backend/src/middleware/rateLimit.js`
- [x] T035 [P] Create CORS configuration middleware in `backend/src/middleware/cors.js`
- [x] T036 [P] Create logging utility in `backend/src/utils/logger.js`
- [x] T037 [P] Create response helpers in `backend/src/utils/response.js`
- [x] T038 [P] Create pagination utility in `backend/src/utils/pagination.js`

### Express App Setup

- [x] T039 Create Express app with middleware stack in `backend/src/app.js`
- [x] T040 Create server entry point in `backend/src/index.js`
- [x] T041 Create route index aggregating all routes in `backend/src/routes/index.js`

### Frontend Foundation

- [x] T042 Setup Redux store with redux-persist in `frontend/src/store/index.js`
- [x] T043 [P] Create auth slice for Redux in `frontend/src/store/slices/authSlice.js`
- [x] T044 [P] Create cart slice for Redux in `frontend/src/store/slices/cartSlice.js`
- [x] T045 Setup TanStack Query provider in `frontend/src/providers/QueryProvider.jsx`
- [x] T046 Create API client with axios in `frontend/src/services/api.js`
- [x] T047 Create auth service functions in `frontend/src/services/authService.js`
- [x] T048 Setup React Router with route configuration in `frontend/src/App.jsx`
- [x] T049 Create protected route component in `frontend/src/components/layout/ProtectedRoute.jsx`
- [x] T050 [P] Create Header component in `frontend/src/components/layout/Header.jsx`
- [x] T051 [P] Create Footer component in `frontend/src/components/layout/Footer.jsx`
- [x] T052 Create main entry point in `frontend/src/main.jsx`

### Base UI Components

- [x] T053 [P] Create Button component in `frontend/src/components/ui/Button.jsx`
- [x] T054 [P] Create Input component in `frontend/src/components/ui/Input.jsx`
- [x] T055 [P] Create Card component in `frontend/src/components/ui/Card.jsx`
- [x] T056 [P] Create Modal component in `frontend/src/components/ui/Modal.jsx`
- [x] T057 [P] Create Loading spinner component in `frontend/src/components/ui/Loading.jsx`
- [x] T058 [P] Create Alert/Toast component in `frontend/src/components/ui/Alert.jsx`
- [x] T059 [P] Create Select/Dropdown component in `frontend/src/components/ui/Select.jsx`

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Customer Browses and Purchases Products (Priority: P1) MVP

**Goal**: Enable customers to browse products, add to cart, and complete checkout with automatic inventory management

**Independent Test**: Create a product with known inventory, complete a purchase as customer, verify inventory decreased

### Backend Implementation for US1

- [x] T060 [P] [US1] Create storefront products routes (list, get by slug) in `backend/src/routes/products.storefront.js`
- [x] T061 [P] [US1] Create categories routes (list active) in `backend/src/routes/categories.js`
- [x] T062 [US1] Create product service for storefront queries in `backend/src/services/productService.js`
- [x] T063 [US1] Create storefront products controller in `backend/src/controllers/storefrontController.js`
- [x] T064 [P] [US1] Create cart routes (get, add, update, remove, clear, validate) in `backend/src/routes/cart.js`
- [x] T065 [US1] Create cart service with inventory validation in `backend/src/services/cartService.js`
- [x] T066 [US1] Create cart controller in `backend/src/controllers/cartController.js`
- [x] T067 [P] [US1] Create checkout routes (start, cancel) in `backend/src/routes/checkout.js`
- [x] T068 [US1] Create Stripe payment service in `backend/src/services/stripeService.js`
- [x] T069 [US1] Create checkout service with inventory reservation in `backend/src/services/checkoutService.js`
- [x] T070 [US1] Create checkout controller in `backend/src/controllers/checkoutController.js`
- [x] T071 [US1] Create Stripe webhook handler in `backend/src/routes/webhooks.stripe.js`
- [x] T072 [US1] Create order service for order creation and inventory deduction in `backend/src/services/orderService.js`
- [x] T073 [US1] Create order number generator utility in `backend/src/utils/orderNumber.js`
- [x] T074 [P] [US1] Create customer order routes (get by order number) in `backend/src/routes/orders.customer.js`

### Frontend Implementation for US1

- [x] T075 [P] [US1] Create products service functions in `frontend/src/services/productService.js`
- [x] T076 [P] [US1] Create cart service functions in `frontend/src/services/cartService.js`
- [x] T077 [P] [US1] Create checkout service functions in `frontend/src/services/checkoutService.js`
- [x] T078 [US1] Create useProducts hook with TanStack Query in `frontend/src/hooks/useProducts.js`
- [x] T079 [P] [US1] Create useCart hook in `frontend/src/hooks/useCart.js`
- [x] T080 [US1] Create ProductCard component in `frontend/src/components/product/ProductCard.jsx`
- [x] T081 [P] [US1] Create ProductGrid component in `frontend/src/components/product/ProductGrid.jsx`
- [x] T082 [US1] Create VariantSelector component in `frontend/src/components/product/VariantSelector.jsx`
- [x] T083 [US1] Create AddToCartButton component in `frontend/src/components/product/AddToCartButton.jsx`
- [x] T084 [US1] Create CartDrawer/CartSidebar component in `frontend/src/components/cart/CartDrawer.jsx`
- [x] T085 [P] [US1] Create CartItem component in `frontend/src/components/cart/CartItem.jsx`
- [x] T086 [US1] Create CartSummary component in `frontend/src/components/cart/CartSummary.jsx`
- [x] T087 [US1] Create HomePage with product listing in `frontend/src/pages/HomePage.jsx`
- [x] T088 [US1] Create ProductDetailPage in `frontend/src/pages/ProductDetailPage.jsx`
- [x] T089 [US1] Create CategoryPage in `frontend/src/pages/CategoryPage.jsx`
- [x] T090 [US1] Create CheckoutPage with Stripe Elements in `frontend/src/pages/CheckoutPage.jsx`
- [x] T091 [US1] Create ShippingAddressForm component in `frontend/src/components/checkout/ShippingAddressForm.jsx`
- [x] T092 [US1] Create PaymentForm component with Stripe in `frontend/src/components/checkout/PaymentForm.jsx`
- [x] T093 [US1] Create OrderConfirmationPage in `frontend/src/pages/OrderConfirmationPage.jsx`

**Checkpoint**: User Story 1 complete - customers can browse and purchase products with automatic inventory updates

---

## Phase 4: User Story 2 - Merchant Manages Products (Priority: P2)

**Goal**: Enable merchants to manage their product catalog (CRUD operations, variants, categories)

**Independent Test**: Log in as merchant, create product with variants, verify it appears on storefront

### Backend Implementation for US2

- [x] T094 [P] [US2] Create merchant products routes (list, get, create, update, archive, restore) in `backend/src/routes/products.merchant.js`
- [x] T095 [P] [US2] Create merchant categories routes (CRUD) in `backend/src/routes/categories.merchant.js`
- [x] T096 [P] [US2] Create merchant variant routes (update, inventory adjust) in `backend/src/routes/variants.merchant.js`
- [x] T097 [US2] Extend product service with merchant CRUD operations in `backend/src/services/productService.js`
- [x] T098 [US2] Create category service in `backend/src/services/categoryService.js`
- [x] T099 [US2] Create variant service in `backend/src/services/variantService.js`
- [x] T100 [US2] Create merchant products controller in `backend/src/controllers/merchantProductController.js`
- [x] T101 [P] [US2] Create merchant categories controller in `backend/src/controllers/merchantCategoryController.js`
- [x] T102 [US2] Create Cloudinary upload service in `backend/src/services/cloudinaryService.js`
- [x] T103 [P] [US2] Create image upload routes in `backend/src/routes/upload.js`
- [x] T104 [US2] Create slug generation utility in `backend/src/utils/slug.js`

### Frontend Implementation for US2

- [x] T105 [P] [US2] Create merchant products service in `frontend/src/services/merchantProductService.js`
- [x] T106 [P] [US2] Create merchant categories service in `frontend/src/services/merchantCategoryService.js`
- [x] T107 [US2] Create useMerchantProducts hook in `frontend/src/hooks/useMerchantProducts.js`
- [x] T108 [P] [US2] Create useMerchantCategories hook in `frontend/src/hooks/useMerchantCategories.js`
- [x] T109 [US2] Create DashboardLayout component in `frontend/src/components/layout/DashboardLayout.jsx`
- [x] T110 [P] [US2] Create DashboardSidebar component in `frontend/src/components/layout/DashboardSidebar.jsx`
- [x] T111 [US2] Create ProductsListPage for merchant in `frontend/src/pages/dashboard/ProductsListPage.jsx`
- [x] T112 [US2] Create ProductFormPage (create/edit) in `frontend/src/pages/dashboard/ProductFormPage.jsx`
- [x] T113 [US2] Create ProductForm component (integrated in ProductFormPage)
- [x] T114 [US2] Create VariantMatrixEditor component (integrated in ProductFormPage)
- [x] T115 [US2] Create ImageUploader component (integrated in ProductFormPage)
- [x] T116 [P] [US2] Create CategorySelect component (integrated in ProductFormPage)
- [x] T117 [US2] Create CategoriesPage for merchant in `frontend/src/pages/dashboard/CategoriesPage.jsx`
- [x] T118 [US2] Create CategoryForm component (integrated in CategoriesPage modal)
- [x] T119 [US2] Create InventoryQuickEdit component (integrated in ProductFormPage)

**Checkpoint**: User Story 2 complete - merchants can manage their full product catalog

---

## Phase 5: User Story 3 - Merchant Views Analytics Dashboard (Priority: P3)

**Goal**: Provide merchants with business performance insights via analytics dashboard

**Independent Test**: Generate orders, view dashboard, verify metrics reflect orders accurately

### Backend Implementation for US3

- [x] T120 [P] [US3] Create analytics routes (dashboard, sales, top-products, category-breakdown, inventory, orders, revenue) in `backend/src/routes/analytics.js`
- [x] T121 [US3] Create analytics service with aggregation queries in `backend/src/services/analyticsService.js`
- [x] T122 [US3] Create analytics controller in `backend/src/controllers/analyticsController.js`
- [x] T123 [US3] Create date range utility for analytics in `backend/src/utils/dateRange.js`

### Frontend Implementation for US3

- [x] T124 [P] [US3] Create analytics service functions in `frontend/src/services/analyticsService.js`
- [x] T125 [US3] Create useAnalytics hook in `frontend/src/hooks/useAnalytics.js`
- [x] T126 [US3] Create DashboardHomePage in `frontend/src/pages/dashboard/DashboardHomePage.jsx`
- [x] T127 [US3] Create MetricCard component (integrated in AnalyticsPage)
- [x] T128 [P] [US3] Create SalesChart component (integrated in AnalyticsPage)
- [x] T129 [P] [US3] Create TopProductsList component (integrated in AnalyticsPage)
- [x] T130 [P] [US3] Create InventoryStatusWidget component (integrated in AnalyticsPage)
- [x] T131 [US3] Create AnalyticsPage with date range selector in `frontend/src/pages/dashboard/AnalyticsPage.jsx`
- [x] T132 [P] [US3] Create DateRangePicker component (using Select for period selection)
- [x] T133 [P] [US3] Create CategoryBreakdownChart component (integrated in AnalyticsPage)
- [x] T134 [US3] Create LowStockAlerts component (integrated in AnalyticsPage)

**Checkpoint**: User Story 3 complete - merchants can view comprehensive analytics

---

## Phase 6: User Story 4 - Merchant Manages Orders (Priority: P4)

**Goal**: Enable merchants to view, update, and manage order fulfillment

**Independent Test**: Place order as customer, log in as merchant, update order status through lifecycle

### Backend Implementation for US4

- [x] T135 [P] [US4] Create merchant orders routes (list, get, update status, ship, deliver, cancel, notes) in `backend/src/routes/orders.merchant.js`
- [x] T136 [US4] Extend order service with merchant operations and inventory restoration in `backend/src/services/orderService.js`
- [x] T137 [US4] Create merchant orders controller in `backend/src/controllers/merchantOrderController.js`
- [x] T138 [US4] Create order status transition validator in `backend/src/utils/orderStatus.js`

### Frontend Implementation for US4

- [x] T139 [P] [US4] Create merchant orders service in `frontend/src/services/merchantOrderService.js`
- [x] T140 [US4] Create useMerchantOrders hook in `frontend/src/hooks/useMerchantOrders.js`
- [x] T141 [US4] Create OrdersListPage for merchant in `frontend/src/pages/dashboard/OrdersListPage.jsx`
- [x] T142 [US4] Create OrderDetailPage for merchant in `frontend/src/pages/dashboard/OrderDetailPage.jsx`
- [x] T143 [US4] Create OrderStatusBadge component (integrated in OrdersListPage and OrderDetailPage)
- [x] T144 [P] [US4] Create OrderStatusSelect component (integrated in OrderDetailPage)
- [x] T145 [US4] Create ShippingInfoForm component (integrated in OrderDetailPage as ShipOrderModal)
- [x] T146 [P] [US4] Create OrderItemsList component (integrated in OrderDetailPage)
- [x] T147 [US4] Create OrderFilters component (integrated in OrdersListPage)
- [x] T148 [US4] Create OrderNotesEditor component (integrated in OrderDetailPage)

**Checkpoint**: User Story 4 complete - merchants can manage full order lifecycle

---

## Phase 7: User Story 5 - Smart Notifications Alert Stakeholders (Priority: P5)

**Goal**: Send automated notifications (order confirmation, shipping updates, low stock alerts, daily summaries)

**Independent Test**: Place order - verify confirmation email; update to shipped - verify shipping email; reduce inventory below threshold - verify alert

### Backend Implementation for US5

- [x] T149 [P] [US5] Create notification routes (merchant list, preferences, retry) in `backend/src/routes/notifications.js`
- [x] T150 [US5] Create email service with SendGrid in `backend/src/services/emailService.js`
- [x] T151 [US5] Create notification service in `backend/src/services/notificationService.js`
- [x] T152 [US5] Create notification controller in `backend/src/controllers/notificationController.js`
- [x] T153 [US5] Create email templates builder in `backend/src/services/emailTemplates.js`
- [x] T154 [US5] Integrate order confirmation notification in order service `backend/src/services/orderService.js`
- [x] T155 [US5] Integrate shipping notification on order ship in `backend/src/services/orderService.js`
- [x] T156 [US5] Create low stock alert checker in `backend/src/services/inventoryAlertService.js`
- [x] T157 [US5] Create cron routes (daily-summary, retry-failed, cleanup-carts) in `backend/src/routes/cron.js`
- [x] T158 [US5] Create cron authentication middleware in `backend/src/middleware/cronAuth.js`
- [x] T159 [US5] Create daily summary generator service in `backend/src/services/dailySummaryService.js`
- [x] T160 [US5] Create notification retry service in `backend/src/services/notificationRetryService.js`

### Frontend Implementation for US5

- [x] T161 [P] [US5] Create notifications service in `frontend/src/services/notificationService.js`
- [x] T162 [US5] Create useNotifications hook in `frontend/src/hooks/useNotifications.js`
- [x] T163 [US5] Create NotificationsPage for merchant in `frontend/src/pages/dashboard/NotificationsPage.jsx`
- [x] T164 [US5] Create NotificationPreferencesForm (integrated in NotificationsPage)
- [x] T165 [P] [US5] Create NotificationList component (integrated in NotificationsPage)
- [x] T166 [US5] Create NotificationItem component (integrated in NotificationsPage)

**Checkpoint**: User Story 5 complete - automated notifications working for all events

---

## Phase 8: User Story 6 - Customer Manages Their Account (Priority: P6)

**Goal**: Allow customers to create accounts, view order history, and manage profile

**Independent Test**: Create customer account, place orders, view order history and update profile

### Backend Implementation for US6

- [x] T167 [P] [US6] Create customer profile routes (get, update) in `backend/src/routes/customer.profile.js`
- [x] T168 [P] [US6] Create customer orders routes (list history) in `backend/src/routes/customer.profile.js` (combined)
- [x] T169 [US6] Create customer service in `backend/src/services/customerService.js`
- [x] T170 [US6] Create customer controller in `backend/src/controllers/customerController.js`
- [x] T171 [US6] Implement cart merge on customer login in `backend/src/controllers/authController.js`

### Frontend Implementation for US6

- [x] T172 [P] [US6] Create customer service functions in `frontend/src/services/customerService.js`
- [x] T173 [US6] Create useCustomer hook in `frontend/src/hooks/useCustomer.js`
- [x] T174 [US6] Create LoginPage in `frontend/src/pages/storefront/LoginPage.jsx`
- [x] T175 [P] [US6] Create RegisterPage in `frontend/src/pages/storefront/RegisterPage.jsx`
- [x] T176 [US6] Create AccountPage in `frontend/src/pages/storefront/AccountPage.jsx`
- [x] T177 [US6] Create OrderHistoryPage in `frontend/src/pages/storefront/OrderHistoryPage.jsx`
- [x] T178 [US6] Create ProfileForm component (integrated in AccountPage)
- [x] T179 [P] [US6] Create AddressManager component (integrated in AccountPage)
- [x] T180 [US6] Create CustomerOrderCard component (integrated in OrderHistoryPage)

**Checkpoint**: User Story 6 complete - customers can manage accounts and view order history

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T181 [P] Create database seed script with sample data in `backend/src/scripts/seed.js`
- [ ] T182 [P] Add npm scripts for seed command in `backend/package.json`
- [ ] T183 Create root package.json with concurrent dev script for both projects
- [ ] T184 [P] Implement cart expiration cleanup in cron job
- [ ] T185 [P] Add loading states to all pages and components
- [ ] T186 [P] Add error boundaries to React app in `frontend/src/components/ErrorBoundary.jsx`
- [ ] T187 [P] Add 404 page in `frontend/src/pages/NotFoundPage.jsx`
- [ ] T188 Perform security review (input validation, auth, CORS)
- [ ] T189 [P] Add mobile responsive styles to all components
- [ ] T190 Run quickstart.md validation - test full developer setup flow

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-8)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 -> P2 -> P3 -> P4 -> P5 -> P6)
- **Polish (Phase 9)**: Depends on at least US1 being complete for meaningful polish

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Independent of US1
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - Benefits from US1 order data
- **User Story 4 (P4)**: Can start after Foundational (Phase 2) - Benefits from US1 order data
- **User Story 5 (P5)**: Can start after Foundational (Phase 2) - Integrates with US1, US2, US4
- **User Story 6 (P6)**: Can start after Foundational (Phase 2) - Independent of other stories

### Within Each User Story

- Backend implementation before frontend (API must exist)
- Models before services
- Services before controllers
- Controllers before routes
- Routes registration in index
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Once Foundational phase completes, all user stories can start in parallel (if team capacity allows)
- Within each story, tasks marked [P] can run in parallel
- Different user stories can be worked on in parallel by different team members

---

## Parallel Example: Phase 2 Foundational

```bash
# Launch all configuration files together:
Task: "Create Stripe configuration in backend/src/config/stripe.js"
Task: "Create SendGrid configuration in backend/src/config/sendgrid.js"
Task: "Create Cloudinary configuration in backend/src/config/cloudinary.js"

# Launch all models together (after config):
Task: "Create Customer model in backend/src/models/Customer.js"
Task: "Create Category model in backend/src/models/Category.js"
Task: "Create Cart model in backend/src/models/Cart.js"
Task: "Create Notification model in backend/src/models/Notification.js"

# Launch all base UI components together:
Task: "Create Button component in frontend/src/components/ui/Button.jsx"
Task: "Create Input component in frontend/src/components/ui/Input.jsx"
Task: "Create Card component in frontend/src/components/ui/Card.jsx"
Task: "Create Modal component in frontend/src/components/ui/Modal.jsx"
Task: "Create Loading spinner component in frontend/src/components/ui/Loading.jsx"
```

---

## Parallel Example: User Story 1

```bash
# Launch backend routes in parallel:
Task: "Create storefront products routes in backend/src/routes/products.storefront.js"
Task: "Create categories routes in backend/src/routes/categories.js"
Task: "Create cart routes in backend/src/routes/cart.js"
Task: "Create checkout routes in backend/src/routes/checkout.js"

# Launch frontend services in parallel:
Task: "Create products service functions in frontend/src/services/productService.js"
Task: "Create cart service functions in frontend/src/services/cartService.js"
Task: "Create checkout service functions in frontend/src/services/checkoutService.js"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test User Story 1 independently
5. Deploy/demo if ready - customers can browse and purchase

### Incremental Delivery

1. Complete Setup + Foundational -> Foundation ready
2. Add User Story 1 -> Test independently -> Deploy/Demo (MVP!)
3. Add User Story 2 -> Test independently -> Deploy/Demo (merchants can add products)
4. Add User Story 3 -> Test independently -> Deploy/Demo (analytics available)
5. Add User Story 4 -> Test independently -> Deploy/Demo (order management)
6. Add User Story 5 -> Test independently -> Deploy/Demo (notifications)
7. Add User Story 6 -> Test independently -> Deploy/Demo (customer accounts)
8. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (Customer Purchase Flow)
   - Developer B: User Story 2 (Product Management)
   - Developer C: User Story 6 (Customer Accounts)
3. After initial stories complete:
   - Developer A: User Story 3 (Analytics)
   - Developer B: User Story 4 (Order Management)
   - Developer C: User Story 5 (Notifications)
4. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
- All prices stored in cents (e.g., 2999 = $29.99)
- 12 months rolling history for analytics per spec clarification
- Default low-stock threshold is 5 units per spec clarification
- Only merchants can cancel orders per spec clarification
