"use client";

const API_BASE = "/api/wablast";

class WablastClient {
  private _token: string | null = null;

  constructor() {
    if (typeof window !== "undefined") {
      this._token = localStorage.getItem("wablast_token");
    }
  }

  get token() {
    return this._token;
  }

  get isLoggedIn() {
    return !!this._token;
  }

  setToken(token: string) {
    this._token = token;
    localStorage.setItem("wablast_token", token);
  }

  clearToken() {
    this._token = null;
    localStorage.removeItem("wablast_token");
    localStorage.removeItem("wablast_user");
  }

  private headers(includeContentType = true): Record<string, string> {
    const h: Record<string, string> = {};
    if (this._token) h["Authorization"] = `Bearer ${this._token}`;
    if (includeContentType) h["Content-Type"] = "application/json";
    return h;
  }

  private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const res = await fetch(`${API_BASE}${path}`, options);
    const contentType = res.headers.get("content-type") || "";
    const isJson = contentType.includes("application/json");
    const body = isJson ? await res.json() : await res.text();

    if (!res.ok) {
      const message = typeof body === "object" && body !== null && "message" in body
        ? (body as { message: string }).message
        : String(body);
      throw new Error(message || `HTTP ${res.status}`);
    }

    return body as T;
  }

  async login(email: string, password: string) {
    const data = await this.request<Record<string, unknown>>("/auth/login", {
      method: "POST",
      headers: this.headers(),
      body: JSON.stringify({ email, password }),
    });

    const token =
      (data.access_token as string) ||
      (data.token as string) ||
      (data.jwt as string) ||
      ((data.data as Record<string, unknown> | undefined)?.access_token as string) ||
      ((data.data as Record<string, unknown> | undefined)?.token as string) ||
      "";

    if (!token) throw new Error("Token tidak ditemukan di respons login");

    this.setToken(token);

    const user = (data.user || data.profile || data.data) as Record<string, unknown> | undefined;
    if (user) {
      localStorage.setItem("wablast_user", JSON.stringify(user));
    }

    return { access_token: token, user };
  }

  async getMe() {
    return this.request("/auth/me", {
      headers: this.headers(),
    });
  }

  async createDevice(deviceId?: string, deviceName?: string) {
    return this.request("/wa/device/create", {
      method: "POST",
      headers: this.headers(),
      body: JSON.stringify({ device_id: deviceId, device_name: deviceName }),
    });
  }

  async setDevice(waDeviceId: string) {
    return this.request("/wa/device/set", {
      method: "POST",
      headers: this.headers(),
      body: JSON.stringify({ wa_device_id: waDeviceId }),
    });
  }

  async getDeviceStatus() {
    return this.request<{ status: string; connected?: boolean; phone?: string }>("/wa/device/status", {
      headers: this.headers(),
    });
  }

  async getQr(): Promise<{ qr?: string; image?: string; data?: string; qr_code?: string; qrcode?: string }> {
    return this.request("/wa/device/login-qr", {
      headers: this.headers(),
    });
  }

  async getPairingCode(phone: string) {
    return this.request<{ code?: string; pairing_code?: string }>("/wa/device/login-code", {
      method: "POST",
      headers: this.headers(),
      body: JSON.stringify({ phone }),
    });
  }

  async logoutDevice() {
    return this.request("/wa/device/logout", {
      method: "POST",
      headers: this.headers(false),
    });
  }

  async uploadDataset(file: File, filename?: string): Promise<{
    dataset_id: string;
    inserted: number;
    skipped: number;
    headers: string[];
  }> {
    const formData = new FormData();
    formData.append("file", file);
    if (filename) formData.append("name", filename);

    const res = await fetch(`${API_BASE}/datasets/upload`, {
      method: "POST",
      headers: { Authorization: `Bearer ${this._token}` },
      body: formData,
    });

    const contentType = res.headers.get("content-type") || "";
    const body = contentType.includes("application/json") ? await res.json() : await res.text();

    if (!res.ok) {
      const message = typeof body === "object" && body !== null && "message" in body
        ? (body as { message: string }).message
        : String(body);
      throw new Error(message || `HTTP ${res.status}`);
    }

    return body as { dataset_id: string; inserted: number; skipped: number; headers: string[] };
  }

  async listDatasets() {
    return this.request("/datasets", {
      headers: this.headers(),
    });
  }

  async getTemplateCsv(): Promise<string> {
    return this.request("/datasets/template.csv", {
      headers: this.headers(false),
    }) as unknown as string;
  }

  async previewDataset(id: string, limit?: number) {
    const qs = limit ? `?limit=${limit}` : "";
    return this.request(`/datasets/${id}/preview${qs}`, {
      headers: this.headers(),
    });
  }

  async createTemplate(name: string, bodyText: string) {
    return this.request<{ id?: string; template_id?: string }>("/templates", {
      method: "POST",
      headers: this.headers(),
      body: JSON.stringify({ name, body_text: bodyText }),
    });
  }

  async listTemplates() {
    return this.request("/templates", {
      headers: this.headers(),
    });
  }

  async createCampaign(name: string, datasetId: string, templateId: string) {
    return this.request<{ id?: string; campaign_id?: string }>("/campaigns", {
      method: "POST",
      headers: this.headers(),
      body: JSON.stringify({ name, dataset_id: datasetId, template_id: templateId }),
    });
  }

  async getCampaign(id: string) {
    return this.request(`/campaigns/${id}`, {
      headers: this.headers(),
    });
  }

  async listCampaigns() {
    return this.request("/campaigns", {
      headers: this.headers(),
    });
  }

  async startCampaign(id: string, delaySeconds?: number, jitterSeconds?: number): Promise<{
    campaign_id: string;
    status: string;
    total: number;
    sent: number;
    failed: number;
    delay_ms: number;
    jitter_ms: number;
  }> {
    return this.request(`/campaigns/${id}/start`, {
      method: "POST",
      headers: this.headers(),
      body: JSON.stringify({
        delay_seconds: delaySeconds ?? 1,
        jitter_seconds: jitterSeconds ?? 0,
      }),
    });
  }

  async getCampaignMessages(id: string, limit?: number, offset?: number) {
    const params = new URLSearchParams();
    if (limit) params.set("limit", String(limit));
    if (offset) params.set("offset", String(offset));
    const qs = params.toString() ? `?${params.toString()}` : "";
    return this.request(`/campaigns/${id}/messages${qs}`, {
      headers: this.headers(),
    });
  }
}

export const wablast = new WablastClient();
