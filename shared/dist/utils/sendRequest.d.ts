import type { ApiResponse } from "../types/types";
export declare function sendRestRequest<REQ, RES>(url: string, method?: "POST" | "GET" | "PUT" | "DELETE", body?: REQ, timeout?: number): Promise<ApiResponse<RES>>;
//# sourceMappingURL=sendRequest.d.ts.map