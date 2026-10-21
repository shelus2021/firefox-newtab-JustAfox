# 仅仅小狐狸 / Just a fox

一个轻量、离线运行的 Firefox 新标签页扩展。页面只保留一只会追逐光标的小狐狸；当光标移动得足够快，就能落到它身上并点击互动。

![仅仅小狐狸预览](screenshots/1.png)

## 功能

- 页面没有文字、卡片或装饰背景，只显示小狐狸
- 标签页使用“新标签页”标题和 Firefox 内置的默认品牌图标
- 小狐狸采用橙红、紫色渐变的 Firefox 风格造型，主体为连续的一体化外轮廓
- 完全离线，不申请权限、不读取浏览数据、不连接网络
- 尊重系统的“减少动态效果”设置

## 项目结构

```text
.
├─ manifest.json
├─ _locales/
│  ├─ en/messages.json
│  └─ zh_CN/messages.json
├─ icons/
│  ├─ fox.svg
│  └─ firefox-newtab.png
├─ screenshots/
│  └─ 1.png
└─ newtab/
   ├─ newtab.html
   ├─ newtab.css
   └─ newtab.js
```

## 隐私

扩展没有申请任何浏览器权限。所有页面、绘图和互动逻辑都包含在扩展本地，不发送或保存任何数据。

## 声明

本扩展完全由 AI 生成，包括代码、小狐狸的形象与动作等；创建者仅进行了缺陷完善。

Copyright © 2026 shelus2021. All Rights Reserved.
