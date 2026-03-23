type ArtifactMetadata = Record<string, string | number | undefined>;

class ArtifactMetaSerializer {
	headers: [string, StringConstructor | NumberConstructor][] = [
		["content-type", String],
		["content-length", Number],
		["x-artifact-tag", String],
		["x-artifact-client-interactive", String],
		["x-artifact-duration", Number],
		["x-artifact-client-ci", String],
	];

	forResponse(
		meta: Record<string, string> | undefined,
	): Record<string, string | number> {
		if (!meta) {
			return {};
		}

		const output: Record<string, string | number> = {};

		this.headers.forEach(([header, ctor]) => {
			const value = meta[header];

			if (value === undefined) {
				return;
			}

			const parsed = ctor(value);

			if (ctor === Number && Number.isNaN(parsed)) return;

			output[header] = parsed;
		});

		return output;
	}

	fromRequest(
		meta: Record<string, string | number | undefined>,
	): Record<string, string> {
		const output: Record<string, string> = {};

		this.headers.forEach(([header]) => {
			const value = meta[header];

			if (value === undefined) {
				return;
			}

			output[header] = String(value);
		});

		return output;
	}
}

export { type ArtifactMetadata, ArtifactMetaSerializer };
