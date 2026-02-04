"""
Notification Center CTA Regression Test
Ensures the bell dropdown exposes a clear "Open notifications" link without scrolling.
"""
from playwright.sync_api import sync_playwright
import os
import sys


def fail(message: str) -> None:
    print(f"FAIL: {message}")
    sys.exit(1)


os.makedirs("screenshots", exist_ok=True)


with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    context = browser.new_context(viewport={"width": 1365, "height": 768})
    page = context.new_page()

    print("Notifications CTA: Navigating to login...")
    page.goto("http://localhost:3000/versotech_main/login")
    page.wait_for_load_state("networkidle")

    print("Notifications CTA: Filling credentials...")
    page.fill('input[type="email"], input[name="email"]', "cto@versoholdings.com")
    page.fill('input[type="password"], input[name="password"]', "123123")
    page.screenshot(path="screenshots/notification_cta_login.png", full_page=True)

    print("Notifications CTA: Submitting login...")
    page.click('button[type="submit"]')
    page.wait_for_load_state("networkidle")
    page.wait_for_timeout(1500)

    print("Notifications CTA: Opening dashboard...")
    page.goto("http://localhost:3000/versotech_main")
    page.wait_for_load_state("networkidle")
    page.wait_for_timeout(1500)

    print("Notifications CTA: Opening bell dropdown...")
    bell_button = page.locator("button:has(svg.lucide-bell)").first
    if bell_button.count() == 0:
        fail("Notifications CTA: Bell icon button not found.")
    bell_button.click()
    page.wait_for_timeout(500)
    page.screenshot(path="screenshots/notification_cta_dropdown.png", full_page=True)

    cta_link = page.get_by_role("link", name="Open notifications")
    if not cta_link.is_visible():
        fail("Notifications CTA: 'Open notifications' link is not visible.")

    print("PASS: Notification center shows an 'Open notifications' CTA.")
    context.close()
    browser.close()
