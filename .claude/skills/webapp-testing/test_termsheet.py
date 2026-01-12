from playwright.sync_api import sync_playwright
import os

def test_termsheet_ui():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)  # Visible for debugging
        page = browser.new_page()

        # Navigate to the app
        page.goto('http://localhost:3000/versotech_main/login')
        page.wait_for_load_state('networkidle')

        # Take screenshot of login page to verify app is running
        screenshot_dir = os.path.join(os.path.dirname(__file__), 'screenshots')
        os.makedirs(screenshot_dir, exist_ok=True)
        page.screenshot(path=os.path.join(screenshot_dir, '01_login_page.png'), full_page=True)
        print("Screenshot saved: 01_login_page.png")

        # Check if login form exists
        email_input = page.locator('input[type="email"], input[name="email"]')
        if email_input.count() > 0:
            print("Login page loaded successfully!")
        else:
            print("Warning: Could not find email input on login page")

        # Keep browser open for manual inspection
        print("\nBrowser is open for manual inspection.")
        print("You can manually login and navigate to test the termsheet UI.")
        print("Press Ctrl+C to close when done...")

        try:
            page.wait_for_timeout(300000)  # Wait 5 minutes for manual testing
        except KeyboardInterrupt:
            print("\nClosing browser...")

        browser.close()

if __name__ == "__main__":
    test_termsheet_ui()
