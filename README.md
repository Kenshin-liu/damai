### 介绍

 死循环大麦抢票，不抢到不停下，抢到了也不停下来

### 开始

```
在项目根目录下
npm i -D
puppeteer安装不下来使用
npm i -D --registry=https://registry.npm.taobao.org
配置好参数
npm run start
```

### config配置

配置文件位置：/config/index.js
建议processes配置小一点

| 配置项    | 介绍                  | 类型   | 是否必填 | 默认值          |
|-----------|-----------------------|--------|----------|-----------------|
| pageUrl   | 抢票url，自行选择城市 | string | 是       | ---             |
| perform   | 抢票日期              | array  | 是       | ---             |
| level     | 抢票价位              | array  | 是       | ---             |
| count     | 票数,不能大于6        | number | 是       | 4               |
| processes | 进程数                | number | 是       | 运行机器cpu核数 |
| timeout   | 操作超时时间          | number | 否       | 300000          |
| userInfo  | 大麦账号密码，自行填  | object | 是       | ---             |