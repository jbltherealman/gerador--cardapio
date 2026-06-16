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
});
