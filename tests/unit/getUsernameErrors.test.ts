import {describe, expect, it} from "vitest";
import {getUsernameErrors} from "@/lib/user";

describe("getUsernameErrors", () => {
    it.each([
        "Test User",
        "abcdef",
        "a".repeat(30),
        "User 123",
    ])("accepts %j", (username) => {
        expect(getUsernameErrors(username)).toBe("");
    });

    it.each([
        ["abcde", "between 6-30 characters"],
        ["a".repeat(31), "between 6-30 characters"],
        ["user_name", "alphanumerical characters and spaces"],
        ["user@name", "alphanumerical characters and spaces"],
        ["", "between 6-30 characters"],
    ])("rejects %j", (username, message) => {
        expect(getUsernameErrors(username)).toContain(message);
    });

    it("reports every problem at once", () => {
        const errors = getUsernameErrors("a_b");
        expect(errors).toContain("between 6-30 characters");
        expect(errors).toContain("alphanumerical characters and spaces");
    });
});
