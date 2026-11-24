import { z } from 'zod';

/**
 * The shape of a portfolio version on the wire.
 *
 * Here rather than in the route that first needed it, because a Next route
 * file may only export route handlers — exporting a shared constant from one
 * fails the build with "is not a valid Route export field". The three routes
 * that validate this data import it from here, which also means the schema
 * cannot drift between the create path and the update path the way the
 * project schemas did.
 */

export const PORTFOLIO_COLLECTION = 'portfolioVersions';

const linkSchema = z.object({ label: z.string(), url: z.string() });

export const profileSchema = z.object({
  fullName: z.string(),
  headline: z.string(),
  summary: z.string(),
  location: z.string().optional(),
  email: z.string().optional(),
  phone: z.string().optional(),
  links: z.array(linkSchema).default([]),
  stack: z.array(z.string()).default([]),
});

export const itemSchema = z.object({
  projectKey: z.string(),
  enabled: z.boolean(),
  order: z.number(),
  name: z.string(),
  oneLiner: z.string().default(''),
  role: z.string().optional(),
  period: z.string().optional(),
  description: z.string().default(''),
  logo: z.string().optional(),
  screenshot: z.string().optional(),
  gallery: z.array(z.string()).default([]),
  thumbnail: z.string().optional(),
  liveUrl: z.string().optional(),
  tags: z.array(z.string()).default([]),
  stack: z.array(z.string()).default([]),
  components: z
    .array(
      z.object({
        kind: z.string(),
        name: z.string(),
        oneLiner: z.string().optional(),
      }),
    )
    .default([]),
  decisions: z
    .array(
      z.object({
        title: z.string(),
        choice: z.string(),
        rationale: z.string(),
        tradeoffs: z.string().optional(),
      }),
    )
    .default([]),
  highlights: z.array(z.string()).default([]),
  blocks: z.object({
    description: z.boolean(),
    stack: z.boolean(),
    components: z.boolean(),
    decisions: z.boolean(),
    highlights: z.boolean(),
    links: z.boolean(),
  }),
});

export const cvSchema = z.object({
  fileName: z.string(),
  importedAt: z.string(),
  text: z.string(),
});

export const createVersionSchema = z.object({
  name: z.string().min(1),
  targetRole: z.string().optional(),
  targetCompany: z.string().optional(),
  notes: z.string().optional(),
  /** An existing version to copy instead of seeding from the knowledge base. */
  copyOf: z.string().optional(),
  profile: profileSchema.optional(),
  cv: cvSchema.optional(),
});

/** Every field optional: the builder saves what changed, so a save of the
 *  profile must not blank the items. */
export const patchVersionSchema = z.object({
  name: z.string().min(1).optional(),
  targetRole: z.string().optional(),
  targetCompany: z.string().optional(),
  notes: z.string().optional(),
  status: z.enum(['draft', 'ready']).optional(),
  profile: profileSchema.optional(),
  items: z.array(itemSchema).optional(),
  cv: cvSchema.optional(),
});
