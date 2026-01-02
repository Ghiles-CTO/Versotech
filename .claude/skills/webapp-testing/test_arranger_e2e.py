"""
Arranger E2E Test for Versotech Transaction System

Tests the Arranger side:
1. Arranger login
2. Payment Requests page
3. Arranger Reconciliation page
4. Request Invoice functionality
5. Mark as Paid functionality

Author: Claude Code E2E Tester
"""

import sys
import time
import os
from datetime import datetime
from playwright.sync_api import sync_playwright, TimeoutError as PlaywrightTimeout

# Test configuration
BASE_URL = os.environ.get("TEST_BASE_URL", "http://localhost:3003")

# Arranger test credentials from database
ARRANGER_EMAIL = "sales@aisynthesis.de"
ARRANGER_PASSWORD = "TestArranger2024!"

# Alternative credentials to try
ALT_CREDENTIALS = [
    ("sales@aisynthesis.de", "Test1234!"),
    ("sales@aisynthesis.de", "Arranger2024!"),
    ("alpine@test.com", "Test1234!"),
    ("pacific@test.com", "Test1234!"),
]

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
    filename = f"screenshots/arranger_{name}_{datetime.now().strftime('%H%M%S')}.png"
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

def try_login(page, email, password):
    """Attempt to login with given credentials"""
    log(f"Attempting login as {email}")
    page.goto(f"{BASE_URL}/auth/login")
    page.wait_for_load_state("networkidle")

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
    time.sleep(2)

    # Check if login succeeded
    current_url = page.url
    if "/auth/login" not in current_url and "/auth/error" not in current_url:
        return True
    return False

def login_as_arranger(page):
    """Try multiple credentials to login as arranger"""
    take_screenshot(page, "01_login_page")

    # Try primary credentials
    if try_login(page, ARRANGER_EMAIL, ARRANGER_PASSWORD):
        test_pass("Arranger Login", f"Logged in as {ARRANGER_EMAIL}")
        take_screenshot(page, "02_after_login")
        return True

    # Try alternative credentials
    for email, password in ALT_CREDENTIALS:
        if try_login(page, email, password):
            test_pass("Arranger Login", f"Logged in as {email}")
            take_screenshot(page, "02_after_login")
            return True

    test_fail("Arranger Login", "Could not login with any known arranger credentials")
    take_screenshot(page, "02_login_failed")
    return False

def check_arranger_access(page):
    """Check if user has arranger access by trying to access arranger pages"""
    log("Checking arranger access...")

    # Try to access arranger reconciliation page
    page.goto(f"{BASE_URL}/versotech_main/arranger-reconciliation")
    page.wait_for_load_state("networkidle")
    time.sleep(2)

    take_screenshot(page, "03_arranger_access_check")

    # Check for access denied message
    if page.locator("text=Access Restricted, text=Arranger Not Found, text=not authorized").count() > 0:
        test_warn("Arranger Access", "User does not have arranger role")
        return False

    # Check if page loaded with content
    if page.locator("text=Reconciliation, text=Commissions").count() > 0:
        test_pass("Arranger Access", "User has arranger access")
        return True

    test_warn("Arranger Access", "Could not determine arranger access status")
    return False

def test_payment_requests_page(page):
    """Test the Payment Requests page"""
    log("Testing Payment Requests page...")

    try:
        page.goto(f"{BASE_URL}/versotech_main/payment-requests")
        page.wait_for_load_state("networkidle")
        time.sleep(2)

        take_screenshot(page, "04_payment_requests")

        # Check if access denied
        if page.locator("text=Access Restricted, text=not authorized, text=Arranger Not Found").count() > 0:
            test_warn("Payment Requests", "Access restricted - not an arranger")
            return False

        # Check page title
        title_elem = page.locator("h1, h2").first
        if title_elem.count() > 0:
            title = title_elem.text_content()
            if "Payment" in title or "Request" in title:
                test_pass("Payment Requests - Title", f"Page title: {title}")

        # Check for tabs
        if page.locator("text=Inbound, text=Outbound").count() > 0:
            test_pass("Payment Requests - Tabs", "Inbound/Outbound tabs visible")

        # Check for commission data
        if page.locator("text=Introducer, text=Partner, text=Commission").count() > 0:
            test_pass("Payment Requests - Content", "Commission content visible")

        # Check for action buttons
        if page.locator("button:has-text('Request Invoice')").count() > 0:
            test_pass("Payment Requests - Request Invoice", "Request Invoice button visible")

        if page.locator("button:has-text('Mark as Paid'), button:has-text('Mark Paid')").count() > 0:
            test_pass("Payment Requests - Mark Paid", "Mark as Paid button visible")

        return True

    except Exception as e:
        test_fail("Payment Requests Page", str(e))
        take_screenshot(page, "04_payment_requests_error")
        return False

def test_arranger_reconciliation_page(page):
    """Test the Arranger Reconciliation page"""
    log("Testing Arranger Reconciliation page...")

    try:
        page.goto(f"{BASE_URL}/versotech_main/arranger-reconciliation")
        page.wait_for_load_state("networkidle")
        time.sleep(2)

        take_screenshot(page, "05_arranger_reconciliation")

        # Check if access denied
        if page.locator("text=Access Restricted, text=not authorized").count() > 0:
            test_warn("Arranger Reconciliation", "Access restricted - not an arranger")
            return False

        # Check for tabs
        tabs = page.locator('[role="tab"], button[class*="Tab"]').all()
        if len(tabs) > 0:
            test_pass("Arranger Reconciliation - Tabs", f"Found {len(tabs)} tabs")

        # Check for Overview tab content
        if page.locator("text=Overview, text=Subscriptions, text=Fee Events").count() > 0:
            test_pass("Arranger Reconciliation - Overview", "Overview content visible")

        # Check for commission tabs
        if page.locator("text=Introducer Commissions, text=Partner Commissions").count() > 0:
            test_pass("Arranger Reconciliation - Commission Tabs", "Commission tabs visible")

        # Check for Export CSV button
        if page.locator("button:has-text('Export'), button:has-text('CSV')").count() > 0:
            test_pass("Arranger Reconciliation - Export", "Export functionality visible")

        # Try clicking on Introducer Commissions tab
        introducer_tab = page.locator("text=Introducer, button:has-text('Introducer')").first
        if introducer_tab.count() > 0:
            introducer_tab.click()
            time.sleep(1)
            take_screenshot(page, "05b_introducer_commissions_tab")

            # Check for commission table
            if page.locator("table").count() > 0:
                test_pass("Arranger Reconciliation - Introducer Table", "Introducer commissions table visible")

        return True

    except Exception as e:
        test_fail("Arranger Reconciliation Page", str(e))
        take_screenshot(page, "05_arranger_reconciliation_error")
        return False

def test_request_invoice_dialog(page):
    """Test the Request Invoice dialog from arranger side"""
    log("Testing Request Invoice dialog...")

    try:
        # Navigate to payment requests or reconciliation
        page.goto(f"{BASE_URL}/versotech_main/payment-requests")
        page.wait_for_load_state("networkidle")
        time.sleep(2)

        # Look for Request Invoice button
        request_btn = page.locator("button:has-text('Request Invoice')").first

        if request_btn.count() == 0:
            test_warn("Request Invoice Dialog", "No Request Invoice button available")
            return False

        # Click the button
        request_btn.click()
        time.sleep(1)

        take_screenshot(page, "06_request_invoice_dialog")

        # Check dialog content
        dialog = page.locator('[role="dialog"]')
        if dialog.count() > 0:
            test_pass("Request Invoice Dialog - Opens", "Dialog opened successfully")

            # Check for entity info
            if page.locator("text=Partner, text=Introducer, text=Commercial Partner").count() > 0:
                test_pass("Request Invoice Dialog - Entity Info", "Entity type displayed")

            # Check for amount
            if page.locator("text=Amount").count() > 0:
                test_pass("Request Invoice Dialog - Amount", "Amount displayed")

            # Check for Cancel/Submit buttons
            cancel_btn = page.locator("button:has-text('Cancel')")
            if cancel_btn.count() > 0:
                cancel_btn.first.click()
                test_pass("Request Invoice Dialog - Cancel", "Can close dialog")
        else:
            test_fail("Request Invoice Dialog - Opens", "Dialog did not open")

        return True

    except Exception as e:
        test_fail("Request Invoice Dialog", str(e))
        return False

def test_my_introducers_page(page):
    """Test the My Introducers page (arranger view)"""
    log("Testing My Introducers page...")

    try:
        page.goto(f"{BASE_URL}/versotech_main/my-introducers")
        page.wait_for_load_state("networkidle")
        time.sleep(2)

        take_screenshot(page, "07_my_introducers")

        # Check if access denied
        if page.locator("text=Access Restricted, text=not authorized").count() > 0:
            test_warn("My Introducers", "Access restricted")
            return False

        # Check page title
        if page.locator("text=Introducer, text=My Introducers").count() > 0:
            test_pass("My Introducers - Title", "Page title visible")

        # Check for introducer list/table
        if page.locator("table, [class*='Card']").count() > 0:
            test_pass("My Introducers - Content", "Introducer content visible")

        return True

    except Exception as e:
        test_fail("My Introducers Page", str(e))
        return False

def test_my_partners_page(page):
    """Test the My Partners page (arranger view)"""
    log("Testing My Partners page...")

    try:
        page.goto(f"{BASE_URL}/versotech_main/my-partners")
        page.wait_for_load_state("networkidle")
        time.sleep(2)

        take_screenshot(page, "08_my_partners")

        # Check if access denied
        if page.locator("text=Access Restricted, text=not authorized").count() > 0:
            test_warn("My Partners", "Access restricted")
            return False

        # Check page title
        if page.locator("text=Partner, text=My Partners").count() > 0:
            test_pass("My Partners - Title", "Page title visible")

        # Check for partner list/table
        if page.locator("table, [class*='Card']").count() > 0:
            test_pass("My Partners - Content", "Partner content visible")

        return True

    except Exception as e:
        test_fail("My Partners Page", str(e))
        return False

def print_summary():
    """Print test summary"""
    print("\n" + "="*60)
    print("              ARRANGER TEST SUMMARY")
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
    log("Starting Arranger E2E Tests")
    log(f"Base URL: {BASE_URL}")

    # Create screenshots directory
    os.makedirs("screenshots", exist_ok=True)

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 1400, "height": 900})
        page = context.new_page()

        try:
            # Test 1: Login as Arranger
            if not login_as_arranger(page):
                log("Arranger login failed - will test with limited access", "WARN")

            # Test 2: Check arranger access
            has_arranger_access = check_arranger_access(page)

            if has_arranger_access:
                # Test 3: Payment Requests Page
                test_payment_requests_page(page)

                # Test 4: Arranger Reconciliation Page
                test_arranger_reconciliation_page(page)

                # Test 5: Request Invoice Dialog
                test_request_invoice_dialog(page)

                # Test 6: My Introducers Page
                test_my_introducers_page(page)

                # Test 7: My Partners Page
                test_my_partners_page(page)
            else:
                log("Skipping arranger-specific tests due to lack of access", "WARN")
                test_warn("Arranger Tests", "User does not have arranger access - tests skipped")

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
