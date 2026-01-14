
export function humanFileSize(bytes: number, si: boolean = true, dp: number = 1) {
    const thresh = si ? 1000 : 1024;
    if (Math.abs(bytes) < thresh) {
        return {
            value: bytes,
            unit: 'B'
        };
    }
    const units = si
        ? ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
        : ['KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];
    let u = -1;
    const r = 10 ** dp;

    do {
        bytes /= thresh;
        ++u;
    } while (Math.round(Math.abs(bytes) * r) / r >= thresh && u < units.length - 1);

    return {
        value: bytes.toFixed(dp),
        unit: units[u]
    };
}

export function formatHumanSize(bytes: number): string {
    const size = humanFileSize(bytes || 0);
    return `${size.value} ${size.unit}`;
}

export function formatNum(num: number): string {
    return num?.toLocaleString?.() ?? '0';
}

export function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
}

export function formatBandwidthUsage(currentBytes: number, maxGB?: number): string {
    const currentSize = humanFileSize(currentBytes || 0);
    if (!maxGB) {
        return `${currentSize.value} ${currentSize.unit} / Unlimited`;
    }
    const maxSize = humanFileSize(maxGB * 1000 * 1000 * 1000);
    return `${currentSize.value} ${currentSize.unit} / ${maxSize.value} ${maxSize.unit}`;
}

export function createProgressData(
    currentValue: number,
    maxValue: number | string
): Array<{ size: number; color: string; tooltip?: { title: string; label: string } }> {
    if (
        maxValue === null ||
        maxValue === undefined ||
        (typeof maxValue === 'number' && maxValue <= 0)
    ) {
        return [];
    }

    const max = typeof maxValue === 'string' ? parseFloat(maxValue) : maxValue;
    if (max <= 0) return [];

    const percentage = Math.min((currentValue / max) * 100, 100);
    const progressColor = '#FD366E'; // Appwrite Pink

    return [
        {
            size: currentValue,
            color: progressColor,
            tooltip: {
                title: `${percentage.toFixed(1)}% used`,
                label: `${currentValue.toLocaleString()} of ${max.toLocaleString()}`
            }
        }
    ];
}

export function createStorageProgressData(
    currentBytes: number,
    maxGB: number
): Array<{ size: number; color: string; tooltip?: { title: string; label: string } }> {
    if (maxGB <= 0) return [];

    const maxBytes = maxGB * 1000 * 1000 * 1000;
    const percentage = Math.min((currentBytes / maxBytes) * 100, 100);
    const progressColor = '#FD366E';

    const currentSize = humanFileSize(currentBytes);

    return [
        {
            size: currentBytes,
            color: progressColor,
            tooltip: {
                title: `${percentage.toFixed(0)}% used`,
                label: `${currentSize.value} ${currentSize.unit} of ${maxGB} GB`
            }
        }
    ];
}

export function toLocaleDate(date: string) {
    return new Date(date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
}
