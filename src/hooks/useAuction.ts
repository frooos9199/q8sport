'use client';

import { useEffect, useState } from 'react';
import { useSocket } from './useSocket';

interface Bid {
  id: string;
  amount: number;
  bidder: {
    id: string;
    name: string;
  };
  createdAt: string;
}

interface AuctionData {
  id: string;
  title: string;
  currentPrice: number;
  endTime: string;
  status: string;
  bids: Bid[];
  totalBids: number;
}

interface UseAuctionOptions {
  auctionId: string;
  onNewBid?: (bid: Bid, auction: { id: string; currentPrice: number }) => void;
  onAuctionEnd?: (data: any) => void;
  onBidError?: (error: { message: string }) => void;
}

export const useAuction = (options: UseAuctionOptions) => {
  const { auctionId, onNewBid, onAuctionEnd, onBidError } = options;
  const [auctionData, setAuctionData] = useState<AuctionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [bidding, setBidding] = useState(false);

  const { socket, isConnected, emit, on } = useSocket({
    onConnect: () => {
      console.log('Connected to auction socket');
      // Join auction room when connected
      if (auctionId) {
        emit('join_auction', auctionId);
      }
    }
  });

  // Fetch initial auction data
  useEffect(() => {
    if (!auctionId) return;

    const fetchAuctionData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/auctions/${auctionId}`);
        if (response.ok) {
          const data = await response.json();
          setAuctionData(data);
        }
      } catch (error) {
        console.error('Error fetching auction:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAuctionData();
  }, [auctionId]);

  // Setup socket event listeners
  useEffect(() => {
    if (!socket || !isConnected) return;

    // Listen for new bids
    const unsubscribeNewBid = on?.('new_bid', (data: any) => {
      const { bid, auction } = data;
      
      // Update local auction data
      setAuctionData(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          currentPrice: auction.currentPrice,
          bids: [bid, ...prev.bids],
          totalBids: prev.totalBids + 1
        };
      });

      onNewBid?.(bid, auction);
    });

    // Listen for auction end
    const unsubscribeAuctionEnd = on?.('auction_ended', (data: any) => {
      setAuctionData(prev => {
        if (!prev) return prev;
        return { ...prev, status: 'ENDED' };
      });
      onAuctionEnd?.(data);
    });

    // Listen for bid errors
    const unsubscribeBidError = on?.('bid_error', (error: any) => {
      setBidding(false);
      onBidError?.(error);
    });

    // Listen for typing indicators
    const unsubscribeTyping = on?.('user_typing', (data: any) => {
      console.log(`${data.userName} is typing...`);
    });

    const unsubscribeStoppedTyping = on?.('user_stopped_typing', (data: any) => {
      console.log(`User ${data.userId} stopped typing`);
    });

    // Cleanup function
    return () => {
      unsubscribeNewBid?.();
      unsubscribeAuctionEnd?.();
      unsubscribeBidError?.();
      unsubscribeTyping?.();
      unsubscribeStoppedTyping?.();
    };
  }, [socket, isConnected, on, onNewBid, onAuctionEnd, onBidError]);

  // Join auction room when auctionId changes
  useEffect(() => {
    if (isConnected && auctionId) {
      emit('join_auction', auctionId);
      
      // Cleanup: leave room when component unmounts or auctionId changes
      return () => {
        emit('leave_auction', auctionId);
      };
    }
  }, [auctionId, isConnected, emit]);

  // Place a bid
  const placeBid = async (amount: number) => {
    if (!socket || !isConnected || !auctionId) {
      onBidError?.({ message: 'غير متصل بالخادم' });
      return false;
    }

    if (bidding) {
      onBidError?.({ message: 'يتم معالجة المزايدة السابقة' });
      return false;
    }

    setBidding(true);

    try {
      // First try via API for reliability
      const response = await fetch(`/api/auctions/${auctionId}/bid`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({ amount })
      });

      const result = await response.json();

      if (response.ok) {
        // Emit via socket for real-time updates
        emit('place_bid', { auctionId, amount });
        return true;
      } else {
        onBidError?.({ message: result.error || 'حدث خطأ في المزايدة' });
        return false;
      }
    } catch (error) {
      console.error('Error placing bid:', error);
      onBidError?.({ message: 'حدث خطأ في الاتصال' });
      return false;
    } finally {
      setBidding(false);
    }
  };

  // Get time remaining for auction
  const getTimeRemaining = () => {
    if (!auctionData?.endTime) return 0;
    
    const endTime = new Date(auctionData.endTime).getTime();
    const now = Date.now();
    return Math.max(0, endTime - now);
  };

  // Check if auction is expired
  const isExpired = () => {
    return getTimeRemaining() <= 0 || auctionData?.status === 'ENDED';
  };

  // Start typing indicator
  const startTyping = () => {
    if (isConnected && auctionId) {
      emit('typing_start', auctionId);
    }
  };

  // Stop typing indicator
  const stopTyping = () => {
    if (isConnected && auctionId) {
      emit('typing_stop', auctionId);
    }
  };

  return {
    auctionData,
    loading,
    bidding,
    isConnected,
    placeBid,
    getTimeRemaining,
    isExpired,
    startTyping,
    stopTyping
  };
};

export default useAuction;