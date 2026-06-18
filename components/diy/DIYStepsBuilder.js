/**
 * DIY Steps Builder
 * =================
 * 
 * Dynamically converts recommendation intelligence into structured steps.
 * 
 * Transforms:
 * - recommendedFix
 * - implementationExample
 * - context
 * - category
 * 
 * Into structured DIY steps.
 * 
 * NO hardcoded issue templates.
 * Dynamic generation based on recommendation content.
 */

/**
 * Build DIY steps from recommendation sections.
 * 
 * @param {Object} recommendation - Recommendation with sections
 * @returns {Array} Array of step objects { title, description, type }
 */
export function buildDIYSteps(recommendation) {
  if (!recommendation || !recommendation.sections) {
    return [];
  }

  const { sections } = recommendation;
  const steps = [];

  // Only include the code example step — all generic steps (understand, locate,
  // implement, validate) have been removed; they add no issue-specific value.
  if (sections.implementationExample?.content) {
    steps.push({
      title: "Code Example",
      description: "Use the following implementation as a reference:",
      type: "code",
      code: sections.implementationExample.content,
      codeType: sections.implementationExample.type || "html",
    });
  }

  return steps;
}

/**
 * Build location step based on context and category.
 */
function buildLocationStep(sections, context) {
  const category = sections.category || context?.category || "general";
  const pageType = context?.pageType || "Generic";
  const framework = context?.framework || "generic";

  let description = "Locate the relevant element in your codebase.";

  // Context-aware location hints
  if (category.includes("schema")) {
    description = "Locate the JSON-LD schema markup in your page's <head> section or schema block.";
  } else if (category.includes("meta")) {
    description = "Locate the <meta> tags in your page's <head> section.";
  } else if (category.includes("content")) {
    description = `Locate the content area in your ${pageType} page template.`;
  } else if (category.includes("accessibility")) {
    description = "Locate the element that needs accessibility improvements in your markup.";
  } else if (category.includes("technical")) {
    description = "Locate the technical configuration or code that needs updating.";
  }

  // Framework-specific hints
  if (framework === "nextjs") {
    description += " In Next.js, check your page components or layout files.";
  } else if (framework === "wordpress") {
    description += " In WordPress, check your theme files or use a plugin.";
  } else if (framework === "shopify") {
    description += " In Shopify, check your theme templates in the code editor.";
  }

  return {
    title: "Locate the Element",
    description,
    type: "location",
  };
}

/**
 * Build validation step based on category and context.
 */
function buildValidationStep(sections, context) {
  const category = sections.category || context?.category || "general";
  const framework = context?.framework || "generic";

  let description = "Validate that your fix is working correctly.";

  // Category-specific validation
  if (category.includes("schema")) {
    description = "Validate your schema using the Google Rich Results Test or Schema.org validator.";
  } else if (category.includes("meta")) {
    description = "Check that meta tags appear correctly in page source and social previews.";
  } else if (category.includes("accessibility")) {
    description = "Test with screen readers and accessibility tools like axe DevTools.";
  } else if (category.includes("technical")) {
    description = "Test the technical change in your development environment.";
  }

  // Framework-specific validation
  if (framework === "nextjs") {
    description += " Run `npm run build` to check for any build errors.";
  } else if (framework === "wordpress") {
    description += " Clear your cache and test on a staging environment first.";
  }

  return {
    title: "Validate the Fix",
    description,
    type: "validation",
  };
}

/**
 * Build checklist from recommendation sections.
 * 
 * @param {Object} recommendation - Recommendation with sections
 * @returns {Array} Array of checklist items { text, checked, category }
 */
export function buildDIYChecklist(recommendation) {
  if (!recommendation || !recommendation.sections) {
    return [];
  }

  const { sections, context } = recommendation;
  const checklist = [];

  // Understanding checklist
  if (sections.whyThisMatters) {
    checklist.push({
      text: "I understand why this issue matters",
      checked: false,
      category: "understanding",
    });
  }

  // Location checklist
  checklist.push({
    text: "I have located the element to fix",
    checked: false,
    category: "location",
  });

  // Implementation checklist
  if (sections.recommendedFix) {
    checklist.push({
      text: "I have implemented the recommended fix",
      checked: false,
      category: "implementation",
    });
  }

  // Code checklist
  if (sections.implementationExample?.content) {
    checklist.push({
      text: "I have added the code example",
      checked: false,
      category: "code",
    });
  }

  // Validation checklist
  checklist.push({
    text: "I have validated the fix",
    checked: false,
      category: "validation",
  });

  // Testing checklist
  if (sections.expectedImpact?.length > 0) {
    checklist.push({
      text: "I have verified the expected impact",
      checked: false,
      category: "verification",
    });
  }

  return checklist;
}

/**
 * Transform recommendation to DIY format.
 * 
 * @param {Object} recommendation - Recommendation with sections
 * @returns {Object} DIY format { steps, checklist, codeReferences }
 */
export function transformRecommendationToDIY(recommendation) {
  return {
    steps: buildDIYSteps(recommendation),
    checklist: buildDIYChecklist(recommendation),
    codeReferences: extractCodeReferences(recommendation),
    context: recommendation.context || {},
    metadata: recommendation.metadata || {},
  };
}

/**
 * Extract code references from recommendation.
 */
function extractCodeReferences(recommendation) {
  const references = [];

  if (recommendation.sections?.implementationExample?.content) {
    references.push({
      type: recommendation.sections.implementationExample.type || "html",
      content: recommendation.sections.implementationExample.content,
      label: "Implementation Example",
    });
  }

  return references;
}
