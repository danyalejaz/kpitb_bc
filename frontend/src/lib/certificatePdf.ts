import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

export async function downloadCertificatePdf(
  elementId = "certificate-template",
  fileName = "certificate.pdf",
) {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error("Certificate preview is not available yet.");
  }

  const canvas = await html2canvas(element, {
    backgroundColor: "#ffffff",
    scale: 2,
    useCORS: true,
  });

  const pdf = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
  });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 10;
  const maxWidth = pageWidth - margin * 2;
  const maxHeight = pageHeight - margin * 2;
  const ratio = Math.min(maxWidth / canvas.width, maxHeight / canvas.height);
  const width = canvas.width * ratio;
  const height = canvas.height * ratio;
  const x = (pageWidth - width) / 2;
  const y = (pageHeight - height) / 2;

  pdf.addImage(canvas.toDataURL("image/png"), "PNG", x, y, width, height);
  pdf.save(fileName);
}
