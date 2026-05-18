import { describe, expect, it } from "vitest";

import { exportSubtitlesToSrt, exportSubtitlesToVtt, validateSubtitles } from "@/lib/hyperframes/subtitles";

describe("hyperframes subtitles", () => {
  it("rejects invalid timing", () => {
    expect(() => validateSubtitles([{ text: "x", start: 3, end: 2, style: "default", language: "th" }])).toThrow();
  });

  it("escapes script tags", () => {
    const lines = validateSubtitles([{ text: "<script>alert(1)</script>", start: 0, end: 1, style: "default", language: "th" }]);
    expect(lines[0]?.text).toBe("alert(1)");
    expect(lines[0]?.text).not.toMatch(/<script/i);
  });

  it("exports valid SRT", () => {
    const srt = exportSubtitlesToSrt([{ text: "สวัสดี", start: 0, end: 1.5, style: "default", language: "th" }]);
    expect(srt).toContain("00:00:00,000 --> 00:00:01,500");
  });

  it("exports valid VTT", () => {
    const vtt = exportSubtitlesToVtt([{ text: "hello", start: 0, end: 2, style: "default", language: "en" }]);
    expect(vtt.startsWith("WEBVTT")).toBe(true);
    expect(vtt).toContain("00:00:00.000 --> 00:00:02.000");
  });

  it("prevents arbitrary html", () => {
    const lines = validateSubtitles([{ text: "<b>bold</b>", start: 0, end: 1, style: "default", language: "en" }]);
    expect(lines[0]?.text).toBe("&lt;b&gt;bold&lt;/b&gt;");
  });
});
