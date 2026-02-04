"""
Messaging Scroll Regression Test
Ensures composer is visible without page scroll and chat panels handle their own scrolling.
"""
from playwright.sync_api import sync_playwright
import os
import sys


def fail(message: str) -> None:
    print(f"FAIL: {message}")
    sys.exit(1)


os.makedirs("screenshots", exist_ok=True)


def check_composer(page, label: str) -> None:
    sidebar = page.locator("aside").first
    convo_buttons = sidebar.locator("button")
    if convo_buttons.count() == 0:
        fail(f"{label}: No conversations found to validate composer visibility.")

    print(f"{label}: Selecting first conversation...")
    convo_buttons.nth(0).click()
    page.wait_for_timeout(800)

    empty_state = page.get_by_text("Start the Conversation")
    if empty_state.is_visible():
        fail(f"{label}: Conversation shows empty state instead of messages.")

    composer = page.locator('textarea[placeholder="Type a message…"], textarea[placeholder="Type a message..."]').first
    composer.wait_for(state="visible", timeout=10000)

    overflow_y = page.evaluate("getComputedStyle(document.querySelector('main')).overflowY")
    if overflow_y not in ("hidden", "clip"):
        fail(f"{label}: Main content overflow is '{overflow_y}', expected hidden/clip.")

    box = composer.bounding_box()
    if not box:
        fail(f"{label}: Composer bounding box not available.")

    viewport_height = page.viewport_size["height"]
    if box["y"] + box["height"] > viewport_height:
        fail(f"{label}: Composer is below the viewport; page scroll required to reach input.")


with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)

    scenarios = [
        {
            "label": "Staff inbox",
            "email": "cto@versoholdings.com",
            "password": "123123",
            "target_url": "http://localhost:3000/versotech_main/inbox?tab=messages",
        },
    ]

    for idx, scenario in enumerate(scenarios, start=1):
        context = browser.new_context(viewport={"width": 1365, "height": 500})
        page = context.new_page()

        print(f"{scenario['label']}: Navigating to login...")
        page.goto("http://localhost:3000/versotech_main/login")
        page.wait_for_load_state("networkidle")

        print(f"{scenario['label']}: Filling credentials...")
        page.fill('input[type="email"], input[name="email"]', scenario["email"])
        page.fill('input[type="password"], input[name="password"]', scenario["password"])
        page.screenshot(path=f"screenshots/messaging_scroll_{idx:02d}_login.png", full_page=True)

        print(f"{scenario['label']}: Submitting login...")
        page.click('button[type="submit"]')
        page.wait_for_load_state("networkidle")
        page.wait_for_timeout(1500)

        print(f"{scenario['label']}: Opening messages...")
        page.goto(scenario["target_url"])
        page.wait_for_load_state("networkidle")
        page.wait_for_timeout(1500)
        page.screenshot(path=f"screenshots/messaging_scroll_{idx:02d}_messages.png", full_page=True)

        injected = page.evaluate(
            """() => {
                const main = document.querySelector('main');
                if (!main) return false;
                if (main.dataset.testOffsetApplied === 'true') return true;
                main.style.paddingTop = '140px';
                main.dataset.testOffsetApplied = 'true';
                return true;
            }"""
        )
        if not injected:
            fail(f"{scenario['label']}: Failed to inject layout banner.")

        check_composer(page, scenario["label"])
        page.screenshot(path=f"screenshots/messaging_scroll_{idx:02d}_composer.png", full_page=True)
        print(f"{scenario['label']}: PASS")

        context.close()

    browser.close()
    print("PASS: Composer visible without page scroll.")
