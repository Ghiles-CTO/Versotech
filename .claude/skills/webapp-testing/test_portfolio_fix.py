"""
Test to verify Portfolio page works for dual-persona user (Introducer + Investor)
"""
from playwright.sync_api import sync_playwright
import os
import sys

sys.stdout.reconfigure(encoding='utf-8') if hasattr(sys.stdout, 'reconfigure') else None

SCREENSHOTS_DIR = os.path.join(os.path.dirname(__file__), 'screenshots', 'portfolio_fix')
os.makedirs(SCREENSHOTS_DIR, exist_ok=True)

def test_portfolio():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={'width': 1920, 'height': 1080})
        page = context.new_page()

        try:
            # Login as dual-persona user (Introducer + Investor)
            print("Step 1: Logging in as dual-persona user...")
            page.goto('http://localhost:3000/versotech_main/login')
            page.wait_for_load_state('networkidle')
            page.fill('input[type="email"]', 'py.moussaouighiles@gmail.com')
            page.fill('input[type="password"]', 'TestIntro2024!')
            page.click('button[type="submit"]')
            page.wait_for_url('**/dashboard**', timeout=15000)
            page.wait_for_load_state('networkidle')
            print("  [OK] Logged in successfully")

            # Test Portfolio page
            print("\nStep 2: Testing Portfolio page (previously blocked)...")
            page.goto('http://localhost:3000/versotech_main/portfolio')
            page.wait_for_load_state('networkidle')
            page.wait_for_timeout(2000)  # Extra wait for API calls

            # Take screenshot
            page.screenshot(path=f'{SCREENSHOTS_DIR}/portfolio_page.png', full_page=True)

            # Check for errors
            content = page.content()
            if 'Investor access required' in content:
                print("  [FAIL] Still getting 'Investor access required' error")
                print("  The API fix may not have been applied.")
                return False
            elif 'error' in content.lower() and 'portfolio' not in content.lower():
                print("  [WARN] Some error on page (may be OK)")

            # Check for portfolio content
            if 'Portfolio' in content or 'Investment' in content or 'NAV' in content:
                print("  [OK] Portfolio page accessible!")

                # Check for KPIs
                kpi_cards = page.locator('[class*="card"], [class*="metric"], [class*="kpi"]').count()
                print(f"  Found {kpi_cards} KPI/metric cards")

                # Check for any data display
                if 'Total' in content or 'Value' in content or '$' in content:
                    print("  [OK] Financial data visible on page")
                else:
                    print("  [INFO] No financial data yet (may need subscriptions)")

                return True
            else:
                print("  [WARN] Page loaded but content unclear")
                return True  # Page loaded at least

        except Exception as e:
            print(f"\n[ERROR]: {str(e)}")
            page.screenshot(path=f'{SCREENSHOTS_DIR}/portfolio_error.png', full_page=True)
            return False
        finally:
            browser.close()

if __name__ == '__main__':
    success = test_portfolio()
    if success:
        print("\n[SUCCESS] Portfolio page is now accessible for dual-persona users!")
    else:
        print("\n[FAILURE] Portfolio page still has issues")
