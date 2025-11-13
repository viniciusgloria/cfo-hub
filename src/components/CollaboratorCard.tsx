import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { User } from 'lucide-react';
import { Avatar } from './Avatar';

interface Props {
  nome: string;
  cargo: string;
  departamento: string;
  avatar?: string;
  onOpen: () => void;
}

export function CollaboratorCard({ nome, cargo, departamento, avatar, onOpen }: Props) {
  return (
    <Card className="p-4">
      <div className="flex flex-col items-center text-center gap-3">
        {avatar ? (
          <Avatar src={avatar} alt={nome} size="xl" />
        ) : (
          <Avatar size="xl">
            <User />
          </Avatar>
        )}
        <div>
          <p className="font-semibold text-gray-800">{nome}</p>
          <p className="text-sm text-gray-500">{cargo}</p>
          <p className="text-xs text-gray-400">{departamento}</p>
        </div>
        <Button variant="outline" onClick={onOpen}>Ver perfil</Button>
      </div>
    </Card>
  );
}
