
import type { EmailTemplate } from './email';

// Base template wrapper
const baseTemplate = (content: string, title?: string) => `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title || 'LMS Platform'}</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background-color: #f8f9fa;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: white;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 30px 40px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
      font-weight: 600;
    }
    .content {
      padding: 40px;
      line-height: 1.6;
      color: #333;
    }
    .button {
      display: inline-block;
      padding: 12px 24px;
      background-color: #667eea;
      color: white !important;
      text-decoration: none;
      border-radius: 6px;
      margin: 20px 0;
      font-weight: 500;
      transition: background-color 0.3s;
    }
    .button:hover {
      background-color: #5a6fd8;
    }
    .footer {
      padding: 20px 40px;
      background-color: #f8f9fa;
      border-top: 1px solid #e9ecef;
      text-align: center;
      color: #6c757d;
      font-size: 14px;
    }
    .course-card {
      border: 1px solid #e9ecef;
      border-radius: 6px;
      padding: 20px;
      margin: 20px 0;
      background-color: #f8f9fa;
    }
    .stats {
      display: flex;
      justify-content: space-around;
      text-align: center;
      margin: 20px 0;
    }
    .stat {
      flex: 1;
    }
    .stat-value {
      font-size: 24px;
      font-weight: bold;
      color: #667eea;
    }
    .stat-label {
      font-size: 14px;
      color: #6c757d;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎓 LMS Platform</h1>
    </div>
    <div class="content">
      ${content}
    </div>
    <div class="footer">
      <p>© 2025 LMS Platform. Todos los derechos reservados.</p>
      <p><a href="#" style="color: #667eea; text-decoration: none;">Configurar notificaciones</a> | <a href="#" style="color: #667eea; text-decoration: none;">Cancelar suscripción</a></p>
    </div>
  </div>
</body>
</html>
`;

export const emailTemplates = {
  welcome: (userName: string, loginUrl: string): EmailTemplate => ({
    subject: '¡Bienvenido a LMS Platform! 🎉',
    html: baseTemplate(`
      <h2>¡Hola ${userName}! 👋</h2>
      <p>¡Bienvenido a LMS Platform! Estamos emocionados de tenerte como parte de nuestra comunidad de aprendizaje.</p>
      
      <p>Con tu cuenta puedes:</p>
      <ul>
        <li>🎯 Acceder a cursos de alta calidad</li>
        <li>📊 Seguir tu progreso en tiempo real</li>
        <li>🏆 Obtener certificados oficiales</li>
        <li>💬 Interactuar con otros estudiantes</li>
      </ul>
      
      <div style="text-align: center;">
        <a href="${loginUrl}" class="button">Comenzar a Aprender</a>
      </div>
      
      <p>Si tienes alguna pregunta, no dudes en contactarnos. ¡Feliz aprendizaje!</p>
    `, '¡Bienvenido a LMS Platform!'),
    
    text: `¡Hola ${userName}! Bienvenido a LMS Platform. Visita ${loginUrl} para comenzar tu aprendizaje.`
  }),

  courseEnrollment: (userName: string, courseName: string, courseUrl: string): EmailTemplate => ({
    subject: `¡Te has inscrito en "${courseName}"! 📚`,
    html: baseTemplate(`
      <h2>¡Hola ${userName}! 🎓</h2>
      <p>¡Excelente noticia! Te has inscrito exitosamente en:</p>
      
      <div class="course-card">
        <h3 style="margin: 0 0 10px 0; color: #667eea;">${courseName}</h3>
        <p style="margin: 0; color: #6c757d;">Ya puedes comenzar con las lecciones</p>
      </div>
      
      <div style="text-align: center;">
        <a href="${courseUrl}" class="button">Comenzar el Curso</a>
      </div>
      
      <p>🎯 <strong>Consejo:</strong> Dedica al menos 30 minutos diarios para obtener los mejores resultados.</p>
      <p>¡Te deseamos mucho éxito en tu aprendizaje!</p>
    `, 'Nueva Inscripción'),
    
    text: `¡Hola ${userName}! Te has inscrito en "${courseName}". Accede en ${courseUrl}`
  }),

  courseCompletion: (userName: string, courseName: string, certificateUrl: string): EmailTemplate => ({
    subject: `🏆 ¡Felicidades! Has completado "${courseName}"`,
    html: baseTemplate(`
      <h2>¡Felicidades ${userName}! 🎉</h2>
      <p>Es un placer informarte que has completado exitosamente:</p>
      
      <div class="course-card">
        <h3 style="margin: 0 0 10px 0; color: #667eea;">✅ ${courseName}</h3>
        <p style="margin: 0; color: #28a745; font-weight: 500;">¡Curso completado al 100%!</p>
      </div>
      
      <p>🏆 <strong>¡Tu certificado está listo!</strong></p>
      <p>Puedes descargar tu certificado oficial y añadirlo a tu perfil profesional.</p>
      
      <div style="text-align: center;">
        <a href="${certificateUrl}" class="button">Descargar Certificado</a>
      </div>
      
      <p>¡Sigue aprendiendo y creciendo profesionalmente con nosotros!</p>
    `, '¡Curso Completado!'),
    
    text: `¡Felicidades ${userName}! Has completado "${courseName}". Descarga tu certificado en ${certificateUrl}`
  }),

  newCourse: (userName: string, courseName: string, courseDescription: string, courseUrl: string): EmailTemplate => ({
    subject: `🚀 Nuevo curso disponible: "${courseName}"`,
    html: baseTemplate(`
      <h2>¡Hola ${userName}! ✨</h2>
      <p>¡Tenemos un nuevo curso que podría interesarte!</p>
      
      <div class="course-card">
        <h3 style="margin: 0 0 10px 0; color: #667eea;">🆕 ${courseName}</h3>
        <p style="margin: 0; color: #6c757d;">${courseDescription}</p>
      </div>
      
      <p>Este curso ha sido diseñado para ayudarte a avanzar en tu carrera profesional.</p>
      
      <div style="text-align: center;">
        <a href="${courseUrl}" class="button">Ver Curso</a>
      </div>
      
      <p>🔥 <strong>¡Los primeros estudiantes obtienen acceso especial!</strong></p>
    `, 'Nuevo Curso Disponible'),
    
    text: `¡Hola ${userName}! Nuevo curso disponible: "${courseName}". Más info en ${courseUrl}`
  }),

  progressReminder: (userName: string, courseName: string, progressPercentage: number, courseUrl: string): EmailTemplate => ({
    subject: `📈 Continúa tu progreso en "${courseName}"`,
    html: baseTemplate(`
      <h2>¡Hola ${userName}! 📚</h2>
      <p>Te extrañamos en:</p>
      
      <div class="course-card">
        <h3 style="margin: 0 0 15px 0; color: #667eea;">${courseName}</h3>
        <div style="background-color: #e9ecef; height: 8px; border-radius: 4px; margin: 10px 0;">
          <div style="background-color: #667eea; height: 8px; border-radius: 4px; width: ${progressPercentage}%;"></div>
        </div>
        <p style="margin: 0; color: #6c757d; font-size: 14px;">Progreso: ${progressPercentage}% completado</p>
      </div>
      
      <p>🎯 <strong>¡Estás muy cerca de completarlo!</strong></p>
      <p>Solo dedica unos minutos hoy para continuar aprendiendo.</p>
      
      <div style="text-align: center;">
        <a href="${courseUrl}" class="button">Continuar Aprendiendo</a>
      </div>
      
      <p>💪 Recuerda: La consistencia es clave para el éxito.</p>
    `, 'Continúa tu Aprendizaje'),
    
    text: `¡Hola ${userName}! Continúa tu progreso en "${courseName}" (${progressPercentage}% completado). Accede en ${courseUrl}`
  }),

  certificateIssued: (userName: string, courseName: string, certificateNumber: string, certificateUrl: string): EmailTemplate => ({
    subject: `🏆 Certificado emitido para "${courseName}"`,
    html: baseTemplate(`
      <h2>¡Felicidades ${userName}! 🎓</h2>
      <p>Tu certificado oficial ha sido emitido exitosamente.</p>
      
      <div class="course-card">
        <h3 style="margin: 0 0 10px 0; color: #667eea;">🏆 ${courseName}</h3>
        <p style="margin: 5px 0; color: #6c757d;"><strong>Número de certificado:</strong> ${certificateNumber}</p>
        <p style="margin: 0; color: #28a745; font-weight: 500;">✅ Certificado verificado</p>
      </div>
      
      <div style="text-align: center;">
        <a href="${certificateUrl}" class="button">Descargar Certificado</a>
      </div>
      
      <p>📋 <strong>Qué puedes hacer con tu certificado:</strong></p>
      <ul>
        <li>Añadirlo a tu perfil de LinkedIn</li>
        <li>Incluirlo en tu currículum</li>
        <li>Compartirlo en redes sociales</li>
        <li>Presentarlo como evidencia de formación</li>
      </ul>
      
      <p>¡Sigue aprendiendo con nosotros!</p>
    `, 'Certificado Emitido'),
    
    text: `¡Felicidades ${userName}! Tu certificado para "${courseName}" está listo. Número: ${certificateNumber}. Descarga: ${certificateUrl}`
  })
};
