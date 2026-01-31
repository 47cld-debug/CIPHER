# Gmail SMTP Setup Guide for EmpowerX

This guide will help you configure Gmail SMTP to send OTP emails through Gmail.

## Prerequisites

- A Gmail account
- 2-Factor Authentication enabled on your Gmail account

## Step-by-Step Setup

### Step 1: Enable 2-Factor Authentication

1. Go to your Google Account: https://myaccount.google.com/
2. Click on **Security** in the left sidebar
3. Under "Signing in to Google", find **2-Step Verification**
4. Follow the prompts to enable 2-Factor Authentication if not already enabled

### Step 2: Generate an App Password

1. Go to: https://myaccount.google.com/apppasswords
   - If you can't access this link directly, go to your Google Account → Security → 2-Step Verification → App passwords
2. You may be asked to sign in again
3. Under "Select app", choose **Mail**
4. Under "Select device", choose **Other (Custom name)**
5. Enter **"EmpowerX"** as the custom name
6. Click **Generate**
7. **Copy the 16-character password** (it will look like: `abcd efgh ijkl mnop`)
   - ⚠️ **Important**: You won't be able to see this password again, so copy it now!

### Step 3: Configure Backend .env File

1. Navigate to the `backend` directory
2. Create or edit the `.env` file
3. Add or update the following settings:

```env
# Disable mock mode to send real emails
EMAIL_MOCK_MODE=false

# Gmail SMTP Settings
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=abcdefghijklmnop
SMTP_FROM_EMAIL=your-email@gmail.com
```

**Important Notes:**
- Replace `your-email@gmail.com` with your actual Gmail address
- Replace `abcdefghijklmnop` with the 16-character App Password you generated (remove spaces if any)
- The App Password should be 16 characters without spaces

### Step 4: Restart Backend Server

After updating the `.env` file, restart your backend server:

```bash
# Stop the current server (Ctrl+C)
# Then restart it
cd backend
uvicorn app.main:app --reload
```

### Step 5: Test the Configuration

1. Open the EmpowerX application
2. Try to login with employee number: `JEREMY001`
3. Check the email inbox for `jeremyj2030@gmail.com`
4. You should receive an OTP email from your Gmail account

## Troubleshooting

### Error: "SMTP Authentication failed"

**Possible causes:**
- Wrong App Password (make sure you copied the full 16-character password)
- 2-Factor Authentication not enabled
- Using regular Gmail password instead of App Password

**Solution:**
1. Generate a new App Password
2. Make sure 2FA is enabled
3. Double-check the password in `.env` (no extra spaces)

### Error: "SMTP_HOST is not configured"

**Solution:**
- Make sure `EMAIL_MOCK_MODE=false` in your `.env` file
- Verify all SMTP settings are present in `.env`

### Emails not arriving

**Check:**
1. Check spam/junk folder
2. Verify the recipient email address is correct
3. Check backend logs for error messages
4. Verify Gmail account is not locked or restricted

### Still seeing "MOCK EMAIL SENT" in console

**Solution:**
- Make sure `EMAIL_MOCK_MODE=false` (not `true`, not `True`, exactly `false`)
- Restart the backend server after changing `.env`
- Check that `.env` file is in the `backend/` directory

## Example .env Configuration

Here's a complete example `.env` file for Gmail:

```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/employee_portal
JWT_SECRET_KEY=your-secret-key-here
OPENAI_API_KEY=sk-your-openai-key

# Email Configuration - Gmail
EMAIL_MOCK_MODE=false
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=myemail@gmail.com
SMTP_PASSWORD=abcd efgh ijkl mnop
SMTP_FROM_EMAIL=myemail@gmail.com

OTP_EXPIRATION_MINUTES=10
```

## Security Notes

- **Never commit your `.env` file to version control**
- App Passwords are safer than using your main Gmail password
- Each App Password can be revoked individually if compromised
- Consider using a dedicated Gmail account for production

## Alternative: Using Other Email Providers

### Outlook/Hotmail
```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
```

### SendGrid
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=your-sendgrid-api-key
```

## Need Help?

If you're still having issues:
1. Check the backend console logs for detailed error messages
2. Verify all settings in `.env` are correct
3. Test with a simple email client first to verify SMTP credentials work
