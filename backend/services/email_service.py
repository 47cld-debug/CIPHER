import logging
from typing import Optional
from app.config import settings
import aiosmtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

logger = logging.getLogger(__name__)


class EmailService:
    def __init__(self):
        self.mock_mode = settings.EMAIL_MOCK_MODE

    async def send_email(self, to_email: str, subject: str, body: str) -> bool:
        """Send email - mock or real SMTP"""
        if self.mock_mode:
            return await self._send_mock_email(to_email, subject, body)
        else:
            return await self._send_smtp_email(to_email, subject, body)

    async def _send_mock_email(self, to_email: str, subject: str, body: str) -> bool:
        """Mock email service - logs to console"""
        logger.info(f"[MOCK EMAIL] To: {to_email}")
        logger.info(f"[MOCK EMAIL] Subject: {subject}")
        logger.info(f"[MOCK EMAIL] Body: {body}")
        print(f"\n{'='*70}")
        print(f"{' '*20}MOCK EMAIL SENT (DEMO MODE)")
        print(f"{'='*70}")
        print(f"To: {to_email}")
        print(f"Subject: {subject}")
        print(f"{'='*70}")
        print(f"Body:")
        print(body)
        print(f"{'='*70}")
        print(f"\nNOTE: To send real emails, set EMAIL_MOCK_MODE=false in .env")
        print(f"      and configure SMTP settings (SMTP_HOST, SMTP_USER, etc.)\n")
        return True

    async def _send_smtp_email(self, to_email: str, subject: str, body: str) -> bool:
        """Real SMTP email service"""
        try:
            # Validate SMTP settings
            if not settings.SMTP_HOST:
                logger.error("SMTP_HOST is not configured")
                return False
            if not settings.SMTP_USER:
                logger.error("SMTP_USER is not configured")
                return False
            if not settings.SMTP_PASSWORD:
                logger.error("SMTP_PASSWORD is not configured")
                return False

            message = MIMEMultipart()
            message["From"] = settings.SMTP_FROM_EMAIL
            message["To"] = to_email
            message["Subject"] = subject
            message.attach(MIMEText(body, "plain"))

            logger.info(f"Sending email via SMTP to {to_email} using {settings.SMTP_HOST}")
            
            await aiosmtplib.send(
                message,
                hostname=settings.SMTP_HOST,
                port=settings.SMTP_PORT,
                username=settings.SMTP_USER,
                password=settings.SMTP_PASSWORD,
                use_tls=True,
            )
            
            logger.info(f"Email sent successfully to {to_email}")
            return True
        except aiosmtplib.SMTPAuthenticationError as e:
            logger.error(f"SMTP Authentication failed: {e}")
            logger.error("Please check your SMTP_USER and SMTP_PASSWORD. For Gmail, make sure you're using an App Password, not your regular password.")
            return False
        except aiosmtplib.SMTPException as e:
            logger.error(f"SMTP error: {e}")
            return False
        except Exception as e:
            logger.error(f"Failed to send email: {e}")
            return False

    async def send_otp_email(self, to_email: str, otp: str) -> bool:
        """Send OTP email"""
        subject = "Your EmpowerX Login OTP"
        body = f"""
==========================================
        EMPOWERX LOGIN OTP
==========================================

Your One-Time Password (OTP) is:

            {otp}

This OTP will expire in {settings.OTP_EXPIRATION_MINUTES} minutes.

Please enter this code on the verification page to complete your login.

If you did not request this OTP, please ignore this email.

==========================================
        """
        return await self.send_email(to_email, subject, body)


email_service = EmailService()
