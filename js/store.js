const STORE_KEY = 'burgerMenuData';

export const Store = {
    getData() {
        const data = localStorage.getItem(STORE_KEY);
        return data ? JSON.parse(data) : { restaurant: {}, items: [] };
    },
    saveRestaurant(restaurantData) {
        const data = this.getData();
        data.restaurant = { ...data.restaurant, ...restaurantData };
        localStorage.setItem(STORE_KEY, JSON.stringify(data));
    },
    getRestaurant() {
        return this.getData().restaurant || {};
    },
    getItems() {
        return this.getData().items || [];
    },
    saveItem(item) {
        const data = this.getData();
        if(!data.items) data.items = [];
        
        if(item.id) {
            const idx = data.items.findIndex(i => i.id === item.id);
            if(idx > -1) data.items[idx] = item;
        } else {
            item.id = Date.now().toString();
            data.items.push(item);
        }
        localStorage.setItem(STORE_KEY, JSON.stringify(data));
    },
    deleteItem(id) {
        const data = this.getData();
        data.items = data.items.filter(i => i.id !== id);
        localStorage.setItem(STORE_KEY, JSON.stringify(data));
    }
};
