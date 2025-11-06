import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { parseTimeToMinutes, minutesToHHMM, formatBankMinutes, diffMinutes } from '../utils/time';

export interface RegistroPonto {
  data: string;
  entrada: string;
  saida: string;
  intervalo: string;
  total: string;
  banco: string;
}

interface PontoState {
  registros: RegistroPonto[];
  bancoHoras: string;
  statusHoje: string;
  registrarPonto: (tipo: 'entrada' | 'saida') => void;
  reset: () => void;
}

const mockRegistros: RegistroPonto[] = [
  { data: '04/11/2024', entrada: '09:00', saida: '18:15', intervalo: '01:00', total: '08:15', banco: '+0:15' },
  { data: '01/11/2024', entrada: '08:45', saida: '18:00', intervalo: '01:00', total: '08:15', banco: '+0:15' },
  { data: '31/10/2024', entrada: '09:05', saida: '18:30', intervalo: '01:00', total: '08:25', banco: '+0:25' },
  { data: '30/10/2024', entrada: '09:00', saida: '17:45', intervalo: '01:00', total: '07:45', banco: '-0:15' },
  { data: '29/10/2024', entrada: '08:50', saida: '18:10', intervalo: '01:00', total: '08:20', banco: '+0:20' }
];

export const usePontoStore = create<PontoState>()(
  persist(
    (set) => ({
      registros: mockRegistros,
      bancoHoras: '+8:30',
      statusHoje: 'Entrada registrada às 09:00',
      registrarPonto: (tipo) => {
        const now = new Date();
        const time = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        const date = now.toLocaleDateString('pt-BR');

        set((state) => {
          const todayIndex = state.registros.findIndex((r) => r.data === date);
          let registros = [...state.registros];

          if (todayIndex >= 0) {
            const existing = { ...registros[todayIndex] };
            if (tipo === 'entrada') existing.entrada = time;
            else existing.saida = time;
            // compute intervalo and total if possible
            const intervaloMins = parseTimeToMinutes(existing.intervalo) ?? 60; // default 60 min
            const dur = diffMinutes(existing.entrada, existing.saida);
            if (dur != null) {
              const totalMins = Math.max(0, dur - intervaloMins);
              existing.total = minutesToHHMM(totalMins);
            }
            registros[todayIndex] = existing;
          } else {
            const novo = {
              data: date,
              entrada: tipo === 'entrada' ? time : '--:--',
              saida: tipo === 'saida' ? time : '--:--',
              intervalo: '01:00',
              total: '--:--',
              banco: '+0:00',
            };
            // if we have both times in the unlikely event, compute total
            const dur = diffMinutes(novo.entrada, novo.saida);
            if (dur != null) {
              const intervaloMins = parseTimeToMinutes(novo.intervalo) ?? 60;
              novo.total = minutesToHHMM(Math.max(0, dur - intervaloMins));
            }
            registros = [novo, ...registros];
          }

          // recalc bancoHoras based on registros: expected 8h per day
          const expectedPerDay = 8 * 60;
          const totalsMins = registros
            .map((r) => parseTimeToMinutes(r.total) ?? null)
            .filter((v) => v != null) as number[];

          const sumTotal = totalsMins.reduce((a, b) => a + b, 0);
          const bankMins = sumTotal - expectedPerDay * totalsMins.length;

          return {
            registros,
            bancoHoras: formatBankMinutes(bankMins),
            statusHoje: `${tipo === 'entrada' ? 'Entrada' : 'Saída'} registrada às ${time}`,
          };
        });
      },
      reset: () => set({ registros: mockRegistros, bancoHoras: '+8:30', statusHoje: 'Entrada registrada às 09:00' }),
    }),
    { name: 'cfo:ponto', partialize: (s) => ({ registros: s.registros, bancoHoras: s.bancoHoras }) }
  )
);
