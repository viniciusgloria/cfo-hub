import { describe, it, expect, beforeAll } from 'vitest';
import { render } from '@testing-library/react';
import { Clientes } from '../Clientes';
import { useClientesStore } from '../../store/clientesStore';

// ensure the store has deterministic data for the snapshot
beforeAll(() => {
  const { reset } = useClientesStore.getState();
  reset();
});

describe('Clientes page snapshot', () => {
  it('matches DOM snapshot', () => {
    const { container } = render(<Clientes />);
    expect(container).toMatchSnapshot();
  });
});
