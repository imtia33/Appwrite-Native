export type Size = 'B' | 'KB' | 'MB' | 'GB' | 'TB';

export function sizeToBytes(size: number, unit: Size): number {
    const units: Record<Size, number> = {
        B: 1,
        KB: 1024,
        MB: 1024 ** 2,
        GB: 1024 ** 3,
        TB: 1024 ** 4,
    };

    return size * (units[unit] || 1);
}

export function bytesToSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes: Size[] = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
