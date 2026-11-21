import QRCode from "qrcode";

export type PassImageDetails = {
  value: string;
  leaderName: string;
  contactNumber: string;
  pax: number;
  bookingId: string;
};

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
) {
  const words = text.split(" ");
  const lines: string[] = [];
  let line = "";

  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (ctx.measureText(next).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  return lines;
}

export async function buildPassImageDataUrl(
  details: PassImageDetails,
): Promise<string> {
  const qrSize = 420;
  const width = 720;
  const padding = 48;
  const qrDataUrl = await QRCode.toDataURL(details.value, {
    width: qrSize,
    margin: 3,
    errorCorrectionLevel: "M",
    color: { dark: "#181818", light: "#ffffff" },
  });

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas unavailable");

  const qrImage = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Could not load QR image"));
    img.src = qrDataUrl;
  });

  const paxLabel = `${details.pax} ${details.pax === 1 ? "passenger" : "passengers"}`;
  const contentWidth = width - padding * 2;

  canvas.width = width;
  // Temporary height; we measure then redraw if needed — fixed layout is simpler
  const height = 980;
  canvas.height = height;

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = "#666666";
  ctx.font = "500 22px Geist, ui-sans-serif, system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("NaukaPass · TLS Hotels", width / 2, padding + 28);

  ctx.fillStyle = "#181818";
  ctx.font = "600 34px Geist, ui-sans-serif, system-ui, sans-serif";
  ctx.fillText("Dev Deepawali on the Ganges", width / 2, padding + 78);

  const qrX = (width - qrSize) / 2;
  const qrY = padding + 110;
  ctx.drawImage(qrImage, qrX, qrY, qrSize, qrSize);

  let y = qrY + qrSize + 48;
  ctx.fillStyle = "#181818";
  ctx.font = "600 36px Geist, ui-sans-serif, system-ui, sans-serif";
  const nameLines = wrapText(ctx, details.leaderName, contentWidth);
  for (const line of nameLines) {
    ctx.fillText(line, width / 2, y);
    y += 44;
  }

  y += 8;
  ctx.fillStyle = "#666666";
  ctx.font = "500 26px Geist, ui-sans-serif, system-ui, sans-serif";
  ctx.fillText(paxLabel, width / 2, y);
  y += 40;
  ctx.fillText(`Contact ${details.contactNumber || "—"}`, width / 2, y);
  y += 36;

  ctx.fillStyle = "#9b9b9b";
  ctx.font = "400 18px ui-monospace, SFMono-Regular, Menlo, monospace";
  const idLines = wrapText(ctx, `ID ${details.bookingId}`, contentWidth);
  for (const line of idLines) {
    ctx.fillText(line, width / 2, y);
    y += 26;
  }

  return canvas.toDataURL("image/png");
}
