# Blibili-Markdowns

这是“星藏家”使用的 B 站视频总结共享仓库。仓库只接收已经完成的 B 站视频 Markdown 总结、必要的脱敏元数据和 Markdown 引用的图片资源，不接收原始视频、音频、Cookie、API Key、ASR 缓存或应用数据库。

## 如何贡献

1. 在“星藏家”的“B站之外 → GitHub 文档共享”工具中筛选并勾选自己的 B 站总结。
2. 应用使用项目内置 Git 创建个人 Fork、分支和 Pull Request。
3. 维护者审核目录、内容来源、隐私和格式后合并 Pull Request。
4. 合并后的文档会由 GitHub Actions 校验并更新 `catalog.json`。

请不要直接向 `main` 推送。贡献者必须通过应用创建 Pull Request，这样目录中的 GitHub 数字 ID、稳定文档 ID 和审核记录才能保持一致。

## 目录结构

应用生成的目录使用不随用户名或收藏夹改名变化的 ID：

```text
<github-numeric-id>/
  bilibili/col-<source-hash>/doc-<stable-document-id>/
    summary.md
    _star-owner-document.json
    assets/
  single/col-<source-hash>/doc-<stable-document-id>/
    summary.md
    _star-owner-document.json
  multipart/col-<source-hash>/doc-<stable-document-id>/
    index.md
    parts/cid-<cid>/summary.md
    _star-owner-document.json
```

同一个 BVID 在不同 B 站账户、收藏夹、AI 模型或提示词下可以拥有多份总结，不应手动去重或互相覆盖。`_star-owner-document.json` 是挂载和增量同步所需的元数据，不能手动伪造贡献者 ID 或文档 ID。

## 下载与挂载

“星藏家”用户可以读取 `main` 的目录，按贡献者、BVID、收藏夹和更新时间筛选，再把单篇文档或整个远程收藏夹挂载到本地“共享”用户下的收藏夹。挂载会保留远程路径和稳定文档 ID；远程更新会增量同步，远程删除只标记失效并保留本地产物。

## 内容要求

- 只提交 B 站视频总结产物；本地视频、音频、PDF、Office 文档和任意非 B 站来源不能上传。
- 不要把 Cookie、Token、API Key、数据库、绝对路径或原始媒体放进 Pull Request。
- Markdown 中引用的图片必须位于同一文档目录内，并使用相对路径。
- 标题、作者和收藏夹名称应尽量保留来源信息，但不要放入个人隐私。
- 发现错误、侵权或需要下架的内容，请通过仓库 Issue 联系维护者。

详细规则见 [CONTRIBUTING.md](CONTRIBUTING.md) 和 [SECURITY.md](SECURITY.md)。

