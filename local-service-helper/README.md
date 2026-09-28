# Local Service Helper — React

A React + Vite conversion of the original multi-page static site.

## Just open it in a browser (no install)

Double-click **`standalone/index.html`**. It is a pre-built bundle and works straight from disk (`file://`).

## Develop with Vite

```bash
npm install
npm run dev
```

Then open the printed local URL (usually http://localhost:5173).

## Structure

```
src/
  main.jsx              # entry point, mounts <App/> with BrowserRouter
  App.jsx               # routes
  pages/
    Home.jsx            # hero slider, services, how it works, about, contact
    Login.jsx
    Register.jsx
    ServicePage.jsx      # generic page used for all 6 service categories
  components/
    Header.jsx / Footer.jsx
    HeroSlider.jsx        # ported from script.js hero-slider logic
    ServiceIcon.jsx        # svg icons for the services grid
    ProfessionalCard.jsx   # a single professional/technician card
    BookingForm.jsx        # sidebar booking form used on every service page
  data/
    servicesData.js       # all copy + professionals + reviews per service
    homeData.js            # hero slides / services grid / how-it-works / about
  styles/
    style.css             # original global stylesheet (unchanged)
    service.css            # original service-page stylesheet (unchanged)
```

## Routes

Routing is hash-based (`#/services/plumbing`) via `src/router.jsx`, so no server config is needed.

| Path                         | Page                     |
|-------------------------------|--------------------------|
| `/`                            | Home                     |
| `/login`                       | Login                    |
| `/register`                    | Register                 |
| `/services/plumbing`           | Plumbing                 |
| `/services/electrical`         | Electrical               |
| `/services/cleaning`           | Home Cleaning            |
| `/services/carpentry`          | Carpentry                |
| `/services/appliance-repair`   | Appliance Repair         |
| `/services/painting`           | Painting                 |

## Notes on the conversion

- The six near-identical service pages (`plumbing.html`, `electrical.html`, etc.) were
  merged into **one** `ServicePage.jsx` component driven by `data/servicesData.js` —
  add a new service by adding an entry there, no new component needed.
- All interactivity (professional selection, toggling reviews, booking form
  validation, login/register validation, the hero slider, scroll-reveal
  animations) was ported from `script.js` / `service.js` into React state and
  `useEffect` hooks — no jQuery-style DOM queries remain.
- Your original `index.html` only contained the Vite entry shell (no homepage
  markup was supplied), so the homepage sections (hero slider content, services
  grid, "How It Works", "About", "Contact") were rebuilt to match the classes
  already defined in `style.css` (`.hero`, `.services`, `.how-it-works`,
  `.about`, `.contact`, etc.). Feel free to edit the copy in `data/homeData.js`.
- The footer markup differed slightly between pages in the original site
  (service pages used a two-column flex footer, login/register used a plain
  one). This conversion standardizes on the two-column version everywhere via
  one shared `Footer.jsx`.
- Some professional photo URLs in the original files point at third-party
  sites (Shutterstock previews, Vecteezy thumbnails, Google's cached image
  proxy, etc.) that may not stay reachable long-term — an `onError` fallback
  swaps in an Unsplash placeholder if any image fails to load, matching the
  original `service.js` behavior.
