/** Estrae un fotogramma da un video locale come immagine, interamente nel browser (stesso
 * principio di Instagram: una copertina proposta in automatico dal video stesso, prima ancora
 * di caricarlo). Usato dal caricamento veloce del "+" globale per proporre una copertina senza
 * dover chiedere subito una foto separata — vedi components/creator/QuickUploadButton.tsx. */
export function captureVideoFrame(file: File, atSeconds: number): Promise<Blob | null> {
  return new Promise((resolve) => {
    const video = document.createElement("video");
    video.muted = true;
    video.playsInline = true;
    video.src = URL.createObjectURL(file);

    function cleanup() {
      URL.revokeObjectURL(video.src);
    }

    video.addEventListener("loadedmetadata", () => {
      const maxTime = Math.max(video.duration - 0.1, 0);
      video.currentTime = Math.min(Math.max(atSeconds, 0), maxTime);
    });

    video.addEventListener("seeked", () => {
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        cleanup();
        resolve(null);
        return;
      }
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(
        (blob) => {
          cleanup();
          resolve(blob);
        },
        "image/jpeg",
        0.9
      );
    });

    video.addEventListener("error", () => {
      cleanup();
      resolve(null);
    });
  });
}
