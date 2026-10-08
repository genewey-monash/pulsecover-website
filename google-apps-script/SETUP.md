# Google Sheet + automatic emails: setup (about 10 minutes)

Everything that people submit on the website (sign-ups, contact messages, call-back requests, business quotes, quote emails, applications, claims, feedback) is logged in a Google Sheet, and the person gets an automatic "no-reply" confirmation email.
Passwords are never sent to the Sheet. They stay hashed in the website's own database.

## 1. Create the Sheet and the script
1. Go to sheets.google.com, create a blank sheet named **PulseCover data**.
2. Menu **Extensions > Apps Script**.
3. Delete the sample code, paste ALL of `Code.gs`.
4. Change `SECRET` (top of the file) to a long random text, for example 30+ letters and numbers. Keep a copy.
5. Click **Save**.

## 2. Publish it as a web app
1. Click **Deploy > New deployment**.
2. Click the gear icon, choose **Web app**.
3. **Execute as:** Me. **Who has access:** Anyone.
4. Click **Deploy**, then **Authorize access** and allow it (Google shows a warning for your own script: **Advanced > Go to project > Allow**). It needs permission for Sheets and for sending email.
5. Copy the **Web app URL** (it ends in `/exec`).

## 3. Give the URL and the secret to the website (Render)
1. Open the Render dashboard > your service **pulsecover-website** > **Environment**.
2. Add two variables:
   - `SHEET_WEBHOOK_URL` = the Web app URL from step 2
   - `SHEET_SECRET` = the exact same text you put in `SECRET`
3. Click **Save changes**. Render redeploys in about a minute.

## 4. Test
1. Open the website, create an account with a real email you can check.
2. Within about a minute: a new row appears in the **Users** tab of the Sheet, and the welcome email arrives.
3. Try the Contact form, "Talk to us" and a business enquiry. Each adds a row to its own tab and sends a confirmation.

## Good to know
- The email is sent by your Google account but shown as **PulseCover**. A truly no-reply address (like no-reply@yourdomain) needs a Google Workspace domain. Each email says "Please do not reply".
- A normal Gmail account can send about 100 emails a day, which is plenty for a demo.
- If you change `Code.gs` later, use **Deploy > Manage deployments > Edit > New version** so the live URL updates.
- Running `testWelcome` in the Apps Script editor sends a sample welcome email to yourself.


## Two files
The script has two files: `Code.gs` (Sheet logging, register and contact emails) and `Emails.gs` (call back, business, quote, application, claim and waitlist emails in English, Chinese, Malay and Tamil). Add both to the same Apps Script project, then deploy a new version (Deploy > Manage deployments > edit > New version).
