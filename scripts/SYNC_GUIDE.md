# 🔄 自動更新指南

## 使用方式

### 方法 1：直接執行同步腳本

```bash
# 在專案根目錄執行
node scripts/sync.js
```

腳本會自動：

1. ✅ 檢查上游 repositories 是否有更新
2. ✅ 如果有更新，自動 `git pull`
3. ✅ 重新執行 `parser.js` 生成最新 JSON
4. ✅ 顯示新增/移除的提示詞數量
5. ✅ 驗證 ID 唯一性
6. ✅ 提示下一步操作（commit & push）

### 方法 2：加入 npm scripts（推薦）

在 `package.json` 中新增：

```json
{
  "scripts": {
    "sync": "node scripts/sync.js"
  }
}
```

然後使用：

```bash
npm run sync
```

## 輸出範例

```
🔄 同步上游提示詞資料庫...
════════════════════════════════════════════════════════════

📦 處理 Nano Banana Pro...
   🔍 檢查更新...
   📥 發現新提示詞，正在同步...
   ✅ 更新成功

📦 處理 Gemini 3...
   🔍 檢查更新...
   ✓  已是最新版本


🔧 重新解析提示詞...
════════════════════════════════════════════════════════════
Reading nano-banana-pro/README_zh-TW.md...
Extracted 135 prompts from Nano Banana Pro
Reading gemini-3/README_zh-TW.md...
Extracted 49 prompts from Gemini 3
Successfully wrote 184 prompts to mobile-app/src/data/prompts.json

✅ 解析完成

📊 統計資訊:
   • 原有提示詞: 179
   • 現有提示詞: 184
   • 新增提示詞: +5
   ✅ ID 檢查: 全部唯一 (184)


🎯 下一步:
════════════════════════════════════════════════════════════
   1. 檢查更新內容：
      git diff mobile-app/src/data/prompts.json

   2. 提交更新：
      git add mobile-app/src/data/prompts.json
      git commit -m "update: sync latest prompts from upstream"
      git push

   3. Cloudflare Pages 會自動重新部署 🚀

════════════════════════════════════════════════════════════
✨ 同步完成！
```

## 自動化定期更新（進階）

### 使用 GitHub Actions

創建 `.github/workflows/sync-prompts.yml`：

```yaml
name: Sync Prompts

on:
  schedule:
    - cron: '0 0 * * *'  # 每天 UTC 00:00 執行
  workflow_dispatch:  # 手動觸發

jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
        with:
          submodules: true
      
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Sync prompts
        run: node scripts/sync.js
      
      - name: Commit changes
        run: |
          git config --local user.email "action@github.com"
          git config --local user.name "GitHub Action"
          git add mobile-app/src/data/prompts.json
          git diff --staged --quiet || git commit -m "chore: auto sync prompts"
          git push
```

這樣每天會自動檢查並同步最新提示詞！

## 故障排除

### 問題：git pull 失敗

解決方案：

```bash
# 手動進入子目錄檢查
cd nano-banana-pro
git status
git pull origin main
```

### 問題：解析失敗

解決方案：

```bash
# 手動執行 parser 查看錯誤訊息
node scripts/parser.js
```
