"""Partner Persona Full Navigation Audit"""
from playwright.sync_api import sync_playwright
import json
import os

# Create screenshots directory
SCREENSHOTS_DIR = os.path.join(os.path.dirname(__file__), 'screenshots', 'partner_audit')
os.makedirs(SCREENSHOTS_DIR, exist_ok=True)

def screenshot(page, name):
    path = os.path.join(SCREENSHOTS_DIR, f'{name}.png')
    page.screenshot(path=path, full_page=True)
    print(f"  Screenshot: {path}")
    return path

def main():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={'width': 1920, 'height': 1080})
        page = context.new_page()

        # Collect console errors
        console_errors = []
        page.on('console', lambda msg: console_errors.append(msg.text) if msg.type == 'error' else None)

        print("=" * 60)
        print("PARTNER PERSONA NAVIGATION AUDIT")
        print("=" * 60)

        # Step 1: Login
        print("\n[1] LOGIN")
        page.goto('http://localhost:3000/auth/login')
        page.wait_for_load_state('networkidle')

        # Fill login form
        page.fill('input[type="email"]', 'cto@verso-operation.com')
        page.fill('input[type="password"]', 'VersoPartner2024!')
        page.click('button[type="submit"]')

        # Wait for redirect after login
        page.wait_for_load_state('networkidle')
        page.wait_for_timeout(3000)  # Extra wait for auth

        landing_url = page.url
        print(f"  Landing URL: {landing_url}")
        screenshot(page, '01_landing_page')

        # Step 2: Extract sidebar navigation
        print("\n[2] SIDEBAR NAVIGATION ITEMS")

        # Wait for sidebar to load
        page.wait_for_timeout(2000)

        # Get all sidebar links
        sidebar_links = page.locator('nav a, aside a, [role="navigation"] a').all()
        nav_items = []

        for link in sidebar_links:
            try:
                href = link.get_attribute('href')
                text = link.inner_text().strip()
                if href and text and '/versotech_main' in href:
                    nav_items.append({'text': text, 'href': href})
            except:
                pass

        # Deduplicate
        seen = set()
        unique_nav = []
        for item in nav_items:
            if item['href'] not in seen:
                seen.add(item['href'])
                unique_nav.append(item)
                print(f"  - {item['text']}: {item['href']}")

        # Step 3: Test each page
        print("\n[3] PAGE-BY-PAGE AUDIT")

        pages_to_test = [
            ('Dashboard', '/versotech_main/dashboard'),
            ('Opportunities', '/versotech_main/opportunities'),
            ('Transactions', '/versotech_main/partner-transactions'),
            ('My Commissions', '/versotech_main/my-commissions'),
            ('Shared Deals', '/versotech_main/shared-transactions'),
            ('VersoSign', '/versotech_main/versosign'),
            ('Profile', '/versotech_main/profile'),
        ]

        results = []

        for idx, (name, path) in enumerate(pages_to_test, 2):
            print(f"\n  [{name}] {path}")

            try:
                page.goto(f'http://localhost:3000{path}')
                page.wait_for_load_state('networkidle')
                page.wait_for_timeout(2000)

                # Check for errors
                error_elements = page.locator('text=Error, text=error, text=failed, text=Failed').all()
                has_visible_error = False
                error_text = None

                for el in error_elements:
                    if el.is_visible():
                        has_visible_error = True
                        error_text = el.inner_text()
                        break

                # Check page content
                body_text = page.locator('body').inner_text()
                is_empty = len(body_text.strip()) < 100

                # Take screenshot
                screenshot(page, f'{idx:02d}_{name.lower().replace(" ", "_")}')

                status = 'OK'
                notes = []

                if has_visible_error:
                    status = 'ERROR'
                    notes.append(f'Error visible: {error_text[:100]}')
                elif is_empty:
                    status = 'EMPTY'
                    notes.append('Page appears empty')

                # Special checks per page
                if name == 'Opportunities':
                    # Look for Share button
                    share_buttons = page.locator('button:has-text("Share"), [aria-label*="share"], text=Share').all()
                    if share_buttons:
                        notes.append(f'Share button found: {len(share_buttons)} instances')
                    else:
                        notes.append('No Share button visible')

                if name == 'My Commissions':
                    # Check for commission data
                    if 'Total Owed' in body_text or 'Total Paid' in body_text:
                        notes.append('Commission summary cards visible')
                    if '$1,000' in body_text or '$1,500' in body_text or '$5,000' in body_text:
                        notes.append('Test commission data visible')
                    if 'Invoice' in body_text:
                        notes.append('Invoice functionality visible')

                if name == 'Transactions':
                    # Check for stage filters
                    if 'Stage' in body_text or 'Dispatched' in body_text or 'Interested' in body_text:
                        notes.append('Stage filters visible')
                    if 'Commission' in body_text or '%' in body_text:
                        notes.append('Commission column visible')

                print(f"    Status: {status}")
                for note in notes:
                    print(f"    - {note}")

                results.append({
                    'name': name,
                    'path': path,
                    'status': status,
                    'notes': notes
                })

            except Exception as e:
                print(f"    Status: FAILED")
                print(f"    Error: {str(e)}")
                results.append({
                    'name': name,
                    'path': path,
                    'status': 'FAILED',
                    'notes': [str(e)]
                })

        # Step 4: Test Share Dialog
        print("\n[4] SHARE FEATURE TEST")
        page.goto('http://localhost:3000/versotech_main/opportunities')
        page.wait_for_load_state('networkidle')
        page.wait_for_timeout(2000)

        # Look for Share button
        share_button = page.locator('button:has-text("Share")').first
        if share_button.is_visible():
            print("  Share button found, clicking...")
            share_button.click()
            page.wait_for_timeout(1500)
            screenshot(page, '10_share_dialog')

            # Check dialog content
            dialog_visible = page.locator('[role="dialog"], .dialog, [data-state="open"]').is_visible()
            if dialog_visible:
                print("  Dialog opened successfully")
                dialog_text = page.locator('[role="dialog"], .dialog').inner_text()
                if 'Investor' in dialog_text:
                    print("  - Investor selector present")
                if 'Introducer' in dialog_text or 'Co-refer' in dialog_text:
                    print("  - Co-referral option present")
                if 'Commission' in dialog_text or '%' in dialog_text:
                    print("  - Fee display present")
            else:
                print("  Dialog did NOT open")
        else:
            print("  No Share button found on page")

        # Step 5: Console Errors
        print("\n[5] CONSOLE ERRORS")
        if console_errors:
            for err in console_errors[:10]:
                print(f"  - {err[:100]}")
        else:
            print("  No console errors detected")

        # Summary
        print("\n" + "=" * 60)
        print("SUMMARY")
        print("=" * 60)

        ok_count = len([r for r in results if r['status'] == 'OK'])
        error_count = len([r for r in results if r['status'] == 'ERROR'])
        failed_count = len([r for r in results if r['status'] == 'FAILED'])

        print(f"\n  Pages OK: {ok_count}/{len(results)}")
        print(f"  Pages with errors: {error_count}")
        print(f"  Pages failed to load: {failed_count}")

        print("\n  Detailed Results:")
        for r in results:
            status_icon = '✓' if r['status'] == 'OK' else '✗'
            print(f"    {status_icon} {r['name']}: {r['status']}")
            for note in r['notes']:
                print(f"      - {note}")

        browser.close()

        # Save results to JSON
        with open(os.path.join(SCREENSHOTS_DIR, 'audit_results.json'), 'w') as f:
            json.dump({
                'landing_url': landing_url,
                'nav_items': unique_nav,
                'page_results': results,
                'console_errors': console_errors[:20]
            }, f, indent=2)

        print(f"\n  Results saved to: {SCREENSHOTS_DIR}/audit_results.json")

if __name__ == '__main__':
    main()
