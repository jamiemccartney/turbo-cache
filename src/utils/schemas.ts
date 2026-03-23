import z from "zod";

export const hashPathSchema = z.object({ hash: z.string() });

export const teamParamsSchema = z
	.object({
		teamId: z.string().optional(),
		slug: z.string().optional(),
	})
	.refine((data) => data.teamId || data.slug, {
		error: "one of teamId or slug must be defined",
		path: ["teamId or slug"],
	})
	.transform((data) => {
		return {
			storageId: (data.teamId || data.slug) as string,
		};
	});

export const artifactHasManyBodySchema = z.object({
	hashes: z.array(z.string().regex(/^[a-fA-F0-9]+$/)).max(1000),
});
