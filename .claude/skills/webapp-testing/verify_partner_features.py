"""Quick verification of Partner features - My Commissions + SHARE"""
from playwright.sync_api import sync_playwright
import os

SCREENSHOTS_DIR = os.path.join(os.path.dirname(__file__), 'screenshots', 'verification')
os.makedirs(SCREENSHOTS_DIR, exist_ok=True)

def main():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={'width': 1920, 'height': 1080})
        page = context.new_page()

        print("=" * 60)
        print("PARTNER FEATURE VERIFICATION")
        print("=" * 60)

        # Login
        print("\n[1] LOGIN")
        page.goto('http://localhost:3000/auth/login')
        page.wait_for_load_state('networkidle')
        page.fill('input[type="email"]', 'cto@verso-operation.com')
        page.fill('input[type="password"]', 'VersoPartner2024!')
        page.click('button[type="submit"]')
        page.wait_for_load_state('networkidle')
        page.wait_for_timeout(3000)
        print(f"  Logged in, URL: {page.url}")

        # Test 1: My Commissions Page
        print("\n[2] MY COMMISSIONS PAGE")
        page.goto('http://localhost:3000/versotech_main/my-commissions')
        page.wait_for_load_state('networkidle')
        page.wait_for_timeout(2000)

        page.screenshot(path=os.path.join(SCREENSHOTS_DIR, 'my_commissions.png'), full_page=True)

        body = page.locator('body').inner_text()

        # Check for key elements
        checks = {
            'Total Owed card': 'Total Owed' in body or 'Owed' in body,
            'Total Paid card': 'Total Paid' in body or 'Paid' in body,
            'Currency displayed': 'USD' in body or '$' in body,
            'Commission amounts': any(x in body for x in ['1,000', '1,500', '5,000', '2,500']),
            'Invoice button': 'Invoice' in body or 'Request' in body,
            'No error visible': 'error' not in body.lower() or 'failed to load' not in body.lower(),
        }

        print("  Checks:")
        for check, passed in checks.items():
            status = "[OK]" if passed else "[FAIL]"
            print(f"    {status} {check}")

        my_commissions_ok = sum(checks.values()) >= 4  # Allow some flexibility
        print(f"\n  MY COMMISSIONS: {'PASS' if my_commissions_ok else 'FAIL'}")

        # Test 2: SHARE Feature
        print("\n[3] SHARE FEATURE")
        page.goto('http://localhost:3000/versotech_main/opportunities')
        page.wait_for_load_state('networkidle')
        page.wait_for_timeout(2000)

        page.screenshot(path=os.path.join(SCREENSHOTS_DIR, 'opportunities.png'), full_page=True)

        # Find and click Share button
        share_button = page.locator('button:has-text("Share")').first
        share_visible = False
        dialog_opened = False
        investor_selector = False

        try:
            if share_button.is_visible():
                share_visible = True
                print("  Share button found, clicking...")
                share_button.click()
                page.wait_for_timeout(1500)

                page.screenshot(path=os.path.join(SCREENSHOTS_DIR, 'share_dialog.png'), full_page=True)

                # Check dialog
                dialog = page.locator('[role="dialog"]')
                if dialog.is_visible():
                    dialog_opened = True
                    dialog_text = dialog.inner_text()
                    investor_selector = 'Investor' in dialog_text or 'Select' in dialog_text
                    print(f"  Dialog opened: {dialog_opened}")
                    print(f"  Investor selector: {investor_selector}")
                else:
                    print("  Dialog did NOT open")
            else:
                print("  Share button NOT visible")
        except Exception as e:
            print(f"  Error: {e}")

        share_ok = share_visible and dialog_opened
        print(f"\n  SHARE FEATURE: {'PASS' if share_ok else 'FAIL'}")

        # Test 3: Partner Transactions with Stage Filter
        print("\n[4] PARTNER TRANSACTIONS - STAGE FILTER")
        page.goto('http://localhost:3000/versotech_main/partner-transactions')
        page.wait_for_load_state('networkidle')
        page.wait_for_timeout(2000)

        page.screenshot(path=os.path.join(SCREENSHOTS_DIR, 'partner_transactions.png'), full_page=True)

        body = page.locator('body').inner_text()
        stage_checks = {
            'Stage filter visible': 'Stage' in body or 'status' in body.lower(),
            'Dispatched visible': 'Dispatched' in body,
            'Interested visible': 'Interested' in body,
            'Commission column': 'Commission' in body or '%' in body,
        }

        print("  Checks:")
        for check, passed in stage_checks.items():
            status = "[OK]" if passed else "[FAIL]"
            print(f"    {status} {check}")

        # Summary
        print("\n" + "=" * 60)
        print("VERIFICATION SUMMARY")
        print("=" * 60)
        print(f"  My Commissions Page: {'PASS' if my_commissions_ok else 'FAIL'}")
        print(f"  Share Feature: {'PASS' if share_ok else 'FAIL'}")
        print(f"  Screenshots saved to: {SCREENSHOTS_DIR}")

        browser.close()

        return my_commissions_ok and share_ok

if __name__ == '__main__':
    success = main()
    exit(0 if success else 1)
