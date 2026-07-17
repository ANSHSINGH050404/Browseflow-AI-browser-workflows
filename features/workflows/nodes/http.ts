export async function httpRequest({
  method,
  url,
  body,
  headersJson,
}: {
  method: string
  url: string
  body?: string
  headersJson?: string
}) {
  if (!url?.trim()) {
    throw new Error("HTTP node requires a URL")
  }

  const methodUpper = (method || "GET").toUpperCase()
  let headers: Record<string, string> = {}
  if (headersJson?.trim()) {
    try {
      headers = JSON.parse(headersJson) as Record<string, string>
    } catch {
      throw new Error("Headers must be valid JSON, e.g. {\"Authorization\":\"Bearer …\"}")
    }
  }

  const init: RequestInit = { method: methodUpper, headers }
  if (body?.trim() && methodUpper !== "GET" && methodUpper !== "HEAD") {
    init.body = body
    if (!headers["Content-Type"] && !headers["content-type"]) {
      headers["Content-Type"] = "application/json"
    }
  }

  const res = await fetch(url, init)
  const text = await res.text()
  // Keep the body bounded so run metadata stays small.
  const truncated = text.length > 8_000 ? `${text.slice(0, 8_000)}…` : text

  let json: unknown
  try {
    json = JSON.parse(text)
  } catch {
    json = undefined
  }

  return {
    status: res.status,
    ok: res.ok,
    body: truncated,
    json,
    url: res.url,
  }
}
