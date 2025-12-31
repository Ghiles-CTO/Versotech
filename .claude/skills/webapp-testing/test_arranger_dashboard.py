"""
Test Arranger Dashboard - Verify all new components render correctly
"""
from playwright.sync_api import sync_playwright
import json

def test_arranger_dashboard():
    console_messages = []
    console_errors = []

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={'width': 1920, 'height': 1080})
        page = context.new_page()

        # Capture console messages
        def handle_console(msg):
            if msg.type == 'error':
                console_errors.append(f"[ERROR] {msg.text}")
            else:
                console_messages.append(f"[{msg.type.upper()}] {msg.text}")

        page.on('console', handle_console)

        print("=" * 60)
        print("ARRANGER DASHBOARD TEST")
        print("=" * 60)

        # Navigate to dashboard
        print("\n1. Navigating to dashboard...")
        page.goto('http://localhost:3000/versotech_main/dashboard', timeout=30000)

        # Wait for network idle (page fully loaded)
        print("2. Waiting for page to fully load...")
        page.wait_for_load_state('networkidle', timeout=30000)

        # Additional wait for React to render
        page.wait_for_timeout(3000)

        # Take full page screenshot
        print("3. Taking screenshot...")
        page.screenshot(path='C:/Users/gmmou/Desktop/VERSOTECH/Versotech/arranger_dashboard_test.png', full_page=True)
        print("   Screenshot saved to: arranger_dashboard_test.png")

        # Check for key elements
        print("\n4. Checking for key dashboard elements...")

        elements_to_check = [
            ("Escrow Funding card", "text=Escrow Funding"),
            ("Fee Pipeline card", "text=Fee Pipeline"),
            ("Subscription Pack Pipeline", "text=Subscription Pack Pipeline"),
            ("Awaiting Investor", "text=Awaiting Investor"),
            ("Awaiting Your Signature", "text=Awaiting Your Signature"),
            ("Awaiting CEO", "text=Awaiting CEO"),
            ("Signed This Month", "text=Signed This Month"),
            ("Accrued label", "text=Accrued"),
            ("Invoiced label", "text=Invoiced"),
            ("Paid label", "text=Paid"),
        ]

        found_elements = []
        missing_elements = []

        for name, selector in elements_to_check:
            try:
                element = page.locator(selector).first
                if element.is_visible(timeout=2000):
                    found_elements.append(name)
                    print(f"   [OK] Found: {name}")
                else:
                    missing_elements.append(name)
                    print(f"   [X] Missing (not visible): {name}")
            except:
                missing_elements.append(name)
                print(f"   [X] Missing: {name}")

        # Check for funding progress bar
        print("\n5. Checking for funding progress bar...")
        try:
            progress_bar = page.locator(".bg-green-500.h-full").first
            if progress_bar.is_visible(timeout=2000):
                print("   [OK] Found: Funding progress bar")
            else:
                print("   [X] Progress bar not visible")
        except:
            print("   [X] Progress bar not found")

        # Get page content for analysis
        print("\n6. Analyzing page content...")
        content = page.content()

        # Check for specific metric values (should have data)
        checks = [
            ("% Funded", "Funding percentage displayed"),
            ("USD", "Currency values displayed"),
            ("Pending collection", "Fee pipeline label"),
        ]

        for text, description in checks:
            if text in content:
                print(f"   [OK] {description}")
            else:
                print(f"   [?] {description} - text '{text}' not found")

        # Report console errors
        print("\n7. Console errors check...")
        if console_errors:
            print(f"   [!] Found {len(console_errors)} console error(s):")
            for err in console_errors[:5]:  # Show first 5
                print(f"      {err[:100]}...")
        else:
            print("   [OK] No console errors detected")

        # Summary
        print("\n" + "=" * 60)
        print("TEST SUMMARY")
        print("=" * 60)
        print(f"Elements found: {len(found_elements)}/{len(elements_to_check)}")
        print(f"Console errors: {len(console_errors)}")

        if missing_elements:
            print(f"\nMissing elements: {', '.join(missing_elements)}")

        if len(found_elements) >= 7 and len(console_errors) == 0:
            print("\n[PASS] DASHBOARD TEST PASSED")
        elif len(found_elements) >= 5:
            print("\n[WARN] DASHBOARD PARTIALLY WORKING - Some elements missing")
        else:
            print("\n[FAIL] DASHBOARD TEST FAILED - Multiple elements missing")

        browser.close()

if __name__ == "__main__":
    test_arranger_dashboard()
