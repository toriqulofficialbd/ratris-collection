import { describe, expect, it } from "vitest";
import { getAdminAccessKey, isValidAdminAccessKey, resolveAdminAccessKey } from "../src/lib/adminAccess";

describe("admin gate access helpers", () => {
  it("returns null when Firestore has no configured key", async () => {
    const key = await getAdminAccessKey({ exists: () => false });

    expect(key).toBeNull();
  });

  it("uses the configured key from Firestore when available", async () => {
    const key = await getAdminAccessKey({
      exists: () => true,
      data: () => ({ accessKey: "CustomKey" }),
    });

    expect(key).toBe("CustomKey");
  });

  it("accepts whitespace-padded input for the configured database key", () => {
    expect(isValidAdminAccessKey("  CustomKey  ", "CustomKey")).toBe(true);
  });

  it("returns null when Firestore lookup throws", async () => {
    const key = await resolveAdminAccessKey(async () => {
      throw new Error("network down");
    });

    expect(key).toBeNull();
  });
});
