"use client";

import { useState, useMemo } from "react";
import promptsData from "@/data/prompts.json";
import { PromptCard } from "@/components/PromptCard";
import { Search, Filter, X } from "lucide-react";
import { cn } from "@/lib/utils";

// 定義分類標籤（從 classify.js 生成的）
const CATEGORY_TAGS = [
  "👤 人像",
  "🎭 藝術",
  "💼 商業",
  "📱 社群",
  "🎓 教育",
  "🎨 設計",
  "✍️ 文字",
  "🔮 3D",
  "🔖 其他"
];

export default function Home() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<'all' | 'nano-banana-pro' | 'gemini-3'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredPrompts = useMemo(() => {
    return promptsData.filter(p => {
      const matchesSearch = p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.tags.some(t => t.toLowerCase().includes(search.toLowerCase()));
      const matchesFilter = filter === 'all' || p.source === filter;
      const matchesCategory = !selectedCategory || (p as any).categories?.includes(selectedCategory);
      return matchesSearch && matchesFilter && matchesCategory;
    });
  }, [search, filter, selectedCategory]);

  return (
    <main className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-200 px-4 py-3 safe-top">
        <div className="flex items-center gap-3 mb-3">
          <h1 className="text-lg font-bold bg-gradient-to-r from-yellow-500 to-blue-600 bg-clip-text text-transparent">
            PromptDeck
          </h1>
          <div className="ml-auto text-xs text-gray-400">
            {filteredPrompts.length} / {promptsData.length}
          </div>
        </div>

        <div className="flex gap-2 mb-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="搜尋提示詞..."
              className="w-full pl-9 pr-4 py-2 bg-gray-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button
            onClick={() => setFilter(prev => {
              if (prev === 'all') return 'nano-banana-pro';
              if (prev === 'nano-banana-pro') return 'gemini-3';
              return 'all';
            })}
            className="p-2 bg-gray-100 rounded-lg text-gray-600 active:bg-gray-200"
          >
            <Filter size={18} className={filter !== 'all' ? "text-blue-600" : ""} />
          </button>
        </div>

        {/* 分類標籤 (橫向滑動) */}
        <div className="relative -mx-4 px-4">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {CATEGORY_TAGS.map(tag => (
              <button
                key={tag}
                onClick={() => setSelectedCategory(selectedCategory === tag ? null : tag)}
                className={cn(
                  "flex-none px-3 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap",
                  selectedCategory === tag
                    ? "bg-blue-500 text-white shadow-md"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                )}
              >
                {tag}
                {selectedCategory === tag && (
                  <X size={12} className="inline ml-1" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Feed */}
      <div className="px-4 py-4 max-w-md mx-auto">
        <div className="space-y-4">
          {filteredPrompts.map(prompt => (
            <PromptCard key={prompt.id} prompt={prompt} />
          ))}

          {filteredPrompts.length === 0 && (
            <div className="text-center py-20 text-gray-400">
              <p>沒有找到相關提示詞</p>
              {selectedCategory && (
                <button
                  onClick={() => setSelectedCategory(null)}
                  className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg text-sm"
                >
                  清除分類篩選
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </main>
  );
}
