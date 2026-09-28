"use client"

import { useMemo } from "react"
import { parseFaqJsonLd } from "@/components/issue-context/faqDetection"
import SchemaApplyDialog from "./SchemaApplyDialog"

/** FAQPage wording for the shared schema-apply dialog. */
export default function FaqSchemaApplyDialog({ jsonLd, ...props }) {
  const pairs = useMemo(() => parseFaqJsonLd(jsonLd), [jsonLd])
  return (
    <SchemaApplyDialog
      {...props}
      ariaLabel="Apply FAQ schema"
      title="Apply FAQ Schema to This Page?"
      description={
        <>
          Only this page changes. The schema contains just the {pairs ? pairs.length : ""} question{pairs?.length === 1 ? "" : "s"} and
          answers detected on the page — nothing was added or reworded. The Odito SEO Bridge prints it in the page&apos;s
          &lt;head&gt;; your post content is not edited.
        </>
      }
      previewTestId="faq-schema-preview"
      jsonLd={jsonLd}
      isValid={!!pairs}
      invalidMessage="The linked recommendation does not contain a valid FAQPage schema. Generate the recommendation again."
    />
  )
}
