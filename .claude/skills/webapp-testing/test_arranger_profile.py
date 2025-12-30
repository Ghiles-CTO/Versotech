"""
Test script to debug arranger profile issues:
1. Elastic/stretched layout
2. Signature canvas drawing not visible
"""
from playwright.sync_api import sync_playwright
import time

def test_arranger_profile():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={'width': 1920, 'height': 1080})
        page = context.new_page()

        # Capture console errors
        console_errors = []
        page.on('console', lambda msg: console_errors.append(f"[{msg.type}] {msg.text}") if msg.type in ['error', 'warning'] else None)

        print("Navigating to arranger profile...")
        page.goto('http://localhost:3000/versotech_main/arranger-profile')
        page.wait_for_load_state('networkidle')
        time.sleep(2)

        # Screenshot 1: Full page to see layout issues
        print("Taking screenshot of full page layout...")
        page.screenshot(path='/tmp/arranger_profile_full.png', full_page=True)
        print("Saved: /tmp/arranger_profile_full.png")

        # Check if we're on a login page or the actual profile
        page_title = page.title()
        page_url = page.url
        print(f"Page title: {page_title}")
        print(f"Current URL: {page_url}")

        # Try to find tabs
        tabs = page.locator('[role="tablist"] button, [role="tab"]').all()
        print(f"Found {len(tabs)} tabs")
        for i, tab in enumerate(tabs):
            try:
                text = tab.inner_text()
                print(f"  Tab {i}: {text}")
            except:
                pass

        # Look for Signature tab and click it
        signature_tab = page.locator('button:has-text("Signature"), [role="tab"]:has-text("Signature")').first
        if signature_tab.is_visible():
            print("Clicking Signature tab...")
            signature_tab.click()
            time.sleep(1)

            # Screenshot 3: Signature tab content
            page.screenshot(path='/tmp/arranger_signature_tab.png', full_page=True)
            print("Saved: /tmp/arranger_signature_tab.png")

            # Find the canvas
            canvas = page.locator('canvas').first
            if canvas.is_visible():
                print("Canvas found!")

                # Get canvas bounding box
                box = canvas.bounding_box()
                print(f"Canvas dimensions: {box}")

                # Get canvas computed styles
                styles = page.evaluate('''() => {
                    const canvas = document.querySelector('canvas');
                    if (!canvas) return null;
                    const style = window.getComputedStyle(canvas);
                    return {
                        width: style.width,
                        height: style.height,
                        backgroundColor: style.backgroundColor,
                        border: style.border
                    };
                }''')
                print(f"Canvas styles: {styles}")

                # Check canvas internal dimensions
                canvas_info = page.evaluate('''() => {
                    const canvas = document.querySelector('canvas');
                    if (!canvas) return null;
                    const ctx = canvas.getContext('2d');
                    return {
                        canvasWidth: canvas.width,
                        canvasHeight: canvas.height,
                        cssWidth: canvas.style.width,
                        cssHeight: canvas.style.height,
                        fillStyle: ctx.fillStyle,
                        strokeStyle: ctx.strokeStyle,
                        lineWidth: ctx.lineWidth,
                        devicePixelRatio: window.devicePixelRatio
                    };
                }''')
                print(f"Canvas internal info: {canvas_info}")

                # Try to draw on the canvas
                print("Attempting to draw on canvas...")
                if box:
                    start_x = box['x'] + 50
                    start_y = box['y'] + 50

                    # Simulate drawing
                    page.mouse.move(start_x, start_y)
                    page.mouse.down()
                    for i in range(10):
                        page.mouse.move(start_x + i * 10, start_y + i * 5)
                        time.sleep(0.05)
                    page.mouse.up()

                    time.sleep(0.5)

                    # Screenshot after drawing
                    page.screenshot(path='/tmp/arranger_signature_after_draw.png', full_page=True)
                    print("Saved: /tmp/arranger_signature_after_draw.png")

                    # Check if canvas has any drawn content
                    has_content = page.evaluate('''() => {
                        const canvas = document.querySelector('canvas');
                        if (!canvas) return false;
                        const ctx = canvas.getContext('2d');
                        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                        // Check if any pixels are not white/transparent
                        for (let i = 0; i < imageData.data.length; i += 4) {
                            const r = imageData.data[i];
                            const g = imageData.data[i + 1];
                            const b = imageData.data[i + 2];
                            const a = imageData.data[i + 3];
                            if (a > 0 && (r < 250 || g < 250 || b < 250)) {
                                return true;
                            }
                        }
                        return false;
                    }''')
                    print(f"Canvas has drawn content: {has_content}")
            else:
                print("Canvas not found!")
        else:
            print("Signature tab not found!")

        # Check for layout issues
        layout_info = page.evaluate('''() => {
            const body = document.body;
            const main = document.querySelector('main');
            const tabsContent = document.querySelector('[role="tabpanel"]');
            return {
                bodyWidth: body.scrollWidth,
                viewportWidth: window.innerWidth,
                hasHorizontalScroll: body.scrollWidth > window.innerWidth,
                mainWidth: main ? main.offsetWidth : null,
                tabsContentWidth: tabsContent ? tabsContent.offsetWidth : null
            };
        }''')
        print(f"Layout info: {layout_info}")

        if console_errors:
            print("\nConsole errors/warnings:")
            for error in console_errors:
                print(f"  {error}")

        browser.close()

if __name__ == '__main__':
    test_arranger_profile()
