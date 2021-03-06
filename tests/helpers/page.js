const puppeteer = require('puppeteer');
const sessionFactory = require('../factories/sessionFactory');
const userFactory = require('../factories/userFactory');

class CustomPage {
    static async build() {
        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox']
        });

        const page = await browser.newPage();
        const customPage = new CustomPage(page);

        return new Proxy(customPage, {
            get: function(target, property) {
                // browser[property] is added for .newPage() and .close() properties mostly
                // browser[property] is before page to give the priority to browser.close() over page.close()
                // see puppeteer api docs
                return customPage[property] || browser[property] || page[property];
            }
        });
    }

    constructor(page) {
        this.page = page;
    }

    async login() {

        const user = await userFactory();
        const {session, sig} = sessionFactory(user);
    
        // pretend the user is logged in
        await this.setCookie({
            name: "session",
            value: session
        }, {
            name: "session.sig",
            value: sig
        });
    
        // refresh the page
        await this.goto('http://localhost:3000/blogs');
    
        // Next pause seemed to be NOT NEEDED, until test started using mongoose
        await this.waitFor('a[href="/auth/logout"]');
    }

    async getContentsOf(selector) {
        return await this.page.$eval(selector, el => el.innerHTML);
    }

    get(path) {
        return this.evaluate( (_path) => {
            return fetch(_path, {
                method: 'GET',
                credentials: 'same-origin',
                headers: {
                    'Content-Type': 'application/json'
                }
            }).then(res => res.json());
        }, path);
    }

    post(path, body) {
        return this.evaluate( (_path, _body) => {
            return fetch(_path, {
                method: 'POST',
                credentials: 'same-origin',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(_body)
            }).then(res => res.json());
        }, path, body);
    }
}

module.exports = CustomPage;
