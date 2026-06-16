export const UI = {
    elements: {
        name: () => document.getElementById('rest-name'),
        logo: () => document.getElementById('rest-logo'),
        whatsapp: () => document.getElementById('rest-whatsapp'),
        banner: () => document.getElementById('rest-banner'),
        colorPrimary: () => document.getElementById('rest-color-primary'),
        colorSecondary: () => document.getElementById('rest-color-secondary'),
        btnSave: () => document.getElementById('btn-save-config')
    },
    itemForm: {
        id: () => document.getElementById('item-id'),
        name: () => document.getElementById('item-name'),
        desc: () => document.getElementById('item-desc'),
        price: () => document.getElementById('item-price'),
        category: () => document.getElementById('item-category'),
        img: () => document.getElementById('item-img'),
        imgFile: () => document.getElementById('item-img-file'),
        imgPreviewContainer: () => document.getElementById('item-img-preview-container'),
        imgPreview: () => document.getElementById('item-img-preview'),
        imgRemove: () => document.getElementById('item-img-remove'),
        featured: () => document.getElementById('item-featured'),
        btnSave: () => document.getElementById('btn-save-item'),
        btnCancel: () => document.getElementById('btn-cancel-item')
    },
    itemsList: () => document.getElementById('items-list'),
    phonePreview: () => document.getElementById('phone-preview'),
    navItems: () => document.querySelectorAll('.nav-item[data-target]'),
    sections: () => document.querySelectorAll('.view-section'),
    
    loadConfig(restaurant) {
        if (!restaurant) return;
        if (restaurant.name) this.elements.name().value = restaurant.name;
        if (restaurant.logo) this.elements.logo().value = restaurant.logo;
        if (restaurant.whatsapp) this.elements.whatsapp().value = restaurant.whatsapp;
        if (restaurant.banner) this.elements.banner().value = restaurant.banner;
        if (restaurant.colorPrimary) this.elements.colorPrimary().value = restaurant.colorPrimary;
        if (restaurant.colorSecondary) this.elements.colorSecondary().value = restaurant.colorSecondary;
    },

    getConfigData() {
        return {
            name: this.elements.name().value,
            logo: this.elements.logo().value,
            whatsapp: this.elements.whatsapp().value,
            banner: this.elements.banner().value,
            colorPrimary: this.elements.colorPrimary().value,
            colorSecondary: this.elements.colorSecondary().value
        };
    },

    renderItems(items) {
        const list = this.itemsList();
        if(!list) return;
        
        if (items.length === 0) {
            list.innerHTML = '<p style="text-align:center; color:var(--color-text-muted); margin-top:20px;">Nenhum produto cadastrado.</p>';
            return;
        }

        list.innerHTML = items.map(item => `
            <div style="display: flex; gap: 10px; padding: 10px; border: 1px solid ${item.featured ? 'var(--color-primary)' : 'var(--color-border)'}; border-radius: var(--radius-md); margin-bottom: 10px; background: white; position: relative;">
                ${item.featured ? '<div style="position: absolute; top: -10px; right: -10px; font-size: 1.2rem;">⭐</div>' : ''}
                <img src="${item.img || 'https://via.placeholder.com/60'}" style="width:60px; height:60px; object-fit:cover; border-radius:var(--radius-md);" alt="${item.name}">
                <div style="flex:1;">
                    <h4 style="margin:0; font-size:1rem;">${item.name} <span style="font-size:0.875rem; color:var(--color-primary);">R$ ${parseFloat(item.price).toFixed(2)}</span></h4>
                    <p style="font-size:0.75rem; color:var(--color-text-muted); margin:2px 0;">Categoria: ${item.category}</p>
                    <p style="font-size:0.875rem; margin:0;">${item.desc}</p>
                </div>
                <div style="display: flex; flex-direction: column; gap: 5px;">
                    <button class="btn-edit" data-id="${item.id}" style="cursor:pointer; padding:5px 10px; border:none; background:#f1c40f; color:white; border-radius:4px; font-weight:bold;">Editar</button>
                    <button class="btn-delete" data-id="${item.id}" style="cursor:pointer; padding:5px 10px; border:none; background:#e74c3c; color:white; border-radius:4px; font-weight:bold;">Excluir</button>
                </div>
            </div>
        `).join('');
    },

    getItemData() {
        return {
            id: this.itemForm.id().value,
            name: this.itemForm.name().value,
            desc: this.itemForm.desc().value,
            price: this.itemForm.price().value,
            category: this.itemForm.category().value,
            img: this.itemForm.img().value,
            featured: this.itemForm.featured().checked
        };
    },

    fillItemForm(item) {
        this.itemForm.id().value = item.id || '';
        this.itemForm.name().value = item.name || '';
        this.itemForm.desc().value = item.desc || '';
        this.itemForm.price().value = item.price || '';
        this.itemForm.category().value = item.category || '';
        this.itemForm.img().value = item.img || '';
        
        // Atualizar preview
        const imgVal = item.img || '';
        if (imgVal) {
            if (this.itemForm.imgPreviewContainer()) this.itemForm.imgPreviewContainer().style.display = 'flex';
            if (this.itemForm.imgPreview()) this.itemForm.imgPreview().src = imgVal;
        } else {
            if (this.itemForm.imgPreviewContainer()) this.itemForm.imgPreviewContainer().style.display = 'none';
            if (this.itemForm.imgPreview()) this.itemForm.imgPreview().src = '';
            if (this.itemForm.imgFile()) this.itemForm.imgFile().value = '';
        }

        this.itemForm.featured().checked = item.featured || false;
        this.itemForm.btnCancel().style.display = item.id ? 'inline-block' : 'none';
        this.itemForm.btnSave().textContent = item.id ? 'Atualizar Produto' : 'Salvar Produto';
    },

    clearItemForm() {
        this.fillItemForm({});
    },

    switchSection(targetId) {
        this.sections().forEach(sec => sec.style.display = 'none');
        document.getElementById(targetId).style.display = 'block';
        
        this.navItems().forEach(nav => nav.classList.remove('active'));
        const activeNav = Array.from(this.navItems()).find(nav => nav.dataset.target === targetId);
        if (activeNav) activeNav.classList.add('active');
    },

    renderPreview(restaurant, items) {
        const preview = this.phonePreview();
        if(!preview) return;

        const colorPrimary = restaurant.colorPrimary || '#ff4757';
        const colorSecondary = restaurant.colorSecondary || '#2d3436';
        
        const featuredItems = items.filter(i => i.featured);
        const regularItems = items.filter(i => !i.featured);

        const groupedItems = regularItems.reduce((acc, item) => {
            const cat = item.category || 'Outros';
            if(!acc[cat]) acc[cat] = [];
            acc[cat].push(item);
            return acc;
        }, {});

        const categoriesHtml = Object.keys(groupedItems).map(cat => `
            <div style="margin-top: 20px;">
                <h3 style="padding: 0 15px; margin-bottom: 10px; font-size: 1.1rem; color: ${colorSecondary}; border-bottom: 2px solid ${colorPrimary}; display: inline-block;">${cat}</h3>
                <div>
                    ${groupedItems[cat].map(item => `
                        <div style="display: flex; gap: 10px; padding: 15px; border-bottom: 1px solid #f1f2f6;">
                            <img src="${item.img || 'https://via.placeholder.com/80'}" style="width:70px; height:70px; object-fit:cover; border-radius:8px;" alt="${item.name}">
                            <div style="flex:1;">
                                <h4 style="margin:0; font-size:1rem; color: #2d3436;">${item.name}</h4>
                                <p style="font-size:0.75rem; color:#636e72; margin:4px 0; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">${item.desc}</p>
                                <strong style="color: ${colorPrimary};">R$ ${parseFloat(item.price).toFixed(2)}</strong>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `).join('');

        const featuredHtml = featuredItems.length ? `
            <div style="margin-top: 20px; padding: 0 10px;">
                <h3 style="padding: 0 5px; margin-bottom: 10px; font-size: 1.2rem; color: ${colorPrimary};">⭐ Destaques</h3>
                <div style="display: flex; gap: 15px; overflow-x: auto; padding-bottom: 15px; scrollbar-width: none;">
                    ${featuredItems.map(item => `
                        <div style="min-width: 160px; background: white; border-radius: 12px; box-shadow: 0 4px 10px rgba(0,0,0,0.05); overflow: hidden; border: 1px solid ${colorPrimary}33;">
                            <img src="${item.img || 'https://via.placeholder.com/160'}" style="width: 100%; height: 110px; object-fit: cover;">
                            <div style="padding: 10px;">
                                <h4 style="margin:0; font-size:0.9rem; color: #2d3436; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${item.name}</h4>
                                <strong style="color: ${colorPrimary}; font-size: 1rem;">R$ ${parseFloat(item.price).toFixed(2)}</strong>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        ` : '';

        const bannerHtml = restaurant.banner ? `
            <div style="margin: 15px 15px 0;">
                <img src="${restaurant.banner}" style="width: 100%; height: auto; border-radius: 12px; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
            </div>
        ` : '';

        preview.innerHTML = `
            <div style="background-color: ${colorPrimary}; padding: 30px 20px; text-align: center; color: white;">
                ${restaurant.logo ? `<img src="${restaurant.logo}" style="width: 80px; height: 80px; object-fit: cover; border-radius: 50%; border: 3px solid white; margin-bottom: 10px;">` : `<div style="width:80px; height:80px; background:rgba(255,255,255,0.2); border-radius:50%; margin: 0 auto 10px; display:flex; align-items:center; justify-content:center; font-size: 2rem;">🍔</div>`}
                <h2 style="margin: 0; font-size: 1.5rem;">${restaurant.name || 'Restaurante'}</h2>
            </div>
            <div style="flex: 1; overflow-y: auto;">
                ${bannerHtml}
                ${featuredHtml}
                <div style="padding-bottom: 20px;">
                    ${regularItems.length ? categoriesHtml : (featuredItems.length ? '' : '<p style="text-align:center; margin-top:40px; color:#a4b0be;">Nenhum produto adicionado.</p>')}
                </div>
            </div>
        `;
    },

    showMessage(msg) {
        alert(msg);
    }
};
