/**
 * 设置damai的cookies
 * @param {time} Number
 */
async function setCookies(page, cookies) {
    return new Promise(async (resolve, reject) => {
        try {
            await page.setCookie(...cookies);
            resolve()
        } catch (error) {
            reject(error)
        }
    })
}

async function clickBySelector(page, selector) {
    return new Promise(async (resolve, reject) => {
        try {
            const point = await page.evaluate(selector => {
                let ele = document.querySelector(selector);
                document.body.scroll(0, ele.offsetTop - 200);
                let rect = ele && ele.getBoundingClientRect() || {};
                let x = rect.left + rect.width / 2;
                let y = rect.top + rect.height / 2
                return { x, y }
            }, selector)
            await page.mouse.click(point.x || 0, point.y || 0);
            await page.waitFor(100);
            resolve()
        } catch (error) {
            reject(error)
        }
    })
}

module.exports = {
    setCookies,
    clickBySelector
}