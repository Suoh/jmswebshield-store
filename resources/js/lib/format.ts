export function stripHtml(input: string): string {
    return input.replace(/<[^>]*>/g, '');
}

export function formatPrice(value: number | string): string {
    return `$${Number(value).toLocaleString('es-MX', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;
}
