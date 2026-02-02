interface CartSummaryProps {
  itemCount: number;
  total: number;
}

export function CartSummary({ itemCount, total }: CartSummaryProps) {
  return (
    <div>
      <p>Items: {itemCount}</p>
      <p>Total: {total}</p>
    </div>
  );
}
