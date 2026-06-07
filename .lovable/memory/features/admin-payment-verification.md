---
name: Admin Payment Verification Gates Chat
description: Buyer's ₹9 contact unlock requires admin verification before seller name reveal, free-text chat, and image uploads
type: feature
---
- `contact_unlocks.verified` (bool, default false) is set by an admin via the Admin → Payments tab.
- Until verified=true for (listing_id, buyer_id):
  - Chat header masks seller as "Seller" with a lock icon (no profile link).
  - Chat sidebar masks the other user's name as "Seller" for the buyer.
  - Free-text input is disabled; only `PREDEFINED_CHAT_KEYWORDS` (includes "yes"/"no") can be sent.
  - Image upload button is disabled (lock icon + tooltip).
  - ProductDetail shows "Awaiting admin verification" instead of "Contact Unlocked".
- Sellers are never restricted in their own conversations (chatUnlocked = isSellerInActive || contactVerified).
