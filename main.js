const db = {
  methods: {
    findI: (id) => {
      return db.items.find(item => item.id == id);
    },
    remove: (items) => {
      items.forEach(item => {
        const product = db.methods.findI(item.id);
        product.qty = product.qty - item.qty
      });
    }
  },
  items: [{
    id: 0,
    title: 'Funko Pop',
    price: 250,
    qty: 5
  },
  {
    id: 1,
    title: 'Harry Potter',
    price: 345,
    qty: 50
  },
  {
    id: 2,
    title: 'Phillips Hue',
    price: 1300,
    qty: 5
  }]
};
const shoppingCart = {
  items: [],
  methods: {
    add: (id, qty) => {
      const cartItem = shoppingCart.methods.get(id);
      if (cartItem) {

        if (shoppingCart.methods.hasInventory(id, qty + cartItem.qty)) {
          cartItem.qty += qty;
        } else {
          alert('No hay elementos en el inventario');
        }
      } else {
        shoppingCart.items.push({ id, qty });
      }

    },
    remove: (id, qty) => {
      const cartItem = shoppingCart.methods.get(id);
      if (cartItem.qty - qty > 0) {
        cartItem.qty -= qty;
      } else {
        shoppingCart.items = shoppingCart.items.filter(item => item.id != id);
      }
    },
    count: (id, qty) => {
      return shoppingCart.items.reduce((acc, item) => acc + item.qty, 0);
    },

    get: (id, qty) => {
      const index = shoppingCart.items.findIndex(item => item.id == id);
      return index >= 0 ? shoppingCart.items[index] : null;
    },
    getTotal: () => {

      const total = shoppingCart.items.reduce((acc, item) => {
        const found = db.methods.findI(item.id);
        return (acc + found.price * item.qty)
      }, 0);
      return total;
    },
    hasInventory: (id, qty) => {
      //Busco el elemento y le resto en el inventario 
      //Mientras que la resta no de negativa el result es true
      return db.items.find(item => item.id === id).qty - qty >= 0;
    },
    purchase: () => {
      db.methods.remove(shoppingCart.items);
      shoppingCart.items = [];
    }


  }
};
renderStore();
function renderStore() {
  const html = db.items.map(item => {
    return `<div class='item'>
    <div class='title'>${item.title} </div>
    <div class='price'>${nummberToCurrency(item.price)} </div>
    <div class='qty'>${item.qty} </div>

    <div class=actions>
    <button class='add' data-id=${item.id}>Add to Shopping Cart</button>
    
    </div>
    </div>
    `
  });
  document.getElementById('store-container').innerHTML = html.join('');

  document.querySelectorAll('.item .actions .add').forEach(button => {
    button.addEventListener('click', e => {
      const id = parseInt(button.getAttribute('data-id'));

      const item = db.methods.findI(id);

      if (item && item.qty - 1 >= 0) {
        //Se puede añadir al carrito 
        shoppingCart.methods.add(id, 1);

        renderShoppingCart();
      }
      else {
        //No se puede añadir el producto al carrito
        alert('Producto no disponible');
      }
    })

  })
}
//Usando API Internacional (Intl)
//El objecto Intl.NumberFormat habilita el formato numérico de acuerdo al lenguaje.
function nummberToCurrency(n) {
  return new Intl.NumberFormat("en-US", {
    maximumSignificantDigits: 2,
    style: "currency",
    currency: "USD",
  }).format(n);
}

function renderShoppingCart() {
  const html = shoppingCart.items.map(item => {
    const dbItem = db.methods.findI(item.id)
    return ` 
    <div class='item'>
    <div class="title">${dbItem.title} </div>
    <div class="price">${nummberToCurrency(dbItem.price)} </div>
    <div class="qty">${item.qty} units </div>
    <div class="subtotal">
    Subtotal:${nummberToCurrency(item.qty * dbItem.price)}
    </div>
    <div class="actions">
    <button class='addOne' data-id='${item.id} '>+</button>
     <button class='removeOne' data-id='${item.id} '>-</button>
    </div>
    </div>
    `
  });
  const closeButton = `
<div id="cart-header">
<button class='bClose'>
Close</button>
</div>
  `;
  const purchaseButton = shoppingCart.items.length > 0 ? `
<div id="cart-actions">
<button id='bPurchase'>
Purchase</button>
</div>
  `: '';


  const total = shoppingCart.methods.getTotal();
  const totalContainer = `<div class="total">Total: ${nummberToCurrency(total)} </div>`;



  const shoppingCartContainer = document.querySelector('#shopping-cart-container');

  shoppingCartContainer.innerHTML = closeButton + html.join('') + totalContainer + purchaseButton;
  shoppingCartContainer.classList.remove('hide');
  shoppingCartContainer.classList.add('show');

  //Acciones
  document.querySelectorAll('.addOne').forEach(button => {
    button.addEventListener('click', e => {
      const id = parseInt(button.getAttribute('data-id'));
      shoppingCart.methods.add(id, 1);
      renderShoppingCart();
    });
  })
  document.querySelectorAll('.removeOne').forEach(button => {
    button.addEventListener('click', e => {
      const id = parseInt(button.getAttribute('data-id'));
      shoppingCart.methods.remove(id, 1);
      renderShoppingCart();
    });
  });

  document.querySelector('.bClose').addEventListener('click', e => {
    shoppingCartContainer.classList.remove('show');
    shoppingCartContainer.classList.add('hide');

  });
  const bPurchase = document.querySelector('#bPurchase');

  if (bPurchase) {
    bPurchase.addEventListener('click', e => {
      shoppingCart.methods.purchase();
      renderStore();
      renderShoppingCart();
    })

  }

}