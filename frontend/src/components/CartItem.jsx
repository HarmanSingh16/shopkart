import { Link } from "react-router-dom";

function formatPrice(price) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price);
}

export default function CartItem({ item, onIncrement, onDecrement, onRemove, busy }) {
  const { product, quantity } = item;
  const stock = product?.stock ?? 0;
  const canIncrement = quantity < stock;
  const canDecrement = quantity > 1;
  const lineTotal = (product?.price ?? 0) * quantity;

  return (
    <article className="product-card cart-item">
      <img className="product-image" src={product?.image} alt={product?.name} />
      <div className="product-card-content">
        <h2>{product?.name}</h2>
        <p className="product-price">{formatPrice(product?.price ?? 0)} each</p>
        <p className={stock > 0 ? "stock-available" : "stock-empty"}>
          {stock > 0 ? `${stock} units in stock` : "Out of stock"}
        </p>
        <div className="cart-item-row" aria-label="Quantity controls">
          <button
            type="button"
            className="button button-secondary cart-qty-button"
            onClick={() => onDecrement(product._id, quantity - 1)}
            disabled={!canDecrement || busy}
            aria-label="Decrease quantity"
          >
            {busy ? "Updating..." : "−"}
          </button>
          <span className="cart-qty-value" aria-live="polite">{quantity}</span>
          <button
            type="button"
            className="button button-secondary cart-qty-button"
            onClick={() => onIncrement(product._id, quantity + 1)}
            disabled={!canIncrement || busy}
            aria-label="Increase quantity"
          >
            {busy ? "Updating..." : "+"}
          </button>
        </div>
        <p className="cart-line-total">Line total: {formatPrice(lineTotal)}</p>
        <Link className="button product-button" to={`/products/${product?._id}`}>
          View Details
        </Link>
        <button
          type="button"
          className="button button-secondary cart-remove"
          onClick={() => onRemove(product._id)}
          disabled={busy}
        >
          {busy ? "Removing..." : "Remove"}
        </button>
      </div>
    </article>
  );
}