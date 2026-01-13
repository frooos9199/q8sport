'use client';

import { useState, useEffect } from 'react';
import { Gavel, User, Loader2, AlertCircle, TrendingUp } from 'lucide-react';
import { useAuction } from '../hooks/useAuction';
import CountdownTimer from './CountdownTimer';

interface LiveBiddingProps {
  auctionId: string;
  initialAuction?: any;
}

interface BidFormData {
  amount: string;
  bidIncrement: number;
}

const BID_INCREMENTS = [50, 100, 250, 500, 1000];

export default function LiveBidding({ auctionId, initialAuction }: LiveBiddingProps) {
  const [bidForm, setBidForm] = useState<BidFormData>({
    amount: '',
    bidIncrement: 50
  });
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const {
    auctionData,
    loading,
    bidding,
    isConnected,
    placeBid,
    getTimeRemaining,
    isExpired
  } = useAuction({
    auctionId,
    onNewBid: (bid, auction) => {
      setSuccess(`مزايدة جديدة: ${bid.amount} دينار من ${bid.bidder.name}`);
      setTimeout(() => setSuccess(''), 5000);
      
      // Clear form if it's our bid
      const userId = localStorage.getItem('userId');
      if (bid.bidder.id === userId) {
        setBidForm({ ...bidForm, amount: '' });
      }
    },
    onAuctionEnd: (data) => {
      setSuccess('انتهى المزاد! 🎉');
    },
    onBidError: (error) => {
      setError(error.message);
      setTimeout(() => setError(''), 5000);
    }
  });

  const auction = auctionData || initialAuction;

  // Check authentication
  useEffect(() => {
    const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
    setIsLoggedIn(loggedIn);
  }, []);

  // Auto-suggest bid amount
  useEffect(() => {
    if (auction?.currentPrice && !bidForm.amount) {
      const suggestedAmount = Number(auction.currentPrice) + bidForm.bidIncrement;
      setBidForm(prev => ({ 
        ...prev, 
        amount: suggestedAmount.toString() 
      }));
    }
  }, [auction?.currentPrice, bidForm.bidIncrement, bidForm.amount]);

  const handleBidSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!isLoggedIn) {
      setError('يجب تسجيل الدخول للمزايدة');
      return;
    }

    const amount = parseFloat(bidForm.amount);
    if (isNaN(amount) || amount <= 0) {
      setError('مبلغ المزايدة غير صحيح');
      return;
    }

    if (amount <= auction.currentPrice) {
      setError(`المزايدة يجب أن تكون أعلى من ${auction.currentPrice} دينار`);
      return;
    }

    const success = await placeBid(amount);
    if (success) {
      setBidForm({ ...bidForm, amount: '' });
    }
  };

  const handleQuickBid = (increment: number) => {
    const newAmount = Number(auction.currentPrice) + increment;
    setBidForm({ ...bidForm, amount: newAmount.toString() });
  };

  const getMinBidAmount = () => {
    return auction?.currentPrice ? Number(auction.currentPrice) + 1 : 1;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-center h-32">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="mr-2 text-gray-600">جاري التحميل...</span>
        </div>
      </div>
    );
  }

  if (!auction) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center text-gray-500">
          المزاد غير موجود
        </div>
      </div>
    );
  }

  const isAuctionExpired = isExpired();

  return (
    <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <Gavel className="h-5 w-5 ml-2 text-blue-600" />
          المزايدة المباشرة
        </h3>
        <div className="flex items-center space-x-2 space-x-reverse">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span className={`text-xs ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
            {isConnected ? 'متصل' : 'غير متصل'}
          </span>
        </div>
      </div>

      {/* Current Price & Timer */}
      <div className="bg-gray-50 rounded-lg p-4 space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-600 mb-1">السعر الحالي</p>
            <p className="text-2xl font-bold text-green-600">
              {auction.currentPrice} د.ك
            </p>
          </div>
          <div className="text-left">
            <p className="text-sm text-gray-600 mb-1">الوقت المتبقي</p>
            <CountdownTimer 
              endTime={auction.endTime}
              onExpire={() => {
                setSuccess('انتهى المزاد!');
              }}
            />
          </div>
        </div>

        <div className="flex justify-between text-sm text-gray-600">
          <span>عدد المزايدات: {auction.totalBids || 0}</span>
          <span>السعر الأساسي: {auction.startingPrice} د.ك</span>
        </div>
      </div>

      {/* Bidding Form */}
      {!isAuctionExpired && (
        <div className="space-y-4">
          {!isLoggedIn ? (
            <div className="text-center bg-blue-50 p-4 rounded-lg">
              <p className="text-blue-800 mb-2">يجب تسجيل الدخول للمزايدة</p>
              <a 
                href="/auth" 
                className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
              >
                تسجيل الدخول
              </a>
            </div>
          ) : (
            <form onSubmit={handleBidSubmit} className="space-y-4">
              {/* Quick Bid Buttons */}
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">مزايدة سريعة:</p>
                <div className="flex flex-wrap gap-2">
                  {BID_INCREMENTS.map(increment => (
                    <button
                      key={increment}
                      type="button"
                      onClick={() => handleQuickBid(increment)}
                      className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200 transition"
                    >
                      +{increment}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Bid Amount */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  مبلغ المزايدة (د.ك)
                </label>
                <div className="flex space-x-2 space-x-reverse">
                  <input
                    type="number"
                    step="0.01"
                    min={getMinBidAmount()}
                    value={bidForm.amount}
                    onChange={(e) => setBidForm({ ...bidForm, amount: e.target.value })}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    placeholder="أدخل المبلغ"
                    disabled={bidding}
                  />
                  <button
                    type="submit"
                    disabled={bidding || !bidForm.amount}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center"
                  >
                    {bidding ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin ml-2" />
                        جاري المزايدة...
                      </>
                    ) : (
                      <>
                        <TrendingUp className="h-4 w-4 ml-2" />
                        زايد
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Status Messages */}
      {error && (
        <div className="flex items-center p-3 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="h-5 w-5 text-red-500 ml-2 flex-shrink-0" />
          <span className="text-red-700 text-sm">{error}</span>
        </div>
      )}

      {success && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
          <span className="text-green-700 text-sm">{success}</span>
        </div>
      )}

      {isAuctionExpired && (
        <div className="text-center bg-gray-100 p-4 rounded-lg">
          <p className="text-gray-600 font-medium">انتهى المزاد</p>
          {auction.winningBid && (
            <p className="text-sm text-gray-500 mt-1">
              الفائز: {auction.winningBid.bidder?.name} - {auction.winningBid.amount} د.ك
            </p>
          )}
        </div>
      )}

      {/* Recent Bids */}
      {auction.bids && auction.bids.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700 border-b pb-2">
            المزايدات الأخيرة
          </h4>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {auction.bids.slice(0, 5).map((bid: any, index: number) => (
              <div 
                key={bid.id} 
                className={`flex justify-between items-center p-2 rounded ${
                  index === 0 ? 'bg-green-50 border border-green-200' : 'bg-gray-50'
                }`}
              >
                <div className="flex items-center">
                  <User className="h-3 w-3 text-gray-400 ml-2" />
                  <span className="text-sm text-gray-700">{bid.bidder.name}</span>
                </div>
                <div className="text-left">
                  <span className={`text-sm font-medium ${
                    index === 0 ? 'text-green-600' : 'text-gray-600'
                  }`}>
                    {bid.amount} د.ك
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}