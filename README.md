# Kirill's Portfolio

[Russian version](README-ru.md)

A Python developer's portfolio website built with pure HTML, CSS, and JavaScript. No build tools, frameworks, or npm dependencies are required.

## Demonstration
The first screen immediately demonstrates a working product. Below is the end-to-end video: a customer places an order in Telegram, and it instantly appears in the admin panel.

https://github.com/user-attachments/assets/31dadc71-5a85-493f-91d3-c46353c4af46

**Frame 1: Main Screen (Python + Telegram Bot)**
The first screen immediately demonstrates a working product: a video showing a Telegram bot processing an order. The cinematic scroll changes three frames using native `position: sticky` and `requestAnimationFrame`.
<img width="1440" height="900" alt="Main screen" src="assets/portfolio-desktop.png" />

**Frame 2: Admin Panel Orders**
The second screen demonstrates the backend part of the ecosystem (Flask + SQLite) with a browser frame mockup.
<img width="1440" height="900" alt="Admin Panel" src="assets/portfolio-frame-2.png" />

**Frame 3: This Portfolio Website**
The third screen focuses on frontend skills: pure HTML, CSS, and Vanilla JS with dark theme and responsive animations.
<img width="1440" height="900" alt="This website" src="assets/portfolio-frame-3.png" />

**Process Section**
A dedicated section explaining the workflow from idea to launch, giving potential clients confidence in the development process.
<img width="1440" height="900" alt="Work Process" src="assets/portfolio-process.png" />

### Mobile Adaptability
Full support for mobile devices. On screens smaller than 900px, the complex grid and cinematic scroll rearrange into a convenient, readable column.

| Main Screen | Admin Panel | Process |
| :---: | :---: | :---: |
| <img src="assets/portfolio-mobile-hero.png" width="250" alt="Mobile Main"> | <img src="assets/portfolio-mobile-frame-2.png" width="250" alt="Mobile Admin"> | <img src="assets/portfolio-mobile-process.png" width="250" alt="Mobile Process"> |

## Technical Features

* **Zero Build Step:** The project is started by simply opening `index.html` or through any static server. It does not require `npm install`.
* **Vanilla JS:** All logic (cinematic frame switching on scroll, magnetic buttons) is written in pure JavaScript without heavy libraries.
* **Accessibility (A11Y):** Support for keyboard navigation (Tab, Focus), semantic layout, and hidden headers for screen readers.
* **Performance:** Animations are strictly tied to `transform` and `opacity` to avoid layout thrashing. Images are loaded lazily (`loading="lazy"`).
* **Reduced Motion:** If the user has a motion restriction enabled in their OS (`prefers-reduced-motion`), animations are automatically disabled, the video pauses, and content is displayed sequentially in a static layout.

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

## Checking changes

Check all three frames while scrolling, project links, the video, and the FAQ. Repeat the checks on a narrow screen and with `prefers-reduced-motion` enabled. Without JavaScript, all three frames should appear one after another.
<<<<<<< HEAD

There are no automated tests in this project.

Tests use mocks and do not require network access. Additional decisions are documented in [DECISIONS.md](DECISIONS.md), and Telegram interface guidelines are in [docs/TELEGRAM_UX.md](docs/TELEGRAM_UX.md).
=======

There are no automated tests in this project.

Tests use mocks and do not require network access. Additional decisions are documented in [DECISIONS.md](DECISIONS.md), and Telegram interface guidelines are in [docs/TELEGRAM_UX.md](docs/TELEGRAM_UX.md).

>>>>>>> 80420f5 (Delete artifacts and local scripts)
