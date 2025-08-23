
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Send, Users, Bell, History } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface BulkNotificationForm {
  type: 'NEW_COURSE_AVAILABLE' | 'PROMOTION' | 'SYSTEM_ANNOUNCEMENT';
  title: string;
  message: string;
  userIds: string[];
  courseId?: string;
  courseName?: string;
  courseDescription?: string;
  courseSlug?: string;
  sendEmail: boolean;
}

interface NotificationLog {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  sentAt: string;
  user: {
    id: string;
    name: string | null;
    email: string;
  };
}

export default function AdminNotificationsPage() {
  const [form, setForm] = useState<BulkNotificationForm>({
    type: 'SYSTEM_ANNOUNCEMENT',
    title: '',
    message: '',
    userIds: [],
    sendEmail: true,
  });
  
  const [users, setUsers] = useState<Array<{ id: string; name: string; email: string }>>([]);
  const [courses, setCourses] = useState<Array<{ id: string; title: string; slug: string; description: string }>>([]);
  const [notificationLogs, setNotificationLogs] = useState<NotificationLog[]>([]);
  const [sending, setSending] = useState(false);
  const [loadingLogs, setLoadingLogs] = useState(false);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users');
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users.map((user: any) => ({
          id: user.id,
          name: user.name || user.email,
          email: user.email
        })));
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await fetch('/api/admin/courses');
      if (response.ok) {
        const data = await response.json();
        setCourses(data.courses);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  const fetchNotificationLogs = async () => {
    try {
      setLoadingLogs(true);
      const response = await fetch('/api/admin/notifications?limit=20');
      if (response.ok) {
        const data = await response.json();
        setNotificationLogs(data.notifications);
      }
    } catch (error) {
      console.error('Error fetching notification logs:', error);
    } finally {
      setLoadingLogs(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.title.trim() || !form.message.trim()) {
      toast.error('El título y mensaje son requeridos');
      return;
    }

    try {
      setSending(true);
      const response = await fetch('/api/admin/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(`Notificaciones enviadas a ${data.count} usuarios`);
        
        // Reset form
        setForm({
          type: 'SYSTEM_ANNOUNCEMENT',
          title: '',
          message: '',
          userIds: [],
          sendEmail: true,
        });
        
        // Refresh logs
        fetchNotificationLogs();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Error al enviar notificaciones');
      }
    } catch (error) {
      console.error('Error sending notifications:', error);
      toast.error('Error al enviar notificaciones');
    } finally {
      setSending(false);
    }
  };

  const handleCourseSelect = (courseId: string) => {
    const course = courses.find(c => c.id === courseId);
    if (course) {
      setForm(prev => ({
        ...prev,
        courseId: course.id,
        courseName: course.title,
        courseDescription: course.description,
        courseSlug: course.slug,
      }));
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchCourses();
    fetchNotificationLogs();
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

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-8">
          <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10">
            <Send className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Envío Masivo de Notificaciones</h1>
            <p className="text-muted-foreground">
              Envía notificaciones a todos los usuarios o a grupos específicos
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Send Notification Form */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Bell className="w-5 h-5" />
                  <span>Nueva Notificación</span>
                </CardTitle>
                <CardDescription>
                  Crea y envía notificaciones a tus usuarios
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Type Selection */}
                  <div className="space-y-2">
                    <Label htmlFor="type">Tipo de notificación</Label>
                    <Select
                      value={form.type}
                      onValueChange={(value: any) => setForm(prev => ({ ...prev, type: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="NEW_COURSE_AVAILABLE">🆕 Nuevo curso disponible</SelectItem>
                        <SelectItem value="PROMOTION">💎 Promoción</SelectItem>
                        <SelectItem value="SYSTEM_ANNOUNCEMENT">📢 Anuncio del sistema</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Course Selection (only for NEW_COURSE_AVAILABLE) */}
                  {form.type === 'NEW_COURSE_AVAILABLE' && (
                    <div className="space-y-2">
                      <Label htmlFor="course">Curso relacionado</Label>
                      <Select onValueChange={handleCourseSelect}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona un curso" />
                        </SelectTrigger>
                        <SelectContent>
                          {courses.map((course) => (
                            <SelectItem key={course.id} value={course.id}>
                              {course.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* Title */}
                  <div className="space-y-2">
                    <Label htmlFor="title">Título</Label>
                    <Input
                      id="title"
                      value={form.title}
                      onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Título de la notificación"
                      maxLength={200}
                    />
                  </div>

                  {/* Message */}
                  <div className="space-y-2">
                    <Label htmlFor="message">Mensaje</Label>
                    <Textarea
                      id="message"
                      value={form.message}
                      onChange={(e) => setForm(prev => ({ ...prev, message: e.target.value }))}
                      placeholder="Contenido del mensaje"
                      rows={4}
                      maxLength={1000}
                    />
                    <p className="text-xs text-muted-foreground">
                      {form.message.length}/1000 caracteres
                    </p>
                  </div>

                  {/* Target Users */}
                  <div className="space-y-2">
                    <Label>Destinatarios</Label>
                    <div className="p-3 bg-muted rounded-md">
                      <div className="flex items-center space-x-2">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">
                          {form.userIds.length === 0 
                            ? `Todos los usuarios (${users.length})`
                            : `${form.userIds.length} usuarios seleccionados`
                          }
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Por defecto se enviará a todos los usuarios. En el futuro podrás seleccionar usuarios específicos.
                      </p>
                    </div>
                  </div>

                  {/* Email Option */}
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="sendEmail">Enviar también por email</Label>
                      <p className="text-xs text-muted-foreground">
                        Los usuarios recibirán un email además de la notificación en la plataforma
                      </p>
                    </div>
                    <Switch
                      id="sendEmail"
                      checked={form.sendEmail}
                      onCheckedChange={(checked) => setForm(prev => ({ ...prev, sendEmail: checked }))}
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={sending || !form.title.trim() || !form.message.trim()}
                    className="w-full"
                  >
                    {sending ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Enviando...</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <Send className="w-4 h-4" />
                        <span>Enviar Notificación</span>
                      </div>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Notification Logs */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <History className="w-5 h-5" />
                  <span>Historial de Notificaciones</span>
                </CardTitle>
                <CardDescription>
                  Últimas notificaciones enviadas a los usuarios
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                {loadingLogs ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-2 text-sm text-muted-foreground">Cargando historial...</p>
                  </div>
                ) : notificationLogs.length === 0 ? (
                  <div className="text-center py-8">
                    <History className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">No hay notificaciones registradas</p>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {notificationLogs.map((notification) => (
                      <div
                        key={notification.id}
                        className="flex items-start space-x-3 p-3 rounded-lg border bg-card"
                      >
                        <div className="text-sm flex-shrink-0">
                          {getNotificationIcon(notification.type)}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <p className="font-medium text-sm truncate">
                              {notification.title}
                            </p>
                            <div className="flex items-center space-x-2">
                              {!notification.isRead && (
                                <div className="w-2 h-2 bg-blue-500 rounded-full" />
                              )}
                            </div>
                          </div>
                          
                          <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                            {notification.message}
                          </p>
                          
                          <div className="flex items-center justify-between">
                            <Badge variant="secondary" className="text-xs">
                              {notification.user.name || notification.user.email}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(notification.sentAt), { 
                                addSuffix: true,
                                locale: es 
                              })}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
