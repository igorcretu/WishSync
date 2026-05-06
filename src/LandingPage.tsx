import React from 'react';
import './landing.css';

interface LandingPageProps {
  onSignIn: () => void;
  onGetStarted: () => void;
}

const LogoMark = () => (
  <svg width="32" height="32" viewBox="0 0 64 64">
    <rect width="64" height="64" rx="14" fill="#F6B89A" />
    <path d="M32 32 C 22 22, 14 30, 20 38 C 24 42, 32 46, 32 46 C 32 46, 40 42, 44 38 C 50 30, 42 22, 32 32 Z" fill="#2B2420" />
  </svg>
);

export const LandingPage: React.FC<LandingPageProps> = ({ onSignIn, onGetStarted }) => {
  return (
    <div style={{ background: 'var(--cream)', minHeight: '100vh' }}>
      {/* NAV */}
      <nav className="lp-nav">
        <div className="lp-nav-inner">
          <a href="#" className="lp-nav-logo">
            <LogoMark />
            WishSync
          </a>
          <div className="lp-nav-links">
            <a href="#features">Features</a>
            <a href="#how">How it works</a>
            <a href="#pricing">Pricing</a>
            <a href="#stories">Stories</a>
          </div>
          <div className="lp-nav-cta">
            <button className="btn btn-ghost btn-sm" onClick={onSignIn}>Sign in</button>
            <button className="btn btn-primary btn-sm" onClick={onGetStarted}>Get the app</button>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <header className="lp-hero">
        <div>
          <div className="hero-eyebrow">
            <span className="dot" />
            Now syncing 12,400 happy couples
          </div>
          <h1>Gifting,<br />but <em>actually</em><br />thoughtful.</h1>
          <p className="lead">
            WishSync is the cozy little app where couples, friends, and family
            keep wishlists, reserve gifts in secret, and never duplicate
            a present again.
          </p>
          <div className="hero-ctas">
            <button className="btn btn-primary btn-lg" onClick={onGetStarted}>
              Start your wishlist — it's free
            </button>
            <a className="btn btn-ghost btn-lg" href="#how">See how it works ↓</a>
          </div>
          <div className="hero-meta">
            <div className="members">
              <div className="avatar sm" style={{ background: '#F2C2C9' }}>N</div>
              <div className="avatar sm" style={{ background: '#BED6B0' }}>T</div>
              <div className="avatar sm" style={{ background: '#F6E2A8' }}>M</div>
              <div className="avatar sm" style={{ background: '#D4C5E8' }}>J</div>
            </div>
            <span>Loved by ★★★★★ 4.9 on the App Store</span>
          </div>
        </div>

        {/* Visual collage */}
        <div className="collage">
          <span className="sparkle-deco sp-1">✨</span>
          <span className="sparkle-deco sp-2">🎁</span>
          <span className="sparkle-deco sp-3">♥</span>

          <div className="col-card col-1">
            <div className="ph-img">
              <div className="ph" style={{ background: '#E9C969' }}>
                <span className="ph-label">ceramic dripper</span>
              </div>
            </div>
            <h4>Hario V60 Dripper</h4>
            <div className="col-meta">
              <span className="col-price">$42</span>
              <span className="col-pill" style={{ background: '#F5C9C9', color: '#8B2C2C' }}>must</span>
            </div>
          </div>

          <div className="col-card col-2">
            <div className="ribbon-deco">Reserved</div>
            <div className="ph-img">
              <div className="ph" style={{ background: '#B8D4E3' }}>
                <span className="ph-label">indigo jeans</span>
              </div>
            </div>
            <h4>Selvedge Denim</h4>
            <div className="col-meta">
              <span className="col-price">$240</span>
              <span className="col-pill" style={{ background: '#F6E2A8', color: '#8B6B1C' }}>love</span>
            </div>
          </div>

          <div className="col-card col-3">
            <div className="ph-img">
              <div className="ph" style={{ background: '#F6B89A' }}>
                <span className="ph-label">dutch oven</span>
              </div>
            </div>
            <h4>Le Creuset Dutch Oven</h4>
            <div className="col-meta">
              <span className="col-price">$380</span>
              <span className="col-pill" style={{ background: '#BED6B0', color: '#3A5F2E' }}>love</span>
            </div>
          </div>
        </div>
      </header>

      {/* LOGO STRIP */}
      <div className="logo-strip">
        <div className="ls-label">Featured in the cozy corners of</div>
        <div className="ls-row">
          <span>The Cut</span>
          <span>Apartment Therapy</span>
          <span>Refinery29</span>
          <span>Domino</span>
          <span>Kinfolk</span>
        </div>
      </div>

      {/* FEATURES */}
      <section className="lp" id="features">
        <div className="sec-header">
          <div className="sec-eyebrow">What's inside</div>
          <h2 className="sec-title">A whole world for <em>thoughtful</em> giving.</h2>
          <p className="sec-sub">Every feature designed to remove the awkwardness — and bring the magic back to gifts.</p>
        </div>

        <div className="features">
          {/* Secret reserve — wide dark */}
          <div className="feat span-8 ink">
            <div className="feat-icon" style={{ background: 'rgba(246, 184, 154, 0.2)' }}>🤫</div>
            <h3 style={{ fontSize: 36 }}>
              Reserve gifts secretly. They'll <em style={{ color: 'var(--peach)', fontStyle: 'italic' }}>never</em> know.
            </h3>
            <p style={{ fontSize: 16, maxWidth: 480, marginBottom: 24 }}>
              Mark any wish "I'm buying this." Your partner sees nothing change.
              Your gifting circle sees it's claimed. Zero duplicates, full surprise.
            </p>
            <div style={{ marginTop: 'auto', display: 'flex', gap: 20, alignItems: 'flex-end', flexWrap: 'wrap' }}>
              <div className="mini-wish">
                <div className="ribbon-deco">You reserved</div>
                <div className="ph-img">
                  <div className="ph" style={{ background: '#B8D4E3' }}>
                    <span className="ph-label">selvedge jeans</span>
                  </div>
                </div>
                <h5>Selvedge Denim</h5>
                <div className="mini-meta">
                  <span style={{ fontWeight: 800 }}>$240</span>
                  <span style={{ color: 'var(--ink-muted)' }}>Kapital</span>
                </div>
              </div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontStyle: 'italic', color: 'var(--peach)', maxWidth: 200, lineHeight: 1.3 }}>
                "He had no idea. Best gift reaction of my life."
              </div>
            </div>
          </div>

          {/* Quick add from link */}
          <div className="feat span-4 butter">
            <div className="feat-icon">🔗</div>
            <h3>Add from any link.</h3>
            <p>Paste a URL — we pull the title, image, price, and store automatically. Two seconds, one wish.</p>
            <div style={{ marginTop: 'auto', background: 'var(--paper)', borderRadius: 14, padding: '10px 14px', fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--ink-muted)', display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ color: 'var(--sage-deep)' }}>●</span>
              kapital.jp/products/...
            </div>
          </div>

          {/* Priority levels */}
          <div className="feat span-4 peach">
            <div className="feat-icon">⭐</div>
            <h3>Three levels of love.</h3>
            <p>Sort wishes by Must-have, Would-love, or Nice-to-have — so gifters know what's a daydream and what's a priority.</p>
            <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
              <span className="pill must" style={{ width: 'fit-content' }}>● Must have</span>
              <span className="pill love" style={{ width: 'fit-content' }}>● Would love</span>
              <span className="pill nice" style={{ width: 'fit-content' }}>● Nice to have</span>
            </div>
          </div>

          {/* Reactions */}
          <div className="feat span-4 blush">
            <div className="feat-icon">♥</div>
            <h3>React, don't just read.</h3>
            <p>Drop a heart, eyes, or gift emoji on any wish. Tiny signals that mean a lot.</p>
            <div style={{ marginTop: 'auto', display: 'flex', gap: 8 }}>
              <div className="reaction active" style={{ background: 'var(--paper)' }}>♥ 12</div>
              <div className="reaction" style={{ background: 'var(--paper)' }}>👀 4</div>
              <div className="reaction" style={{ background: 'var(--paper)' }}>🎁 2</div>
            </div>
          </div>

          {/* Occasions */}
          <div className="feat span-4 sage">
            <div className="feat-icon">🎂</div>
            <h3>Never miss a date.</h3>
            <p>Gentle nudges for birthdays, anniversaries, and holidays — always two weeks early, never naggy.</p>
            <div style={{ marginTop: 'auto', background: 'var(--paper)', borderRadius: 14, padding: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
              <div className="timeline-date" style={{ margin: 0 }}>
                <div className="day">02</div>
                <div className="month">MAR</div>
              </div>
              <div style={{ fontSize: 13 }}>
                <strong>Theo's Birthday</strong><br />
                <span style={{ color: 'var(--ink-muted)' }}>in 12 days</span>
              </div>
            </div>
          </div>

          {/* Price tracking */}
          <div className="feat span-4 lilac">
            <div className="feat-icon">📉</div>
            <h3>Catch the price drops.</h3>
            <p>We watch the prices on every linked wish. The moment something goes on sale, you'll know.</p>
            <div style={{ marginTop: 'auto', background: 'var(--paper)', borderRadius: 14, padding: 14, fontSize: 13 }}>
              <span className="pill sale">↓ 23% off</span>
              <div style={{ marginTop: 8 }}><strong>Hario V60</strong> just dropped to <strong>$42</strong></div>
            </div>
          </div>

          {/* Couple dashboard — wide */}
          <div className="feat span-8">
            <div className="feat-icon" style={{ background: 'var(--peach)' }}>👫</div>
            <h3>Your gifting world, at a glance.</h3>
            <p style={{ maxWidth: 480 }}>A shared dashboard for two — wishes, occasions, recent activity, and your monthly surprise budget. Built for couples, scales to circles of 4, 8, 20.</p>
            <div style={{ marginTop: 'auto', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
              <div className="dash-tile sage" style={{ padding: 14, minHeight: 0 }}>
                <div className="dash-label" style={{ fontSize: 11 }}>Theo's wishes</div>
                <div className="dash-value" style={{ fontSize: 28 }}>14</div>
              </div>
              <div className="dash-tile blush" style={{ padding: 14, minHeight: 0 }}>
                <div className="dash-label" style={{ fontSize: 11 }}>Yours</div>
                <div className="dash-value" style={{ fontSize: 28 }}>9</div>
              </div>
              <div className="dash-tile butter" style={{ padding: 14, minHeight: 0 }}>
                <div className="dash-label" style={{ fontSize: 11 }}>Days to anniversary</div>
                <div className="dash-value" style={{ fontSize: 28 }}>89</div>
              </div>
            </div>
          </div>

          {/* Gift history — full-width */}
          <div className="feat span-12">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: 32, alignItems: 'center' }}>
              <div>
                <div className="feat-icon">📦</div>
                <h3>Remember every gift.</h3>
                <p>A quiet little archive of what you've given and received — so you never repeat a present, and always remember the year of the cashmere scarf.</p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div className="card" style={{ padding: 12, display: 'flex', alignItems: 'center', gap: 14, boxShadow: 'var(--shadow-sm)' }}>
                  <div style={{ width: 56, height: 56, borderRadius: 12, overflow: 'hidden', flexShrink: 0 }}>
                    <div className="ph" style={{ background: '#2B2420' }}>
                      <span className="ph-label" style={{ background: 'rgba(255,255,255,0.85)' }}>headphones</span>
                    </div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 17 }}>Noise-Cancelling Headphones</div>
                    <div style={{ fontSize: 12, color: 'var(--ink-muted)' }}>For Theo · Dec 25, 2025</div>
                  </div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 18 }}>$349</div>
                </div>
                <div className="card" style={{ padding: 12, display: 'flex', alignItems: 'center', gap: 14, boxShadow: 'var(--shadow-sm)' }}>
                  <div style={{ width: 56, height: 56, borderRadius: 12, overflow: 'hidden', flexShrink: 0 }}>
                    <div className="ph" style={{ background: '#F2C2C9' }}>
                      <span className="ph-label">cashmere scarf</span>
                    </div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 17 }}>Cashmere Scarf</div>
                    <div style={{ fontSize: 12, color: 'var(--ink-muted)' }}>For Nora · Dec 25, 2025</div>
                  </div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 18 }}>$180</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="lp" id="how" style={{ background: 'var(--cream-2)', borderRadius: 'var(--radius-xl)', margin: '40px auto' }}>
        <div className="sec-header">
          <div className="sec-eyebrow">How it works</div>
          <h2 className="sec-title">Three steps to <em>better</em> gifting.</h2>
        </div>
        <div className="steps">
          <div className="step">
            <div className="step-num">01</div>
            <h3>Make your circle.</h3>
            <p>Invite your partner, your group of friends, your whole family. Each person gets their own profile and their own wishlist.</p>
          </div>
          <div className="step">
            <div className="step-num">02</div>
            <h3>Add your wishes.</h3>
            <p>Paste a link, snap a photo, or type it in. Tag with priority, occasion, and a note about that very specific shade of blue.</p>
          </div>
          <div className="step">
            <div className="step-num">03</div>
            <h3>Reserve in secret.</h3>
            <p>Browse anyone's list and silently claim a gift. They'll never see it's spoken for. Everyone else will. No more duplicates.</p>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="lp" id="stories">
        <div className="sec-header">
          <div className="sec-eyebrow">Stories</div>
          <h2 className="sec-title">From people who used to <em>panic</em> at gift-giving.</h2>
        </div>
        <div className="testimonial-row">
          <div className="quote">
            <p>It's the only app my husband and I both open weekly. He can't keep a secret to save his life — but somehow WishSync can.</p>
            <div className="who">
              <div className="avatar sm" style={{ background: '#F2C2C9' }}>A</div>
              <div>
                <div className="who-name">Amara &amp; Theo</div>
                <div className="who-sub">Married 4 years · Brooklyn</div>
              </div>
            </div>
          </div>
          <div className="quote">
            <p>I gave my sister the same candle three Christmases in a row. Never again. WishSync remembers so my goldfish-brain doesn't have to.</p>
            <div className="who">
              <div className="avatar sm" style={{ background: '#F6E2A8' }}>M</div>
              <div>
                <div className="who-name">Mira</div>
                <div className="who-sub">Designer · Lisbon</div>
              </div>
            </div>
          </div>
          <div className="quote">
            <p>Our friend group has a 7-person chaotic group chat. WishSync turned the gift-coordination spam into a quiet shared list. Bliss.</p>
            <div className="who">
              <div className="avatar sm" style={{ background: '#BED6B0' }}>J</div>
              <div>
                <div className="who-name">Juno + crew</div>
                <div className="who-sub">7-person friend group · Toronto</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section className="lp" id="pricing">
        <div className="sec-header">
          <div className="sec-eyebrow">Plans</div>
          <h2 className="sec-title">Free for two, <em>generous</em> for everyone.</h2>
          <p className="sec-sub">No ads, no selling your data, no awkward "free trial" gymnastics.</p>
        </div>
        <div className="pricing">
          <div className="price-card">
            <div className="price-name">Solo</div>
            <div className="price-amount">$0<small> / forever</small></div>
            <div className="price-desc">For keeping your own running wishlist.</div>
            <ul className="price-list">
              <li><span className="check">✓</span> Unlimited wishes</li>
              <li><span className="check">✓</span> Quick-add from links</li>
              <li><span className="check">✓</span> Share read-only links</li>
              <li><span className="check">✓</span> Price drop alerts</li>
            </ul>
            <button className="btn btn-ghost btn-lg" onClick={onGetStarted} style={{ justifyContent: 'center' }}>
              Get started
            </button>
          </div>

          <div className="price-card featured">
            <div className="price-name">Couple</div>
            <div className="price-amount">$3<small> / month</small></div>
            <div className="price-desc">Two people, fully synced. The flagship.</div>
            <ul className="price-list">
              <li><span className="check">✓</span> Everything in Solo</li>
              <li><span className="check">✓</span> Secret reservations 🤫</li>
              <li><span className="check">✓</span> Couple dashboard</li>
              <li><span className="check">✓</span> Occasion reminders</li>
              <li><span className="check">✓</span> Purchased history</li>
              <li><span className="check">✓</span> Surprise budget</li>
            </ul>
            <button className="btn btn-primary btn-lg" onClick={onGetStarted} style={{ justifyContent: 'center' }}>
              Start 30 days free
            </button>
          </div>

          <div className="price-card">
            <div className="price-name">Circle</div>
            <div className="price-amount">$8<small> / month</small></div>
            <div className="price-desc">For families, friend groups, the whole crew.</div>
            <ul className="price-list">
              <li><span className="check">✓</span> Everything in Couple</li>
              <li><span className="check">✓</span> Up to 20 members</li>
              <li><span className="check">✓</span> Group gifting (split a gift)</li>
              <li><span className="check">✓</span> Sub-lists by occasion</li>
              <li><span className="check">✓</span> Shared family budget</li>
            </ul>
            <button className="btn btn-ghost btn-lg" onClick={onGetStarted} style={{ justifyContent: 'center' }}>
              Start your circle
            </button>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <div className="final-cta">
        <span className="final-deco tl">🎁</span>
        <span className="final-deco br">♥</span>
        <h2>Give better. <em>Together.</em></h2>
        <p>Join 12,400 couples and 600 friend groups who never duplicate a gift again. Download free, upgrade only if you fall in love.</p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button className="btn btn-dark btn-lg" onClick={onGetStarted}>Open the web app</button>
          <button className="btn btn-ghost btn-lg" onClick={onGetStarted} style={{ background: 'var(--paper)' }}>
            Download on iOS
          </button>
        </div>
      </div>

      {/* FOOTER */}
      <footer className="lp-footer">
        <div className="foot-grid">
          <div className="foot-col foot-brand">
            <div className="foot-logo">
              <LogoMark />
              WishSync
            </div>
            <p>The cozy little app for couples, friends, and family who want to give better gifts — together.</p>
          </div>
          <div className="foot-col">
            <h5>Product</h5>
            <a href="#features">Features</a>
            <a href="#pricing">Pricing</a>
            <a href="#how">How it works</a>
            <a href="#">Changelog</a>
          </div>
          <div className="foot-col">
            <h5>Company</h5>
            <a href="#">About</a>
            <a href="#">Stories</a>
            <a href="#">Press</a>
            <a href="#">Careers</a>
          </div>
          <div className="foot-col">
            <h5>Support</h5>
            <a href="#">Help center</a>
            <a href="#">Privacy</a>
            <a href="#">Terms</a>
            <a href="#">Contact</a>
          </div>
        </div>
        <div className="foot-bottom">
          <span>© 2026 WishSync, Inc. Made with ♥ in Brooklyn.</span>
          <span>Never sells your data. Never spams your gifters.</span>
        </div>
      </footer>
    </div>
  );
};
