export const hyperFramesQualityProfiles = ["preview", "standard", "high"] as const;

export type HyperFramesQualityProfile = (typeof hyperFramesQualityProfiles)[number];

type QualitySpec = {
  durationSeconds: number;
  maxOutputMb: number;
  cliArgs: string[];
  requiresHighQualityFlag?: boolean;
};

const QUALITY_SPECS: Record<HyperFramesQualityProfile, QualitySpec> = {
  preview: {
    durationSeconds: 20,
    maxOutputMb: 64,
    cliArgs: ["--quality", "preview"],
  },
  standard: {
    durationSeconds: 60,
    maxOutputMb: 512,
    cliArgs: [],
  },
  high: {
    durationSeconds: 90,
    maxOutputMb: 1024,
    cliArgs: ["--quality", "high"],
    requiresHighQualityFlag: true,
  },
};

function parseAllowedProfiles(raw: string | undefined): HyperFramesQualityProfile[] {
  const values = (raw ?? "preview,standard,high")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);

  const parsed = values.filter((value): value is HyperFramesQualityProfile =>
    hyperFramesQualityProfiles.includes(value as HyperFramesQualityProfile),
  );

  return parsed.length > 0 ? parsed : ["standard"];
}

export function getAllowedQualityProfiles(raw: string | undefined): HyperFramesQualityProfile[] {
  return parseAllowedProfiles(raw);
}

export function resolveRenderQuality(
  requested: HyperFramesQualityProfile | undefined,
  options: { allowedRaw: string | undefined; highQualityEnabled: boolean },
): { profile: HyperFramesQualityProfile; spec: QualitySpec } {
  const allowed = parseAllowedProfiles(options.allowedRaw);
  const profile = requested ?? "standard";
  if (!allowed.includes(profile)) throw new Error(`quality profile not allowed: ${profile}`);

  const spec = QUALITY_SPECS[profile];
  if (spec.requiresHighQualityFlag && !options.highQualityEnabled) {
    throw new Error("high quality profile disabled");
  }

  return { profile, spec };
}
