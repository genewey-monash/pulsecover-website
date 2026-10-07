# PulseCover on Canva Code: build pack

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
```
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
```

---

## PROMPT 2: home view
```
Edit this same design and add the content of the #home view. Keep the design system exactly as before.

1. Hero (two columns on desktop, stacked on phone): LEFT = a full-height image box: a grey dashed placeholder labelled "IMAGE" and the text "HERO PHOTO: multi-generation Malaysian family walking in a park wearing fitness trackers" (I will replace it with my photo). RIGHT = small gold-tint pill "WEARABLE-POWERED RISK RATING FOR INSURANCE", H1 "Connect your wearable. Get your risk rating. Get a fair quote.", paragraph "PulseCover reads your Fitbit, Garmin, Whoop or Google Health data, turns it into a PulseCover Risk Rating, and sends a fair quote to our partner insurer. No health forms. No guesswork.", buttons: primary "Connect my wearable" (#connect) and secondary "See how it works" (#how).
2. Overlapping stats strip (white card, 4 cells, overlapping the hero bottom by 34px): "RM600 / Base annual premium", "±15% / Maximum yearly adjustment", "3 / Supported wearable brands", "16+ / Minimum age to join. No upper limit".
3. Section "From your wearable to your policy in three steps" (white background, centred): three equal cards joined by ruby-red arrows: "Your wearable / Google Health" - "Fitbit, Garmin, Whoop and Google Health Connect already hold your daily activity."; "PulseCover" (highlighted card with a 2px ruby-red border) - "We analyse your data, issue your risk rating and prepare a fair quote."; "Partner insurer" - "A licensed insurer underwrites and issues your policy using your rating.". Under them the note "We work from daily summaries, rated weekly and monthly. We are not another fitness tracker.". Then H3 "Works with the wearables you already own", paragraph "Connect through Google Health Connect, or directly with Fitbit, Garmin or Whoop.", four pill chips: Google Health Connect, Fitbit, Garmin, Whoop, and a primary button "Connect my wearable" (#connect). On phones, stack the three cards vertically with the arrows pointing down.
4. Section "Traditional insurance vs PulseCover" (grey band): paragraph "Same protection. A very different way to decide your price.", then a 3-column comparison table (first column = row title). Header: empty | "Traditional insurer" (charcoal) | "PulseCover" (ruby red). The PulseCover column cells have a gold-tint background and bold text. Rows:
- How you are assessed | Traditional: Health questionnaire, medical exam, age, gender, family history | PulseCover: Your real activity, sleep and heart-rate data from your wearable
- How the price is set | Traditional: Fixed by your profile on the day you sign up | PulseCover: Adjusted once a year by your risk rating, within ±15%
- What you can do about it | Traditional: Nothing. Age and history do not change | PulseCover: Improve your habits and your rating, and your price follows
- What you see | Traditional: A yearly invoice | PulseCover: One simple grade with weekly and monthly summaries
- Claims and service | Traditional: Paper forms and long waits | PulseCover: Online claims with live status tracking
- Who underwrites | Traditional: The insurer sells and underwrites directly | PulseCover: PulseCover rates your risk; a licensed partner insurer underwrites
5. Section "Your PulseCover Risk Rating" (white): paragraph "Like a credit score, but for healthy living. One easy grade, updated weekly and rated monthly.", then the bands table (columns Grade, Score, What it means, Premium effect). Grade badges are coloured rounded boxes (A+ dark green #1C7A3C, A green #2B9348, B olive #8AA30F, C amber #D99A06, D orange #E8590C, E red #C92A2A) with white text (dark text on C):
  A+ | 90 - 100 | Excellent | -12% to -15%
  A | 75 - 89 | Very good | -7.5% to -11.7%
  B | 60 - 74 | Good | -3% to -7.2%
  C | 40 - 59 | Fair | -2.7% to +3%
  D | 25 - 39 | Needs attention | +3.3% to +7.5%
  E | 0 - 24 | High risk | +7.8% to +15%
6. Section "Find the plan that fits your life" (grey band): paragraph "Same fair-pricing idea in every plan. Pick the cover you need.", tabs All plans / Individual / Family that filter four plan cards (data in PROMPT 3), each card showing: NEW chip if new, type chip, "Plan X", three "Example coverage" bullets plus the line "Premium set by your risk rating, adjusted once a year within ±15%", "Base premium RM{price}/yr" and a "Learn more" button (#plans). Under them a primary button "View all plans" and the small note "Premiums shown are examples. Final premium depends on your wearable data at renewal, within the ±15% band.".
7. Section "Why people choose PulseCover" (white): six cards in a 3-column grid (2 on tablet, 1 on phone), each with an icon square, bold title and text:
- Lower price for healthy habits: Earn up to 15% off your yearly premium.
- Never a surprise: Capped at ±15%, repriced only at renewal, 12-month average.
- No health forms: Your wearable data replaces manual health declarations.
- Simple digital claims: File online and follow every status live.
- Your data stays yours: Opt-in, encrypted, never sold, never shown to employers.
- Rewards for sharing: RM10–20 credit for each friend who joins, plus leaderboard milestones.
8. Section "Built around what people told us" (white, two columns): LEFT a grey dashed image box "PHOTO: three people aged about 22, 30 and 42 smiling at a smartwatch". RIGHT H2, paragraph "We interviewed people aged 22, 30 and 42. All saw wearable-linked pricing as fairer and more motivating than flat premiums, and they told us what worried them. Each concern became a product rule.", and three small cards with a gold top border: ""Will one bad month spike my premium?"" - "No. We use a 12-month average and a hard ±15% cap. Sick, injured or travelling? Pause tracking from your dashboard."; ""Who sees my health data?"" - "Only you. It is encrypted, opt-in and never sold. Employers only ever see anonymised group totals."; ""I am a busy parent, not an athlete."" - "Moderate, sustainable activity like walking earns full marks. You do not need intense workouts.".
9. Charcoal section "Built on evidence, not guesswork": three big gold numbers with captions: "USD 556m" forecast Malaysian InsurTech market by 2034; "22%" of customers avoid claims because the digital process is frustrating; "3 of 3" interviewees found wearable-linked pricing fairer than flat premiums; and a gold button "Investors" (#investors).
10. Section "Tools to understand your cover": paragraph "Try the calculator, compare plans or see how the pricing rules work." and three linked cards: Calculator (#connect), Compare (#compare), How pricing works (#how).
11. Section "More ways PulseCover helps": three linked cards - "For your team" (#business), "When you need to claim" (#claims), "Your questions answered" (#faq), each with its text (Group cover that lowers cost as your workforce gets healthier. / File online in minutes and follow each step live. / Straight answers on pricing, privacy and claims.).
12. Deep-red gradient section "Let an advisor help you": left text "Answer your product questions, find the plan that suits your budget, and request a call back." with ticks "Answer your product enquiries", "Find a plan that fits your needs and budget", "Request a call back in your language" and a translucent image box "PHOTO: friendly advisor with headset at a laptop"; right a white form card containing the same call-back form as the modal.
13. Section "Stay in the loop": text "New features, wearable launches and offers. No spam.", one email input and a single-line button "Notify me"; save to Sheet "Waitlist"; success "You are on the list. Thank you!".
```

---

## PROMPT 3: plans and compare
```
Edit this same design and add the #plans view.
Hero row: H1 "Our plans", paragraph "Four example plans, one pricing idea: pay for how you live, within a capped ±15% band.", buttons "Get quote" (#connect) and "Talk to us" (opens call-back modal); right a grey dashed image box "PHOTO: woman checking a smartwatch after a morning walk".
A sticky sub-navigation bar under it: PulseCover-red label "Plans" and links All plans, Plan comparison, How pricing works, FAQ.
Main area, two columns: left a white filter card ("Browse") with checkboxes Plan type: Individual, Family; Sign up via: Online, Advisor (all ticked by default); right a list of plan cards that updates live.
PLAN DATA (exact):
 Plan A | base RM600/yr | cover up to RM100,000 | type Individual | sign up Online | NEW | coverage bullets: Example coverage A, B, C
 Plan B | base RM900/yr | cover up to RM250,000 | Individual | Online and Advisor | not new | Example coverage A, B, C, D
 Plan C | base RM1,500/yr | cover up to RM500,000 | Family | Advisor | not new | Example coverage A, B, C, D, E
 Plan D | base RM2,400/yr | cover up to RM1,000,000 | Family | Advisor | NEW | Example coverage A, B, C, D, E, F
Every plan card also has the bullet "Premium set by your risk rating, adjusted once a year within ±15%". Card layout: white, 14px radius, red "NEW" ribbon top-left, small caps label "LIFE & HEALTH PROTECTION", H3 "Plan X", gold chips for type and sign-up channels, bullet list with ruby check icons, line "Cover up to RM...", on the right "Base premium RM{base}/yr" in large ruby red and under it "Your price after wearable adjustment: RM{round(base*0.85)} - {round(base*1.15)}", and three buttons: "+ Compare" (toggle, shows "Added" with a tick), "Get quote" (goes to #connect with that plan preselected) and "Apply" (goes to #apply with that plan preselected). If no plan matches the filters show "No plans match your filters.". Under the list: "Plan names, prices and coverage items are examples and will be replaced with final product details.".
Compare: a dark bar fixed at the bottom appears when 1 to 3 plans are selected: "{n} plans selected (max 3)", names, gold button "Compare now" (scrolls to the table) and "Clear". Section "Plan comparison": a table with columns = selected plans (or all four if none selected) and rows: Base premium (per year), Best case (-15%) = base*0.85, Highest case (+15%) = base*1.15, Cover amount, Plan type, Sign up via, Coverage items.
```

---

## PROMPT 4: connect wearable, Risk Rating, calculator, apply (the heart of the product)
```
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
H1 "Connect your wearable", paragraph "Link once. PulseCover turns your daily data into a risk rating and a quote. No forms to fill.". Left column: four device buttons in a 2x2 grid - Google Health Connect, Fitbit, Garmin, Whoop - each with a small caption "Connect now" (or "Connected" in green when connected). Right column: a grey dashed image box "PHOTO: close-up of a wrist wearing a generic smartwatch next to a phone". Clicking a device opens a consent modal: title "Allow PulseCover to read your data?", the device name in bold, a checklist "Daily steps", "Exercise minutes", "Sleep hours", "Resting heart rate", the text "You can disconnect at any time from your dashboard.", buttons "Allow" and "Cancel". On Allow: mark that device connected and GENERATE 28 days of simulated readings (below), then show a result card: "Connected - 28 days of data found", the Risk Rating grade badge and "Score N/100", and a primary button "Apply" (#apply).
Below: a plan selector (Plan A to D) and a calculator card with four sliders - Average daily steps 0 to 20000 (step 250, default 7500), Exercise per week in minutes 0 to 400 (step 5, default 100), Average sleep hours per night 3 to 11 (step 0.25, default 7.5), Resting heart rate 40 to 100 (default 66) - and a checkbox "Add the premium app (RM5/month: deep insights and coaching)". Beside it a charcoal result card with a gold top border showing LIVE: "Your health score N / 100 (grade)", an adjustment badge (green if negative, grey if 0, orange if positive), Base premium, Wearable adjustment %, Your annual premium RM x/yr (large), about RM x per month, "You save vs the flat base RM x" (or "More than the flat base"), four score-breakdown bars (Steps, Exercise, Sleep, Heart rate, 0 to 100 each, gold bars) and a button "Apply with these numbers" (#apply with the same values). Under it the formula note: "Score = 35% steps + 30% exercise + 20% sleep + 15% heart rate. A score of 50 means no change. 100 means -15%, 0 means +15%. Premium = RM600 x (1 + adjustment)." and the small note "Indicative only. The final premium at renewal uses your 12-month average from your linked device.". Also a gold-tint card: "Prefer not to guess? Connect your wearable and we calculate it for you." with a button "Connect wearable".
Permissions section (two cards): "What you approve" (green ticks: Daily steps, Exercise minutes, Sleep hours, Resting heart rate) and "What we never access" (red crosses: Your location, Messages, photos or contacts, Anything you do not approve). Card: "Google Health Connect is the easiest route: it brings your Fitbit, Garmin and Whoop data together in one place.". Small note: "Prototype note: device connections are simulated in this demo. A live version would use each vendor's secure sign-in.".

C. SIMULATED 28-DAY DATA (deterministic per session)
Create a random profile once per session: baseSteps = 5500 + r1*5500; baseExerciseWeekly = 60 + r2*110; baseSleep = 6.2 + r3*2; baseHr = 54 + r4*18 (r1..r4 random 0 to 1).
For each of the last 28 days: factor = 0.85 on Saturday and Sunday else 1.05; steps = round(baseSteps*factor*(0.75 + r*0.5)); exerciseDailyMin = round(baseExerciseWeekly/7*factor*(0.6 + r*0.9)); sleep = round1(baseSleep + (r - 0.5)); restingHr = round(baseHr + (r - 0.5)*6) (a fresh r per value).
Averages used for scoring: steps = mean, exerciseMinPerWeek = mean(exerciseDailyMin)*7, sleep = mean, hr = mean. Weekly summaries: group days by calendar week starting Monday (up to 8 weeks), each with averages and its own score and grade.

D. #apply VIEW (a 4-step wizard with a progress bar: 1 Connect, 2 Rating and quote, 3 Details, 4 Confirm)
Step 1: plan picker (Plan A to D cards showing price), the four device buttons (same consent flow), a collapsible "No device yet? Enter typical numbers instead." with the four number inputs, and the premium-app checkbox. Button Next builds the quote from the 28-day averages if connected, otherwise from the typed numbers.
Step 2: a large ring showing the score (ruby red arc on grey), "Rating grade X - label", Base premium, Wearable adjustment %, Your annual premium, and a gold-tint note "Your rating and quote will be sent to our partner insurer for underwriting.".
Step 3: Beneficiary full name (required); Parent / guardian full name (required if the person is under 18; the applicant must also enter a date of birth on this step; refuse under 16 with the message "You must be at least 16 to register.").
Step 4: two required checkboxes - "I consent to PulseCover reading my steps, heart rate, sleep and exercise data from my wearable to price my policy." and "I have read how pricing works: base RM600, adjusted once a year within ±15%." - and a button "Confirm and start my cover".
On confirm: create a policy number "PC-2026-" plus 6 random hex characters in capitals, store the policy in STATE (plan, premium, grade, devices, start date today, renewal date +365 days), save the application as a row in the Canva Sheet "Applications" (columns: Timestamp, Plan, Premium, Grade, Score, Devices, Beneficiary, Guardian), and show "You are covered!" with the policy number and a button to #dashboard.
```

---

## PROMPT 5: dashboard (demo, in-session) and claims
```
Edit this same design and add the #dashboard view and the #claims view. The dashboard only works after the apply flow has created a policy in STATE; if there is none show "You do not have a policy yet." with buttons "Connect wearable" and "Get covered".
#dashboard:
- H1 "Welcome back" and four KPI cards: Policy (Plan X and policy number), Current premium (RM/yr), Risk Rating (grade badge plus N/100, computed from the 28-day average), Projected renewal premium (using the same scoring; show the % change).
- "Your quote journey": five pills - Wearable connected, Data analysed, Risk Rating issued, Sent to partner insurer (each with a tick in gold-tint) and Policy active (solid ruby red).
- Connected devices card: each connected device as a green pill with a "Disconnect" mini button and "Last sync" time; the unconnected devices as buttons "Connect a device".
- Weekly summary card: note "We summarise weekly and rate monthly. You do not need to check it every day."; a line chart of weekly scores (last up to 8 weeks, ruby-red line and dots, y-axis 0 to 100); a table "Week of | days | Steps | Exercise /wk | Sleep | Resting HR | Grade" for the last 6 weeks; a button "Refresh summary".
- Pause tracking card: text "Ill, injured, pregnant or travelling? Those days will not count against you.", Days 1 to 60, reason (Illness, Injury, Travel, Pregnancy, Other), button "Pause"; after pausing show a pill "Tracking paused until {date}" and disable refresh.
- Refer friends card: "Share your code. Each friend who joins and links a wearable earns you a RM10–20 credit.", a code "PC" + 6 random hex capitals, a "Copy link" button (copies text; shows "Copied!"), a count of friends referred (0), a leaderboard of 3 sample names, and the line "Milestones: 3 referrals = bronze, 10 = silver, 25 = gold".
- My claims card listing claims filed in STATE with reference, amount, status pill, and a button "File a claim" (#claims).
#claims: H1 "Claims", paragraph "File a claim in minutes and follow it in real time.". If no policy: "You need an active policy to file a claim.". Otherwise a form: Claim type (Hospitalisation, Outpatient, Critical illness, Accident, Death benefit), Claim amount (RM, must be above 0 and not more than the plan's cover), Date of incident (not in the future), What happened? (at least 10 characters), button "Submit claim". On submit: create reference "CL-" + 6 random digits, save a row in Sheet "Claims" (Timestamp, Reference, Plan, Type, Amount, Incident date, Description), show "Claim submitted. Reference: CL-######" and list the claim under "Track my claims" with a vertical timeline (Received timestamp; later statuses Under review, Approved, Paid are shown greyed as upcoming).
```

---

## PROMPT 6: remaining views (business, investors, how, compare, faq, privacy, contact)
```
Edit this same design and add these views, using the same design system.

#how: H1 "How your price is decided", paragraph "No black box. Here is every rule, published in plain language.". The same three-step flow cards as the home page. Six cards (2 columns) with numbered icon squares:
- A fixed base premium: Everyone starts from RM600 a year for a term life and health rider bundle. Age, gender and family history do not change it.
- Four signals from your wearable: Steps (35%), exercise minutes (30%), sleep (20%) and resting heart rate (15%). Eight thousand steps a day and 150 exercise minutes a week earn full marks, so walking counts.
- A capped band of ±15%: Your premium can go down by at most 15% or up by at most 15% versus the base, once a year at renewal. We keep it conservative so it is fair and actuarially defensible.
- Renewal uses your 12-month average: One busy month, an injury or a trip cannot raise your price. Repricing happens only at renewal, never mid-year, and you are notified before it applies.
- Pause tracking when life happens: Ill, injured, pregnant or travelling? Pause up to 60 days from your dashboard and those days are excluded from your average.
- Your data stays yours: Opt-in only, encrypted in transit and at rest, never sold, never shared with employers. See our privacy page.
Then H2 "Rating bands" with the bands table from the home view, two cards "What we summarise" - Daily steps, exercise minutes, sleep hours and resting heart rate, rolled into weekly summaries and one monthly rating. and "What we do not do" - We do not track your location, show minute-by-minute data, sell your data, or share individual data with employers., and a button "Try the calculator" (#connect).

#compare: H1 "How PulseCover compares", paragraph "Based on our market research of the Malaysian InsurTech landscape.". Table with columns Feature | PulseCover (gold tint) | AIA Vitality | Flat-rate insurance and rows:
- Prices on wearable data: PulseCover Yes | AIA Vitality Partial | Flat-rate No
- Wearable brands supported: PulseCover Fitbit, Garmin, Whoop via Google Health Connect | AIA Garmin partnership | Flat-rate None
- How it works: PulseCover Premium itself adjusts up to ±15% | AIA Wellness rewards add-on | Flat-rate Age, gender, family history
- Cost to join: PulseCover Built into the policy price | AIA RM10/month opt-in add-on | Flat-rate Fixed price
- Pricing method published: PulseCover Yes | AIA No | Flat-rate No
- Digital claims tracking: PulseCover Yes | AIA Partial | Flat-rate Partial
- Group / SME benefit: PulseCover Yes | AIA Partial | Flat-rate No
- Connects to your wearable: PulseCover Fitbit, Garmin, Whoop, Google Health Connect | AIA Garmin partnership | Flat-rate None
- Risk rating you can see: PulseCover Weekly summary and monthly grade | AIA Points and status levels | Flat-rate None
Footnote: "Competitor information is drawn from public sources (AIA Malaysia, The Edge Malaysia, 2026) and may change. BJAK and Fatberry are general-insurance comparison platforms and do not price on wearable data.".

#business: H1 "PulseCover for business", paragraph "An affordable group health and life benefit that actually engages your team. Bulk onboarding, low admin, privacy-safe reporting.". Three benefit cards: "Lower premiums as your team gets healthier" - Group discounts are tied to aggregate workforce activity.; "HR wellness dashboard" - Anonymised, aggregate engagement only. No individual health data is ever shared with the employer.; "Free onboarding support" - First cohort of partner SMEs get reduced group rates and free onboarding help.. SME calculator: sliders Number of employees 1 to 500 (default 25) and Expected average team health score 0 to 100 (default 60). LIVE outputs: adjustment = clamp(-((score-50)/50)*0.15, -0.15, 0.15); bulkDiscount = 5% if employees >= 100, 3% if >= 50, 2% if >= 10, else 0; perEmployeePerYear = 600*(1+adjustment)*(1-bulkDiscount); total = perEmployee * employees; saving vs flat RM600 per employee = 600*employees - total. Show: Per employee per year, Total per year, Wearable adjustment %, Bulk discount %, Saving vs flat RM600/employee. Enquiry form (Company name, Contact person, Email, Phone, Message) saved to Sheet "SME enquiries" (include the calculator values); success "Thanks! We will be in touch within 2 working days.". Under it: "SME associations and chambers of commerce: ask about our partner programme.".

#investors: H1 "Market, model and numbers", paragraph "The evidence and assumptions behind PulseCover. All figures are stated assumptions for a class project, not verified projections.". Four market cards: USD 41.2m (Malaysia InsurTech market, 2025), USD 556.0m (Forecast 2034), 32.5% (Forecast CAGR), 30,000 / 3m+ (AIA Vitality 2026 target vs 3m+ policyholders). Segments: "Primary: health-conscious, digital-first people who own wearables and are underinsured, starting in the Klang Valley. Year 1 target: 5,000 policyholders through social, wearable-brand partnerships and referrals." and "Secondary: SME employers offering a voluntary group health and life benefit, a slower-ramping channel in Year 1.". Business model: "PulseCover is a digital broker / MGA for one licensed underwriting partner, avoiding the multi-year cost of a full BNM insurance licence. Revenue: 25% distribution commission on the RM600 base premium plus an optional RM5/month premium app subscription (20% take-up assumed).". Year 1 financials (assumption-based) cards: Revenue RM 810,000; Total costs RM 1,475,268; Year 1 operating result RM -665,268; Breakeven policyholders 23,591; Fixed costs (annual) RM 843,600; Variable costs (annual) RM 631,668; Contribution margin per policy RM 35.76. Then "Breakeven is reached at about 23,591 policyholders against a 5,000 Year 1 target, expected in Years 2 to 3 as acquisition cost amortises and the risk pool scales.". A horizontal bar chart "Annual fixed costs by line (RM)" (monthly x 12): CEO 96,000; CTO 108,000; Lead Software Engineer 108,000; Backend Developer 72,000; Frontend Developer 72,000; Customer Support Rep 42,000; Head of Marketing 72,000; Head of Compliance 84,000; Legal retainer 18,000; Office rent (KL) 48,000; Cloud services 36,000; Dev tools 9,600; Security software 8,400; Other SaaS 6,000; Payment gateway (fixed) 3,600; Regulatory costs 24,000; Branding and PR 36,000. A second bar chart: Revenue 810,000 / Total costs 1,475,268 / Fixed costs 843,600. Note "Year 1 team: 9 paid roles". Key risks (3 cards): Securing a licensed underwriting partner who accepts wearable-informed pricing. | Reaching enough opt-in scale before adverse selection erodes the model. | Maintaining trust in biometric data handling: 77.8% of surveyed people cited privacy concerns.. Sources list: IMARC Group (2025) Malaysia insurtech market; PIDM (2026) Protection gaps among Malaysian consumers; World Bank (2026) Cost drivers in Malaysia's medical and health insurance/takaful sector; Surendran (2026) The Edge Malaysia; AIA Malaysia (2026); Carrier Management (2025); Solino-Fernandez et al. (2019); Holzapfel et al. (2024); Sliwinski and Kurylowicz (2021); Meyliana et al. (2019); MOSTI (2021) SUPER Roadmap 2021-2030.

#faq: H1 "Frequently asked questions" and these nine accordion items (only one open at a time):
Q: Do I need a medical exam?
A: No. Your wearable data replaces manual health declarations.
Q: What if I do not own a wearable?
A: You can enter readings manually while you get a device. Wearable partners offer onboarding bundles for new policyholders.
Q: Can my premium go up a lot?
A: No. The most it can move is 15% above the RM600 base, once a year at renewal, using a 12-month average.
Q: I am under 18. Can I join?
A: Yes from age 16, with a parent or guardian named on the application.
Q: Is there an upper age limit?
A: PulseCover is designed for every age group that uses a health tracker. Moderate activity like walking earns full marks.
Q: Who is the actual insurer?
A: A licensed partner insurer (Insurer Name Sdn Bhd) underwrites your policy. PulseCover operates as its registered broker / MGA.
Q: What does the app subscription add?
A: An optional RM5/month for deeper insights and coaching. It never changes your insurance price.
Q: How do claims work?
A: File online, upload details, and follow each status live. No paper forms.
Q: Which wearables work?
A: Fitbit, Garmin and Whoop, consolidated through Google Health Connect, on iOS and Android.

#privacy: H1 "Privacy and data governance", paragraph "Trust comes first. 77.8% of people worry about biometric privacy, so we treat governance as a precondition, not an afterthought.", five numbered cards (2 columns):
- What we collect: Only daily steps, exercise minutes, sleep hours and resting heart rate from your linked device, plus the details you give us to issue your policy. We do not collect location, messages or contacts.
- How we use it: To calculate your health score and your renewal premium within the published ±15% band, and to give you in-app insights. Never to sell, advertise to you or share with employers.
- Your controls: Sharing is opt-in. You can pause tracking, disconnect your device or request a copy or deletion of your data at any time, subject to insurance record-keeping law.
- How we protect it: Encryption in transit and at rest, strict access controls, hashed passwords and a compliance lead who owns BNM and personal-data-protection obligations.
- Fairness promise: We publish our pricing method, cap changes at ±15%, reprice only at renewal and tell you before. No algorithm change without notice.

#contact: H1 "Contact us", paragraph "Questions about cover, claims, partnerships or press? We reply within 2 working days.". Left a form: Full name, Email, Topic (General, Claims, Business / SME, Partnerships, Press), Message; save to Sheet "Contact" and show "Message sent. Thank you!". Right a details card: hello@pulsecover.example, +60 3-0000 0000, "Kuala Lumpur, Malaysia (Address to be added)", Instagram, TikTok, LinkedIn.
```

---

## PROMPT 7: English dictionary (for the language switch)
Open the file canva-code/translations-en.json, copy ALL of it and paste after this sentence:
```
Edit this same design. Add the language system. Create a JavaScript object I18N with the key "en" containing the JSON below. Change every piece of visible text across ALL views, menus, modals, buttons, placeholders, validation messages and the footer so that it reads from I18N[currentLang][key], falling back to I18N.en[key]. The JSON keys are the same as the identifiers below; map each existing text to the best matching key. After this change, nothing visible may be hard-coded. Do not change the layout or styling. JSON for "en":
[paste translations-en.json here]
```

## PROMPTS 8, 9, 10: Chinese, Malay, Tamil
For each language, copy the whole file (translations-zh.json, translations-ms.json, translations-ta.json) and paste after this sentence (change the code and name):
```
Edit this same design. Add the dictionary for the language "zh" (Chinese, shown in the dropdown as 中文) to the I18N object, using exactly the same keys as "en". When the user selects this language every visible string must switch. For Chinese use font Noto Sans SC; for Tamil use Noto Sans Tamil. If a key is missing fall back to English. JSON for "zh":
[paste translations-zh.json here]
```
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
