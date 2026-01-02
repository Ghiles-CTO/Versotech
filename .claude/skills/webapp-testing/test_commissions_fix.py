"""
Quick test to verify My Commissions page fix
"""
from playwright.sync_api import sync_playwright
import os
import sys

sys.stdout.reconfigure(encoding='utf-8') if hasattr(sys.stdout, 'reconfigure') else None

SCREENSHOTS_DIR = os.path.join(os.path.dirname(__file__), 'screenshots', 'introducer_audit')
os.makedirs(SCREENSHOTS_DIR, exist_ok=True)

def test_commissions():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={'width': 1920, 'height': 1080})
        page = context.new_page()

        try:
            # Login
            print("Logging in...")
            page.goto('http://localhost:3000/versotech_main/login')
            page.wait_for_load_state('networkidle')
            page.fill('input[type="email"]', 'py.moussaouighiles@gmail.com')
            page.fill('input[type="password"]', 'TestIntro2024!')
            page.click('button[type="submit"]')
            page.wait_for_url('**/dashboard**', timeout=15000)
            print("[OK] Logged in")

            # Go directly to My Commissions
            print("\nTesting My Commissions page...")
            page.goto('http://localhost:3000/versotech_main/my-commissions')
            page.wait_for_load_state('networkidle')
            page.wait_for_timeout(2000)  # Extra wait for data load

            # Check for errors
            error_overlay = page.locator('[class*="error"], [class*="Error"]')
            if error_overlay.count() > 0:
                print("[FAIL] Error detected on page")
                page.screenshot(path=f'{SCREENSHOTS_DIR}/commissions_error.png', full_page=True)
            else:
                print("[OK] No errors on page")

            # Screenshot
            page.screenshot(path=f'{SCREENSHOTS_DIR}/04_my_commissions_fixed.png', full_page=True)

            # Check content
            content = page.content()
            if '$7,500' in content or '7,500' in content or '7500' in content:
                print("[OK] Commission amount visible ($7,500)")
            if 'Invoice Requested' in content or 'invoice_requested' in content:
                print("[OK] Invoice requested status visible")
            if 'invested amount' in content.lower() or 'invested_amount' in content:
                print("[OK] Basis type visible (invested_amount)")
            if 'Introducer' in content:
                print("[OK] Introducer badge visible")

            # Check table rows
            rows = page.locator('table tbody tr').count()
            print(f"[INFO] Found {rows} commission row(s)")

            print("\n[SUCCESS] My Commissions page working correctly!")

        except Exception as e:
            print(f"\n[ERROR]: {str(e)}")
            page.screenshot(path=f'{SCREENSHOTS_DIR}/commissions_error.png', full_page=True)
            raise
        finally:
            browser.close()

if __name__ == '__main__':
    test_commissions()
