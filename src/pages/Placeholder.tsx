import { Card } from '../components/ui/Card';

interface PlaceholderProps {
  title: string;
}

export function Placeholder({ title }: PlaceholderProps) {
  return (
    <Card className="p-12 text-center">
      <h2 className="text-2xl font-semibold text-gray-800 mb-2">{title}</h2>
      <p className="text-gray-600">Esta página está em desenvolvimento</p>
    </Card>
  );
}
