import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Play, 
  Download, 
  Copy, 
  Check, 
  Loader2 
} from 'lucide-react';

export default function VideoPlayerCard({ 
  videoUrl, 
  videoFileName, 
  downloadLoading, 
  onDownloadVideo 
}) {
  const [copySuccess, setCopySuccess] = useState(false);

  const handleCopyLink = () => {
    if (videoUrl) {
      navigator.clipboard.writeText(videoUrl).then(() => {
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      }).catch((err) => {
        console.error('Failed to copy link:', err);
      });
    }
  };

  return (
    <Card 
      className="p-6 border bg-card/60 transition-all duration-300 relative overflow-hidden"
      style={{
        borderColor: 'rgba(16,255,160,0.12)',
        background: 'linear-gradient(180deg, rgba(16,255,160,0.02) 0%, rgba(0,0,0,0) 100%)'
      }}
    >
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <h3 
            className="text-lg font-bold flex items-center gap-2 text-white"
            style={{ fontFamily: "var(--font-metric)" }}
          >
            <Play className="h-5 w-5 text-[#10ffa0] fill-[#10ffa0]/10" />
            Narration Video Ready
          </h3>
          <Badge 
            variant="secondary" 
            className="text-xs font-semibold bg-[rgba(16,255,160,0.08)] text-[#10ffa0] border border-[rgba(16,255,160,0.18)]"
          >
            ✔ COMPLETED
          </Badge>
        </div>
        
        {/* Video Player wrapper */}
        <div className="border border-[rgba(255,255,255,0.075)] rounded-xl overflow-hidden bg-black/60 shadow-[0_8px_32px_rgba(0,0,0,0.4)] aspect-video">
          <video 
            controls 
            className="w-full h-full object-contain"
            src={videoUrl}
          >
            Your browser does not support the video tag.
          </video>
        </div>
        
        {/* Actions bar */}
        <div className="flex gap-2.5 flex-wrap pt-1">
          <Button 
            variant="outline" 
            size="sm"
            onClick={onDownloadVideo}
            disabled={downloadLoading || !videoFileName}
            className="bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.08)] hover:bg-[rgba(255,255,255,0.08)] text-white text-sm font-medium h-9 px-4"
          >
            {downloadLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin text-[#00e5ff]" />
                Downloading...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2 text-[#00e5ff]" />
                Download Video
              </>
            )}
          </Button>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleCopyLink}
            className="bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.08)] hover:bg-[rgba(255,255,255,0.08)] text-white text-sm font-medium h-9 px-4"
          >
            {copySuccess ? (
              <>
                <Check className="h-4 w-4 mr-2 text-[#10ffa0]" />
                Copied Link
              </>
            ) : (
              <>
                <Copy className="h-4 w-4 mr-2 text-[#7c3aed]" />
                Copy Video Link
              </>
            )}
          </Button>
        </div>
      </div>
    </Card>
  );
}
