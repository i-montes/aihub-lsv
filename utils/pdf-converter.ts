"use client";

import * as pdfjsLib from "pdfjs-dist";

// Set worker source for PDF.js - using local file in public directory
if (typeof window !== "undefined") {
  pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.js";
}

export interface ConvertedImage {
  page: number;
  base64: string;
  width: number;
  height: number;
}

export interface ConvertedPdf {
  originalFileName: string;
  images: ConvertedImage[];
}

export async function convertPdfToImages(file: File): Promise<ConvertedPdf> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  const images: ConvertedImage[] = [];

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const viewport = page.getViewport({ scale: 2.0 });

    // Create canvas element
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d")!;

    canvas.height = viewport.height;
    canvas.width = viewport.width;

    // Render page
    await page.render({
      canvasContext: context,
      viewport: viewport,
    }).promise;

    // Convert to base64
    const base64 = canvas.toDataURL("image/png").split(",")[1];

    images.push({
      page: pageNum,
      base64,
      width: viewport.width,
      height: viewport.height,
    });
  }

  images;
}
