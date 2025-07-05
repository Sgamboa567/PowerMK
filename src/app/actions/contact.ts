'use server';

import nodemailer from 'nodemailer';

interface ContactFormData {
  name: string;
  email: string;
  subject?: string;
  message: string;
}

export async function submitContact(formData: ContactFormData) {
  console.log('Server Action ejecutada con datos:', formData);
  
  try {
    // Validar datos
    if (!formData.name || !formData.email || !formData.message) {
      return { 
        success: false, 
        error: 'Todos los campos son requeridos' 
      };
    }
    
    // Crear transporter para Gmail
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      }
    });
    
    // Verificar configuración SMTP
    try {
      await transporter.verify();
      console.log('Conexión SMTP verificada correctamente');
    } catch (smtpError) {
      console.error('Error al verificar conexión SMTP:', smtpError);
      return {
        success: false,
        error: 'Error al conectar con el servidor de correo'
      };
    }
    
    // Email para ti (el administrador)
    const adminMailOptions = {
      from: `"Formulario PowerMK" <${process.env.EMAIL_USER}>`,
      to: 'sgamboa765@gmail.com',
      replyTo: formData.email,
      subject: `Contacto PowerMK: ${formData.subject || 'Sin asunto'}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto; border: 1px solid #f0f0f0; border-radius: 5px;">
          <h2 style="color: #FF90B3;">Nuevo mensaje de contacto</h2>
          <p><strong>Nombre:</strong> ${formData.name}</p>
          <p><strong>Email:</strong> <a href="mailto:${formData.email}">${formData.email}</a></p>
          <p><strong>Asunto:</strong> ${formData.subject || 'Sin asunto'}</p>
          <p><strong>Mensaje:</strong></p>
          <div style="background-color: #f9f9f9; padding: 15px; border-left: 4px solid #FF90B3;">
            ${formData.message.replace(/\n/g, '<br>')}
          </div>
        </div>
      `
    };
    
    // Email para el remitente (confirmación)
    const senderMailOptions = {
      from: `"PowerMK" <${process.env.EMAIL_USER}>`,
      to: formData.email,
      subject: 'Hemos recibido tu mensaje - PowerMK',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto; border: 1px solid #f0f0f0; border-radius: 5px;">
          <h2 style="color: #FF90B3;">¡Gracias por contactarnos!</h2>
          <p>Hola ${formData.name},</p>
          <p>Hemos recibido tu mensaje y te responderemos lo antes posible.</p>
          <p>A continuación encontrarás una copia de tu mensaje:</p>
          
          <div style="background-color: #f9f9f9; padding: 15px; margin: 15px 0; border-radius: 4px;">
            <p><strong>Asunto:</strong> ${formData.subject || 'Sin asunto'}</p>
            <p><strong>Mensaje:</strong><br>${formData.message.replace(/\n/g, '<br>')}</p>
          </div>
          
          <p>Saludos cordiales,</p>
          <p><strong>El equipo de PowerMK</strong></p>
        </div>
      `
    };
    
    console.log('Enviando correos...');
    
    try {
      // Enviar correo al administrador
      const adminInfo = await transporter.sendMail(adminMailOptions);
      console.log('Correo enviado al administrador:', adminInfo.messageId);
      
      // Enviar correo al remitente
      const senderInfo = await transporter.sendMail(senderMailOptions);
      console.log('Correo enviado al remitente:', senderInfo.messageId);
      
      return {
        success: true,
        message: 'Mensaje enviado correctamente'
      };
    } catch (mailError: any) {
      console.error('Error al enviar correos:', mailError);
      return {
        success: false,
        error: 'Error al enviar el correo: ' + (mailError.message || 'Intente nuevamente')
      };
    }
  } catch (error: any) {
    console.error('Error en Server Action:', error);
    return {
      success: false,
      error: 'Error al procesar la solicitud: ' + (error.message || 'Intente nuevamente')
    };
  }
}