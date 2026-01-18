const fs = require('fs');
const path = require('path');

// 讀取提示詞數據
const promptsPath = path.join(__dirname, '../mobile-app/src/data/prompts.json');
const prompts = JSON.parse(fs.readFileSync(promptsPath, 'utf-8'));

// 定義分類規則（基於關鍵字匹配）
const categories = {
    '🎨 設計': [
        'logo', '標誌', '品牌', 'ui', 'ux', '界面', '設計', '排版', '海報',
        'banner', '廣告', 'icon', '圖標', '封面', '卡片', 'card', '名片'
    ],
    '👤 人像': [
        '人像', '肖像', '頭像', '自拍', 'portrait', 'avatar', 'headshot',
        '個人檔案', 'profile', '人物', '臉部', '面部'
    ],
    '💼 商業': [
        '商業', '簡報', '報告', '提案', '數據', '圖表', 'chart', 'business',
        '企業', '辦公', '會議', '專業', 'professional', 'corporate'
    ],
    '🎓 教育': [
        '教育', '教學', '課程', '學習', '地圖', 'map', '資訊圖', 'infographic',
        '圖解', '說明', '教材', '知識', 'educational'
    ],
    '🎭 藝術': [
        '藝術', '繪畫', '水彩', '油畫', '插畫', '手繪', 'art', 'artistic',
        '復古', 'vintage', '創意', 'creative', '抽象', '風格'
    ],
    '📱 社群': [
        '社群', 'social', '貼文', 'post', 'instagram', 'twitter', 'facebook',
        '限動', 'story', '分享', '互動'
    ],
    '🔮 3D': [
        '3d', '立體', '三維', '渲染', 'render', '模型', 'model',
        '粒子', 'particle', 'three.js', 'glsl'
    ],
    '✍️ 文字': [
        '文案', '標題', '引言', 'quote', '文字', 'text', 'typography',
        '字體', '書法', '手寫', '筆跡'
    ]
};

// 智能分類函數
function classifyPrompt(prompt) {
    const searchText = `${prompt.title} ${prompt.description}`.toLowerCase();
    const assignedCategories = [];

    for (const [category, keywords] of Object.entries(categories)) {
        for (const keyword of keywords) {
            if (searchText.includes(keyword.toLowerCase())) {
                assignedCategories.push(category);
                break; // 每個分類最多分配一次
            }
        }
    }

    // 如果沒有匹配到任何分類，標記為「其他」
    if (assignedCategories.length === 0) {
        assignedCategories.push('🔖 其他');
    }

    return assignedCategories;
}

// 處理所有提示詞
console.log('🏷️  開始智能分類...\n');

const updatedPrompts = prompts.map(prompt => {
    const categoryTags = classifyPrompt(prompt);

    // 保留原有標籤（語言、Featured 等）並加入新分類
    const existingTags = prompt.tags || [];
    const newTags = [...new Set([...existingTags, ...categoryTags])]; // 去重

    return {
        ...prompt,
        tags: newTags,
        categories: categoryTags // 新增欄位，專門存放分類標籤
    };
});

// 統計資訊
const categoryStats = {};
updatedPrompts.forEach(p => {
    p.categories.forEach(cat => {
        categoryStats[cat] = (categoryStats[cat] || 0) + 1;
    });
});

console.log('📊 分類統計：\n');
Object.entries(categoryStats)
    .sort((a, b) => b[1] - a[1])
    .forEach(([cat, count]) => {
        const percentage = ((count / updatedPrompts.length) * 100).toFixed(1);
        console.log(`   ${cat}: ${count} (${percentage}%)`);
    });

// 顯示範例
console.log('\n\n📝 範例（前 5 個）：\n');
updatedPrompts.slice(0, 5).forEach((p, i) => {
    console.log(`${i + 1}. ${p.title}`);
    console.log(`   分類: ${p.categories.join(', ')}`);
    console.log(`   所有標籤: ${p.tags.join(', ')}\n`);
});

// 寫入更新後的 JSON
fs.writeFileSync(promptsPath, JSON.stringify(updatedPrompts, null, 2), 'utf-8');

console.log('✅ 分類完成！已更新 prompts.json\n');
console.log(`   • 總提示詞: ${updatedPrompts.length}`);
console.log(`   • 分類數量: ${Object.keys(categoryStats).length}`);
console.log(`   • 平均每個提示詞: ${(updatedPrompts.reduce((s, p) => s + p.categories.length, 0) / updatedPrompts.length).toFixed(2)} 個分類標籤`);
