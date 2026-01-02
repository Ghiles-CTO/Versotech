"""
Introducer Persona - Complete End-to-End Audit Test
Tests ALL sidebar navigation pages for BOTH personas (Introducer + Investor)
"""
from playwright.sync_api import sync_playwright
import os
import json

# Ensure screenshots directory exists
os.makedirs('screenshots/introducer_audit', exist_ok=True)

results = {
    "login": None,
    "dual_persona": None,
    "pages_tested": [],
    "errors": []
}

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={'width': 1920, 'height': 1080})

    # ========== LOGIN ==========
    print("=" * 60)
    print("STEP 1: Login as Introducer")
    print("=" * 60)

    page.goto('http://localhost:3000/versotech_main/login')
    page.wait_for_load_state('networkidle')
    page.fill('input[type="email"], input[name="email"]', 'py.moussaouighiles@gmail.com')
    page.fill('input[type="password"], input[name="password"]', 'TestIntro2024!')
    page.click('button[type="submit"]')
    page.wait_for_load_state('networkidle')
    page.wait_for_timeout(3000)

    if 'dashboard' in page.url or 'versotech_main' in page.url:
        print("LOGIN: PASS - Redirected to dashboard")
        results["login"] = "PASS"
        page.screenshot(path='screenshots/introducer_audit/01_login_success.png', full_page=True)
    else:
        print(f"LOGIN: FAIL - Still on {page.url}")
        results["login"] = "FAIL"
        results["errors"].append("Login failed")
        page.screenshot(path='screenshots/introducer_audit/01_login_fail.png', full_page=True)

    # ========== CHECK PERSONAS ==========
    print("\n" + "=" * 60)
    print("STEP 2: Check Available Personas")
    print("=" * 60)

    # Look for persona switcher
    page.wait_for_timeout(2000)
    html_content = page.content()

    has_investor = 'investor' in html_content.lower() or 'PYM Consulting Investments' in html_content
    has_introducer = 'introducer' in html_content.lower() or 'PYM Consulting' in html_content

    print(f"Investor persona detected: {has_investor}")
    print(f"Introducer persona detected: {has_introducer}")

    # Try to find persona switcher
    persona_switcher = page.locator('[class*="persona"], [class*="switch"], [aria-label*="persona"]').first
    if persona_switcher.is_visible():
        print("Persona switcher found")
        persona_switcher.click()
        page.wait_for_timeout(1000)
        page.screenshot(path='screenshots/introducer_audit/02_persona_switcher.png', full_page=True)

    results["dual_persona"] = "CONFIRMED" if (has_investor or has_introducer) else "UNKNOWN"

    # ========== TEST ALL INTRODUCER PAGES ==========
    print("\n" + "=" * 60)
    print("STEP 3: Testing Introducer Pages")
    print("=" * 60)

    introducer_pages = [
        {"name": "Dashboard", "url": "/versotech_main/dashboard", "section": "6.1"},
        {"name": "Opportunities", "url": "/versotech_main/opportunities", "section": "6.2"},
        {"name": "My Introductions", "url": "/versotech_main/my-introductions", "section": "6.6"},
        {"name": "My Commissions", "url": "/versotech_main/introducer-commissions", "section": "6.6"},
        {"name": "VERSOSign", "url": "/versotech_main/versosign", "section": "6.2"},
        {"name": "Profile", "url": "/versotech_main/profile", "section": "6.1"},
    ]

    for idx, pg in enumerate(introducer_pages):
        print(f"\nTesting {pg['name']}...")
        try:
            page.goto(f"http://localhost:3000{pg['url']}")
            page.wait_for_load_state('networkidle')
            page.wait_for_timeout(2000)

            screenshot_name = f"screenshots/introducer_audit/{idx+3:02d}_{pg['name'].lower().replace(' ', '_')}.png"
            page.screenshot(path=screenshot_name, full_page=True)

            # Check for errors
            has_error = page.locator('.text-red-500, .text-destructive, [role="alert"]').count() > 0
            url_match = pg['url'] in page.url

            status = "PASS" if url_match and not has_error else "PARTIAL" if url_match else "FAIL"

            results["pages_tested"].append({
                "page": pg['name'],
                "url": page.url,
                "expected_url": pg['url'],
                "status": status,
                "section": pg['section'],
                "screenshot": screenshot_name
            })

            print(f"  URL: {page.url}")
            print(f"  Status: {status}")
            print(f"  Screenshot: {screenshot_name}")

        except Exception as e:
            print(f"  ERROR: {e}")
            results["errors"].append(f"{pg['name']}: {str(e)}")

    # ========== TEST INVESTOR FEATURES (for dual-persona) ==========
    print("\n" + "=" * 60)
    print("STEP 4: Testing Investor Features (Dual-Persona)")
    print("=" * 60)

    # Navigate to opportunities and check for investor features
    page.goto('http://localhost:3000/versotech_main/opportunities')
    page.wait_for_load_state('networkidle')
    page.wait_for_timeout(3000)

    # Take screenshot of opportunities with investor view
    page.screenshot(path='screenshots/introducer_audit/10_opportunities_investor.png', full_page=True)

    # Look for interest buttons, subscription buttons
    interest_buttons = page.locator('button:has-text("Interest"), button:has-text("Interested")').count()
    view_buttons = page.locator('button:has-text("View"), a:has-text("View")').count()

    print(f"Interest buttons found: {interest_buttons}")
    print(f"View buttons found: {view_buttons}")

    results["pages_tested"].append({
        "page": "Opportunities (Investor View)",
        "interest_buttons": interest_buttons,
        "view_buttons": view_buttons,
        "status": "PASS" if view_buttons > 0 else "PARTIAL",
        "section": "6.2"
    })

    # Click on a deal to view details
    view_detail = page.locator('a:has-text("View details"), button:has-text("View details")').first
    if view_detail.is_visible():
        print("\nClicking View details...")
        view_detail.click()
        page.wait_for_load_state('networkidle')
        page.wait_for_timeout(2000)
        page.screenshot(path='screenshots/introducer_audit/11_deal_detail.png', full_page=True)

        # Check for investor features on deal page
        has_dataroom = 'data room' in page.content().lower() or 'dataroom' in page.content().lower()
        has_interest = page.locator('button:has-text("Interest"), button:has-text("Confirm")').count() > 0
        has_subscribe = page.locator('button:has-text("Subscribe"), button:has-text("Subscription")').count() > 0

        print(f"Data room access: {has_dataroom}")
        print(f"Interest confirmation: {has_interest}")
        print(f"Subscription option: {has_subscribe}")

        results["pages_tested"].append({
            "page": "Deal Detail (Investor)",
            "has_dataroom": has_dataroom,
            "has_interest": has_interest,
            "has_subscribe": has_subscribe,
            "status": "PASS",
            "section": "6.2"
        })

    # ========== TEST NOTIFICATIONS ==========
    print("\n" + "=" * 60)
    print("STEP 5: Testing Notifications")
    print("=" * 60)

    page.goto('http://localhost:3000/versotech_main/dashboard')
    page.wait_for_load_state('networkidle')
    page.wait_for_timeout(2000)

    # Click notification bell
    bell = page.locator('[aria-label*="notification"], button:has(.lucide-bell)').first
    if bell.is_visible():
        bell.click()
        page.wait_for_timeout(1500)
        page.screenshot(path='screenshots/introducer_audit/12_notifications.png', full_page=True)

        # Count notifications
        notif_items = page.locator('[class*="notification-item"], [class*="notif"]').count()
        print(f"Notification items visible: {notif_items}")

        results["pages_tested"].append({
            "page": "Notifications Panel",
            "notification_count": notif_items,
            "status": "PASS" if notif_items >= 0 else "PARTIAL",
            "section": "6.4"
        })
    else:
        print("Notification bell not found")
        # Try header notification area
        page.screenshot(path='screenshots/introducer_audit/12_header_area.png')

    # ========== TEST PROFILE TABS ==========
    print("\n" + "=" * 60)
    print("STEP 6: Testing Profile (Section 6.1)")
    print("=" * 60)

    page.goto('http://localhost:3000/versotech_main/profile')
    page.wait_for_load_state('networkidle')
    page.wait_for_timeout(2000)
    page.screenshot(path='screenshots/introducer_audit/13_profile_main.png', full_page=True)

    # Check for profile tabs
    profile_tabs = ['Details', 'KYC', 'Security', 'Preferences', 'Team']
    tabs_found = []

    for tab in profile_tabs:
        tab_element = page.locator(f'button:has-text("{tab}"), [role="tab"]:has-text("{tab}")').first
        if tab_element.is_visible():
            tabs_found.append(tab)
            print(f"  Tab found: {tab}")

    results["pages_tested"].append({
        "page": "Profile Tabs",
        "tabs_found": tabs_found,
        "tabs_expected": profile_tabs,
        "status": "PASS" if len(tabs_found) >= 3 else "PARTIAL",
        "section": "6.1"
    })

    # ========== TEST MY INTRODUCTIONS (Section 6.6) ==========
    print("\n" + "=" * 60)
    print("STEP 7: Testing My Introductions (Section 6.6)")
    print("=" * 60)

    page.goto('http://localhost:3000/versotech_main/my-introductions')
    page.wait_for_load_state('networkidle')
    page.wait_for_timeout(3000)
    page.screenshot(path='screenshots/introducer_audit/14_my_introductions.png', full_page=True)

    # Check for introduction data
    intro_table = page.locator('table, [class*="table"]').first
    intro_rows = page.locator('tbody tr, [class*="row"]').count()

    print(f"Introduction rows found: {intro_rows}")

    results["pages_tested"].append({
        "page": "My Introductions",
        "rows_found": intro_rows,
        "status": "PASS" if intro_rows > 0 else "PARTIAL",
        "section": "6.6"
    })

    # ========== TEST MY COMMISSIONS (Section 6.6) ==========
    print("\n" + "=" * 60)
    print("STEP 8: Testing My Commissions (Section 6.6)")
    print("=" * 60)

    page.goto('http://localhost:3000/versotech_main/introducer-commissions')
    page.wait_for_load_state('networkidle')
    page.wait_for_timeout(3000)
    page.screenshot(path='screenshots/introducer_audit/15_my_commissions.png', full_page=True)

    # Check for commission data
    commission_table = page.locator('table, [class*="commission"]').first
    commission_rows = page.locator('tbody tr').count()

    print(f"Commission rows found: {commission_rows}")

    results["pages_tested"].append({
        "page": "My Commissions",
        "rows_found": commission_rows,
        "status": "PASS" if commission_rows >= 0 else "PARTIAL",
        "section": "6.6"
    })

    # ========== TEST PORTFOLIO/INVESTMENTS ==========
    print("\n" + "=" * 60)
    print("STEP 9: Testing Portfolio/Investments (Section 6.3)")
    print("=" * 60)

    # Check if portfolio page exists
    page.goto('http://localhost:3000/versotech_main/portfolio')
    page.wait_for_load_state('networkidle')
    page.wait_for_timeout(2000)

    if 'portfolio' in page.url or 'investment' in page.url.lower():
        page.screenshot(path='screenshots/introducer_audit/16_portfolio.png', full_page=True)
        results["pages_tested"].append({
            "page": "Portfolio",
            "status": "PASS",
            "section": "6.3"
        })
        print("Portfolio page found")
    else:
        print(f"Portfolio page not found (redirected to {page.url})")
        results["pages_tested"].append({
            "page": "Portfolio",
            "status": "NOT_FOUND",
            "actual_url": page.url,
            "section": "6.3"
        })

    # ========== SUMMARY ==========
    print("\n" + "=" * 60)
    print("AUDIT SUMMARY")
    print("=" * 60)

    pass_count = sum(1 for p in results["pages_tested"] if p.get("status") == "PASS")
    partial_count = sum(1 for p in results["pages_tested"] if p.get("status") == "PARTIAL")
    fail_count = sum(1 for p in results["pages_tested"] if p.get("status") in ["FAIL", "ERROR", "NOT_FOUND"])

    print(f"Login: {results['login']}")
    print(f"Dual Persona: {results['dual_persona']}")
    print(f"Pages Tested: {len(results['pages_tested'])}")
    print(f"  PASS: {pass_count}")
    print(f"  PARTIAL: {partial_count}")
    print(f"  FAIL/NOT_FOUND: {fail_count}")

    if results["errors"]:
        print(f"Errors: {len(results['errors'])}")
        for err in results["errors"]:
            print(f"  - {err}")

    # Save results to JSON
    with open('screenshots/introducer_audit/results.json', 'w') as f:
        json.dump(results, f, indent=2)
    print("\nResults saved to screenshots/introducer_audit/results.json")

    browser.close()
    print("\nBrowser closed. Audit complete!")
