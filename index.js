const puppeteer = require('puppeteer');
const terminalImage = require('terminal-image');
const URL = process.env.URL || 'http://localhost:20041/best-electric-scooters';
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

    const resultsSelector = '[data-buyclick-url]';

    // Extract the exit urls
    const exitUrls = await page.evaluate(resultsSelector => {
        const elements = Array.from(document.querySelectorAll(resultsSelector));
        return elements.map(el => {
            return el.dataset.buyclickUrl
        });
    }, resultsSelector);

    console.log(exitUrls.join('\n'));

    console.log(`There are ${exitUrls.length} buy urls set`);

    if (SCREENSHOTS) {
        let imgBuff = await page.screenshot({
            fullPage: false
        });
        console.log(await terminalImage.buffer(imgBuff, {
            height: 400
        }));
    }

    await browser.close();
})();