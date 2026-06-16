export async function exportMenu(storeData) {
    try {
        // 1. Obter o template HTML
        const response = await fetch('menu.html');
        if (!response.ok) throw new Error('Não foi possível carregar o template do cardápio.');
        let htmlContent = await response.text();

        // 2. Extrair CSS (para cumprir requisito de gerar CSS separado)
        const styleRegex = /<style>([\s\S]*?)<\/style>/;
        const match = htmlContent.match(styleRegex);
        let cssContent = '';
        if (match && match[1]) {
            cssContent = match[1];
            // Substituir o bloco <style> pela tag <link>
            htmlContent = htmlContent.replace(styleRegex, '<link rel="stylesheet" href="style.css">');
        }

        // 3. Injetar dados offline (substituir chamada do LocalStorage por variável fixa)
        // Isso garante o funcionamento offline (sem depender de servidor)
        const safeData = JSON.stringify(storeData).replace(/\\/g, '\\\\').replace(/'/g, "\\'");
        htmlContent = htmlContent.replace(
            "const dataStr = localStorage.getItem('burgerMenuData');",
            `const dataStr = '${safeData}';`
        );

        // 4. Criar o arquivo ZIP usando JSZip (carregado via CDN no index.html)
        if (typeof JSZip === 'undefined') {
            alert("Biblioteca JSZip não carregada. Verifique sua conexão.");
            return;
        }

        const zip = new JSZip();
        zip.file("index.html", htmlContent);
        if (cssContent) {
            zip.file("style.css", cssContent);
        }

        // 5. Gerar e baixar o ZIP
        const blob = await zip.generateAsync({ type: "blob" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "meu-cardapio-digital.zip";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        return true;
    } catch (error) {
        console.error('Erro na exportação:', error);
        alert('Erro ao exportar. Certifique-se de estar rodando em um servidor local (Live Server).');
        return false;
    }
}
