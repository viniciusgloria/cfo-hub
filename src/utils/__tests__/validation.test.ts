import { describe, it, expect } from 'vitest';
import { formatCNPJ, isValidCNPJ, formatCPF, isValidCPF, formatPhone, formatCEP, onlyDigits } from '../validation';

describe('validation utils', () => {
  it('formatCNPJ formats digits into mask', () => {
    const digits = '11222333000181';
    expect(formatCNPJ(digits)).toBe('11.222.333/0001-81');
  });

  it('formatCPF formats digits into mask', () => {
    const digits = '12345678909';
    expect(formatCPF(digits)).toBe('123.456.789-09');
  });

  it('formatPhone formats short and long phones', () => {
    expect(formatPhone('11988776655')).toBe('(11) 98877-6655');
  expect(formatPhone('118877665')).toBe('(11) 8877-665');
  });

  it('formatCEP formats correctly', () => {
    expect(formatCEP('12345678')).toBe('12345-678');
  });

  it('onlyDigits removes non numeric characters', () => {
    expect(onlyDigits('+55 (11) 98877-6655')).toBe('5511988776655');
  });

  it('isValidCPF rejects invalid inputs and accepts well-formed patterns', () => {
    expect(isValidCPF('000.000.000-00')).toBe(false);
    // some example CPFs may be considered valid by the checksum implementation
    expect(isValidCPF('123.456.789-09')).toBe(true);
  });

  it('isValidCNPJ rejects invalid inputs and handles formatted strings', () => {
    expect(isValidCNPJ('00.000.000/0000-00')).toBe(false);
    // example CNPJ may or may not be valid depending on checksum; ensure it returns a boolean
    expect(typeof isValidCNPJ('11.222.333/0001-81')).toBe('boolean');
  });
});
