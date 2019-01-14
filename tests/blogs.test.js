const Page = require('./helpers/page');

let page;

beforeEach(async () => {
    page = await Page.build();
    await page.goto('http://localhost:3000');
});

afterEach(async () => {
    await page.close();
});

describe('When logged in', async () => {

    beforeEach(async () => {
        await page.login();
        await page.click('a.btn-floating');
    });

    it('can see blog create form', async () => {
        const label = await page.getContentsOf('form label');
        expect(label).toEqual('Blog Title');
    });

    describe('And using invalid inputs', async () => {

        beforeEach(async () => {
            await page.click('form button');
        });

        it('the form shows an error message', async () => {
            const titleError = await page.getContentsOf('.title .red-text');
            const contentError = await page.getContentsOf('.content .red-text');

            expect(titleError).toEqual('You must provide a value');
            expect(contentError).toEqual('You must provide a value');
        });
    });

    describe('And using valid inputs', async () => {

        beforeEach(async () => {
            await page.type('.title input', 'My Test Title');
            await page.type('.content input', 'My Test Content');
            await page.click('form button');
        });

        it('Submitting takes user to review screen', async () => {
            const text = await page.getContentsOf('h5');
            expect(text).toEqual('Please confirm your entries');
        });

        it('Submitting then saving adds blog to index page', async () => {
            await page.click('button.green');
            await page.waitFor('.card');
            const postTitle = await page.getContentsOf('.card-title');
            const postContent = await page.getContentsOf('p');

            expect(postTitle).toEqual('My Test Title');
            expect(postContent).toEqual('My Test Content');
        });

    });

});

describe('User is not logged in', async () => {

    it('User cannot create blog posts', async () => {
        const result = await page.evaluate( () => {
            return fetch('/api/blogs', {
                method: 'POST',
                credentials: 'same-origin',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({title: 'My Title', content: 'My Content'})
            }).then(res => res.json());
        });
        //console.log(result);
        //console.log(typeof(result));
        expect(result).toEqual({error: 'You must log in!'});
    });

    test('User cannot get a list of posts', async () => {
        const result = await page.evaluate( () => {
            return fetch('/api/blogs', {
                method: 'GET',
                credentials: 'same-origin',
                headers: {
                    'Content-Type': 'application/json'
                }
            }).then(res => res.json());
        });
        expect(result).toEqual({error: 'You must log in!'});
    });
});
