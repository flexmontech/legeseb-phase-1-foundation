import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";
import { AudienceTarget } from "@/components/legeseb/AudienceTarget";
import { getState, resetDemo, activateDemoWorkspace } from "@/lib/legeseb/store";

vi.mock("@tanstack/react-router", () => ({ Link: ({ children }: { children: ReactNode }) => <span>{children}</span> }));

beforeEach(() => { activateDemoWorkspace(); resetDemo(); });
afterEach(cleanup);

describe("Consolidated audience targeting", () => {
  it("selects an existing industry without changing saved client or prospect data", () => {
    const before = getState();
    render(<AudienceTarget />);
    fireEvent.change(screen.getByLabelText("Target industry"), { target: { value: "Dental" } });
    expect(getState().activeIndustryId).toBe("dental");
    expect(getState().workspace).toEqual(before.workspace);
    expect(getState().prospects).toEqual(before.prospects);
  });

  it("adds a catalog target once and reuses it on subsequent selection", () => {
    render(<AudienceTarget />);
    const select = screen.getByLabelText("Target industry");
    const option = Array.from(select.querySelectorAll("optgroup[label='Industry catalog'] option"))[0];
    if (!(option instanceof HTMLOptionElement)) throw new Error("Expected a catalog industry");
    const name = option.value;
    const count = getState().industries.length;
    fireEvent.change(select, { target: { value: name } });
    fireEvent.change(select, { target: { value: "Dental" } });
    fireEvent.change(select, { target: { value: name } });
    expect(getState().industries.length).toBe(count + 1);
    expect(getState().industries.filter(i => i.name === name).length).toBe(1);
  });

  it("updates the audience default without rewriting existing prospects", () => {
    const before = getState().prospects;
    render(<AudienceTarget />);
    fireEvent.change(screen.getByLabelText("Target industry"), { target: { value: "Dental" } });
    fireEvent.change(screen.getByLabelText("Target audience"), { target: { value: "B2B" } });
    expect(getState().industries.find(i => i.id === "dental")?.targetType).toBe("B2B");
    expect(getState().prospects).toEqual(before);
  });
});