import os from 'os';
import { ThermalPrinter, PrinterTypes, CharacterSet, BreakLine } from 'node-thermal-printer';
import { dbService } from '../services/db';

export interface HardwareInterface {
    printTicket(data: any): Promise<void>;
}

export class PrinterManager implements HardwareInterface {
    private printer: ThermalPrinter | null = null;

    constructor() {
        // Initialization is now done on-demand to ensure we have the latest settings
    }

    private async getPrinterInstance(): Promise<ThermalPrinter> {
        const settings = await dbService.getSettings();

        // Default values if settings are missing
        const printerType = (settings?.printerType as PrinterTypes) || PrinterTypes.EPSON;
        const interfaceType = settings?.printerInterface || 'network';

        let printerInterface: string;

        if (interfaceType === 'network') {
            const ip = settings?.printerIp || '192.168.1.200';
            const port = settings?.printerPort || 9100;
            printerInterface = `tcp://${ip}:${port}`;
            console.log(`🖨️ Configured for NETWORK printing at ${printerInterface}`);
        } else {
            // USB Mode
            // On Linux/Unix, this is usually /dev/usb/lp0 or similar
            // On Windows, it might be the printer name
            const usbPath = settings?.printerUsbPath || '/dev/usb/lp0';
            printerInterface = usbPath;
            console.log(`🖨️ Configured for USB printing at ${printerInterface}`);
        }

        return new ThermalPrinter({
            type: printerType,
            interface: printerInterface,
            characterSet: CharacterSet.PC858_EURO,
            removeSpecialCharacters: false,
            lineCharacter: "-",
            options: {
                timeout: 5000
            }
        });
    }

    async printTicket(data: any): Promise<void> {
        console.log('🖨️ Printing ticket:', data.type || 'ORDER', data.id);

        try {
            // Re-instantiate printer to get latest settings
            const printer = await this.getPrinterInstance();
            this.printer = printer;

            printer.clear();

            // Header
            printer.alignCenter();
            printer.bold(true);
            printer.setTextDoubleHeight();
            printer.setTextDoubleWidth();
            printer.println('ZELTY KILLER POS');
            printer.setTextNormal();
            printer.println('123 Tech Street, Paris');
            printer.println('SIRET: 123 456 789 00012');
            printer.newLine();

            if (data.type === 'Z-TICKET') {
                // Z-TICKET LAYOUT
                printer.invert(true);
                printer.println('*** Z-TICKET (END OF DAY) ***');
                printer.invert(false);
                printer.newLine();
                printer.alignLeft();
                printer.println(`Date: ${new Date(data.date).toLocaleDateString()}`);
                printer.drawLine();
                printer.println(`Total Orders: ${data.orderCount}`);
                printer.println(`Total Sales: $${data.totalSales.toFixed(2)}`);
                printer.drawLine();
                printer.alignCenter();
                printer.println('Fiscal Archive Generated');
                printer.newLine();
            } else {
                // ORDER LAYOUT
                printer.alignLeft();
                printer.println(`Order: #${data.id?.slice(0, 8) || 'Unknown'}`);
                printer.println(`Date: ${new Date(data.createdAt || Date.now()).toLocaleString()}`);
                printer.drawLine();

                // Items
                if (data.items) {
                    data.items.forEach((item: any) => {
                        printer.tableCustom([
                            { text: `${item.quantity}x ${item.name}`, align: "LEFT", width: 0.75 },
                            { text: (item.price * item.quantity).toFixed(2), align: "RIGHT", width: 0.25 }
                        ]);
                    });
                }

                // Total
                printer.drawLine();
                printer.alignRight();
                printer.bold(true);
                printer.setTextDoubleHeight();
                printer.println(`TOTAL: $${data.total?.toFixed(2) || '0.00'}`);
                printer.setTextNormal();
                printer.bold(false);
                printer.newLine();

                // Footer
                printer.alignCenter();
                printer.println('Thank you for your visit!');
                printer.newLine();
                printer.println(`NF525 Sig: ${data.fiscal_signature ? data.fiscal_signature.slice(0, 10) + '...' : 'N/A'}`);
            }

            // Cut & Open Drawer
            printer.cut();

            if (data.type !== 'Z-TICKET') {
                printer.openCashDrawer(); // ESC p
            }

            // Execute Print
            const isConnected = await printer.isPrinterConnected();
            if (!isConnected) {
                console.warn(`⚠️ Printer NOT connected`);
                // For dev/demo without printer, we just log the buffer
                console.log('Raw Buffer:', printer.getText());
            } else {
                await printer.execute();
                console.log('✅ Print job sent successfully');
            }

        } catch (error) {
            console.error('❌ Print failed:', error);
            // Don't throw, just log, so UI doesn't crash
            // throw error; 
        }
    }
}

export const printerManager = new PrinterManager();
