# TODO - Token-Based Monetization + Guest Users

## Goal
Implement:
- Guest users (IP-based): **2 free interviews**
- Logged-in users: **100 credits**; each interview consumes **25 credits**
- Therefore: logged-in users get **4 free interviews** (100 / 25)
- After free quota, interviews require credits/tokens (blocked and directed to Pricing)

## Steps
1. Create `GuestUsage` model to track guest interview counts by IP.
2. Add guest interview routes + controllers (no JWT):
   - generate-questions, submit-answer, finish, report (if needed).
3. Update `Interview` model to support guest interviews (store `guestIp` / `isGuest`).
4. Update logged-in interview credits logic:
   - charge **25 credits** per interview
   - block when credits < 25
5. Update frontend `Step1SetUp` / `Step2Interview` to:
   - detect login state
   - call guest endpoints when not logged in
   - show/handle block message by redirecting to `/pricing`.
6. Add/verify backend error messages and response fields so frontend can enforce UX.
7. Smoke test:
   - guest: 2 allowed, 3rd blocked
   - logged-in: 4 allowed, 5th blocked


