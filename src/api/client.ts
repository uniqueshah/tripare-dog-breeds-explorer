
const API_BASE_URL = "https://dogapi.dog/api/v2";

const ENABLE_API_LOGS = __DEV__;

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export async function getJson(
  path: string,
): Promise<unknown> {
  const url = `${API_BASE_URL}${path}`;
  const requestId = Math.random().toString(36).slice(2, 8);
  const startedAt = Date.now();

  if (ENABLE_API_LOGS) {
    console.log(`\n🌐 [API ${requestId}] REQUEST`);
    console.log("Method:", "GET");
    console.log("URL:", url);
    console.log("Headers:", {
      Accept: "application/vnd.api+json, application/json",
    });
  }

  let response: Response;

  try {
    response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/vnd.api+json, application/json",
      },
    });
  } catch (error: unknown) {
    if (ENABLE_API_LOGS) {
      // console.error(`❌ [API ${requestId}] NETWORK ERROR`, error);
      console.log("Duration:", `${Date.now() - startedAt} ms`);
    }

    throw new ApiError(
      "Unable to connect. Check your internet connection.",
    );
  }

  if (ENABLE_API_LOGS) {
    console.log(`📥 [API ${requestId}] RESPONSE`);
    console.log("Status:", response.status, response.statusText);
    console.log("OK:", response.ok);
    console.log("Duration:", `${Date.now() - startedAt} ms`);
  }

  if (!response.ok) {
    const errorBody = await response.text().catch(() => "");

    // if (ENABLE_API_LOGS) {
    //   console.error(`❌ [API ${requestId}] ERROR BODY`, errorBody);
    // }

    throw new ApiError(
      `Request failed with status ${response.status}.`,
      response.status,
    );
  }

  try {
    const data: unknown = await response.json();

    if (ENABLE_API_LOGS) {
      console.log(`📦 [API ${requestId}] RESPONSE BODY`, data);
      console.log(`✅ [API ${requestId}] COMPLETED`);
    }

    return data;
  } catch {
    // if (ENABLE_API_LOGS) {
    //   console.error(`❌ [API ${requestId}] INVALID JSON`);
    // }

    throw new ApiError("The server returned invalid JSON.");
  }
}
