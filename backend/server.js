require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');
const prisma = require('./src/config/database');

// Import routes
const authRoutes = require('./src/routes/auth');
const categoryRoutes = require('./src/routes/categories');
const productRoutes = require('./src/routes/products');
const cartRoutes = require('./src/routes/cart');
const orderRoutes = require('./src/routes/orders');
const addressRoutes = require('./src/routes/addresses');
const locationRoutes = require('./src/routes/locations');
const paymentRoutes = require('./src/routes/payments');
const subscriptionRoutes = require('./src/routes/subscriptions');
const atvrRoutes = require('./src/routes/atvr');
const dashboardRoutes = require('./src/routes/dashboard');
const bannerRoutes = require('./src/routes/banners');
const imageRoutes = require('./src/routes/images');
const mediaRoutes = require('./src/routes/media');
const settingsRoutes = require('./src/routes/settings');
const paymentGatewayRoutes = require('./src/routes/paymentGateways');
const customerRoutes = require('./src/routes/customers');
const analyticsRoutes = require('./src/routes/analytics');
const reportsRoutes = require('./src/routes/reports');
const chatRoutes = require('./src/routes/chat');
const integrationRoutes = require('./src/routes/integrations');
const shippingRoutes = require('./src/routes/shipping');
const demoDataRoutes = require('./src/routes/demo-data');
const translationRoutes = require('./src/routes/translations');
const ChatService = require('./src/services/chatService');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production' 
      ? ['http://localhost:3000', 'http://localhost:3001'] 
      : ['http://localhost:3000', 'http://localhost:3001'],
    methods: ['GET', 'POST'],
  },
});

const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['http://localhost:3000', 'http://localhost:3001', 'http://192.168.8.62:3000', 'http://192.168.8.62:3001'] 
    : ['http://localhost:3000', 'http://localhost:3001', 'http://192.168.8.62:3000', 'http://192.168.8.62:3001'],
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve static files (uploads)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/addresses', addressRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/atvr', atvrRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/images', imageRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/banners', bannerRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/payment-gateways', paymentGatewayRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/receipt-settings', require('./src/routes/receiptSettings'));
app.use('/api/smtp-settings', require('./src/routes/smtpSettings'));
app.use('/api/reports', reportsRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/integrations', integrationRoutes);
app.use('/api/shipping', shippingRoutes);
app.use('/api/admin/demo-data', demoDataRoutes);
app.use('/api/translations', translationRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV 
  });
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Join user to their personal room
  socket.on('join-user-room', (userId) => {
    socket.join(`user-${userId}`);
    console.log(`User ${userId} joined their room`);
  });

  // Join delivery person to their room
  socket.on('join-delivery-room', (deliveryPersonId) => {
    socket.join(`delivery-${deliveryPersonId}`);
    console.log(`Delivery person ${deliveryPersonId} joined their room`);
  });

  // Join admin room
  socket.on('join-admin-room', () => {
    socket.join('admin-room');
    console.log('User joined admin room');
  });

  // Chat-specific socket events
  socket.on('join-conversation', (conversationId) => {
    socket.join(`conversation-${conversationId}`);
    console.log(`User joined conversation ${conversationId}`);
  });

  socket.on('leave-conversation', (conversationId) => {
    socket.leave(`conversation-${conversationId}`);
    console.log(`User left conversation ${conversationId}`);
  });

  socket.on('typing-start', (data) => {
    const { conversationId, userId } = data;
    socket.to(`conversation-${conversationId}`).emit('user-typing', {
      userId,
      isTyping: true,
    });
  });

  socket.on('typing-stop', (data) => {
    const { conversationId, userId } = data;
    socket.to(`conversation-${conversationId}`).emit('user-typing', {
      userId,
      isTyping: false,
    });
  });

  // Handle location updates from delivery personnel
  socket.on('location-update', (data) => {
    const { deliveryPersonId, latitude, longitude, orderId } = data;
    
    // Broadcast location update to relevant users
    if (orderId) {
      // Notify customers tracking this order
      io.to(`order-${orderId}`).emit('delivery-location-update', {
        deliveryPersonId,
        latitude,
        longitude,
        timestamp: new Date().toISOString(),
      });
    }

    // Notify admin dashboard
    io.to('admin-room').emit('delivery-location-update', {
      deliveryPersonId,
      latitude,
      longitude,
      timestamp: new Date().toISOString(),
    });
  });

  // Handle order status updates
  socket.on('order-status-update', (data) => {
    const { orderId, status, userId, deliveryPersonId } = data;

    // Notify customer
    if (userId) {
      io.to(`user-${userId}`).emit('order-status-update', {
        orderId,
        status,
        timestamp: new Date().toISOString(),
      });
    }

    // Notify delivery person
    if (deliveryPersonId) {
      io.to(`delivery-${deliveryPersonId}`).emit('order-status-update', {
        orderId,
        status,
        timestamp: new Date().toISOString(),
      });
    }

    // Notify admin dashboard
    io.to('admin-room').emit('order-status-update', {
      orderId,
      status,
      timestamp: new Date().toISOString(),
    });
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
    prisma.$disconnect();
    process.exit(0);
  });
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
    prisma.$disconnect();
    process.exit(0);
  });
});

// Set up ChatService with io instance
ChatService.setIO(io);

// Start server
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🗄️  Database: ${process.env.DATABASE_URL}`);
});

// Export io for use in other modules
module.exports = { io };

