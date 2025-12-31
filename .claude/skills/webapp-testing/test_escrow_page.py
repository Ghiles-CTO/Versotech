"""
Test script to verify the escrow page UI for arranger persona.
"""
from playwright.sync_api import sync_playwright
import os

def test_escrow_page():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        print("Navigating to escrow page...")
        # Use longer timeout for initial load (Next.js compiles on first visit)
        page.goto('http://localhost:3000/versotech_main/escrow', timeout=120000, wait_until='domcontentloaded')

        # Wait a bit for JS to load
        page.wait_for_timeout(5000)

        # Take initial screenshot
        screenshot_path = os.path.join(os.path.dirname(__file__), 'escrow_page_initial.png')
        page.screenshot(path=screenshot_path, full_page=True)
        print(f"Screenshot saved to: {screenshot_path}")

        # Check the current URL (might redirect to login)
        current_url = page.url
        print(f"Current URL: {current_url}")

        if 'login' in current_url.lower():
            print("Page redirected to login - authentication required")
            print("Taking screenshot of login page...")
            login_screenshot = os.path.join(os.path.dirname(__file__), 'escrow_login_redirect.png')
            page.screenshot(path=login_screenshot, full_page=True)
        else:
            # Page loaded - check for UI elements
            print("\n=== Checking UI Elements ===\n")

            # Get page content for analysis
            content = page.content()

            # Check for tabs
            tabs_to_check = ['Escrow Accounts', 'Pending Settlements', 'Fee Payments']
            print("Checking for tabs:")
            for tab in tabs_to_check:
                found = tab.lower() in content.lower()
                print(f"  - {tab}: {'✓ Found' if found else '✗ Not found'}")

            # Check for action buttons (should NOT be visible for arrangers)
            print("\nChecking for action buttons (should be hidden for arrangers):")
            confirm_funding_visible = page.locator('button:has-text("Confirm Funding")').count() > 0
            confirm_payment_visible = page.locator('button:has-text("Confirm Payment")').count() > 0
            print(f"  - Confirm Funding button: {'✗ VISIBLE (bug!)' if confirm_funding_visible else '✓ Hidden'}")
            print(f"  - Confirm Payment button: {'✗ VISIBLE (bug!)' if confirm_payment_visible else '✓ Hidden'}")

            # Check for date range picker
            print("\nChecking for date range filter:")
            date_picker_found = page.locator('text=Pick a date range').count() > 0 or \
                               page.locator('[id="date"]').count() > 0 or \
                               'Pick a date' in content
            print(f"  - Date Range Picker: {'✓ Found' if date_picker_found else '✗ Not found'}")

            # Check for Export CSV button
            print("\nChecking for Export CSV button:")
            export_button_found = page.locator('button:has-text("Export CSV")').count() > 0 or \
                                 page.locator('text=Export CSV').count() > 0
            print(f"  - Export CSV Button: {'✓ Found' if export_button_found else '✗ Not found'}")

            # Check for Arranger View badge
            print("\nChecking for Arranger View badge:")
            arranger_badge_found = 'Arranger View' in content
            print(f"  - Arranger View Badge: {'✓ Found' if arranger_badge_found else '✗ Not found'}")

            # Take final screenshot
            final_screenshot = os.path.join(os.path.dirname(__file__), 'escrow_page_final.png')
            page.screenshot(path=final_screenshot, full_page=True)
            print(f"\nFinal screenshot saved to: {final_screenshot}")

            # List all buttons on the page
            print("\n=== All visible buttons on page ===")
            buttons = page.locator('button').all()
            for i, btn in enumerate(buttons[:20]):  # Limit to first 20
                try:
                    text = btn.text_content()
                    if text and text.strip():
                        print(f"  {i+1}. {text.strip()[:50]}")
                except:
                    pass

        browser.close()
        print("\nTest completed!")

if __name__ == "__main__":
    test_escrow_page()
