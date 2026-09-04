# 🏪 UPENDRA GENERAL STORES
### Full-Stack Local Indian Kirana & Grocery E-Commerce Platform

A production-quality full-stack grocery ordering web platform built for **"Upendra General Stores"**, an authentic local Indian Kirana/general store. The platform features an inviting, warm Indian grocery visual identity (Cream, Saffron Orange, Deep Green, Mustard Yellow, Earth Brown), smart custom quantity calculations (100g, 250g, 500g, 1kg, 2kg, custom grams/kg), live search, geolocation-assisted checkout, order status tracking timeline, and a shopkeeper admin suite.

---

## 🌟 Key Features

### 🛒 Customer Experience
- **Authentic Indian Kirana Theme**: Warm colors (`#FAF7F2` Cream, `#E85D04` Saffron Orange, `#1E5128` Deep Green, `#E5A93C` Mustard Yellow, `#2D2319` Earth Brown) with clean cards, smooth shadows, and elderly-friendly readability.
- **AI-Generated Authentic Visuals**: Realistic hero imagery and 30+ grocery product photos (Dals, Whole Spices, Haldi, Jeera, Kali Mirch, Red Chilli, Garlic, Ginger, Dry Fruits, Namkeen, etc.).
- **Smart Custom Quantity & Pricing Engine**:
  - Weight-based items: Pre-set chips (`100g`, `250g (पाव)`, `500g (आधा किलो)`, `1kg`, `2kg`, `5kg`) or custom input `[ 350 ] [ grams / kg ]` with instant dynamic calculation:
    $$\text{Price} = \frac{\text{Base Price}}{\text{kg}} \times \text{Weight in kg}$$
  - Piece/packet items: `piece`, `packet`, `box`, `bottle`, `liter`.
- **Live Search & Dynamic Filters**: Instant search with drop-down preview, category filters, unit-type filters, price range, and sorting.
- **Interactive Cart Drawer & Cart Page**: Slide-over drawer, quantity steppers, item removal, and a **Free Delivery Goal Tracker** (Free delivery above ₹499).
- **Geolocation-Assisted Checkout**: "📍 Use My Current Location" using HTML5 Geolocation API with GPS coordinate tagging and manual address entry.
- **Payment Modes**: Cash on Delivery (COD) / Pay at Doorstep, UPI on Delivery QR, and Store Pickup.
- **Celebration & Order Confirmation**: Unique Order ID generation (`UPG-2026-XXXXXX`) with festive confetti and printable receipt.
- **Live Order Status Tracking Timeline**: Multi-step visual tracking (`Order Received` ➔ `Confirmed` ➔ `Packing at Store` ➔ `Out for Delivery` ➔ `Delivered`).
- **Mobile-First Responsive Layout**: Clean bottom navigation bar on mobile viewports.

### 🛡️ Shopkeeper Admin Suite
- **Executive Dashboard**: Real-time KPI cards for Total Sales (₹), Total Orders, Pending Orders, Low Stock Alerts, Total Customers, and Category breakdown.
- **Quick Price & Stock Editor**: In-place table editing allowing the shopkeeper to rapidly update daily mandi prices and stock quantities with 1-click save.
- **Products Management**: Full CRUD with product image upload, category assignment, Hindi name, stock quantity, and availability toggle.
- **Category Management**: Create, edit, and order department categories.
- **Order Fulfillment**: Instant 1-click status dropdown updates that sync in real-time with customer tracking timelines.
- **Customer Directory**: View registered customer profiles, mobile numbers, delivery addresses, total orders, and lifetime spending.

---

## 💻 Technology Stack

- **Frontend**:
  - React.js 18 + Vite
  - Tailwind CSS + Custom Design System
  - Lucide React (Modern icons)
  - React Router DOM v6
  - Axios + JWT Interceptors
  - React Hot Toast + Canvas Confetti
- **Backend**:
  - Python 3.10+ / Django 5.x
  - Django REST Framework (DRF)
  - `djangorestframework-simplejwt` (JWT Authentication)
  - `django-cors-headers`
  - `PyMySQL` / `cryptography`
  - Pillow (Image handling)
- **Database**:
  - MySQL 8.0 support with environment variable configuration
  - Transparent SQLite fallback for frictionless zero-config local development

---

## 📂 Project Structure

```
shop-website/
├── backend/
│   ├── manage.py
│   ├── requirements.txt
│   ├── .env.example
│   ├── .env
│   ├── upendra_backend/
│   │   ├── settings.py           # Database & JWT configuration
│   │   ├── urls.py               # Main routing & media static serving
│   │   └── wsgi.py
│   └── store/
│       ├── models.py             # CustomUser, Category, Product, Cart, Order, OrderItem
│       ├── serializers.py        # DRF serializers
│       ├── views.py              # Customer & Admin REST views
│       ├── urls.py               # API endpoints
│       ├── permissions.py        # IsAdminRole, IsOwnerOrAdmin
│       ├── admin.py              # Django Admin interface
│       └── management/
│           └── commands/
│               └── seed_data.py  # Seeder for 16 categories, 39 products, demo users
└── frontend/
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    ├── index.html
    ├── public/
    │   └── assets/images/        # High-res authentic grocery images
    └── src/
        ├── App.jsx               # Routes & Auth/Cart providers
        ├── main.jsx              # React DOM mounting with BrowserRouter
        ├── index.css             # Theme tokens, fonts, and micro-animations
        ├── api/
        │   ├── client.js         # Axios with JWT auto-attach & token refresh
        │   └── services.js       # Auth, Product, Cart, Order, Admin API services
        ├── context/
        │   ├── AuthContext.jsx   # Authentication state & role checks
        │   └── CartContext.jsx   # Custom quantity price calculator & cart state
        ├── components/
        │   ├── common/           # Header, Footer, MobileNav
        │   ├── products/         # ProductCard, CustomQuantityModal
        │   ├── cart/             # CartDrawer
        │   └── admin/            # AdminLayout
        └── pages/
            ├── public/           # Home, Products, ProductDetail, Categories, About, Contact
            ├── auth/             # SignIn, SignUp
            ├── customer/         # CartPage, Checkout, OrderConfirmation, MyOrders, Profile
            └── admin/            # AdminDashboard, AdminProducts, AdminPriceStock, AdminCategories, AdminOrders, AdminCustomers
```

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- Python 3.10 or higher
- Node.js 18 or higher & npm

### 2. Backend Setup
```bash
# Navigate to backend directory
cd backend

# Install dependencies
python -m pip install -r requirements.txt

# Create .env configuration (if not already created)
cp .env.example .env

# Run database migrations
python manage.py migrate

# Seed 16 Categories, 39 Products, Store Settings & Demo Accounts
python manage.py seed_data

# Start Django Backend Server
python manage.py runserver 127.0.0.1:8000
```

### 3. Frontend Setup
```bash
# In a new terminal, navigate to frontend directory
cd frontend

# Install npm packages
npm install

# Start Vite Frontend Development Server
npm run dev
```

The website will be live at **`http://127.0.0.1:5173/`**!

---

## 🔑 Demo & Admin Credentials

| Role | Email | Password | Privileges |
| :--- | :--- | :--- | :--- |
| **Store Admin** | `admin@upendrastores.com` | `Admin@123` | Full access to `/admin` dashboard, price/stock editor, order fulfillment, customer records |
| **Demo Customer** | `customer@gmail.com` | `Customer@123` | Customer browsing, custom weight ordering, checkout, live order tracking |

> 💡 **Tip**: On the **Sign In** page (`/signin`), click the **"Store Admin"** or **"Customer Demo"** 1-click button to automatically fill credentials.

---

## 🗄️ MySQL Database Setup (Optional)

To connect the application to a local or remote MySQL Server:

1. Create a database in MySQL:
   ```sql
   CREATE DATABASE upendra_store_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```
2. Edit `backend/.env`:
   ```env
   USE_MYSQL=True
   DB_NAME=upendra_store_db
   DB_USER=root
   DB_PASSWORD=your_mysql_password
   DB_HOST=localhost
   DB_PORT=3306
   ```
3. Run migrations and seed data:
   ```bash
   python manage.py migrate
   python manage.py seed_data
   ```

---

## 📡 REST API Documentation

### Authentication Endpoints
- `POST /api/auth/register/` - Register new customer account
- `POST /api/auth/login/` - Authenticate user and receive JWT access + refresh tokens
- `POST /api/auth/refresh/` - Refresh expired access token
- `GET /api/auth/profile/` - Get authenticated user profile
- `PUT /api/auth/profile/` - Update profile details and address

### Product & Category Endpoints
- `GET /api/products/` - List products (filters: `search`, `category`, `min_price`, `max_price`, `featured`, `ordering`)
- `GET /api/products/:id/` - Product details
- `POST /api/products/` - Create new product (Admin only)
- `PUT /api/products/:id/` - Update product (Admin only)
- `DELETE /api/products/:id/` - Delete product (Admin only)
- `GET /api/categories/` - List active grocery categories
- `POST /api/categories/` - Create category (Admin only)

### Cart Endpoints
- `GET /api/cart/` - Get authenticated user's cart
- `POST /api/cart/add/` - Add item with custom quantity and unit (`product_id`, `quantity`, `unit`)
- `PUT /api/cart/items/:id/` - Update cart item quantity
- `DELETE /api/cart/items/:id/` - Remove item from cart
- `POST /api/cart/clear/` - Clear all items in cart

### Orders & Checkout Endpoints
- `POST /api/orders/` - Place new grocery order (supports COD, UPI, Store Pickup, Geolocation coordinates)
- `GET /api/orders/` - List customer's orders (or all orders if Admin)
- `GET /api/orders/:id/` - Retrieve specific order details

### Admin Suite Endpoints
- `GET /api/admin/dashboard/` - Aggregated sales, order status breakdown, low stock counts
- `GET /api/admin/customers/` - Customer directory with lifetime order count and total spend
- `PUT /api/admin/orders/:id/status/` - Update order fulfillment status (`pending`, `confirmed`, `preparing`, `out_for_delivery`, `delivered`, `cancelled`)
- `PUT /api/admin/products/:id/quick-update/` - Rapid in-place update for product price and stock
- `POST /api/admin/upload-image/` - Upload product photo

---

## 🔮 Future Roadmap & Improvements
- WhatsApp Business API integration for automatic order notifications on customer's phone
- Razorpay / PayU payment gateway integration for advance online payments
- Delivery boy mobile app with live GPS route optimization
- Multi-language toggle (Full Hindi / Devanagari UI mode)
