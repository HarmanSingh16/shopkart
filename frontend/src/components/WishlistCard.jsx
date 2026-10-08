import { Link } from "react-router-dom";

function formatPrice(price) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price);
}

export default function WishlistCard({ product, onRemove, removing }) {
  return (
    <article className="product-card wishlist-card">
      <img className="product-image" src={product.image} alt={product.name} />
      <div className="product-card-content">
        <h2>{product.name}</h2>
        <p className="product-category">{product.category}</p>
        <p className="product-price">{formatPrice(product.price)}</p>
        <p className={product.stock > 0 ? "stock-available" : "stock-empty"}>
          {product.stock > 0 ? `${product.stock} units left` : "Out of stock"}
        </p>
        <Link className="button product-button" to={`/products/${product._id}`}>
          View Details
        </Link>
        <button
          type="button"
          className="button button-secondary wishlist-remove"
          onClick={() => onRemove(product._id)}
          disabled={removing}
        >
          {removing ? "Removing..." : "Remove"}
        </button>
      </div>
    </article>
  );
}
