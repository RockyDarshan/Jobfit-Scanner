export interface PdfConversionResult {
  imageUrl: string;
  file: File | null;
  error?: string;
}

let pdfjsLib: any = null;
let loadPromise: Promise<any> | null = null;

async function loadPdfJs(): Promise<any> {
  if (pdfjsLib) return pdfjsLib;
  if (loadPromise) return loadPromise;

  loadPromise = (async () => {
    try {
      const lib = await import("pdfjs-dist");
      // Import the worker module to get its correct path with version match
      const workerModule =
        await import("pdfjs-dist/build/pdf.worker.min.mjs?url");
      const workerUrl = workerModule.default;
      lib.GlobalWorkerOptions.workerSrc = workerUrl;
      pdfjsLib = lib;
      return lib;
    } catch (error) {
      console.error("Failed to load PDF.js library:", error);
      throw error;
    }
  })();

  return loadPromise;
}

async function blobFromCanvas(canvas: HTMLCanvasElement): Promise<Blob | null> {
  return new Promise((resolve) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          try {
            const dataUrl = canvas.toDataURL("image/png");
            fetch(dataUrl)
              .then((response) => response.blob())
              .then(resolve)
              .catch(() => resolve(null));
          } catch {
            resolve(null);
          }
        }
      },
      "image/png",
      1.0,
    );
  });
}

export async function convertPdfToImage(
  file: File,
): Promise<PdfConversionResult> {
  try {
    if (!file || !file.type.includes("pdf")) {
      return {
        imageUrl: "",
        file: null,
        error: "Invalid file format. Please upload a PDF file.",
      };
    }

    const lib = await loadPdfJs();

    const arrayBuffer = await file.arrayBuffer();
    const pdf = await lib.getDocument({ data: arrayBuffer }).promise;
    const page = await pdf.getPage(1);

    const viewport = page.getViewport({ scale: 4 });
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    if (!context) {
      return {
        imageUrl: "",
        file: null,
        error: "Failed to get canvas context",
      };
    }

    canvas.width = viewport.width;
    canvas.height = viewport.height;

    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = "high";

    await page.render({ canvasContext: context, viewport }).promise;

    const blob = await blobFromCanvas(canvas);
    if (!blob) {
      return {
        imageUrl: "",
        file: null,
        error: "Failed to convert canvas to blob",
      };
    }

    const originalName = file.name.replace(/\.pdf$/i, "");
    const imageFile = new File([blob], `${originalName}.png`, {
      type: "image/png",
    });

    return {
      imageUrl: URL.createObjectURL(blob),
      file: imageFile,
    };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    console.error("PDF to image conversion error:", errorMessage);
    return {
      imageUrl: "",
      file: null,
      error: `Failed to convert PDF: ${errorMessage}`,
    };
  }
}
