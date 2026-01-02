# -*- coding: utf-8 -*-
"""Comprehensive test of all Introducer pages and user stories"""
from playwright.sync_api import sync_playwright
import time
import sys
import io
import json

# Fix encoding for Windows
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

PAGES_TO_TEST = [
    {
        'name': 'Dashboard',
        'url': '/versotech_main/dashboard',
        'stories': [97, 100, 101],
        'checks': [
            ('Date range filter', 'text=Date Range'),
            ('Total Introductions', 'text=Total Introductions'),
            ('Commission Earned', 'text=Commission Earned'),
            ('Pending Commission', 'text=Pending Commission'),
        ]
    },
    {
        'name': 'Introductions',
        'url': '/versotech_main/introductions',
        'stories': [71, 72, 73, 74, 75, 76, 77, 78, 79, 101],
        'checks': [
            ('Introductions list', 'table, [role="table"]'),
            ('Status filter', 'text=Status'),
            ('Export button', 'text=Export'),
        ]
    },
    {
        'name': 'Agreements',
        'url': '/versotech_main/introducer-agreements',
        'stories': [79, 81, 82, 83, 84, 85, 87, 89, 90],
        'checks': [
            ('Agreement list', 'text=Agreement'),
            ('Commission rate', 'text=commission, text=bps, text=%'),
        ]
    },
    {
        'name': 'My Commissions',
        'url': '/versotech_main/my-commissions',
        'stories': [97, 100, 101, 102, 104, 105],
        'checks': [
            ('Total Owed card', 'text=Total Owed'),
            ('Total Paid card', 'text=Total Paid'),
            ('Invoice Requested card', 'text=Invoice Requested'),
            ('Status filter', 'select, [role="combobox"]'),
            ('Commission table', 'table, [role="table"]'),
        ]
    },
    {
        'name': 'VersoSign',
        'url': '/versotech_main/versosign',
        'stories': [85, 102],
        'checks': [
            ('Document list', 'text=document, text=signature, text=sign'),
        ]
    },
    {
        'name': 'Profile',
        'url': '/versotech_main/introducer-profile',
        'stories': [106, 107, 108, 109, 110, 111, 112, 113, 114, 115],
        'checks': [
            ('Profile info', 'text=Profile, text=Entity'),
            ('GDPR controls', 'text=Privacy, text=Data'),
        ]
    },
]

def test_all_pages():
    results = []

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Login first
        print("=" * 60)
        print("INTRODUCER PAGE-BY-PAGE TEST")
        print("=" * 60)
        print("\n1. Logging in...")

        page.goto('http://localhost:3000/versotech_main/login')
        page.wait_for_load_state('networkidle')

        page.fill('input[type="email"]', 'py.moussaouighiles@gmail.com')
        page.fill('input[type="password"]', 'TestIntro2024!')
        page.click('button[type="submit"]')

        try:
            page.wait_for_url('**/dashboard**', timeout=15000)
            print("   Login successful!")
        except:
            print("   Login FAILED")
            browser.close()
            return []

        # Test each page
        for page_info in PAGES_TO_TEST:
            print(f"\n{'='*60}")
            print(f"Testing: {page_info['name']}")
            print(f"URL: {page_info['url']}")
            print(f"User Stories: {page_info['stories']}")
            print(f"{'='*60}")

            result = {
                'page': page_info['name'],
                'url': page_info['url'],
                'stories': page_info['stories'],
                'accessible': False,
                'checks': {},
                'screenshot': None,
            }

            # Navigate to page
            try:
                page.goto(f"http://localhost:3000{page_info['url']}")
                page.wait_for_load_state('networkidle')
                time.sleep(1)

                current_url = page.url
                result['accessible'] = page_info['url'] in current_url
                print(f"\n   Accessible: {'YES' if result['accessible'] else 'NO'}")
                print(f"   Final URL: {current_url}")

                # Run checks
                print(f"\n   Checks:")
                for check_name, selector in page_info['checks']:
                    try:
                        # Try multiple selectors (comma-separated)
                        found = False
                        for sel in selector.split(', '):
                            sel = sel.strip()
                            locator = page.locator(sel)
                            if locator.count() > 0:
                                found = True
                                break

                        result['checks'][check_name] = found
                        status = "[OK]" if found else "[XX]"
                        print(f"      {status} {check_name}")
                    except Exception as e:
                        result['checks'][check_name] = False
                        print(f"      [XX] {check_name} (error: {str(e)[:50]})")

                # Take screenshot
                screenshot_name = f"screenshots/page_{page_info['name'].lower().replace(' ', '_')}.png"
                page.screenshot(path=screenshot_name, full_page=True)
                result['screenshot'] = screenshot_name
                print(f"\n   Screenshot: {screenshot_name}")

            except Exception as e:
                print(f"   ERROR: {e}")
                result['error'] = str(e)

            results.append(result)

        browser.close()

    # Summary
    print("\n" + "=" * 60)
    print("SUMMARY")
    print("=" * 60)

    total_checks = 0
    passed_checks = 0

    for r in results:
        page_passed = sum(1 for v in r['checks'].values() if v)
        page_total = len(r['checks'])
        total_checks += page_total
        passed_checks += page_passed

        status = "[OK]" if r['accessible'] and page_passed == page_total else "[!!]"
        print(f"{status} {r['page']}: {page_passed}/{page_total} checks passed, accessible={r['accessible']}")

    print(f"\nTotal: {passed_checks}/{total_checks} checks passed")

    return results

if __name__ == "__main__":
    import os
    os.makedirs('screenshots', exist_ok=True)
    results = test_all_pages()

    # Save results to JSON
    with open('screenshots/test_results.json', 'w') as f:
        json.dump(results, f, indent=2)
    print("\nResults saved to screenshots/test_results.json")
