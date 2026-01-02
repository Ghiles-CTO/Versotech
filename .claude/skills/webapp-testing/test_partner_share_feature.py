"""
Test Partner SHARE Feature - Core Partner functionality
PRD 5.6.4: Partner shares deal with investor
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
    page.screenshot(path='screenshots/partner_audit/09_opportunities_for_share.png', full_page=True)
    print("Screenshot: 09_opportunities_for_share.png")

    # Click on a deal card to view details
    print("Clicking on Anthropic deal to view details...")
    anthropic_card = page.locator('text=Anthropic').first
    if anthropic_card.is_visible():
        # Click View details button
        view_details = page.locator('text=View details').first
        if view_details.is_visible():
            view_details.click()
            page.wait_for_load_state('networkidle')
            page.wait_for_timeout(3000)
            page.screenshot(path='screenshots/partner_audit/10_deal_detail.png', full_page=True)
            print("Screenshot: 10_deal_detail.png")

            # Look for Share button
            share_button = page.locator('button:has-text("Share"), [aria-label*="share"], text=Share').first
            if share_button.is_visible():
                print("Found Share button!")
                share_button.click()
                page.wait_for_timeout(1500)
                page.screenshot(path='screenshots/partner_audit/11_share_dialog.png', full_page=True)
                print("Screenshot: 11_share_dialog.png")
            else:
                print("Share button not found on deal detail page")
                # Check if there's a Share icon in actions
                actions = page.locator('[class*="action"], [class*="menu"], button').all()
                print(f"Found {len(actions)} potential action elements")
        else:
            print("View details button not visible")
    else:
        print("Anthropic deal card not found")

    # Also check if there's a share button on the opportunities list page
    print("\nChecking for share functionality on opportunities list...")
    page.goto('http://localhost:3000/versotech_main/opportunities')
    page.wait_for_load_state('networkidle')
    page.wait_for_timeout(2000)

    # Look for any share-related buttons or links
    share_elements = page.locator('[class*="share"], [aria-label*="Share"], button:has-text("Share")').all()
    print(f"Found {len(share_elements)} share-related elements on opportunities page")

    # Check the deals available for sharing
    deal_cards = page.locator('[class*="card"], [class*="deal"]').all()
    print(f"Found {len(deal_cards)} deal cards")

    browser.close()
    print("\nShare feature test complete!")
