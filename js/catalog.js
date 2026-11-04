/* catalog.js — shared catalog helpers for Bold & Beautiful
 * Loads data/catalog.json over http(s); falls back to the embedded mirror
 * (js/catalog-data.js) when opened from disk.
 */
(function () {
  'use strict';

  // Root of the site, derived from this script's own URL (works on file:// too).
  var scriptSrc = (document.currentScript && document.currentScript.src) || '';
  var SITE_ROOT = scriptSrc
    ? new URL('../', scriptSrc).href
    : new URL('../', window.location.href).href;

  // Catalog endpoint, resolved from the site root (not the current page) so
  // subfolder hosting like GitHub Pages /bb/ still finds the JSON.
  var CATALOG_JSON_URL = new URL('data/catalog.json', SITE_ROOT).href;

  // Base used for shareable links (WhatsApp messages, og:url). Derived from the
  // site's own location so subfolder hosting (e.g. GitHub Pages /bb/) works.
  // Falls back to the live domain only when previewed from disk.
  var SHARE_BASE =
    window.location.protocol === 'http:' || window.location.protocol === 'https:'
      ? SITE_ROOT
      : 'https://bold-n-beautiful.com/';

  var catalogPromise = null;

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function getCatalog() {
    if (!catalogPromise) {
      catalogPromise = fetch(CATALOG_JSON_URL, { cache: 'no-store' })
        .then(function (res) {
          if (!res.ok) throw new Error('catalog http ' + res.status);
          return res.json();
        })
        .catch(function () {
          return (
            (window.CATALOG_FALLBACK && window.CATALOG_FALLBACK) || {
              site: {},
              categories: [],
              items: []
            }
          );
        });
    }
    return catalogPromise;
  }

  function fullImageUrl(name) {
    if (/^https?:\/\//i.test(name)) return name;
    var catalog = window.__bnbCatalog || { site: {} };
    var base = catalog.site && catalog.site.imageBase ? catalog.site.imageBase : 'images/purses/';
    return new URL(base + name, SITE_ROOT).href;
  }

  function itemPageUrl(id) {
    var catalog = window.__bnbCatalog || { site: {} };
    var page = catalog.site && catalog.site.itemPageUrl ? catalog.site.itemPageUrl : 'shop/item.html';
    return SHARE_BASE + page + '?item=' + encodeURIComponent(id);
  }

  function shopPageUrl() {
    return SHARE_BASE + 'shop/index.html';
  }

  function formatPrice(cost) {
    var catalog = window.__bnbCatalog || { site: {} };
    var currency = catalog.site && catalog.site.currency ? catalog.site.currency : 'USD';
    var symbol = currency === 'XCD' ? 'EC$' : '$';
    var num = Number(cost);
    var amount =
      Number.isInteger(num) ? num.toFixed(0) : num.toFixed(2).replace(/\.?0+$/, '');
    return symbol + amount;
  }

  function whatsappNumber() {
    var catalog = window.__bnbCatalog || { site: {} };
    var raw = (catalog.site && catalog.site.whatsapp) || '12647722392';
    return String(raw).replace(/\D+/g, '');
  }

  // Pre-filled WhatsApp order message. Includes the item's shareable URL so the
  // seller can open the item page with its OG metadata.
  function buildWhatsAppLink(item, colourName) {
    var lines = [
      'Hello Bold & Beautiful,',
      'I would like to order:',
      item.name + ' - ' + formatPrice(item.cost)
    ];
    if (colourName) lines.push('Colour: ' + colourName);
    lines.push('Item link: ' + itemPageUrl(item.id));
    return (
      'https://wa.me/' + whatsappNumber() + '?text=' + encodeURIComponent(lines.join('\n'))
    );
  }

  function findItem(id) {
    var catalog = window.__bnbCatalog || { items: [] };
    var items = catalog.items || [];
    for (var i = 0; i < items.length; i++) {
      if (items[i].id === id) return items[i];
    }
    return null;
  }

  // Relative on-page link to an item page (works from any page, http or file://).
  function itemPageHref(id) {
    var catalog = window.__bnbCatalog || { site: {} };
    var page = catalog.site && catalog.site.itemPageUrl ? catalog.site.itemPageUrl : 'shop/item.html';
    var query = '?item=' + encodeURIComponent(id);
    var hereDir = window.location.href.replace(/[?#].*$/, '').replace(/[^/]*$/, '');
    var targetDir = new URL(page, SITE_ROOT).href.replace(/[?#].*$/, '').replace(/[^/]*$/, '');
    var a = hereDir.split('/');
    var b = targetDir.split('/');
    var i = 0;
    while (i < a.length - 1 && i < b.length - 1 && a[i] === b[i]) i++;
    var ups = a.length - 1 - i;
    var parts = [];
    while (ups-- > 0) parts.push('..');
    parts = parts.concat(b.slice(i, -1).filter(Boolean));
    return (parts.length ? parts.join('/') + '/' : '') + page + query;
  }

  window.BnB = {
    SITE_ROOT: SITE_ROOT,
    SHARE_BASE: SHARE_BASE,
    esc: esc,
    getCatalog: getCatalog,
    fullImageUrl: fullImageUrl,
    itemPageUrl: itemPageUrl,
    itemPageHref: itemPageHref,
    shopPageUrl: shopPageUrl,
    formatPrice: formatPrice,
    buildWhatsAppLink: buildWhatsAppLink,
    findItem: findItem
  };
})();
