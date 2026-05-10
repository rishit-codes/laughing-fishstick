
## Goal

Map all 14 wireframe screens onto the existing Traveloop app. Most screens already exist — we'll enhance them. The rest become new routes/tabs. **No backend, no design-system rewrite** — every new surface reuses the current teal tokens, cards, typography, motion, and `TopNav`/`Footer` so the app feels unified, not bolted‑on.

## Wireframe → App mapping

| # | Wireframe | Status | Action |
|---|-----------|--------|--------|
| 1 | Login | ✅ exists `/login` | Polish: align fields, add "remember me" and divider style from wireframe |
| 2 | Registration | ✅ exists `/signup` | Add First/Last name, phone, city, country, "additional info" textarea |
| 3 | Main Landing | ✅ exists `/` | Add **Top Regional Selections** band + **Previous Trips** rail |
| 4 | Create new Trip | ✅ exists `/trips/new` | Enhance: Place picker + Start/End date inputs as the first step |
| 5 | Build Itinerary | partial | Add as **step 2** of `/trips/new`: stackable "Sections" each with date range + budget + activity slot, plus "Add another section" |
| 6 | User Trip Listing | ✅ `/trips` | Convert into 3 tabs: **Ongoing / Upcoming / Completed** with search + Group/Filter/Sort toolbar |
| 7 | User Profile | ✅ exists `/profile` | Already premium — no change |
| 8 | Activity / City Search | partial `/explore` | Promote to full search page: search bar, results grid, Group/Filter/Sort, detail side panel |
| 9 | Itinerary + Budget view | ✅ `/trips/$tripId` | Add a **Budget** tab next to Itinerary with day-by-day spend + per-section totals |
| 10 | Community tab | ❌ new | New route `/community` — feed of user trip posts, search + filter, post detail |
| 11 | Packing Checklist | ❌ new | New tab on trip detail: `Packing` — categories (Documents/Clothing/Electronics) with progress, add/reset/share |
| 12 | Admin Panel | ❌ new | New route `/admin` — Manage Users, Popular Cities, Popular Activities, Trends & Analytics cards |
| 13 | Trip Notes / Journal | ❌ new | New tab on trip detail: `Notes` — notes grouped All / by Day / by Stop, "+ Add note" |
| 14 | Expense Invoice | ❌ new | New route `/trips/$tripId/invoice` — invoice header, traveler list, line-item table, subtotal/tax/total, Download/Export/Mark-paid |

## Information architecture (after)

```text
/                       Landing (+ Top Regional, Previous Trips)
/login                  Login
/signup                 Registration (expanded fields)
/trips                  Listing — Ongoing | Upcoming | Completed
/trips/new              2-step wizard: Trip basics → Build sections
/trips/$tripId          Tabs: Itinerary | Budget | Packing | Notes | Members
/trips/$tripId/invoice  Invoice / billing
/explore                Activity & City search (enhanced)
/community              Community feed
/profile                Profile (unchanged)
/admin                  Admin panel (mock)
```

`TopNav` (app variant) gains: **Trips · Explore · Community**, and the profile dropdown gains **Admin** (visible to mock admin user).

## Design rules (non-negotiable)

- Reuse existing tokens from `src/styles.css` (teal primary, signal/alert/forest, card/border, font-display + font-mono).
- Reuse `TopNav`, `Footer`, `Button`, `DropdownMenu`, `Tabs`, `Card`, `Input`, `Badge`, `HealthScoreRing`, `TripCard`, `AiSuggestions`.
- New patterns introduced **once** and reused everywhere:
  - **Toolbar** (Search · Group by · Filter · Sort by) — extract to `components/traveloop/Toolbar.tsx`, used on Trips listing, Explore, Community, Packing, Admin, Invoices.
  - **SectionBlock** card — used in Build Itinerary and Itinerary/Budget views.
  - **TabPills** — used on Trip listing, Trip detail, Notes (All/by Day/by Stop).
- All new pages: same max-w-7xl container, same px-6 py-12 rhythm, framer-motion fade-in on mount, `lift` hover on cards, `rounded-3xl`/`rounded-2xl` cards with `border-border`.
- Mock data only — extend `src/lib/mock-data.ts` with: `mockNotes`, `mockPackingItems`, `mockCommunityPosts`, `mockInvoices`, `mockAdminStats`.

## Phased rollout (so each ship is reviewable)

**Phase 1 — Listing & creation core** (high impact, low risk)
1. Trips listing → Ongoing/Upcoming/Completed tabs + Toolbar
2. `/trips/new` → 2-step wizard with Sections (#4 + #5)
3. Landing → add Top Regional + Previous Trips rails

**Phase 2 — Trip detail expansion**
4. Add **Budget**, **Packing**, **Notes** tabs to `/trips/$tripId`
5. New `/trips/$tripId/invoice`

**Phase 3 — Discovery & social**
6. Enhance `/explore` to full search layout
7. New `/community`

**Phase 4 — Admin & polish**
8. New `/admin`
9. Signup form expansion, login polish
10. QA pass: dark mode, mobile, empty states, motion timing

## Out of scope

- No backend, no auth wiring, no real data persistence.
- No new color palette or typography — only token reuse.
- Existing premium screens (Profile, Trip Itinerary timeline, Login shell) keep their current visual language; we only **add** to them.

Approve and I'll start Phase 1.
