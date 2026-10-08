# Crawl Notes

## Pages / assets not retrieved

- All discovered assets retrieved successfully.
- Duplicate route variants crawled: /events vs /Events, /esummit vs /e-summit (kept separately in pages/).
- One CSS url() value was HTML-entity-escaped (hero-bg); it was downloaded manually and added to the manifest.
- robots.txt: User-agent * Allow / — crawl respected site rules; only basic proxy used, no auth-protected content accessed.

## Skipped / out-of-scope

- External links (Instagram, LinkedIn), mailto:, tel: not downloaded.
- Login-protected or non-public pages not accessed.
