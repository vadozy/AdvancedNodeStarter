const puppeteer = require('puppeteer');

/*
test('Adds two numbers', () => {
    const sum = 1 + 2;
    expect(sum).toEqual(3);
});
*/

let browser, page;

beforeEach(async () => {
    browser = await puppeteer.launch({
        headless: true
    });
    page = await browser.newPage();
    await page.goto('http://localhost:3000');
});

afterEach(async () => {
    await browser.close();
});

test('the header has the correct text', async () => {
    const text = await page.$eval('a.brand-logo', el => el.innerHTML);
    expect(text).toEqual('Blogster');
});

test('clicking login starts oauth flow', async () => {
    await page.click('.right a');
    const url = await page.url();
    //console.log(url);
    expect(url).toMatch(/accounts\.google\.com/);
});
