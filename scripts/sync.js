const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// 顏色輸出輔助函數
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    red: '\x1b[31m',
    cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function execCommand(command, options = {}) {
    try {
        execSync(command, {
            stdio: 'inherit',
            ...options
        });
        return true;
    } catch (error) {
        return false;
    }
}

// 主腳本
async function main() {
    log('\n🔄 同步上游提示詞資料庫...', 'bright');
    log('═'.repeat(60), 'cyan');

    const rootDir = path.join(__dirname, '..');
    const sources = [
        {
            name: 'Nano Banana Pro',
            path: path.join(rootDir, 'nano-banana-pro'),
            repo: 'https://github.com/YouMind-OpenLab/awesome-nano-banana-pro-prompts.git'
        },
        {
            name: 'Gemini 3',
            path: path.join(rootDir, 'gemini-3'),
            repo: 'https://github.com/YouMind-OpenLab/awesome-gemini-3-prompts.git'
        }
    ];

    let updatedCount = 0;
    let totalPromptsBefore = 0;

    // 1. 檢查並同步每個來源
    for (const source of sources) {
        log(`\n📦 處理 ${source.name}...`, 'cyan');

        if (!fs.existsSync(source.path)) {
            log(`   ⚠️  目錄不存在，正在複製...`, 'yellow');
            if (execCommand(`git clone ${source.repo} ${source.path}`)) {
                log(`   ✅ 複製成功`, 'green');
                updatedCount++;
            } else {
                log(`   ❌ 複製失敗`, 'red');
            }
        } else {
            log(`   🔍 檢查更新...`);

            // 先 fetch 看看是否有更新
            execCommand('git fetch', { cwd: source.path, stdio: 'pipe' });

            try {
                const status = execSync('git status -uno', {
                    cwd: source.path,
                    encoding: 'utf-8'
                });

                if (status.includes('Your branch is behind')) {
                    log(`   📥 發現新提示詞，正在同步...`, 'yellow');
                    if (execCommand('git pull origin main', { cwd: source.path })) {
                        log(`   ✅ 更新成功`, 'green');
                        updatedCount++;
                    } else {
                        log(`   ❌ 更新失敗`, 'red');
                    }
                } else {
                    log(`   ✓  已是最新版本`, 'green');
                }
            } catch (error) {
                log(`   ⚠️  無法檢查狀態，嘗試強制拉取...`, 'yellow');
                if (execCommand('git pull origin main', { cwd: source.path })) {
                    log(`   ✅ 更新成功`, 'green');
                    updatedCount++;
                }
            }
        }
    }

    // 2. 讀取舊資料統計
    const promptsJsonPath = path.join(rootDir, 'mobile-app/src/data/prompts.json');
    if (fs.existsSync(promptsJsonPath)) {
        try {
            const oldData = JSON.parse(fs.readFileSync(promptsJsonPath, 'utf-8'));
            totalPromptsBefore = oldData.length;
        } catch (e) {
            // Ignore parsing errors
        }
    }

    // 3. 重新解析資料
    log('\n\n🔧 重新解析提示詞...', 'bright');
    log('═'.repeat(60), 'cyan');

    const parserPath = path.join(rootDir, 'scripts/parser.js');
    if (execCommand(`node "${parserPath}"`)) {
        log('\n✅ 解析完成', 'green');

        // 讀取新資料統計
        try {
            const newData = JSON.parse(fs.readFileSync(promptsJsonPath, 'utf-8'));
            const totalPromptsAfter = newData.length;
            const diff = totalPromptsAfter - totalPromptsBefore;

            log('\n📊 統計資訊:', 'bright');
            log(`   • 原有提示詞: ${totalPromptsBefore}`);
            log(`   • 現有提示詞: ${totalPromptsAfter}`);
            if (diff > 0) {
                log(`   • 新增提示詞: +${diff}`, 'green');
            } else if (diff < 0) {
                log(`   • 移除提示詞: ${diff}`, 'yellow');
            } else {
                log(`   • 無變化`, 'cyan');
            }

            // 驗證唯一 ID
            const ids = newData.map(p => p.id);
            const uniqueIds = new Set(ids);
            if (ids.length === uniqueIds.size) {
                log(`   ✅ ID 檢查: 全部唯一 (${uniqueIds.size})`, 'green');
            } else {
                log(`   ⚠️  ID 檢查: 發現重複！`, 'red');
            }

        } catch (e) {
            log(`   ⚠️  無法讀取新資料: ${e.message}`, 'yellow');
        }
    } else {
        log('\n❌ 解析失敗', 'red');
        process.exit(1);
    }

    // 4. 提示下一步
    log('\n\n🎯 下一步:', 'bright');
    log('═'.repeat(60), 'cyan');

    if (updatedCount > 0 || totalPromptsBefore === 0) {
        log('   1. 檢查更新內容：');
        log('      git diff mobile-app/src/data/prompts.json\n', 'cyan');
        log('   2. 提交更新：');
        log('      git add mobile-app/src/data/prompts.json');
        log('      git commit -m "update: sync latest prompts from upstream"');
        log('      git push\n', 'cyan');
        log('   3. Cloudflare Pages 會自動重新部署 🚀\n', 'green');
    } else {
        log('   ✓ 沒有新的提示詞，無需提交\n', 'green');
    }

    log('═'.repeat(60), 'cyan');
    log('✨ 同步完成！\n', 'bright');
}

// 執行主函數
main().catch(error => {
    log(`\n❌ 發生錯誤: ${error.message}`, 'red');
    process.exit(1);
});
