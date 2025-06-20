// // src/components/pwa/PWAProvider.tsx
// import React, { useEffect, createContext, useContext, useCallback, useRef } from 'react';
// import { InstallPrompt } from './InstallPrompt';
// import { OfflineStatus } from './OfflineStatus';
// import { SyncStatus } from './SyncStatus';
// import { usePWA } from '../../hooks/usePWA';
// // import { usePushNotifications } from '~/hooks/usePushNotifications';
// import { pushNotificationService } from '~/services/pwa/pushNotificationService';
// import { getNotificationPermission, getSubscriptionStatus, requestNotificationPermission } from '~/utils/pwa';

// interface PWAContextType {
//   pwa: ReturnType<typeof usePWA>;
//   pushNotifications: ReturnType<typeof usePushNotifications>;
// }

// const PWAContext = createContext<PWAContextType | undefined>(undefined);

// export const usePWAContext = () => {
//   const context = useContext(PWAContext);
//   if (!context) {
//     throw new Error('usePWAContext must be used within PWAProvider');
//   }
//   return context;
// };

// interface PWAProviderProps {
//   children: React.ReactNode;
// }

// export const PWAProvider: React.FC<PWAProviderProps> = ({ children }) => {
//   const pwa = usePWA();
//   const pushNotifications = usePushNotifications();
//   const initializationRef = useRef({
//     push: false,
//     autoSubscribe: false,
//     mounted: false
//   });

//   // Chỉ khởi tạo Push Notification Service - KHÔNG đăng ký SW ở đây
//   useEffect(() => {
//     if (!initializationRef.current.mounted) {
//       initializationRef.current.mounted = true;

//       const initializePushService = async () => {
//         if (initializationRef.current.push) return;

//         try {
//           initializationRef.current.push = true;
//           console.log('PWA: Initializing push notification service...');

//           const success = await pushNotificationService.initialize();
//           if (success) {
//             console.log('PWA: Push notification service initialized successfully');

//             // Auto subscribe sau khi khởi tạo thành công
//             setTimeout(() => {
//               handleAutoSubscribe();
//             }, 2000);
//           } else {
//             console.warn('PWA: Push notification service failed to initialize');
//           }
//         } catch (error) {
//           console.error('PWA: Failed to initialize push service:', error);
//         }
//       };

//       // Delay để tránh conflict với SW registration
//       setTimeout(initializePushService, 1000);
//     }
//   }, []);

//   // Auto subscribe với better logic
//   const handleAutoSubscribe = useCallback(async () => {
//     if (initializationRef.current.autoSubscribe) return;

//     try {

//       // Kiểm tra permission
//      const permission = await requestNotificationPermission();
//       if (permission !== 'granted') {
//         console.log('PWA: Push permission denied, skipping auto subscribe');
//         return;
//       }

//       // Kiểm tra subscription status
//       const { isSubscribed } = await getSubscriptionStatus();
//       if (isSubscribed) {
//         console.log('PWA: Already subscribed to push notifications');
//         return;
//       }

//       // Chỉ auto subscribe nếu permission đã granted
//       if (permission === 'granted') {
//         initializationRef.current.autoSubscribe = true;
//         console.log('PWA: Attempting auto subscribe...');

//         const success = await pushNotificationService.subscribe();
//         if (success) {
//           console.log('PWA: Auto subscribed to push notifications successfully');
//         } else {
//           console.log('PWA: Auto subscribe failed');
//         }
//       } else {
//         console.log('PWA: Permission not granted, skipping auto subscribe');
//       }
//     } catch (error) {
//       console.error('PWA: Auto subscribe error:', error);
//     }
//   }, []);

//   const contextValue: PWAContextType = {
//     pwa,
//     pushNotifications
//   };

//   return (
//     <PWAContext.Provider value={contextValue}>
//       {children}

//       {/* PWA Components */}
//       <InstallPrompt />
//       <OfflineStatus />
//       <SyncStatus />
//     </PWAContext.Provider>
//   );
// };
