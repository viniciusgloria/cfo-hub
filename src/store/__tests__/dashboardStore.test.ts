import { describe, it, expect, beforeEach } from 'vitest';
import { useDashboardStore } from '../dashboardStore';

describe('dashboard store', () => {
  beforeEach(() => {
    // reset widgets to default
    useDashboardStore.setState({ widgets: useDashboardStore.getState().widgets });
  });

  it('reorderWidgets updates order indexes correctly', () => {
    const initial = useDashboardStore.getState().widgets.slice(0, 5);
    // create a shuffled copy: move first element to position 3
    const moved = [...initial];
    const [first] = moved.splice(0, 1);
    moved.splice(3, 0, first);

    // assign orders to match array index
    const payload = moved.map((w, idx) => ({ ...w, order: idx }));

    useDashboardStore.getState().reorderWidgets(payload);

    const state = useDashboardStore.getState();
    expect(state.widgets.slice(0, 5).map(w => w.id)).toEqual(payload.map(p => p.id));
    // orders persisted
    expect(state.widgets.slice(0, 5).map(w => w.order)).toEqual([0,1,2,3,4]);
  });
});
