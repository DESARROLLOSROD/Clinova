'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Bell } from 'lucide-react';
import { Notification } from '@/types/notification';
import { format } from 'date-fns';

export function NotificationBell({ userEmail }: { userEmail?: string }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);

  const fetchAndSubscribe = useCallback(async () => {
    if (!userEmail) return;

    const supabase = createClient();

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Fetch unread notifications
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .is('read_at', null)
      .order('created_at', { ascending: false })
      .limit(10);

    if (!error && data) {
      setNotifications(data);
      setUnreadCount(data.length);
    }

    // Set up real-time subscription with the actual userId
    const channel = supabase
      .channel(`notifications-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          setNotifications((prev) => [payload.new as Notification, ...prev]);
          setUnreadCount((prev) => prev + 1);
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [userEmail]);

  useEffect(() => {
    const cleanup = fetchAndSubscribe();
    return () => {
      cleanup.then((unsub) => unsub?.());
    };
  }, [fetchAndSubscribe]);

  async function markAsRead(notificationId: string) {
    const supabase = createClient();
    await supabase
      .from('notifications')
      .update({ read_at: new Date().toISOString() })
      .eq('id', notificationId);

    setNotifications((prev) =>
      prev.filter((n) => n.id !== notificationId)
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  }

  if (!userEmail) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {showDropdown && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowDropdown(false)}
          />
          <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-20 max-h-96 overflow-y-auto">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-sm font-semibold text-gray-900">Notificaciones</h3>
            </div>
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500 text-sm">
                No tienes notificaciones nuevas
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className="p-4 hover:bg-gray-50 cursor-pointer bg-blue-50"
                    onClick={() => markAsRead(notification.id)}
                  >
                    <div className="flex justify-between items-start">
                      <h4 className="text-sm font-medium text-gray-900">
                        {notification.title}
                      </h4>
                      <span className="h-2 w-2 bg-blue-500 rounded-full flex-shrink-0 mt-1" />
                    </div>
                    <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                      {notification.message}
                    </p>
                    <p className="text-xs text-gray-400 mt-2">
                      {format(new Date(notification.created_at), 'dd/MM/yyyy HH:mm')}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
