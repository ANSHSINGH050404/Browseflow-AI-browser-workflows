/**
 * Simple gate: compare left vs right with an operator.
 * Throws when the condition fails so the run stops (useful as a guard step).
 */
export async function condition({
  left,
  operator,
  right,
}: {
  left: string
  operator: string
  right: string
}) {
  const op = (operator || "equals").toLowerCase().trim()
  const l = left ?? ""
  const r = right ?? ""

  let passed = false
  switch (op) {
    case "equals":
    case "eq":
    case "==":
      passed = l === r
      break
    case "not_equals":
    case "neq":
    case "!=":
      passed = l !== r
      break
    case "contains":
      passed = l.includes(r)
      break
    case "not_contains":
      passed = !l.includes(r)
      break
    case "is_truthy":
      passed = Boolean(l) && l !== "false" && l !== "0"
      break
    case "is_empty":
      passed = l.trim() === ""
      break
    default:
      throw new Error(
        `Unknown condition operator "${operator}". Use equals, not_equals, contains, not_contains, is_truthy, or is_empty.`
      )
  }

  if (!passed) {
    throw new Error(
      `Condition failed: "${l}" ${op} "${r}" did not pass — run stopped.`
    )
  }

  return { passed: true, left: l, operator: op, right: r }
}
