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

        const secret = process.env.JWT_SECRET;
        if (!secret) {
          throw new Error('JWT_SECRET is not configured');
        }

        const decoded = jwt.verify(token, secret) as { userId: string };
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
      // Join auction room
      socket.on('join_auction', (auctionId: string) => {
        socket.join(`auction_${auctionId}`);
      });

      // Leave auction room
      socket.on('leave_auction', (auctionId: string) => {
        socket.leave(`auction_${auctionId}`);
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

        } catch (error) {
          if (process.env.NODE_ENV === 'development') {
            console.error('Bid error:', error instanceof Error ? error.message : 'Unknown error');
          }
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
        // User disconnected - cleanup if needed
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

      // TODO: Send WhatsApp notifications to winner and seller

    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error ending auction:', error instanceof Error ? error.message : 'Unknown error');
      }
    }
  }

  // Send notification to specific user
  public sendNotificationToUser(userId: string, notification: Record<string, unknown>) {
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