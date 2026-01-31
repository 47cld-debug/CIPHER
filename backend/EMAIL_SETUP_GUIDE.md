# Email Setup Guide for EmpowerX

## Current Status

The user **Jeremy Joseph** has been created successfully:
- **Employee Number**: `JEREMY001`
- **Email**: `jeremyj2030@gmail.com`
- **Admin Access**: Yes

## Email Modes

### Mock Mode (Current - Default)
By default, the system runs in **mock mode**, which prints OTPs to the console. This is perfect for development and demos where you can see the OTP in the terminal.

**Current Configuration:**
- `EMAIL_MOCK_MODE=true` in `.env`

When you request an OTP, you'll see it printed in the backend console like this:
```
======================================================================
                    MOCK EMAIL SENT (DEMO MODE)
======================================================================
To: jeremyj2030@gmail.com
Subject: Your EmpowerX Login OTP
======================================================================
Body:
==========================================
        EMPOWERX LOGIN OTP
==========================================

Your One-Time Password (OTP) is:

            123456

This OTP will expire in 10 minutes.
...
```

### Real Email Mode (For Production/Demo)

To send actual emails to `jeremyj2030@gmail.com`, configure SMTP settings:

#### Option 1: Gmail SMTP (Recommended for Demo)

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate an App Password**:
   - Go to: https://myaccount.google.com/apppasswords
   - Select "Mail" and "Other (Custom name)"
   - Enter "EmpowerX" and generate
   - Copy the 16-character password

3. **Update `.env` file** in `backend/` directory:
```env
EMAIL_MOCK_MODE=false
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-16-char-app-password
SMTP_FROM_EMAIL=your-email@gmail.com
```

4. **Restart the backend server** for changes to take effect

#### Option 2: Other SMTP Providers

For other email providers (Outlook, SendGrid, etc.), update the SMTP settings accordingly:

**Outlook/Hotmail:**
```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
```

**SendGrid:**
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=your-sendgrid-api-key
```

## Testing

1. **Start the backend server**:
   ```bash
   cd backend
   uvicorn app.main:app --reload
   ```

2. **Login with Jeremy's credentials**:
   - Employee Number: `JEREMY001`
   - The OTP will be sent to `jeremyj2030@gmail.com`

3. **Check for OTP**:
   - **Mock Mode**: Check the backend console/terminal
   - **Real Email Mode**: Check the email inbox

## Notes

- OTP expires in 10 minutes (configurable via `OTP_EXPIRATION_MINUTES`)
- The OTP is stored in memory (or Redis if configured)
- For production, consider using a dedicated email service like SendGrid or AWS SES
