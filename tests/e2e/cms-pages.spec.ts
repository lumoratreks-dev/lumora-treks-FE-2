import { expect, test } from "@playwright/test";

const packagePath = "/packages/journey-to-fish-lake/zrofs";

async function expectNoHorizontalOverflow(page: import("@playwright/test").Page) {
  const audit = await page.evaluate(() => {
    const viewport = document.documentElement.clientWidth;
    return {
      viewport,
      content: document.documentElement.scrollWidth,
      offenders: [...document.querySelectorAll<HTMLElement>("body *")]
        .map((element) => {
          const rect = element.getBoundingClientRect();
          return {
            tag: element.tagName.toLowerCase(),
            className: element.className?.toString().slice(0, 160),
            left: Math.round(rect.left),
            right: Math.round(rect.right),
            width: Math.round(rect.width),
          };
        })
        .filter((element) => element.left < -1 || element.right > viewport + 1)
        .slice(0, 12),
    };
  });
  expect(audit.content, JSON.stringify(audit.offenders, null, 2)).toBeLessThanOrEqual(
    audit.viewport + 1
  );
}

test("package page renders CMS screens and whole-number group pricing", async ({ page }) => {
  await page.goto(packagePath);

  await expect(page.getByRole("heading", { level: 1, name: "Journey to fish lake" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "What’s included" })).toBeVisible();
  await page.getByRole("button", { name: "Pricing details" }).click();

  const dialog = page.getByRole("dialog", { name: "Pricing Details" });
  await expect(dialog).toBeVisible();
  await expect(dialog.locator("li")).toHaveCount(4);
  await expect(dialog).toContainText("Group of 1 person");
  await expect(dialog).toContainText("USD 400");
  await expect(dialog).toContainText("USD 320");
  await expect(dialog).not.toContainText(".00");

  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expectNoHorizontalOverflow(page);
});

test("blog post renders its Wagtail-managed article screens", async ({ page }) => {
  await page.goto("/blog/annapurna-the-case-for-going-slow");

  await expect(
    page.getByRole("heading", { level: 1, name: "Annapurna: The Case for Going Slow" })
  ).toBeVisible();
  await expect(page.getByRole("heading", { name: "Keep reading" })).toBeVisible();
  await expect(page.getByRole("heading", { name: /Create memories/ })).toBeVisible();
  await expectNoHorizontalOverflow(page);
});

test("checkout does not invent a rating", async ({ page }) => {
  await page.goto("/checkout");

  await expect(page.getByText("UNESCO Heritage Site & Lumbini Sightseeing")).toBeVisible();
  await expect(page.locator('[aria-label$="out of 5 stars"]')).toHaveCount(0);
  await expectNoHorizontalOverflow(page);
});
