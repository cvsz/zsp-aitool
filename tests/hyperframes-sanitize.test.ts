import { describe, expect, it } from "vitest";

import { buildHyperFrameComposition } from "@/lib/hyperframes/build-composition";
import { escapeHtml, sanitizePlainText, validateHttpMediaUrl } from "@/lib/hyperframes/sanitize";

describe("hyperframes sanitize utilities", () => {
  it("escapes all HTML-sensitive characters", () => {
    expect(escapeHtml("<&>\"'&")).toBe("&lt;&amp;&gt;&quot;&#39;&amp;");
  });

  it("neutralizes repeated and mixed-case script tags", () => {
    const input = '<script>alert(1)</script><ScRiPt>alert(2)</sCrIpT>';
    const output = sanitizePlainText(input, 300);
    expect(output).not.toMatch(/<script/i);
    expect(output).toContain("alert(1)");
    expect(output).toContain("alert(2)");
  });

  it("keeps dangerous style/script sequence escaped", () => {
    const output = sanitizePlainText("</style><script>alert(1)</script>", 300);
    expect(output).toContain("&lt;/style&gt;");
    expect(output).not.toMatch(/<script/i);
  });

  it("rejects unsafe URL schemes and obfuscation", () => {
    const invalidUrls = [
      "javascript:alert(1)",
      "JaVaScRiPt:alert(1)",
      "\njavascript:alert(1)",
      "\tjavascript:alert(1)",
      "data:text/html,hi",
      "file:///etc/passwd",
    ];

    for (const raw of invalidUrls) {
      expect(() => validateHttpMediaUrl(raw)).toThrowError(/invalid media URL/);
    }
  });

  it("accepts valid http and https URLs", () => {
    expect(validateHttpMediaUrl("https://example.com/a.png")).toBe("https://example.com/a.png");
    expect(validateHttpMediaUrl("http://example.com/a.png")).toBe("http://example.com/a.png");
  });
});

describe("hyperframes composition output hardening", () => {
  it("escapes user caption HTML and does not output script tags", () => {
    const result = buildHyperFrameComposition({
      productId: "p1",
      platform: "facebook",
      aspectRatio: "9:16",
      durationSeconds: 12,
      caption: "</style><script>alert(1)</script><b>sale</b>",
      product: {
        title: "<img src=x onerror=alert(1)>",
        price: "199",
        currency: "THB",
        imageUrl: "https://example.com/image.jpg",
        affiliateUrl: "https://example.com/aff",
      },
    });

    expect(result.compositionHtml).not.toMatch(/<script/i);
    expect(result.compositionHtml).toContain("&lt;/style&gt;");
    expect(result.compositionHtml).toContain("&lt;b&gt;sale&lt;/b&gt;");
    expect(result.compositionHtml).toContain("&lt;img src=x onerror=alert(1)&gt;");
  });

  it("throws controlled validation error for unsafe image URL", () => {
    expect(() =>
      buildHyperFrameComposition({
        productId: "p1",
        platform: "facebook",
        aspectRatio: "9:16",
        durationSeconds: 12,
        caption: "ok",
        product: {
          title: "safe",
          price: "199",
          currency: "THB",
          imageUrl: "javascript:alert(1)",
          affiliateUrl: null,
        },
      }),
    ).toThrowError(/invalid media URL/);
  });

  it("blocks unsafe watermark logo URL", () => {
    expect(() =>
      buildHyperFrameComposition({
        productId: "p1",
        platform: "facebook",
        aspectRatio: "9:16",
        durationSeconds: 12,
        caption: "ok",
        watermark: { text: "Brand", logoUrl: "javascript:alert(1)", position: "top-right" },
        product: { title: "safe", price: "199", currency: "THB", imageUrl: "https://example.com/image.jpg", affiliateUrl: null },
      }),
    ).toThrowError(/invalid media URL/);
  });

  it("includes safe watermark overlay and escapes text", () => {
    const result = buildHyperFrameComposition({
      productId: "p1",
      platform: "facebook",
      aspectRatio: "9:16",
      durationSeconds: 12,
      caption: "ok",
      watermark: { text: "<img src=x onerror=1>", logoUrl: "https://example.com/logo.png", position: "top-left" },
      product: { title: "safe", price: "199", currency: "THB", imageUrl: "https://example.com/image.jpg", affiliateUrl: null },
    });

    expect(result.compositionHtml).toContain("class=\"watermark\"");
    expect(result.compositionHtml).toContain("https://example.com/logo.png");
    expect(result.compositionHtml).toContain("&lt;img src=x onerror=1&gt;");
    expect(result.compositionHtml).toContain("&lt;img src=x onerror=1&gt;");
    expect(result.compositionHtml).not.toContain("<img src=x onerror=1>");
  });
});

it("applies brand kit safely in composition", () => {
  const result = buildHyperFrameComposition({
    productId: "p1",
    platform: "facebook",
    aspectRatio: "9:16",
    durationSeconds: 12,
    caption: "hello",
    brandKit: {
      brandColors: ["#FF0033"],
      logoUrl: "https://example.com/logo.png",
      watermarkText: "<style>bad</style>",
      defaultCTA: "<script>x</script>ซื้อเลย",
    },
    product: { title: "safe", imageUrl: "https://example.com/i.jpg", affiliateUrl: null },
  });

  expect(result.compositionHtml).toContain("#FF0033");
  expect(result.compositionHtml).toContain("logo.png");
  expect(result.compositionHtml).not.toMatch(/<script/i);
});
