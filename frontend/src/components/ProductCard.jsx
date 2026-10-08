import { Link } from "react-router-dom";

function formatPrice(price) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price);
}

export default function ProductCard({ product, inWishlist, onToggle, onAddToCart, addingToCart }) {
  const showWishlist = typeof onToggle === "function";
  const showAddToCart = typeof onAddToCart === "function";

  return (
    <article className="product-card">
      <img className="product-image" src={product.image} alt={product.name} />
      <div className="product-card-content">
        <h2>{product.name}</h2>
        <p className="product-category">{product.category}</p>
        <p className="product-price">{formatPrice(product.price)}</p>
        <p className={product.stock > 0 ? "stock-available" : "stock-empty"}>
          {product.stock > 0 ? `${product.stock} units left` : "Out of stock"}
        </p>
        {showWishlist && (
          <button
            type="button"
            className={`button wishlist-toggle ${inWishlist ? "wishlist-toggle-active" : ""}`}
            onClick={() => onToggle(product._id, inWishlist ? "remove" : "add")}
            aria-pressed={Boolean(inWishlist)}
          >
            {inWishlist ? "♥ Remove from Wishlist" : "♡ Add to Wishlist"}
          </button>
        )}
        {showAddToCart && (
          <button
            type="button"
            className="button add-to-cart"
            onClick={() => onAddToCart(product._id)}
            disabled={Boolean(addingToCart)}
          >
            {addingToCart ? "Adding..." : "Add to Cart"}
          </button>
        )}
        <Link className="button product-button" to={`/products/${product._id}`}>View Details</Link>
      </div>
    </article>
  );
}
