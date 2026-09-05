# 🏪 UPENDRA GENERAL STORES
### Full-Stack Local Indian Kirana & Grocery E-Commerce Platform

A production-ready full-stack grocery ordering platform built for **"Upendra General Stores"**, an authentic local Indian Kirana/general store. The platform features an inviting, warm Indian grocery visual identity (Cream, Saffron Orange, Deep Green, Mustard Yellow, Earth Brown), smart custom quantity calculations (100g, 250g, 500g, 1kg, 2kg, custom grams/kg), live search, geolocation-assisted checkout, order status tracking timeline, and a shopkeeper admin suite.

---

## 🌟 Key Features

### 🛒 Customer Experience
- **Authentic Indian Kirana Theme**: Warm colors (`#FAF7F2` Cream, `#E85D04` Saffron Orange, `#1E5128` Deep Green, `#E5A93C` Mustard Yellow, `#2D2319` Earth Brown) with clean cards, smooth shadows, and elderly-friendly readability.
- **Authentic Store & Product Visuals**: Real store imagery and authentic grocery product photos (Dals, Whole Spices, Haldi, Jeera, Kali Mirch, Red Chilli, Garlic, Ginger, Dry Fruits, Namkeen, etc.).
- **Smart Custom Quantity & Pricing Engine**:
  - Weight-based items: Pre-set chips (`100g`, `250g (पाव)`, `500g (आधा किलो)`, `1kg`, `2kg`, `5kg`) or custom input `[ 350 ] [ grams / kg ]` with instant dynamic calculation:
    $$\text{Price} = \frac{\text{Base Price}}{\text{kg}} \times \text{Weight in kg}$$
  - Piece/packet items: `piece`, `packet`, `box`, `bottle`, `liter`.
- **Live Search & Dynamic Filters**: Instant search with drop-down preview, category filters, unit-type filters, price range, and sorting.
- **Interactive Cart Drawer & Cart Page**: Slide-over drawer, quantity steppers, item removal, and a **Free Delivery Goal Tracker** (Free delivery above **₹249**).
- **Geolocation-Assisted Checkout**: "📍 Use My Current Location" using HTML5 Geolocation API with GPS coordinate tagging and manual address entry.
- **Payment Modes**: Cash on Delivery (COD) / Pay at Doorstep, UPI QR Code / UPI Apps with UTR verification, and Store Pickup.
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
  - React 18 + Vite
  - Tailwind CSS + Custom Design System
  - Lucide React (Icons)
  - React Router DOM v6
  - Axios + JWT Interceptors
  - React Hot Toast + Canvas Confetti
- **Backend**:
  - Python 3.10+ / Django 5.x
  - Django REST Framework (DRF)
  - `djangorestframework-simplejwt` (JWT Authentication)
  - `django-cors-headers`
  - `dj-database-url` (Database URL parsing for cloud PostgreSQL)
  - `psycopg` (PostgreSQL driver)
  - `gunicorn` (Production WSGI Server)
  - `whitenoise` (Production static files serving)
  - `Pillow` (Image processing)
  - `python-dotenv`
- **Database**:
  - **Production**: PostgreSQL on **Neon Free Tier**
  - **Local Development**: SQLite (`upendra_store.sqlite3`) with zero setup needed, or optional MySQL

---

## 📂 Project Structure

```
shop-website/
├── render.yaml                   # Render deployment blueprint
├── README.md
├── product_image/                # Bundled authentic grocery product assets
├── backend/
│   ├── manage.py
│   ├── requirements.txt          # Python production dependencies
│   ├── .env.example              # Environment variable template
│   ├── upendra_backend/
│   │   ├── settings.py           # Database, WhiteNoise, CORS & JWT config
│   │   ├── urls.py               # Main routing
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
│               └── seed_data.py  # Seeder for 8 categories, 39 products, demo data
└── frontend/
    ├── package.json
    ├── vite.config.js
    ├── vercel.json               # Vercel SPA routing rewrite
    ├── .env.example              # Frontend environment template
    ├── public/
    │   └── assets/images/        # High-res authentic grocery images
    └── src/
        ├── App.jsx               # Routes & Auth/Cart providers
        ├── main.jsx              # React DOM mounting
        ├── index.css             # Theme tokens, fonts, and animations
        ├── api/
        │   ├── client.js         # Axios instance with JWT interceptors
        │   └── services.js       # API endpoints
        ├── context/
        │   ├── AuthContext.jsx   # Authentication state & role checks
        │   └── CartContext.jsx   # ₹249 threshold calculator & cart state
        ├── components/
        └── pages/
```

---

## 🚀 Local Development Setup

### 1. Prerequisites
- Python 3.10+
- Node.js 18+ & npm

### 2. Backend Setup (Local SQLite default)
```bash
# 1. Navigate to backend directory
cd backend

# 2. Create and activate virtual environment (optional but recommended)
python -m venv venv
# On Windows:
venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Create your local .env file from template
cp .env.example .env

# 5. Run database migrations
python manage.py migrate

# 6. Seed initial categories, products, and store settings
python manage.py seed_data

# 7. Start Django development server
python manage.py runserver 127.0.0.1:8000
```

### 3. Frontend Setup
```bash
# 1. In a new terminal, navigate to frontend directory
cd frontend

# 2. Install dependencies
npm install

# 3. Create .env from template
cp .env.example .env

# 4. Start Vite development server
npm run dev
```

Visit **`http://localhost:5173/`** in your browser!

---

## ☁️ FREE Production Deployment Guide

This project is pre-configured to be deployed for **100% FREE** using:
1. **Neon** → Free Serverless PostgreSQL Database
2. **Render** → Free Django Web Service
3. **Vercel** → Free React / Vite Frontend

---

### Step 1: Create Free PostgreSQL Database on Neon
1. Sign up at [neon.tech](https://neon.tech) (Free tier - no credit card required).
2. Create a new project named `upendra-store-db`.
3. Copy the **Connection String** (choose `PostgreSQL` / `Pooled connection`).
   It looks like:
   `postgresql://neondb_owner:YOUR_PASSWORD@ep-xyz-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require`

---

### Step 2: Deploy Django Backend on Render (Free)
1. Sign up at [render.com](https://render.com).
2. Click **New +** ➔ **Web Service** ➔ Connect your GitHub repository: `https://github.com/Shubhampurbey/upendra-general-stores`.
3. Configure settings:
   - **Name**: `upendra-backend`
   - **Root Directory**: `backend`
   - **Runtime**: `Python`
   - **Build Command**: `pip install -r requirements.txt && python manage.py migrate && python manage.py collectstatic --noinput && python manage.py seed_data`
   - **Start Command**: `gunicorn upendra_backend.wsgi:application --bind 0.0.0.0:$PORT`
   - **Instance Type**: `Free`
4. Add **Environment Variables** in the Render Dashboard:

| Variable | Recommended Value / Description |
| :--- | :--- |
| `DEBUG` | `False` |
| `DJANGO_SECRET_KEY` | *(Generate a random 50+ character string)* |
| `DATABASE_URL` | *(Paste your Neon PostgreSQL connection string)* |
| `ALLOWED_HOSTS` | `localhost,127.0.0.1,.onrender.com` |
| `CORS_ALLOWED_ORIGINS` | `http://localhost:5173,https://your-frontend.vercel.app` |
| `ADMIN_EMAIL` | *(Your admin email for login)* |
| `ADMIN_PASSWORD` | *(Your secure admin master password)* |
| `ADMIN_MOBILE` | *(Your 10-digit mobile number)* |

5. Click **Deploy Web Service**. Once deployed, Render will provide your backend URL (e.g. `https://upendra-backend.onrender.com`).

---

### Step 3: Deploy React Frontend on Vercel (Free)
1. Sign up at [vercel.com](https://vercel.com).
2. Click **Add New...** ➔ **Project** ➔ Import your repository: `upendra-general-stores`.
3. In project settings:
   - **Root Directory**: `frontend`
   - **Framework Preset**: `Vite`
4. Expand **Environment Variables** and add:

| Variable | Value |
| :--- | :--- |
| `VITE_API_BASE_URL` | `https://upendra-backend.onrender.com/api` *(replace with your Render backend URL)* |
| `VITE_SHOP_UPI_ID` | `7050830610@ptsbi` *(or your store UPI ID)* |

5. Click **Deploy**. Vercel will build and deploy your site to `https://your-app.vercel.app`.
6. Go back to Render Dashboard ➔ `upendra-backend` ➔ **Environment Variables** ➔ Update `CORS_ALLOWED_ORIGINS` to include your new Vercel URL:
   `http://localhost:5173,https://your-app.vercel.app`

---

## 🛡️ Admin Access

- The store administration portal is located at `/admin` on the website and `/django-admin/` for Django admin.
- There is **no public admin registration**.
- The administrator account is created and managed securely via the `ADMIN_EMAIL` and `ADMIN_PASSWORD` environment variables and the `seed_data` management command, keeping all secrets safe from source control.

---

## 📡 Key REST API Endpoints

- `GET /api/products/` - List products with live filtering & category sorting
- `GET /api/categories/` - List store categories
- `GET /api/cart/` & `POST /api/cart/add/` - Cart management
- `POST /api/orders/` - Place order (Cash on Delivery / UPI QR / Store Pickup)
- `GET /api/orders/:id/` - Order timeline tracking
- `POST /api/auth/login-init/` - Customer & Admin authentication
- `GET /api/admin/dashboard/` - Admin executive sales & orders dashboard (Admin role only)
- `PUT /api/admin/orders/:id/status/` - Admin order fulfillment updates
