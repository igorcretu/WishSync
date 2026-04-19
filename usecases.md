# WishSync — Use Cases by Actor

## Actors
- **Owner** — the logged-in user viewing their own wishlist
- **Gifter** — a circle member viewing someone else's wishlist to buy for them
- **Partner** — the other person in a couple circle (a specific type of Gifter)
- **Admin/Creator** — user who created a circle (manages membership)
- **System** — automated background jobs (notifications, reminders)

---

## 1. Account & Profile

| # | Actor | Use Case | Status |
|---|-------|----------|--------|
| 1.1 | Owner | Register with email + password | ✅ done |
| 1.2 | Owner | Log in / log out | ✅ done |
| 1.3 | Owner | Set nickname, birthday, avatar color | ✅ done |
| 1.4 | Owner | Upload a profile picture | ❌ missing |
| 1.5 | Owner | Change password | ✅ done |
| 1.6 | Owner | Delete account + all data | ❌ missing |
| 1.7 | System | Send welcome email on registration | ✅ done |
| 1.8 | Owner | Set preferred currency (shown on all prices) | ❌ missing |

---

## 2. Wishlist — Owner

| # | Actor | Use Case | Status |
|---|-------|----------|--------|
| 2.1 | Owner | View own wishlist | ✅ done |
| 2.2 | Owner | Add a wish manually (title, price, store, image, priority, category, occasion, notes) | ✅ done |
| 2.3 | Owner | Auto-fill wish from a URL (scrape title, price, image, store, currency) | ✅ done |
| 2.4 | Owner | Upload a custom image for a wish | ✅ done |
| 2.5 | Owner | Edit a wish (any field) | ✅ done |
| 2.6 | Owner | Delete a wish | ✅ done |
| 2.7 | Owner | Set priority: Must / Would love / Nice to have | ✅ done |
| 2.8 | Owner | Tag a wish with an occasion (Birthday, Christmas, etc.) | ✅ done |
| 2.9 | Owner | Add a personal note (size, color, exact version) | ✅ done |
| 2.10 | Owner | Mark a wish as discounted + enter original price | ✅ done |
| 2.11 | Owner | See who reacted to a wish (heart / eyes / gift counts) | ✅ done |
| 2.12 | Owner | Filter own wishes by category | ✅ done |
| 2.13 | Owner | Filter own wishes by priority | ✅ done |
| 2.14 | Owner | Select currency when adding / editing a wish | ✅ done |
| 2.15 | Owner | Search wishes by keyword | ❌ missing |
| 2.16 | Owner | Sort wishlist by price (low→high, high→low) | ❌ missing |
| 2.17 | Owner | Archive a wish (hide without deleting) | ❌ missing |

---

## 3. Wishlist — Gifter / Partner

| # | Actor | Use Case | Status |
|---|-------|----------|--------|
| 3.1 | Gifter | View another member's wishlist | ✅ done |
| 3.2 | Gifter | See priority and occasion tags | ✅ done |
| 3.3 | Gifter | Reserve a wish secretly (owner can't see) | ✅ done |
| 3.4 | Gifter | Release a reservation | ✅ done |
| 3.5 | Gifter | See if a wish is already reserved by someone else | ✅ done (shows "Taken") |
| 3.6 | Gifter | Open the store link to buy the item | ✅ done |
| 3.7 | Gifter | React to a wish (heart / eyes / gift) | ⚠️ partial (API done, UI button missing) |
| 3.8 | Gifter | Use "Surprise mode" — randomly reserve an unreserved item | ✅ done |
| 3.9 | Gifter | Filter partner's list by priority or category | ✅ done |
| 3.10 | Gifter | Mark a reserved wish as purchased → moves to history | ✅ done |
| 3.11 | Gifter | Get email confirmation after reserving | ✅ done |
| 3.12 | Gifter | Get email when new wishes are added (opt-in) | ✅ done |
| 3.13 | Gifter | Search partner's list by keyword | ❌ missing |
| 3.14 | Gifter | Add a gift message when marking as purchased | ❌ missing |

---

## 4. Circles & Invites

| # | Actor | Use Case | Status |
|---|-------|----------|--------|
| 4.1 | Creator | Create a circle (Couple or Friend group) | ✅ done |
| 4.2 | Creator | Generate an invite link (7-day expiry) | ✅ done |
| 4.3 | Creator | Send invite by email directly from the app | ✅ done |
| 4.4 | Invited | Preview the invite before accepting (see circle name + inviter) | ✅ done |
| 4.5 | Invited | Accept an invite (creates account if needed, then joins) | ✅ done |
| 4.6 | Member | Leave a circle | ✅ done |
| 4.7 | Creator | Delete a circle (removes all members) | ✅ done |
| 4.8 | Creator | Remove a specific member from a circle | ✅ done |
| 4.9 | Creator | Rename a circle | ✅ done |
| 4.10 | Member | See all circles they belong to | ✅ done |
| 4.11 | Member | See who else is in each circle | ✅ done |
| 4.12 | Member | View any member's wishlist within a group circle | ✅ done |
| 4.13 | Creator | Change circle type (couple ↔ friend group) | ❌ missing |

---

## 5. Occasions & Calendar

| # | Actor | Use Case | Status |
|---|-------|----------|--------|
| 5.1 | Owner | Create an occasion (title, date, color) | ✅ done |
| 5.2 | Owner | Edit an occasion | ✅ done |
| 5.3 | Owner | Delete an occasion | ✅ done |
| 5.4 | Owner/Gifter | See upcoming occasions sorted by days away | ✅ done |
| 5.5 | System | Send reminder email X days before an occasion | ❌ missing (no scheduler) |
| 5.6 | Owner | Link a wish to an occasion | ✅ done (occasion tag on wish) |
| 5.7 | Gifter | Filter partner's list by occasion tag | ❌ missing |
| 5.8 | Owner | Pin a wish to an occasion tile on the calendar | ❌ missing |

---

## 6. Purchase History

| # | Actor | Use Case | Status |
|---|-------|----------|--------|
| 6.1 | Gifter | Mark a reserved wish as purchased | ✅ done |
| 6.2 | Owner/Gifter | View purchase history (what was given, when, by whom) | ✅ done |
| 6.3 | Owner | See what they've received over time | ⚠️ partial (history exists but not split by direction) |
| 6.4 | Gifter | Add a gift message when purchasing | ❌ missing |

---

## 7. Notifications & Email

| # | Actor | Use Case | Status |
|---|-------|----------|--------|
| 7.1 | Owner | Toggle email: new wishes from circle | ✅ done |
| 7.2 | Owner | Toggle email: birthday reminders | ✅ UI done, ❌ scheduler missing |
| 7.3 | Owner | Toggle email: price drops | ✅ UI done, ❌ price monitor missing |
| 7.4 | Owner | Toggle email: reactions on my wishes | ✅ UI done, ❌ email not sent yet |
| 7.5 | System | Email when circle member adds a wish (if opted in) | ✅ done |
| 7.6 | System | Email reservation confirmation to buyer | ✅ done |
| 7.7 | System | Email birthday/occasion reminder N days before | ❌ missing (cron job needed) |
| 7.8 | System | Email price drop alert | ❌ missing (price polling needed) |
| 7.9 | System | Email invite to join circle | ✅ done |
| 7.10 | System | Email when someone reacts to a wish | ❌ missing |
| 7.11 | Owner | In-app toast on key events (reserve, add, delete) | ✅ done |

---

## 8. Dashboard

| # | Actor | Use Case | Status |
|---|-------|----------|--------|
| 8.1 | Owner | See partner's wish count + unreserved count | ✅ done |
| 8.2 | Owner | See own wish count + total reactions | ✅ done |
| 8.3 | Owner | See next upcoming occasion | ✅ done |
| 8.4 | Owner | See recently reserved items (activity feed) | ❌ missing |
| 8.5 | Owner | See budget summary (total reserved value) | ❌ missing |
| 8.6 | Owner | Quick-navigate to partner's top picks from dashboard | ✅ done |

---

## 9. Shared Ideas (Nice-to-have)

| # | Actor | Use Case | Status |
|---|-------|----------|--------|
| 9.1 | Both | Add ideas for things you both want together (shared list) | ❌ missing |
| 9.2 | Both | React to / vote on shared ideas | ❌ missing |
| 9.3 | Both | Mark a shared idea as planned / bought | ❌ missing |

---

## 10. Price Tracking (Nice-to-have)

| # | Actor | Use Case | Status |
|---|-------|----------|--------|
| 10.1 | Owner | Track price changes on a wish over time | ❌ missing |
| 10.2 | System | Poll prices periodically, update stored price | ❌ missing |
| 10.3 | System | Send alert email when price drops below threshold | ❌ missing |

---

## 11. Search & Sort

| # | Actor | Use Case | Status |
|---|-------|----------|--------|
| 11.1 | Owner | Full-text search across own wishlist | ❌ missing |
| 11.2 | Gifter | Full-text search across partner/friend's wishlist | ❌ missing |
| 11.3 | Owner | Sort wishlist by price (low→high, high→low) | ❌ missing |
| 11.4 | Owner | Sort wishlist by date added (newest/oldest) | ❌ missing |

---

## 12. Reactions

| # | Actor | Use Case | Status |
|---|-------|----------|--------|
| 12.1 | Gifter | React to a wish (♥ / 👀 / 🎁) via UI button | ❌ missing in UI (API exists) |
| 12.2 | Owner | See reaction breakdown per wish in detail view | ✅ done |
| 12.3 | System | Email owner when their wish gets a reaction | ❌ missing |

---

## Summary

### Done since last review ✅

- **1.5** Change password
- **2.5** Edit a wish (inline form in detail view)
- **2.12 / 2.13** Filter own wishlist by category and priority
- **2.14** Currency auto-detected on scrape, selector in add modal
- **3.9** Filter partner's list by priority/category
- **3.10 / 6.1** Mark as purchased (button in detail view)
- **4.8** Remove a member from a circle
- **4.9** Rename a circle
- **4.12** View any group member's wishlist
- **5.1–5.3** Create, edit, and delete occasions
- All `window.confirm()` replaced with styled WishSync popups
- 21 categories (up from 8)

### Still missing — high priority

- **5.5 / 7.7** Occasion reminder emails (cron job)
- **7.4 / 7.10 / 12.3** Email when someone reacts to a wish
- **12.1** React to a wish via UI (API exists, button missing)
- **8.4** Activity feed on dashboard

### Still missing — medium priority

- **1.4** Profile picture upload
- **1.6** Delete account
- **11.1 / 11.2** Search within wishlists
- **11.3 / 11.4** Sort by price or date
- **6.3** History split: received vs. given
- **8.5** Budget summary (total reserved value)

### Nice-to-have

- **1.8** User-level preferred currency
- **4.13** Change circle type
- **5.7 / 5.8** Filter by occasion, pin wish to occasion tile
- **9.x** Shared ideas list
- **10.x** Automated price tracking
