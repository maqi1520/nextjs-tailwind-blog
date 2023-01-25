---
title: 我在工作中使用 git 的几个技巧
date: 2022/11/23 12:32:22
lastmod: 2023/1/25 11:42:17
tags: [Git, 掘金·金石计划]
draft: false
summary: Git 是每个程序员的必备技能，良好的 Git 提交习惯，不但可以让代码阅读更清晰，还可以提高我们的我们的工作效率，接下来我将分享我在工作中关于 Git 的使用经验，或许对你有帮助。
images: https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/6fce639f5d1b4e0794b26f21326ed3f3~tplv-k3u1fbpfcp-watermark.image?
authors: ['default']
layout: PostLayout
---

## 前言

Git 是每个程序员的必备技能，良好的 Git 提交习惯，不但可以让代码阅读更清晰，还可以提高我们的我们的工作效率，接下来我将分享我在工作中关于 Git 的使用经验，或许对你有帮助。

## Git 工作流

- 主分支： master
- 开发分支： develop
- 提测分支： relase 如:relase/V2.0.0

新功能开发，develop 分支检出一个 feature 分支开发（合并后可删除）
bug 修复，develop 分支检出一个 hotfix 分支开发(合并后可删除)

提测从 develop 检出一个 relase 分支提测，发布后 relase 分支合并到 master

若前端项目只有一个人负责，可以直接在 develop 开发，使用 Git 工作流规范，可以推进持续集成的统一建设，不会影响产品的持续发布

[详情参考 阮一峰 Git 工作流](https://www.ruanyifeng.com/blog/2015/12/git-workflow.html)

## 使用 [oh-my-zsh](https://ohmyz.sh/ 'oh-my-zsh') 简化 git 命令

常规提交 git 命令

- git add .
- git commit -m 'fix: some fix'
- git push

使用 oh-my-zsh 插件后

- gaa
- gcm "fix:some fix"
- gp

安装 oh-my-zsh 后默认会打开 git 插件，它会在命令行下光标前显示当前分支名称，还可以实现自动补全，输入 `git re` 按 tab 会自提示可以选择命令，再按 tab 就可以选择命令，方便命令输入。

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/5fdff4b9092f4cceacd3425c5d902558~tplv-k3u1fbpfcp-zoom-1.image)

这里罗列几个常用的作为示例，展示它们的作用：

| 快捷键  | git 命令                             | 描述                                                    |
| :------ | :----------------------------------- | :------------------------------------------------------ |
| `g`     | `git`                                | git                                                     |
| `gp`    | `git push`                           | 推送                                                    |
| `gl`    | `git pull`                           | 拉取                                                    |
| `gaa`   | `git add --all`                      | 添加当前项目所有文件修改、增删的文件到缓存区            |
| `gc!`   | `git commit -v --amend`              | 修正上次提交                                            |
| `gcm`   | `git commit -m`                      | 提交项目到本地库，其中`-a`表示不用再次输入`git add`命令 |
| `gcb`   | `git checkout -b`                    | 将特定分支上暂存储区的内容替换当下工作区的内容，        |
| `gcm`   | `git checkout $(git_main_branch)`    | 切到 main 或者 master                                   |
| `gcd`   | `git checkout $(git_develop_branch)` | 切到 develop                                            |
| `gbD`   | `git branch -D`                      | 删除分支                                                |
| `glods` | `git log --graph --date=short`       | 查看提交记录                                            |
| `gm`    | `git merge`                          | 合并分支                                                |
| `grb`   | `git rebase`                         | 变基                                                    |
| `grhh`  | `git reset --hard`                   | 重置                                                    |
| `gcp`   | `git cherry-pick <commitId>`         | 从其他分支 选取一次提交                                 |
| `gsta`  | `git stash push`                     | 保存修改为暂存                                          |
| `gstp`  | `git stash pop`                      | 弹出暂存                                                |

完整的简写对照表可以参考[github](https://github.com/ohmyzsh/ohmyzsh/tree/master/plugins/git)

## cherry-pick 代码迁移

工作中有时候会有一些定制功能，会遇到代码迁移的需求，代码在 2 条分支线上，往往不能合并，我们可以按以下 2 步快速迁移。

`glods` 可以查看提交记录

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/e0a184c9ca2941159cd70388bfd24034~tplv-k3u1fbpfcp-zoom-1.image)

`glods --grep 关键词` 搜索提交记录，复制 commit id 后，执行`git cherry-pick <commit id>` 可以非常方便地帮助我们实现代码迁移，但是前提是 commit 提交清晰，功能明确。

**git cherry-pick 与 git merge 不同的是：**

- cherry-pick 可以迁移单个 commit 迁移，会生成一个新的 commit id

- merge 必须全部功能合并过去，但不会生成新的 commit id，而是 commit 指针指向新的分支

## 约定式提交规范

关于提交规范可以遵循[《约定式提交规范》](https://www.conventionalcommits.org/zh-hans/v1.0.0/)

约定式提交的好处：

- 自动化生成 CHANGELOG。
- 基于提交的类型，自动决定语义化的版本变更。
- 向同事、公众与其他利益关系者传达变化的性质。
- 让人们探索一个更加结构化的提交历史，以便降低对你的项目做出贡献的难度。

我们可以在全局安装 [git-cz](https://www.npmjs.com/package/git-cz 'git-cz') 这个包

```bash
npm i  git-cz@4.5.0 -g
```

安装后在任意项目中使用 `git-cz` 代替 `git commit`，就可以在命令行中进行选择，提交信息会带有 emoji 表情，比较美观。

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/baef5205f1304406b7deb862519d8ceb~tplv-k3u1fbpfcp-zoom-1.image)

## git rebase 的使用

1. 可以删除 git 自动生成的 merge commit，优化提交记录

当你执行 git push 的时候，发现远程仓库有修改，git 会提示你先执行 git pull，接着你执行 git pull ，git 会帮你自动合并生成一次提交

```
Merge branch 'master' of github.com:test/test
```

此时可以执行 `git rebase` 或者拉取的时候执行 `git pull --rebase`，这样我们的 commmit 提交时间就在一条时间线上，比较清晰。

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/2942637e570c4db9a10fc7de231d877d~tplv-k3u1fbpfcp-zoom-1.image)

2. rebase 可以修改合并多个提交，修改提交记录等

一个功能可能需要开发几天，那么需要有好几个提交，为了方便代码迁移，我们可以使用 `git rebase -i <commit id>`，将多个 commit 合并成一个 commit。

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/34ea7b7010a24b318ff6a2374af97e6c~tplv-k3u1fbpfcp-zoom-1.image)

在 vscode 中安装了 [gitlens](https://marketplace.visualstudio.com/items?itemName=eamodio.gitlens 'vscode gitlens') 插件就会有可视化的选择界面，如上图，我选择了 squash，中间的 commit 就合并到了上一次 commit 中，当然我们还可以选择 reword 修改 commit 信息，选择 drop 删除 commit 等。

合并的 git 记录是在本地的，需要强制推送到远程，执行`gpf` 也就是 `git push --force`

## 利用 `Git reflog` 找回丢失的记录

老司机可能警告过你，要避免使用`git reset <commit id> --hard`。因为这是一种破坏性的操作。一旦执行，之前的修改全部丢失了，但有时候又避免不了使用 reset，在你执行 reset 之后，却发现，之前的某些提交还是有用的，想再看下之前的代码，这个时候可以使用 `git reflog`，reflog 中你可以看到所有的变化，我们可以根据 `<commit id>`，检出新分支查看，或者 `cherry-pick` 找回之前的提交。找回内容的前提是，你的内容做了 commit。若没有提交，git reset 后就丢了。

reflog 是一个本地结构，它记录了 HEAD 和分支引用在过去指向的位置。reflog 信息没法与其他任何人共享，每个人都是自己特有的 reflog。重要的一点是，它不是永久保存的，有一个可配置的过期时间，reflog 中过期的信息会被自动删除。

## 小结

- 使用 Git 工作流规范，可以推进持续集成的统一建设，不会影响产品的持续发布
- 使用 oh-my-zsh 可以简化 git 提交命令
- 使用 git-cz 可以让我们遵循约定式提交规范
- 使用 `git cherry-pick` 可以实现往不能合并的分支迁移代码
- 使用 `git rebase` 可以优化提交记录，让提交都在一条时间线上。
- 利用 `git reflog` 找回丢失的 commit 记录

以上就是本文全部内容，如果对你有帮助，可以随手点个赞，这对我真的很重要，希望这篇文章对大家有所帮助，也可以参考我往期的文章或者在评论区交流你的想法和心得，欢迎一起探索前端。

> 本文正在参加[「金石计划 . 瓜分 6 万现金大奖」](https://juejin.cn/post/7162096952883019783 'https://juejin.cn/post/7162096952883019783')
