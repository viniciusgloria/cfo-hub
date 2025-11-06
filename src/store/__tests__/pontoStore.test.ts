import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { usePontoStore } from '../pontoStore';

describe('ponto store', () => {
  beforeEach(() => {
    // reset store to a clean state
    usePontoStore.setState({ registros: [], bancoHoras: '+0:00', statusHoje: '' });
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('registers entrada and updates registro and status', () => {
    // set system time to 2024-11-06 09:00
    vi.setSystemTime(new Date('2024-11-06T09:00:00'));
    const { registrarPonto } = usePontoStore.getState();
    registrarPonto('entrada');

    const state = usePontoStore.getState();
    expect(state.registros.length).toBe(1);
    expect(state.registros[0].entrada).toBe('09:00');
    expect(state.statusHoje).toContain('Entrada registrada às 09:00');
    // with no totals calculated yet bancoHoras should remain +0:00 (based on implementation)
    expect(state.bancoHoras).toBe('+0:00');
  });

  it('registers saida then computes total and updates bancoHoras', () => {
    // first register entrada at 09:00
    vi.setSystemTime(new Date('2024-11-06T09:00:00'));
    usePontoStore.getState().registrarPonto('entrada');

    // then register saida at 18:15
    vi.setSystemTime(new Date('2024-11-06T18:15:00'));
    usePontoStore.getState().registrarPonto('saida');

    const state = usePontoStore.getState();
    expect(state.registros.length).toBe(1);
    const r = state.registros[0];
    expect(r.entrada).toBe('09:00');
    expect(r.saida).toBe('18:15');
    // total = diff - intervalo(01:00) => 9h15 - 1h = 8h15
    expect(r.total).toBe('08:15');
    // bancoHoras = total(8h15) - expected(8h) => +0:15
    expect(state.bancoHoras).toBe('+0:15');
  });
});
