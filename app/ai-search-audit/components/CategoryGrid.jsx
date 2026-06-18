import CategoryCard from "./CategoryCard";
import styles from "../ai-search-audit.module.css";

const ALL_CATEGORIES = [
  { id:"ai_impact",            label:"AI Impact",            icon:"🧠", color:"#00f5a0", desc:"How much AI models surface your content" },
  { id:"citation_probability", label:"Citation Probability", icon:"🔗", color:"#00dfff", desc:"Likelihood of being cited in AI answers" },
  { id:"llm_readiness",        label:"LLM Readiness",        icon:"🤖", color:"#c77dff", desc:"How well LLMs can parse your content" },
  { id:"aeo_score",            label:"AEO Score",            icon:"❓", color:"#ffb703", desc:"Answer Engine Optimization quality" },
  { id:"topical_authority",    label:"Topical Authority",    icon:"🎯", color:"#ff3860", desc:"Depth of topic coverage in your niche" },
  { id:"voice_intent",         label:"Voice Intent",         icon:"🎙", color:"#8b5cf6", desc:"Alignment with voice & conversational queries" },
];

/**
 * Renders a grid of category score cards.
 *
 * @param {object}  aiData         - AI visibility data containing `categories` map.
 * @param {Set}     [categoryFilter] - Optional Set of category IDs to render.
 *                                    When omitted all six categories are shown
 *                                    (backward-compatible default).
 * @param {string}  [sectionLabel] - Optional override for the section divider label.
 */
export default function CategoryGrid({ aiData, categoryFilter, sectionLabel }) {
  const rawCats = aiData?.categories ?? {};

  const visible = ALL_CATEGORIES
    .filter(c => !categoryFilter || categoryFilter.has(c.id))
    .map(c => ({ ...c, val: Math.round(rawCats[c.id] || 0) }));

  const label = sectionLabel ?? "AI Visibility Categories";

  return (
    <>
      <div className={styles.secDivider}>
        <div className={styles.secDividerLine} />
        <span className={styles.secDividerLbl}>{label}</span>
        <div className={styles.secDividerLine} />
      </div>
      <div className={styles.catStrip}>
        {visible.map((c, i) => (
          <CategoryCard key={c.id} {...c} index={i} />
        ))}
      </div>
    </>
  );
}
