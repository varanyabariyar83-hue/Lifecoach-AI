# LifeCoach AI — PWA

Your personal AI life coach. Daily check-ins, trend analysis, voice & text recommendations.
Deployable to Cloudflare Pages in under 5 minutes.

---

## Files

```
lifecoach-pwa/
├── index.html      ← The entire app (single file)
├── manifest.json   ← PWA install config
├── sw.js           ← Service worker (offline support)
├── worker.js       ← Cloudflare Worker API proxy (optional)
├── icon-192.png    ← App icon (add your own)
├── icon-512.png    ← App icon (add your own)
└── README.md
```

---

## Deploy to Cloudflare Pages

1. Push this folder to a GitHub repo
2. Go to dash.cloudflare.com → Pages → Create project → Connect Git
3. Select your repo, leave build settings blank
4. Deploy — you'll get a `*.pages.dev` URL instantly

---

## Set up Cloudflare Worker (to hide your API key)

This is the same pattern you use for Varanasya AI PWA.

1. Go to dash.cloudflare.com → Workers → Create
2. Paste the contents of `worker.js`
3. Set your secret:
   ```
   wrangler secret put GROQ_API_KEY
   ```
   Or for Claude:
   ```
   wrangler secret put ANTHROPIC_API_KEY
   ```
4. Deploy the Worker
5. In the app → Settings → paste your Worker URL into "AI model endpoint"

---

## Add icons

Generate icons at https://maskable.app/editor or use any 192×192 and 512×512 PNG.
Save as `icon-192.png` and `icon-512.png` in this folder.

---

## Features

- Daily check-in with mood, energy, sleep, stress sliders
- Voice input (mic) using Web Speech API
- AI-powered recommendations via Claude Sonnet / Groq Llama
- Voice readback of recommendations
- 7-day trend bar chart
- Full check-in history (last 90 days, stored in localStorage)
- Streak tracking
- Cloudflare Worker proxy support (keeps API key off the client)
- Installable as PWA on Android & iOS
- Offline-capable via service worker

---

## Expo/React Native shell (Play Store)

To publish on Play Store, wrap in a WebView shell:
```js
// App.js
import { WebView } from 'react-native-webview';
export default () => (
  <WebView
    source={{ uri: 'https://your-lifecoach.pages.dev' }}
    mediaPlaybackRequiresUserAction={false}
    allowsInlineMediaPlayback
  />
);
```
