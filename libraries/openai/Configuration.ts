export class Configuration {
  apiKey: string;
  constructor(config: { apiKey: string }) {
    if (!config.apiKey) {
      throw new Error("apiKey is not set");
    }
    this.apiKey = config.apiKey;
  }
}
