const chalk = require('chalk');
const cluster = require('cluster');

const config = require('../../config');
const { clickBySelector } = require('../util');

let count = 1;

async function selectTicket(page) {
    return new Promise(async (resolve, reject) => {
        try {
            await page.goto(config.pageUrl)
            loadPage(page)
            resolve();
        } catch (error) {
            console.log(chalk.red(`workerId: ${cluster.worker.id}, 出现了某些问题，重新加载 ${error}`));
            await loadPage(page)
            reject(error)
        }
    })
}

async function loadPage(page) {
    return new Promise(async (resolve, reject) => {
        try {
            let url = page.url()
            if (url.includes('buy.damai.cn')) {
                // 订单页
                await page.waitForResponse(response => {
                    return response.url().includes('https://buy.damai.cn/multi/trans/adjustConfirmOrder') && response.status() === 200
                });
                await page.waitForSelector('input[type=checkbox]');
                console.log(chalk.blue(`workerId: ${cluster.worker.id}, ----------------------订单页加载完成，开始提交订单----------------------`));

                await page.click('input[type=checkbox]', { delay: 310 })
                //  等待服务端返回勾选成功
                await page.waitForResponse(response => {
                    return response.url().includes('https://buy.damai.cn/multi/trans/adjustConfirmOrder') && response.status() === 200
                });

                // 获取条款状态 没勾选就点上
                let clauseChecked = await page.$eval('.term-wrapper-top input[type=checkbox]', (input) => {
                    return input.checked
                });

                if (!clauseChecked) {
                    await clickBySelector(page, '.term-wrapper-top input[type=checkbox]');// 同意大麦网订票服务条款
                }
                console.log(chalk.green(`workerId: ${cluster.worker.id}, 已同意大麦网订票服务条款`));
                console.log(chalk.green(`workerId: ${cluster.worker.id}, 开始提交订单`));

                // await page.waitFor(1500);
                await page.click('.submit-wrapper .next-btn-medium', { delay: 310 })

                //  等待订单提交成功
                let response = await page.waitForResponse(response => {
                    return response.url().includes('https://buy.damai.cn/multi/trans/createOrder') && response.status() === 200
                });

                let responseJson = await response.json()

                let {
                    success,
                    resultMessage
                } = responseJson;

                if (success) {
                    console.log(chalk.green(`workerId: ${cluster.worker.id}, 订单提交成功赶紧去付款吧~~~~~`));
                } else {
                    console.log(chalk.red(`workerId: ${cluster.worker.id}, 提交订单失败原因-> ${resultMessage}`));
                    page.reload()
                    throw ('提交订单失败')
                }

            } else if (url.includes('detail.damai.cn')) {
                // 详情页
                await page.waitForSelector('.buybtn')
                let levelCanBuy = false;
                while (!levelCanBuy) {
                    await page.waitForSelector('.buybtn')
                    console.log(chalk.blue(`workerId: ${cluster.worker.id}, ----------------------详情页加载完成，开始选票----------------------`));
                    await clickByContent(page, config.perform);
                    levelCanBuy = await clickByContent(page, config.level);
                    console.log(chalk.green(`workerId: ${cluster.worker.id}, 第${count}次查询, 结果--------> ${levelCanBuy ? '有票' : '无票'}`));
                    const btnText = await page.$eval('.buybtn', (buybtn) => {
                        return buybtn.innerText
                    });
                    const isSubmit = '立即预订' === btnText
                    console.log(chalk.green(`workerId: ${cluster.worker.id}, 当前状态${isSubmit ? '可以提交' : '不能提交'}，原因是-------->`, chalk.red(`${btnText}`)));
                    if (!levelCanBuy || !isSubmit) await page.reload()
                    count++;
                }

                await selectTicketCount(page);
                await page.click(".buybtn", { clickCount: 1, delay: 400 }); // 点击提交订单
                loadPage(page)
            } else {
                console.log('其他莫名其妙的页面, 或者是订单已提交 尽快付款~~');
            }
        } catch (error) {
            console.log(chalk.red(`workerId: ${cluster.worker.id}, 出现了某些问题，重新加载 ${error}`));
            try {
                page.reload()
                loadPage(page)
            } catch (error) {
                loadPage(page)
            }
        }
    })
}

async function selectTicketCount(page) {
    return new Promise(async (resolve, reject) => {
        try {
            let currentCount = 1
            if (config.count > 6) {
                console.log('贪心了，配置票数大于6~~~~');
                config.count = 6
            }
            while (currentCount < config.count) {
                await clickBySelector(page, '.cafe-c-input-number-handler-up')
                currentCount = await page.$eval('.cafe-c-input-number-input', input => {
                    return input.value
                }, config);
            }
            resolve()
        } catch (error) {
            reject(error)
        }
    })
}

async function clickByContent(page, content) {
    return new Promise(async (resolve, reject) => {
        try {
            const point = await page.evaluate((content) => {
                let selectList = document.querySelectorAll('.select_right_list_item');
                let correctEle = null;
                let canBuy = false

                for (let i = 0; i < content.length; i++) {
                    let itemDetails = content[i];
                    selectList.forEach(ele => {
                        if (ele.innerText.includes(itemDetails)) {
                            correctEle = ele;
                            if (!ele.innerText.includes('无票') && !ele.innerText.includes('缺货')) canBuy = true
                        }
                    })
                    if (canBuy) break
                }
                let rect = correctEle && correctEle.getBoundingClientRect() || {};
                let x = rect.left + rect.width / 2;
                let y = rect.top + rect.height / 2
                return { x, y, canBuy }
            }, content)
            await page.mouse.click(point.x || 0, point.y || 0);
            await page.waitFor(100);
            resolve(point.canBuy)
        } catch (error) {
            reject(error)
        }
    })
}

module.exports = {
    selectTicket
}
