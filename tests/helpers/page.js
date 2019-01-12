const puppeteer = require('puppeteer');
const sessionFactory = require('../factories/sessionFactory');
const userFactory = require('../factories/userFactory');

class CustomPage {
    static async build() {
        const browser = await puppeteer.launch({
            headless: false
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
        await this.goto('http://localhost:3000');
    
        // Next pause seems to be NOT NEEDED 
        //await this.waitFor('a[href="/auth/logout"]');
    }
}

module.exports = CustomPage;
