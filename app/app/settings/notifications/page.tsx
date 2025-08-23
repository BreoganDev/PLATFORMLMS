
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Settings, Mail, Bell, Save } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface NotificationPreferences {
  id: string;
  emailWelcome: boolean;
  emailCourseEnrollment: boolean;
  emailCourseCompletion: boolean;
  emailNewCourses: boolean;
  emailProgressReminders: boolean;
  emailCertificates: boolean;
  emailPromotions: boolean;
}

export default function NotificationSettingsPage() {
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchPreferences = async () => {
    try {
      const response = await fetch('/api/notifications/preferences');
      
      if (response.ok) {
        const data = await response.json();
        setPreferences(data);
      } else {
        toast.error('Error al cargar las preferencias');
      }
    } catch (error) {
      console.error('Error fetching preferences:', error);
      toast.error('Error al cargar las preferencias');
    } finally {
      setLoading(false);
    }
  };

  const savePreferences = async () => {
    if (!preferences) return;

    try {
      setSaving(true);
      const response = await fetch('/api/notifications/preferences', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(preferences),
      });

      if (response.ok) {
        toast.success('Preferencias actualizadas correctamente');
      } else {
        toast.error('Error al guardar las preferencias');
      }
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast.error('Error al guardar las preferencias');
    } finally {
      setSaving(false);
    }
  };

  const updatePreference = (key: keyof NotificationPreferences, value: boolean) => {
    if (!preferences) return;
    
    setPreferences({
      ...preferences,
      [key]: value,
    });
  };

  useEffect(() => {
    fetchPreferences();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Cargando configuración...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!preferences) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <p className="text-muted-foreground">Error al cargar las preferencias</p>
        </div>
      </div>
    );
  }

  const notificationTypes = [
    {
      key: 'emailWelcome' as keyof NotificationPreferences,
      title: 'Email de bienvenida',
      description: 'Recibir email cuando te registres en la plataforma',
      icon: '👋',
    },
    {
      key: 'emailCourseEnrollment' as keyof NotificationPreferences,
      title: 'Inscripción a cursos',
      description: 'Recibir confirmación cuando te inscribas en un curso',
      icon: '📚',
    },
    {
      key: 'emailCourseCompletion' as keyof NotificationPreferences,
      title: 'Finalización de cursos',
      description: 'Recibir felicitación cuando completes un curso',
      icon: '🎉',
    },
    {
      key: 'emailCertificates' as keyof NotificationPreferences,
      title: 'Certificados',
      description: 'Recibir notificación cuando se emita un certificado',
      icon: '🏆',
    },
    {
      key: 'emailNewCourses' as keyof NotificationPreferences,
      title: 'Nuevos cursos',
      description: 'Recibir información sobre nuevos cursos disponibles',
      icon: '🆕',
    },
    {
      key: 'emailProgressReminders' as keyof NotificationPreferences,
      title: 'Recordatorios de progreso',
      description: 'Recibir recordatorios para continuar con tus cursos',
      icon: '📈',
    },
    {
      key: 'emailPromotions' as keyof NotificationPreferences,
      title: 'Promociones y ofertas',
      description: 'Recibir información sobre descuentos y promociones',
      icon: '💎',
    },
  ];

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-8">
          <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10">
            <Settings className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Configuración de Notificaciones</h1>
            <p className="text-muted-foreground">
              Personaliza qué notificaciones quieres recibir
            </p>
          </div>
        </div>

        {/* Email Notifications Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Mail className="w-5 h-5" />
              <span>Notificaciones por Email</span>
            </CardTitle>
            <CardDescription>
              Configura qué emails quieres recibir para mantenerte informado sobre tu progreso y nuevas oportunidades de aprendizaje.
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {notificationTypes.map((type, index) => (
              <div key={type.key}>
                <div className="flex items-center justify-between space-x-4">
                  <div className="flex items-start space-x-3">
                    <span className="text-lg">{type.icon}</span>
                    <div className="space-y-1">
                      <Label htmlFor={type.key} className="text-base font-medium cursor-pointer">
                        {type.title}
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        {type.description}
                      </p>
                    </div>
                  </div>
                  
                  <Switch
                    id={type.key}
                    checked={Boolean(preferences[type.key])}
                    onCheckedChange={(checked) => updatePreference(type.key, checked)}
                  />
                </div>
                
                {index < notificationTypes.length - 1 && (
                  <Separator className="mt-6" />
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Information Card */}
        <Card className="mt-6 bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <Bell className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900 mb-1">
                  Acerca de las notificaciones
                </h4>
                <p className="text-sm text-blue-700">
                  Puedes cambiar estas configuraciones en cualquier momento. Las notificaciones te ayudan a mantenerte al día con tu progreso de aprendizaje y no perderte oportunidades importantes.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end mt-8">
          <Button
            onClick={savePreferences}
            disabled={saving}
            className="min-w-[120px]"
          >
            {saving ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Guardando...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Save className="w-4 h-4" />
                <span>Guardar cambios</span>
              </div>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
