import { Card } from '../components/ui/Card';
import { PageHeader } from '../components/ui/PageHeader';

interface PlaceholderProps {
  title: string;
}

export function Placeholder({ title }: PlaceholderProps) {
  return (
    <div>
      <PageHeader title={title} />
      <Card className="p-12 text-center">
        <p className="text-gray-600">Esta página está em desenvolvimento</p>
      </Card>
    </div>
  );
}
