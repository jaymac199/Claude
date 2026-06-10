# My Trip Around the World — Interactive Globe

An interactive 3D globe visualizing a round-the-world trip, built from the
booking PDFs. No build step needed — just open the file in a browser.

- **`index.html`** — desktop version (side itinerary panel, hover for details).
  Phones are auto-redirected to `mobile.html`; add `?desktop` to the URL to
  force the desktop build.
- **`mobile.html`** — phone-optimized version (see *Mobile* below). Has a
  "🖥 Desktop version" link in the header.

## The trip
**Garfield A. McIntyre Jr · Aug 24 – Sep 11, 2026 · 5 flights**

Atlanta → London → Mumbai → Singapore → Doha → Atlanta

| # | Route | Airline / Flight | Aircraft | Departs | Arrives |
|---|-------|------------------|----------|---------|---------|
| 1 | ATL → LHR | Virgin Atlantic VS0104 | Airbus A350-1000 | 24 Aug 18:15 | 25 Aug 07:15 |
| 2 | LHR → BOM | Virgin Atlantic VS0358 | Boeing 787-9 | 27 Aug 12:25 | 28 Aug 02:10 |
| 3 | BOM → SIN | Singapore Airlines SQ423 | Airbus A380-800 | 02 Sep 23:40 | 03 Sep 07:40 |
| 4 | SIN → DOH | Qatar Airways QR943 | Airbus A350-900 | 06 Sep 10:20 | 06 Sep 12:40 |
| 5 | DOH → ATL | Qatar Airways QR0755 | Airbus A350-1000 | 11 Sep 08:00 | 11 Sep 15:55 |

### Hotels
| City | Hotel | Dates | Program |
|------|-------|-------|---------|
| London | London Stay | Aug 25 – 27 | Pre-arranged |
| Mumbai | The Oberoi Mumbai | Aug 27 – 30 | Amex FHR |
| Mumbai | Four Seasons Worli | Aug 30 – Sep 2 | Amex FHR |
| Singapore | COMO Metropolitan | Sep 3 – 6 | Capital One Premier Collection |
| Doha | Aleph Doha Residences | Sep 6 – 10 | Capital One Travel |
| Doha | Hilton Doha | Sep 10 – 11 | Delta Stays |

## Features
- **Animated 3D globe** (night-earth texture) with a starfield background.
- **Glowing pink point on each airport** with pulsing rings; hover it for the
  airport name, its departing flight, and the hotels you're staying at in that city.
- **Gold point on each hotel** — hover for the property, dates, nights, program,
  and perks (credits, late checkout, etc.).
- **Curved flight-path lines** connecting every city in sequence so you can
  physically see the route loop around the world; hover an arc for full flight
  info (airline, flight no., aircraft, times, duration, cabin).
- **Side panel** — separate *Flights* and *Stays* lists; click any item to fly
  the camera to that leg or hotel.
- Drag to rotate, scroll to zoom; the globe auto-rotates until you interact.

## Mobile (`mobile.html`)
A version tuned for phones, since hover-based tooltips don't work on touch:
- **Tap** any glowing airport point, hotel point, or flight line to open a
  slide-up info card (the desktop version uses hover).
- **Draggable bottom sheet** with the full itinerary — separate *Flights* and
  *Stays* sections; swipe or tap the handle to expand/collapse, then tap a flight
  or hotel to zoom the globe to it.
- Larger touch targets, capped pixel ratio for smoother performance, and
  safe-area + address-bar handling so it fills the screen correctly.

## Notes
- Built with [globe.gl](https://github.com/vasturiano/globe.gl) /
  three.js, loaded from CDN — an internet connection is needed the first time
  you open the page.
- Airport coordinates are the published lat/long for each international airport;
  hotel coordinates are approximate (hotel/city locations).
- `poster.png` is a print-ready route poster generated from the same itinerary.
