import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { IssueRecommendationPanel } from "@/components/recommendations";
import DIYRenderer from "@/components/diy/DIYRenderer";
import AuditIQHelp from "./AuditIQHelp";
import CurrentStateRenderer from "@/components/issue-context/CurrentStateRenderer";
import { useIssueContext } from "@/hooks/useIssueContext";
import styles from "../ai-search-audit.module.css";
import { useProject } from "@/contexts/ProjectContext";
import apiService from "@/lib/apiService";

function IssueCurrentStateSection({ projectId, issueId, pageUrl }) {
  const { data: issueContext, isLoading, error } = useIssueContext(projectId, issueId, pageUrl);

  if (!pageUrl) return null;

  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{
        fontSize: "9px",
        fontWeight: 700,
        color: "var(--t3)",
        textTransform: "uppercase",
        letterSpacing: "0.1em",
        marginBottom: 10,
        display: "flex",
        alignItems: "center",
        gap: 8,
      }}>
        <span style={{ flex: 1, height: 1, background: "var(--b)" }} />
        Detected Issue
        <span style={{ flex: 1, height: 1, background: "var(--b)" }} />
      </div>
      <CurrentStateRenderer
        issueContext={issueContext}
        isLoading={isLoading}
        error={error}
      />
      <div style={{ height: 14, borderBottom: "1px solid var(--b)", marginTop: 14 }} />
    </div>
  );
}

export default function FixPanel({ issue, selIdx, mode, setMode, onFixed }) {
  const { activeProject } = useProject();
  const selUrl = issue.urls?.[selIdx]?.url || null;
  const issueId = issue.id || issue.issue_code || issue.rule_id;

  // Fetch live issue context — provides real detected values to both the
  // CurrentStateRenderer and the recommendation mutation payload.
  const { data: issueContextData } = useIssueContext(activeProject?._id, issueId, selUrl);

  // Mutation state lifted to parent (persists across tab switches)
  const recommendationMutation = useMutation({
    mutationFn: async () => {
      const response = await apiService.request('/recommendations/generate', {
        method: 'POST',
        body: JSON.stringify({
          projectId: activeProject?._id,
          issueId,
          issueSource: "ai_visibility",
          pageUrl: selUrl || undefined,
          ruleMetadata: {
            title: issue.title || issue.issue || issue.issue_message,
            description: issue.description || issue.issue_message,
            category: issue.category,
            severity: issue.severity,
            difficulty: issue.difficulty,
          },
          issueContext: issueContextData ? {
            currentState: issueContextData.currentState,
            expectedState: issueContextData.expectedState,
            pageContext: issueContextData.pageContext,
          } : undefined,
        }),
      });
      if (!response.success) throw new Error(response.message || 'Generation failed');
      return response;
    },
    retry: 1,
  });

  const { data, isIdle, isPending, isSuccess, isError, error } = recommendationMutation;
  const recommendation = data?.data;
  const meta = data?.meta;

  console.log(`[RECOMMENDATION_UI] ai-search-audit FixPanel | issue=${issueId} | url=${selUrl} | projectId=${activeProject?._id}`);

  return (
    <div className={styles.fixPanel}>
      <div className={styles.fixPanelTitle}>
        {selIdx !== null
          ? `✦ AI Recommendation: ${issue.urls?.[selIdx]?.url?.split("/").pop() || "page"}`
          : "Fix Assistant"}
      </div>
      {/* Current State — shows DETECTED ISSUE / CURRENT STATE before recommendation tabs */}
      <IssueCurrentStateSection
        projectId={activeProject?._id}
        issueId={issueId}
        pageUrl={selUrl}
      />

      <div className={styles.modeTabs}>
        <button className={`${styles.modeTab}${mode==="ai"  ? " " + styles.modeTabOn : ""}`} onClick={() => setMode("ai")}>✦ AI Fix</button>
        <button className={`${styles.modeTab}${mode==="diy" ? " " + styles.modeTabOn : ""}`} onClick={() => setMode("diy")}>🛠 DIY</button>
        <button className={`${styles.modeTab}${mode==="help"? " " + styles.modeTabOn : ""}`} onClick={() => setMode("help")}>🤝 AuditIQ</button>
      </div>
      {mode === "ai" && (
        <IssueRecommendationPanel
          projectId={activeProject?._id}
          issueId={issueId}
          issueSource="ai_visibility"
          selUrl={selUrl}
          issue={issue}
          onMarkFixed={onFixed}
          // Pass mutation state as props (panel becomes pure render component)
          mutationState={{
            isIdle,
            isPending,
            isSuccess,
            isError,
            error,
            recommendation,
            meta,
          }}
          onGenerate={() => recommendationMutation.mutate()}
          onReset={() => recommendationMutation.reset()}
        />
      )}
      {mode === "diy" && recommendation && (
        <DIYRenderer
          recommendation={recommendation}
          issue={issue}
        />
      )}
      {mode === "diy" && !recommendation && (
        <div style={{ padding: "20px", textAlign: "center", color: "#8494b0" }}>
          Generate an AI recommendation first to access the DIY guide.
        </div>
      )}
      {mode === "help" && <AuditIQHelp issue={issue} />}
    </div>
  );
}
