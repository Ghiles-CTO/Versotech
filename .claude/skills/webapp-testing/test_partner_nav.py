# -*- coding: utf-8 -*-
"""Test Partner sidebar navigation and pages"""
from playwright.sync_api import sync_playwright
import time
import sys
import io
import json

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

EXPECTED_SIDEBAR_ITEMS = [
    "Dashboard",
    "Opportunities",
    "Transactions",
    "My Commissions",  # NEW - was missing before fix
    "Shared Deals",
    "VersoSign",       # NEW - added for invoicing
    "Profile"
]

PAGES_TO_TEST = [
    {
        'name': 'Dashboard',
        'url': '/versotech_main/dashboard',
        'stories': [87],
    },
    {
        'name': 'Transactions',
        'url': '/versotech_main/partner-transactions',
        'stories': [71, 72, 73, 74, 75, 76, 77, 78, 79, 87],
    },
    {
        'name': 'My Commissions',
        'url': '/versotech_main/my-commissions',
        'stories': [88, 89, 90, 91, 92, 93, 94],
    },
    {
        'name': 'Shared Deals',
        'url': '/versotech_main/shared-transactions',
        'stories': [95, 96],
    },
    {
        'name': 'VersoSign',
        'url': '/versotech_main/versosign',
        'stories': [91],
    },
    {
        'name': 'Profile',
        'url': '/versotech_main/profile',
        'stories': [97, 98, 99, 100, 101, 102, 103, 104, 105, 106],
    },
]

def test_partner_navigation():
    results = {
        'login_success': False,
        'sidebar_items': [],
        'expected_items': EXPECTED_SIDEBAR_ITEMS,
        'missing_items': [],
        'pages_tested': [],
    }

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        print("=" * 60)
        print("PARTNER PERSONA NAVIGATION TEST")
        print("=" * 60)

        # Login
        print("\n1. Logging in as Partner...")
        page.goto('http://localhost:3000/versotech_main/login')
        page.wait_for_load_state('networkidle')

        page.fill('input[type="email"]', 'cto@verso-operation.com')
        page.fill('input[type="password"]', 'VersoPartner2024!')
        page.click('button[type="submit"]')

        try:
            page.wait_for_url('**/dashboard**', timeout=15000)
            results['login_success'] = True
            print("   Login successful!")
        except:
            print("   Login FAILED - checking for error message")
            time.sleep(2)
            print(f"   Current URL: {page.url}")
            page.screenshot(path='screenshots/partner_login_error.png', full_page=True)
            browser.close()
            return results

        # Wait for dashboard to load
        page.wait_for_load_state('networkidle')
        time.sleep(2)

        # Screenshot after login
        page.screenshot(path='screenshots/partner_01_dashboard.png', full_page=True)
        print("   Screenshot: partner_01_dashboard.png")

        # Check sidebar items
        print("\n2. Checking sidebar navigation...")
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

        results['sidebar_items'] = [item['text'] for item in nav_items]
        print(f"   Found {len(nav_items)} navigation links")

        # Check for expected items
        print("\n3. Verifying expected sidebar items:")
        for expected in EXPECTED_SIDEBAR_ITEMS:
            found = any(expected.lower() in item['text'].lower() for item in nav_items)
            status = "[OK]" if found else "[XX]"
            print(f"   {status} {expected}")
            if not found:
                results['missing_items'].append(expected)

        # Test each page
        print("\n4. Testing each page:")
        for page_info in PAGES_TO_TEST:
            print(f"\n   Testing: {page_info['name']}")
            page_result = {
                'name': page_info['name'],
                'url': page_info['url'],
                'accessible': False,
                'has_content': False,
                'screenshot': None,
            }

            try:
                page.goto(f"http://localhost:3000{page_info['url']}")
                page.wait_for_load_state('networkidle')
                time.sleep(1)

                current_url = page.url
                page_result['accessible'] = page_info['url'] in current_url

                # Check for content
                content = page.content()
                page_result['has_content'] = len(content) > 1000

                # Take screenshot
                screenshot_name = f"screenshots/partner_{page_info['name'].lower().replace(' ', '_')}.png"
                page.screenshot(path=screenshot_name, full_page=True)
                page_result['screenshot'] = screenshot_name

                status = "[OK]" if page_result['accessible'] else "[XX]"
                print(f"      {status} Accessible: {page_result['accessible']}")
                print(f"      Screenshot: {screenshot_name}")

            except Exception as e:
                print(f"      [XX] Error: {e}")
                page_result['error'] = str(e)

            results['pages_tested'].append(page_result)

        # Summary
        print("\n" + "=" * 60)
        print("SUMMARY")
        print("=" * 60)
        print(f"Login: {'SUCCESS' if results['login_success'] else 'FAILED'}")
        print(f"Sidebar items found: {len(results['sidebar_items'])}")
        print(f"Expected items: {len(EXPECTED_SIDEBAR_ITEMS)}")
        print(f"Missing items: {results['missing_items']}")

        accessible_pages = sum(1 for p in results['pages_tested'] if p['accessible'])
        print(f"Pages accessible: {accessible_pages}/{len(PAGES_TO_TEST)}")

        browser.close()

    # Save results
    with open('screenshots/partner_test_results.json', 'w') as f:
        json.dump(results, f, indent=2)
    print("\nResults saved to screenshots/partner_test_results.json")

    return results

if __name__ == "__main__":
    import os
    os.makedirs('screenshots', exist_ok=True)
    results = test_partner_navigation()
