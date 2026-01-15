# EmailJS Setup Guide for EcoShare Contact Form

## 📧 What is EmailJS?
EmailJS allows you to send emails directly from your contact form without needing a backend server. It's free for up to 200 emails/month.

## 🚀 Setup Steps

### Step 1: Create EmailJS Account
1. Go to [https://www.emailjs.com/](https://www.emailjs.com/)
2. Click **"Sign Up"** (top right)
3. Create a free account using Google or email

### Step 2: Add Email Service
1. After logging in, go to **"Email Services"** in the left sidebar
2. Click **"Add New Service"**
3. Choose your email provider (Gmail recommended):
   - Select **Gmail**
   - Click **"Connect Account"**
   - Sign in with your Gmail account (ecoshare@gmail.com or your preferred email)
   - Allow EmailJS to send emails on your behalf
4. **Copy the Service ID** (looks like: `service_abc1234`)
   - You'll need this later!

### Step 3: Create Email Template
1. Go to **"Email Templates"** in the left sidebar
2. Click **"Create New Template"**
3. Configure the template:
   
   **Subject:**
   ```
   New Contact Form Message: {{subject}}
   ```
   
   **Content (Body):**
   ```
   You have received a new message from the EcoShare contact form.

   From: {{from_name}}
   Email: {{from_email}}
   Subject: {{subject}}

   Message:
   {{message}}

   ---
   This email was sent from the EcoShare contact form.
   ```

4. Click **"Save"**
5. **Copy the Template ID** (looks like: `template_xyz5678`)

### Step 4: Get Your Public Key
1. Go to **"Account"** → **"General"** in the left sidebar
2. Find the **"Public Key"** section
3. **Copy your Public Key** (looks like: `abcDEF123xyz`)

### Step 5: Update Your Code
1. Open `src/pages/Contact.jsx`
2. Find these lines (around line 29-31):
   ```javascript
   const serviceId = 'YOUR_SERVICE_ID';
   const templateId = 'YOUR_TEMPLATE_ID';
   const publicKey = 'YOUR_PUBLIC_KEY';
   ```
3. Replace with your actual values:
   ```javascript
   const serviceId = 'service_abc1234';  // Your Service ID
   const templateId = 'template_xyz5678'; // Your Template ID
   const publicKey = 'abcDEF123xyz';      // Your Public Key
   ```

### Step 6: Test It!
1. Run your app: `npm run dev`
2. Go to the Contact page
3. Fill out the form and click "Send Message"
4. Check your email inbox - you should receive the message!

## 🔒 Security Note
The public key is safe to expose in your frontend code - it's designed to be public. EmailJS has rate limiting and spam protection built-in.

## 📊 Free Tier Limits
- 200 emails per month
- 1 email service
- 2 email templates
- Perfect for a project like EcoShare!

## 🆘 Troubleshooting

**Problem: "Failed to send message"**
- Check that all three IDs (serviceId, templateId, publicKey) are correct
- Make sure you're connected to the internet
- Check the browser console for specific error messages

**Problem: Email not received**
- Check your spam/junk folder
- Verify the email service is connected in EmailJS dashboard
- Make sure the template variable names match ({{from_name}}, {{from_email}}, etc.)

**Problem: Rate limit exceeded**
- Free tier allows 200 emails/month
- Upgrade to a paid plan if needed, or use multiple EmailJS accounts

## 📝 Template Variables Used
The following variables are sent from the form:
- `{{from_name}}` - First name + Last name
- `{{from_email}}` - User's email address
- `{{subject}}` - Selected subject/topic
- `{{message}}` - User's message
- `{{to_name}}` - "EcoShare Team" (hardcoded)

## ✅ You're Done!
Once you complete these steps, your contact form will send real emails to your inbox!
