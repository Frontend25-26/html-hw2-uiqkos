import { expect, test } from '@playwright/test'

test.beforeEach(async ({page}) => {
    await page.goto('/')
})

test('Количество семантических тегов больше 30', async ({page}) => {
    async function treeViewer(elem) {
        const total = new Set()

        const tagName = await elem.evaluate(el => el.tagName.toLowerCase())
        total.add(tagName)

        const children = await elem.locator('> *').all()
        for (const child of children) {
            const childTags = await treeViewer(child)
            childTags.forEach(tag => total.add(tag))
        }

        return total;
    }

    const set = await treeViewer(page.locator('body'))

    expect(set.size).toBeGreaterThan(30)
})

test('Подключение CSS', async ({page}) => {
    const cssLinks = await page.locator('link[rel="stylesheet"]').all();
    const hasStylesCSS = await Promise.all(
        cssLinks.map(async link => {
            const href = await link.getAttribute('href');
            return href?.includes('style.css');
        })
    );

    expect(hasStylesCSS.some(Boolean)).toBeTruthy();
});


test('Используются общие классы', async ({page}) => {
    const allElements = await page.locator('*').all();
    const classCounts = new Map<string, number>();

    for (const element of allElements) {
        const className = await element.getAttribute('class');
        if (className) {
            className.split(' ').forEach(cls => {
                classCounts.set(cls, (classCounts.get(cls) || 0) + 1);
            });
        }
    }

    const reusableClasses = Array.from(classCounts.entries()).filter(([_, count]) => count > 1);
    expect(reusableClasses.length).toBeGreaterThan(0);
});

test('Используются псевдоклассы', async ({page}) => {
    const stylesheetUrls = await page.evaluate(() => {
        const sheets = [];
        for (let i = 0; i < document.styleSheets.length; i++) {
            const sheet = document.styleSheets[i];
            if (sheet.href) {
                sheets.push(sheet.href);
            }
        }
        return sheets;
    });

    let hasPseudoClasses = false;

    for (const url of stylesheetUrls) {
        const response = await page.request.get(url);
        const cssText = await response.text();
        if (/:hover|:active|:focus/.test(cssText)) {
            hasPseudoClasses = true;
            break;
        }
    }

    expect(hasPseudoClasses).toBeTruthy();
});

test('Используются псевдоэлементы', async ({page}) => {
    const stylesheetUrls = await page.evaluate(() => {
        const sheets = [];
        for (let i = 0; i < document.styleSheets.length; i++) {
            const sheet = document.styleSheets[i];
            if (sheet.href) {
                sheets.push(sheet.href);
            }
        }
        return sheets;
    });

    let hasPseudoElements = false;

    for (const url of stylesheetUrls) {
        const response = await page.request.get(url);
        const cssText = await response.text();
        if (/::before|::after/.test(cssText)) {
            hasPseudoElements = true;
            break;
        }
    }

    expect(hasPseudoElements).toBeTruthy();
});
