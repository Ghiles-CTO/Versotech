# -*- coding: utf-8 -*-
"""Test GDPR controls in Profile Preferences tab"""
from playwright.sync_api import sync_playwright
import time
import sys
import io

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

def test_gdpr_controls():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Login
        print("1. Logging in...")
        page.goto('http://localhost:3000/versotech_main/login')
        page.wait_for_load_state('networkidle')
        page.fill('input[type="email"]', 'py.moussaouighiles@gmail.com')
        page.fill('input[type="password"]', 'TestIntro2024!')
        page.click('button[type="submit"]')
        page.wait_for_url('**/dashboard**', timeout=15000)
        print("   Login successful!")

        # Go to Profile
        print("\n2. Navigating to Profile...")
        page.goto('http://localhost:3000/versotech_main/introducer-profile')
        page.wait_for_load_state('networkidle')
        time.sleep(1)

        # Take screenshot of Profile tab
        page.screenshot(path='screenshots/gdpr_01_profile_tab.png', full_page=True)
        print("   Screenshot: gdpr_01_profile_tab.png")

        # Click on each tab and screenshot
        tabs = ['Agreement', 'Security', 'Preferences']
        for tab in tabs:
            print(f"\n3. Clicking '{tab}' tab...")
            try:
                tab_button = page.locator(f'button:has-text("{tab}"), [role="tab"]:has-text("{tab}")').first
                if tab_button.is_visible():
                    tab_button.click()
                    time.sleep(1)
                    page.screenshot(path=f'screenshots/gdpr_02_{tab.lower()}_tab.png', full_page=True)
                    print(f"   Screenshot: gdpr_02_{tab.lower()}_tab.png")

                    # If Preferences tab, check for GDPR controls
                    if tab == 'Preferences':
                        print("\n   Checking for GDPR controls...")
                        gdpr_checks = [
                            ('Export Data button', 'text=Export, text=Download'),
                            ('Delete Account button', 'text=Delete, text=Remove'),
                            ('Privacy Policy link', 'text=Privacy'),
                            ('Data Rights info', 'text=Rights, text=GDPR'),
                            ('Notification toggles', 'input[type="checkbox"], [role="switch"]'),
                        ]
                        for check_name, selector in gdpr_checks:
                            found = False
                            for sel in selector.split(', '):
                                if page.locator(sel.strip()).count() > 0:
                                    found = True
                                    break
                            status = "[OK]" if found else "[XX]"
                            print(f"      {status} {check_name}")
                else:
                    print(f"   Tab '{tab}' not visible")
            except Exception as e:
                print(f"   Error clicking '{tab}': {e}")

        # Final full-page screenshot
        page.screenshot(path='screenshots/gdpr_03_final.png', full_page=True)
        print("\n   Final screenshot: gdpr_03_final.png")

        browser.close()

if __name__ == "__main__":
    import os
    os.makedirs('screenshots', exist_ok=True)
    test_gdpr_controls()
