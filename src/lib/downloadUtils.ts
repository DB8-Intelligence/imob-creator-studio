/**
 * downloadImage — fetch de imagem como blob e disparo de download local.
 * Substitui <a href={url} download> que falha quando a URL é cross-origin
 * ou não carrega com o header Content-Disposition correto.
 */
export async function downloadImage(url: string, filename = "imobcreator.png"): Promise<void> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Falha ao baixar imagem: ${response.status}`);
  const blob = await response.blob();
  const objectUrl = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = objectUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(objectUrl);
}
