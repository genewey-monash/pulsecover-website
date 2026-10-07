// Generates canva-code/: ready-to-paste prompts + translation JSON for building the site as ONE Canva Code page.
const fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..');
global.window = {};
for (const f of ['i18n', 'i18n2', 'i18n3']) eval(fs.readFileSync(path.join(root, 'public/js/' + f + '.js'), 'utf8'));
const D = window.PC_I18N, T = (k) => D[k][0];
const out = path.join(root, 'canva-code'); fs.mkdirSync(out, { recursive: true });
const LANG = { en: 0, zh: 1, ms: 2, ta: 3 };
const pages = (k) => k;

// translation JSON per language (same keys everywhere)
const keys = Object.keys(D).filter((k) => !k.startsWith('logo.'));
for (const [code, i] of Object.entries(LANG)) {
  const o = {}; for (const k of keys) o[k] = D[k][i];
  fs.writeFileSync(path.join(out, `translations-${code}.json`), JSON.stringify(o, null, 1));
  const ks = Object.keys(o); const N = 120;
  for (let p = 0; p * N < ks.length; p++) { const part = {}; ks.slice(p * N, (p + 1) * N).forEach((k) => (part[k] = o[k])); fs.writeFileSync(path.join(out, `translations-${code}-part${p + 1}.json`), JSON.stringify(part, null, 1)); }
}

const faq = [1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => `Q: ${T('faq.q' + i)}\nA: ${T('faq.a' + i)}`).join('\n');
const vs = [1, 2, 3, 4, 5, 6].map((i) => `- ${T('vs.r' + i)} | Traditional: ${T('vs.r' + i + '.t')} | PulseCover: ${T('vs.r' + i + '.p')}`).join('\n');
const rules = [1, 2, 3, 4, 5, 6].map((i) => `- ${T('how.r' + i + '.h')}: ${T('how.r' + i + '.p')}`).join('\n');
const ben = [1, 2, 3, 4, 5, 6].map((i) => `- ${T('home.ben' + i + '.h')}: ${T('home.ben' + i + '.p')}`).join('\n');
const prv = [1, 2, 3, 4, 5].map((i) => `- ${T('prv.' + i + 'h')}: ${T('prv.' + i + 'p')}`).join('\n');
const cmpRows = `- ${T('cmp.f1')}: PulseCover Yes | AIA Vitality Partial | Flat-rate No
- ${T('cmp.f2')}: PulseCover ${T('cmp.pc.f2')} | AIA ${T('cmp.aia.f2')} | Flat-rate ${T('cmp.flat.f2')}
- ${T('cmp.f3')}: PulseCover ${T('cmp.pc.f3')} | AIA ${T('cmp.aia.f3')} | Flat-rate ${T('cmp.flat.f3')}
- ${T('cmp.f4')}: PulseCover ${T('cmp.pc.f4')} | AIA ${T('cmp.aia.f4')} | Flat-rate ${T('cmp.flat.f4')}
- ${T('cmp.f5')}: PulseCover Yes | AIA No | Flat-rate No
- ${T('cmp.f6')}: PulseCover Yes | AIA Partial | Flat-rate Partial
- ${T('cmp.f7')}: PulseCover Yes | AIA Partial | Flat-rate No
- ${T('cmp.f8')}: PulseCover ${T('cmp.pc.f8')} | AIA ${T('cmp.aia.f8')} | Flat-rate None
- ${T('cmp.f9')}: PulseCover ${T('cmp.pc.f9')} | AIA ${T('cmp.aia.f9')} | Flat-rate None`;

const md = `# PulseCover on Canva Code: build pack

Canva Code makes the page from your prompts. You cannot paste code. It has no localStorage, no external APIs, no accounts. Forms save one-way into a connected Canva Sheet.
So this is ONE single-page website (a single Canva Code design) with in-page views and ONE language dropdown. The working site on Render stays as the reference/backup.

## How to build it (step by step)
1. Canva > Create a design > Website (or Canva Code). Open Canva AI / Code and choose to build an interactive page.
2. Paste PROMPT 1. Wait for it to generate. Check it. Fix issues with a short follow-up prompt (e.g. "make the buttons single-line").
3. Paste PROMPT 2, 3, 4, 5, 6 one at a time. Start each with: "Edit this same design and add:" (already included). Do not start a new design.
4. Language: PROMPT 7 gives the English JSON, PROMPTS 8, 9, 10 give Chinese, Malay, Tamil. If Canva AI refuses the length, use the smaller files translations-xx-part1.json to part5.json and paste them one after another.
5. Connect ONE Canva Sheet per form when Canva asks (see "Forms and Sheet columns").
6. Upload your logo, hero photo and the other photos in Canva (Uploads) and replace the grey IMAGE boxes. Add the animated logo by hand.
7. Share > Website > publish. Share the Canva edit link with teammates (Can edit / Can comment).

If any step generates something wrong, paste ONLY a correction ("The score ring shows 0. It must equal the rounded weighted sum described in PROMPT 4.").

---

## PROMPT 1: foundation, design system, shell
\`\`\`
Create a single-page, fully responsive, interactive website called "PulseCover": wearable-based life and health insurance for Malaysia. It must work on phone and desktop. Build it as ONE page with in-page views switched by a hash (#home, #plans, #connect, #apply, #dashboard, #claims, #how, #compare, #business, #investors, #faq, #privacy, #contact). Only the active view is visible. Use only client-side JavaScript. Do not use localStorage or external network calls. Keep all state in memory.

DESIGN SYSTEM
- Fonts: Public Sans (body and headings). For Chinese use Noto Sans SC, for Tamil use Noto Sans Tamil.
- Colours: ruby red #B71234 (primary buttons, links, accents), deep red #8E0E28 (hover), warm gold #E8A317 (highlights, badges), gold tint #FFF5DE, red tint #FCEBEF, charcoal #26242F (text, dark sections), grey band #F6F4F7, line #E6E3E8, white backgrounds. Success green #2B9348.
- Typography: H1 clamp 32 to 48px, line-height 1.25, weight 700, letter-spacing 0. H2 clamp 25 to 35px, line-height 1.3. Body 16px, line-height 1.7. Generous spacing: sections have 72px vertical padding, cards 26px padding, 14px radius, soft shadow 0 4px 20px rgba(38,36,47,0.08). Sentence case for all headings and buttons. Capitalise only proper nouns and product terms: PulseCover, Risk Rating, Plan A, Fitbit, Garmin, Whoop, Google Health Connect, Malaysia.
- Buttons: pill shaped (border-radius 99px), padding 12px 24px, bold, NEVER wrap text onto two lines (white-space: nowrap). Primary = ruby red fill white text. Secondary = white fill, 2px ruby red border and text. Gold = gold fill dark text.
- Icons: simple 1.7px line icons in ruby red inside 48px rounded tint squares.
- Bullet lists: relaxed, 6px vertical padding per item, ruby-red check marks.

LAYOUT SHELL (visible in every view)
1. A dismissible gold-tint promo banner at the very top: "Refer a friend. Earn a RM10-20 credit when they join and link a wearable." with a "Learn more" link to #dashboard and a close x.
2. Sticky white header, 76px tall: left = a white rounded 46px square logo placeholder (dashed grey border, tiny text LOGO; I will replace it with my real logo) plus the word PulseCover; centre = navigation: Products (opens a mega menu), Pricing (#how), Calculator (#connect), For business (#business), Help (opens menu); right = round search icon button, language dropdown, a secondary button "Dashboard" (or "Log in" before applying) and a primary button "Connect wearable" (#connect).
3. Products mega menu: four columns - For individuals (Plan A, Plan B), For families (Plan C, Plan D), For business (For business, HR wellness dashboard), Tools and guides (Connect wearable, Compare, How pricing works). A row of four text links underneath: Browse all plans, Pricing rules, Claims, Privacy and data.
4. Help menu: Support (Contact, FAQ, Claims), My account (Dashboard), About us (Investors, Privacy and data).
5. Search: clicking the icon opens a panel with a text input "What are you looking for today?" that filters a list of view titles and FAQ questions as the user types and navigates when clicked.
6. Breadcrumb under the header on every view except home: Home > current view name.
7. Footer (charcoal): brand column with the logo placeholder, tagline, a placeholder phone 1300-00-0000, email hello@pulsecover.example, five round social icon buttons (f, ig, tt, in, yt), and two outlined "App Store" and "Google Play" badges; link columns Product (Plans, Calculator, Compare, Get covered, For business), Support (Claims, Dashboard, FAQ, Contact), Company (How pricing works, Investors, Privacy and data); a Language column with four small pill buttons. Below: a small regulatory strip: "Regulatory information (placeholder). Company registration no.: to be added. PulseCover is a broker / MGA; cover is underwritten by the partner insurer and protected by PIDM subject to limits (see PIDM TIPS brochure). Underwritten by a licensed partner insurer (Insurer Name Sdn Bhd). PulseCover acts as broker / MGA." and the bottom line "Product for Group 5 BFM3130" and "(c) 2026 PulseCover".
8. Floating widgets on every view: a ruby-deep round-pill button bottom-right "Talk to us" with a phone icon, opening a call-back modal form; a dark vertical tab "Feedback" on the right edge at mid-height, opening a feedback modal; a dark cookie bar at the bottom with text "We use essential storage to remember your language and sign-in. Nothing is sold or shared for advertising." and buttons "Accept" and "Essential only" (both just hide the bar for the session).
9. Call-back modal fields: Full name, Mobile number, Email (optional), State (dropdown: Johor, Kedah, Kelantan, Kuala Lumpur, Labuan, Melaka, Negeri Sembilan, Pahang, Perak, Perlis, Pulau Pinang, Putrajaya, Sabah, Sarawak, Selangor, Terengganu), "I would like help with" (General information, Choosing a plan, A claim or my policy, Business / SME cover, Something else), Best time to call (Morning, Afternoon, Evening), Preferred language (4 radio options), a consent checkbox "I have read and accept the data protection notice and agree to be contacted." and a button "Request a call back". Validate: name 2+ chars, phone 8+ digits, state chosen, consent ticked. Save every submission to the connected Canva Sheet "Callbacks". Success message: "Thank you! An advisor will call you back within 2 working days."
10. Feedback modal: "What was the main purpose of your visit?" (Research products or services, Buy a plan, Manage my policy, Submit or track a claim, Other), a 1 to 5 star rating (required), optional comments, button "Send feedback", save to Sheet "Feedback", success "Thank you for your feedback!".
11. LANGUAGE: one global dropdown (English default, 中文, Bahasa Malaysia, தமிழ்) in the header and the footer. Every visible text string must come from a dictionary object I.18n[lang][key]. I will provide the dictionaries in later prompts. For now implement the switching mechanism, store the chosen language in a variable, and re-render the active view on change. Use English keys as given in later prompts.
12. Accessibility: visible focus rings (3px rgba(183,18,52,0.18)), all images with alt text, a "Skip to main content" link, minimum 44px tap targets.

Do not build the content of the views yet. Create each view as an empty section with its heading.
\`\`\`

---

## PROMPT 2: home view
\`\`\`
Edit this same design and add the content of the #home view. Keep the design system exactly as before.

1. Hero (two columns on desktop, stacked on phone): LEFT = a full-height image box: a grey dashed placeholder labelled "IMAGE" and the text "HERO PHOTO: multi-generation Malaysian family walking in a park wearing fitness trackers" (I will replace it with my photo). RIGHT = small gold-tint pill "${T('home.eyebrow').toUpperCase()}", H1 "${T('home.h1')}", paragraph "${T('home.sub')}", buttons: primary "${T('home.cta1')}" (#connect) and secondary "${T('home.cta2')}" (#how).
2. Overlapping stats strip (white card, 4 cells, overlapping the hero bottom by 34px): "RM600 / ${T('home.stat1')}", "±15% / ${T('home.stat2')}", "3 / ${T('home.stat3')}", "16+ / ${T('home.stat4')}".
3. Section "${T('flow.h')}" (white background, centred): three equal cards joined by ruby-red arrows: "${T('flow.1.h')}" - "${T('flow.1.p')}"; "${T('flow.2.h')}" (highlighted card with a 2px ruby-red border) - "${T('flow.2.p')}"; "${T('flow.3.h')}" - "${T('flow.3.p')}". Under them the note "${T('flow.note')}". Then H3 "${T('home.conn.h')}", paragraph "${T('home.conn.p')}", four pill chips: Google Health Connect, Fitbit, Garmin, Whoop, and a primary button "${T('home.cta1')}" (#connect). On phones, stack the three cards vertically with the arrows pointing down.
4. Section "${T('vs.h')}" (grey band): paragraph "${T('vs.sub')}", then a 3-column comparison table (first column = row title). Header: empty | "${T('vs.col.trad')}" (charcoal) | "${T('vs.col.pc')}" (ruby red). The PulseCover column cells have a gold-tint background and bold text. Rows:
${vs}
5. Section "${T('rate.h')}" (white): paragraph "${T('rate.sub')}", then the bands table (columns Grade, Score, What it means, Premium effect). Grade badges are coloured rounded boxes (A+ dark green #1C7A3C, A green #2B9348, B olive #8AA30F, C amber #D99A06, D orange #E8590C, E red #C92A2A) with white text (dark text on C):
  A+ | 90 - 100 | Excellent | -12% to -15%
  A | 75 - 89 | Very good | -7.5% to -11.7%
  B | 60 - 74 | Good | -3% to -7.2%
  C | 40 - 59 | Fair | -2.7% to +3%
  D | 25 - 39 | Needs attention | +3.3% to +7.5%
  E | 0 - 24 | High risk | +7.8% to +15%
6. Section "${T('home.plans.h')}" (grey band): paragraph "${T('home.plans.sub')}", tabs All plans / Individual / Family that filter four plan cards (data in PROMPT 3), each card showing: NEW chip if new, type chip, "Plan X", three "Example coverage" bullets plus the line "${T('plan.wear')}", "Base premium RM{price}/yr" and a "${T('common.learn')}" button (#plans). Under them a primary button "${T('home.viewall')}" and the small note "${T('home.disc')}".
7. Section "${T('home.ben.h')}" (white): six cards in a 3-column grid (2 on tablet, 1 on phone), each with an icon square, bold title and text:
${ben}
8. Section "${T('home.why.h')}" (white, two columns): LEFT a grey dashed image box "PHOTO: three people aged about 22, 30 and 42 smiling at a smartwatch". RIGHT H2, paragraph "${T('home.why.p')}", and three small cards with a gold top border: "${T('home.c1.h')}" - "${T('home.c1.p')}"; "${T('home.c2.h')}" - "${T('home.c2.p')}"; "${T('home.c3.h')}" - "${T('home.c3.p')}".
9. Charcoal section "${T('home.trust.h')}": three big gold numbers with captions: "${T('home.trust.1')}" ${T('home.trust.1d')}; "${T('home.trust.2')}" ${T('home.trust.2d')}; "${T('home.trust.3')}" ${T('home.trust.3d')}; and a gold button "${T('nav.investors')}" (#investors).
10. Section "${T('home.tools.h')}": paragraph "${T('home.tools.sub')}" and three linked cards: Calculator (#connect), Compare (#compare), How pricing works (#how).
11. Section "${T('home.cross.h')}": three linked cards - "${T('home.cross.1')}" (#business), "${T('home.cross.2')}" (#claims), "${T('home.cross.3')}" (#faq), each with its text (${T('home.cross.1d')} / ${T('home.cross.2d')} / ${T('home.cross.3d')}).
12. Deep-red gradient section "${T('home.adv.h')}": left text "${T('home.adv.p')}" with ticks "${T('home.adv.b1')}", "${T('home.adv.b2')}", "${T('home.adv.b3')}" and a translucent image box "PHOTO: friendly advisor with headset at a laptop"; right a white form card containing the same call-back form as the modal.
13. Section "${T('home.waitlist.h')}": text "${T('home.waitlist.p')}", one email input and a single-line button "${T('home.waitlist.btn')}"; save to Sheet "Waitlist"; success "${T('home.waitlist.ok')}".
\`\`\`

---

## PROMPT 3: plans and compare
\`\`\`
Edit this same design and add the #plans view.
Hero row: H1 "${T('plans.h1')}", paragraph "${T('plans.sub')}", buttons "Get quote" (#connect) and "Talk to us" (opens call-back modal); right a grey dashed image box "PHOTO: woman checking a smartwatch after a morning walk".
A sticky sub-navigation bar under it: PulseCover-red label "Plans" and links All plans, Plan comparison, How pricing works, FAQ.
Main area, two columns: left a white filter card ("Browse") with checkboxes Plan type: Individual, Family; Sign up via: Online, Advisor (all ticked by default); right a list of plan cards that updates live.
PLAN DATA (exact):
 Plan A | base RM600/yr | cover up to RM100,000 | type Individual | sign up Online | NEW | coverage bullets: Example coverage A, B, C
 Plan B | base RM900/yr | cover up to RM250,000 | Individual | Online and Advisor | not new | Example coverage A, B, C, D
 Plan C | base RM1,500/yr | cover up to RM500,000 | Family | Advisor | not new | Example coverage A, B, C, D, E
 Plan D | base RM2,400/yr | cover up to RM1,000,000 | Family | Advisor | NEW | Example coverage A, B, C, D, E, F
Every plan card also has the bullet "${T('plan.wear')}". Card layout: white, 14px radius, red "NEW" ribbon top-left, small caps label "LIFE & HEALTH PROTECTION", H3 "Plan X", gold chips for type and sign-up channels, bullet list with ruby check icons, line "Cover up to RM...", on the right "Base premium RM{base}/yr" in large ruby red and under it "Your price after wearable adjustment: RM{round(base*0.85)} - {round(base*1.15)}", and three buttons: "+ Compare" (toggle, shows "Added" with a tick), "Get quote" (goes to #connect with that plan preselected) and "Apply" (goes to #apply with that plan preselected). If no plan matches the filters show "${T('plan.none')}". Under the list: "${T('plans.note')}".
Compare: a dark bar fixed at the bottom appears when 1 to 3 plans are selected: "{n} plans selected (max 3)", names, gold button "Compare now" (scrolls to the table) and "Clear". Section "Plan comparison": a table with columns = selected plans (or all four if none selected) and rows: Base premium (per year), Best case (-15%) = base*0.85, Highest case (+15%) = base*1.15, Cover amount, Plan type, Sign up via, Coverage items.
\`\`\`

---

## PROMPT 4: connect wearable, Risk Rating, calculator, apply (the heart of the product)
\`\`\`
Edit this same design and add the #connect view and the #apply view. All logic is client-side JavaScript with in-memory state (a JS object called STATE that survives while the page is open).

A. SCORING (use exactly this)
Inputs (weekly equivalents): steps per day, exercise minutes per WEEK, sleep hours per night, resting heart rate (bpm).
 stepsScore = min(steps/8000, 1) * 100
 exerciseScore = min(exerciseMinPerWeek/150, 1) * 100
 sleepScore = 100 if 7 <= hours <= 9; 0 if hours <= 0; otherwise clamp(100 - abs(hours - 8)*25 + 25, 0, 100)
 heartScore = clamp((90 - restingHr) / (90 - 55) * 100, 0, 100)
 score = round(0.35*stepsScore + 0.30*exerciseScore + 0.20*sleepScore + 0.15*heartScore)   (0 to 100)
 adjustment = clamp( -((score - 50) / 50) * 0.15, -0.15, +0.15 )     (score 50 = 0%, 100 = -15%, 0 = +15%)
 annualPremium = round(base * (1 + adjustment), 2); monthly = round(annualPremium/12, 2); saving = round(base - annualPremium, 2)
 Optional premium app: +RM5/month = RM60 per year (does NOT change insurance price; show it as a separate line).
 Grade: A+ if score >= 90; A if >= 75; B if >= 60; C if >= 40; D if >= 25; else E.
 base comes from the chosen plan (Plan A 600, B 900, C 1500, D 2400).

B. #connect VIEW
H1 "${T('connect.h1')}", paragraph "${T('connect.sub')}". Left column: four device buttons in a 2x2 grid - Google Health Connect, Fitbit, Garmin, Whoop - each with a small caption "${T('connect.cta')}" (or "${T('connect.connected')}" in green when connected). Right column: a grey dashed image box "PHOTO: close-up of a wrist wearing a generic smartwatch next to a phone". Clicking a device opens a consent modal: title "${T('connect.modal.h')}", the device name in bold, a checklist "${T('connect.a1')}", "${T('connect.a2')}", "${T('connect.a3')}", "${T('connect.a4')}", the text "${T('connect.modal.p')}", buttons "${T('connect.allow')}" and "${T('connect.cancel')}". On Allow: mark that device connected and GENERATE 28 days of simulated readings (below), then show a result card: "${T('connect.connected')} - 28 days of data found", the Risk Rating grade badge and "Score N/100", and a primary button "Apply" (#apply).
Below: a plan selector (Plan A to D) and a calculator card with four sliders - Average daily steps 0 to 20000 (step 250, default 7500), Exercise per week in minutes 0 to 400 (step 5, default 100), Average sleep hours per night 3 to 11 (step 0.25, default 7.5), Resting heart rate 40 to 100 (default 66) - and a checkbox "Add the premium app (RM5/month: deep insights and coaching)". Beside it a charcoal result card with a gold top border showing LIVE: "Your health score N / 100 (grade)", an adjustment badge (green if negative, grey if 0, orange if positive), Base premium, Wearable adjustment %, Your annual premium RM x/yr (large), about RM x per month, "You save vs the flat base RM x" (or "More than the flat base"), four score-breakdown bars (Steps, Exercise, Sleep, Heart rate, 0 to 100 each, gold bars) and a button "Apply with these numbers" (#apply with the same values). Under it the formula note: "Score = 35% steps + 30% exercise + 20% sleep + 15% heart rate. A score of 50 means no change. 100 means -15%, 0 means +15%. Premium = RM600 x (1 + adjustment)." and the small note "${T('calc.note')}". Also a gold-tint card: "${T('calc.connect')}" with a button "${T('calc.connect.btn')}".
Permissions section (two cards): "${T('connect.allow.h')}" (green ticks: ${T('connect.a1')}, ${T('connect.a2')}, ${T('connect.a3')}, ${T('connect.a4')}) and "${T('connect.never.h')}" (red crosses: ${T('connect.n1')}, ${T('connect.n2')}, ${T('connect.n3')}). Card: "${T('connect.hc')}". Small note: "${T('connect.demo')}".

C. SIMULATED 28-DAY DATA (deterministic per session)
Create a random profile once per session: baseSteps = 5500 + r1*5500; baseExerciseWeekly = 60 + r2*110; baseSleep = 6.2 + r3*2; baseHr = 54 + r4*18 (r1..r4 random 0 to 1).
For each of the last 28 days: factor = 0.85 on Saturday and Sunday else 1.05; steps = round(baseSteps*factor*(0.75 + r*0.5)); exerciseDailyMin = round(baseExerciseWeekly/7*factor*(0.6 + r*0.9)); sleep = round1(baseSleep + (r - 0.5)); restingHr = round(baseHr + (r - 0.5)*6) (a fresh r per value).
Averages used for scoring: steps = mean, exerciseMinPerWeek = mean(exerciseDailyMin)*7, sleep = mean, hr = mean. Weekly summaries: group days by calendar week starting Monday (up to 8 weeks), each with averages and its own score and grade.

D. #apply VIEW (a 4-step wizard with a progress bar: 1 Connect, 2 Rating and quote, 3 Details, 4 Confirm)
Step 1: plan picker (Plan A to D cards showing price), the four device buttons (same consent flow), a collapsible "${T('apply.manual.h')}" with the four number inputs, and the premium-app checkbox. Button Next builds the quote from the 28-day averages if connected, otherwise from the typed numbers.
Step 2: a large ring showing the score (ruby red arc on grey), "Rating grade X - label", Base premium, Wearable adjustment %, Your annual premium, and a gold-tint note "${T('apply.sendins')}".
Step 3: Beneficiary full name (required); Parent / guardian full name (required if the person is under 18; the applicant must also enter a date of birth on this step; refuse under 16 with the message "You must be at least 16 to register.").
Step 4: two required checkboxes - "${T('apply.consent1')}" and "${T('apply.consent2')}" - and a button "${T('apply.confirm')}".
On confirm: create a policy number "PC-2026-" plus 6 random hex characters in capitals, store the policy in STATE (plan, premium, grade, devices, start date today, renewal date +365 days), save the application as a row in the Canva Sheet "Applications" (columns: Timestamp, Plan, Premium, Grade, Score, Devices, Beneficiary, Guardian), and show "You are covered!" with the policy number and a button to #dashboard.
\`\`\`

---

## PROMPT 5: dashboard (demo, in-session) and claims
\`\`\`
Edit this same design and add the #dashboard view and the #claims view. The dashboard only works after the apply flow has created a policy in STATE; if there is none show "You do not have a policy yet." with buttons "Connect wearable" and "Get covered".
#dashboard:
- H1 "Welcome back" and four KPI cards: Policy (Plan X and policy number), Current premium (RM/yr), Risk Rating (grade badge plus N/100, computed from the 28-day average), Projected renewal premium (using the same scoring; show the % change).
- "Your quote journey": five pills - Wearable connected, Data analysed, Risk Rating issued, Sent to partner insurer (each with a tick in gold-tint) and Policy active (solid ruby red).
- Connected devices card: each connected device as a green pill with a "Disconnect" mini button and "Last sync" time; the unconnected devices as buttons "Connect a device".
- Weekly summary card: note "${T('dash.summ.note')}"; a line chart of weekly scores (last up to 8 weeks, ruby-red line and dots, y-axis 0 to 100); a table "Week of | days | Steps | Exercise /wk | Sleep | Resting HR | Grade" for the last 6 weeks; a button "Refresh summary".
- Pause tracking card: text "${T('dash.pause.p')}", Days 1 to 60, reason (Illness, Injury, Travel, Pregnancy, Other), button "Pause"; after pausing show a pill "Tracking paused until {date}" and disable refresh.
- Refer friends card: "${T('dash.ref.p')}", a code "PC" + 6 random hex capitals, a "Copy link" button (copies text; shows "Copied!"), a count of friends referred (0), a leaderboard of 3 sample names, and the line "${T('dash.milestone')}".
- My claims card listing claims filed in STATE with reference, amount, status pill, and a button "File a claim" (#claims).
#claims: H1 "${T('cl.h1')}", paragraph "${T('cl.sub')}". If no policy: "${T('cl.need')}". Otherwise a form: Claim type (${T('cl.t.hospitalisation')}, ${T('cl.t.outpatient')}, ${T('cl.t.critical_illness')}, ${T('cl.t.accident')}, ${T('cl.t.death')}), Claim amount (RM, must be above 0 and not more than the plan's cover), Date of incident (not in the future), What happened? (at least 10 characters), button "${T('cl.submit')}". On submit: create reference "CL-" + 6 random digits, save a row in Sheet "Claims" (Timestamp, Reference, Plan, Type, Amount, Incident date, Description), show "${T('cl.done')} CL-######" and list the claim under "${T('cl.track')}" with a vertical timeline (Received timestamp; later statuses ${T('cl.s.review')}, ${T('cl.s.approved')}, ${T('cl.s.paid')} are shown greyed as upcoming).
\`\`\`

---

## PROMPT 6: remaining views (business, investors, how, compare, faq, privacy, contact)
\`\`\`
Edit this same design and add these views, using the same design system.

#how: H1 "${T('how.h1')}", paragraph "${T('how.sub')}". The same three-step flow cards as the home page. Six cards (2 columns) with numbered icon squares:
${rules}
Then H2 "${T('rate.bands')}" with the bands table from the home view, two cards "${T('how.sum.h')}" - ${T('how.sum.p')} and "${T('how.never.h')}" - ${T('how.never.p')}, and a button "Try the calculator" (#connect).

#compare: H1 "${T('cmp.h1')}", paragraph "${T('cmp.sub')}". Table with columns Feature | PulseCover (gold tint) | AIA Vitality | Flat-rate insurance and rows:
${cmpRows}
Footnote: "${T('cmp.note')}".

#business: H1 "${T('sme.h1')}", paragraph "${T('sme.sub')}". Three benefit cards: "${T('sme.b1.h')}" - ${T('sme.b1.p')}; "${T('sme.b2.h')}" - ${T('sme.b2.p')}; "${T('sme.b3.h')}" - ${T('sme.b3.p')}. SME calculator: sliders Number of employees 1 to 500 (default 25) and Expected average team health score 0 to 100 (default 60). LIVE outputs: adjustment = clamp(-((score-50)/50)*0.15, -0.15, 0.15); bulkDiscount = 5% if employees >= 100, 3% if >= 50, 2% if >= 10, else 0; perEmployeePerYear = 600*(1+adjustment)*(1-bulkDiscount); total = perEmployee * employees; saving vs flat RM600 per employee = 600*employees - total. Show: Per employee per year, Total per year, Wearable adjustment %, Bulk discount %, Saving vs flat RM600/employee. Enquiry form (Company name, Contact person, Email, Phone, Message) saved to Sheet "SME enquiries" (include the calculator values); success "${T('sme.ok')}". Under it: "${T('sme.assoc')}".

#investors: H1 "${T('inv.h1')}", paragraph "${T('inv.sub')}". Four market cards: USD 41.2m (Malaysia InsurTech market, 2025), USD 556.0m (Forecast 2034), 32.5% (Forecast CAGR), 30,000 / 3m+ (AIA Vitality 2026 target vs 3m+ policyholders). Segments: "${T('inv.seg1')}" and "${T('inv.seg2')}". Business model: "${T('inv.model.p')}". Year 1 financials (assumption-based) cards: Revenue RM 810,000; Total costs RM 1,475,268; Year 1 operating result RM -665,268; Breakeven policyholders 23,591; Fixed costs (annual) RM 843,600; Variable costs (annual) RM 631,668; Contribution margin per policy RM 35.76. Then "${T('inv.be.p')}". A horizontal bar chart "Annual fixed costs by line (RM)" (monthly x 12): CEO 96,000; CTO 108,000; Lead Software Engineer 108,000; Backend Developer 72,000; Frontend Developer 72,000; Customer Support Rep 42,000; Head of Marketing 72,000; Head of Compliance 84,000; Legal retainer 18,000; Office rent (KL) 48,000; Cloud services 36,000; Dev tools 9,600; Security software 8,400; Other SaaS 6,000; Payment gateway (fixed) 3,600; Regulatory costs 24,000; Branding and PR 36,000. A second bar chart: Revenue 810,000 / Total costs 1,475,268 / Fixed costs 843,600. Note "${T('inv.team')}". Key risks (3 cards): ${T('inv.risk1')} | ${T('inv.risk2')} | ${T('inv.risk3')}. Sources list: IMARC Group (2025) Malaysia insurtech market; PIDM (2026) Protection gaps among Malaysian consumers; World Bank (2026) Cost drivers in Malaysia's medical and health insurance/takaful sector; Surendran (2026) The Edge Malaysia; AIA Malaysia (2026); Carrier Management (2025); Solino-Fernandez et al. (2019); Holzapfel et al. (2024); Sliwinski and Kurylowicz (2021); Meyliana et al. (2019); MOSTI (2021) SUPER Roadmap 2021-2030.

#faq: H1 "${T('faq.h1')}" and these nine accordion items (only one open at a time):
${faq}

#privacy: H1 "${T('prv.h1')}", paragraph "${T('prv.sub')}", five numbered cards (2 columns):
${prv}

#contact: H1 "${T('ct.h1')}", paragraph "${T('ct.sub')}". Left a form: Full name, Email, Topic (General, Claims, Business / SME, Partnerships, Press), Message; save to Sheet "Contact" and show "${T('ct.ok')}". Right a details card: hello@pulsecover.example, +60 3-0000 0000, "${T('ct.address')}", Instagram, TikTok, LinkedIn.
\`\`\`

---

## PROMPT 7: English dictionary (for the language switch)
Open the file canva-code/translations-en.json, copy ALL of it and paste after this sentence:
\`\`\`
Edit this same design. Add the language system. Create a JavaScript object I18N with the key "en" containing the JSON below. Change every piece of visible text across ALL views, menus, modals, buttons, placeholders, validation messages and the footer so that it reads from I18N[currentLang][key], falling back to I18N.en[key]. The JSON keys are the same as the identifiers below; map each existing text to the best matching key. After this change, nothing visible may be hard-coded. Do not change the layout or styling. JSON for "en":
[paste translations-en.json here]
\`\`\`

## PROMPTS 8, 9, 10: Chinese, Malay, Tamil
For each language, copy the whole file (translations-zh.json, translations-ms.json, translations-ta.json) and paste after this sentence (change the code and name):
\`\`\`
Edit this same design. Add the dictionary for the language "zh" (Chinese, shown in the dropdown as 中文) to the I18N object, using exactly the same keys as "en". When the user selects this language every visible string must switch. For Chinese use font Noto Sans SC; for Tamil use Noto Sans Tamil. If a key is missing fall back to English. JSON for "zh":
[paste translations-zh.json here]
\`\`\`
(For Malay use "ms" and dropdown label Bahasa Malaysia; for Tamil use "ta" and label தமிழ்.) If the AI says the message is too long, use the smaller files instead: translations-zh-part1.json to part5.json (and the same for ms, ta, en). Paste part 1 with the full sentence above, then paste each next part with the sentence "Continue the dictionary for zh with these additional keys:".

---

## Forms and Sheet columns (connect each form to a Canva Sheet)
- Callbacks: Timestamp, Name, Phone, Email, State, Need, Time, Language, Consent
- Feedback: Timestamp, Purpose, Rating, Comment, Page
- Waitlist: Timestamp, Email
- Applications: Timestamp, Plan, Premium, Grade, Score, Devices, Beneficiary, Guardian
- Claims: Timestamp, Reference, Plan, Type, Amount, Incident date, Description
- SME enquiries: Timestamp, Company, Contact, Email, Phone, Employees, Average score, Message
- Contact: Timestamp, Name, Email, Topic, Message

## What this version can and cannot do
Works inside Canva: every view, mega menus, search, four languages, plans filter and compare, live Risk Rating calculator, simulated wearable connect, the 4-step apply wizard, an in-session dashboard with weekly summaries and a pause tracker, claims form, SME calculator, investors page, FAQ, all forms saved to Canva Sheets.
Does not work inside Canva: real user accounts and login, data that survives a page reload, a real database, claims status updates by staff, real Fitbit/Garmin/Whoop connections. The Render site keeps those.
`;
fs.writeFileSync(path.join(root, 'CANVA_CODE_PACK.md'), md);
console.log('pack written; keys per language:', keys.length, '; md size', (md.length / 1024).toFixed(0) + ' KB');
for (const c of Object.keys(LANG)) console.log(c, (fs.statSync(path.join(out, `translations-${c}.json`)).size / 1024).toFixed(0) + ' KB');
