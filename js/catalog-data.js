/* catalog-data.js
 * MIRROR of data/catalog.json — used as a fallback so the site works when
 * opened directly from disk (file://), where fetch() is blocked.
 * The JSON in data/catalog.json is the source of truth; after editing it,
 * copy the new content here as well (or just serve the site over http).
 */
window.CATALOG_FALLBACK = {
  "site": {
    "name": "Bold & Beautiful",
    "tagline": "Where All The Pretty Girls Go",
    "whatsapp": "12647722392",
    "currency": "USD",
    "imageBase": "images/purses/",
    "shopUrl": "shop/index.html",
    "itemPageUrl": "shop/item.html"
  },
  "categories": [
    {
      "id": "clothes",
      "name": "Clothes",
      "subcategories": [
        { "id": "tops", "name": "Tops" },
        { "id": "pants", "name": "Pants" }
      ]
    },
    {
      "id": "shoes",
      "name": "Shoes",
      "subcategories": [
        { "id": "heels", "name": "Heels" },
        { "id": "casual", "name": "Casual" },
        { "id": "sneakers", "name": "Sneakers" },
        { "id": "business", "name": "Business" }
      ]
    },
    {
      "id": "accessories",
      "name": "Accessories",
      "subcategories": [
        { "id": "purses", "name": "Purses" },
        { "id": "glasses", "name": "Glasses" },
        { "id": "belts", "name": "Belts" },
        { "id": "scarves", "name": "Scarves" },
        { "id": "others", "name": "Others" }
      ]
    }
  ],
  "items": [
    {
      "id": "coach-circle-crossbody",
      "name": "Coach Circle Crossbody",
      "category": "Accessories",
      "subcategory": "Purses",
      "cost": 135,
      "stock": true,
      "colours": [
        { "name": "Cream", "hex": "#EFE4D2", "available": true }
      ],
      "images": ["coach.jpg"],
      "description": "A circular cream crossbody with a gold-tone chain and adjustable leather strap. Pearlescent finish, gold hardware, compact and evening-ready."
    },
    {
      "id": "teridiva-prism-tote",
      "name": "Teridiva Prism Tote",
      "category": "Accessories",
      "subcategory": "Purses",
      "cost": 98,
      "stock": true,
      "colours": [
        { "name": "Silver", "hex": "#C6CCD2", "available": true },
        { "name": "Gold", "hex": "#D6B36A", "available": false }
      ],
      "images": ["teridiva.jpg"],
      "description": "A geometric tote built from tessellated triangle panels that catch the light. Twin carry handles and a structured, architectural silhouette."
    },
    {
      "id": "striped-woven-tote",
      "name": "Striped Woven Tote",
      "category": "Accessories",
      "subcategory": "Purses",
      "cost": 75,
      "stock": true,
      "colours": [
        { "name": "Multi", "hex": "#8A5A44", "available": true },
        { "name": "Black", "hex": "#1B1B1B", "available": true }
      ],
      "images": ["weave.jpg"],
      "description": "An everyday woven tote in a vertical stripe palette of black, white, red and blue, finished with solid black trim and double handles."
    },
    {
      "id": "gucci-web-belt-bag",
      "name": "Gucci Web Belt Bag",
      "category": "Accessories",
      "subcategory": "Purses",
      "cost": 890,
      "stock": true,
      "colours": [
        { "name": "White", "hex": "#F5F5F2", "available": true }
      ],
      "images": ["gucci.jpg"],
      "description": "A white belt bag with the signature green-red-green web stripe, interlocking GG hardware and a navy and red striped strap."
    }
  ]
};
