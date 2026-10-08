# Running PulseCover on the lecturer's server

PulseCover has one server program. It serves **the website, the app's API and the app download page**.
There is nothing to install: it only needs Node.js 22.13 or newer (Node 24 recommended).

## 1. Start it

```bash
cd server            # the folder that contains server.js
node server.js       # listens on port 3000 (set PORT=8080 to change)
```

Check it: open `http://SERVER-IP:3000/api/health`. It answers `{"ok":true,...}`.

## 2. Keep it running (pick one)

* **pm2:** `npm i -g pm2 && pm2 start server.js --name pulsecover && pm2 save && pm2 startup`
* **systemd:** create `/etc/systemd/system/pulsecover.service`

  ```ini
  [Unit]
  Description=PulseCover server
  After=network.target
  [Service]
  WorkingDirectory=/opt/pulsecover/server
  ExecStart=/usr/bin/node server.js
  Environment=PORT=3000
  Restart=always
  [Install]
  WantedBy=multi-user.target
  ```
  then `systemctl enable --now pulsecover`.
* **Docker:** `docker build -t pulsecover . && docker run -d -p 3000:3000 -v pulsecover-data:/app/data --restart always pulsecover`

Accounts, policies and claims are stored in `data/pulsecover.db` (SQLite). On a normal server this file is permanent, so keep the folder (or the Docker volume).

## 3. Give people the app

* Download page for phones: `http://SERVER-IP:3000/app` (QR code included). The file is `server/public/download/pulsecover.apk`.
* Install on Android: open the page, tap **Download for Android**, open the file, allow "install unknown apps" when asked.
* The app talks to `https://pulsecover-website.onrender.com` by default. To point it at the lecturer's server, either
  * open the app, **Account > Server**, enter `http://SERVER-IP:3000`, tap **Test connection** then **Save changes**, or
  * open this link on the phone once: `pulsecover:///server?url=http%3A%2F%2FSERVER-IP%3A3000&apply=1`

Plain `http://` works (the app allows it), but use HTTPS if the server has a certificate.

## 4. Optional: confirmation emails and Google Sheet log

Set two environment variables before starting: `SHEET_WEBHOOK_URL` and `SHEET_SECRET` (see `google-apps-script/SETUP.md`). Without them everything still works, just without emails.

## 5. Updating the app

Replace `public/download/pulsecover.apk` and edit `public/download/version.json`. No restart needed.
