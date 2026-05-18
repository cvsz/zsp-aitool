export const socialExportProviders = ["tiktok", "reels", "shorts"] as const;

export type SocialExportProvider = (typeof socialExportProviders)[number];

export type SocialExportIntent = {
  userId: string;
  renderJobId: string;
  provider: SocialExportProvider;
  confirm: boolean;
  note?: string;
};

export type SocialExportResult = {
  accepted: boolean;
  mode: "manual";
  provider: SocialExportProvider;
  message: string;
};

export interface SocialExportConnector {
  provider: SocialExportProvider;
  createManualExport(intent: SocialExportIntent): Promise<SocialExportResult>;
}

class ManualOnlyConnector implements SocialExportConnector {
  constructor(public readonly provider: SocialExportProvider) {}

  async createManualExport(intent: SocialExportIntent): Promise<SocialExportResult> {
    return {
      accepted: true,
      mode: "manual",
      provider: this.provider,
      message: `Manual export intent accepted for ${intent.provider}. Auto-post is disabled.`,
    };
  }
}

const connectors: Record<SocialExportProvider, SocialExportConnector> = {
  tiktok: new ManualOnlyConnector("tiktok"),
  reels: new ManualOnlyConnector("reels"),
  shorts: new ManualOnlyConnector("shorts"),
};

export function getSocialExportConnector(provider: SocialExportProvider): SocialExportConnector {
  return connectors[provider];
}

export function isSocialExportEnabled(): boolean {
  return process.env.HYPERFRAMES_SOCIAL_EXPORT_ENABLED === "true";
}
