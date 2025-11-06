import { Clock, FileText, Calendar } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { usePontoStore } from '../store/pontoStore';
import { useMuralStore } from '../store/muralStore';
import { Avatar } from '../components/Avatar';

export function Dashboard() {
  const { registros } = usePontoStore();
  const { posts } = useMuralStore();

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm text-gray-600 mb-1">Banco de Horas</p>
              <h3 className="text-2xl font-bold text-gray-800">+12:30h</h3>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <Clock className="text-[#10B981]" size={24} />
            </div>
          </div>
          <p className="text-xs text-gray-500">Acumulado no mês</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm text-gray-600 mb-1">Solicitações</p>
              <h3 className="text-2xl font-bold text-gray-800">8</h3>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <FileText className="text-blue-600" size={24} />
            </div>
          </div>
          <p className="text-xs text-gray-500">5 pendentes, 3 aprovadas</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm text-gray-600 mb-1">Reuniões Hoje</p>
              <h3 className="text-2xl font-bold text-gray-800">4</h3>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Calendar className="text-purple-600" size={24} />
            </div>
          </div>
          <p className="text-xs text-gray-500">Próxima às 14:00</p>
        </Card>
      </div>

      <Card className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Últimos Registros</h3>
            <div className="space-y-3">
              {registros.slice(0, 5).map((reg, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{reg.data}</p>
                    <p className="text-xs text-gray-500">Entrada: {reg.entrada} • Saída: {reg.saida}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 rounded-full bg-green-50 text-green-600 text-xs font-medium">Entrada: {reg.entrada}</span>
                    <span className="px-3 py-1 rounded-full bg-red-50 text-red-600 text-xs font-medium">Saída: {reg.saida}</span>
                  </div>
                </div>
              ))}
              <div className="text-center mt-2">
                <a className="text-[#10B981] text-sm font-medium" href="/ponto">Ver todos os registros</a>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Mural Recente</h3>
            <div className="space-y-3">
              {posts.slice(0,3).map((post) => (
                <div key={post.id} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Avatar src={post.avatar} alt={post.author} size="sm" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold text-gray-800">{post.author}</p>
                          <p className="text-xs text-gray-500">{new Date(post.createdAt).toLocaleDateString('pt-BR')}</p>
                        </div>
                      </div>
                      <p className="mt-2 text-sm text-gray-700 line-clamp-3">{post.content}</p>
                    </div>
                  </div>
                </div>
              ))}
              <div className="text-center mt-2">
                <a className="text-[#10B981] text-sm font-medium" href="/mural">Ver todos os posts</a>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
