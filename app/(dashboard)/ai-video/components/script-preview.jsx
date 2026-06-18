import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  FileText, 
  Copy, 
  Check, 
  Download, 
  RefreshCw, 
  Loader2 
} from 'lucide-react';

export default function ScriptPreview({ 
  script, 
  scriptLoading, 
  onGenerateScript, 
  projectId 
}) {
  const [copySuccess, setCopySuccess] = useState(false);

  const handleCopyScript = () => {
    if (script) {
      navigator.clipboard.writeText(script).then(() => {
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      }).catch((err) => {
        console.error('Failed to copy script:', err);
      });
    }
  };

  const handleDownloadScript = () => {
    if (!script) return;
    
    const element = document.createElement('a');
    const file = new Blob([script], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `script-${projectId?.slice(-8)}-${Date.now()}.txt`;
    document.body.appendChild(element);
    element.click();
    if (element && element.parentNode) {
      document.body.removeChild(element);
    }
  };

  return (
    <Card className="p-6 border bg-card/40 border-border">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 
            className="text-[15px] font-bold flex items-center gap-2 text-white"
            style={{ fontFamily: "var(--font-metric)" }}
          >
            <FileText className="h-4.5 w-4.5 text-[#00e5ff]" />
            Generated Voice Script
          </h3>
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleCopyScript}
            className="bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.08)] hover:bg-[rgba(255,255,255,0.08)] text-[#8494b0] hover:text-white text-xs px-3 py-1.5"
          >
            {copySuccess ? (
              <>
                <Check className="h-3.5 w-3.5 mr-1.5 text-[#10ffa0]" />
                Copied
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5 mr-1.5 text-[#7c3aed]" />
                Copy
              </>
            )}
          </Button>
        </div>

        {/* Script Content container */}
        <div className="bg-black/50 rounded-xl p-5 border border-[rgba(255,255,255,0.05)] max-h-[360px] overflow-y-auto scrollbar-thin">
          <pre 
            className="whitespace-pre-wrap font-mono leading-relaxed text-[#dee2f0]"
            style={{ fontSize: "14px" }}
          >
            {script}
          </pre>
        </div>

        {/* Action Buttons bar */}
        <div className="flex gap-2.5 flex-wrap pt-1">
          <Button 
            variant="outline" 
            onClick={onGenerateScript}
            disabled={scriptLoading}
            className="bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.08)] hover:bg-[rgba(255,255,255,0.08)] text-[#8494b0] hover:text-white text-xs font-semibold px-4 py-2"
          >
            {scriptLoading ? (
              <>
                <Loader2 className="h-3.5 w-3.5 mr-2 animate-spin text-[#00e5ff]" />
                Regenerating Script...
              </>
            ) : (
              <>
                <RefreshCw className="h-3.5 w-3.5 mr-2 text-[#00e5ff]" />
                Regenerate Script
              </>
            )}
          </Button>
          
          <Button 
            variant="outline"
            onClick={handleDownloadScript}
            className="bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.08)] hover:bg-[rgba(255,255,255,0.08)] text-[#8494b0] hover:text-white text-xs font-semibold px-4 py-2"
          >
            <Download className="h-3.5 w-3.5 mr-2 text-[#7c3aed]" />
            Download TXT
          </Button>
        </div>
      </div>
    </Card>
  );
}
