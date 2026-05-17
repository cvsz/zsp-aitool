import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ProductCard } from '@/components/products/ProductCard';

describe('ProductCard', () => {
  it('renders title and link', () => {
    render(<ProductCard product={{ id: '1', userId: 'u', title: 'Desk', originalUrl: 'https://example.com' }} />);
    expect(screen.getByText('Desk')).toBeInTheDocument();
    expect(screen.getByRole('link')).toHaveAttribute('href', 'https://example.com');
  });
});
