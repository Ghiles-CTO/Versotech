import { chromium, Page, BrowserContext } from "@playwright/test";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = "http://localhost:3000";
const RECORDINGS_DIR = path.join(__dirname, "../public/recordings");

// Action types for realistic interactions
type Action =
  | { type: "wait"; ms: number }
  | { type: "hover"; selector: string }
  | { type: "click"; selector: string }
  | { type: "scroll"; duration: number; distance: number }
  | { type: "scrollToTop" }
  | { type: "scrollToElement"; selector: string };

// Pages with interaction sequences for realistic recordings
const PAGES: Array<{
  name: string;
  route: string;
  actions: Action[];
  duration: number;
}> = [
  {
    name: "dashboard",
    route: "/versotech_main/dashboard",
    actions: [
      { type: "wait", ms: 2000 },
      // Hover over activity items to show interactivity
      { type: "hover", selector: "[data-activity-item]:first-child, .activity-item:first-child, table tbody tr:first-child" },
      { type: "wait", ms: 500 },
      { type: "scroll", duration: 4000, distance: 600 },
      // Hover over chart area
      { type: "hover", selector: ".chart-container, [class*='chart'], canvas" },
      { type: "wait", ms: 800 },
      { type: "scroll", duration: 3000, distance: 500 },
      { type: "wait", ms: 1500 },
    ],
    duration: 12000,
  },
  {
    name: "deals",
    route: "/versotech_main/deals",
    actions: [
      { type: "wait", ms: 1500 },
      // Hover table rows to show selection states
      { type: "hover", selector: "table tbody tr:nth-child(2), [data-deal-row]:nth-child(2)" },
      { type: "wait", ms: 600 },
      { type: "hover", selector: "table tbody tr:nth-child(3), [data-deal-row]:nth-child(3)" },
      { type: "wait", ms: 400 },
      // Click on a deal row to potentially open modal/details
      { type: "click", selector: "table tbody tr:first-child td:first-child, [data-deal-row]:first-child" },
      { type: "wait", ms: 2000 },
      { type: "scroll", duration: 4000, distance: 800 },
      { type: "wait", ms: 1500 },
    ],
    duration: 12000,
  },
  {
    name: "investors",
    route: "/versotech_main/investors",
    actions: [
      { type: "wait", ms: 1500 },
      // Interact with search/filter if present
      { type: "hover", selector: "input[type='search'], input[placeholder*='search' i], [class*='search']" },
      { type: "wait", ms: 500 },
      // Hover over investor cards/rows
      { type: "hover", selector: "table tbody tr:nth-child(1), [data-investor]:first-child, .investor-card:first-child" },
      { type: "wait", ms: 600 },
      { type: "hover", selector: "table tbody tr:nth-child(2), [data-investor]:nth-child(2)" },
      { type: "wait", ms: 400 },
      { type: "scroll", duration: 5000, distance: 900 },
      { type: "wait", ms: 1500 },
    ],
    duration: 12000,
  },
  {
    name: "subscriptions",
    route: "/versotech_main/subscriptions",
    actions: [
      { type: "wait", ms: 1500 },
      // Hover over subscription rows
      { type: "hover", selector: "table tbody tr:nth-child(1)" },
      { type: "wait", ms: 500 },
      { type: "hover", selector: "table tbody tr:nth-child(2)" },
      { type: "wait", ms: 400 },
      // Look for status badges
      { type: "hover", selector: "[class*='badge'], [class*='status']" },
      { type: "wait", ms: 500 },
      { type: "scroll", duration: 4000, distance: 700 },
      { type: "wait", ms: 2000 },
    ],
    duration: 12000,
  },
  {
    name: "commissions",
    route: "/versotech_main/fees",
    actions: [
      { type: "wait", ms: 1500 },
      // Hover fee structure elements
      { type: "hover", selector: "table tbody tr:nth-child(1), [data-fee-row]:first-child" },
      { type: "wait", ms: 600 },
      { type: "hover", selector: "table tbody tr:nth-child(2)" },
      { type: "wait", ms: 400 },
      // Look for amount columns
      { type: "hover", selector: "[class*='amount'], td:last-child" },
      { type: "wait", ms: 500 },
      { type: "scroll", duration: 4000, distance: 800 },
      { type: "wait", ms: 2000 },
    ],
    duration: 12000,
  },
];

// Credentials
const EMAIL = "cto@versoholdings.com";
const PASSWORD = "123123";

async function login(page: Page) {
  console.log("🔐 Logging in...");
  await page.goto(`${BASE_URL}/login`);
  await page.waitForLoadState("networkidle");

  // Fill login form
  await page.fill('input[type="email"], input[name="email"]', EMAIL);
  await page.fill('input[type="password"], input[name="password"]', PASSWORD);

  // Submit form
  await page.click('button[type="submit"]');

  // Wait for navigation to complete
  await page.waitForURL(/versotech_main/, { timeout: 30000 });
  console.log("✅ Logged in successfully!");
}

async function smoothScroll(page: Page, durationMs: number, targetDistance: number) {
  const scrollHeight = await page.evaluate(() => {
    return document.documentElement.scrollHeight - window.innerHeight;
  });

  // Limit scroll to available height
  const distance = Math.min(targetDistance, scrollHeight);

  if (distance <= 0) {
    console.log("  ⚠️ Page has no scrollable content");
    return;
  }

  console.log(`  📜 Scrolling ${distance}px over ${durationMs}ms...`);

  const steps = 60;
  const stepDuration = durationMs / steps;

  for (let i = 0; i <= steps; i++) {
    const progress = i / steps;
    // Ease in-out for smooth feel
    const eased = progress < 0.5
      ? 2 * progress * progress
      : 1 - Math.pow(-2 * progress + 2, 2) / 2;

    const scrollY = Math.floor(distance * eased);

    await page.evaluate((y) => {
      window.scrollTo({ top: y, behavior: "instant" });
    }, scrollY);

    await page.waitForTimeout(stepDuration);
  }
}

async function executeAction(page: Page, action: Action) {
  try {
    switch (action.type) {
      case "wait":
        console.log(`  ⏳ Waiting ${action.ms}ms...`);
        await page.waitForTimeout(action.ms);
        break;

      case "hover":
        console.log(`  👆 Hovering: ${action.selector}`);
        // Try multiple selectors (comma-separated)
        const hoverSelectors = action.selector.split(",").map(s => s.trim());
        for (const selector of hoverSelectors) {
          try {
            const element = await page.$(selector);
            if (element) {
              await element.hover();
              break;
            }
          } catch {
            // Try next selector
          }
        }
        break;

      case "click":
        console.log(`  🖱️ Clicking: ${action.selector}`);
        const clickSelectors = action.selector.split(",").map(s => s.trim());
        for (const selector of clickSelectors) {
          try {
            const element = await page.$(selector);
            if (element) {
              await element.click();
              break;
            }
          } catch {
            // Try next selector
          }
        }
        break;

      case "scroll":
        await smoothScroll(page, action.duration, action.distance);
        break;

      case "scrollToTop":
        console.log("  ⬆️ Scrolling to top...");
        await page.evaluate(() => window.scrollTo(0, 0));
        break;

      case "scrollToElement":
        console.log(`  📍 Scrolling to: ${action.selector}`);
        try {
          await page.locator(action.selector).first().scrollIntoViewIfNeeded();
        } catch {
          console.log(`    ⚠️ Element not found: ${action.selector}`);
        }
        break;
    }
  } catch (error) {
    console.log(`  ⚠️ Action failed (continuing): ${error}`);
  }
}

async function recordPage(
  context: BrowserContext,
  pageConfig: typeof PAGES[0]
) {
  console.log(`\n📹 Recording: ${pageConfig.name}`);
  console.log(`  🎬 Duration: ${pageConfig.duration}ms`);
  console.log(`  📋 Actions: ${pageConfig.actions.length}`);

  const page = await context.newPage();

  try {
    // Navigate to the page
    await page.goto(`${BASE_URL}${pageConfig.route}`);
    await page.waitForLoadState("networkidle");

    // Initial wait for animations to settle
    await page.waitForTimeout(1000);

    // Start at top
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(500);

    // Execute all actions
    for (const action of pageConfig.actions) {
      await executeAction(page, action);
    }

    // Small buffer at end
    await page.waitForTimeout(500);

    console.log(`  ✅ Recording complete for ${pageConfig.name}`);
  } finally {
    await page.close();
  }
}

async function main() {
  console.log("🎬 VERSOTECH Premium Screen Recording Script (v4)");
  console.log("================================================");
  console.log("Recording REAL interactions (hover, click, scroll)\n");

  // Ensure recordings directory exists
  if (!fs.existsSync(RECORDINGS_DIR)) {
    fs.mkdirSync(RECORDINGS_DIR, { recursive: true });
  }

  const browser = await chromium.launch({
    headless: false, // Show browser for recording
  });

  // Create context with video recording enabled
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    recordVideo: {
      dir: RECORDINGS_DIR,
      size: { width: 1920, height: 1080 },
    },
    colorScheme: "dark", // Force dark mode
  });

  try {
    // Login first
    const loginPage = await context.newPage();
    await login(loginPage);
    await loginPage.close();

    // Record each page with interactions
    for (const pageConfig of PAGES) {
      await recordPage(context, pageConfig);
    }

    console.log("\n🎉 All recordings complete!");
    console.log(`📂 Videos saved to: ${RECORDINGS_DIR}`);

  } finally {
    await context.close();
    await browser.close();

    // Rename videos to match expected names
    console.log("\n📝 Processing video files...");
    const files = fs.readdirSync(RECORDINGS_DIR);

    // Playwright names videos with random UUIDs, we need to rename them
    const webmFiles = files
      .filter(f => f.endsWith(".webm"))
      .map(f => ({
        name: f,
        time: fs.statSync(path.join(RECORDINGS_DIR, f)).birthtimeMs
      }))
      .sort((a, b) => a.time - b.time);

    console.log(`  📁 Found ${webmFiles.length} WebM files`);

    // Skip the login video (first one) and rename the rest
    for (let i = 1; i < webmFiles.length && i <= PAGES.length; i++) {
      const oldPath = path.join(RECORDINGS_DIR, webmFiles[i].name);
      const newPath = path.join(RECORDINGS_DIR, `${PAGES[i - 1].name}.webm`);

      if (fs.existsSync(newPath)) {
        fs.unlinkSync(newPath);
      }
      fs.renameSync(oldPath, newPath);
      console.log(`  ✅ ${PAGES[i - 1].name}.webm`);
    }

    // Clean up the login video and any old PNG files
    if (webmFiles.length > 0) {
      const loginVideo = path.join(RECORDINGS_DIR, webmFiles[0].name);
      if (fs.existsSync(loginVideo)) {
        fs.unlinkSync(loginVideo);
        console.log("  🗑️ Removed login video");
      }
    }

    // Clean up old PNG scroll files if they exist
    const pngFiles = files.filter(f => f.endsWith(".png"));
    for (const png of pngFiles) {
      const pngPath = path.join(RECORDINGS_DIR, png);
      fs.unlinkSync(pngPath);
      console.log(`  🗑️ Removed old PNG: ${png}`);
    }

    console.log("\n✨ Ready for Remotion! Run: npm start");
  }
}

main().catch(console.error);
