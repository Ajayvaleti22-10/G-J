# G&J Window Tinting & Auto Restyling — Website

## 🚀 Quick Start

Upload all files to your web host's `public_html` (or `www`) folder.

---

## 📋 Google Form Setup (Contact / Quote Form)

1. Go to [forms.google.com](https://forms.google.com) and **create a new form**
2. Suggested fields:
   - Full Name (Short answer)
   - Phone Number (Short answer)
   - Email Address (Short answer)
   - Service Interested In (Dropdown: Auto Tint / Home Tint / Commercial / Heavy Equipment / UTV / Starlight Headliner / Headliner Replacement / Other)
   - Vehicle or Property Description (Short answer)
   - Additional Notes (Paragraph)
3. Click **Send** → **< >** (Embed tab) → copy the form URL
4. From the URL, copy only the **Form ID** part:
   ```
   https://docs.google.com/forms/d/e/XXXXXXXXXXXXXX/viewform
                                     ^^^^^^^^^^^^^^ copy this
   ```
5. Open `js/main.js` and paste your Form ID:
   ```js
   const GOOGLE_FORM_ID = 'YOUR_FORM_ID_HERE';
   ```
6. Save and re-upload `js/main.js`

Responses will appear in your Google Form's **Responses** tab, and you can set up email notifications there too.

---

## 📁 File Structure

```
/
├── index.html          Main website page
├── css/
│   └── style.css       All styles
├── js/
│   └── main.js         Interactions + Google Form wiring
├── sw.js               Service Worker (caching / offline)
├── .htaccess           Apache security headers + caching
├── robots.txt          SEO crawl rules
├── sitemap.xml         SEO sitemap
└── README.md           This file
```

---

## 🔒 Security Features

- **HTTPS redirect** via .htaccess
- **Content Security Policy** (CSP) headers
- **X-Frame-Options**, **X-Content-Type-Options**, **HSTS**
- **Directory listing** disabled
- **Sensitive file access** blocked
- **External link protection** (noopener noreferrer) applied automatically via JS
- **Google Form ID validation** — only safe characters accepted

---

## ⚡ Performance Features

- **Service Worker** caching (CSS, JS, fonts, images served from cache)
- **GZIP compression** via .htaccess
- **Browser cache headers** tuned per asset type
- **Intersection Observer** — map and form loaded only when scrolled into view
- **Lazy loading** on iframes

---

## 🗺️ Update Google Maps

The map in the website uses an embedded Google Maps iframe. To get a more accurate embed:

1. Go to [maps.google.com](https://maps.google.com)
2. Search: `427 20th Street NW Cedar Rapids IA 52405`
3. Click **Share** → **Embed a map** → copy the `src` URL from the iframe code
4. In `index.html`, find the `<iframe>` inside `.map-section` and replace the `src` attribute with your new URL

---

## 🌐 Deployment Checklist

- [ ] Upload all files to `public_html`
- [ ] Make sure `.htaccess` is uploaded (it may be hidden — enable "show hidden files" in your FTP client)
- [ ] Set Google Form ID in `js/main.js`
- [ ] Update domain in `sitemap.xml` and `robots.txt`
- [ ] Update the `<link rel="canonical">` in `index.html` with your real domain
- [ ] Update Open Graph `og:url` in `index.html`
- [ ] Test HTTPS redirect is working
- [ ] Add a favicon (`favicon.ico`) to the root folder

---

## 📞 Business Info (for reference)

- **Business:** G&J Window Tinting & Auto Restyling
- **Phone:** (319) 310-9012
- **Email:** gjwindowtintanddetail@gmail.com
- **Address:** 427 20th Street NW, Cedar Rapids, IA 52405
- **Hours:** Always Open — By Appointment
- **Facebook:** https://www.facebook.com/share/1D8xxvSvEb/
- **Booking:** https://app.tintwiz.com/web/cs/anvk2jickwmayuk4
