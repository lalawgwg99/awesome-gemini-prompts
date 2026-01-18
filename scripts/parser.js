const fs = require('fs');
const path = require('path');

const SOURCES = [
    {
        path: 'nano-banana-pro/README_zh-TW.md',
        type: 'nano-banana-pro',
        category: 'Nano Banana Pro'
    },
    {
        path: 'gemini-3/README_zh-TW.md',
        type: 'gemini-3',
        category: 'Gemini 3'
    }
];

const OUTPUT_FILE = 'mobile-app/src/data/prompts.json';
const OUTPUT_DIR = path.dirname(OUTPUT_FILE);

let globalIdCounter = 1; // Global counter for unique IDs across all sources

function parseMarkdown(content, type, category) {
    const prompts = [];
    // Regex to split by "### No. " but keep the delimiter to identified sections
    const sections = content.split(/^### No\. /gm).slice(1);

    sections.forEach((section, index) => {
        try {
            // Extract Title
            const titleMatch = section.match(/^(\d+): (.*?)\r?\n/);
            const id = `${type}-${globalIdCounter++}`; // Use global counter for unique IDs
            const title = titleMatch ? titleMatch[2].trim() : 'Unknown Title';

            // Extract Description
            const descMatch = section.match(/#### 📖 描述\s+([\s\S]*?)(?=\s+####)/);
            const description = descMatch ? descMatch[1].trim() : '';

            // Extract Prompt
            const codeMatch = section.match(/#### 📝 提示詞\s+```.*?\r?\n([\s\S]*?)```/);
            const prompt = codeMatch ? codeMatch[1].trim() : '';

            // Extract Image
            // Matching the first image content in the 🖼️ section
            const imgMatch = section.match(/<img src="(.*?)"/);
            const image = imgMatch ? imgMatch[1] : '';

            // Extract Metadata
            const authorMatch = section.match(/- \*\*作者:\*\* \[(.*?)\]\((.*?)\)/);
            const sourceMatch = section.match(/- \*\*來源:\*\* \[(.*?)\]\((.*?)\)/);

            // Extract Tags (Language badges etc, simplistic approach)
            const tags = [];
            const badgeMatches = section.matchAll(/!\[(.*?)\]\(https:\/\/img\.shields\.io\/badge\/(.*?)\)/g);
            for (const match of badgeMatches) {
                tags.push(match[1].replace('Language-', ''));
            }

            if (title && prompt) {
                prompts.push({
                    id,
                    source: type,
                    category,
                    title,
                    description,
                    prompt,
                    image,
                    author: authorMatch ? { name: authorMatch[1], url: authorMatch[2] } : null,
                    origin: sourceMatch ? { text: sourceMatch[1], url: sourceMatch[2] } : null,
                    tags: [...new Set(tags)] // unique tags
                });
            }
        } catch (e) {
            console.error(`Error parsing section ${index} in ${type}:`, e);
        }
    });

    return prompts;
}

function main() {
    let allPrompts = [];

    SOURCES.forEach(source => {
        const filePath = path.join(__dirname, '..', source.path);
        if (fs.existsSync(filePath)) {
            console.log(`Reading ${source.path}...`);
            const content = fs.readFileSync(filePath, 'utf-8');
            const prompts = parseMarkdown(content, source.type, source.category);
            console.log(`Extracted ${prompts.length} prompts from ${source.category}`);
            allPrompts = allPrompts.concat(prompts);
        } else {
            console.warn(`File not found: ${filePath}`);
        }
    });

    if (!fs.existsSync(OUTPUT_DIR)) {
        fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(allPrompts, null, 2), 'utf-8');
    console.log(`Successfully wrote ${allPrompts.length} prompts to ${OUTPUT_FILE}`);
}

main();
