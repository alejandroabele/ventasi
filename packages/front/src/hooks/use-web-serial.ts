'use client';

import { useState, useRef, useCallback, useEffect } from 'react';

const ZEBRA_VENDOR_ID = 0x0A5F;

export type WebSerialInfo = {
  usbVendorId?: number;
  usbProductId?: number;
  esZebra: boolean;
};

export function useWebSerial() {
  const [isAvailable, setIsAvailable] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [info, setInfo] = useState<WebSerialInfo | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const portRef = useRef<any>(null);

  // Al montar: detectar soporte y reconectar a un puerto ya autorizado
  useEffect(() => {
    const disponible = typeof navigator !== 'undefined' && 'serial' in navigator;
    setIsAvailable(disponible);
    if (!disponible) return;
    const intentarReconectar = async () => {
      try {
        const puertos = await (navigator as any).serial.getPorts();
        if (puertos.length > 0) {
          const port = puertos[0];
          await port.open({ baudRate: 9600 });
          portRef.current = port;
          const portInfo = port.getInfo?.() ?? {};
          setInfo({
            usbVendorId: portInfo.usbVendorId,
            usbProductId: portInfo.usbProductId,
            esZebra: portInfo.usbVendorId === ZEBRA_VENDOR_ID,
          });
          setIsConnected(true);
        }
      } catch {
        // sin puerto previo o error al abrir, continúa en modo desconectado
      }
    };
    intentarReconectar();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const connect = useCallback(async (): Promise<boolean> => {
    if (!isAvailable) return false;
    try {
      const port = await (navigator as any).serial.requestPort();
      await port.open({ baudRate: 9600 });
      portRef.current = port;
      const portInfo = port.getInfo?.() ?? {};
      setInfo({
        usbVendorId: portInfo.usbVendorId,
        usbProductId: portInfo.usbProductId,
        esZebra: portInfo.usbVendorId === ZEBRA_VENDOR_ID,
      });
      setIsConnected(true);
      return true;
    } catch {
      setIsConnected(false);
      return false;
    }
  }, [isAvailable]);

  const testConnection = useCallback(async (): Promise<boolean> => {
    if (!portRef.current) return false;
    try {
      // Envía un ZPL de noop (~HS host status, ~HQ host query) para verificar el canal
      const writer = portRef.current.writable?.getWriter();
      if (!writer) return false;
      const encoder = new TextEncoder();
      await writer.write(encoder.encode('~HS'));
      writer.releaseLock();
      return true;
    } catch {
      return false;
    }
  }, []);

  const print = useCallback(async (zpl: string): Promise<boolean> => {
    if (!portRef.current) return false;
    try {
      const writer = portRef.current.writable?.getWriter();
      if (!writer) return false;
      const encoder = new TextEncoder();
      await writer.write(encoder.encode(zpl));
      writer.releaseLock();
      return true;
    } catch {
      return false;
    }
  }, []);

  const disconnect = useCallback(async () => {
    if (!portRef.current) return;
    try {
      await portRef.current.close();
    } finally {
      portRef.current = null;
      setIsConnected(false);
      setInfo(null);
    }
  }, []);

  return { isAvailable, isConnected, info, connect, testConnection, print, disconnect };
}
