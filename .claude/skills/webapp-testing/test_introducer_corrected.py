"""
Introducer Persona - Corrected Audit Test
Uses ACTUAL sidebar routes from persona-sidebar.tsx
"""
from playwright.sync_api import sync_playwright
import os
import json

os.makedirs('screenshots/introducer_audit', exist_ok=True)

results = {
    "login": None,
    "personas_available": [],
    "pages_tested": [],
    "investor_features": {},
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
    page.fill('input[type="email"]', 'py.moussaouighiles@gmail.com')
    page.fill('input[type="password"]', 'TestIntro2024!')
    page.click('button[type="submit"]')
    page.wait_for_load_state('networkidle')
    page.wait_for_timeout(3000)

    if 'dashboard' in page.url or 'versotech_main' in page.url:
        print("LOGIN: PASS")
        results["login"] = "PASS"
        page.screenshot(path='screenshots/introducer_audit/01_login_success.png', full_page=True)
    else:
        print(f"LOGIN: FAIL - {page.url}")
        results["login"] = "FAIL"

    # ========== CHECK SIDEBAR NAVIGATION ==========
    print("\n" + "=" * 60)
    print("STEP 2: Check Sidebar Navigation")
    print("=" * 60)

    page.wait_for_timeout(2000)
    sidebar_html = page.content()

    # Check which links are in sidebar
    expected_introducer_links = [
        '/versotech_main/dashboard',
        '/versotech_main/introductions',
        '/versotech_main/introducer-agreements',
        '/versotech_main/my-commissions',
        '/versotech_main/versosign',
        '/versotech_main/introducer-profile'
    ]

    expected_investor_links = [
        '/versotech_main/opportunities',
        '/versotech_main/portfolio',
        '/versotech_main/documents',
        '/versotech_main/inbox'
    ]

    for link in expected_introducer_links:
        if link in sidebar_html:
            print(f"  INTRODUCER NAV: {link} - FOUND")
        else:
            print(f"  INTRODUCER NAV: {link} - NOT FOUND")

    for link in expected_investor_links:
        if link in sidebar_html:
            print(f"  INVESTOR NAV: {link} - FOUND (dual-persona)")
            results["personas_available"].append("investor")
        else:
            print(f"  INVESTOR NAV: {link} - NOT FOUND")

    # ========== TEST INTRODUCER PAGES (Correct URLs) ==========
    print("\n" + "=" * 60)
    print("STEP 3: Testing Introducer Pages (Correct URLs)")
    print("=" * 60)

    introducer_pages = [
        {"name": "Dashboard", "url": "/versotech_main/dashboard", "section": "6.1"},
        {"name": "Introductions", "url": "/versotech_main/introductions", "section": "6.6"},
        {"name": "Agreements", "url": "/versotech_main/introducer-agreements", "section": "6.6"},
        {"name": "My Commissions", "url": "/versotech_main/my-commissions", "section": "6.6"},
        {"name": "VERSOSign", "url": "/versotech_main/versosign", "section": "6.2"},
        {"name": "Profile", "url": "/versotech_main/introducer-profile", "section": "6.1"},
    ]

    for idx, pg in enumerate(introducer_pages):
        print(f"\nTesting {pg['name']}...")
        try:
            page.goto(f"http://localhost:3000{pg['url']}")
            page.wait_for_load_state('networkidle')
            page.wait_for_timeout(2500)

            screenshot_name = f"screenshots/introducer_audit/{idx+10:02d}_{pg['name'].lower().replace(' ', '_')}.png"
            page.screenshot(path=screenshot_name, full_page=True)

            # Check URL and content
            url_match = pg['url'] in page.url

            # Count data rows if table exists
            table_rows = page.locator('tbody tr').count()

            status = "PASS" if url_match else "FAIL"

            results["pages_tested"].append({
                "page": pg['name'],
                "url": page.url,
                "expected_url": pg['url'],
                "status": status,
                "section": pg['section'],
                "data_rows": table_rows,
                "screenshot": screenshot_name
            })

            print(f"  URL: {page.url}")
            print(f"  Status: {status}")
            print(f"  Data rows: {table_rows}")

        except Exception as e:
            print(f"  ERROR: {e}")
            results["errors"].append(f"{pg['name']}: {str(e)}")

    # ========== TEST INVESTOR FEATURES (Dual-Persona) ==========
    print("\n" + "=" * 60)
    print("STEP 4: Testing Investor Features (if accessible)")
    print("=" * 60)

    investor_pages = [
        {"name": "Opportunities", "url": "/versotech_main/opportunities", "section": "6.2"},
        {"name": "Portfolio", "url": "/versotech_main/portfolio", "section": "6.3"},
    ]

    for pg in investor_pages:
        print(f"\nTesting {pg['name']}...")
        try:
            page.goto(f"http://localhost:3000{pg['url']}")
            page.wait_for_load_state('networkidle')
            page.wait_for_timeout(2500)

            screenshot_name = f"screenshots/introducer_audit/20_{pg['name'].lower()}.png"
            page.screenshot(path=screenshot_name, full_page=True)

            # Check for access
            is_accessible = pg['url'] in page.url

            # Count deals/investments
            deal_cards = page.locator('[class*="card"]').count()

            results["investor_features"][pg['name']] = {
                "accessible": is_accessible,
                "cards_found": deal_cards,
                "url": page.url
            }

            print(f"  Accessible: {is_accessible}")
            print(f"  Cards/Items: {deal_cards}")

        except Exception as e:
            print(f"  ERROR: {e}")

    # ========== TEST NOTIFICATIONS ==========
    print("\n" + "=" * 60)
    print("STEP 5: Testing Notifications (Section 6.4)")
    print("=" * 60)

    page.goto('http://localhost:3000/versotech_main/dashboard')
    page.wait_for_load_state('networkidle')
    page.wait_for_timeout(2000)

    # Find and click notification bell
    bell_selectors = [
        'button:has(.lucide-bell)',
        '[aria-label*="notification"]',
        'button:has-text("Bell")',
        '.notification-bell'
    ]

    bell_clicked = False
    for selector in bell_selectors:
        try:
            bell = page.locator(selector).first
            if bell.is_visible():
                bell.click()
                page.wait_for_timeout(1500)
                page.screenshot(path='screenshots/introducer_audit/25_notifications.png', full_page=True)
                bell_clicked = True
                print("Notification bell clicked")
                break
        except:
            continue

    if not bell_clicked:
        print("Notification bell not found")
        page.screenshot(path='screenshots/introducer_audit/25_header.png')

    # ========== TEST PROFILE TABS (Section 6.1) ==========
    print("\n" + "=" * 60)
    print("STEP 6: Testing Profile Tabs (Section 6.1)")
    print("=" * 60)

    page.goto('http://localhost:3000/versotech_main/introducer-profile')
    page.wait_for_load_state('networkidle')
    page.wait_for_timeout(2000)
    page.screenshot(path='screenshots/introducer_audit/26_profile.png', full_page=True)

    # Check for profile elements
    profile_elements = {
        "edit_button": page.locator('button:has-text("Edit"), button:has-text("Save")').count(),
        "kyc_section": 'kyc' in page.content().lower(),
        "form_fields": page.locator('input, select, textarea').count()
    }

    print(f"  Edit buttons: {profile_elements['edit_button']}")
    print(f"  KYC section: {profile_elements['kyc_section']}")
    print(f"  Form fields: {profile_elements['form_fields']}")

    results["pages_tested"].append({
        "page": "Profile Elements",
        "elements": profile_elements,
        "status": "PASS" if profile_elements['form_fields'] > 0 else "PARTIAL",
        "section": "6.1"
    })

    # ========== SUMMARY ==========
    print("\n" + "=" * 60)
    print("AUDIT SUMMARY")
    print("=" * 60)

    pass_count = sum(1 for p in results["pages_tested"] if p.get("status") == "PASS")
    partial_count = sum(1 for p in results["pages_tested"] if p.get("status") == "PARTIAL")
    fail_count = sum(1 for p in results["pages_tested"] if p.get("status") in ["FAIL", "ERROR"])

    print(f"Login: {results['login']}")
    print(f"Personas: {results.get('personas_available', ['introducer'])}")
    print(f"Pages Tested: {len(results['pages_tested'])}")
    print(f"  PASS: {pass_count}")
    print(f"  PARTIAL: {partial_count}")
    print(f"  FAIL: {fail_count}")
    print(f"Investor Features: {results['investor_features']}")

    # Save results
    with open('screenshots/introducer_audit/results.json', 'w') as f:
        json.dump(results, f, indent=2)
    print("\nResults saved to screenshots/introducer_audit/results.json")

    browser.close()
    print("\nAudit complete!")
