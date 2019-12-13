const fs = require('fs');
const chalk = require('chalk');
const cluster = require('cluster');
const puppeteer = require('puppeteer');

const config = require('../../config');
const { setCookies } = require('../util');
const { selectTicket } = require('../service/selectTicket');
const preloadPath = `${process.cwd()}/config/preload.js`;
const preloadFile = fs.readFileSync(preloadPath, 'utf8');

// 禁止直接启动
if (cluster.isMaster) {
    console.log('不允许直接启动子进程');
    process.exit(0);
}

module.exports = async () => {
    try {
        const envDaMaiCookies = process.env.daMaiCookies;
        if (!envDaMaiCookies) {
            console.log('登录失败，不执行抢票');
            process.exit(0);
        }

        let daMaiCookies = JSON.parse(envDaMaiCookies);

        const browser = await puppeteer.launch({
            ignoreHTTPSErrors: true,
            devtools: false,
            headless: false
        })

        const page = await browser.newPage();
        await page.setDefaultTimeout(config.timeout || 30000);

        // 模拟大麦网抢票高峰期慢网速
        // let cdp = await page.target().createCDPSession();
        // await cdp.send('Network.emulateNetworkConditions', {
        //     'offline': false,
        //     'downloadThroughput': 25 * 1024,
        //     'uploadThroughput': 8 * 1024,
        //     'latency': 0
        // });

        await page.evaluateOnNewDocument(preloadFile);
        await page.setViewport({ width: 1920, height: 1080 });

        await setCookies(page, daMaiCookies);
        await selectTicket(page);
    } catch (error) {
        console.log('cluster_worker error: ', error);
    }
};