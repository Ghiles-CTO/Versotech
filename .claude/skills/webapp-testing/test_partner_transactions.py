"""
Test Partner Transactions page with longer wait time
"""
from playwright.sync_api import sync_playwright
import os

os.makedirs('screenshots/partner_audit', exist_ok=True)

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={'width': 1920, 'height': 1080})

    # Login
    print("Logging in...")
    page.goto('http://localhost:3000/versotech_main/login')
    page.wait_for_load_state('networkidle')
    page.fill('input[type="email"]', 'cto@verso-operation.com')
    page.fill('input[type="password"]', 'VersoPartner2024!')
    page.click('button[type="submit"]')
    page.wait_for_load_state('networkidle')
    page.wait_for_timeout(2000)

    # Navigate to Transactions
    print("Navigating to Transactions page...")
    page.goto('http://localhost:3000/versotech_main/partner-transactions')
    page.wait_for_load_state('networkidle')
    page.wait_for_timeout(5000)  # Longer wait for data to load

    page.screenshot(path='screenshots/partner_audit/03_transactions_full.png', full_page=True)
    print("Screenshot saved: 03_transactions_full.png")

    # Navigate to Shared Deals
    print("Navigating to Shared Deals page...")
    page.goto('http://localhost:3000/versotech_main/shared-transactions')
    page.wait_for_load_state('networkidle')
    page.wait_for_timeout(5000)

    page.screenshot(path='screenshots/partner_audit/05_shared_deals_full.png', full_page=True)
    print("Screenshot saved: 05_shared_deals_full.png")

    # Navigate to Profile
    print("Navigating to Profile page...")
    page.goto('http://localhost:3000/versotech_main/profile')
    page.wait_for_load_state('networkidle')
    page.wait_for_timeout(3000)

    page.screenshot(path='screenshots/partner_audit/07_profile_full.png', full_page=True)
    print("Screenshot saved: 07_profile_full.png")

    # Test notifications panel
    print("Testing notifications...")
    page.goto('http://localhost:3000/versotech_main/dashboard')
    page.wait_for_load_state('networkidle')
    page.wait_for_timeout(2000)

    # Click notification bell
    bell = page.locator('button:has(.lucide-bell), [class*="notification"]').first
    if bell.is_visible():
        bell.click()
        page.wait_for_timeout(1500)
        page.screenshot(path='screenshots/partner_audit/08_notifications_panel.png', full_page=True)
        print("Screenshot saved: 08_notifications_panel.png")
    else:
        print("Notification bell not found, trying alternative...")
        # Try clicking on the notification count badge
        badge = page.locator('[class*="badge"], [class*="count"]').first
        if badge.is_visible():
            badge.click()
            page.wait_for_timeout(1500)
            page.screenshot(path='screenshots/partner_audit/08_notifications_panel.png', full_page=True)

    browser.close()
    print("Done!")
