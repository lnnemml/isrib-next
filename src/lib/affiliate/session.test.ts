import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { before, describe, it, mock } from "node:test";

// See partner-queries.test.ts: importing session.ts loads src/lib/db, and nothing here connects.
process.env.POSTGRES_URL = "postgres://test:test@127.0.0.1:1/test";

type Session = typeof import("./session");
type Db = typeof import("@/lib/db");

let session: Session;
let db: Db["db"];

before(async () => {
  session = await import("./session");
  ({ db } = await import("@/lib/db"));
});

function sha256Hex(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

// Replaces db.insert with a recorder, so the assertion is on what would be written.
function captureInsert(): { tokenHash: string; expiresAt: Date }[] {
  const written: { tokenHash: string; expiresAt: Date }[] = [];
  const insert = () => ({
    values: async (row: { tokenHash: string; expiresAt: Date }) => {
      written.push(row);
    },
  });
  mock.method(db, "insert", insert as unknown as typeof db.insert);
  return written;
}

describe("hashToken", () => {
  it("is SHA-256 hex", () => {
    assert.equal(session.hashToken("abc"), sha256Hex("abc"));
    assert.match(session.hashToken("abc"), /^[0-9a-f]{64}$/);
  });
});

describe("createLoginToken", () => {
  it("writes the hash and returns the raw token", async (t) => {
    t.after(() => mock.restoreAll());
    const written = captureInsert();

    const raw = await session.createLoginToken("aff_1", 30);

    assert.match(raw, /^[A-Za-z0-9_-]{43}$/); // 32 bytes of base64url
    assert.equal(written.length, 1);
    assert.equal(written[0].tokenHash, sha256Hex(raw));
    assert.equal(JSON.stringify(written[0]).includes(raw), false);
  });

  it("expires after the given number of minutes", async (t) => {
    t.after(() => mock.restoreAll());
    const written = captureInsert();

    const start = Date.now();
    await session.createLoginToken("aff_1", 30);

    const ttlMs = written[0].expiresAt.getTime() - start;
    assert.ok(ttlMs >= 30 * 60_000 && ttlMs < 31 * 60_000, String(ttlMs));
  });
});

describe("createPartnerSession", () => {
  it("writes the hash and returns the raw value", async (t) => {
    t.after(() => mock.restoreAll());
    const written = captureInsert();

    const raw = await session.createPartnerSession("aff_1");

    assert.equal(written[0].tokenHash, sha256Hex(raw));
    assert.equal(JSON.stringify(written[0]).includes(raw), false);
  });
});

describe("consumeLoginTokenQuery", () => {
  it("is one conditional UPDATE on the hash, unused and unexpired", () => {
    const now = new Date("2026-10-31T12:00:00Z");
    const { sql, params } = session.consumeLoginTokenQuery("raw-token", now).toSQL();

    assert.match(sql, /^update "affiliate_login_tokens" set "used_at" = /);
    assert.match(sql, /"token_hash" = \$\d/);
    assert.match(sql, /"used_at" is null/);
    assert.match(sql, /"expires_at" > \$\d/);
    assert.match(sql, /returning "affiliate_id"/);
    assert.ok(params.includes(sha256Hex("raw-token")));
    assert.equal(params.includes("raw-token"), false);
  });
});

describe("deleteAffiliateLoginTokensQuery", () => {
  it("deletes only this affiliate's unused tokens", () => {
    const { sql, params } = session.deleteAffiliateLoginTokensQuery("aff_1").toSQL();

    assert.match(sql, /^delete from "affiliate_login_tokens" where /);
    assert.match(sql, /"affiliate_id" = \$1/);
    assert.match(sql, /"used_at" is null/);
    assert.deepEqual(params, ["aff_1"]);
  });
});

describe("buildPartnerLoginUrl", () => {
  it("uses the base URL and the token path", () => {
    process.env.NEXT_PUBLIC_BASE_URL = "https://example.test";
    assert.equal(session.buildPartnerLoginUrl("tok"), "https://example.test/partner/auth/tok");
  });
});

describe("partnerCookieOptions", () => {
  it("is httpOnly, lax, site-wide and 30 days", () => {
    const options = session.partnerCookieOptions();
    assert.equal(options.httpOnly, true);
    assert.equal(options.sameSite, "lax");
    assert.equal(options.path, "/");
    assert.equal(options.maxAge, 60 * 60 * 24 * 30);
  });
});

describe("session.ts source", () => {
  const source = readFileSync(new URL("./session.ts", import.meta.url), "utf8");

  it("only ever writes tokenHash through hashToken", () => {
    const writes = source.match(/tokenHash: .*/g) ?? [];
    assert.ok(writes.length >= 2, "should find both inserts");
    for (const write of writes) {
      assert.equal(write, "tokenHash: hashToken(rawToken),");
    }
  });
});
