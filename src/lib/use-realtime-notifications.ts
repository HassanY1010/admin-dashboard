import { useEffect, useState, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import { useAuthStore } from "./auth-store";
import adminApi from "./admin-api";

interface PaymentRequestNotification {
  id: string;
  user: {
    id: string;
    fullName: string;
    phoneNumber: string;
  };
  business?: {
    id: string;
    name: string;
  };
  amount: string;
  wallet: string;
  createdAt: string;
}

export function useRealtimeNotifications() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  // Fetch initial unread count from server
  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchInitialCount = async () => {
      try {
        const { count } = await adminApi.getNotificationsCount({ isRead: false });
        setUnreadCount(count);
      } catch {
        // Silently fail — non-critical
      }
    };

    fetchInitialCount();
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) return;

    const socket: Socket = io(
      (import.meta as any).env.VITE_SOCKET_URL ||
        (import.meta as any).env.VITE_API_URL ||
        "https://sales-app-backend-6o15.onrender.com",
      {
        withCredentials: true,
        transports: ["websocket"],
      },
    );

    socket.on("admin-payment-request", (data: PaymentRequestNotification) => {
      setNotifications((prev) => [data, ...prev]);
      setUnreadCount((prev) => prev + 1);
    });

    socket.on("notification:new", (data: any) => {
      setNotifications((prev) => [data, ...prev]);
      setUnreadCount((prev) => prev + 1);
    });

    socket.on("admin-suggestion-created", (data: any) => {
      setNotifications((prev) => [data, ...prev]);
      setUnreadCount((prev) => prev + 1);
    });

    return () => {
      socket.disconnect();
    };
  }, [isAuthenticated]);

  // FIX ADMIN-03: markAsRead also calls the server API to persist read state
  const markAsRead = useCallback(async () => {
    setUnreadCount(0);
    // Mark all unread notifications as read on the server
    try {
      const unread = await adminApi.getNotifications({ isRead: false, limit: 50 });
      await Promise.all(
        (unread.data || []).map((n: any) => adminApi.markNotificationAsRead(n.id)),
      );
    } catch {
      // Non-critical — local state already cleared
    }
  }, []);

  return { notifications, unreadCount, markAsRead };
}
