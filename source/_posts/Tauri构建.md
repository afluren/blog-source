---
title: Tauri构建
date: 2025-07-15 16:46:08
categories: 前端
tags: 
- 前端
- Tauri
- 学习笔记

katex: true
---
**首先是安装`Tauri`。**
```powershell
npm install -g @tauri-apps/cli
```

	因为`Tauri`内核使用Rust写的，所以也需要提前安装Rust的环境，可以参考相关文章，这里就不做详细叙述。
**然后是初始化`Tauri`**
```powershell
npx tauri init
```
这里是一些关于项目编译的选择，这里可以随便填，后续再在`Tauri`的配置文件中修改，当然你也可以根据后面的修改，在这里就提前正确填写。
**然后是修改`tauri.conf.json`**
将"build"的"frontendDist"、"devUrl"、"beforeDevCommand"和"beforeBuildCommand"字段根据项目的真实情况进行修改。这四个字段的含义分别是：
+ **frontendDist**：原项目构建时构建文件夹位置，我这里使用Vite进行构建，所以默认为`..Dist`
+ **devUrl**：原项目运行时产生的链接，Vite默认端口是5173，所以我这里填写的是`http://localhost:5173`
+ **beforeDevCommand**：原项目的运行指令，默认是`npm run dev`
+ **beforeBuildCommand**：原项目的构建指令，默认是`npm run build`
再然后就可以直接构建了，先构建项目前端，在用`Tauri`打包：
```powershell
npm run build
npx tauri build
```
	这里我怀疑只用写`npx tauri build`就行，因为似乎这个指令会先打包一遍前端

在`Tauri`打包的时候很可能出现无法连接上github的问题，可以转国内源重新构建：
如果是powershell
```powershell
$env:TAURI_DOWNLOAD_BINS_MIRROR = "https://npmmirror.com/mirrors/tauri-binaries/"
```
或者cmd
```cmd
set TAURI_DOWNLOAD_BINS_MIRROR=https://npmmirror.com/mirrors/tauri-binaries/
```
然后再执行：
```powershell
npx tauri build
```
