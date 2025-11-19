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

  it('registers entrada and updates registro and status', async () => {
    // set system time to 2024-11-06 09:00
    vi.setSystemTime(new Date('2024-11-06T09:00:00'));
    const res = await usePontoStore.getState().registrarEntrada();

    const state = usePontoStore.getState();
    expect(state.registros.length).toBe(1);
    expect(state.registros[0].punches[0].hhmm).toBe('09:00');
    expect(state.statusHoje).toContain('Entrada registrada às 09:00');
    // with no exit yet bancoHoras should be default or unchanged
    expect(state.bancoHoras).toBeUndefined() || expect(state.bancoHoras).toBe('+0:00');
    expect(res.success).toBe(true);
  });

  it('registers saida then computes total and updates bancoHoras', async () => {
    // first register entrada at 09:00
    vi.setSystemTime(new Date('2024-11-06T09:00:00'));
    await usePontoStore.getState().registrarEntrada();

    // then register saida at 18:15
    vi.setSystemTime(new Date('2024-11-06T18:15:00'));
    await usePontoStore.getState().registrarSaida();

    const state = usePontoStore.getState();
    expect(state.registros.length).toBe(1);
    const r = state.registros[0];
    expect(r.punches.find((p) => p.type === 'entrada')?.hhmm).toBe('09:00');
    expect(r.punches.slice().reverse().find((p) => p.type === 'saida')?.hhmm).toBe('18:15');
    // totalMinutos = 9h15 => 555 minutes
    expect(r.totalMinutos).toBe(555);
    // bancoHoras = total(9:15) - expected(8:00) => +1:15
    expect(usePontoStore.getState().bancoHoras).toBe('+1:15');
  });

  it('registers entrada with localizacao', async () => {
    vi.setSystemTime(new Date('2024-11-06T09:00:00'));
    await usePontoStore.getState().registrarEntrada({ bairro: 'Trindade', cidade: 'Florianópolis', estado: 'SC' });
    const s = usePontoStore.getState();
    expect(s.registros.length).toBe(1);
    expect(s.registros[0].punches[0].localizacao).toEqual({ bairro: 'Trindade', cidade: 'Florianópolis', estado: 'SC' });
  });

  it('registers entrada with permission error', async () => {
    vi.setSystemTime(new Date('2024-11-06T09:00:00'));
    await usePontoStore.getState().registrarEntrada({ bairro: 'Erro de Permissão', cidade: '', estado: '' });
    const s = usePontoStore.getState();
    expect(s.registros.length).toBe(1);
    expect(s.registros[0].punches[0].localizacao?.bairro).toBe('Erro de Permissão');
  });

  it('registers saida with different localizacao', async () => {
    vi.setSystemTime(new Date('2024-11-06T09:00:00'));
    await usePontoStore.getState().registrarEntrada({ bairro: 'Centro', cidade: 'Florianópolis', estado: 'SC' });
    vi.setSystemTime(new Date('2024-11-06T18:00:00'));
    await usePontoStore.getState().registrarSaida({ bairro: 'Trindade', cidade: 'Florianópolis', estado: 'SC' });
    const s = usePontoStore.getState();
    expect(s.registros.length).toBe(1);
    const entradaLoc = s.registros[0].punches.find((p) => p.type === 'entrada')?.localizacao;
    const saidaLoc = s.registros[0].punches.slice().reverse().find((p) => p.type === 'saida')?.localizacao;
    expect(entradaLoc?.bairro).toBe('Centro');
    expect(saidaLoc?.bairro).toBe('Trindade');
  });
});
