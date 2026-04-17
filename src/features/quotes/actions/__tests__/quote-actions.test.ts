import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock next/cache before importing the actions
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

// Mock the DB queries
vi.mock("@/features/quotes/lib/queries", () => ({
  createQuote: vi.fn(),
  updateQuote: vi.fn(),
  deleteQuote: vi.fn(),
  updateQuoteStatus: vi.fn(),
  getQuoteById: vi.fn(),
}));

// Mock auth — default to authenticated; tests can override
vi.mock("@/features/auth/lib/auth", () => ({
  isAuthenticated: vi.fn(async () => true),
}));

import { revalidatePath } from "next/cache";
import {
  createQuote,
  updateQuote,
  deleteQuote,
  updateQuoteStatus,
  getQuoteById,
} from "@/features/quotes/lib/queries";
import {
  createQuoteAction,
  updateQuoteAction,
  deleteQuoteAction,
  acceptQuoteAction,
} from "../index";

// ─── helpers ─────────────────────────────────────────────────────────────────

function validLineItemsFormData(overrides: Record<string, string> = {}): FormData {
  const fd = new FormData();
  fd.set("clientName", "Test Client");
  fd.set("clientEmail", "client@example.com");
  fd.set("clientCompany", "Acme Corp");
  fd.set("title", "Test Quote");
  fd.set("description", "A test quote");
  fd.set("quoteType", "line-items");
  fd.set("lineItems", JSON.stringify([{ id: "li1", description: "Item 1", quantity: 1, unitPrice: 1000 }]));
  fd.set("currency", "MXN");
  fd.set("discount", "0");
  fd.set("notes", "");
  fd.set("validUntil", "");
  fd.set("locale", "en");
  fd.set("status", "draft");
  for (const [k, v] of Object.entries(overrides)) fd.set(k, v);
  return fd;
}

function validBlueprintFormData(overrides: Record<string, string> = {}): FormData {
  const fd = new FormData();
  fd.set("clientName", "Blueprint Client");
  fd.set("clientEmail", "bp@example.com");
  fd.set("clientCompany", "BP Corp");
  fd.set("title", "Blueprint Proposal");
  fd.set("quoteType", "blueprint");
  fd.set("lineItems", "[]");
  fd.set("currency", "MXN");
  fd.set("discount", "0");
  fd.set("notes", "");
  fd.set("validUntil", "");
  fd.set("locale", "es");
  fd.set("status", "draft");
  fd.set("fixedPrice", "50000");
  fd.set("deliverables", JSON.stringify([{ id: "d1", number: 1, title: "Website", description: "Full site" }]));
  fd.set("nextSteps", JSON.stringify(["Sign contract", "Kickoff call"]));
  for (const [k, v] of Object.entries(overrides)) fd.set(k, v);
  return fd;
}

// ─── createQuoteAction ────────────────────────────────────────────────────────

describe("createQuoteAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(createQuote).mockResolvedValue({
      id: "abc123",
      clientName: "Test Client",
      clientEmail: "client@example.com",
      clientCompany: "Acme Corp",
      title: "Test Quote",
      description: "",
      quoteType: "line-items",
      lineItems: [],
      currency: "MXN",
      discount: 0,
      notes: "",
      status: "draft",
      validUntil: "",
      locale: "en",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  });

  it("returns the new quote id on success", async () => {
    const result = await createQuoteAction(validLineItemsFormData());
    expect(result).toEqual({ id: "abc123" });
  });

  it("calls createQuote with parsed form data", async () => {
    await createQuoteAction(validLineItemsFormData());
    expect(createQuote).toHaveBeenCalledOnce();
    const arg = vi.mocked(createQuote).mock.calls[0][0];
    expect(arg.clientName).toBe("Test Client");
    expect(arg.currency).toBe("MXN");
  });

  it("revalidates admin path after creation", async () => {
    await createQuoteAction(validLineItemsFormData());
    expect(revalidatePath).toHaveBeenCalledWith("/[locale]/admin", "page");
  });

  it("returns validation errors when clientName is missing", async () => {
    const fd = validLineItemsFormData({ clientName: "" });
    const result = await createQuoteAction(fd);
    expect(result).toHaveProperty("error");
    expect((result as { error: unknown }).error).toHaveProperty("clientName");
  });

  it("returns validation errors for invalid email", async () => {
    const fd = validLineItemsFormData({ clientEmail: "not-an-email" });
    const result = await createQuoteAction(fd);
    expect(result).toHaveProperty("error");
    expect((result as { error: unknown }).error).toHaveProperty("clientEmail");
  });

  it("returns validation errors when title is missing", async () => {
    const fd = validLineItemsFormData({ title: "" });
    const result = await createQuoteAction(fd);
    expect(result).toHaveProperty("error");
  });

  it("handles blueprint quoteType with extra fields", async () => {
    await createQuoteAction(validBlueprintFormData());
    const arg = vi.mocked(createQuote).mock.calls[0][0];
    expect(arg.quoteType).toBe("blueprint");
    expect(arg.fixedPrice).toBe(50000);
    expect(arg.deliverables).toHaveLength(1);
    expect(arg.nextSteps).toEqual(["Sign contract", "Kickoff call"]);
  });
});

// ─── updateQuoteAction ────────────────────────────────────────────────────────

describe("updateQuoteAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(updateQuote).mockResolvedValue(undefined);
  });

  it("returns success on valid update", async () => {
    const result = await updateQuoteAction("quote-1", validLineItemsFormData());
    expect(result).toEqual({ success: true });
  });

  it("calls updateQuote with the correct id", async () => {
    await updateQuoteAction("quote-xyz", validLineItemsFormData());
    expect(updateQuote).toHaveBeenCalledWith("quote-xyz", expect.any(Object));
  });

  it("revalidates admin path after update", async () => {
    await updateQuoteAction("quote-1", validLineItemsFormData());
    expect(revalidatePath).toHaveBeenCalledWith("/[locale]/admin", "page");
  });

  it("returns validation errors for invalid data", async () => {
    const fd = validLineItemsFormData({ clientEmail: "bad" });
    const result = await updateQuoteAction("quote-1", fd);
    expect(result).toHaveProperty("error");
  });
});

// ─── deleteQuoteAction ────────────────────────────────────────────────────────

describe("deleteQuoteAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(deleteQuote).mockResolvedValue(undefined);
  });

  it("calls deleteQuote with the correct id", async () => {
    await deleteQuoteAction("del-123");
    expect(deleteQuote).toHaveBeenCalledWith("del-123");
  });

  it("revalidates admin path after deletion", async () => {
    await deleteQuoteAction("del-123");
    expect(revalidatePath).toHaveBeenCalledWith("/[locale]/admin", "page");
  });

  it("returns success", async () => {
    const result = await deleteQuoteAction("del-123");
    expect(result).toEqual({ success: true });
  });
});

// ─── acceptQuoteAction ────────────────────────────────────────────────────────

describe("acceptQuoteAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(updateQuoteStatus).mockResolvedValue(undefined);
    vi.mocked(getQuoteById).mockResolvedValue({ id: "q-1", status: "sent" } as never);
  });

  it("calls updateQuoteStatus with accepted", async () => {
    await acceptQuoteAction("q-1");
    expect(updateQuoteStatus).toHaveBeenCalledWith("q-1", "accepted");
  });

  it("returns success", async () => {
    const result = await acceptQuoteAction("q-1");
    expect(result).toEqual({ success: true });
  });

  it("returns not-found error when quote is missing", async () => {
    vi.mocked(getQuoteById).mockResolvedValueOnce(null);
    const result = await acceptQuoteAction("missing");
    expect(result).toEqual({ error: "Quote not found" });
    expect(updateQuoteStatus).not.toHaveBeenCalled();
  });

  it("rejects invalid state transitions", async () => {
    vi.mocked(getQuoteById).mockResolvedValueOnce({ id: "q-1", status: "draft" } as never);
    const result = await acceptQuoteAction("q-1");
    expect(result).toEqual({ error: "Invalid state" });
    expect(updateQuoteStatus).not.toHaveBeenCalled();
  });
});
