"""
Quick script to help set up Gmail SMTP configuration
Run this script to create/update your .env file with Gmail settings
"""
import os
from pathlib import Path

def setup_gmail_env():
    """Interactive script to set up Gmail SMTP in .env file"""
    backend_dir = Path(__file__).parent
    env_file = backend_dir / ".env"
    
    print("=" * 70)
    print("Gmail SMTP Setup for EmpowerX")
    print("=" * 70)
    print()
    
    # Check if .env exists
    existing_config = {}
    if env_file.exists():
        print("Found existing .env file. Reading current configuration...")
        with open(env_file, 'r') as f:
            for line in f:
                line = line.strip()
                if '=' in line and not line.startswith('#'):
                    key, value = line.split('=', 1)
                    existing_config[key.strip()] = value.strip()
        print("Current EMAIL_MOCK_MODE:", existing_config.get('EMAIL_MOCK_MODE', 'not set'))
        print()
    
    # Get Gmail credentials
    print("Please provide your Gmail SMTP settings:")
    print("(You can get an App Password from: https://myaccount.google.com/apppasswords)")
    print()
    
    gmail_email = input("Gmail address (e.g., your-email@gmail.com): ").strip()
    if not gmail_email:
        print("Error: Gmail address is required")
        return
    
    app_password = input("Gmail App Password (16 characters): ").strip().replace(' ', '')
    if not app_password or len(app_password) != 16:
        print("Warning: App Password should be 16 characters. Continuing anyway...")
    
    # Read existing .env or create new
    env_lines = []
    if env_file.exists():
        with open(env_file, 'r') as f:
            env_lines = f.readlines()
    
    # Update or add email settings
    email_settings = {
        'EMAIL_MOCK_MODE': 'false',
        'SMTP_HOST': 'smtp.gmail.com',
        'SMTP_PORT': '587',
        'SMTP_USER': gmail_email,
        'SMTP_PASSWORD': app_password,
        'SMTP_FROM_EMAIL': gmail_email,
    }
    
    # Update existing lines or add new ones
    updated_keys = set()
    new_lines = []
    for line in env_lines:
        line_stripped = line.strip()
        if '=' in line_stripped and not line_stripped.startswith('#'):
            key = line_stripped.split('=', 1)[0].strip()
            if key in email_settings:
                new_lines.append(f"{key}={email_settings[key]}\n")
                updated_keys.add(key)
                continue
        new_lines.append(line)
    
    # Add missing settings
    for key, value in email_settings.items():
        if key not in updated_keys:
            new_lines.append(f"{key}={value}\n")
    
    # Write back to .env
    with open(env_file, 'w') as f:
        f.writelines(new_lines)
    
    print()
    print("=" * 70)
    print("✅ Gmail SMTP configuration updated!")
    print("=" * 70)
    print()
    print("Updated settings:")
    for key, value in email_settings.items():
        if key == 'SMTP_PASSWORD':
            print(f"  {key}=**** (hidden)")
        else:
            print(f"  {key}={value}")
    print()
    print("⚠️  IMPORTANT: Restart your backend server for changes to take effect!")
    print("   Run: uvicorn app.main:app --reload")
    print()
    print("📧 Test by logging in with employee number: JEREMY001")
    print("   OTP will be sent to: jeremyj2030@gmail.com")
    print()

if __name__ == "__main__":
    try:
        setup_gmail_env()
    except KeyboardInterrupt:
        print("\n\nSetup cancelled.")
    except Exception as e:
        print(f"\nError: {e}")
