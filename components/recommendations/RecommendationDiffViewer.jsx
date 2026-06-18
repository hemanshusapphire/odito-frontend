"use client"

import { useState, useMemo, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { DiffEditor } from "@monaco-editor/react"
import { Maximize2, Minimize2, Eye } from "lucide-react"

// Reuse theme config to keep styling consistent
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
      "diffEditor.insertedTextBackground": "rgba(0, 245, 160, 0.09)",
      "diffEditor.insertedLineBackground": "rgba(0, 245, 160, 0.05)",
      "diffEditor.removedTextBackground": "rgba(255, 56, 96, 0.09)",
      "diffEditor.removedLineBackground": "rgba(255, 56, 96, 0.05)",
    },
  })
}

function detectLanguage(content, defaultLang = "text") {
  if (!content) return defaultLang
  const trimmed = content.trim()

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

  if (
    /<[a-z][\s\S]*>/i.test(trimmed) ||
    trimmed.toLowerCase().includes("<!doctype html>") ||
    trimmed.toLowerCase().includes("<html") ||
    trimmed.toLowerCase().includes("<div") ||
    trimmed.toLowerCase().includes("<script")
  ) {
    return "html"
  }

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

  return defaultLang
}

function getStateString(state) {
  if (!state) return ""
  if (state.isAbsent) return ""
  if (state.codeContent) return state.codeContent
  if (state.rawText) return state.rawText
  if (state.displayType === "list" && state.listItems) {
    return state.listItems.map((item) => `• ${item}`).join("\n")
  }
  if (state.displayType === "table" && state.tableRows) {
    return JSON.stringify(state.tableRows, null, 2)
  }
  if (state.displayType === "chain" && state.chainHops) {
    return state.chainHops.join(" → ")
  }
  return state.summary || ""
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

export default function RecommendationDiffViewer({ beforeState, afterState }) {
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [wordWrap, setWordWrap] = useState("on")

  // Capture editor instances so we can safely detach models before unmount.
  // @monaco-editor/react disposes TextModels during cleanup, but if the
  // DiffEditorWidget is still referencing them it throws:
  //   "TextModel got disposed before DiffEditorWidget model got reset"
  // Calling setModel({ original: null, modified: null }) first detaches the
  // models from the widget before disposal, preventing that crash.
  const inlineEditorRef = useRef(null)
  const fullscreenEditorRef = useRef(null)

  useEffect(() => {
    return () => {
      for (const ref of [inlineEditorRef, fullscreenEditorRef]) {
        if (ref.current) {
          try { ref.current.setModel({ original: null, modified: null }) } catch (_) {}
          ref.current = null
        }
      }
    }
  }, [])

  const beforeStr = useMemo(() => getStateString(beforeState), [beforeState])
  const afterStr = useMemo(() => getStateString(afterState), [afterState])

  const detectedLang = useMemo(() => {
    const lang = detectLanguage(afterStr)
    return lang !== "text" ? lang : detectLanguage(beforeStr)
  }, [beforeStr, afterStr])

  const originalContent = useMemo(() => formatCode(beforeStr, detectedLang), [beforeStr, detectedLang])
  const modifiedContent = useMemo(() => formatCode(afterStr, detectedLang), [afterStr, detectedLang])

  const diffOptions = {
    readOnly: true,
    originalEditable: false,
    minimap: { enabled: false },
    wordWrap: "on",
    scrollBeyondLastLine: false,
    fontSize: 10,
    fontFamily: "'DM Mono', 'Fira Code', 'Cascadia Code', monospace",
    lineNumbers: "on",
    renderSideBySide: true,
    automaticLayout: true,
    scrollbar: {
      vertical: "auto",
      horizontal: "auto",
      verticalScrollbarSize: 8,
      horizontalScrollbarSize: 8,
    },
  }

  return (
    <div className="rounded-xl border border-[rgba(255,255,255,0.07)] bg-[rgba(255,255,255,0.015)] overflow-hidden relative flex flex-col">
      {/* Header toolbar */}
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.03)] select-none">
        <div className="flex items-center gap-1.5">
          <Eye size={11} className="text-[#4e5f7a]" />
          <span className="text-[9px] font-bold text-[#8494b0] uppercase tracking-wider font-mono">
            Diff Viewer ({detectedLang})
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setIsFullscreen(true)}
            className="flex items-center gap-1 text-[10px] text-[#4e5f7a] hover:text-[#8494b0] transition-colors px-2 py-1 rounded hover:bg-[rgba(255,255,255,0.05)] cursor-pointer"
            title="Fullscreen Diff View"
          >
            <Maximize2 size={11} />
            <span>Fullscreen Diff</span>
          </button>
        </div>
      </div>

      {/* Editor Content Area */}
      <div className="relative overflow-hidden w-full h-[220px]">
        <DiffEditor
          original={originalContent}
          modified={modifiedContent}
          language={detectedLang}
          theme="odito-dark"
          options={diffOptions}
          beforeMount={handleEditorWillMount}
          onMount={(editor) => { inlineEditorRef.current = editor }}
          keepCurrentOriginalModel={true}
          keepCurrentModifiedModel={true}
        />
      </div>

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
                <span className="w-2 h-2 rounded-full bg-[#00dfff] shadow-[0_0_8px_#00dfff]" />
                <span className="text-[10px] font-bold text-white uppercase tracking-wider font-mono">
                  Side-By-Side Before / After Diff
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
                  onClick={() => setIsFullscreen(false)}
                  className="text-xs px-3 py-1.5 rounded-lg border border-[rgba(255,56,96,0.2)] bg-[rgba(255,56,96,0.05)] text-[#ff3860] hover:bg-[rgba(255,56,96,0.15)] transition-colors cursor-pointer flex items-center gap-1"
                >
                  <Minimize2 size={12} />
                  <span>Exit Fullscreen</span>
                </button>
              </div>
            </div>
            <div className="flex-1 rounded-xl border border-[rgba(255,255,255,0.08)] overflow-hidden bg-[#07090e] shadow-2xl">
              <DiffEditor
                original={originalContent}
                modified={modifiedContent}
                language={detectedLang}
                theme="odito-dark"
                options={{ ...diffOptions, wordWrap, fontSize: 12 }}
                beforeMount={handleEditorWillMount}
                onMount={(editor) => { fullscreenEditorRef.current = editor }}
                keepCurrentOriginalModel={true}
                keepCurrentModifiedModel={true}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
