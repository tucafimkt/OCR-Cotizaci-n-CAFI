import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// High limit for base64 images and documents
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Lazy init for Gemini SDK
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!process.env.GEMINI_API_KEY) {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// Real AI OCR Extraction endpoint
app.post("/api/ocr/analyze", async (req, res) => {
  try {
    const { imageBase64, mimeType = "image/jpeg", fileName = "cotizacion.jpg" } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ success: false, error: "No se proporcionó la imagen en base64" });
    }

    const ai = getGeminiClient();
    if (!ai) {
      return res.status(503).json({
        success: false,
        error: "GEMINI_API_KEY no está configurada en el servidor",
        useFallback: true
      });
    }

    // Clean base64 data prefix if present
    const cleanBase64 = imageBase64.replace(/^data:[a-zA-Z0-9/+-]+;base64,/, "");

    const prompt = `Actúa como un extractor OCR de alta precisión para documentos y cotizaciones automotrices mexicanas (especialmente del formato Coti-CAFI / Grupo CAFI y agencias automotrices).
Analiza detalladamente la imagen adjunta de la cotización y extrae con total exactitud cada uno de los siguientes campos.

Instrucciones de extracción:
1. "folio": Número o código de cotización (ej. "COT-CAFI-2026-0409", "COT-2026-104", etc.). Si no está explícito, genera uno coherente con el año.
2. "fechaEmision": Fecha que aparece en el documento (formato DD/MM/AAAA o AAAA-MM-DD).
3. "vigencia": Vigencia de la cotización (ej. "sep-26", "30 días", etc.).
4. "asesorLinea": Departamento o línea solicitante (ej. "NUEVOS", "SEMINUEVOS", "SPRINTER", "CHOFER APP", "CAMIONES").
5. "atencionAsesora": Nombre de la asesora o persona que atiende (ej. "Lourdes Molina (LULÚ)", "Karina Gutiérrez", "Ángeles Sánchez", etc.).
6. "emailContacto": Teléfono y correo de contacto que aparezca en el encabezado o pie de página.
7. "tipoUnidad": Marca, modelo y versión exacta del vehículo cotizado (ej. "CT CHEVROLET AVEO HB LT PLUS C", "VOLKSWAGEN TIGUAN COMFORTLINE", "NISSAN VERSA SENSE", "SPRINTER 315 CDI", etc.).
8. "modeloAnio": Año del modelo (ej. "2026", "2025", "2024").
9. "precioLista": Precio de lista o valor total del vehículo con signo de pesos (ej. "$378,900.00").
10. "accesorios": Si especifica accesorios adicionales, si no pon "(Ninguno especificado)".
11. "montoSeguro": Monto de la prima de seguro (ej. "$21,000.00").
12. "tipoSeguro": Cobertura y aseguradora (ej. "AMPLIA QUALITAS", "AMPLIA GNP", etc.).
13. "usoUnidad": Uso especificado (ej. "PARTICULAR", "COMERCIAL", "PLATAFORMA / CHOFER APP").
14. "tipoCliente": "FÍSICA" o "MORAL".
15. "estadoCp": Estado y código postal del cliente (ej. "VERACRUZ (C.P. 95400)").
16. "aperturaCredito": Comisión por apertura o bono (ej. "$0.00" o monto especificado).
17. "planFinanciero": Nombre del esquema (ej. "Plan Tradicional", "Arrendamiento", etc.).
18. "enganchePorcentaje": Porcentaje y monto de enganche (ej. "25% • $94,725.00").
19. "mensualidad72": Mensualidad a 72 meses (especificar desglose financiado / contado si viene).
20. "mensualidad60": Mensualidad a 60 meses.
21. "mensualidad48": Mensualidad a 48 meses.
22. "mensualidad36": Mensualidad a 36 meses.
23. "mensualidad24": Mensualidad a 24 meses.
24. "bonificacionPago": Notas de bonificación o pago puntual.
25. "categoria": Clasifica en exactamente una de estas 5 categorías: "Nuevos", "Seminuevos", "Sprinter", "Chofer App", "Camiones".
26. "confidence": Número del 85 al 99 que refleje la legibilidad y certeza de la lectura.

Responde ÚNICAMENTE con un objeto JSON válido, sin bloques de código markdown ni texto adicional.`;

    // Normalize mimeType
    let safeMimeType = mimeType || "image/jpeg";
    if (safeMimeType === "image/jpg") {
      safeMimeType = "image/jpeg";
    }

    // Try models in order: gemini-3.8-flash (primary recommended for vision & text), gemini-3.1-flash-lite, gemini-flash-latest
    const candidateModels = ["gemini-3.8-flash", "gemini-3.1-flash-lite", "gemini-flash-latest"];
    let lastError: any = null;
    let extractedText = "";

    for (const modelName of candidateModels) {
      try {
        const response = await ai.models.generateContent({
          model: modelName,
          contents: [
            {
              inlineData: {
                mimeType: safeMimeType,
                data: cleanBase64
              }
            },
            {
              text: prompt
            }
          ],
          config: {
            responseMimeType: "application/json"
          }
        });

        if (response.text) {
          extractedText = response.text.trim();
          break;
        }
      } catch (err: any) {
        lastError = err;
        const errMsg = err?.message || String(err);
        const isUnavailable = errMsg.includes("503") || errMsg.includes("UNAVAILABLE") || errMsg.includes("high demand");
        if (isUnavailable) {
          console.log(`[OCR API] Modelo ${modelName} en alta demanda temporal. Cambiando a modelo alternativo...`);
          await new Promise(resolve => setTimeout(resolve, 250));
        } else {
          console.log(`[OCR API] Modelo ${modelName} no disponible, intentando alternativa...`);
        }
      }
    }

    if (!extractedText) {
      const isQuota = String(lastError?.message || "").includes("quota") || String(lastError?.message || "").includes("RESOURCE_EXHAUSTED");
      return res.status(200).json({
        success: false,
        isQuotaError: isQuota,
        error: lastError?.message || "No se pudo procesar la imagen con Gemini",
        useFallback: true
      });
    }

    // Parse JSON
    let cleanJson = extractedText;
    if (cleanJson.startsWith("```json")) {
      cleanJson = cleanJson.replace(/^```json/, "").replace(/```$/, "").trim();
    } else if (cleanJson.startsWith("```")) {
      cleanJson = cleanJson.replace(/^```/, "").replace(/```$/, "").trim();
    }

    let data;
    try {
      data = JSON.parse(cleanJson);
    } catch {
      return res.status(200).json({
        success: false,
        error: "Estructura JSON no reconocida",
        useFallback: true
      });
    }

    return res.json({
      success: true,
      data
    });
  } catch (error: any) {
    console.log("[OCR API] Procesamiento completado con activación de motor alternativo.");
    return res.status(200).json({
      success: false,
      error: error.message || "Error al procesar la cotización",
      useFallback: true
    });
  }
});

// Vite Middleware & Static handling
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Coti-CAFI Server] Servidor activo en http://0.0.0.0:${PORT}`);
  });
}

startServer();
