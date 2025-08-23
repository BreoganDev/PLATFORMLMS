
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Bell, Settings, Check, CheckCheck } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { es } from 'date-fns/locale';
import Link from 'next/link';
import { toast } from 'react-hot-toast';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  sentAt: string;
  metadata?: any;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async (offset = 0) => {
    try {
      if (offset === 0) setLoading(true);
      else setLoadingMore(true);

      const response = await fetch(`/api/notifications?limit=20&offset=${offset}`);
      
      if (response.ok) {
        const data = await response.json();
        
        if (offset === 0) {
          setNotifications(data.notifications);
          setUnreadCount(data.unreadCount);
        } else {
          setNotifications(prev => [...prev, ...data.notifications]);
        }
        
        setHasMore(data.hasMore);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast.error('Error al cargar las notificaciones');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'PATCH',
      });

      if (response.ok) {
        setNotifications(prev =>
          prev.map(notification =>
            notification.id === notificationId
              ? { ...notification, isRead: true }
              : notification
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast.error('Error al marcar como leída');
    }
  };

  const markAllAsRead = async () => {
    const unreadNotifications = notifications.filter(n => !n.isRead);
    
    try {
      await Promise.all(
        unreadNotifications.map(notification =>
          fetch(`/api/notifications/${notification.id}/read`, {
            method: 'PATCH',
          })
        )
      );

      setNotifications(prev =>
        prev.map(notification => ({ ...notification, isRead: true }))
      );
      setUnreadCount(0);
      toast.success('Todas las notificaciones marcadas como leídas');
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      toast.error('Error al marcar todas como leídas');
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const getNotificationIcon = (type: string) => {
    const iconMap: Record<string, string> = {
      WELCOME: '👋',
      COURSE_ENROLLMENT: '📚',
      COURSE_COMPLETION: '🎉',
      NEW_COURSE_AVAILABLE: '🆕',
      PROGRESS_REMINDER: '📈',
      CERTIFICATE_ISSUED: '🏆',
      PROMOTION: '💎',
      SYSTEM_ANNOUNCEMENT: '📢',
    };
    return iconMap[type] || '🔔';
  };

  const getNotificationColor = (type: string) => {
    const colorMap: Record<string, string> = {
      WELCOME: 'bg-blue-50 border-blue-200',
      COURSE_ENROLLMENT: 'bg-green-50 border-green-200',
      COURSE_COMPLETION: 'bg-yellow-50 border-yellow-200',
      NEW_COURSE_AVAILABLE: 'bg-purple-50 border-purple-200',
      PROGRESS_REMINDER: 'bg-orange-50 border-orange-200',
      CERTIFICATE_ISSUED: 'bg-emerald-50 border-emerald-200',
      PROMOTION: 'bg-pink-50 border-pink-200',
      SYSTEM_ANNOUNCEMENT: 'bg-gray-50 border-gray-200',
    };
    return colorMap[type] || 'bg-gray-50 border-gray-200';
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Cargando notificaciones...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10">
              <Bell className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Notificaciones</h1>
              <p className="text-muted-foreground">
                Mantente al día con todas tus actividades
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {unreadCount > 0 && (
              <Button
                variant="outline"
                onClick={markAllAsRead}
                className="flex items-center space-x-2"
              >
                <CheckCheck className="w-4 h-4" />
                <span>Marcar todas como leídas</span>
              </Button>
            )}
            <Button asChild variant="outline">
              <Link href="/settings/notifications">
                <Settings className="w-4 h-4 mr-2" />
                Configurar
              </Link>
            </Button>
          </div>
        </div>

        {/* Stats */}
        {unreadCount > 0 && (
          <Card className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center space-x-4">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100">
                  <Badge variant="secondary" className="bg-blue-500 text-white">
                    {unreadCount}
                  </Badge>
                </div>
                <div>
                  <p className="font-medium text-blue-900">
                    Tienes {unreadCount} notificación{unreadCount !== 1 ? 'es' : ''} sin leer
                  </p>
                  <p className="text-sm text-blue-700">
                    Revisa tus actualizaciones más recientes
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Notifications List */}
        {notifications.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <div className="flex flex-col items-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                  <Bell className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium">No hay notificaciones</h3>
                <p className="text-muted-foreground max-w-md">
                  Cuando tengas nuevas actividades o actualizaciones, las verás aquí.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {notifications.map((notification) => (
              <Card
                key={notification.id}
                className={`transition-all duration-200 hover:shadow-md cursor-pointer ${
                  notification.isRead ? 'opacity-75' : getNotificationColor(notification.type)
                }`}
                onClick={() => !notification.isRead && markAsRead(notification.id)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="text-2xl flex-shrink-0">
                      {getNotificationIcon(notification.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-lg leading-6">
                          {notification.title}
                        </h3>
                        <div className="flex items-center space-x-2 ml-4">
                          {!notification.isRead && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full" />
                          )}
                          <span className="text-sm text-muted-foreground whitespace-nowrap">
                            {formatDistanceToNow(new Date(notification.sentAt), { 
                              addSuffix: true,
                              locale: es 
                            })}
                          </span>
                        </div>
                      </div>
                      
                      <p className="text-muted-foreground leading-relaxed mb-3">
                        {notification.message}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(notification.sentAt), 'PPP p', { locale: es })}
                        </span>
                        
                        {!notification.isRead && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              markAsRead(notification.id);
                            }}
                            className="text-xs"
                          >
                            <Check className="w-3 h-3 mr-1" />
                            Marcar como leída
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {/* Load More Button */}
            {hasMore && (
              <div className="text-center pt-4">
                <Button
                  variant="outline"
                  onClick={() => fetchNotifications(notifications.length)}
                  disabled={loadingMore}
                >
                  {loadingMore ? 'Cargando...' : 'Cargar más notificaciones'}
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
