const puppeteer = require('puppeteer');
const terminalImage = require('terminal-image');

const URL = process.env.URL || 'http://localhost:20041/best-electric-scooters';
const DATASET = process.env.DATASET || 'buyclick-url';
const SCREENSHOTS = process.argv.includes('--screenshots');

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setViewport({
        width: 1028,
        height: 800,
    });


    await page.goto(URL);

    const appSelector = '#app';
    await page.waitForSelector(appSelector);

    // Extract the exit urls
    const exitUrls = await page.evaluate((DATASET) => {
        const snakeToCamel = str => str.replace(/([-_]\w)/g, g => g[1].toUpperCase());
        const elements = Array.from(document.querySelectorAll(`[data-${DATASET}]`));
        return elements.map(el => {
            return el.dataset[snakeToCamel(DATASET)];
        });
    }, DATASET);

    let missingParams = 0;
    exitUrls.forEach(url => {
        console.log(`Checking ${url}`);
        const params = new URLSearchParams(url);
        for (const [key, value] of params.entries()) {
            if (key && key != 'wm') {
                console.assert(Boolean(value), `${key} is empty`);
                missingParams = value ? missingParams : missingParams + 1;
            }
        }
    })
    console.log(`There are ${exitUrls.length} buy urls set`);
    console.log(`There are ${missingParams} missing params`);

    if (SCREENSHOTS) {
        let imgBuff = await page.screenshot({
            fullPage: false
        });
        console.log(await terminalImage.buffer(imgBuff, {
            height: 800
        }));
    }

    await browser.close();
})();