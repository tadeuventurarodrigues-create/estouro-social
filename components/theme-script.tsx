export function ThemeScript() {
  const code = `
    try {
      const saved = localStorage.getItem('theme') || 'dark';
      document.documentElement.dataset.theme = saved;
    } catch (e) {}
  `;
  return <script dangerouslySetInnerHTML={{ __html: code }} />;
}
