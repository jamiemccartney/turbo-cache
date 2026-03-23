export class TokenStore {
	private readonly tokenPrefix = "bearer ";
	private readonly tokenPrefixLength = this.tokenPrefix.length;
	private readonly tokens: Set<string>;

	constructor(turboTokens: Set<string>) {
		this.tokens = turboTokens;
	}

	has(bearerString: string | undefined): boolean {
		if (!bearerString || bearerString.length <= this.tokenPrefixLength) {
			return false;
		}

		if (
			bearerString.slice(0, this.tokenPrefixLength).toLowerCase() !==
			this.tokenPrefix
		) {
			return false;
		}

		const token = bearerString.slice(this.tokenPrefixLength).trim();

		return token.length > 0 && this.tokens.has(token);
	}
}
