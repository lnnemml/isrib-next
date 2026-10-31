import "server-only";

// Telegram Bot API transport (ADR 0025). The request URL holds the bot token, so nothing from
// it may reach an error or a log: failures carry only an HTTP status or an error name.

const API_BASE = "https://api.telegram.org";

const TIMEOUT_MS = 5_000;

// `code` is what safeErrorTag prints. The original fetch error is dropped on purpose, not kept
// as `cause`, because fetch errors can quote the URL they failed on.
class TelegramSendError extends Error {
  readonly code: string;

  constructor(code: string) {
    super(`Telegram sendMessage failed: ${code}`);
    this.name = "TelegramSendError";
    this.code = code;
  }
}

// Throws on a missing token, a network failure, a timeout or a non-ok response.
export async function sendTelegramMessage(chatId: string, text: string): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN?.trim();
  if (!token) throw new TelegramSendError("no_token");

  let res: Response;
  try {
    res = await fetch(`${API_BASE}/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text, disable_web_page_preview: true }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch (err) {
    throw new TelegramSendError(err instanceof Error ? err.name : "network");
  }

  if (!res.ok) throw new TelegramSendError(String(res.status));
}
