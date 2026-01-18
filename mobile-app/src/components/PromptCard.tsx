"use client";

import { useState, useMemo, useEffect } from "react";
import { Copy, Check, Settings2, Sparkles, Pencil, RotateCcw, SlidersHorizontal, Type } from "lucide-react";
import { cn } from "@/lib/utils";

interface Prompt {
    id: string;
    source: string;
    category: string;
    title: string;
    description: string;
    prompt: string;
    image: string;
    tags: string[];
    author?: { name: string; url: string } | null;
}

interface PromptVariable {
    name: string;
    description: string;
    default: string;
    match: string;
}

export function PromptCard({ prompt }: { prompt: Prompt }) {
    const [copied, setCopied] = useState(false);
    const [variables, setVariables] = useState<Record<string, string>>({});
    const [isManualMode, setIsManualMode] = useState(false);
    const [manualContent, setManualContent] = useState("");

    // 1. 解析變數
    const parsedParams = useMemo(() => {
        const regex = /\{argument\s+name="([^"]+)"\s+default="([^"]+)"\}/g;
        const matches: PromptVariable[] = [];
        let match;
        while ((match = regex.exec(prompt.prompt)) !== null) {
            matches.push({
                name: match[1],
                description: match[1],
                default: match[2],
                match: match[0]
            });
        }
        return matches;
    }, [prompt.prompt]);

    // 2. 初始化變數
    useEffect(() => {
        const initialVars: Record<string, string> = {};
        parsedParams.forEach(p => {
            initialVars[p.name] = p.default;
        });
        setVariables(initialVars);
        setIsManualMode(false);
        setManualContent("");
    }, [parsedParams, prompt.id]);

    // 3. 計算「自動產生」的提示詞 (基於變數)
    const generatedPrompt = useMemo(() => {
        let result = prompt.prompt;
        parsedParams.forEach(p => {
            const value = variables[p.name] ?? p.default;
            result = result.replaceAll(p.match, value);
        });
        return result;
    }, [prompt.prompt, parsedParams, variables]);

    // 4. 決定最終顯示與複製的內容
    // 如果是手動模式，使用 manualContent；否則使用 generatedPrompt
    const finalDisplayContent = isManualMode ? manualContent : generatedPrompt;

    // 切換模式邏輯
    const toggleToManual = () => {
        if (!isManualMode) {
            // 從自動切換到手動：把當前的結果複製過去
            setManualContent(generatedPrompt);
            setIsManualMode(true);
        }
    };

    const toggleToAuto = () => {
        if (isManualMode) {
            // 從手動切回自動：放棄手動修改
            setIsManualMode(false);
        }
    };

    const imageUrl = prompt.image.startsWith("http")
        ? prompt.image
        : `/images/${prompt.image}`;

    const handleCopy = () => {
        navigator.clipboard.writeText(finalDisplayContent);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleOpenGemini = () => {
        navigator.clipboard.writeText(finalDisplayContent);
        setCopied(true);
        window.open("https://gemini.google.com/app", "_blank");
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6 transition-all hover:shadow-md group">
            {/* Image Header with Gradient Overlay */}
            <div className="relative aspect-[16/9] w-full bg-gray-100 overflow-hidden">
                {prompt.image ? (
                    <img
                        src={imageUrl}
                        alt={prompt.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        loading="lazy"
                    />
                ) : (
                    <div className="flex items-center justify-center w-full h-full text-gray-300">
                        <span className="text-4xl">🖼️</span>
                    </div>
                )}

                {/* Source Badge */}
                <div className="absolute top-3 right-3">
                    <span className={cn(
                        "px-3 py-1 text-[11px] font-bold rounded-full shadow-lg backdrop-blur-md border border-white/20",
                        prompt.source === 'gemini-3'
                            ? "bg-blue-500/90 text-white"
                            : "bg-yellow-400/90 text-black"
                    )}>
                        {prompt.source === 'gemini-3' ? 'Gemini 3' : 'Nano Banana'}
                    </span>
                </div>

                {/* Title Overlay (Bottom Gradient) */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 pt-16">
                    <h3 className="text-white font-bold text-lg leading-tight shadow-black drop-shadow-md">
                        {prompt.title}
                    </h3>
                </div>
            </div>

            <div className="p-4">
                {/* Tags & Description */}
                <div className="mb-4">
                    <div className="flex flex-wrap gap-1.5 mb-2">
                        {prompt.tags.slice(0, 4).map(tag => (
                            <span key={tag} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-[10px] font-medium rounded-md">
                                {tag}
                            </span>
                        ))}
                    </div>
                    <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                        {prompt.description}
                    </p>
                </div>

                {/* --- Interactive Operation Zone --- */}
                <div className="bg-slate-50 rounded-xl border border-slate-100 overflow-hidden mb-4">

                    {/* Mode Tabs */}
                    <div className="flex border-b border-slate-100">
                        {parsedParams.length > 0 && (
                            <button
                                onClick={toggleToAuto}
                                className={cn(
                                    "flex-1 py-2.5 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors",
                                    !isManualMode
                                        ? "bg-white text-blue-600 border-b-2 border-blue-500"
                                        : "text-gray-400 hover:text-gray-600 hover:bg-slate-100"
                                )}
                            >
                                <SlidersHorizontal size={14} />
                                參數填空
                            </button>
                        )}
                        <button
                            onClick={toggleToManual}
                            className={cn(
                                "flex-1 py-2.5 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors",
                                isManualMode
                                    ? "bg-white text-blue-600 border-b-2 border-blue-500"
                                    : "text-gray-400 hover:text-gray-600 hover:bg-slate-100"
                            )}
                        >
                            <Pencil size={14} />
                            {parsedParams.length > 0 ? "手動微調" : "編輯內容"}
                        </button>
                    </div>

                    {/* Operation Area */}
                    <div className="p-4 bg-white/50">
                        {/* 1. Auto Mode: Variable Inputs */}
                        {!isManualMode && parsedParams.length > 0 && (
                            <div className="space-y-3 mb-4 animate-in fade-in slide-in-from-left-1">
                                {parsedParams.map(param => (
                                    <div key={param.name}>
                                        <label className="flex items-center gap-1 text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">
                                            <Type size={10} />
                                            {param.name.replace(/_/g, ' ')}
                                        </label>
                                        <input
                                            type="text"
                                            className="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 bg-white placeholder:text-slate-300 transition-all"
                                            value={variables[param.name] || ''}
                                            onChange={(e) => setVariables(prev => ({ ...prev, [param.name]: e.target.value }))}
                                            placeholder={`輸入 ${param.default}...`}
                                        />
                                    </div>
                                ))}
                                <div className="h-px bg-slate-100 my-2"></div>
                            </div>
                        )}

                        {/* 2. Manual Mode / Result Preview */}
                        <div className="relative">
                            <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">
                                {isManualMode ? "最終提示詞 (可直接編輯)" : "預覽結果 (即時更新)"}
                            </label>
                            <textarea
                                className={cn(
                                    "w-full min-h-[140px] text-sm p-3 rounded-lg border resize-y leading-relaxed transition-all",
                                    isManualMode
                                        ? "bg-white border-blue-200 focus:ring-2 focus:ring-blue-500/20 text-slate-800"
                                        : "bg-slate-100/50 border-slate-200 text-slate-600 cursor-default"
                                )}
                                value={finalDisplayContent}
                                onChange={(e) => isManualMode && setManualContent(e.target.value)}
                                readOnly={!isManualMode}
                                placeholder="提示詞內容將顯示於此..."
                            />

                            {/* Reset Button (Only in Manual Mode) */}
                            {isManualMode && parsedParams.length > 0 && (
                                <button
                                    onClick={toggleToAuto}
                                    className="absolute top-8 right-2 p-1.5 bg-slate-100 hover:bg-slate-200 rounded-md text-slate-400 hover:text-slate-600 transition-colors"
                                    title="重置為參數模式"
                                >
                                    <RotateCcw size={14} />
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Primary Actions */}
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleCopy}
                        className={cn(
                            "flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-bold transition-all active:scale-95 shadow-sm border",
                            copied
                                ? "bg-green-500 text-white border-transparent"
                                : "bg-slate-900 text-white border-transparent hover:bg-slate-800 shadow-slate-200"
                        )}
                    >
                        {copied ? (
                            <>
                                <Check size={18} strokeWidth={3} />
                                <span className="tracking-wide">已複製成功</span>
                            </>
                        ) : (
                            <>
                                <Copy size={18} strokeWidth={2.5} />
                                <span>複製提示詞</span>
                            </>
                        )}
                    </button>

                    <button
                        onClick={handleOpenGemini}
                        className="flex-none flex items-center justify-center w-14 h-[50px] rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-200 hover:shadow-xl hover:translate-y-[-2px] active:translate-y-[0px] active:scale-95 transition-all"
                        title="複製並前往 Google Gemini"
                    >
                        <Sparkles size={24} fill="currentColor" className="text-white/90 animate-pulse" />
                    </button>
                </div>
            </div>
        </div>
    );
}
