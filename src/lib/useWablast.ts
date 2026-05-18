"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { wablast } from "./wablast";

export interface WablastUser {
  email?: string;
  name?: string;
  role?: string;
  tenant_id?: string;
}

export type DeviceStatus = "disconnected" | "connecting" | "connected" | "error";

export interface CampaignMessage {
  phone?: string;
  name?: string;
  status?: string;
  message?: string;
  reason?: string;
  timestamp?: string;
}

export interface CampaignProgress {
  campaignId: string;
  status: "creating" | "running" | "completed" | "error";
  message: string;
  sent?: number;
  total?: number;
  successCount?: number;
  failedCount?: number;
  startTime?: number;
  delaySeconds?: number;
  jitterSeconds?: number;
}

export interface CampaignSyncResult {
  messages: CampaignMessage[];
  total: number;
  successCount: number;
  failedCount: number;
  pendingCount: number;
}

export interface BlastProgress {
  status: "idle" | "sending" | "done" | "cancelled";
  current: number;
  total: number;
  currentName: string;
  currentPhone: string;
  sent: { name: string; phone: string; campaignId: string }[];
  errors: { name: string; phone: string; error: string }[];
  abortSignal: { aborted: boolean };
}

export function useWablast() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<WablastUser | null>(null);
  const [deviceStatus, setDeviceStatus] = useState<DeviceStatus>("disconnected");
  const [devicePhone, setDevicePhone] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [qrData, setQrData] = useState<string | null>(null);
  const [pairingCode, setPairingCode] = useState<string | null>(null);
  const [isGettingPairingCode, setIsGettingPairingCode] = useState(false);
  const [campaign, setCampaign] = useState<CampaignProgress | null>(null);
  const [campaignMessages, setCampaignMessages] = useState<CampaignMessage[]>([]);
  const [campaignMessagesMap, setCampaignMessagesMap] = useState<Record<string, CampaignMessage[]>>({});
  const [isSyncing, setIsSyncing] = useState(false);
  const [campaignList, setCampaignList] = useState<Record<string, unknown>[]>([]);
  const [isFetchingCampaigns, setIsFetchingCampaigns] = useState(false);
  const [blastProgress, setBlastProgress] = useState<BlastProgress | null>(null);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const token = wablast.token;
    if (token) {
      setIsLoggedIn(true);
      const savedUser = localStorage.getItem("wablast_user");
      if (savedUser) {
        try { setUser(JSON.parse(savedUser)); } catch { /* ignore */ }
      }
    }
  }, []);

  const checkDeviceStatus = useCallback(async () => {
    if (!wablast.isLoggedIn) return;
    try {
      const data = await wablast.getDeviceStatus();
      const d = data as Record<string, unknown>;
      const gateway = d?.gateway as Record<string, unknown> | undefined;
      const results = gateway?.results as Record<string, unknown> | undefined;

      const isConnected =
        results?.is_connected === true ||
        d?.is_connected === true ||
        d?.connected === true ||
        d?.status === "connected" ||
        d?.status === "online";

      setDeviceStatus(isConnected ? "connected" : "disconnected");

      const phone =
        (results?.phone as string) ||
        (d?.phone as string) ||
        (results?.device_id as string) ||
        (d?.wa_device_id as string) ||
        null;
      if (phone) setDevicePhone(phone);
      else if (isConnected && !phone) setDevicePhone("Connected");
    } catch {
      setDeviceStatus("disconnected");
    }
  }, []);

  const startPolling = useCallback(() => {
    if (pollingRef.current) return;
    pollingRef.current = setInterval(checkDeviceStatus, 5000);
  }, [checkDeviceStatus]);

  const stopPolling = useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!isLoggedIn) {
      setDeviceStatus("disconnected");
      setDevicePhone(null);
      stopPolling();
      return;
    }
    checkDeviceStatus();
    return () => stopPolling();
  }, [isLoggedIn, checkDeviceStatus, stopPolling]);

  useEffect(() => {
    if (deviceStatus === "connected" || deviceStatus === "disconnected") {
      stopPolling();
    }
  }, [deviceStatus, stopPolling]);

  const login = async (email: string, password: string) => {
    setIsLoggingIn(true);
    setLoginError("");
    try {
      const data = await wablast.login(email, password);
      console.log("[WABLAST] Login response fields:", Object.keys(data).join(", "), "token:", data.access_token?.slice(0, 10) + "...");
      setIsLoggedIn(true);
      const userData: WablastUser = (data.user || { email }) as WablastUser;
      setUser(userData);
      localStorage.setItem("wablast_user", JSON.stringify(userData));
      checkDeviceStatus();
    } catch (e) {
      setLoginError(e instanceof Error ? e.message : "Login gagal");
    }
    setIsLoggingIn(false);
  };

  const logout = () => {
    wablast.clearToken();
    setIsLoggedIn(false);
    setUser(null);
    setDeviceStatus("disconnected");
    setDevicePhone(null);
    setQrData(null);
    setPairingCode(null);
  };

  const connectDevice = async () => {
    setDeviceStatus("connecting");
    try {
      await wablast.createDevice();
    } catch {
      // device may already exist
    }
    await new Promise((r) => setTimeout(r, 2000));
    await checkDeviceStatus();
    startPolling();
  };

  const fetchQr = async (): Promise<string | null> => {
    try {
      setQrData(null);
      setPairingCode(null);
      const data = await wablast.getQr();

      if (typeof data === "string") {
        setQrData(data);
        return data;
      }

      const d = data as Record<string, unknown>;
      const gateway = d?.gateway as Record<string, unknown> | undefined;
      const results = gateway?.results as Record<string, unknown> | undefined;

      const qrStr = (d?.qr_link || d?.qr || d?.image || d?.data || d?.qr_code || d?.qrcode || results?.qr_link || null) as string | null;

      if (qrStr) setQrData(qrStr);
      return qrStr;
    } catch (e) {
      throw e;
    }
  };

  const fetchPairingCode = async (phone: string) => {
    setIsGettingPairingCode(true);
    setPairingCode(null);
    try {
      const data = await wablast.getPairingCode(phone);
      const code = data.code || data.pairing_code || null;
      setPairingCode(code);
      return code;
    } catch (e) {
      throw e;
    } finally {
      setIsGettingPairingCode(false);
    }
  };

  const disconnectDevice = async () => {
    try {
      await wablast.logoutDevice();
      setDeviceStatus("disconnected");
      setDevicePhone(null);
      setQrData(null);
      setPairingCode(null);
    } catch {
      // ignore
    }
  };

  const doBlast = async (
    csvBlob: Blob,
    templateText: string,
    campaignName: string,
    totalRecipients: number,
    delaySeconds = 1,
    jitterSeconds = 0,
  ): Promise<CampaignProgress> => {
    setCampaignMessages([]);
    setCampaign({ campaignId: "", status: "creating", message: "Menyiapkan..." });

    const csvFile = new File([csvBlob], "tamu.csv", { type: "text/csv" });
    console.log("[BLAST DEBUG] CSV size:", csvFile.size, "bytes, template:", templateText.slice(0, 60));

    setCampaign({ campaignId: "", status: "creating", message: "Upload dataset..." });
    const dataset = await wablast.uploadDataset(csvFile, `${campaignName}-dataset`);
    console.log("[BLAST DEBUG] Dataset upload response:", JSON.stringify(dataset));

    setCampaign({ campaignId: "", status: "creating", message: "Membuat template..." });
    const template = await wablast.createTemplate(
      `${campaignName}-template`,
      templateText,
    );
    const templateId = template.id || template.template_id || "";
    console.log("[BLAST DEBUG] Template create response:", JSON.stringify(template));

    setCampaign({ campaignId: "", status: "creating", message: "Membuat campaign..." });
    const camp = await wablast.createCampaign(campaignName, dataset.dataset_id, templateId);
    const campaignId = camp.id || camp.campaign_id || "";
    console.log("[BLAST DEBUG] Campaign create response:", JSON.stringify(camp));

    setCampaign({ campaignId: "", status: "creating", message: "Memulai pengiriman..." });
    const startResult = await wablast.startCampaign(campaignId, delaySeconds, jitterSeconds);
    console.log("[BLAST DEBUG] Campaign start response:", JSON.stringify(startResult));

    setCampaign({
      campaignId,
      status: "running",
      message: `Mengirim ke ${startResult.total || totalRecipients} nomor...`,
      total: startResult.total || totalRecipients,
      sent: startResult.sent || 0,
      successCount: startResult.sent || 0,
      failedCount: startResult.failed || 0,
      startTime: Date.now(),
      delaySeconds: (startResult.delay_ms || 0) / 1000 || delaySeconds,
      jitterSeconds: (startResult.jitter_ms || 0) / 1000 || jitterSeconds,
    });

    return {
      campaignId,
      status: "running" as const,
      message: "Mengirim...",
      total: startResult.total || totalRecipients,
      sent: startResult.sent || 0,
      successCount: startResult.sent || 0,
      failedCount: startResult.failed || 0,
      startTime: Date.now(),
      delaySeconds: (startResult.delay_ms || 0) / 1000 || delaySeconds,
      jitterSeconds: (startResult.jitter_ms || 0) / 1000 || jitterSeconds,
    };
  };

  const sendPersonalizedBlast = async (
    contacts: { name: string; phone: string; message: string }[],
    delaySeconds = 1,
    jitterSeconds = 0,
  ) => {
    const abortSignal = { aborted: false };
    const total = contacts.length;

    console.log(`[BLAST] ========================================`);
    console.log(`[BLAST] START — ${total} contacts, delay ${delaySeconds}s, jitter ${jitterSeconds}s`);
    console.log(`[BLAST] ========================================`);

    setBlastProgress({
      status: "sending",
      current: 0,
      total,
      currentName: "",
      currentPhone: "",
      sent: [],
      errors: [],
      abortSignal,
    });

    for (let i = 0; i < contacts.length; i++) {
      if (abortSignal.aborted) break;

      const c = contacts[i];
      const idx = i + 1;
      setBlastProgress((prev) => prev ? { ...prev, current: idx, currentName: c.name, currentPhone: c.phone } : null);

      console.log(`[BLAST] [${idx}/${total}] ${c.name} (${c.phone})`);
      console.log(`[BLAST] [${idx}/${total}] Template (first 150 chars):`, c.message.slice(0, 150));

      try {
        const csvContent = `phone,name\n"${c.phone}","${c.name.replace(/"/g, '""')}"`;
        const csvFile = new File([csvContent], `tamu.csv`, { type: "text/csv" });
        console.log(`[BLAST] [${idx}/${total}] Uploading dataset...`);
        const dataset = await wablast.uploadDataset(csvFile, `blast-${c.name.replace(/\s/g, "-")}`);
        console.log(`[BLAST] [${idx}/${total}] Dataset:`, dataset.dataset_id, "headers:", dataset.headers);

        console.log(`[BLAST] [${idx}/${total}] Creating template...`);
        const template = await wablast.createTemplate(`tpl-${idx}`, c.message);
        const templateId = template.id || template.template_id || "";
        console.log(`[BLAST] [${idx}/${total}] Template ID:`, templateId);

        console.log(`[BLAST] [${idx}/${total}] Creating campaign...`);
        const camp = await wablast.createCampaign(`camp-${idx}`, dataset.dataset_id, templateId);
        const campaignId = camp.id || camp.campaign_id || "";
        console.log(`[BLAST] [${idx}/${total}] Campaign ID:`, campaignId);

        console.log(`[BLAST] [${idx}/${total}] Starting campaign...`);
        await wablast.startCampaign(campaignId, 0, 0);
        console.log(`[BLAST] [${idx}/${total}] ✅ SENT`);

        setBlastProgress((prev) => prev ? {
          ...prev,
          sent: [...prev.sent, { name: c.name, phone: c.phone, campaignId }],
        } : null);
      } catch (e) {
        const errMsg = e instanceof Error ? e.message : "Unknown error";
        console.error(`[BLAST] [${idx}/${total}] ❌ FAILED:`, errMsg);
        setBlastProgress((prev) => prev ? {
          ...prev,
          errors: [...prev.errors, { name: c.name, phone: c.phone, error: errMsg }],
        } : null);
      }

      if (i < contacts.length - 1 && !abortSignal.aborted) {
        const jitter = jitterSeconds > 0 ? Math.random() * jitterSeconds * 1000 : 0;
        const wait = delaySeconds * 1000 + jitter;
        console.log(`[BLAST] [${idx}/${total}] Waiting ${Math.round(wait)}ms before next...`);
        await new Promise((r) => setTimeout(r, wait));
      }
    }

    console.log(`[BLAST] ========================================`);
    console.log(`[BLAST] DONE — Sent: ${contacts.length - (abortSignal.aborted ? 0 : 0)}, Errors: ${0}`);
    console.log(`[BLAST] ========================================`);

    setBlastProgress((prev) => prev ? { ...prev, status: abortSignal.aborted ? "cancelled" : "done", currentName: "", currentPhone: "" } : null);
    fetchCampaignList();
  };

  const cancelBlast = () => {
    setBlastProgress((prev) => {
      if (prev) prev.abortSignal.aborted = true;
      return prev ? { ...prev, status: "cancelled" } : null;
    });
  };

  const syncCampaignMessages = useCallback(async (campaignId: string): Promise<CampaignSyncResult | null> => {
    if (!campaignId) return null;
    setIsSyncing(true);
    try {
      const raw = await wablast.getCampaignMessages(campaignId, 500);

      let msgArr: Record<string, unknown>[] = [];
      if (Array.isArray(raw)) {
        msgArr = raw as Record<string, unknown>[];
      } else if (raw && typeof raw === "object") {
        const r = raw as Record<string, unknown>;
        msgArr = (Array.isArray(r.rows) ? r.rows : Array.isArray(r.data) ? r.data : Array.isArray(r.messages) ? r.messages : []) as Record<string, unknown>[];
      }

      const parsed: CampaignMessage[] = msgArr.map((m) => ({
        phone: (m.phone || m.to || m.number || "") as string,
        name: (m.name || m.contact_name || "") as string,
        status: (m.send_status || m.status || m.state || "") as string,
        message: (m.rendered_message || m.message || m.text || "") as string,
        reason: (m.error_message || m.reason || m.error || "") as string,
        timestamp: (m.sent_at || m.created_at || m.timestamp || "") as string,
      }));

      const successCount = parsed.filter((m) => m.status === "sent" || m.status === "success" || m.status === "delivered").length;
      const failedCount = parsed.filter((m) => m.status === "failed" || m.status === "error" || m.status === "rejected").length;
      const pendingCount = parsed.length - successCount - failedCount;

      setCampaignMessages(parsed);
      setCampaignMessagesMap((prev) => ({ ...prev, [campaignId]: parsed }));

      return { messages: parsed, total: parsed.length, successCount, failedCount, pendingCount };
    } catch {
      return null;
    } finally {
      setIsSyncing(false);
    }
  }, []);

  const refreshCurrentCampaign = useCallback(async () => {
    const c = campaign;
    if (!c?.campaignId) return;
    setIsSyncing(true);
    try {
      const result = await syncCampaignMessages(c.campaignId);
      if (result) {
        setCampaign((prev) => prev ? {
          ...prev,
          sent: result.total,
          successCount: result.successCount,
          failedCount: result.failedCount,
          status: result.successCount + result.failedCount >= (prev.total || 0) ? "completed" : "running",
          message: result.successCount + result.failedCount >= (prev.total || 0)
            ? `Selesai! Sukses: ${result.successCount}, Gagal: ${result.failedCount}`
            : `Proses: ${result.total}/${prev.total || 0} (Sukses: ${result.successCount}, Gagal: ${result.failedCount})`,
        } : null);
      }
    } catch {
      // ignore
    } finally {
      setIsSyncing(false);
    }
  }, [campaign, syncCampaignMessages]);

  const fetchCampaignList = useCallback(async () => {
    setIsFetchingCampaigns(true);
    try {
      const raw = await wablast.listCampaigns();
      let list: Record<string, unknown>[] = [];
      if (Array.isArray(raw)) {
        list = raw as Record<string, unknown>[];
      } else if (raw && typeof raw === "object") {
        const r = raw as Record<string, unknown>;
        list = (Array.isArray(r.data) ? r.data : Array.isArray(r.campaigns) ? r.campaigns : []) as Record<string, unknown>[];
      }
      setCampaignList(list);
    } catch {
      // ignore
    } finally {
      setIsFetchingCampaigns(false);
    }
  }, []);

  const fetchTemplateFormat = useCallback(async () => {
    try {
      const csv = await wablast.getTemplateCsv();
      console.log("[WABLAST] CSV Template format dari API:", csv);
      return csv;
    } catch {
      return null;
    }
  }, []);

  return {
    isLoggedIn,
    user,
    deviceStatus,
    devicePhone,
    isLoggingIn,
    loginError,
    qrData,
    pairingCode,
    isGettingPairingCode,
    campaign,
    campaignMessages,
    campaignMessagesMap,
    isSyncing,
    campaignList,
    isFetchingCampaigns,
    blastProgress,
    login,
    logout,
    connectDevice,
    fetchQr,
    fetchPairingCode,
    disconnectDevice,
    checkDeviceStatus,
    doBlast,
    sendPersonalizedBlast,
    cancelBlast,
    syncCampaignMessages,
    refreshCurrentCampaign,
    fetchCampaignList,
    fetchTemplateFormat,
    startPolling,
    stopPolling,
  };
}
