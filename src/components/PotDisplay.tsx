/**
 * Displays the current pot amount in the center of the table.
 */

interface PotDisplayProps {
  amount: number;
}

export function PotDisplay({ amount }: PotDisplayProps) {
  return (
    <div className="flex flex-col items-center justify-center">
      <div className="bg-yellow-600 text-white px-6 py-3 rounded-full shadow-lg border-2 border-yellow-700">
        <div className="text-xs font-semibold text-yellow-100 mb-1">POT</div>
        <div className="text-2xl font-bold">${amount}</div>
      </div>
    </div>
  );
}
