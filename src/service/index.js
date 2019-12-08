const fs = require('fs');
const chalk = require('chalk');
const puppeteer = require('puppeteer');
const config = require('../../config');

const preloadPath = `${process.cwd()}/config/preload.js`;
const preloadFile = fs.readFileSync(preloadPath, 'utf8');
const loginUrl = 'https://passport.damai.cn/login';

async function getCookies() {
    return new Promise(async (resolve, reject) => {
        const browser = await puppeteer.launch({
            timeout: 10000,
            ignoreHTTPSErrors: true,
            devtools: true,
            headless: false
        })

        try {
            const page = await browser.newPage()
            await page.evaluateOnNewDocument(preloadFile);
            await page.setViewport({ width: 1920, height: 1080 });
            await page.goto(loginUrl)

            const loginIframe = await page.frames().find(f => f.name() === 'alibaba-login-box');
            await loginIframe.waitFor('#fm-login-id');

            // await loginIframe.click("#login-tabs", { button: 'right', clickCount: 3, delay: 400 }) //模拟点击登录
            // 输入账号
            await loginIframe.$eval('#fm-login-id', (input, config) => {
                input.value = config.userInfo.username
            }, config);

            // 输入密码
            await loginIframe.$eval('#fm-login-password', (input, config) => {
                input.value = config.userInfo.password
            }, config);

            await loginIframe.click("button[type=submit]", { clickCount: 4, delay: 400 }) //模拟点击登录
            await page.waitFor(800);

            if (page.url() === loginUrl) {
                console.log(chalk.red(`------------需要滑块验证------------`));
                // 获取ifame的位置
                const loginIframeRect = await page.evaluate(() => {
                    let frame = document.getElementById('alibaba-login-box')
                    const { top, left, bottom, right } = frame.getBoundingClientRect();
                    return { top, left, bottom, right }
                })

                let slidingBlockRect = {}
                slidingBlockRect = await loginIframe.$eval('#nocaptcha-password', ele => {
                    const { top, left, bottom, right } = ele.getBoundingClientRect();
                    return { top, left, bottom, right }
                });

                const start = {
                    x: loginIframeRect.left + slidingBlockRect.left,
                    y: loginIframeRect.top + slidingBlockRect.top
                }

                const end = {
                    x: start.x + 800,
                    y: loginIframeRect.top + slidingBlockRect.top
                }

                await slidingBlockVerify(page, start, end)
                await page.waitFor(250);
                await loginIframe.click("button[type=submit]", { clickCount: 4, delay: 400 }) //模拟点击登录
            }

            await page.waitFor(300);
            let cookies = await page.cookies();
            if (cookies.length > 6) {
                console.log('------------登录成功------------');
                resolve(cookies);
                await browser.close();
            } else {
                console.log('------------登录失败------------');
                resolve(cookies);
                reject('登录失败')
                await browser.close();
            }
        } catch (error) {
            reject(error)
            await browser.close();
        }
    })
}

async function slidingBlockVerify(page, start, end) {
    return new Promise(async (resolve, reject) => {
        try {
            var start_time = new Date().getTime();
            const mouse = page.mouse;
            await mouse.move(start.x, start.y);
            await mouse.down()
            await mouse.move(end.x, end.y, { steps: 25 })
            await mouse.up();
            console.log('滑块验证时间：', new Date().getTime() - start_time)
            resolve()
        } catch (error) {
            reject(error)
        }
    })
}

module.exports = {
    getCookies
}
