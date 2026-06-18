"use client"

import { useState, useMemo, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Editor from "@monaco-editor/react"
import { Copy, Check, Maximize2, Minimize2, ChevronDown, ChevronUp } from "lucide-react"

// Theme config matching Odito's dark premium design
const handleEditorWillMount = (monaco) => {
  monaco.editor.defineTheme("odito-dark", {
    base: "vs-dark",
    inherit: true,
    rules: [
      { token: "", foreground: "c0d0e8", background: "07090e" },
      { token: "comment", foreground: "4e5f7a", fontStyle: "italic" },
      { token: "keyword", foreground: "a78bfa" },
      { token: "string", foreground: "00f5a0" },
      { token: "number", foreground: "00dfff" },
      { token: "regexp", foreground: "ffb703" },
      { token: "type", foreground: "00dfff" },
      { token: "class", foreground: "ff8800" },
    ],
    colors: {
      "editor.background": "#07090e",
      "editor.foreground": "#c0d0e8",
      "editorLineNumber.foreground": "#3c485d",
      "editorLineNumber.activeForeground": "#8494b0",
      "editor.lineHighlightBackground": "#111420",
      "scrollbarSlider.background": "rgba(255,255,255,0.06)",
      "scrollbarSlider.hoverBackground": "rgba(255,255,255,0.1)",
      "scrollbarSlider.activeBackground": "rgba(255,255,255,0.15)",
      "editor.border": "#1a1f2e",
    },
  })
}

function detectLanguage(content, defaultLang = "text") {
  if (!content) return defaultLang
  const trimmed = content.trim()

  // JSON / JSON-LD detection
  if ((trimmed.startsWith("{") && trimmed.endsWith("}")) || (trimmed.startsWith("[") && trimmed.endsWith("]"))) {
    try {
      JSON.parse(trimmed)
      return "json"
    } catch {
      // ignore
    }
  }

  if (trimmed.includes('"@context"') || trimmed.includes('"@type"')) {
    return "json"
  }

  // HTML detection
  if (
    /<[a-z][\s\S]*>/i.test(trimmed) ||
    trimmed.toLowerCase().includes("<!doctype html>") ||
    trimmed.toLowerCase().includes("<html") ||
    trimmed.toLowerCase().includes("<div") ||
    trimmed.toLowerCase().includes("<script")
  ) {
    return "html"
  }

  // JS detection
  if (
    trimmed.includes("const ") ||
    trimmed.includes("let ") ||
    trimmed.includes("function ") ||
    trimmed.includes("import ") ||
    trimmed.includes("export ") ||
    trimmed.includes("=>")
  ) {
    return "javascript"
  }

  // CSS detection
  if (
    trimmed.includes("{") &&
    trimmed.includes("}") &&
    (trimmed.includes(":") || trimmed.includes("margin") || trimmed.includes("padding") || trimmed.includes("color"))
  ) {
    return "css"
  }

  // Markdown detection
  if (trimmed.startsWith("#") || trimmed.includes("## ") || trimmed.includes("* ") || (trimmed.includes("[") && trimmed.includes("]("))) {
    return "markdown"
  }

  return defaultLang
}

function formatCode(content, language) {
  if (!content) return ""
  const trimmed = content.trim()

  if (language === "json") {
    try {
      return JSON.stringify(JSON.parse(trimmed), null, 2)
    } catch {
      return content
    }
  }

  if (language === "html") {
    // Format JSON-LD script block if present
    const jsonLdMatch = trimmed.match(/(<script\b[^>]*type=["']application\/ld\+json["'][^>]*>)([\s\S]*?)(<\/script>)/i)
    if (jsonLdMatch) {
      try {
        const jsonContent = jsonLdMatch[2].trim()
        const formattedJson = JSON.stringify(JSON.parse(jsonContent), null, 2)
        const indentedJson = formattedJson
          .split("\n")
          .map((line) => "  " + line)
          .join("\n")
        return `${jsonLdMatch[1]}\n${indentedJson}\n${jsonLdMatch[3]}`
      } catch {
        // ignore fallback
      }
    }

    // Simple HTML indent formatter
    try {
      let formatted = ""
      let indent = ""
      const reg = /(<[^>]+>)/g
      const elements = trimmed.replace(reg, "\r\n$1\r\n").split("\r\n")

      elements.forEach((el) => {
        const element = el.trim()
        if (!element) return

        if (element.match(/^<\/\w/)) {
          indent = indent.substring(2)
        }

        formatted += indent + element + "\n"

        if (
          element.match(/^<\w[^>]*[^\/]>$/) &&
          !element.startsWith("<!--") &&
          !element.match(/^<(area|base|br|col|embed|hr|img|input|link|meta|param|source|track|wbr)/i)
        ) {
          indent += "  "
        }
      })
      return formatted.trim()
    } catch {
      return content
    }
  }

  return content
}

export default function RecommendationCodeBlock({ type = "text", content, index = 0 }) {
  const [copied, setCopied] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [wordWrap, setWordWrap] = useState("on")

  // Prevent Monaco's "TextModel got disposed before DiffEditorWidget model got reset" crash.
  // keepCurrentModel stops @monaco-editor/react from disposing the model on unmount.
  // The useEffect cleanup detaches the model from the editor widget first, so Monaco's
  // own disposal sequence completes without hitting an already-gone model.
  const inlineEditorRef = useRef(null)
  const fullscreenEditorRef = useRef(null)

  useEffect(() => {
    return () => {
      for (const ref of [inlineEditorRef, fullscreenEditorRef]) {
        if (ref.current) {
          try { ref.current.setModel(null) } catch (_) {}
          ref.current = null
        }
      }
    }
  }, [])

  const detectedLang = useMemo(() => detectLanguage(content, type), [content, type])
  const formattedContent = useMemo(() => formatCode(content, detectedLang), [content, detectedLang])

  const lengthExceeded = content.length > 500

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(formattedContent)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // ignore
    }
  }

  const editorOptions = {
    readOnly: true,
    minimap: { enabled: false },
    wordWrap: "on",
    scrollBeyondLastLine: false,
    fontSize: 11,
    fontFamily: "'DM Mono', 'Fira Code', 'Cascadia Code', monospace",
    lineNumbers: "on",
    glyphMargin: false,
    folding: false,
    lineDecorationsWidth: 10,
    lineNumbersMinChars: 3,
    theme: "odito-dark",
    automaticLayout: true,
    domReadOnly: true,
    contextmenu: false,
    scrollbar: {
      vertical: "auto",
      horizontal: "auto",
      useShadows: false,
      verticalHasArrows: false,
      horizontalHasArrows: false,
      verticalScrollbarSize: 8,
      horizontalScrollbarSize: 8,
    },
  }

  // Sizing styles
  const wrapperHeight = isExpanded ? "400px" : "180px"

  return (
    <div
      className="rounded-xl border border-[rgba(255,255,255,0.07)] bg-[rgba(255,255,255,0.015)] overflow-hidden relative flex flex-col"
      style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.25)" }}
    >
      {/* Header toolbar */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.03)] select-none">
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-[#7730ed] to-[#00dfff]" />
          <span className="text-[9px] font-bold text-[#8494b0] uppercase tracking-wider font-mono">
            {detectedLang}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          {lengthExceeded && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-1 text-[10px] text-[#4e5f7a] hover:text-[#8494b0] transition-colors px-2 py-1 rounded hover:bg-[rgba(255,255,255,0.05)] cursor-pointer"
              title={isExpanded ? "Collapse View" : "Expand View"}
            >
              {isExpanded ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
              {isExpanded ? "Collapse" : "Expand"}
            </button>
          )}
          <button
            onClick={() => setIsFullscreen(true)}
            className="flex items-center gap-1 text-[10px] text-[#4e5f7a] hover:text-[#8494b0] transition-colors px-2 py-1 rounded hover:bg-[rgba(255,255,255,0.05)] cursor-pointer"
            title="Fullscreen View"
          >
            <Maximize2 size={11} />
            <span>Fullscreen</span>
          </button>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 text-[10px] text-[#4e5f7a] hover:text-[#8494b0] transition-colors px-2 py-1 rounded hover:bg-[rgba(255,255,255,0.05)] cursor-pointer"
          >
            {copied ? <Check size={11} className="text-[#00f5a0]" /> : <Copy size={11} />}
            <span>{copied ? "Copied" : "Copy"}</span>
          </button>
        </div>
      </div>

      {/* Editor Content Area */}
      <div className="relative overflow-hidden w-full" style={{ height: wrapperHeight }}>
        <Editor
          height="100%"
          language={detectedLang}
          value={formattedContent}
          theme="odito-dark"
          options={editorOptions}
          beforeMount={handleEditorWillMount}
          onMount={(editor) => { inlineEditorRef.current = editor }}
          keepCurrentModel={true}
        />
        {/* Bottom Fade Gradient for Preview Mode */}
        {lengthExceeded && !isExpanded && (
          <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-[#07090e] to-transparent pointer-events-none z-10" />
        )}
      </div>

      {/* Bottom Expand Bar (only shown in preview mode) */}
      {lengthExceeded && !isExpanded && (
        <div className="absolute bottom-0 left-0 right-0 flex justify-center pb-2 pt-6 bg-gradient-to-t from-[#07090e] via-[#07090e]/95 to-transparent z-20">
          <button
            onClick={() => setIsExpanded(true)}
            className="flex items-center gap-1 px-3 py-1 rounded-full border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.1)] text-[10.5px] font-semibold text-[#8494b0] hover:text-white transition-all shadow-md cursor-pointer"
          >
            <ChevronDown size={12} className="animate-bounce" />
            <span>Expand Recommendation ({content.length} chars)</span>
          </button>
        </div>
      )}

      {/* Expanded Collapse Bar at bottom */}
      {lengthExceeded && isExpanded && (
        <div className="flex justify-center py-2 border-t border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.01)]">
          <button
            onClick={() => setIsExpanded(false)}
            className="flex items-center gap-1 text-[10px] font-semibold text-[#4e5f7a] hover:text-[#8494b0] transition-colors cursor-pointer"
          >
            <ChevronUp size={12} />
            <span>Collapse View</span>
          </button>
        </div>
      )}

      {/* Fullscreen Overlay */}
      <AnimatePresence>
        {isFullscreen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 bg-[#06080c]/95 backdrop-blur-md z-[9999] flex flex-col p-6"
          >
            <div className="flex items-center justify-between mb-4 bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] rounded-xl p-3 shadow-lg">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#7730ed] shadow-[0_0_8px_#7730ed]" />
                <span className="text-[10px] font-bold text-white uppercase tracking-wider font-mono">
                  {detectedLang} · Fullscreen Code Viewer
                </span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setWordWrap((w) => (w === "on" ? "off" : "on"))}
                  className="text-xs px-3 py-1.5 rounded-lg border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.04)] text-[#8494b0] hover:text-white transition-colors cursor-pointer"
                >
                  Word Wrap: {wordWrap === "on" ? "ON" : "OFF"}
                </button>
                <button
                  onClick={handleCopy}
                  className="text-xs px-3 py-1.5 rounded-lg border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.04)] text-[#8494b0] hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  {copied ? <Check size={12} className="text-[#00f5a0]" /> : <Copy size={12} />}
                  <span>{copied ? "Copied" : "Copy Code"}</span>
                </button>
                <button
                  onClick={() => setIsFullscreen(false)}
                  className="text-xs px-3 py-1.5 rounded-lg border border-[rgba(255,56,96,0.2)] bg-[rgba(255,56,96,0.05)] text-[#ff3860] hover:bg-[rgba(255,56,96,0.15)] transition-colors cursor-pointer flex items-center gap-1"
                >
                  <Minimize2 size={12} />
                  <span>Exit Fullscreen</span>
                </button>
              </div>
            </div>
            <div className="flex-1 rounded-xl border border-[rgba(255,255,255,0.08)] overflow-hidden bg-[#07090e] shadow-2xl">
              <Editor
                height="100%"
                language={detectedLang}
                value={formattedContent}
                theme="odito-dark"
                options={{ ...editorOptions, wordWrap, fontSize: 13 }}
                beforeMount={handleEditorWillMount}
                onMount={(editor) => { fullscreenEditorRef.current = editor }}
                keepCurrentModel={true}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
