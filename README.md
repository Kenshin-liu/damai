###
 死循环大麦抢票，不抢到不停下，抢到了也不停下

 ###
config配置

| 配置项    | 介绍                  | 类型   | 是否必填 | 默认值 |
|-----------|-----------------------|--------|----------|--------|
| pageUrl   | 抢票url，自行选择城市 | string | 是       | ---    |
| perform   | 抢票日期              | array  | 是       | ---    |
| level     | 抢票价位              | array  | 是       | ---    |
| count     | 票数                  | number | 是       | 4      |
| processes | 抢票日期              | number | 是       | ---    |
| timeout   | 操作超时时间          | number | 否       | 300000 |
| userInfo  | 大麦账号密码，自行填  | object | 是       | ---    |