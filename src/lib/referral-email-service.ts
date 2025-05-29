import { prisma } from '@/lib/prisma';
import nodemailer from 'nodemailer';

// Usar a mesma configuração de email existente
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: 465,
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD
  }
});

/**
 * Envia notificação quando uma nova indicação é recebida
 */
export async function sendReferralNotification(leadId: string) {
  try {
    const lead = await prisma.referralLead.findUnique({
      where: { id: leadId },
      include: {
        referrer: { select: { name: true, email: true } },
        doctor: { select: { name: true, email: true } }
      }
    });

    if (!lead || !lead.doctor.email || !lead.referrer.email) {
      console.error('Lead não encontrado ou emails inválidos:', leadId);
      return;
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    // Email para o médico
    await transporter.sendMail({
      from: {
        name: 'BOOP',
        address: process.env.SMTP_FROM as string
      },
      to: lead.doctor.email,
      subject: `Nova indicação recebida - ${lead.name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #1e293b;">Nova Indicação Recebida! 🎉</h2>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #374151; margin-top: 0;">Dados do Lead:</h3>
            <p><strong>Nome:</strong> ${lead.name}</p>
            <p><strong>Email:</strong> ${lead.email}</p>
            <p><strong>Telefone:</strong> ${lead.phone || 'Não informado'}</p>
            <p><strong>Indicado por:</strong> ${lead.referrer.name} (${lead.referrer.email})</p>
            <p><strong>Status:</strong> ${lead.status === 'CONVERTED' ? 'Já é paciente' : 'Aguardando contato'}</p>
          </div>
          
          ${lead.status === 'CONVERTED' ? 
            '<div style="background: #d4edda; padding: 15px; border-radius: 8px; margin: 20px 0;"><p style="color: #155724; margin: 0;"><strong>✅ Esta pessoa já é seu paciente!</strong> O crédito foi automaticamente concedido ao indicador.</p></div>' :
            '<p>Entre em contato com este lead e atualize o status no painel administrativo.</p>'
          }
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${baseUrl}/doctor/referrals" 
               style="display: inline-block; padding: 12px 24px; background: #3b82f6; color: white; text-decoration: none; border-radius: 6px; font-weight: bold;">
              Gerenciar Indicações
            </a>
          </div>
          
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">
          <p style="color: #64748b; font-size: 12px; text-align: center;">
            BOOP - Sistema de Indicações<br>
            Este é um email automático, não responda.
          </p>
        </div>
      `
    });

    // Email para quem indicou
    if (lead.status === 'PENDING') {
      await transporter.sendMail({
        from: {
          name: 'BOOP',
          address: process.env.SMTP_FROM as string
        },
        to: lead.referrer.email,
        subject: 'Sua indicação foi recebida!',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #1e293b;">Obrigado pela indicação! 🙏</h2>
            
            <p style="color: #374151; font-size: 16px;">
              Sua indicação de <strong>${lead.name}</strong> foi recebida com sucesso.
            </p>
            
            <div style="background: #e7f3ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #1e40af; margin-top: 0;">O que acontece agora?</h3>
              <ul style="color: #1e40af; margin: 0; padding-left: 20px;">
                <li>Nossa equipe entrará em contato com ${lead.name}</li>
                <li>Quando a pessoa se tornar paciente, você ganhará créditos</li>
                <li>Use os créditos para resgatar recompensas especiais</li>
              </ul>
            </div>
            
            <div style="background: #f0f9ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="color: #0369a1; margin: 0;"><strong>💡 Dica:</strong> Continue indicando amigos e familiares para acumular mais créditos!</p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${baseUrl}/referrals" 
                 style="display: inline-block; padding: 12px 24px; background: #059669; color: white; text-decoration: none; border-radius: 6px; font-weight: bold;">
                Ver Minhas Indicações
              </a>
            </div>
          </div>
        `
      });
    } else if (lead.status === 'CONVERTED') {
      // Se já convertido, enviar email de parabéns
      await transporter.sendMail({
        from: {
          name: 'BOOP',
          address: process.env.SMTP_FROM as string
        },
        to: lead.referrer.email,
        subject: 'Sua indicação já era paciente! Você ganhou créditos! 🎉',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #1e293b;">Parabéns! Você ganhou créditos! 🎉</h2>
            
            <p style="color: #374151; font-size: 16px;">
              Sua indicação de <strong>${lead.name}</strong> já era paciente da clínica!
            </p>
            
            <div style="background: #d4edda; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
              <h3 style="color: #155724; margin: 0 0 10px 0;">+ 1 Crédito</h3>
              <p style="color: #155724; margin: 0;">Adicionado à sua conta automaticamente</p>
            </div>
            
            <p style="color: #374151;">
              Use seus créditos para resgatar recompensas especiais oferecidas pelo seu médico!
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${baseUrl}/referrals" 
                 style="display: inline-block; padding: 12px 24px; background: #28a745; color: white; text-decoration: none; border-radius: 6px; font-weight: bold;">
                Ver Meus Créditos
              </a>
            </div>
          </div>
        `
      });
    }

    // Marcar email como enviado
    await prisma.referralLead.update({
      where: { id: leadId },
      data: {
        emailSent: true,
        emailSentAt: new Date()
      }
    });

    console.log('Notificações de indicação enviadas com sucesso para lead:', leadId);
  } catch (error) {
    console.error('Erro ao enviar notificação de indicação:', error);
  }
}

/**
 * Envia notificação quando créditos são concedidos
 */
export async function sendCreditNotification(creditId: string) {
  try {
    const credit = await prisma.referralCredit.findUnique({
      where: { id: creditId },
      include: {
        user: { select: { name: true, email: true } },
        lead: { select: { name: true } }
      }
    });

    if (!credit || !credit.user.email) {
      console.error('Crédito não encontrado ou email inválido:', creditId);
      return;
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    await transporter.sendMail({
      from: {
        name: 'BOOP',
        address: process.env.SMTP_FROM as string
      },
      to: credit.user.email,
      subject: `Você ganhou ${credit.amount} crédito(s)! 🎉`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #1e293b;">Parabéns! Você ganhou créditos! 🎉</h2>
          
          <p style="color: #374151; font-size: 16px;">
            ${credit.lead ? 
              `Sua indicação de <strong>${credit.lead.name}</strong> se tornou paciente!` :
              'Você recebeu créditos!'
            }
          </p>
          
          <div style="background: #d4edda; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
            <h3 style="color: #155724; margin: 0 0 10px 0;">+ ${credit.amount} Crédito(s)</h3>
            <p style="color: #155724; margin: 0;">Adicionados à sua conta</p>
          </div>
          
          <p style="color: #374151;">
            Use seus créditos para resgatar recompensas especiais oferecidas pelo seu médico!
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${baseUrl}/referrals" 
               style="display: inline-block; padding: 12px 24px; background: #28a745; color: white; text-decoration: none; border-radius: 6px; font-weight: bold;">
              Ver Meus Créditos
            </a>
          </div>
          
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">
          <p style="color: #64748b; font-size: 12px; text-align: center;">
            BOOP - Sistema de Indicações<br>
            Este é um email automático, não responda.
          </p>
        </div>
      `
    });

    console.log('Notificação de crédito enviada com sucesso para:', credit.user.email);
  } catch (error) {
    console.error('Erro ao enviar notificação de crédito:', error);
  }
} 