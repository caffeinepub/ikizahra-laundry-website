# Specification

## Summary
**Goal:** Let the site owner replace the default “Share Your Photo” section image with a custom admin-uploaded image, with configurable sizing and fit behavior, while keeping the current image as a fallback.

**Planned changes:**
- Replace the hardcoded “Share Your Photo” background image with a configurable image setting, falling back to `/assets/generated/contact-woman-laundry.dim_800x600.jpg` when no custom image is set.
- Add an admin-only UI to upload/replace/remove the “Share Your Photo” image (JPEG/PNG/WebP up to 10MB) and choose whether to keep original dimensions or downscale (no upscaling).
- Add an admin-controlled fit mode for rendering the “Share Your Photo” image (e.g., contain vs cover) while preserving the existing overlay/gradient styling.
- Store the uploaded image in the canister so it persists across refreshes, and update the section image immediately after upload without a full reload.

**User-visible outcome:** Admins can upload and manage a custom image for the “Share Your Photo” section (including size handling and fit mode), and visitors will see the uploaded image (or the current default if none is set).
