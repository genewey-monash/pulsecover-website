# PulseCover website (Group 5, BFM3130)

Wearable-based dynamic pricing health & life insurance. Zero dependencies: Node 22.5+ only.

    node server.js          # http://localhost:3000  (PORT env to change)
    node tools/build.js     # regenerate public/*.html from tools/build.js

- `server.js`   API + static server + SQLite (data/pulsecover.db, created on first run)
- `pricing.js`  pricing engine (RM600 base, +/-15% band) and Year-1 financial model from the BMC workbook
- `public/js/i18n.js`  all text in English / Chinese / Malay / Tamil (edit here)
- `public/css/style.css`  design tokens at top (:root)

Logo: white dashed placeholder `.logo-slot` in the header/footer (see public/js/app.js).
Placeholders to replace: contact email/phone/address (public/contact.html via tools/build.js), partner insurer "Insurer Name Sdn Bhd" (i18n.js).
Wearable sync is simulated or manual; real Fitbit/Garmin/Whoop/Google Health Connect OAuth needs partner credentials.

## Design (v2)
Ruby red + gold, Public Sans. Reference analysis of 5 Malaysian insurers: DESIGN_REFERENCE.md.
- Header: promo banner, logo slot, mega menus, search, language dropdown, login, Get covered
- Floating: Talk-to-us callback pill, feedback tab, cookie bar
- Plans A-D are placeholders (pricing.js PLANS); coverage items are "Example coverage A-F" (i18n2.js)
- Image placeholders are grey boxes labelled IMAGE (class .imgslot) - replace in tools/pages2.js or in Canva
- New tables: callbacks, feedback (read with any SQLite tool from data/pulsecover.db)
