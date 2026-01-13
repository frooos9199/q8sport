import { Server as HTTPServer } from 'http';
import { Server as IOServer } from 'socket.io';
import jwt from 'jsonwebtoken';
import { prisma } from '../prisma';

export class SocketManager {
  private io: IOServer;

  constructor(server: HTTPServer) {
    this.io = new IOServer(server, {
      cors: {
        origin: process.env.NEXTAUTH_URL || 'http://localhost:3000',
        methods: ['GET', 'POST']
      }
    });

    this.setupMiddleware();
    this.setupEventHandlers();
  }

  private setupMiddleware() {
    // Authentication middleware
    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token;
        if (!token) {
          throw new Error('No token provided');
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
        const user = await prisma.user.findUnique({
          where: { id: decoded.userId },
          select: { id: true, email: true, name: true, role: true, status: true }
        });

        if (!user || user.status !== 'ACTIVE') {
          throw new Error('User not found or inactive');
        }

        socket.data = { user };
        next();
      } catch (error) {
        next(new Error('Authentication failed'));
      }
    });
  }

  private setupEventHandlers() {
    this.io.on('connection', (socket) => {
      console.log(`User connected: ${socket.data.user.email}`);

      // Join auction room
      socket.on('join_auction', (auctionId: string) => {
        socket.join(`auction_${auctionId}`);
        console.log(`User ${socket.data.user.email} joined auction ${auctionId}`);
      });

      // Leave auction room
      socket.on('leave_auction', (auctionId: string) => {
        socket.leave(`auction_${auctionId}`);
        console.log(`User ${socket.data.user.email} left auction ${auctionId}`);
      });

      // Handle new bid
      socket.on('place_bid', async (data: { auctionId: string; amount: number }) => {
        try {
          const { auctionId, amount } = data;
          const bidderId = socket.data.user.id;

          // Validate auction exists and is active
          const auction = await prisma.auction.findUnique({
            where: { id: auctionId },
            include: { seller: { select: { id: true } } }
          });

          if (!auction || auction.status !== 'ACTIVE' || auction.endTime <= new Date()) {
            socket.emit('bid_error', { message: 'المزاد غير نشط أو منتهي' });
            return;
          }

          // Check if bidder is not the seller
          if (auction.seller.id === bidderId) {
            socket.emit('bid_error', { message: 'لا يمكنك المزايدة على مزادك الخاص' });
            return;
          }

          // Check if bid is higher than current price
          if (amount <= auction.currentPrice) {
            socket.emit('bid_error', { 
              message: `يجب أن تكون المزايدة أعلى من ${auction.currentPrice} دينار`
            });
            return;
          }

          // Create bid
          const bid = await prisma.bid.create({
            data: {
              amount,
              bidderId,
              auctionId
            },
            include: {
              bidder: {
                select: { id: true, name: true }
              }
            }
          });

          // Update auction current price
          await prisma.auction.update({
            where: { id: auctionId },
            data: { currentPrice: amount }
          });

          // Broadcast to all users in auction room
          this.io.to(`auction_${auctionId}`).emit('new_bid', {
            bid: {
              id: bid.id,
              amount: bid.amount,
              bidder: bid.bidder,
              createdAt: bid.createdAt
            },
            auction: {
              id: auctionId,
              currentPrice: amount
            }
          });

          console.log(`New bid placed: ${amount} by ${socket.data.user.email} on auction ${auctionId}`);

        } catch (error) {
          console.error('Bid error:', error);
          socket.emit('bid_error', { message: 'حدث خطأ في قبول المزايدة' });
        }
      });

      // Handle typing indicators for messages
      socket.on('typing_start', (auctionId: string) => {
        socket.to(`auction_${auctionId}`).emit('user_typing', {
          userId: socket.data.user.id,
          userName: socket.data.user.name
        });
      });

      socket.on('typing_stop', (auctionId: string) => {
        socket.to(`auction_${auctionId}`).emit('user_stopped_typing', {
          userId: socket.data.user.id
        });
      });

      // Handle disconnect
      socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.data.user.email}`);
      });
    });
  }

  // Broadcast auction end
  public async endAuction(auctionId: string) {
    try {
      const auction = await prisma.auction.findUnique({
        where: { id: auctionId },
        include: {
          bids: {
            orderBy: { amount: 'desc' },
            take: 1,
            include: {
              bidder: { select: { id: true, name: true, whatsapp: true } }
            }
          },
          seller: { select: { id: true, name: true, whatsapp: true } }
        }
      });

      if (!auction) return;

      // Update auction status
      await prisma.auction.update({
        where: { id: auctionId },
        data: { 
          status: 'ENDED',
          winningBidId: auction.bids[0]?.id
        }
      });

      // Broadcast to auction room
      this.io.to(`auction_${auctionId}`).emit('auction_ended', {
        auctionId,
        winningBid: auction.bids[0] || null,
        seller: auction.seller
      });

      console.log(`Auction ${auctionId} ended`);

      // TODO: Send WhatsApp notifications to winner and seller

    } catch (error) {
      console.error('Error ending auction:', error);
    }
  }

  // Send notification to specific user
  public sendNotificationToUser(userId: string, notification: any) {
    this.io.emit('user_notification', notification);
  }

  // Get Socket.IO instance
  public getIO() {
    return this.io;
  }
}

let socketManager: SocketManager | null = null;

export const initializeSocket = (server: HTTPServer) => {
  if (!socketManager) {
    socketManager = new SocketManager(server);
  }
  return socketManager;
};

export const getSocketManager = () => {
  if (!socketManager) {
    throw new Error('Socket manager not initialized');
  }
  return socketManager;
};