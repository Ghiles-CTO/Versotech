from playwright.sync_api import sync_playwright
import os

def test_subscription_packs():
    """Test the subscription packs page UI and capture any errors"""
    console_messages = []
    errors = []

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Capture console messages
        page.on("console", lambda msg: console_messages.append(f"[{msg.type}] {msg.text}"))
        page.on("pageerror", lambda err: errors.append(str(err)))

        try:
            # Navigate to the subscription packs page
            print("Navigating to subscription packs page...")
            page.goto('http://localhost:3000/versotech_main/subscription-packs', timeout=30000)

            # Wait for page to fully load
            page.wait_for_load_state('networkidle', timeout=30000)

            # Take screenshot
            screenshot_path = '/tmp/subscription_packs_page.png'
            page.screenshot(path=screenshot_path, full_page=True)
            print(f"Screenshot saved to: {screenshot_path}")

            # Check page title and content
            title = page.title()
            print(f"Page title: {title}")

            # Check for error messages on page
            error_elements = page.locator('[class*="error"], [class*="Error"], .text-red-500, .text-destructive').all()
            if error_elements:
                print(f"Found {len(error_elements)} error elements on page")
                for el in error_elements[:5]:
                    text = el.text_content()
                    if text:
                        print(f"  - Error element: {text[:100]}")

            # Check for "Access Restricted" or "Authentication Required" messages
            page_content = page.content()
            if "Access Restricted" in page_content:
                print("WARNING: Page shows 'Access Restricted' - user not authenticated or wrong persona")
            if "Authentication Required" in page_content:
                print("WARNING: Page shows 'Authentication Required' - not logged in")
            if "Signed Subscription Packs" in page_content:
                print("SUCCESS: Page title 'Signed Subscription Packs' found - page loaded correctly")

            # Check for filter elements
            search_input = page.locator('input[placeholder*="Search"]').count()
            print(f"Search inputs found: {search_input}")

            select_elements = page.locator('[role="combobox"]').count()
            print(f"Select/dropdown elements found: {select_elements}")

            date_inputs = page.locator('input[type="date"]').count()
            print(f"Date inputs found: {date_inputs}")

            # Check for data table
            table_rows = page.locator('table tbody tr').count()
            print(f"Table rows found: {table_rows}")

            # Check for summary cards
            cards = page.locator('[class*="CardHeader"]').count()
            print(f"Card headers found: {cards}")

        except Exception as e:
            print(f"ERROR: {str(e)}")
            page.screenshot(path='/tmp/subscription_packs_error.png', full_page=True)
            errors.append(str(e))

        finally:
            browser.close()

    # Report console messages
    print("\n=== Console Messages ===")
    for msg in console_messages:
        if 'error' in msg.lower() or 'warn' in msg.lower():
            print(msg)

    # Report errors
    if errors:
        print("\n=== Page Errors ===")
        for err in errors:
            print(err)

    return len(errors) == 0

if __name__ == "__main__":
    success = test_subscription_packs()
    print(f"\nTest {'PASSED' if success else 'FAILED'}")
