/* item.js — item detail page. Reads ?item=XXXXX, renders the product,
 * and injects per-item Open Graph metadata for sharing (WhatsApp previews). */
(function () {
  'use strict';

  var params = new URLSearchParams(window.location.search);
  var itemId = params.get('item');
  var selectedColour = null;

  var notFound = document.getElementById('notFound');
  var detail = document.getElementById('detail');
  var buyBtn = document.getElementById('buyBtn');
  var stockLine = document.getElementById('stockLine');

  function setMeta(selector, content) {
    var el = document.querySelector(selector);
    if (el) el.setAttribute('content', content || '');
  }

  function applyOG(item) {
    var firstImg = BnB.fullImageUrl(item.images && item.images.length ? item.images[0] : '');
    var title = item.name + ' — Bold & Beautiful';
    var desc =
      item.name + ' · ' + BnB.formatPrice(item.cost) +
      (item.description ? ' — ' + item.description : '') +
      ' · Order via WhatsApp.';
    var url = BnB.itemPageUrl(item.id);

    document.title = title;
    setMeta('meta[property="og:title"]', title);
    setMeta('meta[property="og:description"]', desc);
    setMeta('meta[property="og:image"]', firstImg);
    setMeta('meta[property="og:url"]', url);
    setMeta('meta[name="twitter:title"]', title);
    setMeta('meta[name="twitter:description"]', desc);
    setMeta('meta[name="twitter:image"]', firstImg);
    setMeta('meta[name="description"]', desc);
    var canon = document.querySelector('link[rel="canonical"]');
    if (canon) canon.setAttribute('href', url);
  }

  function swatchOptionsHtml(item) {
    return (item.colours || [])
      .map(function (c) {
        var unavailable = c.available === false;
        return (
          '<button type="button" class="swatch-option' + (unavailable ? ' unavailable' : '') +
          '" data-colour="' + BnB.esc(c.name) + '"' + (unavailable ? ' disabled' : '') + '>' +
          '<span class="swatch' + (unavailable ? ' na' : '') + '">' +
          '<i style="background:' + BnB.esc(c.hex || '#fff') + '"></i></span>' +
          BnB.esc(c.name) + (unavailable ? ' — unavailable' : '') +
          '</button>'
        );
      })
      .join('');
  }

  function render(item) {
    applyOG(item);

    var out = item.stock === false;
    notFound.style.display = 'none';
    detail.style.display = 'grid';
    if (out) detail.classList.add('is-out');

    document.getElementById('crumb').textContent =
      (item.category || '') + ' · ' + (item.subcategory || '');
    document.getElementById('name').textContent = item.name;
    document.getElementById('price').textContent = BnB.formatPrice(item.cost);
    document.getElementById('desc').textContent = item.description || '';

    // gallery
    var mainShot = document.getElementById('mainShot');
    var thumbs = document.getElementById('thumbs');
    var imgs = item.images && item.images.length ? item.images : [];
    mainShot.src = imgs.length ? BnB.fullImageUrl(imgs[0]) : '';
    mainShot.alt = item.name;
    thumbs.innerHTML = '';
    if (imgs.length > 1) {
      imgs.forEach(function (name, i) {
        var b = document.createElement('button');
        b.type = 'button';
        b.className = i === 0 ? 'on' : '';
        b.title = 'View photo ' + (i + 1);
        var img = document.createElement('img');
        img.src = BnB.fullImageUrl(name);
        img.alt = item.name + ' — photo ' + (i + 1);
        b.appendChild(img);
        b.addEventListener('click', function () {
          mainShot.src = BnB.fullImageUrl(name);
          thumbs.querySelectorAll('button').forEach(function (x) { x.classList.remove('on'); });
          b.classList.add('on');
        });
        thumbs.appendChild(b);
      });
    }

    // colours
    var colourBox = document.getElementById('colourOptions');
    colourBox.innerHTML = swatchOptionsHtml(item);
    colourBox.querySelectorAll('.swatch-option:not([disabled])').forEach(function (btn) {
      btn.addEventListener('click', function () {
        colourBox.querySelectorAll('.swatch-option').forEach(function (x) { x.classList.remove('selected'); });
        btn.classList.add('selected');
        selectedColour = btn.dataset.colour;
        updateBuy(item);
      });
    });

    // stock
    stockLine.textContent = out ? 'Out of stock' : 'In stock';
    stockLine.className = 'stock-line ' + (out ? 'out' : 'in');

    updateBuy(item);
  }

  function updateBuy(item) {
    var out = item.stock === false;
    if (out) {
      buyBtn.disabled = true;
      buyBtn.textContent = 'Out of Stock';
      return;
    }
    buyBtn.disabled = false;
    buyBtn.textContent = 'Order via WhatsApp';
    buyBtn.href = BnB.buildWhatsAppLink(item, selectedColour);
    if (selectedColour) buyBtn.textContent = 'Order via WhatsApp — ' + selectedColour;
  }

  function showNotFound() {
    document.title = 'Item not found — Bold & Beautiful';
    detail.style.display = 'none';
    notFound.style.display = 'block';
  }

  // share button (navigator.share with copy fallback)
  var shareBtn = document.getElementById('shareBtn');
  shareBtn.addEventListener('click', function () {
    var item = window.__bnbItem;
    if (!item) return;
    var url = BnB.itemPageUrl(item.id);
    var text = item.name + ' — ' + BnB.formatPrice(item.cost);
    if (navigator.share) {
      navigator.share({ title: item.name, text: text, url: url }).catch(function () {});
    } else {
      navigator.clipboard.writeText(url).then(function () {
        var old = shareBtn.textContent;
        shareBtn.textContent = 'Link copied';
        setTimeout(function () { shareBtn.textContent = old; }, 1600);
      });
    }
  });

  BnB.getCatalog().then(function (catalog) {
    window.__bnbCatalog = catalog;
    var item = BnB.findItem(itemId);
    if (item) {
      window.__bnbItem = item;
      render(item);
    } else {
      showNotFound();
    }
  });
})();
