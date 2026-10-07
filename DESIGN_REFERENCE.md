# Design reference: 5 Malaysian insurer sites (captured 2026-10-07)

Sources: Sun Life Family Takaful, Great Eastern Health Insurance, AIA Medical Protection, Allianz HealthAssured, Prudential Medical.
Method: live pages opened at ~1366px width, popups/cookie banners dismissed, computed styles + DOM + screenshots read.

## 1. Header anatomy (common pattern across all five)
| Element | Sun Life | Great Eastern | AIA | Allianz | Prudential |
|---|---|---|---|---|---|
| Logo position | top-left | top-left | top-left (small, inside rounded floating header card) | top-left | top-left |
| Top utility bar | none | notice banner (scam alert, dismissible X) | dismissible info banner "Update mobile number" | "Personal Insurance" audience dropdown + Login | Contact Us, Online Payment, PruBSN |
| Primary nav | About Us, Insurance and Takaful, Campaigns, Client Care, Contact Us | Personal insurance / Corporate solutions / About us ; sub-row: Buy Online, Products, Claims, Rewards & promotions, Greatpedia, Digital services | Products, AIA Vitality, Knowledge Hub, About AIA, Help & Support | Life Health & Savings, Home Motor & Travel, What's New, Media Hub, Help & Services, About Allianz, Make a Claim | Products, Services & Claims, Knowledge Corner, Work With Us, About Us |
| Search | collapsing search bar (#collapseSearch) "What are you looking for today?" | search icon, "Search keywords, products, topics and more..." with Clear | search icon, "Type your query here" | "Search" text+icon, "To search start typing.." | circular pink icon button, "Type to search" |
| Login | "Login" dropdown (SunAccess client login) | "Log in" top-right with person icon (eConnect) | outlined "Login / Register" button + solid "Contact us" button | outlined "Login" button top-right | person icon + "Log in" text |
| Language | "Malaysia | EN" | footer region/language list (Malaysia EN, SG EN/中文, Takaful EN/BM, Indonesia, Brunei) | "BM" toggle | "中文点击这里" (Chinese version) button on page | footer country list |
| Mobile | hamburger, collapsing | hamburger | hamburger | hamburger | hamburger |
| Sticky | yes | no (menu opens as full-width panel) | yes, fixed header 136px incl. banner | no | hides on scroll-down (`header__container hide` slides back) |

Mega menus: GE = icon grid in 4 columns (Life and health / Wealth / Lifestyle / Prestige) + 4 text links beneath (Browse all products, Product riders, Product benefits updates, Product disclosure sheet). AIA = "For individuals | For corporations" toggle, two columns of icon+label rows with chevrons. Allianz = 5-column text list per category with "Overview" arrow link on top. Prudential = dropdown chevrons per nav item (Products: Life, Critical Illness, Medical, Infant & Child, Wealth & Legacy, Savings & Investments, EPF i-Lindung, PRUDirect, Employee Plans, Credit Life).

## 2. Floating / persistent widgets (everything that sits on top of the page)
- Sun Life: live-chat bubble bottom-right (mascot "Sunny", eye-catcher speech bubble "Hi! I'm Sunny here..."), vertical "Feedback" tab on right edge (mid-height).
- Great Eastern: reCAPTCHA badge bottom-right; "Your feedback is important to us" survey modal (purpose-of-visit radio list + Next); scam-alert banner with X.
- AIA: welcome promo modal ("Welcome to AIA! Click here to find out more today!") with round X; cookie bar bottom with Accept; top info banner with X.
- Allianz: cookie notice top banner with X.
- Prudential: floating dark-maroon pill "Contact Us Now" (paper-plane icon) bottom-right; cookie bar bottom with "Close".
- All five: cookie/consent notice; four of five: reCAPTCHA on lead forms.

## 3. Page structure (product/category page)
1. Breadcrumb (all five)
2. Hero: AIA = icon+title+sentence+2 buttons (outlined "Learn more", solid "Talk to an AIA Life Planner") + illustration; Prudential = split hero (photo left, big headline + subtext + red pill "Get In Touch" + outlined "中文点击这里" right); Allianz = full-width lifestyle photo faded into white, centred light-weight title; Sun Life = wide photo banner then title.
3. Sub-navigation tabs: AIA category tabs (All / Life / Medical / Critical Illness / Lady) with active underline; Allianz sticky section bar (Product info, Downloads, Get in touch); Prudential tab "Medical Insurance" with red underline.
4. Plan cards: AIA = horizontal cards with red "NEW" ribbon, plan name, uppercase category label, "AIA Vitality" pill, 2 bullets, "+ Compare" outlined button, filter sidebar (checkbox groups: With AIA Vitality, Insurance Type, Plan Type, Sign up via) and Sort by; Prudential = 3-col white cards on light-grey band, bullets, divider, red "Learn more ->"; GE = featured card (star "Featured" badge, check-circle bullet list, outlined "Learn more" + solid red "Talk to us") then 3-col card grid; Sun Life = cards tagged AGENCY / BANCATAKAFUL / ONLINE channel labels.
5. Benefits grid with icons (Allianz: Welcome Benefit & No Claim Benefit, Flexible Cost Saving Options, High Annual Limit, No Room & Board Limit, Personalised Cancer Care, Bereavement Benefit) + "Value-Added Services" cards.
6. Educational/explainer block (GE "Health cover when you need it most", Prudential Deductible/Co-insurance explainer).
7. Tools: GE "Get a sense of your protection and financial needs" financial tools; Sun Life tools & calculators.
8. Downloads (Allianz brochures EN/BM).
9. Trust block (Prudential "We've helped over 7 million lives"; Prudential "Promises, made real").
10. Cross-sell cards (Life / Critical Illness / Wealth & Legacy; GE More life and health solutions).
11. FAQ accordion (all five; Prudential has 18 with "Expand all"; GE "Show more").
12. Lead form "Talk to an advisor / Get in touch": Sun Life (name, phone, email, state, need, language radio, data-protection checkbox, reCAPTCHA); GE (name, DOB, gender, marital status, phone, email, location, preferred language, marketing consent); Allianz (name per NRIC, +60 phone, email, gender, age, language, state, location, privacy checkbox, CLEAR / SUBMIT); Prudential (existing customer radio, first name, surname, contact method, phone, email, NRIC/passport, nearest location, language, consent).
13. Footer: columns of links (product / support / company), contact phone + email, social icons (FB, IG, YouTube, LinkedIn, TikTok), app-store badges (GE), regulatory strip (PIDM TIPS brochure, company registration numbers), privacy / T&C / sitemap, country list.

## 4. Design tokens
| | Primary | Text | Other | Font | Button radius | Card |
|---|---|---|---|---|---|---|
| Sun Life | navy-teal rgb(0,57,70) #003946, gold #FEBE10 | #202223 | link amber #AC6100 | Sunlife (custom) | 6px | flat grey panels #F4F7F7 |
| Great Eastern | crimson #D31145 | #333D47 | grey #D6D8DA, pink tint #FFDDE0 | OpenSans | 8px, 14-16px semibold | white card + soft shadow |
| AIA | red #D23B44 | #333 / #565656 | greys | Public Sans (body), AIAEverest (h1 48px/500) | pill/9999px (login) , 50px | white rounded card, light shadow, top-left ribbon |
| Allianz | blue #006192 (hover #007AB3) | #414141 | light blue-grey #ECF0F8 | Allianz Neo (h1 54px weight 300) | 4px, 2px outline | flat, light |
| Prudential | red #DA291C | #202020 / #1C1D1B | pink tint #FBEAE8, maroon #6D150E | Open Sans (h1 48px/300, h2 32px/600) | pill 96px, 12x24 padding | white card, soft shadow on #F8F9FB-ish band |

Shared conventions: white page background, one brand accent colour for CTAs, dark-grey (not black) text, 8-16px radii on cards, pill primary CTA + outlined secondary CTA pair, light grey section bands alternating with white, large light-weight H1 (48-54px) over photography of families, icons in brand colour, generous whitespace, 1100-1200px content container.

## 5. Content patterns worth copying into PulseCover
- "Compare" on plan cards (AIA) -> PulseCover plan tiers vs flat rate.
- "Talk to an advisor" lead form (all) -> add to PulseCover (request-a-call-back with state/language).
- Wellness reward framing (GE "Wellness Bonus every two years by staying healthy"; AIA Vitality; Allianz 20% No Claim Benefit) -> PulseCover's +/-15%.
- Regulatory footer (PIDM TIPS, registration numbers).
- Floating chat/contact pill and feedback tab.
- Tools/calculators section and downloads (brochure EN/BM).
- Language/region toggle in header (AIA: BM; Prudential: Chinese) -> PulseCover 4-language dropdown already.
