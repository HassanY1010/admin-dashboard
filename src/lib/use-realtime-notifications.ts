"use client";

import { useEffect, useState, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import { useAuthStore } from "./auth-store";

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
  const [notifications, setNotifications] = useState<PaymentRequestNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const token = useAuthStore((state) => state.token);

  useEffect(() => {
    if (!token) return;

    const socket: Socket = io((import.meta as any).env.VITE_SOCKET_URL || (import.meta as any).env.VITE_API_URL || "http://localhost:3000", {
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