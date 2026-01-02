"""
Introducer Persona Audit - UI Testing
Tests all Introducer pages and functionality
"""

import sys
import time
import os
from datetime import datetime
from playwright.sync_api import sync_playwright

# Configuration
BASE_URL = os.environ.get("TEST_BASE_URL", "http://localhost:3005")
EMAIL = "py.moussaouighiles@gmail.com"
PASSWORD = "TestIntro2024!"

issues = []

def log(msg, level="INFO"):
    ts = datetime.now().strftime("%H:%M:%S")
    print(f"[{ts}] [{level}] {msg}")

def add_issue(category, description, details=""):
    issues.append({"category": category, "description": description, "details": details})
    log(f"ISSUE: {category} - {description}", "ERROR")

def main():
    log(f"Starting Introducer UI Audit on {BASE_URL}")

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 1400, "height": 900})
        page = context.new_page()

        try:
            # 1. LOGIN TEST
            log("Testing login...")
            page.goto(f"{BASE_URL}/auth/login", timeout=60000)
            page.wait_for_load_state("networkidle", timeout=30000)

            # Fill login form
            page.fill('input[type="email"], input[name="email"]', EMAIL)
            page.fill('input[type="password"], input[name="password"]', PASSWORD)
            page.click('button[type="submit"]')
            page.wait_for_load_state("networkidle", timeout=30000)
            time.sleep(2)

            if "/auth/login" in page.url:
                add_issue("Login", "Login failed - still on login page", page.url)
                browser.close()
                return

            log(f"Login successful, redirected to: {page.url}")

            # 2. DASHBOARD TEST
            log("Testing Dashboard...")
            page.goto(f"{BASE_URL}/versotech_main/dashboard", timeout=60000)
            page.wait_for_load_state("networkidle", timeout=30000)
            time.sleep(2)

            # Check for errors
            error_elements = page.locator("text=Error, text=error, text=Something went wrong").all()
            if error_elements:
                add_issue("Dashboard", "Error message displayed", page.content()[:500])

            # Check for introducer content
            if page.locator("text=Total Introductions, text=Commission, text=Referral").count() == 0:
                add_issue("Dashboard", "Missing introducer metrics", "No Total Introductions/Commission visible")

            # Check for dual-role toggle
            if page.locator("text=Referrals, text=Portfolio").count() == 0:
                add_issue("Dashboard", "Missing dual-role toggle", "Referrals/Portfolio toggle not found")

            page.screenshot(path="screenshots/01_dashboard.png", full_page=True)

            # 3. INTRODUCTIONS PAGE
            log("Testing Introductions page...")
            page.goto(f"{BASE_URL}/versotech_main/introductions", timeout=60000)
            page.wait_for_load_state("networkidle", timeout=30000)
            time.sleep(2)

            if page.locator("text=Error, text=Something went wrong").count() > 0:
                add_issue("Introductions", "Error on page load")

            # Check for table/content
            if page.locator("table, [class*='Card']").count() == 0:
                add_issue("Introductions", "No introductions table/cards visible")

            # Check View Deal button
            if page.locator("button:has-text('View Deal'), a:has-text('View')").count() == 0:
                add_issue("Introductions", "Missing View Deal action buttons")

            # Check Export CSV
            if page.locator("button:has-text('Export')").count() == 0:
                add_issue("Introductions", "Missing Export CSV button")

            page.screenshot(path="screenshots/02_introductions.png", full_page=True)

            # 4. MY COMMISSIONS PAGE
            log("Testing My Commissions page...")
            page.goto(f"{BASE_URL}/versotech_main/my-commissions", timeout=60000)
            page.wait_for_load_state("networkidle", timeout=30000)
            time.sleep(2)

            if page.locator("text=Error, text=Something went wrong").count() > 0:
                add_issue("My Commissions", "Error on page load")

            # Check for summary cards
            if page.locator("text=Total Owed").count() == 0:
                add_issue("My Commissions", "Missing Total Owed card")
            if page.locator("text=Total Paid").count() == 0:
                add_issue("My Commissions", "Missing Total Paid card")

            # Check for table
            if page.locator("table").count() == 0:
                add_issue("My Commissions", "No commissions table visible")

            # Check Submit Invoice button
            submit_btn = page.locator("button:has-text('Submit Invoice')")
            if submit_btn.count() > 0:
                submit_btn.first.click()
                time.sleep(1)
                if page.locator('[role="dialog"]').count() == 0:
                    add_issue("My Commissions", "Submit Invoice dialog doesn't open")
                else:
                    # Check dialog content
                    if page.locator("text=Select Invoice, input[type='file']").count() == 0:
                        add_issue("My Commissions", "Invoice dialog missing file upload")
                    page.keyboard.press("Escape")

            page.screenshot(path="screenshots/03_commissions.png", full_page=True)

            # 5. INTRODUCER AGREEMENTS PAGE
            log("Testing Introducer Agreements page...")
            page.goto(f"{BASE_URL}/versotech_main/introducer-agreements", timeout=60000)
            page.wait_for_load_state("networkidle", timeout=30000)
            time.sleep(2)

            if page.locator("text=Error, text=Something went wrong, text=Access Restricted").count() > 0:
                add_issue("Agreements", "Error or access denied on page load")

            if page.locator("table, [class*='Card'], text=Agreement").count() == 0:
                add_issue("Agreements", "No agreements content visible")

            page.screenshot(path="screenshots/04_agreements.png", full_page=True)

            # 6. PROFILE/GDPR PAGE
            log("Testing Profile page...")
            page.goto(f"{BASE_URL}/versotech_main/profile", timeout=60000)
            page.wait_for_load_state("networkidle", timeout=30000)
            time.sleep(2)

            if page.locator("text=Error, text=Something went wrong").count() > 0:
                add_issue("Profile", "Error on page load")

            # Check for GDPR tab
            gdpr_tab = page.locator("button:has-text('Data & Privacy'), button:has-text('GDPR')")
            if gdpr_tab.count() == 0:
                add_issue("Profile", "Missing GDPR/Data & Privacy tab")
            else:
                gdpr_tab.first.click()
                time.sleep(1)
                # Check GDPR controls
                if page.locator("text=Export My Data, text=Delete My Data").count() == 0:
                    add_issue("Profile/GDPR", "Missing GDPR export/delete controls")

            page.screenshot(path="screenshots/05_profile.png", full_page=True)

            # 7. OPPORTUNITIES PAGE (as investor)
            log("Testing Opportunities page...")
            page.goto(f"{BASE_URL}/versotech_main/opportunities", timeout=60000)
            page.wait_for_load_state("networkidle", timeout=30000)
            time.sleep(2)

            if page.locator("text=Error, text=Something went wrong").count() > 0:
                add_issue("Opportunities", "Error on page load")

            page.screenshot(path="screenshots/06_opportunities.png", full_page=True)

            # 8. NAVIGATION TEST
            log("Testing sidebar navigation...")

            nav_items = [
                ("Dashboard", "/dashboard"),
                ("Introductions", "/introductions"),
                ("My Commissions", "/my-commissions"),
                ("Agreements", "/introducer-agreements"),
            ]

            for name, path in nav_items:
                link = page.locator(f'a[href*="{path}"]').first
                if link.count() == 0:
                    add_issue("Navigation", f"Missing sidebar link: {name}", path)

            log("UI audit complete")

        except Exception as e:
            add_issue("General", f"Unexpected error: {str(e)}")
            page.screenshot(path="screenshots/99_error.png", full_page=True)
        finally:
            browser.close()

    # Print summary
    print("\n" + "="*60)
    print("           INTRODUCER UI AUDIT RESULTS")
    print("="*60)

    if issues:
        print(f"\nFOUND {len(issues)} ISSUES:\n")
        for i, issue in enumerate(issues, 1):
            print(f"{i}. [{issue['category']}] {issue['description']}")
            if issue['details']:
                print(f"   Details: {issue['details'][:200]}")
    else:
        print("\nNo UI issues found!")

    print("="*60)
    return len(issues) == 0

if __name__ == "__main__":
    os.makedirs("screenshots", exist_ok=True)
    success = main()
    sys.exit(0 if success else 1)
