import Link from "next/link";

import ProductsFeatured from "@/components/products-featured";
import Subscribe from "@/components/subscribe";
import { products as catalogProducts } from "@/utils/data/products";

import Layout from "../layouts/Main";

type ProductCard = {
  id: string;
  name: string;
  image: string;
  description: string;
  category: string;
  price: number;
  rating: number;
};

const heroProduct = {
  id: "8",
  name: "Weekend Bomber Jacket",
  image: "/images/products/catalog-08.jpg",
  description: "Relaxed everyday cotton with a clean finish",
  category: "Men",
  price: 178,
  rating: 4.8,
};

const categoryTiles = [
  {
    title: "Women",
    subtitle: "Light layers & polished essentials",
    image: "/images/products/catalog-04.jpg",
    href: "/product/4",
    accent: "#f9e8d3",
  },
  {
    title: "Men",
    subtitle: "Smart staples in relaxed silhouettes",
    image: "/images/products/catalog-01.jpg",
    href: "/product/1",
    accent: "#dbeaf7",
  },
  {
    title: "Accessories",
    subtitle: "The finishing touches that elevate every look",
    image: "/images/products/catalog-19.jpg",
    href: "/product/19",
    accent: "#efe7ea",
  },
] as const;

const localFeaturedProducts: ProductCard[] = catalogProducts.slice(0, 6).map((item) => ({
  id: item.id,
  name: item.name,
  image: item.images[0] ?? "",
  description: item.category,
  category: item.category,
  price: item.currentPrice,
  rating: item.punctuation?.punctuation ?? 4.7,
}));

const formatPrice = (value: number) => `$${value.toFixed(2)}`;

const IndexPage = () => {
  const curatedProducts = localFeaturedProducts.slice(0, 9);

  return (
    <Layout title="ModaLane | Modern essentials for every day">
      <section className="hero-shell">
        <div className="container hero-layout">
          <div className="hero-copy">
            <span className="eyebrow">New season essentials</span>
            <h1>Upgrade your everyday style.</h1>
            <p>
              Discover premium essentials, elevated basics, and statement pieces designed for real life.
            </p>

            <div className="hero-actions">
              <Link href="/products" className="btn btn--rounded btn--yellow">
                Shop now
              </Link>
              <a href="#featured" className="btn btn--rounded btn--border">
                View trends
              </a>
            </div>

            <div className="hero-stats">
              <div>
                <strong>12k+</strong>
                <span>happy shoppers</span>
              </div>
              <div>
                <strong>4.9/5</strong>
                <span>average rating</span>
              </div>
              <div>
                <strong>48h</strong>
                <span>dispatch time</span>
              </div>
            </div>
          </div>

          <div className="hero-visual">
            <Link href={`/product/${heroProduct.id}`} className="showcase-card showcase-card--dark" style={{ backgroundImage: `linear-gradient(180deg, rgba(13, 13, 13, 0.1), rgba(13, 13, 13, 0.6)), url(${heroProduct.image})` }}>
              <span>Trending now</span>
              <div className="showcase-card__price">${heroProduct.price}</div>
              <h3>{heroProduct.name}</h3>
            </Link>

            <div className="showcase-stack">
              <div className="showcase-tile">
                <span>Best sellers</span>
                <strong>320+</strong>
              </div>
              <div className="showcase-tile showcase-tile--warm">
                <span>New drop</span>
                <strong>Spring</strong>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="home-section">
        <div className="container">
          <div className="section-header">
            <div>
              <p className="section-kicker">Curated selections</p>
              <h2>Shop by mood</h2>
            </div>
            <Link href="/products">View all</Link>
          </div>

          <div className="category-grid">
            {categoryTiles.map((tile) => (
              <Link href={tile.href} key={tile.title} className="category-tile" style={{ backgroundImage: `linear-gradient(180deg, rgba(17,17,17,0.12), rgba(17,17,17,0.32)), url(${tile.image})`, backgroundColor: tile.accent }}>
                <div className="category-tile__content">
                  <span>{tile.title}</span>
                  <p>{tile.subtitle}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="home-section home-section--soft" id="featured">
        <div className="container">
          <div className="section-header">
            <div>
              <p className="section-kicker">Popular picks</p>
              <h2>Curated for you</h2>
            </div>
            <Link href="/products">Add more</Link>
          </div>

          <div className="product-grid">
            {curatedProducts.map((product) => (
              <Link href={`/product/${product.id}`} key={product.id} className="product-card">
                <div className="product-card__media">
                  <img src={product.image} alt={product.name} />
                  {product.category && <span className="product-card__tag">{product.category}</span>}
                </div>
                <div className="product-card__body">
                  <div className="product-card__meta">
                    <span>{product.category}</span>
                    <span>★ {product.rating.toFixed(1)}</span>
                  </div>
                  <h3>{product.name}</h3>
                  <p>{product.description}</p>
                  <div className="product-card__price-row">
                    <strong>{formatPrice(product.price)}</strong>
                    <span>Free shipping</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="home-section">
        <div className="container features-grid">
          {[
            { title: "Free shipping", desc: "On orders above $199" },
            { title: "Easy checkout", desc: "Secure and instant payments" },
            { title: "Curated picks", desc: "Trending premium essentials" },
            { title: "User support", desc: "Fast help whenever you need it" },
          ].map((feature) => (
            <div key={feature.title} className="feature-box">
              <div className="feature-box__title">{feature.title}</div>
              <p>{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <ProductsFeatured />
      <Subscribe />
    </Layout>
  );
};

export default IndexPage;
