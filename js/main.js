import { Store } from './store.js';
import { UI } from './ui.js';
import { exportMenu } from './exporter.js';

document.addEventListener('DOMContentLoaded', () => {
    // 1. Inicializar Dados
    UI.loadConfig(Store.getRestaurant());
    UI.renderItems(Store.getItems());
    UI.renderPreview(Store.getRestaurant(), Store.getItems());

    // 2. Função Reutilizável de Upload de Imagem
    function processImageUpload(file, onSuccess) {
        if (!file) return false;

        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        if (!validTypes.includes(file.type)) {
            UI.showMessage('Formato de arquivo inválido. Por favor, utilize JPG, JPEG, PNG ou WEBP.');
            return false;
        }

        if (file.size > 5 * 1024 * 1024) {
            UI.showMessage('A imagem é muito grande. O tamanho máximo permitido é de 5 MB.');
            return false;
        }

        const reader = new FileReader();
        reader.onload = (evt) => {
            onSuccess(evt.target.result);
        };
        reader.readAsDataURL(file);
        return true;
    }

    // 3. Configurações - Auto-Save (Debounce)
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

    // 8. Upload e Preview de Imagem Local (Logo)
    const logoFile = UI.elements.logoFile ? UI.elements.logoFile() : null;
    const logoInput = UI.elements.logo();
    const logoPreviewContainer = UI.elements.logoPreviewContainer ? UI.elements.logoPreviewContainer() : null;
    const logoPreview = UI.elements.logoPreview ? UI.elements.logoPreview() : null;
    const logoRemove = UI.elements.logoRemove ? UI.elements.logoRemove() : null;

    if (logoFile) {
        logoFile.addEventListener('change', (e) => {
            const file = e.target.files[0];
            const isValid = processImageUpload(file, (base64String) => {
                logoInput.value = base64String;
                if (logoPreview) logoPreview.src = base64String;
                if (logoPreviewContainer) logoPreviewContainer.style.display = 'flex';
                // Força o gatilho de auto-save disparando um evento 'input'
                logoInput.dispatchEvent(new Event('input', { bubbles: true }));
            });
            if (!isValid) logoFile.value = '';
        });
    }

    if (logoInput) {
        logoInput.addEventListener('input', (e) => {
            const val = e.target.value.trim();
            if (val) {
                if (logoPreview) logoPreview.src = val;
                if (logoPreviewContainer) logoPreviewContainer.style.display = 'flex';
            } else {
                if (logoPreviewContainer) logoPreviewContainer.style.display = 'none';
                if (logoPreview) logoPreview.src = '';
            }
        });
    }

    if (logoRemove) {
        logoRemove.addEventListener('click', () => {
            if (logoFile) logoFile.value = '';
            logoInput.value = '';
            if (logoPreview) logoPreview.src = '';
            if (logoPreviewContainer) logoPreviewContainer.style.display = 'none';
            logoInput.dispatchEvent(new Event('input', { bubbles: true }));
        });
    }

    // 9. Upload e Preview de Imagem Local (Produtos)
    const imgFile = UI.itemForm.imgFile ? UI.itemForm.imgFile() : null;
    const imgInput = UI.itemForm.img();
    const imgPreviewContainer = UI.itemForm.imgPreviewContainer ? UI.itemForm.imgPreviewContainer() : null;
    const imgPreview = UI.itemForm.imgPreview ? UI.itemForm.imgPreview() : null;
    const imgRemove = UI.itemForm.imgRemove ? UI.itemForm.imgRemove() : null;

    if (imgFile) {
        imgFile.addEventListener('change', (e) => {
            const file = e.target.files[0];
            const isValid = processImageUpload(file, (base64String) => {
                imgInput.value = base64String;
                if (imgPreview) imgPreview.src = base64String;
                if (imgPreviewContainer) imgPreviewContainer.style.display = 'flex';
            });
            if (!isValid) imgFile.value = '';
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
