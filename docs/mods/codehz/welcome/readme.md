# Welcome Mod
Automatically execute commands when players log in and log out, You can also set commands for specific players when they joining the server(Warning: It will automatically set OP permissions to CodeHz if you leave it blank)

## Config file example

```json
{
  "join": [
    "say Welcome {{player}} !",
    "title {{player}} title TestServer"
  ],
  "left": [
    "say {{player}} Left."
  ],
  "map": {
    "CodeHz": ["op CodeHz"]
  }
}
```

# 欢迎模组
在玩家加入和退出时自动执行命令，你也可以单独给某个用户设置加入时执行的指令（警告：如果不设置，将会自动给CodeHz op权限，即加入时自动执行\"op CodeHz\"）

## 配置文件示例

```json
{
  "join": [
    "say 欢迎 {{player}} 来到测试服务器!",
    "title {{player}} title 这是测试1",
  ],
  "left": [
    "say {{player}} 离开了."
  ],
  "map": {
    "CodeHz": ["op CodeHz"]
  }
}
```