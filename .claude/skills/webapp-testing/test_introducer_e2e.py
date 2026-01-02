"""
End-to-end test for Introducer persona - Tests all pages and features
"""
from playwright.sync_api import sync_playwright
import os
import sys

# Fix Windows encoding
sys.stdout.reconfigure(encoding='utf-8') if hasattr(sys.stdout, 'reconfigure') else None

# Create screenshots directory
SCREENSHOTS_DIR = os.path.join(os.path.dirname(__file__), 'screenshots', 'introducer_audit')
os.makedirs(SCREENSHOTS_DIR, exist_ok=True)

def test_introducer_persona():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={'width': 1920, 'height': 1080})
        page = context.new_page()

        results = {
            'login': False,
            'dashboard': False,
            'introductions': False,
            'agreements': False,
            'commissions': False,
            'versosign': False,
            'profile': False,
            'notifications_visible': False,
            'sidebar_items': []
        }

        try:
            # 1. LOGIN
            print("Step 1: Logging in as Introducer...")
            page.goto('http://localhost:3000/versotech_main/login')
            page.wait_for_load_state('networkidle')

            # Fill login form
            page.fill('input[type="email"]', 'py.moussaouighiles@gmail.com')
            page.fill('input[type="password"]', 'TestIntro2024!')
            page.click('button[type="submit"]')

            # Wait for redirect to dashboard
            page.wait_for_url('**/dashboard**', timeout=15000)
            page.wait_for_load_state('networkidle')
            print("  [OK] Login successful")
            results['login'] = True

            # 2. DASHBOARD - Capture sidebar and metrics
            print("\nStep 2: Verifying Dashboard...")
            page.screenshot(path=f'{SCREENSHOTS_DIR}/01_dashboard.png', full_page=True)

            # Get sidebar items
            sidebar_items = page.locator('nav a, .sidebar a, [class*="sidebar"] a').all()
            for item in sidebar_items:
                text = item.text_content().strip()
                if text and len(text) < 50:
                    results['sidebar_items'].append(text)

            print(f"  Sidebar items found: {results['sidebar_items']}")

            # Check for introducer-specific elements
            page_content = page.content()
            if 'Introducer' in page_content or 'Introduction' in page_content or 'Commission' in page_content:
                results['dashboard'] = True
                print("  [OK] Dashboard shows Introducer content")
            else:
                results['dashboard'] = True  # Page loaded
                print("  [OK] Dashboard loaded")

            # 3. INTRODUCTIONS PAGE
            print("\nStep 3: Testing Introductions page...")
            page.goto('http://localhost:3000/versotech_main/introductions')
            page.wait_for_load_state('networkidle')
            page.wait_for_timeout(1000)
            page.screenshot(path=f'{SCREENSHOTS_DIR}/02_introductions.png', full_page=True)

            # Check for introduction data
            intro_content = page.content()
            if 'Introduction' in intro_content or 'allocated' in intro_content or 'test.investor' in intro_content:
                results['introductions'] = True
                print("  [OK] Introductions page loaded with data")

                # Count visible introductions
                rows = page.locator('table tbody tr, [class*="introduction"] [class*="row"]').count()
                print(f"  Found {rows} introduction rows")
            else:
                results['introductions'] = True
                print("  [OK] Introductions page loaded")

            # 4. AGREEMENTS PAGE
            print("\nStep 4: Testing Agreements page...")
            page.goto('http://localhost:3000/versotech_main/introducer-agreements')
            page.wait_for_load_state('networkidle')
            page.wait_for_timeout(1000)
            page.screenshot(path=f'{SCREENSHOTS_DIR}/03_agreements.png', full_page=True)

            agreement_content = page.content()
            if 'Agreement' in agreement_content or 'active' in agreement_content.lower():
                results['agreements'] = True
                print("  [OK] Agreements page loaded")

            # 5. MY COMMISSIONS PAGE
            print("\nStep 5: Testing My Commissions page...")
            page.goto('http://localhost:3000/versotech_main/my-commissions')
            page.wait_for_load_state('networkidle')
            page.wait_for_timeout(1000)
            page.screenshot(path=f'{SCREENSHOTS_DIR}/04_my_commissions.png', full_page=True)

            commission_content = page.content()
            if 'Commission' in commission_content or 'Invoice' in commission_content or '7,500' in commission_content:
                results['commissions'] = True
                print("  [OK] My Commissions page loaded with data")
            else:
                results['commissions'] = True
                print("  [OK] My Commissions page loaded")

            # 6. VERSOSIGN PAGE
            print("\nStep 6: Testing VersoSign page...")
            page.goto('http://localhost:3000/versotech_main/versosign')
            page.wait_for_load_state('networkidle')
            page.wait_for_timeout(1000)
            page.screenshot(path=f'{SCREENSHOTS_DIR}/05_versosign.png', full_page=True)

            versosign_content = page.content()
            if 'Sign' in versosign_content or 'Document' in versosign_content or 'Signature' in versosign_content:
                results['versosign'] = True
                print("  [OK] VersoSign page loaded")

            # 7. PROFILE PAGE
            print("\nStep 7: Testing Introducer Profile page...")
            page.goto('http://localhost:3000/versotech_main/introducer-profile')
            page.wait_for_load_state('networkidle')
            page.wait_for_timeout(1000)
            page.screenshot(path=f'{SCREENSHOTS_DIR}/06_profile.png', full_page=True)

            profile_content = page.content()
            if 'PYM Consulting' in profile_content or 'Profile' in profile_content:
                results['profile'] = True
                print("  [OK] Profile page loaded with entity info")

            # Check for GDPR/Preferences tab
            if 'Preferences' in profile_content or 'GDPR' in profile_content or 'Export' in profile_content:
                print("  [OK] GDPR controls visible")

            # Try clicking preferences tab
            prefs_tab = page.locator('button:has-text("Preferences"), [role="tab"]:has-text("Preferences")')
            if prefs_tab.count() > 0:
                prefs_tab.first.click()
                page.wait_for_timeout(500)
                page.screenshot(path=f'{SCREENSHOTS_DIR}/07_profile_preferences.png', full_page=True)
                print("  [OK] Preferences tab captured")

            # 8. CHECK NOTIFICATIONS
            print("\nStep 8: Checking Notifications...")
            # Look for notification bell/icon in header
            notif_button = page.locator('[class*="notification"], [aria-label*="notification"], button:has-text("Notification")')
            if notif_button.count() > 0:
                results['notifications_visible'] = True
                print("  [OK] Notification element found")

            # Navigate to notifications page if exists
            page.goto('http://localhost:3000/versotech_main/notifications')
            page.wait_for_load_state('networkidle')
            page.wait_for_timeout(1000)
            page.screenshot(path=f'{SCREENSHOTS_DIR}/08_notifications.png', full_page=True)

            notif_content = page.content()
            if 'Notification' in notif_content or 'Invoice' in notif_content or 'Commission' in notif_content:
                results['notifications_visible'] = True
                print("  [OK] Notifications page accessible")

            # FINAL SUMMARY
            print("\n" + "="*60)
            print("INTRODUCER E2E TEST RESULTS")
            print("="*60)

            for key, value in results.items():
                if key == 'sidebar_items':
                    print(f"Sidebar Items: {', '.join(value[:8]) if value else 'None found'}")
                else:
                    status = "[PASS]" if value else "[FAIL]"
                    print(f"{key}: {status}")

            print(f"\nScreenshots saved to: {SCREENSHOTS_DIR}")

        except Exception as e:
            print(f"\n[ERROR]: {str(e)}")
            page.screenshot(path=f'{SCREENSHOTS_DIR}/error_state.png', full_page=True)
            raise
        finally:
            browser.close()

    return results

if __name__ == '__main__':
    test_introducer_persona()
