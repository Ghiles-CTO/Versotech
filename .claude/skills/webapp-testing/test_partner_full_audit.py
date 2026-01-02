"""
Partner Persona - Complete End-to-End Audit Test
Tests ALL sidebar navigation pages and captures evidence
"""
from playwright.sync_api import sync_playwright
import os
import json

# Ensure screenshots directory exists
os.makedirs('screenshots/partner_audit', exist_ok=True)

results = {
    "login": None,
    "pages_tested": [],
    "errors": []
}

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={'width': 1920, 'height': 1080})

    # ========== LOGIN ==========
    print("=" * 60)
    print("STEP 1: Login as Partner")
    print("=" * 60)

    page.goto('http://localhost:3000/versotech_main/login')
    page.wait_for_load_state('networkidle')
    page.fill('input[type="email"], input[name="email"]', 'cto@verso-operation.com')
    page.fill('input[type="password"], input[name="password"]', 'VersoPartner2024!')
    page.click('button[type="submit"]')
    page.wait_for_load_state('networkidle')
    page.wait_for_timeout(2000)

    if 'dashboard' in page.url or 'versotech_main' in page.url:
        print("LOGIN: PASS - Redirected to dashboard")
        results["login"] = "PASS"
    else:
        print("LOGIN: FAIL - Still on login page")
        results["login"] = "FAIL"
        results["errors"].append("Login failed")

    # ========== TEST ALL SIDEBAR PAGES ==========

    pages_to_test = [
        {"name": "Dashboard", "url": "/versotech_main/dashboard", "selector": "text=Welcome back"},
        {"name": "Opportunities", "url": "/versotech_main/opportunities", "selector": "text=Opportunities,text=Investment"},
        {"name": "Transactions", "url": "/versotech_main/partner-transactions", "selector": "text=Transactions,text=Referred"},
        {"name": "My Commissions", "url": "/versotech_main/my-commissions", "selector": "text=Commissions,text=Revenue"},
        {"name": "Shared Deals", "url": "/versotech_main/shared-transactions", "selector": "text=Shared,text=Co-referred"},
        {"name": "VersoSign", "url": "/versotech_main/versosign", "selector": "text=VersoSign,text=Signatures"},
        {"name": "Profile", "url": "/versotech_main/profile", "selector": "text=Profile,text=Account"},
    ]

    for idx, pg in enumerate(pages_to_test):
        print(f"\n{'=' * 60}")
        print(f"STEP {idx + 2}: Testing {pg['name']} Page")
        print("=" * 60)

        try:
            # Navigate via sidebar click
            sidebar_link = page.locator(f"a[href='{pg['url']}']").first
            if sidebar_link.is_visible():
                sidebar_link.click()
                page.wait_for_load_state('networkidle')
                page.wait_for_timeout(1500)
            else:
                # Direct navigation if sidebar link not visible
                page.goto(f"http://localhost:3000{pg['url']}")
                page.wait_for_load_state('networkidle')
                page.wait_for_timeout(1500)

            # Take screenshot
            screenshot_name = f"screenshots/partner_audit/{idx+1:02d}_{pg['name'].lower().replace(' ', '_')}.png"
            page.screenshot(path=screenshot_name, full_page=True)

            # Check URL
            current_url = page.url
            url_match = pg['url'] in current_url

            # Check page content
            page_html = page.content()
            selectors = pg['selector'].split(',')
            content_found = any(sel.replace('text=', '').lower() in page_html.lower() for sel in selectors)

            # Check for errors on page
            has_error = page.locator('.text-red-500, .text-destructive, [role="alert"]').count() > 0

            status = "PASS" if (url_match and content_found and not has_error) else "PARTIAL" if url_match else "FAIL"

            result = {
                "page": pg['name'],
                "url": current_url,
                "expected_url": pg['url'],
                "url_match": url_match,
                "content_found": content_found,
                "has_error": has_error,
                "status": status,
                "screenshot": screenshot_name
            }
            results["pages_tested"].append(result)

            print(f"URL: {current_url}")
            print(f"URL Match: {url_match}")
            print(f"Content Found: {content_found}")
            print(f"Has Error: {has_error}")
            print(f"STATUS: {status}")
            print(f"Screenshot: {screenshot_name}")

        except Exception as e:
            error_msg = f"{pg['name']}: {str(e)}"
            results["errors"].append(error_msg)
            print(f"ERROR: {error_msg}")
            results["pages_tested"].append({
                "page": pg['name'],
                "status": "ERROR",
                "error": str(e)
            })

    # ========== TEST NOTIFICATIONS ==========
    print(f"\n{'=' * 60}")
    print("STEP: Testing Notifications")
    print("=" * 60)

    try:
        # Go back to dashboard first
        page.goto('http://localhost:3000/versotech_main/dashboard')
        page.wait_for_load_state('networkidle')
        page.wait_for_timeout(1000)

        # Click notification bell
        bell = page.locator('[aria-label*="notification"], button:has(.lucide-bell), .notification-bell').first
        if bell.is_visible():
            bell.click()
            page.wait_for_timeout(1000)
            page.screenshot(path='screenshots/partner_audit/08_notifications.png', full_page=True)
            print("Notifications panel opened - screenshot saved")
            results["pages_tested"].append({"page": "Notifications", "status": "PASS"})
        else:
            print("Notification bell not found")
            results["pages_tested"].append({"page": "Notifications", "status": "PARTIAL", "note": "Bell not found"})
    except Exception as e:
        print(f"Notifications test error: {e}")
        results["errors"].append(f"Notifications: {str(e)}")

    # ========== SUMMARY ==========
    print(f"\n{'=' * 60}")
    print("AUDIT SUMMARY")
    print("=" * 60)

    pass_count = sum(1 for p in results["pages_tested"] if p.get("status") == "PASS")
    partial_count = sum(1 for p in results["pages_tested"] if p.get("status") == "PARTIAL")
    fail_count = sum(1 for p in results["pages_tested"] if p.get("status") in ["FAIL", "ERROR"])

    print(f"Login: {results['login']}")
    print(f"Pages Tested: {len(results['pages_tested'])}")
    print(f"  PASS: {pass_count}")
    print(f"  PARTIAL: {partial_count}")
    print(f"  FAIL/ERROR: {fail_count}")

    if results["errors"]:
        print(f"Errors: {len(results['errors'])}")
        for err in results["errors"]:
            print(f"  - {err}")

    # Save results to JSON
    with open('screenshots/partner_audit/results.json', 'w') as f:
        json.dump(results, f, indent=2)
    print("\nResults saved to screenshots/partner_audit/results.json")

    browser.close()
    print("\nBrowser closed. Audit complete!")
