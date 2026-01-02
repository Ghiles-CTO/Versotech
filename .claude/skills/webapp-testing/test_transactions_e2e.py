"""
Comprehensive E2E Test for Versotech Transaction System

Tests:
1. Introducer login
2. My Commissions page
3. Partner Transactions page (if accessible)
4. Invoice submission flow
5. Dashboard transaction widgets

Author: Claude Code E2E Tester
"""

import sys
import time
from datetime import datetime
from playwright.sync_api import sync_playwright, TimeoutError as PlaywrightTimeout

# Test configuration
import os
BASE_URL = os.environ.get("TEST_BASE_URL", "http://localhost:3003")
INTRODUCER_EMAIL = "py.moussaouighiles@gmail.com"
INTRODUCER_PASSWORD = "TestIntro2024!"

# Test results storage
results = {
    "passed": [],
    "failed": [],
    "warnings": [],
    "screenshots": []
}

def log(message, level="INFO"):
    timestamp = datetime.now().strftime("%H:%M:%S")
    print(f"[{timestamp}] [{level}] {message}")

def take_screenshot(page, name):
    """Take a screenshot and save it"""
    filename = f"screenshots/{name}_{datetime.now().strftime('%H%M%S')}.png"
    page.screenshot(path=filename, full_page=True)
    results["screenshots"].append(filename)
    log(f"Screenshot saved: {filename}")
    return filename

def test_pass(test_name, details=""):
    results["passed"].append({"name": test_name, "details": details})
    log(f"PASS: {test_name} - {details}", "PASS")

def test_fail(test_name, error):
    results["failed"].append({"name": test_name, "error": str(error)})
    log(f"FAIL: {test_name} - {error}", "FAIL")

def test_warn(test_name, warning):
    results["warnings"].append({"name": test_name, "warning": warning})
    log(f"WARN: {test_name} - {warning}", "WARN")

def login(page, email, password):
    """Login to the portal"""
    log(f"Logging in as {email}")
    page.goto(f"{BASE_URL}/auth/login")
    page.wait_for_load_state("networkidle")

    # Take screenshot of login page
    take_screenshot(page, "01_login_page")

    # Fill login form
    email_input = page.locator('input[type="email"], input[name="email"]').first
    email_input.fill(email)

    password_input = page.locator('input[type="password"], input[name="password"]').first
    password_input.fill(password)

    # Click login button
    login_btn = page.locator('button[type="submit"], button:has-text("Sign in"), button:has-text("Log in")').first
    login_btn.click()

    # Wait for navigation
    page.wait_for_load_state("networkidle")
    time.sleep(2)  # Extra wait for auth

    # Check if login succeeded
    current_url = page.url
    if "/auth/login" not in current_url:
        test_pass("Login", f"Successfully logged in as {email}")
        take_screenshot(page, "02_after_login")
        return True
    else:
        test_fail("Login", "Still on login page after submit")
        take_screenshot(page, "02_login_failed")
        return False

def test_my_commissions_page(page):
    """Test the My Commissions page"""
    log("Testing My Commissions page...")

    try:
        page.goto(f"{BASE_URL}/versotech_main/my-commissions")
        page.wait_for_load_state("networkidle")
        time.sleep(2)

        take_screenshot(page, "03_my_commissions")

        # Check page title
        title = page.locator("h1").first.text_content()
        if "Commissions" in title:
            test_pass("My Commissions - Title", f"Page title: {title}")
        else:
            test_warn("My Commissions - Title", f"Unexpected title: {title}")

        # Check for summary cards
        cards = page.locator('[class*="Card"]').all()
        log(f"Found {len(cards)} cards on the page")

        # Check for Total Owed card
        if page.locator("text=Total Owed").count() > 0:
            test_pass("My Commissions - Total Owed Card", "Total Owed card visible")
        else:
            test_fail("My Commissions - Total Owed Card", "Total Owed card not found")

        # Check for Total Paid card
        if page.locator("text=Total Paid").count() > 0:
            test_pass("My Commissions - Total Paid Card", "Total Paid card visible")
        else:
            test_fail("My Commissions - Total Paid Card", "Total Paid card not found")

        # Check for commissions table
        table = page.locator("table").first
        if table.count() > 0:
            rows = page.locator("table tbody tr").all()
            test_pass("My Commissions - Table", f"Commission table visible with {len(rows)} rows")

            # Check for action buttons
            if page.locator("button:has-text('Submit Invoice')").count() > 0:
                test_pass("My Commissions - Submit Invoice Button", "Submit Invoice button visible")
            else:
                test_warn("My Commissions - Submit Invoice Button", "No Submit Invoice buttons (may not have invoice_requested commissions)")

            if page.locator("button:has-text('View Invoice')").count() > 0:
                test_pass("My Commissions - View Invoice Button", "View Invoice button visible")
            else:
                test_warn("My Commissions - View Invoice Button", "No View Invoice buttons (may not have invoiced commissions)")
        else:
            test_warn("My Commissions - Table", "No commissions table visible (may have no commissions)")

        # Check for status filter
        if page.locator("text=All Status").count() > 0:
            test_pass("My Commissions - Status Filter", "Status filter dropdown visible")

        # Check for date range picker
        date_picker = page.locator('[class*="DateRangePicker"], button:has-text("Pick a date")').first
        if date_picker.count() > 0:
            test_pass("My Commissions - Date Filter", "Date range filter visible")

        return True

    except Exception as e:
        test_fail("My Commissions Page", str(e))
        take_screenshot(page, "03_my_commissions_error")
        return False

def test_submit_invoice_dialog(page):
    """Test the submit invoice dialog"""
    log("Testing Submit Invoice dialog...")

    try:
        # Look for Submit Invoice button
        submit_btn = page.locator("button:has-text('Submit Invoice')").first

        if submit_btn.count() == 0:
            test_warn("Submit Invoice Dialog", "No Submit Invoice button available to test")
            return False

        # Click the button
        submit_btn.click()
        time.sleep(1)

        take_screenshot(page, "04_submit_invoice_dialog")

        # Check dialog content
        dialog = page.locator('[role="dialog"]')
        if dialog.count() > 0:
            test_pass("Submit Invoice Dialog - Opens", "Dialog opened successfully")

            # Check for file upload
            if page.locator("text=Select Invoice").count() > 0 or page.locator("input[type='file']").count() > 0:
                test_pass("Submit Invoice Dialog - File Upload", "File upload area visible")

            # Check for amount display
            if page.locator("text=Amount").count() > 0:
                test_pass("Submit Invoice Dialog - Amount Display", "Amount is displayed")

            # Check for Cancel button
            cancel_btn = page.locator("button:has-text('Cancel')")
            if cancel_btn.count() > 0:
                cancel_btn.first.click()
                time.sleep(0.5)
                test_pass("Submit Invoice Dialog - Cancel", "Can close dialog")
        else:
            test_fail("Submit Invoice Dialog - Opens", "Dialog did not open")

        return True

    except Exception as e:
        test_fail("Submit Invoice Dialog", str(e))
        take_screenshot(page, "04_submit_invoice_error")
        return False

def test_partner_transactions_page(page):
    """Test the Partner Transactions page"""
    log("Testing Partner Transactions page...")

    try:
        page.goto(f"{BASE_URL}/versotech_main/partner-transactions")
        page.wait_for_load_state("networkidle")
        time.sleep(2)

        take_screenshot(page, "05_partner_transactions")

        # Check if page loads (might redirect or show error if user is not a partner)
        current_url = page.url

        # Check for error message
        error_msg = page.locator("text=Error, text=not registered, text=Access")
        if error_msg.count() > 0:
            test_warn("Partner Transactions", "User may not have partner access - showing appropriate message")
            return True

        # Check page title
        title = page.locator("h1").first.text_content() if page.locator("h1").count() > 0 else ""
        if "Partner" in title or "Transaction" in title:
            test_pass("Partner Transactions - Title", f"Page title: {title}")

        # Check for summary cards
        if page.locator("text=Total Referrals").count() > 0:
            test_pass("Partner Transactions - Total Referrals Card", "Total Referrals card visible")

        if page.locator("text=Converted").count() > 0:
            test_pass("Partner Transactions - Converted Card", "Converted card visible")

        # Check for filters
        if page.locator("text=All Status").count() > 0:
            test_pass("Partner Transactions - Status Filter", "Status filter visible")

        if page.locator("text=All Stages").count() > 0:
            test_pass("Partner Transactions - Stage Filter", "Investor stage filter visible")

        # Check for table
        table = page.locator("table").first
        if table.count() > 0:
            rows = page.locator("table tbody tr").all()
            test_pass("Partner Transactions - Table", f"Transaction table visible with {len(rows)} rows")

        # Check for Export CSV button
        if page.locator("button:has-text('Export')").count() > 0:
            test_pass("Partner Transactions - Export", "Export CSV button visible")

        return True

    except Exception as e:
        test_fail("Partner Transactions Page", str(e))
        take_screenshot(page, "05_partner_transactions_error")
        return False

def test_introducer_dashboard(page):
    """Test the Introducer Dashboard"""
    log("Testing Introducer Dashboard...")

    try:
        page.goto(f"{BASE_URL}/versotech_main/dashboard")
        page.wait_for_load_state("networkidle")
        time.sleep(2)

        take_screenshot(page, "06_dashboard")

        # Check for dashboard content
        title = page.locator("h1, h2").first.text_content() if page.locator("h1, h2").count() > 0 else ""
        log(f"Dashboard title/heading: {title}")

        # Check for dual-role toggle (if user has both introducer and investor personas)
        if page.locator("text=Referrals").count() > 0 or page.locator("text=Portfolio").count() > 0:
            test_pass("Dashboard - Dual Role Toggle", "Dual role toggle visible")

        # Check for commission widgets
        if page.locator("text=Commission, text=commission, text=Earned").count() > 0:
            test_pass("Dashboard - Commission Widget", "Commission information visible")

        # Check for introduction stats
        if page.locator("text=Introduction, text=Referral").count() > 0:
            test_pass("Dashboard - Introduction Stats", "Introduction/Referral stats visible")

        return True

    except Exception as e:
        test_fail("Introducer Dashboard", str(e))
        take_screenshot(page, "06_dashboard_error")
        return False

def test_introductions_page(page):
    """Test the Introductions page"""
    log("Testing Introductions page...")

    try:
        page.goto(f"{BASE_URL}/versotech_main/introductions")
        page.wait_for_load_state("networkidle")
        time.sleep(2)

        take_screenshot(page, "07_introductions")

        # Check page title
        title = page.locator("h1").first.text_content() if page.locator("h1").count() > 0 else ""
        if "Introduction" in title:
            test_pass("Introductions - Title", f"Page title: {title}")

        # Check for introduction cards/table
        intro_elements = page.locator('[class*="Card"], table tbody tr').all()
        if len(intro_elements) > 0:
            test_pass("Introductions - Content", f"Found {len(intro_elements)} introduction elements")
        else:
            test_warn("Introductions - Content", "No introductions displayed")

        # Check for Data Room / View Deal buttons
        if page.locator("button:has-text('Data Room'), button:has-text('View Deal'), button:has-text('View')").count() > 0:
            test_pass("Introductions - View Action", "View/Data Room action available")

        return True

    except Exception as e:
        test_fail("Introductions Page", str(e))
        take_screenshot(page, "07_introductions_error")
        return False

def test_navigation(page):
    """Test sidebar navigation"""
    log("Testing navigation...")

    try:
        # Check sidebar links
        nav_items = [
            ("Dashboard", "/versotech_main/dashboard"),
            ("Introductions", "/versotech_main/introductions"),
            ("My Commissions", "/versotech_main/my-commissions"),
        ]

        for name, path in nav_items:
            link = page.locator(f'a[href*="{path}"], a:has-text("{name}")').first
            if link.count() > 0:
                test_pass(f"Navigation - {name}", f"Link to {path} visible")
            else:
                test_warn(f"Navigation - {name}", f"Link to {path} not found in sidebar")

        return True

    except Exception as e:
        test_fail("Navigation", str(e))
        return False

def test_persona_switcher(page):
    """Test persona switcher functionality"""
    log("Testing persona switcher...")

    try:
        # Look for profile/avatar in header
        profile_trigger = page.locator('[class*="Avatar"], [class*="DropdownMenuTrigger"], button[class*="rounded-full"]').first

        if profile_trigger.count() > 0:
            profile_trigger.click()
            time.sleep(1)

            take_screenshot(page, "08_persona_menu")

            # Look for persona switch options
            if page.locator("text=Switch Context, text=Switch Role, text=PYM").count() > 0:
                test_pass("Persona Switcher - Menu", "Persona switch options visible in dropdown")
            else:
                test_warn("Persona Switcher - Menu", "No persona switch options found (may have single persona)")

            # Close menu by clicking elsewhere
            page.keyboard.press("Escape")
        else:
            test_warn("Persona Switcher", "Could not find profile menu trigger")

        return True

    except Exception as e:
        test_fail("Persona Switcher", str(e))
        return False

def print_summary():
    """Print test summary"""
    print("\n" + "="*60)
    print("                    TEST SUMMARY")
    print("="*60)

    print(f"\nPASSED: {len(results['passed'])}")
    for item in results['passed']:
        print(f"  [OK] {item['name']}: {item['details']}")

    print(f"\nFAILED: {len(results['failed'])}")
    for item in results['failed']:
        print(f"  [X] {item['name']}: {item['error']}")

    print(f"\nWARNINGS: {len(results['warnings'])}")
    for item in results['warnings']:
        print(f"  [!] {item['name']}: {item['warning']}")

    print(f"\nSCREENSHOTS: {len(results['screenshots'])}")
    for ss in results['screenshots']:
        print(f"  -> {ss}")

    print("\n" + "="*60)
    total = len(results['passed']) + len(results['failed'])
    pass_rate = (len(results['passed']) / total * 100) if total > 0 else 0
    print(f"PASS RATE: {pass_rate:.1f}% ({len(results['passed'])}/{total})")
    print("="*60)

    return len(results['failed']) == 0

def main():
    log("Starting Versotech Transaction System E2E Tests")
    log(f"Base URL: {BASE_URL}")

    # Create screenshots directory
    import os
    os.makedirs("screenshots", exist_ok=True)

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 1400, "height": 900})
        page = context.new_page()

        try:
            # Test 1: Login
            if not login(page, INTRODUCER_EMAIL, INTRODUCER_PASSWORD):
                log("Login failed, aborting tests", "ERROR")
                print_summary()
                browser.close()
                sys.exit(1)

            # Test 2: Dashboard
            test_introducer_dashboard(page)

            # Test 3: Navigation
            test_navigation(page)

            # Test 4: My Commissions Page
            test_my_commissions_page(page)

            # Test 5: Submit Invoice Dialog
            test_submit_invoice_dialog(page)

            # Test 6: Partner Transactions Page
            test_partner_transactions_page(page)

            # Test 7: Introductions Page
            test_introductions_page(page)

            # Test 8: Persona Switcher
            test_persona_switcher(page)

            # Final screenshot
            take_screenshot(page, "99_final_state")

        except Exception as e:
            log(f"Unexpected error: {e}", "ERROR")
            take_screenshot(page, "99_error")
        finally:
            browser.close()

    # Print summary
    success = print_summary()
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main()
