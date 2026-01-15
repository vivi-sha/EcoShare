# EmailJS Admin Notification Template Setup Guide

## Problem
Currently, when users submit the contact form:
- ✅ Users receive an auto-reply confirmation
- ❌ You (admin) don't receive the actual message

## Solution
Create a second EmailJS template to send you (the admin) a notification with the user's message.

---

## Step-by-Step Instructions

### 1. Go to EmailJS Dashboard
- Visit: https://dashboard.emailjs.com/
- Log in with your account

### 2. Navigate to Email Templates
- Click on **"Email Templates"** in the left sidebar
- Click **"Create New Template"** button

### 3. Create Admin Notification Template

#### Template Settings:
- **Template Name**: `Admin Contact Form Notification`
- **Template ID**: `template_admin_notify` (IMPORTANT: Use this exact ID)

#### Template Content:

**Subject Line:**
```
New Contact Form Message: {{subject}}
```

**Email Body (HTML):**
```html
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb; border-radius: 8px;">
    <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; border-radius: 8px 8px 0 0; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 24px;">🌿 New Contact Form Submission</h1>
    </div>
    
    <div style="background-color: white; padding: 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <h2 style="color: #1f2937; margin-top: 0;">Message Details</h2>
        
        <div style="margin: 20px 0; padding: 15px; background-color: #f3f4f6; border-left: 4px solid #10b981; border-radius: 4px;">
            <p style="margin: 5px 0;"><strong>From:</strong> {{from_name}}</p>
            <p style="margin: 5px 0;"><strong>Email:</strong> <a href="mailto:{{from_email}}" style="color: #10b981;">{{from_email}}</a></p>
            <p style="margin: 5px 0;"><strong>Subject:</strong> {{subject}}</p>
        </div>
        
        <div style="margin: 20px 0;">
            <h3 style="color: #1f2937; margin-bottom: 10px;">Message:</h3>
            <div style="background-color: #f9fafb; padding: 15px; border-radius: 4px; border: 1px solid #e5e7eb;">
                <p style="margin: 0; white-space: pre-wrap; color: #374151;">{{message}}</p>
            </div>
        </div>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 14px;">
            <p>This message was sent via the EcoShare Contact Form</p>
            <p style="margin: 5px 0;">Reply directly to: <a href="mailto:{{from_email}}" style="color: #10b981;">{{from_email}}</a></p>
        </div>
    </div>
</div>
```

### 4. Configure Template Settings

In the **Settings** section of the template:

- **To Email**: `ecosharetbyu@gmail.com` (or use `{{to_email}}` if you want it dynamic)
- **From Name**: `EcoShare Contact Form`
- **Reply To**: `{{from_email}}` (This allows you to reply directly to the user)

### 5. Test the Template

Click **"Test It"** and fill in sample values:
- `from_name`: John Doe
- `from_email`: john@example.com
- `subject`: General Inquiry
- `message`: This is a test message
- `to_email`: ecosharetbyu@gmail.com

Check your inbox to verify the email looks correct.

### 6. Save the Template

Click **"Save"** to save your template.

---

## Verification Checklist

After setup, verify:
- [ ] Template ID is exactly `template_admin_notify`
- [ ] Template includes all variables: `{{from_name}}`, `{{from_email}}`, `{{subject}}`, `{{message}}`
- [ ] "To Email" is set to `ecosharetbyu@gmail.com`
- [ ] "Reply To" is set to `{{from_email}}`
- [ ] Test email was received successfully

---

## How It Works Now

When a user submits the contact form:

1. **Email 1 (Auto-reply to User)**:
   - Template: `template_9xc1qyl` (existing)
   - Sent to: User's email
   - Purpose: Confirmation that their message was received

2. **Email 2 (Notification to You)**:
   - Template: `template_admin_notify` (new)
   - Sent to: `ecosharetbyu@gmail.com`
   - Purpose: Contains the actual message details
   - You can reply directly to the user from this email

---

## Troubleshooting

### If emails aren't being received:

1. **Check EmailJS Dashboard**:
   - Go to "Email History" to see if emails were sent
   - Check for any error messages

2. **Verify Template ID**:
   - Must be exactly `template_admin_notify`
   - Case-sensitive!

3. **Check Spam Folder**:
   - Admin notification emails might go to spam initially
   - Mark as "Not Spam" to train your email filter

4. **Verify Service Connection**:
   - Ensure your EmailJS service (`service_ucncb1w`) is still connected to your Gmail account
   - Reconnect if necessary

---

## Alternative: Quick Fix (If You Don't Want to Create a New Template)

If you want a quick fix without creating a new template, you can modify the code to send the same template twice but change the recipient. However, this is **not recommended** as it's less professional.

Let me know if you need help with the alternative approach!
