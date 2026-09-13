import { describe, expect, it } from "vitest"

import { APPROVALS } from "@/data/approvals"

import {
  approvedLine,
  bulkLine,
  decide,
  deniedLine,
  filterApprovals,
  newApproval,
  queueSummary,
  type RequestForm,
  requestErrors,
  selectionLines,
  statusCounts,
  submittedLine,
} from "./approvals"

const FORM: RequestForm = {
  requester: "Darnell Brooks",
  type: "Price override",
  account: "Harriet Lawson",
  quote: "",
  value: "1,039",
  discount: "22",
  approver: "Julia Serrano",
  justification: "Because.",
}

describe("approvals", () => {
  it("counts the queue for the header", () => {
    expect(queueSummary(APPROVALS, APPROVALS)).toEqual({
      visible: 10,
      pending: 4,
      flagged: 1,
    })
    expect(statusCounts(APPROVALS)).toEqual({
      Pending: 4,
      Approved: 3,
      Denied: 2,
      Expired: 1,
    })
    // Searching "advance" shows two, keeps the whole queue's pending count, and flags only what's shown
    expect(
      queueSummary(APPROVALS, filterApprovals(APPROVALS, "advance", null, []))
    ).toEqual({ visible: 2, pending: 4, flagged: 0 })
    expect(filterApprovals(APPROVALS, "Karim", null, [])).toHaveLength(2)
    expect(
      filterApprovals(APPROVALS, "", "Rafael Lima", []).map((a) => a.rep)
    ).toEqual(["Toby Marsh", "Ayesha Malik"])
    expect(filterApprovals(APPROVALS, "", null, ["Pending"])).toHaveLength(4)
  })

  it("signs off only pending requests", () => {
    const [harriet, pablo, valentina] = APPROVALS
    const after = decide(
      APPROVALS,
      [valentina!.id, APPROVALS[4]!.id],
      "Approved"
    )
    expect(queueSummary(after, after)).toEqual({
      visible: 10,
      pending: 3,
      flagged: 0,
    })
    expect(after[4]).toBe(APPROVALS[4])
    expect(approvedLine(harriet!)).toBe(
      "15% off Quarterly Pest on Harriet Lawson · Q-2033 signed off for Darnell Brooks."
    )
    expect(deniedLine(pablo!)).toBe(
      "Sam Okafor: Waived initial was not approved."
    )
    expect(bulkLine(2, "Approved")).toBe("2 pending approvals signed off.")
    expect(bulkLine(1, "Denied")).toBe("1 pending approval rejected.")
    expect(selectionLines([harriet!, APPROVALS[4]!])).toEqual([
      "2 approvals selected",
      "1 pending and ready to sign off in this selection.",
    ])
    expect(selectionLines([APPROVALS[4]!])[0]).toBe("1 approval selected")
  })

  it("checks New request and files it under the approval rules", () => {
    expect(
      requestErrors({ ...FORM, account: "", value: "", justification: " " })
    ).toEqual({
      account: "Enter the homeowner",
      value: "Enter an amount",
      justification: "Enter a justification",
    })
    expect(requestErrors({ ...FORM, value: "0", discount: "150" })).toEqual({
      value: "Enter an amount greater than 0",
      discount: "Use a value between 0 and 100",
    })
    expect(submittedLine(FORM)).toBe(
      "Price override · Harriet Lawson · Julia Serrano"
    )
    const blocked = newApproval(FORM, "n1")
    expect(blocked).toMatchObject({
      request: "22% off",
      quote: "No quote",
      value: 1039,
      status: "Pending",
      requested: "Just now",
    })
    expect(blocked.checks[0]!.state).toBe("block")
    expect(newApproval({ ...FORM, discount: "8" }, "n2").status).toBe(
      "Approved"
    )
    expect(
      newApproval(
        { ...FORM, type: "Back-end advance", discount: "", value: "1,500" },
        "n3"
      )
    ).toMatchObject({
      request: "$1,500 back-end advance",
      status: "Pending",
      checks: [{ label: "Over $1,000", state: "warn" }],
    })
    expect(
      newApproval({ ...FORM, type: "Waived initial", discount: "" }, "n4")
    ).toMatchObject({
      request: "Waived initial",
      status: "Pending",
      checks: [{ state: "warn" }],
    })
  })
})
