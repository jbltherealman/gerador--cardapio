import { Store } from './store.js';
import { UI } from './ui.js';
import { exportMenu } from './exporter.js';

document.addEventListener('DOMContentLoaded', () => {
    // 1. Inicializar Dados
    UI.loadConfig(Store.getRestaurant());
    UI.renderItems(Store.getItems());
    UI.renderPreview(Store.getRestaurant(), Store.getItems());

    // 2. Configurações - Auto-Save (Debounce)
    const configForm = document.getElementById('config-form');
    const autoSaveIndicator = document.getElementById('auto-save-indicator');
    let saveTimeout;

    if (configForm) {
        configForm.addEventListener('input', (e) => {
            if (e.target.tagName === 'INPUT') {
                if (autoSaveIndicator) {
                    autoSaveIndicator.textContent = 'Salvando...';
                    autoSaveIndicator.style.opacity = '1';
                }
                
                clearTimeout(saveTimeout);
                saveTimeout = setTimeout(() => {
                    Store.saveRestaurant(UI.getConfigData());
                    UI.renderPreview(Store.getRestaurant(), Store.getItems());
                    if (autoSaveIndicator) {
                        autoSaveIndicator.textContent = 'Salvo automaticamente ✓';
                        setTimeout(() => autoSaveIndicator.style.opacity = '0', 2000);
                    }
                }, 600); // 600ms debounce
            }
        });
    }

    // 3. Navegação por abas
    UI.navItems().forEach(nav => {
        nav.addEventListener('click', (e) => {
            e.preventDefault();
            const target = nav.dataset.target;
            if (target) UI.switchSection(target);
        });
    });

    // 4. Produtos - Salvar/Atualizar
    const btnSaveItem = UI.itemForm.btnSave();
    if (btnSaveItem) {
        btnSaveItem.addEventListener('click', () => {
            const data = UI.getItemData();
            if (!data.name || !data.price) {
                UI.showMessage('Nome e preço são obrigatórios!');
                return;
            }
            Store.saveItem(data);
            UI.clearItemForm();
            UI.renderItems(Store.getItems());
            UI.renderPreview(Store.getRestaurant(), Store.getItems());
        });
    }

    // 5. Produtos - Cancelar Edição
    const btnCancelItem = UI.itemForm.btnCancel();
    if (btnCancelItem) {
        btnCancelItem.addEventListener('click', () => {
            UI.clearItemForm();
        });
    }

    // 6. Produtos - Ações de Lista (Delegation)
    const itemsList = UI.itemsList();
    if (itemsList) {
        itemsList.addEventListener('click', (e) => {
            const btnEdit = e.target.closest('.btn-edit');
            const btnDelete = e.target.closest('.btn-delete');
            
            if (btnEdit) {
                const id = btnEdit.dataset.id;
                const items = Store.getItems();
                const item = items.find(i => i.id === id);
                if (item) UI.fillItemForm(item);
            }
            
            if (btnDelete) {
                const id = btnDelete.dataset.id;
                if (confirm('Tem certeza que deseja excluir este produto?')) {
                    Store.deleteItem(id);
                    UI.renderItems(Store.getItems());
                    UI.clearItemForm();
                    UI.renderPreview(Store.getRestaurant(), Store.getItems());
                }
            }
        });
    }

    // 7. Exportação
    const btnExportZip = document.getElementById('btn-export-zip');
    if (btnExportZip) {
        btnExportZip.addEventListener('click', async () => {
            const originalText = btnExportZip.textContent;
            btnExportZip.textContent = 'Gerando...';
            btnExportZip.disabled = true;
            
            const success = await exportMenu(Store.getData());
            
            btnExportZip.textContent = success ? '✅ Download Concluído!' : '❌ Falha ao Exportar';
            setTimeout(() => {
                btnExportZip.textContent = originalText;
                btnExportZip.disabled = false;
            }, 3000);
        });
    }

    // 8. Upload e Preview de Imagem Local (Produtos)
    const imgFile = UI.itemForm.imgFile ? UI.itemForm.imgFile() : null;
    const imgInput = UI.itemForm.img();
    const imgPreviewContainer = UI.itemForm.imgPreviewContainer ? UI.itemForm.imgPreviewContainer() : null;
    const imgPreview = UI.itemForm.imgPreview ? UI.itemForm.imgPreview() : null;
    const imgRemove = UI.itemForm.imgRemove ? UI.itemForm.imgRemove() : null;

    if (imgFile) {
        imgFile.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;

            // Validação de formato
            const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
            if (!validTypes.includes(file.type)) {
                UI.showMessage('Formato de arquivo inválido. Por favor, utilize JPG, JPEG, PNG ou WEBP.');
                imgFile.value = '';
                return;
            }

            // Validação de tamanho (5MB)
            if (file.size > 5 * 1024 * 1024) {
                UI.showMessage('A imagem é muito grande. O tamanho máximo permitido é de 5 MB.');
                imgFile.value = '';
                return;
            }

            // Conversão para Base64
            const reader = new FileReader();
            reader.onload = (evt) => {
                const base64String = evt.target.result;
                imgInput.value = base64String;
                if (imgPreview) imgPreview.src = base64String;
                if (imgPreviewContainer) imgPreviewContainer.style.display = 'flex';
            };
            reader.readAsDataURL(file);
        });
    }

    if (imgInput) {
        // Atualiza o preview se o usuário colar uma URL manualmente
        imgInput.addEventListener('input', (e) => {
            const val = e.target.value.trim();
            if (val) {
                if (imgPreview) imgPreview.src = val;
                if (imgPreviewContainer) imgPreviewContainer.style.display = 'flex';
            } else {
                if (imgPreviewContainer) imgPreviewContainer.style.display = 'none';
                if (imgPreview) imgPreview.src = '';
            }
        });
    }

    if (imgRemove) {
        imgRemove.addEventListener('click', () => {
            if (imgFile) imgFile.value = '';
            imgInput.value = '';
            if (imgPreview) imgPreview.src = '';
            if (imgPreviewContainer) imgPreviewContainer.style.display = 'none';
        });
    }
});
