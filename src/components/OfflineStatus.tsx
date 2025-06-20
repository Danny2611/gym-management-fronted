// src/components/OfflineStatus.tsx - Component hiển thị trạng thái offline
import React from 'react';
import { useOfflineStatus } from '~/utils/offline';
import { Wifi, WifiOff, Clock, CheckCircle } from 'lucide-react';

interface OfflineStatusProps {
  className?: string;
}

export const OfflineStatus: React.FC<OfflineStatusProps> = ({ className = '' }) => {
  const { isOnline, pendingActions } = useOfflineStatus();
  
  if (isOnline && pendingActions === 0) {
    return null; // Không hiển thị gì khi online và không có action pending
  }

  return (
    <div
      className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 ${className}`}
    >
      <div
        className={`flex items-center gap-2 px-4 py-2 rounded-lg shadow-lg text-white text-sm font-medium ${
          isOnline 
            ? 'bg-green-600' 
            : 'bg-red-600'
        }`}
      >
        {isOnline ? (
          <>
            <Wifi size={16} />
            <span>Đã kết nối</span>
            {pendingActions > 0 && (
              <>
                <div className="w-px h-4 bg-white/30" />
                <Clock size={16} />
                <span>{pendingActions} đang xử lý</span>
              </>
            )}
          </>
        ) : (
          <>
            <WifiOff size={16} />
            <span>Chế độ offline</span>
          </>
        )}
      </div>
    </div>
  );
};

// Component hiển thị banner offline toàn màn hình
export const OfflineBanner: React.FC = () => {
  const { isOnline, pendingActions, clearOfflineActions } = useOfflineStatus();
  
  if (isOnline) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full text-center">
        <div className="text-red-500 mb-4">
          <WifiOff size={48} className="mx-auto" />
        </div>
        
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Không có kết nối internet
        </h3>
        
        <p className="text-gray-600 mb-4">
          Ứng dụng đang hoạt động ở chế độ offline. Một số tính năng có thể bị hạn chế.
        </p>

        {pendingActions > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
            <div className="flex items-center justify-center gap-2 text-yellow-800">
              <Clock size={16} />
              <span className="text-sm">
                {pendingActions} hành động đang chờ đồng bộ
              </span>
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <button
            onClick={() => window.location.reload()}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-blue-700"
          >
            Thử lại
          </button>
          
          {pendingActions > 0 && (
            <button
              onClick={clearOfflineActions}
              className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-gray-700"
            >
              Xóa hàng đợi
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// Component nhỏ hiển thị trạng thái trong header/navbar
export const NetworkIndicator: React.FC = () => {
  const { isOnline, pendingActions } = useOfflineStatus();
  
  return (
    <div className="flex items-center gap-2">
      <div
        className={`w-2 h-2 rounded-full ${
          isOnline ? 'bg-green-500' : 'bg-red-500'
        }`}
        title={isOnline ? 'Đã kết nối' : 'Offline'}
      />
      
      {pendingActions > 0 && (
        <div
          className="flex items-center gap-1 text-xs text-yellow-600"
          title={`${pendingActions} hành động đang chờ đồng bộ`}
        >
          <Clock size={12} />
          <span>{pendingActions}</span>
        </div>
      )}
    </div>
  );
};

