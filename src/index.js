const fs = require('fs');
const cluster = require('cluster');

const chalk = require('chalk');
// 启动
(async () => {
    let run;
    if (cluster.isMaster) {
        run = require('./cluster/cluster_master');
    } else {
        run = require('./cluster/cluster_worker');
    }
    try {
        await run();
    } catch (e) {
        console.log(chalk.red(`发生错误: ${e} `));
    }
})();