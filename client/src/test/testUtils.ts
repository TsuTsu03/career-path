export function createJsonResponse<T>(
  data: T,
  init?: {
    status?: number;
    ok?: boolean;
    contentType?: string;
  }
): Response {
  const status = init?.status ?? 200;
  const ok = init?.ok ?? (status >= 200 && status < 300);
  const contentType = init?.contentType ?? "application/json";

  const responseLike = {
    status,
    ok,
    headers: new Headers({
      "content-type": contentType
    }),
    json: async () => data,
    text: async () => JSON.stringify(data)
  };

  return responseLike as unknown as Response;
}

export function createTextResponse(
  text: string,
  init?: {
    status?: number;
    ok?: boolean;
    contentType?: string;
  }
): Response {
  const status = init?.status ?? 200;
  const ok = init?.ok ?? (status >= 200 && status < 300);
  const contentType = init?.contentType ?? "text/plain";

  const responseLike = {
    status,
    ok,
    headers: new Headers({
      "content-type": contentType
    }),
    json: async () => ({ message: text }),
    text: async () => text
  };

  return responseLike as unknown as Response;
}
