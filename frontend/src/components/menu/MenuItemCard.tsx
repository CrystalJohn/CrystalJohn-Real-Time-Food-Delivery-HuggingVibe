import type { MenuItem } from "@/types/menu";

interface MenuItemCardProps {
  item: MenuItem;
  onAdd?: (item: MenuItem) => void;
}

export function MenuItemCard({ item, onAdd }: MenuItemCardProps) {
  return (
    <article>
      <h3>{item.name}</h3>
      {item.description && <p>{item.description}</p>}
      <p>{item.price}</p>
      {onAdd && (
        <button type="button" onClick={() => onAdd(item)}>
          Add to cart
        </button>
      )}
    </article>
  );
}
