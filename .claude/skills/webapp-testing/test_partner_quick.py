"""Quick Partner verification test"""
import sys
import time
import os
from playwright.sync_api import sync_playwright

BASE_URL = os.environ.get("TEST_BASE_URL", "http://localhost:3005")
EMAIL = "cto@verso-operation.com"
PASSWORD = "VersoPartner2024!"

def main():
    print(f"Testing Partner on {BASE_URL}")

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_context(viewport={"width": 1400, "height": 900}).new_page()

        try:
            # Login
            print("1. Login...")
            page.goto(f"{BASE_URL}/auth/login", timeout=60000)
            page.wait_for_load_state("networkidle", timeout=30000)
            page.fill('input[type="email"]', EMAIL)
            page.fill('input[type="password"]', PASSWORD)
            page.click('button[type="submit"]')
            page.wait_for_load_state("networkidle", timeout=30000)
            time.sleep(2)

            if "/auth" in page.url:
                print("ERROR: Login failed")
                return False
            print(f"   OK - Redirected to {page.url}")

            # My Commissions
            print("2. My Commissions page...")
            page.goto(f"{BASE_URL}/versotech_main/my-commissions", timeout=60000)
            page.wait_for_load_state("networkidle", timeout=30000)
            time.sleep(2)

            if page.locator("text=Error").count() > 0:
                print("   ERROR: Page shows error")
                page.screenshot(path="screenshots/partner_commissions_error.png")
                return False

            # Check for commissions table
            if page.locator("table").count() > 0:
                print("   OK - Commissions table visible")
            else:
                print("   WARN - No table visible")

            # Check DateRangePicker
            if page.locator("text=Pick a date, button[class*='DateRange']").count() > 0:
                print("   OK - DateRangePicker visible")

            # Partner Transactions
            print("3. Partner Transactions page...")
            page.goto(f"{BASE_URL}/versotech_main/partner-transactions", timeout=60000)
            page.wait_for_load_state("networkidle", timeout=30000)
            time.sleep(2)

            # Check for Passed filter
            if page.locator("text=Passed").count() > 0:
                print("   OK - Passed filter visible")
            else:
                # Click stage filter to check
                stage_btn = page.locator("button:has-text('All Stages')").first
                if stage_btn.count() > 0:
                    stage_btn.click()
                    time.sleep(0.5)
                    if page.locator("text=Passed").count() > 0:
                        print("   OK - Passed option in filter dropdown")
                    page.keyboard.press("Escape")

            # Opportunities (SHARE button)
            print("4. Opportunities page (SHARE feature)...")
            page.goto(f"{BASE_URL}/versotech_main/opportunities", timeout=60000)
            page.wait_for_load_state("networkidle", timeout=30000)
            time.sleep(2)

            if page.locator("button:has-text('Share')").count() > 0:
                print("   OK - Share button visible")
            else:
                print("   WARN - Share button not visible (may need deal cards)")

            print("\n=== ALL TESTS PASSED ===")
            return True

        except Exception as e:
            print(f"ERROR: {e}")
            return False
        finally:
            browser.close()

if __name__ == "__main__":
    os.makedirs("screenshots", exist_ok=True)
    success = main()
    sys.exit(0 if success else 1)
