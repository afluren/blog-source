---
title: 通过vscode在WSL使用codex解决方案
date: 2025-11-20 20:59:30
categories: 
- 小技巧
tags: 
- WSL
- codex
katex: true
---

在Windows登录了codex之后，vscode可以上可以正常使用codex，但是远程连接上WSL后，却无法使用codex了，需要登录，但是登录也只是在Windows上登录，并不能在WSL上生效。

在codex的issue中找到了一个有效的回答，原文如下：

The codex CLI starts a local OAuth callback server on http://localhost: inside WSL.
When you open the login link in a Windows browser, the browser attempts to redirect back to http://localhost:.

Normally, Windows → WSL port forwarding for localhost works, so the callback should reach the server inside WSL. However, in some setups this fails due to:

Firewall or antivirus blocking the loopback traffic,

IPv6 vs IPv4 resolution issues (localhost vs 127.0.0.1),

Or because the login was performed entirely on the Windows side while the server is only listening inside WSL.

As a result, authentication cannot complete.

Solution:

In PowerShell on Windows, install and log in:

npm install -g @openai/codex
codex

Complete the login in the Windows browser.

After login, Windows stores credentials at:

C:\Users<YourName>.codex\auth.json

Copy this file into WSL:

mkdir -p ~/.codex
cp /mnt/c/Users//.codex/auth.json ~/.codex/auth.json

Now codex in WSL is authenticated without needing to repeat the browser flow.

原文在[Token exchange failed: token endpoint returned status 403 Forbidden](https://github.com/openai/codex/issues/2414#issuecomment-3215961054)由@CartmanXT 给出