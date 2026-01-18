"use client";

import { useState, useMemo } from "react";
import promptsData from "@/data/prompts.json";
import { PromptCard } from "@/components/PromptCard";
import { Search, Filter } from "lucide-react";

export default function Home() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<'all' | 'nano-banana-pro' | 'gemini-3'>('all');

  const filteredPrompts = useMemo(() => {
    return promptsData.filter(p => {
      const matchesSearch = p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.tags.some(t => t.toLowerCase().includes(search.toLowerCase()));
      const matchesFilter = filter === 'all' || p.source === filter;
      return matchesSearch && matchesFilter;
    });
  }, [search, filter]);

  return (
    <main className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-200 px-4 py-3 safe-top">
        <div className="flex items-center gap-3 mb-3">
          <h1 className="text-lg font-bold bg-gradient-to-r from-yellow-500 to-blue-600 bg-clip-text text-transparent">
            PromptDeck
          </h1>
          <div className="ml-auto text-xs text-gray-400">
            {promptsData.length} Prompts
          </div>
        </div>

        <div className="flex gap-2">
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
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
