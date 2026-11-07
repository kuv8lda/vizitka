# Kirill's Portfolio

[Russian version](README-ru.md)

A Python developer's portfolio website built with HTML, CSS, and JavaScript. No build tools or npm dependencies are required.

## Main screen (Cinematic Scrolling)
<img width="1440" height="900" alt="vizitka" src="https://github.com/user-attachments/assets/8e2932fb-9766-41ab-ad50-696122ed88e2" />
Changing three frames with a parallax effect is implemented on the native 'position: sticky' and 'requestAnimationFrame'.

**Adaptability** Full support for mobile devices. On screens smaller than 900px, the complex grid is rearranged into a convenient column.
| Desktop | Mobile | | :---: | :---: | | ![Desktop](assets/portfolio-frame-2.png) | ![Mobile](assets/portfolio-390x844.png)

**Project Section** Presentation of works in the form of Browser Frames with alternating sides (Z-pattern).
![Projects](portfolio-work.png)

## Technical features
* **Zero Build Step:** The project is started by opening 'index.html' or through any static server. It does not require 'npm install'.
* **Vanilla JS:** All logic (scroll frame switching, custom cursor, magnetic buttons) is written in pure JavaScript.
* * **Accessibility (A11Y):** Support for keyboard navigation (Tab, Focus), semantic layout, hidden headers for screen readers.
* * **Performance:** Animations are tied only to 'transform' and 'opacity'. Heavy scripts and images are loaded lazily ('loading="lazy"').
* * **Reduced Motion:** If the user has motion restriction enabled in the OS, animations are automatically disabled and content is displayed in static.

## Running locally

Python 3 is required:

```sh
python3 serve.py
```

Open http://127.0.0.1:8080/. To use another port, run `python3 serve.py --port 8081`. The server listens on `127.0.0.1` only; use `--bind` to change the address. This server is intended for local preview, not for hosting the website.

You can also open `index.html` without a server. An internet connection is required to load Google Fonts; otherwise, the browser uses a system font.

## Project structure

- `index.html`: text, projects, links, and FAQ.
- `styles.css`: styling and responsive layout.
- `main.js`: frame transitions on scroll and animations.
- `assets/demo-bot.mp4`: a recording of the bot in action.
- `assets/projects/`: screenshots of projects and the website.
- `serve.py`: local server.
- `screenshot.py`: updates `assets/projects/vizitka.png`.
- [DESIGN.md](DESIGN.md): website design and behavior.

## How it works

As you scroll, JavaScript switches between three frames and updates the frame number and progress indicator. Links with a magnetic effect move toward the mouse pointer.

When `prefers-reduced-motion` is enabled or on short screens, the frames appear one after another. The same order is preserved without JavaScript. With `prefers-reduced-motion`, video does not autoplay and the magnetic effect is disabled. The background animation runs for up to five seconds while visible; it is disabled on mobile screens, when reduced motion is enabled, and in forced-colors mode.

## Screenshot

`screenshot.py` requires Playwright and Chromium:

```sh
python3 -m venv .venv
.venv/bin/pip install playwright
.venv/bin/playwright install chromium
```

With the server running on port 8080, run:

```sh
.venv/bin/python screenshot.py
```

This command overwrites `assets/projects/vizitka.png` with a 1440 × 900 screenshot of the first screen.

## Checking changes

Check all three frames while scrolling, project links, the video, and the FAQ. Repeat the checks on a narrow screen and with `prefers-reduced-motion` enabled. Without JavaScript, all three frames should appear one after another.

There are no automated tests in this project.

Tests use mocks and do not require network access. Additional decisions are documented in [DECISIONS.md](DECISIONS.md), and Telegram interface guidelines are in [docs/TELEGRAM_UX.md](docs/TELEGRAM_UX.md).
