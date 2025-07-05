import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

// Asegúrate de que la respuesta siempre tenga los headers JSON correctos
const jsonResponse = (data: any, status = 200) => {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

export async function POST(request: Request) {
  console.log('Contact API route hit');
  try {
    // Parse JSON safely
    let data;
    try {
      data = await request.json();
    } catch (error) {
      console.error('Error parsing JSON:', error);
      return jsonResponse({ 
        success: false, 
        error: 'Invalid JSON data'
      }, 400);
    }
    
    const { name, email, subject, message } = data;
    console.log('Received form data:', { name, email, subject });
    
    // Validate input
    if (!name || !email || !message) {
      return jsonResponse({ 
        success: false, 
        error: 'Por favor complete todos los campos requeridos.' 
      }, 400);
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return jsonResponse({ 
        success: false, 
        error: 'Por favor ingrese un correo electrónico válido.' 
      }, 400);
    }
    
    // Para fines de prueba, simulemos una respuesta exitosa
    // Comenta esto en producción
    if (process.env.NODE_ENV === 'development') {
      console.log('DEV MODE: Simulando envío exitoso');
      return jsonResponse({ 
        success: true,
        message: 'Mensaje enviado con éxito (simulado)'
      });
    }

    // El resto del código para enviar correos electrónicos permanece igual...
    
    // Create transporter with better error handling
    let transporter;
    try {
      transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD,
        },
      });
    } catch (error) {
      console.error('Error creating transport:', error);
      return jsonResponse({ 
        success: false, 
        error: 'Error al configurar el servicio de correo' 
      }, 500);
    }
    
    // Verify SMTP configuration is working
    try {
      await transporter.verify();
      console.log('SMTP configuration verified successfully');
    } catch (error) {
      console.error('SMTP verification failed:', error);
      return jsonResponse({ 
        success: false, 
        error: 'Error al verificar la configuración de correo' 
      }, 500);
    }
    
    // 1. Email to admin (you)
    const adminMailOptions = {
      from: `"Formulario PowerMK" <${process.env.EMAIL_USER}>`,
      to: 'sgamboa765@gmail.com', // Your email
      replyTo: email, // Set reply-to as the sender's email for easy response
      subject: subject || `Nuevo mensaje de contacto de ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #f5dadf; border-radius: 10px;">
          <h2 style="color: #FF90B3; text-align: center; border-bottom: 2px solid #f5dadf; padding-bottom: 10px;">Nuevo Mensaje de Contacto - PowerMK</h2>
          
          <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 15px 0;">
            <p><strong>Nombre:</strong> ${name}</p>
            <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
            <p><strong>Asunto:</strong> ${subject || 'Sin asunto'}</p>
          </div>
          
          <div style="line-height: 1.6; margin: 20px 0;">
            <h3 style="color: #FF90B3;">Mensaje:</h3>
            <p style="background-color: #fff; padding: 15px; border-left: 4px solid #FF90B3; margin-top: 5px;">${message.replace(/\n/g, '<br>')}</p>
          </div>
          
          <div style="margin-top: 30px; padding-top: 15px; border-top: 1px solid #f5dadf; font-size: 12px; color: #666; text-align: center;">
            <p>Este correo fue enviado desde el formulario de contacto de PowerMK.</p>
            <p>Puedes responder directamente a este correo para contactar al remitente.</p>
          </div>
        </div>
      `
    };
    
    // 2. Confirmation email to sender
    const senderMailOptions = {
      from: `"PowerMK" <${process.env.EMAIL_USER}>`,
      to: email, // Sender's email
      subject: 'Gracias por contactarnos - PowerMK',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #f5dadf; border-radius: 10px;">
          <h2 style="color: #FF90B3; text-align: center; border-bottom: 2px solid #f5dadf; padding-bottom: 10px;">PowerMK</h2>
          
          <div style="line-height: 1.6; margin: 20px 0;">
            <p>Hola ${name},</p>
            <p>¡Gracias por ponerte en contacto con nosotros! Hemos recibido tu mensaje y te responderemos lo antes posible.</p>
            <p>A continuación encontrarás una copia de tu mensaje:</p>
            
            <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 15px 0;">
              <p><strong>Asunto:</strong> ${subject || 'Sin asunto'}</p>
              <p><strong>Mensaje:</strong></p>
              <p style="background-color: #fff; padding: 10px; border-left: 4px solid #FF90B3;">${message.replace(/\n/g, '<br>')}</p>
            </div>
            
            <p>Si tienes alguna consulta adicional, no dudes en responder este correo.</p>
            
            <p>¡Saludos cordiales!</p>
            <p>El equipo de PowerMK</p>
          </div>
          
          <div style="margin-top: 30px; padding-top: 15px; border-top: 1px solid #f5dadf; font-size: 12px; color: #666; text-align: center;">
            <p>© ${new Date().getFullYear()} PowerMK. Todos los derechos reservados.</p>
          </div>
        </div>
      `
    };
    
    // Log before sending emails
    console.log('Attempting to send emails...');
    
    // Send emails individually with better error handling
    try {
      // Send admin email
      const adminInfo = await transporter.sendMail(adminMailOptions);
      console.log('Admin email sent:', adminInfo.messageId);
      
      // Send confirmation email
      const senderInfo = await transporter.sendMail(senderMailOptions);
      console.log('Sender confirmation email sent:', senderInfo.messageId);
      
      return jsonResponse({ 
        success: true,
        message: 'Mensaje enviado con éxito'
      });
    } catch (error) {
      console.error('Error sending email:', error);
      return jsonResponse({ 
        success: false, 
        error: 'Error al enviar el correo electrónico'
      }, 500);
    }
  } catch (error) {
    console.error('Detailed error in contact API:', error);
    
    return jsonResponse({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Error al enviar el mensaje. Por favor intente de nuevo.'
    }, 500);
  }
}