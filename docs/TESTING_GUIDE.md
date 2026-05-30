# Yuumpy Platform — Testing Guide

**Version:** 1.0  
**Last updated:** 2026-05-30  
**Environment:** Run all tests against a staging environment before production deployment.

---

## Table of Contents

1. [Pre-Test Setup](#1-pre-test-setup)
2. [Authentication](#2-authentication)
3. [Product Browsing & Search](#3-product-browsing--search)
4. [Shopping Cart & Checkout](#4-shopping-cart--checkout)
5. [Seller Onboarding & Dashboard](#5-seller-onboarding--dashboard)
6. [Identity Verification](#6-identity-verification)
7. [Live Communication (Chat / Voice / Video)](#7-live-communication-chat--voice--video)
8. [Admin Dashboard](#8-admin-dashboard)
9. [Security Checks](#9-security-checks)
10. [Pages & Content](#10-pages--content)
11. [Known Limitations](#11-known-limitations)

---

## 1. Pre-Test Setup

Before running tests, confirm the following:

| Item | Expected |
|------|----------|
| `npm run build` completes without errors | ✅ |
| `NEXT_PUBLIC_APP_URL` set to staging domain | ✅ |
| `JWT_SECRET` set in environment | ✅ |
| `CRON_SECRET` set to a strong random value | ✅ |
| Stripe keys are **test** keys (`sk_test_`) on staging | ✅ |
| MinIO accessible and bucket `yuumpy` exists | ✅ |
| PostgreSQL database reachable | ✅ |
| LiveKit server reachable | ✅ |

---

## 2. Authentication

### 2.1 Customer Registration

| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Go to `/account/register` | Registration form renders |
| 2 | Submit with empty fields | Validation errors shown |
| 3 | Submit with invalid email format | Email validation error |
| 4 | Submit with password under 8 characters | Password validation error |
| 5 | Submit valid details | Account created, redirected to account page |
| 6 | Try registering with the same email again | "Email already in use" error |
| 7 | Submit 6+ times rapidly from the same IP | `429 Too Many Requests` response |

### 2.2 Customer Login

| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Go to `/account/login` | Login form renders |
| 2 | Submit wrong password | "Invalid email or password" error |
| 3 | Submit valid credentials | Logged in, redirected to account |
| 4 | Submit 11+ times rapidly from same IP | `429 Too Many Requests` |
| 5 | Refresh page after login | Session persists |
| 6 | Click logout | Session cleared, redirected to home |

### 2.3 Admin Login

| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Go to `/admin/login` | Login form renders |
| 2 | Submit wrong credentials | Error message shown |
| 3 | Submit valid credentials | Redirected to `/admin/dashboard` |
| 4 | Submit 6+ times rapidly | `429 Too Many Requests` |
| 5 | Navigate to `/admin/dashboard` without login | Redirected to `/admin/login` |
| 6 | Wait 24 hours (or manually expire cookie) | Auto-logged out, redirected to login |

---

## 3. Product Browsing & Search

### 3.1 Homepage

| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Visit `/` | Page loads, BannerAd slider visible |
| 2 | Check "Meet the Makers" section | Shows image if set in admin, else decorative fallback |
| 3 | Featured products section | Products displayed with images |
| 4 | Check Safe Trading badge in header | Amber "Safe Trading" link visible |

### 3.2 Product Listing

| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Visit `/products` | Product grid renders |
| 2 | Apply a category filter | Products filtered correctly |
| 3 | Apply price range filter | Products filtered correctly |
| 4 | Search for a product | Matching results shown |
| 5 | Search for a non-existent product | "No results" state shown |

### 3.3 Product Detail Page

| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Click any product | Product detail page loads |
| 2 | Check image gallery | Images load, gallery navigation works |
| 3 | Check trust badges | Secure Checkout / Order Tracking / Easy Returns visible |
| 4 | Check advisory badge | Amber "Yuumpy Protected Transaction" badge visible |
| 5 | Click advisory badge | Navigates to `/safe-trading` |
| 6 | Check seller contact widget | Online/offline status shown |
| 7 | Check product tabs (Description, Reviews, etc.) | Tabs switch correctly |

---

## 4. Shopping Cart & Checkout

### 4.1 Cart

| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Click "Add to Cart" on a direct-sale product | Item added, cart count updates |
| 2 | Open cart | Item listed with correct price and quantity |
| 3 | Increase quantity | Price updates correctly |
| 4 | Remove item | Cart empties |
| 5 | Add same item twice | Quantity increments, not duplicated |

### 4.2 Checkout (use Stripe test card `4242 4242 4242 4242`)

| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Proceed to checkout without login | Prompted to login/register |
| 2 | Login and proceed to checkout | Checkout form renders |
| 3 | Submit with missing address | Validation error |
| 4 | Enter test card details and submit | Order placed, confirmation shown |
| 5 | Check order appears in `/account/orders` | Order listed with correct status |
| 6 | Check seller dashboard shows new order | Order visible in seller orders |
| 7 | Check escrow transaction created | Escrow entry in admin |

### 4.3 Stripe Webhook

| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Trigger `payment_intent.succeeded` via Stripe CLI | Order status updated to `paid` |
| 2 | Trigger `payment_intent.payment_failed` | Order status updated to `failed` |

---

## 5. Seller Onboarding & Dashboard

### 5.1 Seller Registration

| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Go to `/account/settings?tab=selling` | Selling tab visible |
| 2 | Submit seller application | Application submitted, status `pending` |
| 3 | Approve seller in admin (`/admin/sellers`) | Seller status changes to `approved` |
| 4 | Log in and visit `/seller/dashboard` | Dashboard loads with correct stats |

### 5.2 Seller Dashboard

| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Visit `/seller/products` | Product list renders |
| 2 | Create a new product | Product saved and visible |
| 3 | Edit an existing product | Changes saved |
| 4 | Delete a product | Product removed from listing |
| 5 | Visit `/seller/orders` | Orders listed correctly |
| 6 | Visit `/seller/analytics` | Charts render |
| 7 | Visit `/seller/settings` | Settings form loads and saves |
| 8 | Visit `/seller/verify-identity` | Identity upload form renders |

### 5.3 Seller Identity Verification

| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Visit `/seller/verify-identity` | Document type selection shown |
| 2 | Select "Passport" and upload a JPG | Upload succeeds, "Under Review" state shown |
| 3 | Try uploading again while pending | "Already under review" error shown |
| 4 | Admin approves the verification | Seller `is_verified` set to true |
| 5 | Admin rejects with a note | Seller can re-submit, rejection note shown |

---

## 6. Identity Verification

### 6.1 Admin Viewer

| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Go to `/admin/identity-verifications` | Verification list renders |
| 2 | Filter by "Pending" | Only pending records shown |
| 3 | Click "View ID" | Secure popup opens, image loads |
| 4 | Switch to another browser tab during viewing | Image blurs immediately |
| 5 | Press PrintScreen | Image blurs immediately |
| 6 | Wait 60 seconds | Popup auto-closes |
| 7 | Right-click on image | Context menu suppressed |
| 8 | Try to drag image | Drag suppressed |
| 9 | Try accessing image URL directly without auth | `401 Unauthorized` |
| 10 | Open the uploaded image in MinIO browser | Image has "YUUMPY VERIFICATION ONLY" watermark |

---

## 7. Live Communication (Chat / Voice / Video)

| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Visit a product page as a logged-out user | Chat/Call/Video buttons show lock icon |
| 2 | Click Chat without being logged in | "Registration Required" prompt shown |
| 3 | Log in and click Chat | LiveKit room connects |
| 4 | Seller receives incoming chat notification | Bell icon pulses, request shown |
| 5 | Seller accepts the chat | Chat session opens for both parties |
| 6 | Send a message | Message appears on both sides |
| 7 | Seller is offline — click Voice Call | Button disabled for logged-in users |
| 8 | Call with no answer for 45 seconds | "No answer" error, auto-disconnect |
| 9 | Check browser console | No `Unknown DataChannel error` messages |

---

## 8. Admin Dashboard

### 8.1 Content Management

| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Go to `/admin/banner-ads` | Banner list renders |
| 2 | Create a new banner with image | Banner saved, appears on homepage slider |
| 3 | Toggle a banner inactive | Banner no longer shown on homepage |
| 4 | Go to `/admin/makers-section` | Image upload form renders |
| 5 | Upload an image and save | Image appears in "Meet the Makers" section |
| 6 | Change the quote and save | Updated quote visible on homepage |
| 7 | Go to `/admin/hero-video` | Video upload form renders |

### 8.2 Product & Order Management

| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Go to `/admin/products` | Product list renders |
| 2 | Go to `/admin/orders` | Orders list renders |
| 3 | Go to `/admin/escrow` | Escrow transactions visible |
| 4 | Go to `/admin/sellers` | Seller list renders, approve/reject works |

### 8.3 Identity Verifications

| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Go to `/admin/identity-verifications` | List renders |
| 2 | Approve a verification | Seller marked as verified |
| 3 | Reject with notes | Seller sees rejection reason |

---

## 9. Security Checks

| # | Check | Expected Result |
|---|-------|-----------------|
| 1 | Visit any page and inspect response headers | `X-Frame-Options: DENY` present |
| 2 | Inspect headers | `X-Content-Type-Options: nosniff` present |
| 3 | Inspect headers | `Content-Security-Policy` header present |
| 4 | Inspect headers | `Strict-Transport-Security` present (HTTPS only) |
| 5 | Try embedding the site in an iframe | Blocked by X-Frame-Options |
| 6 | Call `/api/admin/identity-verifications` with no token | `401 Unauthorized` |
| 7 | Call `/api/admin/identity-verifications/{id}/image` with no token | `401 Unauthorized` |
| 8 | Call `/api/cron/release-escrow` with no `x-cron-secret` | `401 Unauthorized` |
| 9 | Call `/api/cron/release-escrow` with wrong secret | `401 Unauthorized` |
| 10 | Start app without `JWT_SECRET` env var | Server throws on startup |
| 11 | Check error responses on `/api/checkout` | No `details` field in production |
| 12 | Navigate to `/admin/dashboard` with expired cookie | Redirected to `/admin/login` |

---

## 10. Pages & Content

| # | Page | Expected Result |
|---|------|-----------------|
| 1 | `/` | Homepage loads |
| 2 | `/about-yuumpy` | About page loads |
| 3 | `/privacy` | Privacy policy renders |
| 4 | `/terms` | Terms of service renders |
| 5 | `/safe-trading` | Advisory page renders with all sections |
| 6 | `/safe-trading` link in header | Visible in amber, desktop and mobile |
| 7 | `/safe-trading` link in footer | Visible in amber |
| 8 | `/404` (non-existent route) | Custom 404 page shown |
| 9 | Trigger a page error | `error.tsx` boundary shown (not raw crash) |

---

## 11. Known Limitations

- **Rate limiting is in-memory** — resets on server restart and does not persist across multiple server instances. For multi-server deployments, replace `src/lib/rate-limit.ts` with a Redis-backed solution.
- **Admin auth uses Base64 token** — the `/api/auth/login` route and middleware use a Base64-encoded session token. This is supplemented by a JWT-based system for API-level admin operations. A future improvement would be to consolidate to a single JWT system.
- **LiveKit screenshot blur** — blur on screenshot attempts is a best-effort browser-level deterrent. A determined user with OS-level screenshot tools cannot be stopped.
- **MinIO over HTTP** — MinIO runs over HTTP on the same server as the app. Traffic between the app and MinIO stays internal. If they are separated onto different servers, SSL should be enabled.
- **Console logs in API routes** — most API routes still use `console.error` / `console.warn` for logging. For production observability, replace with a structured logging solution (e.g. Pino, Winston, or Axiom).

---

*This document should be reviewed and updated with each major feature release.*
