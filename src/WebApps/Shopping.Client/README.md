# Shopping.Client - Next.js App Router E-Commerce Frontend

Ứng dụng Frontend hiện đại cho hệ thống ASP.NET Core Microservices, được xây dựng bằng:
- **Framework:** Next.js 14 (App Router) + TypeScript
- **Styling:** Tailwind CSS + shadcn/ui components
- **Icons:** Lucide React
- **Architecture:** Next.js Server Components & Server Actions (Zero-CORS, direct server-to-server calls to Yarp API Gateway)
- **Deployment:** Multi-stage Docker Standalone build, tích hợp trong `docker-compose.yml`

## Cấu trúc thư mục

```
src/
├── actions/             # Next.js Server Actions (Catalog, Basket, Ordering)
├── app/                 # App Router Pages (Home, Products, Detail, Cart, Checkout, Orders, Confirmation, Contact)
├── components/
│   ├── layout/          # Header (Nav, Search, Cart Badge), Footer
│   ├── product/         # ProductCard, AddToCartButton, ProductDetailClient
│   ├── cart/            # CartTable, CheckoutForm
│   └── ui/              # shadcn/ui primitives (Button, Card, Badge, Table, Input, Separator)
├── context/             # CartContext (Client-side state sync & realtime updates)
├── lib/                 # utils (cn), gatewayClient (fetchFromGateway)
└── types/               # TypeScript data models matching C# DTOs
```

## Chạy trong môi trường phát triển (Local Dev)

1. Cài đặt dependencies (nếu chưa):
   ```bash
   npm install
   ```

2. Khởi chạy Next.js dev server:
   ```bash
   npm run dev
   ```
   Ứng dụng sẽ chạy tại [http://localhost:3000](http://localhost:3000).

3. Đảm bảo Yarp Gateway hoặc backend microservices đang chạy tại `http://localhost:6004`. Bạn có thể tùy chỉnh địa chỉ Gateway qua file `.env.local`:
   ```env
   API_GATEWAY_URL=http://localhost:6004
   ```

## Chạy toàn bộ hệ thống bằng Docker Compose

Từ thư mục `src`:
```bash
docker-compose up --build
```
Dịch vụ `shopping.client` sẽ khởi chạy tại cổng `http://localhost:3000`.

