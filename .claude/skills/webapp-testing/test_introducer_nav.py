# -*- coding: utf-8 -*-
"""Test Introducer sidebar navigation after adding My Commissions"""
from playwright.sync_api import sync_playwright
import time
import sys
import io

# Fix encoding for Windows
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

EXPECTED_SIDEBAR_ITEMS = [
    "Dashboard",
    "Introductions",
    "Agreements",
    "My Commissions",  # NEW - was missing before fix
    "VersoSign",
    "Profile"
]

def test_introducer_navigation():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        print("1. Navigating to login page...")
        page.goto('http://localhost:3000/versotech_main/login')
        page.wait_for_load_state('networkidle')

        # Take screenshot of login page
        page.screenshot(path='screenshots/introducer_01_login.png', full_page=True)
        print("   Screenshot: introducer_01_login.png")

        print("2. Logging in as Introducer...")
        # Fill login form - wait for inputs to be ready
        email_input = page.wait_for_selector('input[type="email"]', timeout=10000)
        email_input.fill('py.moussaouighiles@gmail.com')

        password_input = page.wait_for_selector('input[type="password"]', timeout=10000)
        password_input.fill('TestIntro2024!')

        # Take screenshot before clicking
        page.screenshot(path='screenshots/introducer_02_form_filled.png', full_page=True)
        print("   Screenshot: introducer_02_form_filled.png")

        # Click login button and wait for navigation
        submit_button = page.locator('button[type="submit"]')
        submit_button.click()

        # Wait for URL to change (indicating successful login)
        print("   Waiting for authentication...")
        try:
            # Wait for URL to NOT be login page (max 15 seconds)
            page.wait_for_url('**/dashboard**', timeout=15000)
            print("   Login successful! Redirected to dashboard")
        except:
            # Check if there's an error message
            time.sleep(3)
            print(f"   Current URL after wait: {page.url}")

            # Check for error messages
            error_msg = page.locator('[class*="error"], [class*="alert"], [role="alert"]').first
            if error_msg.is_visible():
                print(f"   Error message found: {error_msg.text_content()}")

            # Take screenshot of error state
            page.screenshot(path='screenshots/introducer_03_error.png', full_page=True)
            print("   Screenshot: introducer_03_error.png")

        # Take screenshot after login attempt
        page.wait_for_load_state('networkidle')
        time.sleep(2)

        current_url = page.url
        print(f"   Final URL: {current_url}")
        page.screenshot(path='screenshots/introducer_04_after_login.png', full_page=True)
        print("   Screenshot: introducer_04_after_login.png")

        # Only proceed if we're past the login page
        if '/login' in current_url:
            print("\n   LOGIN FAILED - still on login page")
            print("   Possible causes:")
            print("   - Invalid credentials")
            print("   - Account doesn't exist")
            print("   - Database connection issue")
            browser.close()
            return False

        print("\n3. Checking sidebar navigation items...")

        # Wait for sidebar to load
        time.sleep(2)

        # Get page content for debugging
        page_text = page.content()

        # Get all navigation links
        all_links = page.locator('a').all()
        nav_items = []
        for link in all_links:
            try:
                text = link.text_content()
                href = link.get_attribute('href') or ''
                if text and '/versotech_main/' in href:
                    nav_items.append({
                        'text': text.strip(),
                        'href': href
                    })
            except:
                pass

        print(f"   Found {len(nav_items)} navigation links:")
        for item in nav_items:
            print(f"      - {item['text']} -> {item['href']}")

        # Verify each expected item
        print("\n4. Verifying expected sidebar items...")
        results = {}
        for expected in EXPECTED_SIDEBAR_ITEMS:
            found = any(expected.lower() in item['text'].lower() for item in nav_items)
            status = "FOUND" if found else "MISSING"
            results[expected] = status
            icon = "[OK]" if found else "[XX]"
            print(f"   {icon} {expected}: {status}")

        # Take focused screenshot of the sidebar area
        page.screenshot(path='screenshots/introducer_05_sidebar.png', full_page=True)
        print("\n   Screenshot: introducer_05_sidebar.png")

        # Test clicking on My Commissions if found
        print("\n5. Testing My Commissions navigation...")
        my_comm_found = any('commission' in item['text'].lower() for item in nav_items)
        if my_comm_found:
            try:
                comm_link = page.locator('a:has-text("Commissions")').first
                comm_link.click()
                page.wait_for_load_state('networkidle')
                time.sleep(1)
                print(f"   Navigated to: {page.url}")
                page.screenshot(path='screenshots/introducer_06_commissions.png', full_page=True)
                print("   Screenshot: introducer_06_commissions.png")
            except Exception as e:
                print(f"   Error clicking My Commissions: {e}")
        else:
            print("   My Commissions link not found in sidebar!")

        # Summary
        print("\n" + "="*50)
        print("SUMMARY")
        print("="*50)
        all_found = all(v == "FOUND" for v in results.values())
        if all_found:
            print("[SUCCESS] All sidebar items present!")
            print("Navigation fix VERIFIED")
        else:
            missing = [k for k, v in results.items() if v == "MISSING"]
            print(f"[FAILED] Missing items: {missing}")

        browser.close()
        return all_found

if __name__ == "__main__":
    import os
    os.makedirs('screenshots', exist_ok=True)
    success = test_introducer_navigation()
    exit(0 if success else 1)
