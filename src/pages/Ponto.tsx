import { useEffect, useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { EmptyState } from '../components/ui/EmptyState';
import toast from 'react-hot-toast';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { usePontoStore } from '../store/pontoStore';

const espelho = [
  { data: '04/11/2024', entrada: '09:00', saida: '18:15', intervalo: '01:00', total: '08:15', banco: '+0:15' },
  { data: '01/11/2024', entrada: '08:45', saida: '18:00', intervalo: '01:00', total: '08:15', banco: '+0:15' },
  { data: '31/10/2024', entrada: '09:05', saida: '18:30', intervalo: '01:00', total: '08:25', banco: '+0:25' },
  { data: '30/10/2024', entrada: '09:00', saida: '17:45', intervalo: '01:00', total: '07:45', banco: '-0:15' },
  { data: '29/10/2024', entrada: '08:50', saida: '18:10', intervalo: '01:00', total: '08:20', banco: '+0:20' }
];

export function Ponto() {
  const [time, setTime] = useState<string>('');
  const [mes, setMes] = useState('Novembro 2024');
  const { statusHoje, bancoHoras, registrarPonto } = usePontoStore();

  useEffect(() => {
    const updateTime = () => {
      setTime(new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleRegistro = (tipo: 'entrada' | 'saida') => {
    registrarPonto(tipo);
    toast.success(`${tipo === 'entrada' ? 'Entrada' : 'Saída'} registrada com sucesso!`);
  };

  const isBancoPositivo = bancoHoras.startsWith('+');
  const bancoPercentual = 105;

  return (
    <div className="space-y-6">
      <Card className="p-8 bg-gradient-to-br from-gray-50 to-green-50">
        <div className="flex flex-col items-center gap-6">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">Horário Atual</p>
            <p className="text-6xl font-bold text-[#1F2937] font-mono">{time || '00:00:00'}</p>
          </div>

          <div className="flex items-center gap-2 px-4 py-2 bg-green-100 rounded-lg">
            <AlertCircle size={18} className="text-green-700" />
            <p className="text-sm text-green-700 font-medium">{statusHoje}</p>
          </div>

          <div className="flex gap-3 w-full max-w-xs">
            <Button
              variant="primary"
              fullWidth
              onClick={() => handleRegistro('entrada')}
            >
              Registrar Entrada
            </Button>
            <Button
              variant="outline"
              fullWidth
              onClick={() => handleRegistro('saida')}
              className="border-red-300 text-red-600 hover:bg-red-50"
            >
              Registrar Saída
            </Button>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Banco de Horas</h3>
        <div className="flex items-start gap-6 mb-6">
          <div>
            <p className="text-sm text-gray-600 mb-2">Saldo</p>
            <p className={`text-3xl font-bold ${isBancoPositivo ? 'text-green-600' : 'text-red-600'}`}>
              {bancoHoras}
            </p>
          </div>
          <div className="flex-1">
            <p className="text-sm text-gray-600 mb-2">Progresso</p>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-green-500 h-full"
                  style={{ width: `${Math.min(bancoPercentual, 100)}%` }}
                />
              </div>
              <span className="text-sm font-medium text-gray-600">{bancoPercentual}%</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="text-xs text-gray-600 mb-1">Horas Trabalhadas</p>
            <p className="text-2xl font-bold text-blue-600">168h</p>
          </div>
          <div className="p-4 bg-orange-50 rounded-lg">
            <p className="text-xs text-gray-600 mb-1">Horas Esperadas</p>
            <p className="text-2xl font-bold text-orange-600">160h</p>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Espelho de Ponto</h3>
          <select
            value={mes}
            onChange={(e) => setMes(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#10B981]"
          >
            <option>Novembro 2024</option>
            <option>Outubro 2024</option>
            <option>Setembro 2024</option>
          </select>
        </div>

        {espelho.length === 0 ? (
          <EmptyState title="Nenhum registro este mês" description="Ainda não há registros de ponto para este mês." cta={<button onClick={() => registrarPonto('entrada')} className="mt-2 px-4 py-2 bg-[#10B981] text-white rounded-lg">Registrar Ponto</button>} />
        ) : (
          <>
            {/* desktop/tablet */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="text-left p-3 font-semibold text-gray-700">Data</th>
                    <th className="text-left p-3 font-semibold text-gray-700">Entrada</th>
                    <th className="text-left p-3 font-semibold text-gray-700">Saída</th>
                    <th className="text-left p-3 font-semibold text-gray-700">Intervalo</th>
                    <th className="text-left p-3 font-semibold text-gray-700">Total</th>
                    <th className="text-left p-3 font-semibold text-gray-700">Banco</th>
                    <th className="text-left p-3 font-semibold text-gray-700">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {espelho.map((reg, idx) => (
                    <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="p-3 text-gray-700">{reg.data}</td>
                      <td className="p-3 text-gray-700">{reg.entrada}</td>
                      <td className="p-3 text-gray-700">{reg.saida}</td>
                      <td className="p-3 text-gray-700">{reg.intervalo}</td>
                      <td className="p-3 text-gray-700">{reg.total}</td>
                      <td className={`p-3 font-medium ${reg.banco.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                        {reg.banco}
                      </td>
                      <td className="p-3">
                        <button aria-label={`Solicitar ajuste de ${reg.data}`} className="text-[#10B981] hover:text-[#059669] text-xs font-medium">
                          Solicitar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* mobile: cards */}
            <div className="sm:hidden space-y-3">
              {espelho.map((reg, idx) => (
                <div key={idx} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-800">{reg.data}</p>
                      <p className="text-xs text-gray-500">Entrada: {reg.entrada} • Saída: {reg.saida}</p>
                    </div>
                    <div className={`text-sm font-medium ${reg.banco.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>{reg.banco}</div>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <div className="text-xs text-gray-600">Intervalo: {reg.intervalo}</div>
                    <button aria-label={`Solicitar ajuste de ${reg.data}`} className="text-[#10B981] hover:text-[#059669] text-xs font-medium">Solicitar</button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
