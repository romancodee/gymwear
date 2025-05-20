// scripts/scrapeGymshark.ts
import puppeteer from 'puppeteer';
import fs from 'fs/promises';

interface Product {
  name: string | undefined;
  slug: string | undefined;
  price: number;
  image: string | undefined;
  link: string | undefined;
  description: string;
  category: string;
  sizes: string[];
  countInStock: number;
}

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  await page.goto('https://www.gymshark.com/pages/shop-men', {
    waitUntil: 'networkidle2',
  });

  await page.waitForSelector('[data-product-card]');

  const products: Product[] = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('[data-product-card]'))
      .slice(0, 20)
      .map((el, i) => {
        const name = el.querySelector('[data-product-title]')?.textContent?.trim();
        const priceText = el.querySelector('[data-product-price]')?.textContent?.trim() || '';
        const price = parseFloat(priceText.replace(/[^0-9.]/g, '') || '0');
        const image = el.querySelector('img')?.src;
        const link = el.querySelector('a')?.href;

        return {
          name,
          slug: name?.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '') + '-' + i,
          price,
          image,
          link,
          description: "High-performance gym wear for training and style.",
          category: "T-Shirts",
          sizes: ["S", "M", "L", "XL"],
          countInStock: Math.floor(Math.random() * 20) + 5,
        };
      });
  });

  await fs.writeFile('gymshark-dummy-products.json', JSON.stringify(products, null, 2));
  console.log('✅ Saved scraped data to gymshark-dummy-products.json');

  await browser.close();
})();
