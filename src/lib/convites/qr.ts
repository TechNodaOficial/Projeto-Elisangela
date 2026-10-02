import "server-only";

import QRCode from "qrcode";

// O QR leva só o código de check-in do convidado. É separado do token do link:
// uma foto do QR permite entrar, mas não mudar a resposta do convite.
// Correção "M" (15%): aguenta tela trincada ou reflexo sem deixar o código denso demais.
const OPCOES = { errorCorrectionLevel: "M", margin: 0 } as const;

export function qrSvg(codigo: string) {
  return QRCode.toString(codigo, {
    ...OPCOES,
    type: "svg",
    color: { dark: "#212325", light: "#ffffff" },
  });
}

export function qrPngDataUrl(codigo: string, largura: number) {
  return QRCode.toDataURL(codigo, {
    ...OPCOES,
    width: largura,
    color: { dark: "#212325", light: "#ffffff" },
  });
}
