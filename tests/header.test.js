const Page = require('./helpers/page');

test('Adds two numbers', () => {
    const sum = 1 + 2;
    expect(sum).toEqual(3);
});

let page;

beforeEach(async () => {
    page = await Page.build();
    await page.goto('http://localhost:3000');
});

afterEach(async () => {
    await page.close();
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

// it === test
it('When signed in, shows logout button', async () => {
    await page.login();
    const text = await page.$eval('a[href="/auth/logout"]', el => el.innerHTML);
    expect(text).toEqual('Logout');
});
