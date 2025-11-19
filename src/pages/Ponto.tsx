import { useEffect, useState } from 'react';
import { usePageTitle } from '../hooks/usePageTitle';
import { AlertCircle, Download, BarChart3, TrendingUp, ChevronLeft, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { EmptyState } from '../components/ui/EmptyState';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { SolicitacaoPontoModal } from '../components/SolicitacaoPontoModal';
import { AtestadoModal } from '../components/AtestadoModal';
import { EscolhaTipoSolicitacaoModal } from '../components/EscolhaTipoSolicitacaoModal';
import { usePontoStore } from '../store/pontoStore';
import { useAuthStore } from '../store/authStore';
import { useColaboradoresStore } from '../store/colaboradoresStore';
import { useReservasStore } from '../store/reservasStore';
import { useMuralStore } from '../store/muralStore';
import { parseTimeToMinutes } from '../utils/time';

type ViewMode = 'mensal' | 'semanal';

export function Ponto() {
  usePageTitle('Controle de Ponto Eletrônico');
  const [time, setTime] = useState<string>('');
  const [mes, setMes] = useState('Novembro 2024');
  const [viewMode, setViewMode] = useState<ViewMode>('mensal');
  const [semanaOffset, setSemanaOffset] = useState(0); // 0 = semana atual, -1 = semana passada, etc
  const [modalAberto, setModalAberto] = useState(false);
  const [atestadoAberto, setAtestadoAberto] = useState(false);
  const [escolhaAberta, setEscolhaAberta] = useState(false);
  const [dataSelecionada, setDataSelecionada] = useState('');
  const [proxEventos, setProxEventos] = useState<Array<{ date: string; name: string; tipo?: string; dateObj?: Date }>>([]);
  
  const { statusHoje, bancoHoras, registrarPonto, registros } = usePontoStore();
  const { user } = useAuthStore();
  const { colaboradores } = useColaboradoresStore();
  
  // Busca a meta de horas do colaborador logado (default 176h)
  const colaboradorLogado = colaboradores.find((c) => c.email === user?.email);
  const metaHorasMensais = colaboradorLogado?.metaHorasMensais || 176;

  const { reservas } = useReservasStore();
  const { posts } = useMuralStore();

  useEffect(() => {
    const parseBRDate = (s: string) => {
      if (!s) return null;
      // ISO YYYY-MM-DD
      if (/^\d{4}-\d{2}-\d{2}/.test(s)) return new Date(s + 'T00:00:00');
      // BR format DD/MM/YYYY or DD/MM/YYYY HH:MM
      const parts = s.split(' ')[0].split('/');
      if (parts.length === 3) {
        const [dd, mm, yyyy] = parts;
        return new Date(Number(yyyy), Number(mm) - 1, Number(dd));
      }
      const d = new Date(s);
      return isNaN(d.getTime()) ? null : d;
    };

    const load = async () => {
      try {
        const hoje = new Date();
        const anoAtual = hoje.getFullYear();
        const mesAtual = hoje.getMonth();

        // Fetch feriados (ano atual e próximo para garantir cobertura)
        let feriadosRaw: Array<{ date: string; name: string }> = [];
        for (const ano of [anoAtual, anoAtual + 1]) {
          try {
            const res = await fetch(`https://brasilapi.com.br/api/feriados/v1/${ano}`);
            if (!res.ok) continue;
            const json = await res.json();
            feriadosRaw = feriadosRaw.concat(json.map((h: any) => ({ date: h.date, name: h.name })));
          } catch (err) {
            // continue on individual year error
            console.error('Erro carregando feriados ano', ano, err);
          }
        }

        // Mapar reservas do sistema (construir Date no fuso local a partir de YYYY-MM-DD)
        const reservasEventos = (reservas || [])
          .filter((r: any) => r.status === 'ativa')
          .map((r: any) => {
            const parts = String(r.data || '').split('-');
            let dateObj: Date | null = null;
            if (parts.length === 3) {
              const [y, m, d] = parts;
              dateObj = new Date(Number(y), Number(m) - 1, Number(d));
            } else {
              dateObj = new Date(r.data + 'T00:00:00');
            }
            return {
              dateISO: r.data,
              dateObj,
              name: r.motivo || (r.tipoSala === 'call' ? 'Reserva Sala (Call)' : 'Reserva Sala'),
              tipo: 'reserva' as const,
            };
          });

        // Mapar posts de comemoração (quando houver)
        const comemoracoes = (posts || [])
          .filter((p: any) => p.type === 'comemoracao')
          .map((p: any) => {
            const d = parseBRDate(p.createdAt || p.createdAtString || '');
            if (!d) return null;
            return {
              dateISO: d.toISOString().slice(0, 10),
              dateObj: d,
              name: p.content ? (typeof p.content === 'string' ? p.content : String(p.content)) : p.author || 'Comemoração',
              tipo: 'comemoracao' as const,
            };
          })
          .filter(Boolean) as Array<any>;

        const feriados = feriadosRaw.map((f) => {
          // f.date is expected as YYYY-MM-DD — construir Date no fuso local para evitar off-by-one
          const parts = String(f.date || '').split('-');
          let dateObj: Date;
          if (parts.length === 3) {
            const [y, m, d] = parts;
            dateObj = new Date(Number(y), Number(m) - 1, Number(d));
          } else {
            dateObj = new Date(f.date + 'T00:00:00');
          }
          return {
            dateISO: f.date,
            dateObj,
            name: f.name,
            tipo: 'feriado' as const,
          };
        });

        // Combinar todas as fontes
        const todas = [...feriados, ...reservasEventos, ...comemoracoes]
          .filter((e) => e.dateObj && e.dateObj >= new Date(new Date().setHours(0, 0, 0, 0)))
          .sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime());

        // Selecionar eventos do mês atual (a partir de hoje)
        const desteMes = todas.filter(
          (e) => e.dateObj.getMonth() === mesAtual && e.dateObj.getFullYear() === anoAtual
        );

        let selecionados: Array<any> = [];
        selecionados = desteMes.slice(0, 3);

        // Se menos de 3, preencher com eventos do mês seguinte
        if (selecionados.length < 3) {
          const proximoMesNum = (mesAtual + 1) % 12;
          const proximoAno = mesAtual === 11 ? anoAtual + 1 : anoAtual;
          const doProximoMes = todas.filter(
            (e) => e.dateObj.getMonth() === proximoMesNum && e.dateObj.getFullYear() === proximoAno
          );
          selecionados = [...selecionados, ...doProximoMes.slice(0, 3 - selecionados.length)];
        }

        // Se ainda faltarem, preencher com próximos eventos disponíveis
        if (selecionados.length < 3) {
          const restantes = todas.filter((e) => !selecionados.includes(e)).slice(0, 3 - selecionados.length);
          selecionados = [...selecionados, ...restantes];
        }

        setProxEventos(
          selecionados.map((e) => ({ date: e.dateISO, name: e.name, tipo: e.tipo, dateObj: e.dateObj }))
        );
      } catch (err) {
        console.error('Erro ao montar próximos eventos:', err);
      }
    };

    load();
  }, [reservas, posts]);
  useEffect(() => {
    const updateTime = () => {
      setTime(
        new Date().toLocaleTimeString('pt-BR', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleRegistro = async (tipo: 'entrada' | 'saida') => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const lat = pos.coords.latitude;
          const lon = pos.coords.longitude;
          const accuracy = pos.coords.accuracy;

          // Log temporário para debug (remover após validação)
          toast(`📍 Coords: ${lat.toFixed(6)}, ${lon.toFixed(6)} (±${accuracy.toFixed(0)}m)`, { duration: 3000 });

          try {
            // Geocoding reverso usando Nominatim (OpenStreetMap)
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&addressdetails=1&zoom=18`,
              { 
                headers: { 
                  'Accept-Language': 'pt-BR,pt;q=0.9',
                  'User-Agent': 'CFO-Hub/1.0 (https://github.com/viniciusgloria/cfo-hub)',
                  'Referer': window.location.origin,
                } 
              }
            );
            
            if (!response.ok) {
              throw new Error(`Nominatim HTTP ${response.status}`);
            }

            const data = await response.json();
            const address = data.address || {};
            
            const localizacao = {
              bairro: address.suburb || address.neighbourhood || address.quarter || address.hamlet || 'N/A',
              cidade: address.city || address.town || address.village || address.municipality || address.county || 'N/A',
              estado: address.state || address.region || 'N/A',
              lat,
              lon,
              accuracy,
            };
            
            registrarPonto(tipo, localizacao);
            toast.success(
              `${tipo === 'entrada' ? 'Entrada' : 'Saída'} registrada em ${localizacao.cidade}!`
            );
          } catch (error) {
            // Fallback: salvar apenas coordenadas quando API falha
            const localizacaoFallback = { 
              bairro: `Lat: ${lat.toFixed(6)}`, 
              cidade: `Lon: ${lon.toFixed(6)}`, 
              estado: '(GPS)', 
              lat, 
              lon, 
              accuracy 
            };
            registrarPonto(tipo, localizacaoFallback);
            toast.error(`Endereço não disponível. Coordenadas salvas: ${lat.toFixed(4)}, ${lon.toFixed(4)}`);
          }
        },
        (err) => {
          const erroLocalizacao = { bairro: 'Erro de Permissão', cidade: err.message || 'Negado', estado: '' };
          registrarPonto(tipo, erroLocalizacao);
          toast.error(`Erro ao acessar localização: ${err.message}`);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      const erroLocalizacao = { bairro: 'Navegador', cidade: 'Sem GPS', estado: '' };
      registrarPonto(tipo, erroLocalizacao);
      toast.error('Geolocalização não disponível neste navegador.');
    }
  };

  const exportCSV = () => {
    if (!registros.length) {
      toast.error('Sem registros para exportar');
      return;
    }
    
    // Dados do colaborador para incluir no CSV
    const nomeColaborador = user?.name || 'N/A';
    const emailColaborador = user?.email || 'N/A';
    const cargoColaborador = colaboradorLogado?.cargo || 'N/A';
    const departamentoColaborador = colaboradorLogado?.departamento || 'N/A';
    
    const header = 'colaborador,email,cargo,departamento,data,entrada,saida,intervalo,total,banco,entrada_bairro,entrada_cidade,entrada_estado,saida_bairro,saida_cidade,saida_estado';
    const lines = registros.map((r) =>
      [
        nomeColaborador,
        emailColaborador,
        cargoColaborador,
        departamentoColaborador,
        r.data,
        r.entrada,
        r.saida,
        r.intervalo,
        r.total,
        r.banco,
        r.localizacaoEntrada?.bairro ?? '',
        r.localizacaoEntrada?.cidade ?? '',
        r.localizacaoEntrada?.estado ?? '',
        r.localizacaoSaida?.bairro ?? '',
        r.localizacaoSaida?.cidade ?? '',
        r.localizacaoSaida?.estado ?? '',
      ].join(',')
    );
    const csv = [header, ...lines].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `espelho-ponto-${nomeColaborador.replace(/\s+/g, '-')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('CSV exportado');
  };

  const isBancoPositivo = bancoHoras.startsWith('+');

  // Cálculo do progresso mensal usando a meta do colaborador
  const metaMensal = metaHorasMensais * 60; // em minutos
  const horasTrabalhadasMes = registros
    .map((r) => parseTimeToMinutes(r.total) || 0)
    .reduce((acc, val) => acc + val, 0);
  const progressoMensal = metaMensal > 0 ? Math.min((horasTrabalhadasMes / metaMensal) * 100, 100) : 0;

  // Cálculo do intervalo médio diário (em minutos)
  const intervalosMin = registros
    .map((r) => parseTimeToMinutes(r.intervalo) || 0)
    .filter((v) => v > 0);
  const intervaloMedioMin = intervalosMin.length > 0
    ? Math.round(intervalosMin.reduce((acc, val) => acc + val, 0) / intervalosMin.length)
    : 0;
  // Formatar intervalo médio para hh:mm
  const intervaloMedioStr = `${Math.floor(intervaloMedioMin / 60)}h ${('0' + (intervaloMedioMin % 60)).slice(-2)}min`;
  
  const handleSolicitarAjuste = (data: string) => {
    setDataSelecionada(data);
    setEscolhaAberta(true);
  };

  // Dados para gráfico semanal (últimos 7 dias)
  const getUltimos7Dias = () => {
    const hoje = new Date();
    const diasOffset = semanaOffset * 7;
    const dados = [];
    
    for (let i = 6; i >= 0; i--) {
      const data = new Date(hoje);
      data.setDate(data.getDate() - i + diasOffset);
      const dataStr = data.toLocaleDateString('pt-BR');
      const registro = registros.find((r) => r.data === dataStr);
      const minutos = registro ? parseTimeToMinutes(registro.total) || 0 : 0;
      const horas = minutos / 60;
      
      dados.push({
        data: data.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
        horas: Number(horas.toFixed(2)),
        label: `${data.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}\nHoras: ${horas.toFixed(2)}`,
      });
    }
    return dados;
  };

  const dadosSemana = getUltimos7Dias();
  const tituloSemana = semanaOffset === 0 
    ? 'Últimos 7 Dias' 
    : `Semana de ${dadosSemana[0].data} a ${dadosSemana[6].data}`;

  return (
    <>
      <div className="space-y-6">
        <Card className="p-4 flex items-center justify-between">
          <h3 className="text-2xl font-bold">Controle de Ponto</h3>
        </Card>
        <div className="flex flex-col gap-6 md:flex-row md:gap-6">
          <Card className="md:w-[30%] w-full p-8 bg-white flex flex-col md:h-[420px]">
            <div className="flex flex-col gap-6 h-full">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-800">Horário Atual</h3>
              </div>

              <div className="flex flex-col items-center gap-6 flex-1 justify-center">
                <div className="flex flex-col items-center gap-1">
                  <p className="text-xl font-bold text-[#1F2937] font-mono mb-0">{`${['dom','seg','ter','qua','qui','sex','sáb'][new Date().getDay()]}, ${new Date().toLocaleDateString('pt-BR')}`}</p>
                  <p className="text-5xl font-bold text-[#1F2937] font-mono">{time || '00:00:00'}</p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-green-100 rounded-lg">
                  <AlertCircle size={18} className="text-green-700" />
                  <p className="text-sm text-green-700 font-medium">{statusHoje}</p>
                </div>
                <div className="flex gap-3 w-full max-w-xs">
                  <Button variant="primary" fullWidth onClick={() => handleRegistro('entrada')}>
                    Registrar Entrada
                  </Button>
                  <Button
                    variant="outline"
                    fullWidth
                    onClick={() => handleRegistro('saida')}
                    className="border-red-300 text-red-600 hover:bg-red-50"
                  >
                    Registrar<br />Saída
                  </Button>
                </div>
              </div>
            </div>
          </Card>
          <Card className="md:w-[70%] w-full p-8 flex flex-col justify-between md:h-[420px]">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-800">Banco de Horas</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => setViewMode('mensal')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                    viewMode === 'mensal'
                      ? 'bg-[#10B981] text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <TrendingUp size={16} />
                  Mensal
                </button>
                <button
                  onClick={() => setViewMode('semanal')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                    viewMode === 'semanal'
                      ? 'bg-[#10B981] text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <BarChart3 size={16} />
                  Semanal
                </button>
              </div>
            </div>
            <div className="h-full flex flex-col justify-center">
              {viewMode === 'mensal' ? (
                <div className="flex flex-row gap-8 h-full items-start">
                  {/* Coluna Esquerda: Saldo e Intervalo médio */}
                  <div className="flex flex-col gap-[4.5rem] md:w-[30%] w-full">
                    {/* Saldo */}
                    <div className="flex flex-col items-center">
                      <div className="flex items-center gap-2 mb-2">
                        <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={isBancoPositivo ? 'text-green-500' : 'text-red-500'} viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                        <span className="text-base font-semibold text-gray-700">Saldo:</span>
                      </div>
                      <span className={`text-4xl font-bold ${isBancoPositivo ? 'text-green-600' : 'text-red-600'}`}>{bancoHoras}</span>
                      <span className="text-xs text-gray-500 mt-2">Atualizado em {new Date().toLocaleDateString('pt-BR')}</span>
                    </div>
                    
                    {/* Intervalo médio diário */}
                    <div className="flex flex-col items-center">
                      <span className="text-base font-semibold text-gray-700 mb-1">Média de Intervalo:</span>
                      <div className="text-sm text-gray-600">{intervaloMedioStr}</div>
                    </div>
                  </div>
                  
                  {/* Coluna Direita: Progresso Mensal e Próximos Eventos */}
                  <div className="flex flex-col gap-6 md:w-[70%] w-full">
                    {/* Progresso Mensal */}
                    <div>
                      <div className="flex flex-col gap-2 mb-4">
                        <span className="text-base font-semibold text-gray-700">Progresso Mensal:</span>
                        <span className="text-sm text-gray-500">Meta: {metaHorasMensais}h</span>
                      </div>
                      <div className="w-full flex items-center">
                        <div className="flex-1 bg-gray-200 rounded-full h-8 overflow-hidden flex items-center">
                          <div 
                            className={`h-full ${progressoMensal >= 100 ? 'bg-green-500' : 'bg-blue-500'} flex items-center justify-end pr-4 text-white text-xl font-bold transition-all duration-300`}
                            style={{ width: `${Math.min(progressoMensal, 100)}%` }} 
                          >
                            {progressoMensal > 8 && (
                              <span>{progressoMensal.toFixed(0)}%</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-4">
                        <span className="text-lg text-gray-700 font-semibold">{(horasTrabalhadasMes / 60).toFixed(1)}h</span>
                        <span className="text-sm text-gray-500">trabalhadas de</span>
                        <span className="text-lg text-gray-700 font-semibold">{metaHorasMensais}h</span>
                      </div>
                    </div>

                    {/* Próximos Eventos */}
                    <div className="flex flex-col">
                      <span className="text-base font-semibold text-gray-700 mb-3">Próximos Eventos:</span>
                      <div className="flex flex-wrap gap-4">
                        {proxEventos && proxEventos.length > 0 ? (
                          proxEventos.map((e, idx) => {
                            const bg = e.tipo === 'feriado' ? 'bg-blue-50' : e.tipo === 'reserva' ? 'bg-purple-50' : e.tipo === 'comemoracao' ? 'bg-pink-50' : 'bg-gray-50';
                            const text = e.tipo === 'feriado' ? 'text-blue-700' : e.tipo === 'reserva' ? 'text-purple-700' : e.tipo === 'comemoracao' ? 'text-pink-700' : 'text-gray-700';
                            return (
                              <div key={idx} className={`flex flex-col items-center justify-center w-32 h-24 p-3 rounded-lg ${bg}`}>
                                <span className={`font-bold ${text} text-lg`}>
                                        {(e.dateObj ?? new Date(e.date)).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                                </span>
                                <span className="text-xs text-gray-700 mt-1 text-center">{e.name}</span>
                              </div>
                            );
                          })
                        ) : (
                          <div className="text-sm text-gray-500">Nenhum evento encontrado</div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <h4 className="text-base font-semibold text-gray-700">{tituloSemana}</h4>
                      <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-gray-50">
                        <span className="text-sm text-gray-600">Saldo:</span>
                        <span className={`text-sm font-bold ${isBancoPositivo ? 'text-green-600' : 'text-red-600'}`}>
                          {bancoHoras}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSemanaOffset(semanaOffset - 1)}
                        className="p-1 rounded hover:bg-gray-100 transition-colors"
                        title="Semana anterior"
                      >
                        <ChevronLeft size={20} className="text-gray-600" />
                      </button>
                      <button
                        onClick={() => setSemanaOffset(Math.min(semanaOffset + 1, 0))}
                        disabled={semanaOffset === 0}
                        className={`p-1 rounded transition-colors ${
                          semanaOffset === 0 
                            ? 'text-gray-300 cursor-not-allowed' 
                            : 'hover:bg-gray-100 text-gray-600'
                        }`}
                        title="Semana seguinte"
                      >
                        <ChevronRight size={20} />
                      </button>
                    </div>
                  </div>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={dadosSemana}>
                      <XAxis 
                        dataKey="data" 
                        tick={{ fontSize: 12, fill: '#6B7280' }}
                        axisLine={{ stroke: '#E5E7EB' }}
                      />
                      <YAxis 
                        tick={{ fontSize: 12, fill: '#6B7280' }}
                        axisLine={{ stroke: '#E5E7EB' }}
                        label={{ value: 'Horas', angle: -90, position: 'insideLeft', style: { fontSize: 12, fill: '#6B7280' } }}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'white', 
                          border: '1px solid #E5E7EB', 
                          borderRadius: '8px',
                          fontSize: '12px'
                        }}
                        formatter={(value: number) => [`${value.toFixed(2)}h`, 'Horas']}
                      />
                      <Bar dataKey="horas" radius={[8, 8, 0, 0]}>
                        {dadosSemana.map((_entry, index) => (
                          <Cell key={`cell-${index}`} fill="#10B981" />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </Card>
        </div>

      <Card className="p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Espelho de Ponto</h3>
          <div className="flex items-center gap-3">
            <select
              value={mes}
              onChange={(e) => setMes(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#10B981]"
            >
              <option>Novembro 2024</option>
              <option>Outubro 2024</option>
              <option>Setembro 2024</option>
            </select>
            <Button
              variant="secondary"
              onClick={exportCSV}
              className="flex items-center gap-2"
              title="Exportar registros para CSV"
            >
              <Download size={16} />
              Exportar CSV
            </Button>
          </div>
        </div>

        {registros.length === 0 ? (
          <EmptyState
            title="Nenhum registro este mês"
            description="Ainda não há registros de ponto para este mês."
            cta={
              <button
                onClick={() => handleRegistro('entrada')}
                className="mt-2 px-4 py-2 bg-[#10B981] text-white rounded-lg"
              >
                Registrar Ponto
              </button>
            }
          />
        ) : (
          <>
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
                    <th className="text-left p-3 font-semibold text-gray-700">Geolocalização</th>
                    <th className="text-left p-3 font-semibold text-gray-700">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {registros.map((reg) => (
                    <tr key={reg.data + reg.entrada + reg.saida} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="p-3 text-gray-700">{reg.data}</td>
                      <td className="p-3 text-gray-700">{reg.entrada}</td>
                      <td className="p-3 text-gray-700">{reg.saida}</td>
                      <td className="p-3 text-gray-700">{reg.intervalo}</td>
                      <td className="p-3 text-gray-700">{reg.total}</td>
                      <td className={`p-3 font-medium ${reg.banco.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>{reg.banco}</td>
                      <td className="p-3 text-xs text-gray-600">
                        <div className="space-y-1">
                          {reg.localizacaoEntrada && (
                            <div className="flex items-start gap-1">
                              <span className="text-green-600">E:</span>
                              <span>
                                {reg.localizacaoEntrada.cidade 
                                  ? `${reg.localizacaoEntrada.bairro}, ${reg.localizacaoEntrada.cidade}, ${reg.localizacaoEntrada.estado}`
                                  : reg.localizacaoEntrada.bairro}
                              </span>
                            </div>
                          )}
                          {reg.localizacaoSaida && (
                            <div className="flex items-start gap-1">
                              <span className="text-red-600">S:</span>
                              <span>
                                {reg.localizacaoSaida.cidade 
                                  ? `${reg.localizacaoSaida.bairro}, ${reg.localizacaoSaida.cidade}, ${reg.localizacaoSaida.estado}`
                                  : reg.localizacaoSaida.bairro}
                              </span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="p-3">
                        <button
                          onClick={() => handleSolicitarAjuste(reg.data)}
                          className="text-blue-600 hover:underline text-sm"
                          title="Solicitar ajuste ou anexar atestado"
                        >
                          Solicitar Ajuste
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </Card>
      </div>
      <SolicitacaoPontoModal 
        isOpen={modalAberto}
        onClose={() => setModalAberto(false)}
        data={dataSelecionada}
        tipo="ajuste"
      />
      <AtestadoModal 
        isOpen={atestadoAberto}
        onClose={() => setAtestadoAberto(false)}
        data={dataSelecionada}
      />
      <EscolhaTipoSolicitacaoModal 
        isOpen={escolhaAberta}
        onClose={() => setEscolhaAberta(false)}
        onEscolher={(tipo: 'ajuste' | 'atestado') => {
          setEscolhaAberta(false);
          if (tipo === 'ajuste') {
            setModalAberto(true);
          } else {
            setAtestadoAberto(true);
          }
        }}
      />
    </>
  );
}
