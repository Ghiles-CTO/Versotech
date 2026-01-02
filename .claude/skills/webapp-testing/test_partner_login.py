"""
Partner Persona Login Test
Navigate to login page and authenticate as Partner user
"""
from playwright.sync_api import sync_playwright
import os

# Ensure screenshots directory exists
os.makedirs('screenshots', exist_ok=True)

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={'width': 1920, 'height': 1080})

    # Navigate to login page
    print("Navigating to login page...")
    page.goto('http://localhost:3000/versotech_main/login')
    page.wait_for_load_state('networkidle')
    page.screenshot(path='screenshots/01_login_page.png', full_page=True)
    print("Screenshot: 01_login_page.png")

    # Fill in credentials
    print("Filling in Partner credentials...")
    page.fill('input[type="email"], input[name="email"]', 'cto@verso-operation.com')
    page.fill('input[type="password"], input[name="password"]', 'VersoPartner2024!')
    page.screenshot(path='screenshots/02_credentials_filled.png', full_page=True)
    print("Screenshot: 02_credentials_filled.png")

    # Click login button
    print("Clicking login button...")
    page.click('button[type="submit"]')

    # Wait for navigation after login
    page.wait_for_load_state('networkidle')
    page.wait_for_timeout(2000)  # Extra wait for redirect

    # Take screenshot of dashboard/landing page
    page.screenshot(path='screenshots/03_after_login.png', full_page=True)
    print("Screenshot: 03_after_login.png")

    # Check current URL to verify login success
    current_url = page.url
    print(f"Current URL after login: {current_url}")

    # Check if we're on the dashboard or if there's an error
    if 'dashboard' in current_url or 'versotech_main' in current_url:
        print("LOGIN SUCCESS: Redirected to application")
    elif 'login' in current_url:
        # Check for error messages
        error_el = page.locator('.text-red-500, .text-destructive, [role="alert"]').first
        if error_el.is_visible():
            print(f"LOGIN FAILED: {error_el.text_content()}")
        else:
            print("LOGIN PENDING: Still on login page")

    # Take one more screenshot after settling
    page.wait_for_timeout(1000)
    page.screenshot(path='screenshots/04_final_state.png', full_page=True)
    print("Screenshot: 04_final_state.png")

    browser.close()
    print("Browser closed. Check screenshots folder for results.")
