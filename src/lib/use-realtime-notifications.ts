"use client";

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
  const token = useAuthStore((state) => state.token);

  // Fetch initial unread count
  useEffect(() => {
    if (!token) return;
    
    const fetchInitialCount = async () => {
      try {
        const { count } = await adminApi.getNotificationsCount({ isRead: false });
        setUnreadCount(count);
      } catch (error) {
        console.error("Failed to fetch notification count:", error);
      }
    };

    fetchInitialCount();
  }, [token]);

  useEffect(() => {
    if (!token) return;

    const socket: Socket = io((import.meta as any).env.VITE_SOCKET_URL || (import.meta as any).env.VITE_API_URL || "https://sales-app-backend-6o15.onrender.com", {
      auth: { token },
      transports: ["websocket"],
    });

    socket.on("connect", () => {
      console.log("Connected to WebSocket");
    });

    socket.on("admin-payment-request", (data: PaymentRequestNotification) => {
      setNotifications((prev) => [data, ...prev]);
      setUnreadCount((prev) => prev + 1);
    });

    socket.on("admin-suggestion-created", (data: any) => {
      setNotifications((prev) => [data, ...prev]);
      setUnreadCount((prev) => prev + 1);
    });

    socket.on("disconnect", () => {
      console.log("Disconnected from WebSocket");
    });

    return () => {
      socket.disconnect();
    };
  }, [token]);

  const markAsRead = useCallback(() => {
    setUnreadCount(0);
  }, []);

  return { notifications, unreadCount, markAsRead };
}