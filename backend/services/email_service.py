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
        print(f"\n{'='*50}")
        print(f"MOCK EMAIL SENT")
        print(f"To: {to_email}")
        print(f"Subject: {subject}")
        print(f"Body:\n{body}")
        print(f"{'='*50}\n")
        return True

    async def _send_smtp_email(self, to_email: str, subject: str, body: str) -> bool:
        """Real SMTP email service"""
        try:
            message = MIMEMultipart()
            message["From"] = settings.SMTP_FROM_EMAIL
            message["To"] = to_email
            message["Subject"] = subject
            message.attach(MIMEText(body, "plain"))

            await aiosmtplib.send(
                message,
                hostname=settings.SMTP_HOST,
                port=settings.SMTP_PORT,
                username=settings.SMTP_USER,
                password=settings.SMTP_PASSWORD,
                use_tls=True,
            )
            return True
        except Exception as e:
            logger.error(f"Failed to send email: {e}")
            return False

    async def send_otp_email(self, to_email: str, otp: str) -> bool:
        """Send OTP email"""
        subject = "Your Employee Portal Login OTP"
        body = f"""
        Your OTP for Employee Portal login is: {otp}
        
        This OTP will expire in {settings.OTP_EXPIRATION_MINUTES} minutes.
        
        If you did not request this OTP, please ignore this email.
        """
        return await self.send_email(to_email, subject, body)


email_service = EmailService()
