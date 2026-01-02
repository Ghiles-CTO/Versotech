"""
Test Partner SHARE Feature on an OPEN deal
"""
from playwright.sync_api import sync_playwright
import os

os.makedirs('screenshots/partner_audit', exist_ok=True)

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={'width': 1920, 'height': 1080})

    # Login as Partner
    print("Logging in as Partner...")
    page.goto('http://localhost:3000/versotech_main/login')
    page.wait_for_load_state('networkidle')
    page.fill('input[type="email"]', 'cto@verso-operation.com')
    page.fill('input[type="password"]', 'VersoPartner2024!')
    page.click('button[type="submit"]')
    page.wait_for_load_state('networkidle')
    page.wait_for_timeout(2000)

    # Navigate to Opportunities
    print("Navigating to Opportunities...")
    page.goto('http://localhost:3000/versotech_main/opportunities')
    page.wait_for_load_state('networkidle')
    page.wait_for_timeout(3000)

    # Scroll down to see more deals
    page.evaluate("window.scrollBy(0, 500)")
    page.wait_for_timeout(1000)

    # Take screenshot showing all deals
    page.screenshot(path='screenshots/partner_audit/11_opportunities_all_deals.png', full_page=True)
    print("Screenshot: 11_opportunities_all_deals.png")

    # Look for "Share with Investor" button
    share_buttons = page.locator('button:has-text("Share with Investor")').all()
    print(f"Found {len(share_buttons)} 'Share with Investor' buttons")

    if len(share_buttons) > 0:
        print("Clicking first Share with Investor button...")
        share_buttons[0].click()
        page.wait_for_timeout(2000)
        page.screenshot(path='screenshots/partner_audit/12_share_dialog_open.png', full_page=True)
        print("Screenshot: 12_share_dialog_open.png")

        # Check dialog content
        dialog = page.locator('[role="dialog"]')
        if dialog.is_visible():
            print("Share dialog opened successfully!")
            dialog_text = dialog.text_content()
            print(f"Dialog content preview: {dialog_text[:200]}...")
        else:
            print("Dialog not found")
    else:
        print("No Share buttons found - checking for OPEN deals...")

        # Check what deal statuses are visible
        badges = page.locator('[class*="badge"], .badge').all()
        print(f"Found {len(badges)} badge elements")
        for i, badge in enumerate(badges[:10]):
            try:
                text = badge.text_content()
                print(f"  Badge {i}: {text}")
            except:
                pass

    # Check HTML for share buttons
    html_content = page.content()
    if 'Share with Investor' in html_content:
        print("'Share with Investor' text IS in page HTML")
    else:
        print("'Share with Investor' text NOT in page HTML")

    if 'ShareDealDialog' in html_content:
        print("ShareDealDialog component is referenced in page")
    else:
        print("ShareDealDialog NOT found in page")

    browser.close()
    print("\nTest complete!")
