export class EscPosEncoder {
    private buffer: number[] = [];

    constructor() {
        this.initialize();
    }

    initialize() {
        this.buffer.push(0x1B, 0x40); // ESC @ (Initialize)
        return this;
    }

    text(content: string) {
        // Simple ASCII encoding for now. 
        // In production, we should handle Code Pages (CP850/Windows-1252) for accents.
        for (let i = 0; i < content.length; i++) {
            this.buffer.push(content.charCodeAt(i));
        }
        return this;
    }

    newline() {
        this.buffer.push(0x0A); // LF
        return this;
    }

    align(alignment: 'left' | 'center' | 'right') {
        this.buffer.push(0x1B, 0x61); // ESC a
        if (alignment === 'center') this.buffer.push(1);
        else if (alignment === 'right') this.buffer.push(2);
        else this.buffer.push(0);
        return this;
    }

    bold(enabled: boolean) {
        this.buffer.push(0x1B, 0x45, enabled ? 1 : 0); // ESC E
        return this;
    }

    size(width: number, height: number) {
        // GS ! n
        // width/height: 0-7 (1x to 8x)
        const n = (width << 4) | height;
        this.buffer.push(0x1D, 0x21, n);
        return this;
    }

    cut() {
        this.buffer.push(0x1D, 0x56, 66, 0); // GS V B 0 (Partial cut)
        return this;
    }

    openDrawer() {
        // ESC p m t1 t2
        // Pin 2 (0), 50ms on (50/2 = 25 = 0x19), 250ms off (250/2 = 125 = 0x7D)
        this.buffer.push(0x1B, 0x70, 0, 0x19, 0x7D);
        return this;
    }

    encode(): Buffer {
        return Buffer.from(this.buffer);
    }
}
