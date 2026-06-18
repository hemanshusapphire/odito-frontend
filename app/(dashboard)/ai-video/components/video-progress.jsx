import React from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Loader2, 
  CheckCircle, 
  AlertCircle, 
  RefreshCw 
} from 'lucide-react';

export default function VideoProgress({ 
  videoJobId, 
  videoStatus, 
  progress, 
  currentStep, 
  onClearJob 
}) {
  if (!videoJobId) return null;

  const isCompleted = videoStatus === 'completed';
  const isFailed = videoStatus === 'failed';
  const isProcessing = videoStatus === 'processing' || videoStatus === 'pending';

  // Determine card styles based on status
  const cardStyles = isCompleted
    ? {
        background: 'rgba(16,255,160,0.04)',
        borderColor: 'rgba(16,255,160,0.18)',
        titleColor: '#10ffa0',
        textColor: '#8494b0',
        icon: <CheckCircle className="h-5 w-5 text-[#10ffa0]" />
      }
    : isFailed
    ? {
        background: 'rgba(255,69,96,0.05)',
        borderColor: 'rgba(255,69,96,0.18)',
        titleColor: '#ff4560',
        textColor: '#8494b0',
        icon: <AlertCircle className="h-5 w-5 text-[#ff4560]" />
      }
    : {
        background: 'rgba(0,229,255,0.04)',
        borderColor: 'rgba(0,229,255,0.15)',
        titleColor: '#00e5ff',
        textColor: '#8494b0',
        icon: <Loader2 className="h-5 w-5 text-[#00e5ff] animate-spin" />
      };

  return (
    <div 
      className="border rounded-xl p-5 mb-5 transition-all duration-300"
      style={{
        background: cardStyles.background,
        borderColor: cardStyles.borderColor
      }}
    >
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-0.5">
            {cardStyles.icon}
          </div>
          <div className="flex-1 min-w-0">
            <h4 
              className="font-semibold text-sm leading-tight"
              style={{ color: cardStyles.titleColor, fontFamily: "var(--font-metric)" }}
            >
              {isCompleted ? '🎉 Your video report is ready!' : 
               isFailed ? 'Video generation failed' :
               'Narrated Video is being generated...'}
            </h4>
            
            <p className="text-[12.5px] mt-1 leading-relaxed" style={{ color: cardStyles.textColor }}>
              {isProcessing && currentStep ? currentStep : 
               videoStatus === 'pending' ? 'Preparing audit data and voice script...' : 
               isCompleted ? 'Narration, visuals, and reports successfully compiled!' :
               'An error occurred during rendering. Please clear and try again.'}
            </p>
          </div>
        </div>
        
        {/* Progress Bar */}
        {isProcessing && (
          <div className="space-y-2 pt-1">
            <div className="flex justify-between text-xs font-semibold" style={{ color: 'var(--color-text-secondary)' }}>
              <span>Rendering Stages</span>
              <span className="font-mono text-[#00e5ff]">{progress}%</span>
            </div>
            <Progress value={progress} className="w-full h-1.5" />
          </div>
        )}
        
        {/* Job ID & Manual Actions */}
        <div className="flex items-center justify-between border-t border-[rgba(255,255,255,0.06)] pt-3 text-xs">
          <span className="font-mono text-[10.5px] text-[#4e5f7a] truncate max-w-[240px]">
            Job ID: {videoJobId}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={onClearJob}
            className="text-[10px] h-6 px-2.5 bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.08)] hover:bg-[rgba(255,255,255,0.08)] text-[#8494b0] hover:text-white"
            title="Clear this job if it's stuck or deleted"
          >
            <RefreshCw className="h-3 w-3 mr-1.5" />
            Reset State
          </Button>
        </div>
      </div>
    </div>
  );
}
