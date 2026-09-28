"use client"

import { useMemo } from "react"
import { formatRating, parseRatingJsonLd } from "@/components/issue-context/ratingDetection"
import SchemaApplyDialog from "./SchemaApplyDialog"

/** AggregateRating wording for the shared schema-apply dialog. */
export default function RatingSchemaApplyDialog({ jsonLd, ...props }) {
  const parsed = useMemo(() => parseRatingJsonLd(jsonLd), [jsonLd])
  return (
    <SchemaApplyDialog
      {...props}
      ariaLabel="Apply AggregateRating schema"
      title="Apply AggregateRating Schema to This Page?"
      description={
        parsed ? (
          <>
            Only this page changes. The rating below — <strong>{formatRating({
              ratingValue: parsed.rating.ratingValue, bestRating: parsed.rating.bestRating,
              reviewCount: parsed.rating.reviewCount, ratingCount: parsed.rating.ratingCount,
            })}</strong> — is the one shown on this page. It is added to the existing {parsed.target.type} “{parsed.target.name}”
            (matched by its @id) rather than as a new entity, and nothing was estimated. The Odito SEO Bridge merges it into that
            entity&apos;s schema, or prints it with the same @id; your post content is not edited.
          </>
        ) : null
      }
      previewLabel="Generated schema preview"
      previewTestId="rating-schema-preview"
      jsonLd={jsonLd}
      isValid={!!parsed}
      invalidMessage="The linked recommendation does not contain a valid AggregateRating schema. Generate the recommendation again."
    />
  )
}
