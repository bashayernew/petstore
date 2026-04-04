import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dir = __dirname;

const backup = fs.readFileSync(path.join(dir, "_full-backup.html"), "utf8").split(/\r?\n/);

function lines(a, b) {
  return backup.slice(a - 1, b).join("\n");
}

function head(title, page) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="description" content="PetHub — Kuwait’s integrated pet services platform." />
  <title>${title}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=Fraunces:ital,opsz,wght@0,9..144,500;0,9..144,600;0,9..144,700;0,9..144,800&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="css/styles.css" />
</head>
<body data-page="${page}">
  <a class="skip-link" href="#main">Skip to content</a>
`;
}

function header() {
  return `  <header class="header" id="top">
    <div class="header__inner container">
      <div class="header__brand">
        <a class="logo" href="index.html" aria-label="PetHub home">
          <span class="logo__graphic" aria-hidden="true">
            <img class="logo__img" src="imges/logopet.webp" width="200" height="60" alt="" loading="eager" decoding="async" fetchpriority="high" />
          </span>
          <span class="logo__text">PetHub</span>
        </a>
      </div>
      <nav class="header__nav nav" aria-label="Main">
        <button type="button" class="nav__scrim" id="nav-scrim" aria-label="Close menu" tabindex="-1" hidden></button>
        <div class="nav__panel" id="nav-panel">
          <div class="nav__panel-head">
            <span class="nav__panel-title">Menu</span>
            <button type="button" class="nav__close" id="nav-close" aria-label="Close menu">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
          </div>
          <ul class="nav__links">
            <li><a href="index.html" class="nav__link" data-nav="home">Home</a></li>
            <li><a href="services.html" class="nav__link" data-nav="services">Services</a></li>
            <li><a href="marketplace.html" class="nav__link" data-nav="marketplace">Marketplace</a></li>
            <li><a href="shop.html" class="nav__link" data-nav="shop">Shop</a></li>
            <li><a href="bookings.html" class="nav__link" data-nav="bookings">Bookings</a></li>
            <li><a href="about.html" class="nav__link" data-nav="about">About</a></li>
            <li><a href="contact.html" class="nav__link" data-nav="contact">Contact</a></li>
          </ul>
          <div class="nav__mobile-actions" data-guest-only>
            <a href="signin.html?mode=signup" class="btn btn--primary btn--sm header__cta btn--block">Get Started</a>
            <a href="signin.html" class="btn btn--outline btn--sm btn--block">Sign in</a>
          </div>
          <div class="nav__mobile-account" data-user-only hidden>
            <p class="nav__mobile-account-name"><span data-user-display></span></p>
            <a href="bookings.html" class="nav__mobile-link">My account</a>
            <a href="bookings.html" class="nav__mobile-link">Bookings</a>
            <a href="bookings.html#dash-saved" class="nav__mobile-link">Saved pets</a>
            <button type="button" class="btn btn--signout btn--sm btn--block" data-sign-out>Sign out</button>
          </div>
        </div>
      </nav>
      <div class="header__actions">
        <div class="header__search-popover" id="header-search-popover">
          <button type="button" class="header__icon-btn header__search-toggle" id="header-search-toggle" aria-expanded="false" aria-controls="header-search-dropdown" aria-label="Open search">
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
          </button>
          <div id="header-search-dropdown" class="header__search-dropdown" role="dialog" aria-label="Search" aria-hidden="true">
            <div class="header__search header__search--popover" role="search">
              <label class="visually-hidden" for="global-search">Search services, pets, products</label>
              <svg class="header__search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
              <input type="search" id="global-search" class="header__search-input" placeholder="Search services, pets, products..." autocomplete="off" />
            </div>
          </div>
        </div>
        <div class="header__guest-actions" data-guest-only>
          <a href="signin.html" class="header__signin-link">Sign in</a>
          <a href="signin.html?mode=signup" class="btn btn--primary btn--sm header__cta">Get Started</a>
        </div>
        <div class="header__account-menu" data-user-only hidden>
          <button type="button" class="header__account-trigger" id="header-account-trigger" aria-expanded="false" aria-haspopup="true" aria-controls="header-account-dropdown">
            <span class="header__avatar" aria-hidden="true">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" aria-hidden="true"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            </span>
            <span class="header__account-name" data-user-display aria-live="polite"></span>
            <svg class="header__account-chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>
          </button>
          <div id="header-account-dropdown" class="header__account-dropdown" role="menu" hidden>
            <a role="menuitem" href="bookings.html" class="header__account-item">My account</a>
            <a role="menuitem" href="bookings.html" class="header__account-item">Bookings</a>
            <a role="menuitem" href="bookings.html#dash-saved" class="header__account-item">Saved pets</a>
            <button type="button" role="menuitem" class="header__account-item header__account-item--danger" data-sign-out>Sign out</button>
          </div>
        </div>
        <div class="header__icons" aria-label="Quick actions">
          <button type="button" class="header__icon-btn" data-open-chat aria-label="Support chat">
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" aria-hidden="true"><path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8.5z"/></svg>
          </button>
          <button type="button" class="header__icon-btn" data-open-cart aria-label="Shopping cart">
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" aria-hidden="true"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"/></svg>
            <span class="header__cart-count" data-cart-count hidden>0</span>
          </button>
        </div>
        <button type="button" class="nav__toggle" aria-expanded="false" aria-controls="nav-panel" aria-label="Open menu">
          <span class="nav__toggle-bar"></span><span class="nav__toggle-bar"></span><span class="nav__toggle-bar"></span>
        </button>
      </div>
    </div>
  </header>
  <div class="toast-host" id="toast-host" aria-live="polite"></div>
`;
}

const footer = `  <footer class="footer" id="site-footer">
    <div class="container footer__grid">
      <div class="footer__brand">
        <a class="logo logo--footer" href="index.html" aria-label="PetHub home"><span class="logo__graphic" aria-hidden="true"><img class="logo__img" src="imges/logopet.webp" width="160" height="48" alt="" decoding="async" /></span><span class="logo__text">PetHub</span></a>
        <p class="footer__tagline">Everything your pet needs in one place — Kuwait.</p>
        <div class="footer__social" aria-label="Social">
          <a href="#" class="social-link" aria-label="Instagram">IG</a>
          <a href="#" class="social-link" aria-label="X">X</a>
        </div>
      </div>
      <div>
        <h3 class="footer__heading">Explore</h3>
        <ul class="footer__list">
          <li><a href="index.html">Home</a></li>
          <li><a href="services.html">Services</a></li>
          <li><a href="marketplace.html">Marketplace</a></li>
          <li><a href="shop.html">Shop</a></li>
          <li><a href="bookings.html">Bookings</a></li>
        </ul>
      </div>
      <div>
        <h3 class="footer__heading">Company</h3>
        <ul class="footer__list">
          <li><a href="about.html">About</a></li>
          <li><a href="contact.html">Contact</a></li>
          <li><a href="signin.html">Sign in</a></li>
        </ul>
      </div>
      <div>
        <h3 class="footer__heading">Contact</h3>
        <ul class="footer__list footer__contact">
          <li><a href="mailto:hello@pethub.kw">hello@pethub.kw</a></li>
          <li><a href="tel:+96500000000">+965 0000 0000</a></li>
          <li>Kuwait City</li>
        </ul>
      </div>
    </div>
    <div class="container footer__bottom">
      <p>&copy; <span id="year"></span> PetHub. All rights reserved.</p>
      <p class="footer__legal"><a href="#">Privacy</a> · <a href="#">Terms</a></p>
    </div>
  </footer>
`;

const overlayHead = lines(950, 990);
const overlayTail = lines(1094, 1144);
const globalOverlays = overlayHead + "\n" + overlayTail + "\n";

const modalBooking = lines(992, 1057);
const modalBookingSuccess = lines(1059, 1067);
const bookingModals = modalBooking + "\n" + modalBookingSuccess;

const listingModals = lines(1069, 1092);

const rescheduleModal = `
  <div class="modal" id="modal-reschedule" role="dialog" aria-modal="true" aria-labelledby="reschedule-title" hidden aria-hidden="true">
    <div class="modal__backdrop" data-modal-close tabindex="-1"></div>
    <div class="modal__panel glass-panel modal__panel--sm">
      <button type="button" class="modal__close" data-modal-close aria-label="Close">×</button>
      <h2 id="reschedule-title" class="modal__title">Reschedule visit</h2>
      <p class="modal__muted" id="reschedule-service-label"></p>
      <form id="form-reschedule" class="booking-form" novalidate>
        <label class="field"><span class="field__label">New date</span><input type="date" name="rescheduleDate" id="reschedule-date-input" class="input" required /></label>
        <div class="field"><span class="field__label">New time</span>
          <div class="time-slots" role="group">
            <button type="button" class="time-slot" data-time="9:00 AM">9:00 AM</button>
            <button type="button" class="time-slot" data-time="11:30 AM">11:30 AM</button>
            <button type="button" class="time-slot" data-time="2:00 PM">2:00 PM</button>
            <button type="button" class="time-slot" data-time="4:30 PM">4:30 PM</button>
            <button type="button" class="time-slot" data-time="6:00 PM">6:00 PM</button>
          </div>
        </div>
        <button type="submit" class="btn btn--primary btn--block">Save new schedule</button>
      </form>
    </div>
  </div>
`;

const script = `
  <script src="js/pethub.js"></script>
</body>
</html>
`;

const forgotModal = `
  <div class="modal" id="modal-forgot" role="dialog" aria-modal="true" aria-labelledby="forgot-title" hidden aria-hidden="true">
    <div class="modal__backdrop" data-modal-close tabindex="-1"></div>
    <div class="modal__panel glass-panel modal__panel--sm">
      <button type="button" class="modal__close" data-modal-close aria-label="Close">×</button>
      <h2 id="forgot-title" class="modal__title">Reset password</h2>
      <p class="modal__muted">Demo — we’ll email a reset link to your address.</p>
      <form id="form-forgot-demo" novalidate>
        <label class="field"><span class="field__label">Email</span><input type="email" id="forgot-email-input" class="input" autocomplete="email" required /></label>
        <button type="submit" class="btn btn--primary btn--block">Send reset link</button>
      </form>
    </div>
  </div>
`;

const homeHero =
  lines(64, 116)
    .replace(/href="#booking"/g, 'href="services.html"')
    .replace(/href="#marketplace"/g, 'href="marketplace.html"')
    .replace(
      '<div class="float-pill float-pill--1" data-float>Vet Booking</div>',
      '<a href="services.html" class="float-pill float-pill--1" data-float>Vet Booking</a>'
    )
    .replace(
      '<div class="float-pill float-pill--2" data-float>Grooming</div>',
      '<a href="services.html?q=grooming" class="float-pill float-pill--2" data-float>Grooming</a>'
    )
    .replace(
      '<div class="float-pill float-pill--3" data-float>Pet Taxi</div>',
      '<a href="services.html?q=transport" class="float-pill float-pill--3" data-float>Pet Taxi</a>'
    )
    .replace(
      '<div class="float-pill float-pill--4" data-float>Marketplace</div>',
      '<a href="marketplace.html" class="float-pill float-pill--4" data-float>Marketplace</a>'
    )
    .replace(
      '<div class="float-pill float-pill--5" data-float>Pet Supplies</div>',
      '<a href="shop.html" class="float-pill float-pill--5" data-float>Pet Supplies</a>'
    )
    .replace(
      /src="https:\/\/images\.unsplash\.com\/photo-1450778869180-41d0581a4deb[^"]*"/,
      'src="images/dogwalk.jpg"'
    )
    .replace(
      /alt="Person with a happy golden retriever outdoors"/,
      'alt="Person walking a happy dog outdoors"'
    )
    .replace(/width="900"\s+height="1100"/, 'width="800" height="520"') + "\n";

const homeTrust = lines(118, 147) + "\n";

const homeQuick = `    <section class="section section--home-quick" id="explore" aria-labelledby="quick-title">
      <div class="container">
        <header class="section__head reveal">
          <p class="eyebrow">Start here</p>
          <h2 id="quick-title" class="section__title">Your pet hub in <span class="text-gradient">four taps</span></h2>
          <p class="section__lead">Book care, browse adoptable pets, stock up on supplies, or open your dashboard — all synced across PetHub.</p>
        </header>
        <div class="home-quick-grid reveal">
          <a href="services.html" class="home-quick-card glass-panel">
            <div class="home-quick-card__icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg></div>
            <h3 class="home-quick-card__title">Services</h3>
            <p class="home-quick-card__text">Vets, grooming, walking, and transport.</p>
            <span class="home-quick-card__cta">Book care →</span>
          </a>
          <a href="marketplace.html" class="home-quick-card glass-panel">
            <div class="home-quick-card__icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg></div>
            <h3 class="home-quick-card__title">Marketplace</h3>
            <p class="home-quick-card__text">Find companions from verified sellers.</p>
            <span class="home-quick-card__cta">Browse pets →</span>
          </a>
          <a href="shop.html" class="home-quick-card glass-panel">
            <div class="home-quick-card__icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"/></svg></div>
            <h3 class="home-quick-card__title">Shop</h3>
            <p class="home-quick-card__text">Food, toys, beds, and travel gear.</p>
            <span class="home-quick-card__cta">Shop now →</span>
          </a>
          <a href="bookings.html" class="home-quick-card glass-panel">
            <div class="home-quick-card__icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg></div>
            <h3 class="home-quick-card__title">Bookings</h3>
            <p class="home-quick-card__text">Visits, orders, saved pets, profiles.</p>
            <span class="home-quick-card__cta">Open hub →</span>
          </a>
        </div>
      </div>
    </section>
`;

const homeSmart = lines(664, 711) + "\n";
const homePetProfiles = lines(713, 758) + "\n";
const homeSteps = lines(760, 774) + "\n";
const homeTestimonials = lines(861, 886) + "\n";

const homeCta = `    <section class="cta" id="cta" aria-labelledby="cta-title">
      <div class="container cta__inner reveal">
        <div class="cta__glow" aria-hidden="true"></div>
        <h2 id="cta-title" class="cta__title">Book trusted pet services today</h2>
        <p class="cta__text">Everything your pet needs — vets, walkers, transport, marketplace, shop, and health tools — in one elegant platform built for Kuwait.</p>
        <div class="cta__actions">
          <a href="signin.html?mode=signup" class="btn btn--primary btn--lg">Get Started</a>
          <a href="services.html" class="btn btn--outline btn--lg">Browse services</a>
        </div>
      </div>
    </section>
`;

const aboutMain = `  <main id="main" class="about-page">
    <section class="hero page-hero page-hero--about">
      <div class="container">
        <p class="eyebrow">About PetHub</p>
        <h1 class="page-hero__title">Pet care infrastructure for <span class="text-gradient">Kuwait</span></h1>
        <p class="page-hero__lead">We connect families with verified providers, ethical sellers, and the products pets need — with safety and clarity at the center.</p>
        <ul class="about-hero__stats" aria-label="Platform highlights">
          <li><strong>200+</strong><span>Verified providers</span></li>
          <li><strong>5K+</strong><span>Pet families</span></li>
          <li><strong>24/7</strong><span>Emergency line</span></li>
          <li><strong>KW</strong><span>Nationwide</span></li>
        </ul>
      </div>
    </section>
    <section class="section section--about-band">
      <div class="container about-page-grid">
        <article class="about-mission glass-panel reveal">
          <div class="about-mission__mark" aria-hidden="true">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
          </div>
          <p class="eyebrow">Mission</p>
          <h2 class="section__title section__title--sm">One trustworthy place for every pet moment</h2>
          <p class="about-page__text">PetHub exists to remove friction from pet care in Kuwait: fewer phone trees, fewer uncertain sellers, and no more scattered medical notes. We build tools owners actually use every week.</p>
        </article>
        <article class="about-mission glass-panel reveal">
          <div class="about-mission__mark about-mission__mark--vision" aria-hidden="true">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/><path d="M4.93 4.93l4.24 4.24"/></svg>
          </div>
          <p class="eyebrow">Vision</p>
          <h2 class="section__title section__title--sm">A national standard for pet safety &amp; service quality</h2>
          <p class="about-page__text">We’re working toward a future where every booking is traceable, every listing is verified, and emergency help is always one tap away — in Arabic and English, across the country.</p>
        </article>
      </div>
    </section>
    <section class="section section--about-features">
      <div class="container">
        <header class="section__head reveal">
          <p class="eyebrow">Why choose us</p>
          <h2 class="section__title">Built for <span class="text-gradient">real pet life</span></h2>
          <p class="section__lead">Verification, transparency, and health context — designed around how Kuwaiti pet families operate day to day.</p>
        </header>
        <div class="about-features-grid">
          <article class="about-feature glass-panel reveal">
            <div class="about-feature__icon" aria-hidden="true"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></div>
            <h3 class="about-feature__title">Verified network</h3>
            <p class="about-feature__text">Clinics, groomers, walkers, and drivers pass baseline checks before they appear on PetHub.</p>
          </article>
          <article class="about-feature glass-panel reveal">
            <div class="about-feature__icon" aria-hidden="true"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg></div>
            <h3 class="about-feature__title">Transparent marketplace</h3>
            <p class="about-feature__text">Structured listings, save-for-later, and secure inquiry flows reduce scams and confusion.</p>
          </article>
          <article class="about-feature glass-panel reveal">
            <div class="about-feature__icon" aria-hidden="true"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"><path d="M4.5 12.5l5 5L22 5"/><path d="M12 21a9 9 0 100-18 9 9 0 000 18z" opacity=".35"/></svg></div>
            <h3 class="about-feature__title">Health-aware</h3>
            <p class="about-feature__text">Pet profiles, vaccination fields, and reminders keep medical context where it belongs.</p>
          </article>
          <article class="about-feature glass-panel reveal">
            <div class="about-feature__icon" aria-hidden="true"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg></div>
            <h3 class="about-feature__title">Kuwait-first</h3>
            <p class="about-feature__text">Coverage, language, and support hours reflect how families actually live and work here.</p>
          </article>
        </div>
      </div>
    </section>
    <section class="section section--about-trust">
      <div class="container">
        <header class="section__head reveal">
          <p class="eyebrow">Trust &amp; safety</p>
          <h2 class="section__title">How we <span class="text-gradient">protect pets &amp; people</span></h2>
          <p class="section__lead">Clear processes and responsive escalation — so you always know what happens next.</p>
        </header>
        <div class="trust-safety-grid reveal">
          <div class="trust-safety-card glass-panel">
            <div class="trust-safety-card__icon" aria-hidden="true"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><path d="M12 9v4M12 17h.01"/></svg></div>
            <h3>Reporting</h3>
            <p>Every listing and provider profile supports escalation paths so issues are reviewed quickly.</p>
          </div>
          <div class="trust-safety-card glass-panel">
            <div class="trust-safety-card__icon" aria-hidden="true"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/></svg></div>
            <h3>Secure payments</h3>
            <p>Checkout and booking flows are designed for encrypted handling and clear receipts (demo — no real charges).</p>
          </div>
          <div class="trust-safety-card glass-panel">
            <div class="trust-safety-card__icon" aria-hidden="true"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2"/></svg></div>
            <h3>Emergency routing</h3>
            <p>Urgent requests surface on-call partners with structured intake so nothing critical gets lost in chat.</p>
          </div>
        </div>
        <div class="about-cta glass-panel reveal">
          <div class="about-cta__inner">
            <h2 class="about-cta__title">Experience the PetHub demo</h2>
            <p class="about-cta__lead">Book a service, browse the marketplace, or reach our team — all from one place.</p>
            <div class="about-cta__actions">
              <a href="services.html" class="btn btn--primary">Explore services</a>
              <a href="contact.html" class="btn btn--outline">Contact us</a>
            </div>
          </div>
        </div>
      </div>
    </section>
  </main>
`;

const contactMain = `  <main id="main">
    <section class="hero page-hero">
      <div class="container">
        <p class="eyebrow">Contact</p>
        <h1 class="page-hero__title">We’re here in <span class="text-gradient">Kuwait</span></h1>
        <p class="page-hero__lead">Questions about providers, listings, or partnerships — reach the PetHub team directly.</p>
      </div>
    </section>
    <section class="section">
      <div class="container contact-layout">
        <div class="contact-cards reveal">
          <article class="contact-card glass-panel">
            <h3 class="contact-card__title">Phone</h3>
            <p><a href="tel:+96500000000">+965 0000 0000</a></p>
            <p class="contact-card__muted">Sat–Thu · 9am–8pm AST</p>
          </article>
          <article class="contact-card glass-panel">
            <h3 class="contact-card__title">Email</h3>
            <p><a href="mailto:hello@pethub.kw">hello@pethub.kw</a></p>
            <p class="contact-card__muted">We reply within one business day</p>
          </article>
          <article class="contact-card glass-panel">
            <h3 class="contact-card__title">HQ</h3>
            <p>Kuwait City, Kuwait</p>
            <p class="contact-card__muted">Arabic &amp; English support</p>
          </article>
        </div>
        <div class="contact-form-panel glass-panel reveal">
          <h2 class="subsection-title">Send a message</h2>
          <form id="form-contact-page" class="booking-form" novalidate>
            <label class="field"><span class="field__label">Name</span><input type="text" name="name" class="input" autocomplete="name" required /></label>
            <label class="field"><span class="field__label">Email</span><input type="email" name="email" class="input" autocomplete="email" required /></label>
            <label class="field"><span class="field__label">Topic</span>
              <select name="topic" class="input" required>
                <option value="">Select topic</option>
                <option>General question</option>
                <option>Provider partnership</option>
                <option>Marketplace / listing</option>
                <option>Billing &amp; orders</option>
                <option>Press &amp; media</option>
              </select>
            </label>
            <label class="field"><span class="field__label">Message</span><textarea name="message" class="input input--textarea" rows="4" required></textarea></label>
            <button type="submit" class="btn btn--primary btn--block">Send message</button>
          </form>
        </div>
      </div>
    </section>
    <section class="section">
      <div class="container">
        <h2 class="subsection-title reveal">Map</h2>
        <div class="map-placeholder reveal" role="img" aria-label="Map placeholder">Interactive map embed — add your preferred provider here</div>
      </div>
    </section>
    <section class="section section--faq">
      <div class="container">
        <header class="section__head reveal">
          <p class="eyebrow">FAQ</p>
          <h2 class="section__title">Common <span class="text-gradient">questions</span></h2>
        </header>
        <div class="faq-list reveal">
          <div class="faq-item glass-panel">
            <button type="button" class="faq-item__q" data-faq-toggle aria-expanded="false">Do you operate outside Kuwait?</button>
            <div class="faq-item__a">PetHub is focused on Kuwait first. Regional expansion may follow as we scale verification and support.</div>
          </div>
          <div class="faq-item glass-panel">
            <button type="button" class="faq-item__q" data-faq-toggle aria-expanded="false">Is this a real payment system?</button>
            <div class="faq-item__a">This site is a front-end product demo — checkout and bookings simulate real flows without charging cards.</div>
          </div>
          <div class="faq-item glass-panel">
            <button type="button" class="faq-item__q" data-faq-toggle aria-expanded="false">How do I list a pet on the marketplace?</button>
            <div class="faq-item__a">Verified sellers get access to structured listing tools. Contact us under “Marketplace / listing” for partnership details.</div>
          </div>
        </div>
      </div>
    </section>
  </main>
`;

const signinMain = `  <main id="main">
    <section class="hero page-hero page-hero--compact">
      <div class="container">
        <p class="eyebrow">Account</p>
        <h1 class="page-hero__title">Welcome back to <span class="text-gradient">PetHub</span></h1>
        <p class="page-hero__lead">Demo sign-in — your cart, bookings, and saved pets sync across pages on this device.</p>
      </div>
    </section>
    <section class="section section--signin">
      <div class="container signin-layout">
        <div class="signin-panel glass-panel reveal">
          <div class="signin-tabs" role="tablist">
            <button type="button" class="signin-tab is-active" data-signin-tab="signin" role="tab" aria-selected="true">Sign in</button>
            <button type="button" class="signin-tab" data-signin-tab="signup" role="tab" aria-selected="false">Create account</button>
          </div>
          <form id="form-signin-page" class="booking-form" novalidate>
            <div id="signin-signup-fields" hidden>
              <label class="field"><span class="field__label">Display name</span><input type="text" name="displayName" id="signin-display-name" class="input" autocomplete="name" /></label>
              <label class="field"><span class="field__label">I am a</span>
                <select name="role" class="input">
                  <option value="owner">Pet owner</option>
                  <option value="provider">Service provider</option>
                </select>
              </label>
            </div>
            <label class="field"><span class="field__label">Email</span><input type="email" name="email" class="input" autocomplete="username" required /></label>
            <label class="field"><span class="field__label">Password</span><input type="password" name="password" class="input" autocomplete="current-password" required /></label>
            <p class="signin-meta"><button type="button" class="link-btn" data-open-forgot>Forgot password?</button></p>
            <button type="submit" class="btn btn--primary btn--block">Continue</button>
          </form>
          <p class="signin-foot muted">By continuing you agree to our <a href="#">Terms</a> and <a href="#">Privacy</a> (demo).</p>
        </div>
      </div>
    </section>
  </main>
`;

// services.html
fs.writeFileSync(
  path.join(dir, "services.html"),
  head("PetHub | Services", "services") +
    header() +
    `  <main id="main">
    <section class="hero page-hero">
      <div class="container">
        <p class="eyebrow">Services</p>
        <h1 class="page-hero__title">Book <span class="text-gradient">trusted care</span> in Kuwait</h1>
        <p class="page-hero__lead">Vets, grooming, walking, transport, and more — pick a service and lock a time.</p>
        <a href="bookings.html" class="btn btn--outline btn--sm">View my bookings</a>
      </div>
    </section>
` +
    lines(146, 308) +
    `
  </main>
` +
    footer +
    overlayHead +
    "\n" +
    bookingModals +
    "\n" +
    overlayTail +
    script
);

// marketplace.html
fs.writeFileSync(
  path.join(dir, "marketplace.html"),
  head("PetHub | Marketplace", "marketplace") +
    header() +
    `  <main id="main">
    <section class="hero page-hero">
      <div class="container">
        <p class="eyebrow">Marketplace</p>
        <h1 id="market-title" class="page-hero__title">Find your next <span class="text-gradient">companion</span></h1>
        <p class="page-hero__lead">Browse responsible listings from verified sellers across Kuwait — with clear details and secure messaging.</p>
      </div>
    </section>
` +
    `    <section class="section section--market" id="marketplace" aria-labelledby="market-title">
      <div class="container">
` +
    lines(317, 469) +
    `
  </main>
` +
    footer +
    overlayHead +
    "\n" +
    listingModals +
    "\n" +
    overlayTail +
    script
);

// shop.html
fs.writeFileSync(
  path.join(dir, "shop.html"),
  head("PetHub | Shop", "shop") +
    header() +
    `  <main id="main">
    <section class="hero page-hero">
      <div class="container">
        <p class="eyebrow">Supplies</p>
        <h1 id="shop-title" class="page-hero__title">Premium <span class="text-gradient">pet products</span></h1>
        <p class="page-hero__lead">Food, toys, beds, and travel gear — delivered nationwide.</p>
      </div>
    </section>
` +
    `    <section class="section section--shop" id="shop" aria-labelledby="shop-title">
      <div class="container">
` +
    lines(478, 659) +
    `
  </main>
` +
    footer +
    globalOverlays +
    script
);

// bookings.html
fs.writeFileSync(
  path.join(dir, "bookings.html"),
  head("PetHub | Bookings &amp; Account", "bookings") +
    header() +
    `  <main id="main">
    <section class="hero page-hero">
      <div class="container">
        <p class="eyebrow">Your hub</p>
        <h1 class="page-hero__title">Bookings &amp; <span class="text-gradient">account</span></h1>
        <p class="page-hero__lead">Upcoming visits, history, orders, saved pets, and pet profiles stay in sync across the site.</p>
        <a href="services.html" class="btn btn--primary btn--sm">Book another service</a>
      </div>
    </section>
    <section class="section section--dashboard">
      <div class="container">
        <h2 class="section__title visually-hidden">Booking schedule</h2>
        <div class="bookings-split reveal">
          <div>
            <h3 class="subsection-title">Upcoming</h3>
            <div id="bookings-upcoming"></div>
          </div>
          <div>
            <h3 class="subsection-title">Past &amp; cancelled</h3>
            <div id="bookings-past"></div>
          </div>
        </div>
      </div>
    </section>
    <section class="section section--pet-profiles" id="pet-profiles">
      <div class="container">
        <header class="section__head reveal">
          <p class="eyebrow">Pet health</p>
          <h2 id="pet-profiles-title" class="section__title">Pet profiles &amp; <span class="text-gradient">health records</span></h2>
          <p class="section__lead">Add each pet once — track vaccination dates and notes. Reminders surface automatically when a due date is near.</p>
          <div class="section__head-actions">
            <a href="#pet-profile-form" class="btn btn--primary btn--sm">Add a pet profile</a>
          </div>
        </header>
        <div id="pet-profile-form" class="pet-form-panel reveal glass-panel" tabindex="-1">
` +
    lines(724, 754) +
    `
        </div>
        <div class="pet-profiles-grid" id="pet-profile-cards"></div>
      </div>
    </section>
    <section class="section section--dashboard">
      <div class="container">
        <header class="section__head reveal">
          <p class="eyebrow">More</p>
          <h2 class="section__title">Orders &amp; saved</h2>
        </header>
        <div class="dash-tabs reveal" role="tablist">
          <button type="button" class="dash-tab is-active" role="tab" aria-selected="true" data-dash-tab="orders">My Orders</button>
          <button type="button" class="dash-tab" role="tab" aria-selected="false" data-dash-tab="saved">Saved Pets</button>
          <button type="button" class="dash-tab" role="tab" aria-selected="false" data-dash-tab="pets">Pet Profiles</button>
        </div>
        <div class="dash-panels reveal">
          <div class="dash-panel" data-dash-panel="orders" id="dash-orders" role="tabpanel"></div>
          <div class="dash-panel" data-dash-panel="saved" id="dash-saved" role="tabpanel" hidden></div>
          <div class="dash-panel" data-dash-panel="pets" id="dash-pets" role="tabpanel" hidden></div>
        </div>
      </div>
    </section>
  </main>
` +
    footer +
    overlayHead +
    "\n" +
    bookingModals +
    "\n" +
    overlayTail +
    rescheduleModal +
    script
);

// index.html
fs.writeFileSync(
  path.join(dir, "index.html"),
  `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="description" content="PetHub — Kuwait’s all-in-one platform for vet care, grooming, walking, transport, marketplace, supplies, and pet health." />
  <title>PetHub | Everything Your Pet Needs in One Place — Kuwait</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=Fraunces:ital,opsz,wght@0,9..144,500;0,9..144,600;0,9..144,700;0,9..144,800&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="css/styles.css" />
</head>
<body data-page="home">
  <a class="skip-link" href="#main">Skip to content</a>
` +
    header() +
    `  <main id="main">
` +
    homeHero +
    homeTrust +
    homeQuick +
    homeSmart +
    homePetProfiles +
    homeSteps +
    homeTestimonials +
    homeCta +
    `
  </main>
` +
    footer +
    overlayHead +
    "\n" +
    bookingModals +
    "\n" +
    listingModals +
    "\n" +
    overlayTail +
    script
);

// about.html
fs.writeFileSync(
  path.join(dir, "about.html"),
  head("PetHub | About", "about") + header() + aboutMain + footer + globalOverlays + script
);

// contact.html
fs.writeFileSync(
  path.join(dir, "contact.html"),
  head("PetHub | Contact", "contact") + header() + contactMain + footer + globalOverlays + forgotModal + script
);

// signin.html
fs.writeFileSync(
  path.join(dir, "signin.html"),
  head("PetHub | Sign in", "signin") + header() + signinMain + footer + globalOverlays + forgotModal + script
);

console.log("Wrote services, marketplace, shop, bookings, index, about, contact, signin");
