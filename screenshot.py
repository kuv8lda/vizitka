from pathlib import Path

from playwright.sync_api import sync_playwright


OUTPUT = Path(__file__).resolve().parent / "assets" / "projects" / "vizitka.png"


def main():
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    with sync_playwright() as p:
        browser = p.chromium.launch()
        try:
            page = browser.new_page(
                viewport={"width": 1440, "height": 900},
                device_scale_factor=1,
            )
            page.goto("http://127.0.0.1:8080/", wait_until="load")
            page.wait_for_timeout(2000)
            page.screenshot(path=str(OUTPUT), full_page=False)
            print(f"Скриншот сохранён: {OUTPUT}")
        finally:
            browser.close()


if __name__ == "__main__":
    main()
