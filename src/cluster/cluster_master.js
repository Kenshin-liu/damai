const chalk = require('chalk');
const cluster = require('cluster');

const { getCookies } = require('../service/getCookies');
const config = require('../../config');
let numCPUs = config.processes || require('os').cpus().length;

module.exports = async () => {
    let daMaiCookies = await getCookies().catch(error => {
        console.log('error: ', error);
    })

    for (let i = 1; i <= numCPUs; i++) {
        // 分发 Cookies 至 Cluster
        cluster.fork({
            daMaiCookies: JSON.stringify(daMaiCookies)
        });
    }

    cluster.on('exit', (worker) => {
        console.log(`worker #${worker.id} PID:${worker.process.pid} died`);
    });

    cluster.on('error', (err) => {
        console.log(`worker #${worker.id} PID ERROR: `, err);
    });
};