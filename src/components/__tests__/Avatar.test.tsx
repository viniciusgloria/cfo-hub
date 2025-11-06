import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';
import { expect as vitestExpect } from 'vitest';

// extend vitest expect with jest-dom matchers
vitestExpect.extend(matchers as any);
import { Avatar } from '../Avatar';

describe('Avatar component', () => {
  it('renders an img when src is provided', () => {
    render(<Avatar src="/avatar.png" alt="User" size="md" />);
    const img = screen.getByAltText('User') as HTMLImageElement;
    expect(img).not.toBeNull();
    expect(img.getAttribute('src')).toBe('/avatar.png');
  });

  it('renders fallback children when no src is provided', () => {
    render(<Avatar size="md">Fallback</Avatar>);
    expect(screen.getByText('Fallback')).not.toBeNull();
  });

  it('applies size classes', () => {
    const { container } = render(<Avatar src="/a.png" alt="X" size="lg" />);
    const img = container.querySelector('img') as HTMLImageElement | null;
    expect(img).not.toBeNull();
    expect(img?.classList.contains('avatar-lg')).toBe(true);
  });
});
