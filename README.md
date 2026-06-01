# N8N WhatsApp Order Automation

> A fully self-hosted WhatsApp Business chatbot for automated order management — built with **n8n**, **Node.js**, **Express**, and **SQLite**. No manual order-taking. No expensive SaaS platforms.

[![Node.js](https://img.shields.io/badge/Node.js-16%2B-green)](https://nodejs.org)
[![n8n](https://img.shields.io/badge/n8n-self--hosted-orange)](https://n8n.io)
[![WhatsApp Business API](https://img.shields.io/badge/WhatsApp-Business%20API-25D366)](https://developers.facebook.com/docs/whatsapp)

---

## 🚀 Features

| Feature | Details |
|---|---|
| 📱 WhatsApp Integration | Full WhatsApp Business Cloud API support |
| 🤖 Smart Chatbot | Understands MENU, HELP, TRACK, CONFIRM, CANCEL commands |
| 🛒 Order Management | Full order lifecycle: pending → confirmed → preparing → delivered |
| 👥 Customer Management | Auto-creates customer profiles from phone numbers |
| 🗄️ Database Storage | SQLite with customers, orders, and products tables |
| 🔄 n8n Workflow | Visual, importable workflow for order routing and responses |
| 🌐 REST API | Full REST endpoints for orders, customers, and webhooks |
| 📊 Web Dashboard | Simple frontend served at the root URL |

---

## 🏗️ System Architecture

```
Customer WhatsApp
       │
       ▼
WhatsApp Business API (Meta Cloud)
       │  POST /webhook/whatsapp
       ▼
┌─────────────────────────────────┐
│        Node.js / Express        │
│  server.js  ──►  routes/        │
│                  webhook.js     │
│                  orders.js      │
│                  customers.js   │
│                      │          │
│              services/          │
│              orderProcessor.js  │
│              whatsappService.js │
│                      │          │
│              database/init.js   │
│              (SQLite)           │
└─────────────────────────────────┘
       │
       ▼
  n8n Workflow Engine
  (whatsapp-order-automation.json)
       │
       ▼
WhatsApp Business API (send reply)
```

---

## 📁 Project Structure

```
n8n-whatsapp-automation/
├── server.js                  # Express app entry point
├── index.js                   # Simple Node.js runner
├── package.json
├── .env                       # Environment variables (not committed)
├── database/
│   └── init.js                # SQLite schema initialization
├── routes/
│   ├── webhook.js             # WhatsApp webhook handler
│   ├── orders.js              # Orders REST API
│   └── customers.js           # Customers REST API
├── services/
│   ├── whatsappService.js     # WhatsApp API wrapper (send messages)
│   └── orderProcessor.js      # Core chatbot logic
├── n8n-workflows/
│   └── whatsapp-order-automation.json  # Importable n8n workflow
└── public/
    └── index.html             # Web dashboard
```

---

## 📋 Prerequisites

- **Node.js** 16 or higher
- A **[Meta Developer Account](https://developers.facebook.com/)** with a WhatsApp Business app configured
- **n8n** installed globally
- A public HTTPS URL for the webhook (use [ngrok](https://ngrok.com) for local development)

---

## ⚙️ Getting Started

### 1. Clone & Install Dependencies

```bash
git clone https://github.com/amritanka/n8n-whatsapp-order-automation.git
cd n8n-whatsapp-order-automation
npm install
```

### 2. Install n8n Globally

```bash
npm install n8n -g
```

### 3. Configure Environment Variables

Create a `.env` file at the project root:

```env
# Server
PORT=3000

# WhatsApp Business API (from Meta Developer Console)
WHATSAPP_API_URL=https://graph.facebook.com/v17.0
WHATSAPP_ACCESS_TOKEN=your_access_token_here
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
WHATSAPP_WEBHOOK_VERIFY_TOKEN=your_secure_verify_token

# n8n
N8N_PROTOCOL=http
N8N_HOST=localhost
N8N_PORT=5678

# Business Info
BUSINESS_NAME=My Restaurant
BUSINESS_PHONE=+1234567890
BUSINESS_EMAIL=hello@myrestaurant.com
```

### 4. Start the Servers

```bash
# Terminal 1 — Start the Node.js backend
npm start

# Terminal 2 — Start n8n
n8n start
```

> **Dev mode** (auto-reload): `npm run dev`

### 5. Configure the WhatsApp Webhook

1. Go to **Meta Developer Console → Your App → WhatsApp → Configuration**
2. Set **Webhook URL**: `https://your-domain.com/webhook/whatsapp`
3. Set **Verify Token**: must match `WHATSAPP_WEBHOOK_VERIFY_TOKEN` in your `.env`
4. Subscribe to **messages** events

> 💡 For local development, expose your server with ngrok: `ngrok http 3000`

### 6. Import the n8n Workflow

1. Open n8n at `http://localhost:5678`
2. Click **Import from file**
3. Select `n8n-workflows/whatsapp-order-automation.json`
4. Configure the webhook nodes with your server's URL
5. **Activate** the workflow

---

## 📱 Customer Commands

Customers interact purely through WhatsApp messages — no app download required:

| Command | Action |
|---|---|
| `MENU` or `START` | Displays the full product menu with prices |
| `HELP` | Shows ordering instructions and contact info |
| `1x2, 3x1` | Places an order (item ID × quantity) |
| `CONFIRM` or `YES` | Confirms a pending order |
| `CANCEL` or `NO` | Cancels a pending order |
| `TRACK` | Shows the latest order status |

---

## 🔄 Order Flow

```
1. Customer sends "MENU"
        │
        ▼
2. Bot fetches products from SQLite and displays menu

3. Customer replies "1x2, 3x1"
        │
        ▼
4. OrderProcessor parses items → calculates total → saves draft

5. Bot asks: "Confirm your order? Total: $75.50 — Reply CONFIRM or CANCEL"

6. Customer replies "CONFIRM"
        │
        ▼
7. Order saved with status: PENDING → CONFIRMED
   Bot sends confirmation with order number

8. Business updates status → Customer receives update via TRACK
```

---

## 🗄️ Database Schema

Three tables are created automatically on first run via `database/init.js`.

### `customers`
| Column | Type | Notes |
|---|---|---|
| `id` | INTEGER | Primary key |
| `phone_number` | TEXT | WhatsApp number (unique) |
| `name` | TEXT | Customer name |
| `email` | TEXT | Optional |
| `address` | TEXT | Delivery address |

### `orders`
| Column | Type | Notes |
|---|---|---|
| `id` | INTEGER | Primary key |
| `order_number` | TEXT | Unique, human-readable ID |
| `customer_id` | INTEGER | FK → customers |
| `status` | TEXT | pending / confirmed / preparing / ready / delivered / cancelled |
| `items` | TEXT | JSON array of ordered items |
| `total_amount` | REAL | Order total |
| `created_at` | DATETIME | Auto-set on insert |

### `products`
| Column | Type | Notes |
|---|---|---|
| `id` | INTEGER | Primary key |
| `name` | TEXT | Product name |
| `description` | TEXT | Description |
| `price` | REAL | Price |
| `stock_quantity` | INTEGER | Available stock |
| `sku` | TEXT | SKU code |

## 🔌 API Endpoints

### Orders
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/orders` | List all orders |
| `GET` | `/api/orders/:id` | Get a specific order |
| `POST` | `/api/orders` | Create a new order |
| `PATCH` | `/api/orders/:id/status` | Update order status |

### Customers
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/customers` | List all customers |
| `GET` | `/api/customers/phone/:phone` | Get customer by phone number |
| `POST` | `/api/customers` | Create or update a customer |

### Webhooks
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/webhook/whatsapp` | WhatsApp webhook verification |
| `POST` | `/webhook/whatsapp` | Receive and process incoming messages |

### Health Check
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Returns server status and timestamp |

## 🎯 n8n Workflow Nodes

The included `n8n-workflows/whatsapp-order-automation.json` workflow contains:

| # | Node | Purpose |
|---|---|---|
| 1 | **Webhook Trigger** | Receives forwarded messages from the Express server |
| 2 | **Message Router** | Switch node that routes based on message content |
| 3 | **Menu Handler** | Fetches products and formats the menu message |
| 4 | **Order Parser** | Extracts item IDs and quantities from message text |
| 5 | **Order Creator** | Calls the REST API to create the order record |
| 6 | **Status Tracker** | Queries order status for TRACK requests |
| 7 | **Response Sender** | HTTP Request node that calls the WhatsApp API |

> The visual editor makes it easy to extend the workflow — add email notifications, connect to Google Sheets, or post to Slack — without touching code.

## 🔧 Customization

### Adding New Products

Insert directly into SQLite:

```sql
INSERT INTO products (name, description, price, stock_quantity, sku)
VALUES ('New Item', 'Description here', 75.00, 50, 'ITEM-001');
```

### Customizing Message Templates

Edit `services/whatsappService.js` to update what the bot says:

```javascript
async sendOrderConfirmation(to, orderDetails) {
  const message = `
🎉 *Order Confirmed!*
📋 Order: ${orderDetails.orderNumber}
💰 Total: $${orderDetails.total}
⏰ Estimated delivery: 30-45 minutes
  `.trim();

  return this.sendMessage(to, message);
}
```

### Adding New Commands

Extend `services/orderProcessor.js`:

```javascript
async processIncomingMessage(phoneNumber, messageText, messageType) {
  const normalizedMessage = messageText.toLowerCase().trim();

  if (normalizedMessage === 'your-command') {
    await this.handleYourCommand(phoneNumber);
  }
  // ... existing commands
}
```

### Tech Stack

| Technology | Role |
|---|---|
| Node.js + Express | Backend server and REST API |
| WhatsApp Business API | Messaging via Meta Cloud |
| n8n | Visual workflow engine |
| SQLite | Lightweight embedded database |
| axios | HTTP client for API calls |
| uuid | Unique order number generation |
| dotenv | Environment variable management |
| nodemon | Dev auto-reload |

## 🔍 Monitoring & Logs

| Source | Where to look |
|---|---|
| Server logs | Console output (message processing, errors) |
| n8n execution logs | n8n UI → Executions tab |
| WhatsApp API logs | Meta Developer Console → Webhooks |
| Database | Use any SQLite viewer on `database/*.sqlite` |

---

## 🚨 Troubleshooting

### Webhook not receiving messages
- Confirm your server is publicly accessible (use ngrok for local dev)
- Verify SSL certificate if using HTTPS
- Confirm `WHATSAPP_WEBHOOK_VERIFY_TOKEN` in `.env` matches Meta Console

### n8n workflow not triggering
- Ensure the workflow is **active** in the n8n editor
- Verify the webhook node URL matches your server's forwarding address
- Check the n8n Executions tab for errors

### Database errors
- Check file permissions on the project directory
- Verify the SQLite file path in `database/init.js`
- Delete the `.sqlite` file and restart to re-initialize the schema

### WhatsApp API errors
- Validate your `WHATSAPP_ACCESS_TOKEN` (tokens expire — regenerate in Meta Console)
- Double-check `WHATSAPP_PHONE_NUMBER_ID`
- Check Meta API rate limits if sending many messages

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m 'Add my feature'`
4. Push to the branch: `git push origin feature/my-feature`
5. Open a Pull Request

---

## 📞 Support

- 🐛 [Open a GitHub Issue](https://github.com/amritanka/n8n-whatsapp-order-automation/issues)
- 📖 [n8n Documentation](https://docs.n8n.io)
- 💬 [n8n Community Forum](https://community.n8n.io)
- 📘 [WhatsApp Business API Docs](https://developers.facebook.com/docs/whatsapp)