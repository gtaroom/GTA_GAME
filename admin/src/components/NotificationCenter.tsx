import React, { useState } from "react";
import { useNotifications } from "../context/NotificationContext";
import { format } from "date-fns";
import {
  WithdrawalRequestNotification,
  WithdrawalStatusNotification,
  PaymentNotification,
  GameAccountRequestNotification,
} from "../types/socket.types";

interface NotificationCenterProps {
  className?: string;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  className = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    dismissNotification,
  } = useNotifications();

  const toggleNotifications = () => {
    setIsOpen(!isOpen);
    if (!isOpen && unreadCount > 0) {
      markAllAsRead();
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    try {
      const date = new Date(timestamp);
      return format(date, "MMM d, h:mm a");
    } catch (error) {
      return "Unknown time";
    }
  };

  const renderNotificationContent = (
    notification:
      | WithdrawalRequestNotification
      | WithdrawalStatusNotification
      | PaymentNotification
      | GameAccountRequestNotification
  ) => {
    switch (notification.type) {
      case "withdrawal_request":
        return (
          <div>
            <p className="font-medium">New Withdrawal Request</p>
            <p className="text-sm">
              {notification.userName} ({notification.userEmail}) requested $
              {notification.amount}
            </p>
            {notification.gameName && (
              <p className="text-xs text-gray-600">
                Game: {notification.gameName}
              </p>
            )}
          </div>
        );
      case "recharge_request":
        return (
          <div>
            <p className="font-medium">New Deposit Request</p>
            <p className="text-sm">
              {notification.userName} ({notification.userEmail}) requested $
              {parseInt(notification.amount.toString()) / 100}
            </p>
            {notification.gameName && (
              <p className="text-xs text-gray-600">
                Game: {notification.gameName}
              </p>
            )}
          </div>
        );
      case "recharge_status_updated":
        return (
          <div>
            <p className="font-medium">Withdrawal Status Updated</p>
            <p className="text-sm">
              Your recharge request for $
              {parseInt(notification.amount.toString()) / 100}{" "}
              {notification.gameName ? "in " + notification.gameName : ""} is
              now <span className="font-bold">{notification.status}</span>.
            </p>
            <p className="text-xs text-gray-600">{notification.message}</p>
          </div>
        );
      case "withdrawal_status_updated":
        return (
          <div>
            <p className="font-medium">Withdrawal Status Updated</p>
            <p className="text-sm">
              Your withdrawal request for ${notification.amount} is now{" "}
              <span className="font-bold">{notification.status}</span>.
            </p>
            <p className="text-xs text-gray-600">{notification.message}</p>
          </div>
        );
      case "payment_received":
        return (
          <div>
            <p className="font-medium">Payment Received</p>
            <p className="text-sm">
              You received a payment of {notification.amount}{" "}
              {notification.currency} via {notification.paymentGateway}.
            </p>
          </div>
        );
      case "game_account_request":
        return (
          <div>
            <p className="font-medium">New Game Account Request</p>
            <p className="text-sm">
              {notification.userName} ({notification.userEmail}) requested game
              account. Please refresh the game account page to see the request.
            </p>
            {notification.gameName && (
              <p className="text-xs text-gray-600">
                Game: {notification.gameName}
              </p>
            )}
          </div>
        );
      default:
        return <p>Unknown notification type</p>;
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* Notification Icon */}
      <button
        onClick={toggleNotifications}
        className="relative p-2 text-gray-600 hover:text-gray-800 focus:outline-none"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0h-6"
          />
        </svg>

        {/* Notification Badge */}
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 h-5 w-5 text-xs flex items-center justify-center rounded-full bg-red-500 text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg overflow-hidden z-20">
          <div className="py-2 px-4 bg-gray-100 flex justify-between items-center">
            <span className="font-bold text-gray-800">Notifications</span>
            <button
              onClick={markAllAsRead}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Mark all as read
            </button>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="py-6 px-4 text-center text-gray-500">
                No notifications to display
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`border-b border-gray-200 ${
                    notification.read ? "bg-white" : "bg-blue-50"
                  }`}
                >
                  <div className="px-4 py-3 hover:bg-gray-50">
                    <div className="flex justify-between">
                      {renderNotificationContent(notification)}
                      <button
                        onClick={() => dismissNotification(notification.id)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>
                    <div className="mt-1 text-xs text-gray-500">
                      {formatTimestamp(notification.timestamp)}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
