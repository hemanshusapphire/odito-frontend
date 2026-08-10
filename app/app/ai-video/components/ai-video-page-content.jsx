"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useProject } from '@/contexts/ProjectContext';
import { 
  generateVideo, 
  getJobStatus, 
  getGeneratedVideo, 
  downloadVideo 
} from '@/services/aiVideoApi';
import VideoProgress from './video-progress';
import VideoPlayerCard from './video-player-card';
import { 
  AlertCircle, 
  Sparkles, 
  RefreshCw,
  FileText,
  Play,
  HelpCircle
} from 'lucide-react';

export default function AIVideoPageContent() {
  const { activeProject, projects, isLoading: projectsLoading, setActiveProject } = useProject();
  const router = useRouter();

  // Video generation state
  const [videoJobId, setVideoJobId] = useState('');
  const [videoLoading, setVideoLoading] = useState(false);
  const [videoError, setVideoError] = useState('');
  const [videoStatus, setVideoStatus] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [pollingInterval, setPollingInterval] = useState(null);
  
  // Video persistence state
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [existingVideoLoading, setExistingVideoLoading] = useState(false);
  const [videoFileName, setVideoFileName] = useState('');
  const [downloadLoading, setDownloadLoading] = useState(false);
  
  // Progress tracking state
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');
  const [lastProgressUpdate, setLastProgressUpdate] = useState(null);



  // Generate video handler
  const handleGenerateVideo = async () => {
    if (!activeProject) {
      setVideoError('No project selected');
      return;
    }

    setVideoLoading(true);
    setVideoError('');
    setVideoJobId('');
    setVideoStatus('');
    setVideoUrl('');
    
    // Reset progress state
    setProgress(0);
    setCurrentStep('');
    setLastProgressUpdate(Date.now());

    // Clear any existing polling
    if (pollingInterval) {
      clearInterval(pollingInterval);
      setPollingInterval(null);
    }

    try {
      console.log('Generating video for project:', activeProject._id);
      const response = await generateVideo(activeProject._id);

      if (response.success && response.jobId) {
        setVideoJobId(response.jobId);
        setVideoStatus('pending');
        
        // Store jobId in localStorage for page refresh handling
        localStorage.setItem(`videoJob_${activeProject._id}`, response.jobId);
        console.log('Video generation job created:', response.jobId);
        
        // Start polling for job status
        startPolling(response.jobId);
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Error generating video:', error);
      setVideoError(error.message || 'Failed to start video generation. Please try again.');
      setVideoLoading(false);
    }
  };

  // Start polling for job status
  const startPolling = (jobId) => {
    console.log('Starting polling for job:', jobId);
    
    const interval = setInterval(async () => {
      try {
        const jobResponse = await getJobStatus(jobId);
        
        if (jobResponse.success && jobResponse.data) {
          const { status, progress: jobProgress = 0, currentStep: step = '', result_data } = jobResponse.data;
          
          console.log('Job status update:', { jobId, status, progress: jobProgress, currentStep: step });
          setVideoStatus(status);
          
          const validatedProgress = Math.max(0, Math.min(100, jobProgress));
          setProgress(prevProgress => {
            return validatedProgress > prevProgress ? validatedProgress : prevProgress;
          });
          
          setCurrentStep(step);
          
          // Check for completion
          if (status === 'completed' && result_data) {
            console.log('Video generation completed!');
            clearInterval(interval);
            setPollingInterval(null);
            setVideoLoading(false);
            setVideoUrl(result_data.videoUrl);
            setVideoFileName(result_data.videoFileName || '');
            setIsVideoReady(true);
            setLastProgressUpdate(null);
            localStorage.removeItem(`videoJob_${activeProject._id}`);
            // Fetch the saved video record to ensure consistency
            setTimeout(() => fetchExistingVideo(), 1000);
            return;
          }
          
          // Check for failure
          if (status === 'failed') {
            console.error('Video generation failed');
            clearInterval(interval);
            setPollingInterval(null);
            setVideoError('Video generation failed. Please try again.');
            setVideoLoading(false);
            setLastProgressUpdate(null);
            localStorage.removeItem(`videoJob_${activeProject._id}`);
            return;
          }
          
          setLastProgressUpdate(Date.now());
        }
      } catch (error) {
        console.error('Error polling job status:', error);
        
        if (error.message.includes('404') || error.message.includes('Not Found')) {
          console.error('Job not found - may have been deleted');
          clearInterval(interval);
          setPollingInterval(null);
          setVideoError('Job was deleted or not found. Please start a new video generation.');
          setVideoLoading(false);
          setVideoJobId(null);
          setVideoStatus('');
          setProgress(0);
          setCurrentStep('');
          setLastProgressUpdate(null);
          localStorage.removeItem(`videoJob_${activeProject._id}`);
          return;
        }
      }
    }, 3000);
    
    setPollingInterval(interval);
  };

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [pollingInterval]);

  // Fetch existing video on component mount and project change
  useEffect(() => {
    if (activeProject && !videoLoading && !videoJobId) {
      fetchExistingVideo();
    }
  }, [activeProject]);

  // Fetch existing video function
  const fetchExistingVideo = async () => {
    if (!activeProject) return;

    setExistingVideoLoading(true);
    try {
      console.log('Fetching existing video for project:', activeProject._id);
      const response = await getGeneratedVideo(activeProject._id);

      // Expected empty state: project has no video yet (getGeneratedVideo returns { success: true, video: null }).
      // Render the normal generate-video UI — not an error condition.
      if (!response?.video) {
        setIsVideoReady(false);
        return;
      }

      const { video } = response;
      console.log('Found existing video:', video);

      if (video.status === 'RENDERED' && video.videoUrl) {
        setVideoUrl(video.videoUrl);
        setVideoFileName(video.videoFileName || '');
        setIsVideoReady(true);
        setVideoStatus('completed');
      } else if (video.status === 'PROCESSING') {
        if (video.jobId) {
          setVideoJobId(video.jobId);
          setVideoLoading(true);
          setVideoStatus('processing');
          startPolling(video.jobId);
        }
      } else if (video.status === 'FAILED') {
        setVideoError('Previous video generation failed. Please try again.');
      }
    } catch (error) {
      // Unexpected failure — 500, network error, auth failure, malformed response.
      // Log and show a neutral empty state; do not surface a user-facing error for this check.
      console.error('Unexpected error checking for existing video:', error);
      setIsVideoReady(false);
    } finally {
      setExistingVideoLoading(false);
    }
  };

  // Handle page refresh - resume polling if active job exists
  useEffect(() => {
    if (activeProject && !videoLoading && !videoUrl && !existingVideoLoading) {
      const storedJobId = localStorage.getItem(`videoJob_${activeProject._id}`);
      
      if (storedJobId) {
        const verifyJob = async () => {
          try {
            const jobResponse = await getJobStatus(storedJobId);
            if (!jobResponse.success || !jobResponse.data) {
              localStorage.removeItem(`videoJob_${activeProject._id}`);
              setVideoJobId(null);
              setVideoLoading(false);
              setVideoStatus('');
              setProgress(0);
              setCurrentStep('');
              fetchExistingVideo();
              return;
            }
            
            setVideoJobId(storedJobId);
            setVideoLoading(true);
            setVideoStatus('processing');
            setLastProgressUpdate(Date.now());
            startPolling(storedJobId);
          } catch (error) {
            localStorage.removeItem(`videoJob_${activeProject._id}`);
            setVideoJobId(null);
            setVideoLoading(false);
            setVideoStatus('');
            setProgress(0);
            setCurrentStep('');
            fetchExistingVideo();
          }
        };
        verifyJob();
      }
    }
  }, [activeProject, existingVideoLoading]);

  // Download video handler
  const handleDownloadVideo = async () => {
    if (!videoFileName) {
      setVideoError('Video filename not available for download');
      return;
    }

    setDownloadLoading(true);
    try {
      const blob = await downloadVideo(videoFileName);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      const projectName = activeProject?.project_name || activeProject?.name || 'video';
      const cleanProjectName = projectName.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 30);
      const timestamp = new Date().toISOString().slice(0, 10);
      const dynamicFilename = `${cleanProjectName}_video_${timestamp}.mp4`;
      
      link.download = dynamicFilename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      setVideoError(error.message || 'Failed to download video file');
    } finally {
      setDownloadLoading(false);
    }
  };

  // Manual cleanup for stuck jobs
  const handleClearJob = () => {
    setVideoJobId(null);
    setVideoLoading(false);
    setVideoStatus('');
    setProgress(0);
    setCurrentStep('');
    setVideoError('');
    
    if (pollingInterval) {
      clearInterval(pollingInterval);
      setPollingInterval(null);
    }
    
    if (activeProject) {
      localStorage.removeItem(`videoJob_${activeProject._id}`);
    }
  };

  if (!activeProject) {
    return (
      <div className="flex-1 max-w-md mx-auto p-8 text-center pt-24">
        <div className="w-16 h-16 rounded-2xl bg-yellow-500/10 flex items-center justify-center mx-auto mb-4 border border-yellow-500/20">
          <HelpCircle className="h-8 w-8 text-yellow-500" />
        </div>
        <h1 
          className="text-xl font-bold mb-2 text-foreground" 
          style={{ fontFamily: "var(--font-metric)" }}
        >
          No Project Selected
        </h1>
        <p className="text-sm text-[#8494b0] mb-6">
          {projects && projects.length > 0 
            ? "Please select a project from the header dropdown to generate your narrated AI video summary."
            : "Please create a project first before utilizing the AI video generator."}
        </p>
        
        {projects && projects.length > 0 && (
          <div className="space-y-2 text-left mb-6 bg-card/40 p-4 border border-border rounded-xl">
            <h3 className="text-xs font-bold text-[#4e5f7a] text-center mb-2 uppercase tracking-wider">Quick Select Project</h3>
            {projects.slice(0, 3).map(p => (
              <button
                key={p._id}
                onClick={() => setActiveProject(p)}
                className="w-full text-left p-3 rounded-lg border border-border bg-card/60 hover:bg-card hover:border-[rgba(255,255,255,0.15)] transition-all duration-200"
              >
                <div className="font-semibold text-xs text-foreground">
                  {p.project_name || p.name}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6">
      {/* Header bar */}
      <div className="border-b border-border pb-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 
            className="text-2xl font-bold tracking-tight text-foreground"
            style={{ fontFamily: "var(--font-metric)" }}
          >
            AI Video Report
          </h1>
          <p className="text-sm text-muted-foreground mt-1.5">
            Generate an automated narrated overview report of your project's AI visibility and SEO metrics
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-[#8494b0] font-medium">Active:</span>
          <Badge variant="secondary" className="bg-[rgba(0,229,255,0.08)] text-[#00e5ff] border border-[rgba(0,229,255,0.16)] px-2.5 py-0.5">
            {activeProject?.project_name || activeProject?.name || 'Unknown'}
          </Badge>
        </div>
      </div>

      {/* Generation explainer banner */}
      <div 
        className="border rounded-2xl p-7 relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, rgba(124,58,237,0.08), rgba(0,229,255,0.03))',
          borderColor: 'rgba(124,58,237,0.18)'
        }}
      >
        <div className="space-y-3">
          <h3 
            className="text-xl font-bold text-foreground flex items-center gap-2.5"
            style={{ fontFamily: "var(--font-metric)" }}
          >
            <Sparkles className="h-6 w-6 text-[#00e5ff]" />
            What is the AI Video Report?
          </h3>
          <p className="text-base leading-relaxed text-muted-foreground max-w-[840px] pt-0.5">
            This module parses your entire domain's SEO scorecards, Core Web Vitals, and search intent structures. It then generates a structured script, matches it with professional voice narration, and renders a slide summary presentation perfect for sharing with stakeholders.
          </p>
        </div>
      </div>

      <div className="grid gap-6">
        {/* Generate / Action card */}
        <Card className="p-6 border bg-card/60 border-border">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 
                  className="text-lg font-bold text-foreground"
                  style={{ fontFamily: "var(--font-metric)" }}
                >
                  Generate Presentation Video
                </h3>
                <p className="text-sm text-muted-foreground mt-1.5">
                  Begin the automated video narration rendering pipeline for the current project.
                </p>
              </div>
            </div>

            {/* Error Message banner */}
            {videoError && (
              <div className="bg-[rgba(255,69,96,0.05)] border border-[rgba(255,69,96,0.18)] rounded-xl p-4 flex items-start gap-3 text-xs">
                <AlertCircle className="h-4.5 w-4.5 text-[#ff4560] flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-bold text-[#ff4560]">Generation Error</h4>
                  <p className="text-muted-foreground mt-0.5">{videoError}</p>
                  {(videoError.includes('deleted') || videoError.includes('not found')) && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleClearJob}
                      className="text-[10px] mt-2.5 h-6 px-2.5 bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.08)] hover:bg-[rgba(255,255,255,0.08)] text-[#ff4560]"
                    >
                      <RefreshCw className="h-3 w-3 mr-1.5" />
                      Reset State
                    </Button>
                  )}
                </div>
              </div>
            )}

            {/* Render video progress details if running */}
            <VideoProgress 
              videoJobId={videoJobId}
              videoStatus={videoStatus}
              progress={progress}
              currentStep={currentStep}
              onClearJob={handleClearJob}
            />

            {/* Trigger Button - hidden during active build or when ready */}
            {!videoLoading && !isVideoReady && (
              <div className="pt-1">
                <Button 
                  onClick={handleGenerateVideo}
                  size="lg"
                  className="w-full sm:w-auto bg-gradient-to-r from-[#7c3aed] to-[#00e5ff] hover:opacity-90 hover:scale-[1.01] text-white border-none shadow-[0_0_24px_rgba(0,229,255,0.14)] transition-all duration-300 text-sm font-semibold h-11 px-6"
                >
                  <Sparkles className="h-4.5 w-4.5 mr-2 text-white" />
                  Generate Automated Video
                </Button>
              </div>
            )}
          </div>
        </Card>

        {/* Video Player Display */}
        {videoUrl && isVideoReady && (
          <VideoPlayerCard 
            videoUrl={videoUrl}
            videoFileName={videoFileName}
            downloadLoading={downloadLoading}
            onDownloadVideo={handleDownloadVideo}
          />
        )}


      </div>
    </div>
  );
}
