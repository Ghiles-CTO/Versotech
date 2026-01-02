"""
Partner Profile Page - Verify Fix for 404 Errors
Tests that Partner users can access profile without investor API errors
"""
from playwright.sync_api import sync_playwright
import os
import json

os.makedirs('screenshots/partner_profile_test', exist_ok=True)

results = {
    "login": None,
    "profile_access": None,
    "api_errors": [],
    "tabs_visible": [],
    "console_errors": []
}

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={'width': 1920, 'height': 1080})

    # Capture console errors
    page.on("console", lambda msg: results["console_errors"].append(msg.text) if msg.type == "error" else None)

    # Capture network errors (404s)
    def handle_response(response):
        if response.status == 404 and '/api/' in response.url:
            results["api_errors"].append({
                "url": response.url,
                "status": response.status
            })

    page.on("response", handle_response)

    # ========== LOGIN AS PARTNER ==========
    print("=" * 60)
    print("STEP 1: Login as Partner")
    print("=" * 60)

    page.goto('http://localhost:3000/versotech_main/login')
    page.wait_for_load_state('networkidle')
    page.fill('input[type="email"]', 'cto@verso-operation.com')
    page.fill('input[type="password"]', 'VersoPartner2024!')
    page.click('button[type="submit"]')
    page.wait_for_load_state('networkidle')
    page.wait_for_timeout(3000)

    if 'dashboard' in page.url or 'versotech_main' in page.url:
        print("LOGIN: PASS")
        results["login"] = "PASS"
        page.screenshot(path='screenshots/partner_profile_test/01_login_success.png', full_page=True)
    else:
        print(f"LOGIN: FAIL - {page.url}")
        results["login"] = "FAIL"
        page.screenshot(path='screenshots/partner_profile_test/01_login_fail.png', full_page=True)

    # ========== ACCESS PROFILE PAGE ==========
    print("\n" + "=" * 60)
    print("STEP 2: Access Profile Page")
    print("=" * 60)

    # Clear previous errors before profile test
    results["api_errors"] = []
    results["console_errors"] = []

    page.goto('http://localhost:3000/versotech_main/profile')
    page.wait_for_load_state('networkidle')
    page.wait_for_timeout(3000)

    page.screenshot(path='screenshots/partner_profile_test/02_profile_page.png', full_page=True)

    if 'profile' in page.url:
        print("PROFILE ACCESS: PASS")
        results["profile_access"] = "PASS"
    else:
        print(f"PROFILE ACCESS: FAIL - Redirected to {page.url}")
        results["profile_access"] = "FAIL"

    # ========== CHECK FOR 404 ERRORS ==========
    print("\n" + "=" * 60)
    print("STEP 3: Check for API 404 Errors")
    print("=" * 60)

    # Wait a bit more and reload to capture any delayed API calls
    page.wait_for_timeout(2000)

    if results["api_errors"]:
        print(f"API 404 ERRORS FOUND: {len(results['api_errors'])}")
        for err in results["api_errors"]:
            print(f"  - {err['url']}")
    else:
        print("NO API 404 ERRORS - FIX WORKING!")

    # ========== CHECK VISIBLE TABS ==========
    print("\n" + "=" * 60)
    print("STEP 4: Check Profile Tabs")
    print("=" * 60)

    # Check which tabs are visible
    tab_names = ['Profile', 'Security', 'Preferences', 'KYC', 'Compliance', 'Members', 'Entities']

    for tab_name in tab_names:
        tab = page.locator(f'button[role="tab"]:has-text("{tab_name}"), [data-state][role="tab"]:has-text("{tab_name}")')
        if tab.count() > 0 and tab.first.is_visible():
            results["tabs_visible"].append(tab_name)
            print(f"  Tab visible: {tab_name}")

    # Partner should only see: Profile, Security, Preferences (no investor tabs)
    expected_tabs = ['Profile', 'Security', 'Preferences']
    investor_tabs = ['KYC', 'Compliance', 'Members', 'Entities']

    has_investor_tabs = any(tab in results["tabs_visible"] for tab in investor_tabs)

    if has_investor_tabs:
        print("\nWARNING: Investor tabs visible for Partner user!")
    else:
        print("\nCORRECT: Only basic profile tabs visible for Partner")

    # ========== TEST TAB NAVIGATION ==========
    print("\n" + "=" * 60)
    print("STEP 5: Test Tab Navigation")
    print("=" * 60)

    for tab_name in results["tabs_visible"]:
        try:
            tab = page.locator(f'button[role="tab"]:has-text("{tab_name}")').first
            if tab.is_visible():
                tab.click()
                page.wait_for_timeout(1000)
                screenshot_name = f'screenshots/partner_profile_test/03_tab_{tab_name.lower()}.png'
                page.screenshot(path=screenshot_name, full_page=True)
                print(f"  Tab '{tab_name}' clicked - screenshot saved")
        except Exception as e:
            print(f"  Tab '{tab_name}' error: {e}")

    # ========== SUMMARY ==========
    print("\n" + "=" * 60)
    print("TEST SUMMARY")
    print("=" * 60)

    print(f"Login: {results['login']}")
    print(f"Profile Access: {results['profile_access']}")
    print(f"API 404 Errors: {len(results['api_errors'])}")
    print(f"Tabs Visible: {results['tabs_visible']}")
    print(f"Console Errors: {len(results['console_errors'])}")

    fix_status = "PASS" if len(results['api_errors']) == 0 and not has_investor_tabs else "FAIL"
    print(f"\nFIX STATUS: {fix_status}")

    results["fix_status"] = fix_status
    results["has_investor_tabs"] = has_investor_tabs

    # Save results
    with open('screenshots/partner_profile_test/results.json', 'w') as f:
        json.dump(results, f, indent=2)
    print("\nResults saved to screenshots/partner_profile_test/results.json")

    browser.close()
    print("\nTest complete!")
