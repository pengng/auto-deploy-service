# auto-deploy-service
自动部署服务。用于搭配`webhook`使用，当`push`新的`commit`到仓库时，服务端自动部署最新代码。

### 使用说明

```shell
npm install -g auto-deploy-service
---
auto-deploy-service -C config.json
```

### 配置文件参数

| 名称 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| port | Number | 是 | 指定服务启动使用的端口号，默认为4000。 |
| repository | Array | 是 | 指定管理的子项目。 |


##### repository 数组

| 名称 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| dir | String | 是 | 项目的根目录路径。 |
| token | String | 是 | Webhook的token。 |

##### config.json 示例

```json
{
  "port": 3399,
  "repository": [
    {
      "dir": "/home/project/xxx",
      "token": "xxx"
    }
  ]
}
```