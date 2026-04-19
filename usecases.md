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
| 1.5 | Owner | Change password | ❌ missing |
| 1.6 | Owner | Delete account + all data | ❌ missing |
| 1.7 | System | Send welcome email on registration | ✅ done |

---

## 2. Wishlist — Owner

| # | Actor | Use Case | Status |
|---|-------|----------|--------|
| 2.1 | Owner | View own wishlist | ✅ done |
| 2.2 | Owner | Add a wish manually (title, price, store, image, priority, category, occasion, notes) | ✅ done |
| 2.3 | Owner | Auto-fill wish from a URL (scrape title, price, image, store) | ✅ done |
| 2.4 | Owner | Upload a custom image for a wish | ✅ done |
| 2.5 | Owner | Edit a wish (any field) | ❌ missing (detail view has no edit form) |
| 2.6 | Owner | Delete a wish | ✅ done |
| 2.7 | Owner | Set priority: Must / Would love / Nice to have | ✅ done |
| 2.8 | Owner | Tag a wish with an occasion (Birthday, Christmas, etc.) | ✅ done |
| 2.9 | Owner | Add a personal note (size, color, exact version) | ✅ done |
| 2.10 | Owner | Mark a wish as discounted + enter original price | ✅ done |
| 2.11 | Owner | See who reacted to a wish (heart / eyes / gift counts) | ✅ done |
| 2.12 | Owner | Re-order / sort wishes by priority or date | ❌ missing |
| 2.13 | Owner | Filter own wishes by category or occasion | ❌ missing |

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
| 3.7 | Gifter | React to a wish (heart / eyes / gift) | ✅ done (API only, UI partial) |
| 3.8 | Gifter | Use "Surprise mode" — randomly reserve an unreserved item | ✅ done |
| 3.9 | Gifter | Filter partner's list by priority or occasion | ❌ missing |
| 3.10 | Gifter | Mark a reserved wish as purchased → moves to history | ❌ missing (purchase endpoint exists, UI missing) |
| 3.11 | Gifter | Get email confirmation after reserving | ✅ done |
| 3.12 | Gifter | Get email when new wishes are added (opt-in) | ✅ done |

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
| 4.8 | Creator | Remove a specific member from a circle | ❌ missing |
| 4.9 | Creator | Rename a circle | ❌ missing |
| 4.10 | Member | See all circles they belong to | ✅ done |
| 4.11 | Member | See who else is in each circle | ✅ done |
| 4.12 | Member | View any member's wishlist within a group circle | ⚠️ partial (only couple partner, not friend group members) |

---

## 5. Occasions & Calendar

| # | Actor | Use Case | Status |
|---|-------|----------|--------|
| 5.1 | Owner | Create an occasion (title, date, person, color) | ✅ done |
| 5.2 | Owner | Edit an occasion | ❌ missing |
| 5.3 | Owner | Delete an occasion | ❌ missing |
| 5.4 | Owner/Gifter | See upcoming occasions sorted by days away | ✅ done |
| 5.5 | System | Send reminder email X days before an occasion | ❌ missing (no scheduler) |
| 5.6 | Owner | Link a wish to an occasion | ✅ done (occasion tag on wish) |
| 5.7 | Gifter | Filter partner's list by occasion | ❌ missing |

---

## 6. Purchase History

| # | Actor | Use Case | Status |
|---|-------|----------|--------|
| 6.1 | Gifter | Mark a reserved wish as purchased | ❌ missing in UI |
| 6.2 | Owner/Gifter | View purchase history (what was given, when, by whom) | ✅ done (history view) |
| 6.3 | Owner | See what they've received over time | ⚠️ partial (history exists but isn't clearly split by direction) |

---

## 7. Notifications & Email

| # | Actor | Use Case | Status |
|---|-------|----------|--------|
| 7.1 | Owner | Toggle email: new wishes from circle | ✅ done (notifNewWishes) |
| 7.2 | Owner | Toggle email: birthday reminders | ✅ UI done, ❌ scheduler missing |
| 7.3 | Owner | Toggle email: price drops | ✅ UI done, ❌ price monitor missing |
| 7.4 | Owner | Toggle email: reactions on my wishes | ✅ UI done, ❌ email not sent yet |
| 7.5 | System | Email when circle member adds a wish (if opted in) | ✅ done |
| 7.6 | System | Email reservation confirmation to buyer | ✅ done |
| 7.7 | System | Email birthday/occasion reminder N days before | ❌ missing (cron job needed) |
| 7.8 | System | Email price drop alert | ❌ missing (price polling needed) |
| 7.9 | System | Email invite to join circle | ✅ done |

---

## 8. Dashboard

| # | Actor | Use Case | Status |
|---|-------|----------|--------|
| 8.1 | Owner | See partner's wish count + unreserved count | ✅ done |
| 8.2 | Owner | See own wish count + total reactions | ✅ done |
| 8.3 | Owner | See next upcoming occasion | ✅ done |
| 8.4 | Owner | See recently reserved items (activity feed) | ❌ missing |
| 8.5 | Owner | See budget summary (how much reserved so far) | ❌ missing |

---

## 9. Shared Ideas (Nice-to-have)

| # | Actor | Use Case | Status |
|---|-------|----------|--------|
| 9.1 | Both | Add ideas for things you both want together (shared list) | ❌ missing |
| 9.2 | Both | React to / vote on shared ideas | ❌ missing |

---

## 10. Price Tracking (Nice-to-have)

| # | Actor | Use Case | Status |
|---|-------|----------|--------|
| 10.1 | Owner | Track price changes on a wish over time | ❌ missing |
| 10.2 | System | Poll prices periodically, update stored price | ❌ missing |
| 10.3 | System | Send alert email when price drops below threshold | ❌ missing |

---

## Summary: What's Missing (by priority)

### High priority (core UX gaps)
- **2.5** Edit a wish after adding it
- **3.10 / 6.1** Mark as purchased UI (button exists in API, missing in frontend)
- **4.12** View any group member's list (not just couple partner)
- **5.5 / 7.7** Occasion reminder emails (needs a cron job)

### Medium priority
- **2.12 / 2.13** Sort and filter own wishlist
- **3.9** Filter partner's list by priority/occasion
- **4.8** Remove a member from a circle
- **4.9** Rename a circle
- **5.2 / 5.3** Edit / delete occasions
- **7.4** Send email when someone reacts to a wish

### Nice-to-have
- **1.4** Profile picture upload
- **1.5** Change password
- **1.6** Delete account
- **8.4** Activity feed / recent reservations on dashboard
- **8.5** Budget tracker
- **9.x** Shared ideas list
- **10.x** Automated price tracking
