/* shop.js — renders the shop grid and drives the price + category filters. */
(function () {
  'use strict';

  var state = {
    subcats: new Set(),   // selected subcategory names
    maxPrice: Infinity
  };

  var grid = document.getElementById('grid');
  var countEl = document.getElementById('resultCount');
  var emptyEl = document.getElementById('emptyState');
  var catBox = document.getElementById('catFilters');
  var priceSlider = document.getElementById('priceSlider');
  var priceReadout = document.getElementById('priceReadout');
  var chipWrap = document.getElementById('priceChips');
  var clearBtn = document.getElementById('clearFilters');
  var toggleBtn = document.getElementById('filtersToggle');
  var filtersEl = document.getElementById('filters');

  function swatchHtml(colours) {
    return (colours || [])
      .map(function (c) {
        var cls = c.available ? '' : ' na';
        var ttl = BnB.esc(c.name) + (c.available ? '' : ' (unavailable)');
        return (
          '<span class="swatch' + cls + '" title="' + ttl + '">' +
          '<i style="background:' + BnB.esc(c.hex || '#fff') + '"></i></span>'
        );
      })
      .join('');
  }

  // Pastel card background: the item's colours averaged, then softened with
  // white so photos with any background colour sit nearly seamlessly.
  function cardBlend(colours) {
    var hexes = (colours || [])
      .filter(function (c) { return c && c.hex; })
      .map(function (c) {
        var h = c.hex.replace('#', '');
        if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
        return {
          r: parseInt(h.slice(0, 2), 16),
          g: parseInt(h.slice(2, 4), 16),
          b: parseInt(h.slice(4, 6), 16)
        };
      });
    if (!hexes.length) return 'rgb(250,247,244)';
    var r = 0, g = 0, b = 0;
    hexes.forEach(function (c) { r += c.r; g += c.g; b += c.b; });
    r /= hexes.length; g /= hexes.length; b /= hexes.length;
    var W = 0.72; // white weight
    return (
      'rgb(' +
      Math.round(r + (255 - r) * W) + ',' +
      Math.round(g + (255 - g) * W) + ',' +
      Math.round(b + (255 - b) * W) + ')'
    );
  }

  function cardHtml(item) {
    var out = item.stock === false;
    var img = item.images && item.images.length ? item.images[0] : '';
    return (
      '<article class="card' + (out ? ' is-out' : '') + '" style="background:' + cardBlend(item.colours) + '">' +
      '<a class="media" href="' + BnB.itemPageHref(item.id) + '" aria-label="' + BnB.esc(item.name) + '">' +
      '<img src="' + BnB.fullImageUrl(img) + '" alt="' + BnB.esc(item.name) + '" loading="lazy" />' +
      '</a>' +
      '<div class="meta">' +
      '<span class="cat">' + BnB.esc(item.category || '') + ' &middot; ' + BnB.esc(item.subcategory || '') + '</span>' +
      '<h2 class="name">' + BnB.esc(item.name) + '</h2>' +
      '<div class="row">' +
      '<span class="price">' + BnB.formatPrice(item.cost) + '</span>' +
      '<span class="swatches">' + swatchHtml(item.colours) + '</span>' +
      '</div>' +
      '</div>' +
      (out
        ? '<button class="btn buy" disabled>Out of Stock</button>'
        : '<a class="btn buy" href="' + BnB.buildWhatsAppLink(item, null) + '" target="_blank" rel="noopener">' +
          'Order via WhatsApp' +
          '</a>') +
      '</article>'
    );
  }

  function matches(item) {
    if (state.subcats.size && !state.subcats.has(item.subcategory)) return false;
    if (item.cost > state.maxPrice) return false;
    return true;
  }

  function render() {
    var catalog = window.__bnbCatalog || { items: [] };
    var items = (catalog.items || []).filter(matches);
    grid.innerHTML = items.map(cardHtml).join('');
    countEl.textContent = items.length + (items.length === 1 ? ' item' : ' items');
    emptyEl.style.display = items.length ? 'none' : 'block';
    if (!items.length) emptyEl.scrollIntoView({ block: 'nearest' });
  }

  function buildCategoryFilters(categories, items) {
    var html = '';
    categories.forEach(function (cat) {
      var subs = cat.subcategories || [];
      var counts = {};
      items.forEach(function (it) {
        if (it.category === cat.name && subs.some(function (s) { return s.name === it.subcategory; })) {
          counts[it.subcategory] = (counts[it.subcategory] || 0) + 1;
        }
      });
      html +=
        '<div class="filter-label" style="cursor:default;pointer-events:none;font-family:var(--serif);font-weight:600;' +
        'text-transform:uppercase;letter-spacing:0.2em;font-size:0.74rem;padding-top:12px;">' +
        BnB.esc(cat.name) + '</div>';
      subs.forEach(function (sub) {
        var n = counts[sub.name] || 0;
        html +=
          '<label class="filter-label filter-sub">' +
          '<input type="checkbox" data-sub="' + BnB.esc(sub.name) + '" />' +
          '<span class="lbl">' + BnB.esc(sub.name) + '</span>' +
          '<span class="cnt">' + n + '</span>' +
          '</label>';
      });
    });
    catBox.innerHTML = html;

    catBox.querySelectorAll('input[type="checkbox"]').forEach(function (box) {
      box.addEventListener('change', function () {
        if (box.checked) state.subcats.add(box.dataset.sub);
        else state.subcats.delete(box.dataset.sub);
        render();
      });
    });
  }

  function buildPriceFilters(items) {
    var maxCost = Math.max.apply(null, items.map(function (i) { return i.cost; }).concat([0]));
    var ceil = Math.ceil(maxCost / 25) * 25;
    priceSlider.min = 0;
    priceSlider.max = ceil;
    priceSlider.step = 5;
    priceSlider.value = ceil;
    state.maxPrice = ceil;
    priceReadout.textContent = 'Up to ' + BnB.formatPrice(ceil);
    priceSlider.addEventListener('input', function () {
      state.maxPrice = Number(priceSlider.value);
      priceReadout.textContent = 'Up to ' + BnB.formatPrice(state.maxPrice);
      syncChips();
      render();
    });

    var presets = [
      { label: 'Under $50', value: 50 },
      { label: 'Under $100', value: 100 },
      { label: 'Under $250', value: 250 },
      { label: 'All', value: ceil }
    ];
    presets.forEach(function (p) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'chip' + (p.value === ceil ? ' on' : '');
      b.textContent = p.label;
      b.dataset.value = p.value;
      b.addEventListener('click', function () {
        priceSlider.value = p.value;
        state.maxPrice = p.value;
        priceReadout.textContent = 'Up to ' + BnB.formatPrice(p.value);
        syncChips();
        render();
      });
      chipWrap.appendChild(b);
    });
  }

  function syncChips() {
    chipWrap.querySelectorAll('.chip').forEach(function (c) {
      c.classList.toggle('on', Number(c.dataset.value) === state.maxPrice);
    });
  }

  clearBtn.addEventListener('click', function () {
    state.subcats.clear();
    catBox.querySelectorAll('input').forEach(function (b) { b.checked = false; });
    priceSlider.value = priceSlider.max;
    state.maxPrice = Number(priceSlider.max);
    priceReadout.textContent = 'Up to ' + BnB.formatPrice(state.maxPrice);
    syncChips();
    render();
  });

  toggleBtn.addEventListener('click', function () {
    var collapsed = filtersEl.classList.toggle('collapsed');
    toggleBtn.textContent = collapsed ? 'Show Filters' : 'Hide Filters';
  });

  BnB.getCatalog().then(function (catalog) {
    window.__bnbCatalog = catalog;
    buildCategoryFilters(catalog.categories || [], catalog.items || []);
    buildPriceFilters(catalog.items || []);
    render();
  });
})();
