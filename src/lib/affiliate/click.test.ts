import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  computeVisitorHash,
  isBotUserAgent,
  sanitizeLandingPath,
  secretsMatch,
} from "./click";

const visitor = {
  secret: "test-secret",
  ip: "203.0.113.42",
  userAgent: "Mozilla/5.0 (X11; Linux x86_64) Chrome/130.0",
};

describe("computeVisitorHash", () => {
  it("gives the same hash for the same input on the same UTC day", () => {
    const morning = computeVisitorHash({ ...visitor, now: new Date("2026-10-31T00:00:01Z") });
    const night = computeVisitorHash({ ...visitor, now: new Date("2026-10-31T23:59:59Z") });
    assert.equal(morning, night);
  });

  it("gives a different hash on a different UTC day", () => {
    const today = computeVisitorHash({ ...visitor, now: new Date("2026-10-31T23:59:59Z") });
    const tomorrow = computeVisitorHash({ ...visitor, now: new Date("2026-11-01T00:00:00Z") });
    assert.notEqual(today, tomorrow);
  });

  it("changes with the IP, the user agent and the secret", () => {
    const now = new Date("2026-10-31T12:00:00Z");
    const base = computeVisitorHash({ ...visitor, now });
    assert.notEqual(base, computeVisitorHash({ ...visitor, ip: "203.0.113.43", now }));
    assert.notEqual(base, computeVisitorHash({ ...visitor, userAgent: "Other", now }));
    assert.notEqual(base, computeVisitorHash({ ...visitor, secret: "other", now }));
  });

  it("does not run the IP and the user agent together", () => {
    const now = new Date("2026-10-31T12:00:00Z");
    assert.notEqual(
      computeVisitorHash({ ...visitor, ip: "1.1.1.1", userAgent: "1", now }),
      computeVisitorHash({ ...visitor, ip: "1.1.1.", userAgent: "11", now }),
    );
  });

  it("contains no part of the IP", () => {
    const hash = computeVisitorHash(visitor);
    assert.match(hash, /^[0-9a-f]{64}$/);
    assert.equal(hash.includes(visitor.ip), false);
    assert.equal(hash.includes(visitor.ip.replaceAll(".", "")), false);
  });
});

describe("isBotUserAgent", () => {
  it("rejects the named bots and the generic words", () => {
    const bots = [
      "Twitterbot/1.0",
      "facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)",
      "Slackbot-LinkExpanding 1.0 (+https://api.slack.com/robots)",
      "TelegramBot (like TwitterBot)",
      "WhatsApp/2.23.20.0",
      "Mozilla/5.0 (compatible; Discordbot/2.0; +https://discordapp.com)",
      "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
      "Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)",
      "SomeCrawler/1.0",
      "my-spider",
      "LinkPreview/2.0",
    ];
    for (const userAgent of bots) assert.equal(isBotUserAgent(userAgent), true, userAgent);
  });

  it("accepts real browsers", () => {
    const browsers = [
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/130.0 Safari/537.36",
      "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Safari/604.1",
      "Mozilla/5.0 (X11; Linux x86_64; rv:131.0) Gecko/20100101 Firefox/131.0",
    ];
    for (const userAgent of browsers) assert.equal(isBotUserAgent(userAgent), false, userAgent);
  });
});

describe("sanitizeLandingPath", () => {
  it("drops the query string and the fragment", () => {
    assert.equal(sanitizeLandingPath("/products/isrib-a15?ref=ALICE&x=1"), "/products/isrib-a15");
    assert.equal(sanitizeLandingPath("/faq#shipping"), "/faq");
  });

  it("truncates to 512 characters", () => {
    assert.equal(sanitizeLandingPath(`/${"a".repeat(600)}`)?.length, 512);
  });

  it("is null when nothing is left", () => {
    assert.equal(sanitizeLandingPath(""), null);
    assert.equal(sanitizeLandingPath("?ref=ALICE"), null);
  });
});

describe("secretsMatch", () => {
  it("accepts only the exact secret", () => {
    assert.equal(secretsMatch("s3cret", "s3cret"), true);
    assert.equal(secretsMatch("s3cre", "s3cret"), false);
    assert.equal(secretsMatch("s3cret-longer", "s3cret"), false);
  });

  it("never matches a missing header or an unset secret", () => {
    assert.equal(secretsMatch(null, "s3cret"), false);
    assert.equal(secretsMatch("", ""), false);
    assert.equal(secretsMatch("anything", ""), false);
  });
});
