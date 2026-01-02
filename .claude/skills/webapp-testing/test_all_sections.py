"""
Complete test for ALL Introducer sections (6.1-6.7)
Tests both Introducer AND Investor features for dual-persona user
"""
from playwright.sync_api import sync_playwright
import os
import sys
import json

sys.stdout.reconfigure(encoding='utf-8') if hasattr(sys.stdout, 'reconfigure') else None

SCREENSHOTS_DIR = os.path.join(os.path.dirname(__file__), 'screenshots', 'full_audit')
os.makedirs(SCREENSHOTS_DIR, exist_ok=True)

def test_all_sections():
    results = {
        '6.1_profile': {},
        '6.2_opportunities': {},
        '6.3_investments': {},
        '6.4_notifications': {},
        '6.5_sales': {},
        '6.6_introductions': {},
        '6.7_gdpr': {}
    }

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={'width': 1920, 'height': 1080})
        page = context.new_page()

        try:
            # ============================================
            # SECTION 6.1 - MY PROFILE (Rows 2-14)
            # ============================================
            print("\n" + "="*60)
            print("SECTION 6.1 - MY PROFILE")
            print("="*60)

            # Row 5: Login with user ID and password
            print("\nRow 5: Testing login...")
            page.goto('http://localhost:3000/versotech_main/login')
            page.wait_for_load_state('networkidle')
            page.screenshot(path=f'{SCREENSHOTS_DIR}/6.1_01_login_page.png', full_page=True)

            # Check login form exists
            email_input = page.locator('input[type="email"]')
            password_input = page.locator('input[type="password"]')
            submit_btn = page.locator('button[type="submit"]')

            results['6.1_profile']['row5_login_form'] = email_input.count() > 0 and password_input.count() > 0
            print(f"  Login form exists: {results['6.1_profile']['row5_login_form']}")

            # Perform login
            page.fill('input[type="email"]', 'py.moussaouighiles@gmail.com')
            page.fill('input[type="password"]', 'TestIntro2024!')
            page.click('button[type="submit"]')
            page.wait_for_url('**/dashboard**', timeout=15000)
            page.wait_for_load_state('networkidle')

            results['6.1_profile']['row5_login_success'] = True
            print(f"  Login successful: True")

            # Row 6-9: Profile completion/editing
            print("\nRows 6-9: Testing profile management...")
            page.goto('http://localhost:3000/versotech_main/introducer-profile')
            page.wait_for_load_state('networkidle')
            page.wait_for_timeout(1000)
            page.screenshot(path=f'{SCREENSHOTS_DIR}/6.1_02_profile_page.png', full_page=True)

            content = page.content()
            results['6.1_profile']['row6_profile_page'] = 'Profile' in content or 'PYM' in content
            results['6.1_profile']['row14_customize_profile'] = page.locator('button:has-text("Edit"), [class*="edit"]').count() > 0
            print(f"  Profile page accessible: {results['6.1_profile']['row6_profile_page']}")
            print(f"  Edit profile available: {results['6.1_profile']['row14_customize_profile']}")

            # Rows 12-13: Check-in features (app features discovery)
            print("\nRows 12-13: Testing check-in/features...")
            # Look for feature highlights or onboarding
            results['6.1_profile']['row12_features'] = 'Dashboard' in content or 'feature' in content.lower()
            print(f"  Features visible: {results['6.1_profile']['row12_features']}")

            # ============================================
            # SECTION 6.2 - MY OPPORTUNITIES AS INVESTOR (Rows 15-46)
            # ============================================
            print("\n" + "="*60)
            print("SECTION 6.2 - MY OPPORTUNITIES AS INVESTOR")
            print("="*60)

            # Rows 15-20: View opportunities by status
            print("\nRows 15-20: Testing opportunities list...")
            page.goto('http://localhost:3000/versotech_main/opportunities')
            page.wait_for_load_state('networkidle')
            page.wait_for_timeout(1500)
            page.screenshot(path=f'{SCREENSHOTS_DIR}/6.2_01_opportunities.png', full_page=True)

            content = page.content()
            results['6.2_opportunities']['row15_opportunities_page'] = 'Opportunit' in content or 'Deal' in content
            results['6.2_opportunities']['row15_list_visible'] = page.locator('table, [class*="card"], [class*="deal"]').count() > 0
            print(f"  Opportunities page: {results['6.2_opportunities']['row15_opportunities_page']}")
            print(f"  List/cards visible: {results['6.2_opportunities']['row15_list_visible']}")

            # Check for status filters (Rows 16-20)
            status_filter = page.locator('select, [class*="filter"], [class*="status"], button:has-text("Status")')
            results['6.2_opportunities']['row16_20_status_filter'] = status_filter.count() > 0
            print(f"  Status filter available: {results['6.2_opportunities']['row16_20_status_filter']}")

            # Rows 21-23: More information on opportunity
            print("\nRows 21-23: Testing opportunity details...")
            # Try to click on first deal/opportunity
            deal_links = page.locator('a[href*="deal"], a[href*="opportunit"], table tbody tr')
            if deal_links.count() > 0:
                results['6.2_opportunities']['row21_detail_access'] = True
                print(f"  Deal detail links: {deal_links.count()} found")
            else:
                results['6.2_opportunities']['row21_detail_access'] = False
                print(f"  Deal detail links: None found")

            # Rows 24-26: Data room access
            print("\nRows 24-26: Testing data room...")
            dataroom_indicator = page.locator('[class*="dataroom"], [class*="data-room"], button:has-text("Data Room"), a:has-text("Data Room")')
            results['6.2_opportunities']['row24_26_dataroom'] = dataroom_indicator.count() > 0 or 'data room' in content.lower() or 'dataroom' in content.lower()
            print(f"  Data room accessible: {results['6.2_opportunities']['row24_26_dataroom']}")

            # Rows 27-29: Interest confirmation
            print("\nRows 27-29: Testing interest actions...")
            interest_btns = page.locator('button:has-text("Interest"), button:has-text("Confirm"), button:has-text("Pass")')
            results['6.2_opportunities']['row27_29_interest'] = interest_btns.count() > 0 or 'interest' in content.lower()
            print(f"  Interest actions available: {results['6.2_opportunities']['row27_29_interest']}")

            # Rows 30-39: Subscription pack (check subscriptions page)
            print("\nRows 30-39: Testing subscription workflow...")
            page.goto('http://localhost:3000/versotech_main/subscriptions')
            page.wait_for_load_state('networkidle')
            page.wait_for_timeout(1000)
            page.screenshot(path=f'{SCREENSHOTS_DIR}/6.2_02_subscriptions.png', full_page=True)

            sub_content = page.content()
            results['6.2_opportunities']['row30_39_subscriptions'] = 'Subscription' in sub_content or 'subscription' in sub_content.lower()
            print(f"  Subscriptions page: {results['6.2_opportunities']['row30_39_subscriptions']}")

            # ============================================
            # SECTION 6.3 - MY INVESTMENTS (Rows 47-62)
            # ============================================
            print("\n" + "="*60)
            print("SECTION 6.3 - MY INVESTMENTS")
            print("="*60)

            # Row 47: View transactions
            print("\nRow 47: Testing portfolio/investments...")
            page.goto('http://localhost:3000/versotech_main/portfolio')
            page.wait_for_load_state('networkidle')
            page.wait_for_timeout(1000)
            page.screenshot(path=f'{SCREENSHOTS_DIR}/6.3_01_portfolio.png', full_page=True)

            portfolio_content = page.content()
            results['6.3_investments']['row47_portfolio_page'] = 'Portfolio' in portfolio_content or 'Investment' in portfolio_content
            print(f"  Portfolio page accessible: {results['6.3_investments']['row47_portfolio_page']}")

            # Row 48: View signed subscription pack
            results['6.3_investments']['row48_signed_docs'] = 'document' in portfolio_content.lower() or 'signed' in portfolio_content.lower()
            print(f"  Signed documents visible: {results['6.3_investments']['row48_signed_docs']}")

            # Rows 49-51: Investment performance
            print("\nRows 49-51: Testing performance tracking...")
            performance_indicators = page.locator('[class*="performance"], [class*="value"], [class*="return"], [class*="profit"]')
            results['6.3_investments']['row49_51_performance'] = performance_indicators.count() > 0 or 'performance' in portfolio_content.lower() or 'value' in portfolio_content.lower()
            print(f"  Performance tracking: {results['6.3_investments']['row49_51_performance']}")

            # Row 50: Shareholding positions
            position_indicators = page.locator('table, [class*="position"], [class*="holding"]')
            results['6.3_investments']['row50_positions'] = position_indicators.count() > 0
            print(f"  Positions visible: {results['6.3_investments']['row50_positions']}")

            # ============================================
            # SECTION 6.4 - INVESTMENT NOTIFICATIONS (Rows 63-65)
            # ============================================
            print("\n" + "="*60)
            print("SECTION 6.4 - INVESTMENT NOTIFICATIONS")
            print("="*60)

            print("\nRows 63-65: Testing notifications...")
            page.goto('http://localhost:3000/versotech_main/notifications')
            page.wait_for_load_state('networkidle')
            page.wait_for_timeout(1000)
            page.screenshot(path=f'{SCREENSHOTS_DIR}/6.4_01_notifications.png', full_page=True)

            notif_content = page.content()
            results['6.4_notifications']['row63_notifications_page'] = 'Notification' in notif_content
            print(f"  Notifications page: {results['6.4_notifications']['row63_notifications_page']}")

            # Row 63: Filter by type
            type_filter = page.locator('select, [class*="filter"], button:has-text("Type"), button:has-text("All Types")')
            results['6.4_notifications']['row63_type_filter'] = type_filter.count() > 0
            print(f"  Type filter available: {results['6.4_notifications']['row63_type_filter']}")

            # Row 64: View by opportunity
            results['6.4_notifications']['row64_by_opportunity'] = 'deal' in notif_content.lower() or 'opportunity' in notif_content.lower()
            print(f"  Filter by opportunity: {results['6.4_notifications']['row64_by_opportunity']}")

            # Count unread
            unread = page.locator('[class*="unread"], :has-text("Unread")')
            notification_count = page.locator('[class*="notification-item"], [class*="notification-card"], table tbody tr').count()
            print(f"  Notification items visible: {notification_count}")

            # ============================================
            # SECTION 6.5 - INVESTMENT SALES (Rows 66-70)
            # ============================================
            print("\n" + "="*60)
            print("SECTION 6.5 - INVESTMENT SALES")
            print("="*60)

            print("\nRows 66-70: Testing resale features...")
            # Check portfolio for sell/resale options
            page.goto('http://localhost:3000/versotech_main/portfolio')
            page.wait_for_load_state('networkidle')
            page.wait_for_timeout(1000)

            portfolio_content = page.content()
            sell_btn = page.locator('button:has-text("Sell"), button:has-text("Resale"), button:has-text("Transfer"), a:has-text("Sell")')
            results['6.5_sales']['row66_sell_option'] = sell_btn.count() > 0 or 'sell' in portfolio_content.lower() or 'resale' in portfolio_content.lower()
            print(f"  Sell/resale option: {results['6.5_sales']['row66_sell_option']}")

            # Check for secondary market
            page.goto('http://localhost:3000/versotech_main/secondary-market')
            page.wait_for_load_state('networkidle')
            page.wait_for_timeout(1000)
            page.screenshot(path=f'{SCREENSHOTS_DIR}/6.5_01_secondary_market.png', full_page=True)

            secondary_content = page.content()
            results['6.5_sales']['row66_70_secondary_market'] = 'Secondary' in secondary_content or 'Market' in secondary_content or 'Resale' in secondary_content
            print(f"  Secondary market page: {results['6.5_sales']['row66_70_secondary_market']}")

            # ============================================
            # SECTION 6.6 - MY INTRODUCTIONS (Already tested)
            # ============================================
            print("\n" + "="*60)
            print("SECTION 6.6 - MY INTRODUCTIONS (Quick verify)")
            print("="*60)

            page.goto('http://localhost:3000/versotech_main/introductions')
            page.wait_for_load_state('networkidle')
            page.wait_for_timeout(1000)

            intro_content = page.content()
            results['6.6_introductions']['page_accessible'] = 'Introduction' in intro_content
            results['6.6_introductions']['data_visible'] = 'test.investor' in intro_content or page.locator('table tbody tr').count() > 0
            print(f"  Introductions page: {results['6.6_introductions']['page_accessible']}")
            print(f"  Data visible: {results['6.6_introductions']['data_visible']}")

            # ============================================
            # SECTION 6.7 - GDPR (Already tested)
            # ============================================
            print("\n" + "="*60)
            print("SECTION 6.7 - GDPR (Quick verify)")
            print("="*60)

            page.goto('http://localhost:3000/versotech_main/introducer-profile')
            page.wait_for_load_state('networkidle')

            # Click preferences tab
            prefs_tab = page.locator('button:has-text("Preferences"), [role="tab"]:has-text("Preferences")')
            if prefs_tab.count() > 0:
                prefs_tab.first.click()
                page.wait_for_timeout(500)

            gdpr_content = page.content()
            results['6.7_gdpr']['export_data'] = 'Export' in gdpr_content
            results['6.7_gdpr']['delete_account'] = 'Delete' in gdpr_content or 'Deletion' in gdpr_content
            results['6.7_gdpr']['privacy_controls'] = 'Privacy' in gdpr_content or 'GDPR' in gdpr_content or 'Data' in gdpr_content
            print(f"  Export data: {results['6.7_gdpr']['export_data']}")
            print(f"  Delete account: {results['6.7_gdpr']['delete_account']}")
            print(f"  Privacy controls: {results['6.7_gdpr']['privacy_controls']}")

            # ============================================
            # FINAL SUMMARY
            # ============================================
            print("\n" + "="*60)
            print("FINAL SUMMARY - ALL SECTIONS")
            print("="*60)

            for section, tests in results.items():
                passed = sum(1 for v in tests.values() if v)
                total = len(tests)
                pct = (passed/total*100) if total > 0 else 0
                print(f"\n{section}: {passed}/{total} ({pct:.0f}%)")
                for test, result in tests.items():
                    status = "[PASS]" if result else "[FAIL]"
                    print(f"  {status} {test}")

            print(f"\nScreenshots saved to: {SCREENSHOTS_DIR}")

            # Save results to JSON
            with open(f'{SCREENSHOTS_DIR}/test_results.json', 'w') as f:
                json.dump(results, f, indent=2)

        except Exception as e:
            print(f"\n[ERROR]: {str(e)}")
            page.screenshot(path=f'{SCREENSHOTS_DIR}/error_state.png', full_page=True)
            raise
        finally:
            browser.close()

    return results

if __name__ == '__main__':
    test_all_sections()
