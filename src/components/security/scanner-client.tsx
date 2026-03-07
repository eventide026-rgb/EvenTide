
'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { ScanLine, CircleCheck, CircleX, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useFirestore } from '@/firebase';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { type Guest } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Html5Qrcode } from 'html5-qrcode';
import { type Html5QrcodeError, type Html5QrcodeResult } from 'html5-qrcode/core';

type ScanStatus = 'scanning' | 'success' | 'failure' | 'loading';
type ScannedGuest = {
    name: string;
    category: string;
    message?: string;
}

export default function ScannerClient({ eventId }: { eventId: string }) {
  const router = useRouter();
  const [scanStatus, setScanStatus] = useState<ScanStatus>('scanning');
  const [scannedData, setScannedData] = useState<ScannedGuest | null>(null);
  const firestore = useFirestore();
  const { toast } = useToast();
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState(true);

  useEffect(() => {
    const activationToken = sessionStorage.getItem(`scanner_activated_${eventId}`);
    if (activationToken !== 'true') {
        toast({
            variant: 'destructive',
            title: 'Scanner Not Active',
            description: 'Please activate the scanner with the security code first.',
        });
        router.replace(`/security-dashboard/${eventId}/activate`);
    }
  }, [eventId, router, toast]);

  const handleScanResult = useCallback(async (scannedText: string) => {
    if (scanStatus !== 'scanning') return; 

    let guestIdToSimulate: string;
    try {
        const parsed = JSON.parse(scannedText);
        guestIdToSimulate = parsed.guestId;
        if(!guestIdToSimulate) throw new Error("Invalid format");
    } catch (e) {
        setScannedData({ name: 'Invalid QR', category: '', message: 'Not a valid ticket.' });
        setScanStatus('failure');
        return;
    }

    setScanStatus('loading');
    try {
        const guestRef = doc(firestore, 'events', eventId, 'guests', guestIdToSimulate);
        const guestSnap = await getDoc(guestRef);

        if (!guestSnap.exists()) throw new Error('Guest not found.');

        const guest = guestSnap.data() as Guest;
        
        if (guest.hasCheckedIn) {
             setScannedData({ name: guest.name, category: guest.category, message: 'Already Checked In' });
             setScanStatus('failure');
             return;
        }

        await updateDoc(guestRef, { hasCheckedIn: true, checkInTime: serverTimestamp() });
        setScannedData({ name: guest.name, category: guest.category });
        setScanStatus('success');
      } catch (error: any) {
        setScannedData({ name: 'Invalid Scan', category: '', message: error.message });
        setScanStatus('failure');
      }
  }, [firestore, eventId, scanStatus]);

  const onScanSuccess = useCallback((decodedText: string) => handleScanResult(decodedText), [handleScanResult]);

  useEffect(() => {
    const startScanner = async () => {
        try {
            await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
            if (!scannerRef.current) {
                const scanner = new Html5Qrcode('reader');
                scannerRef.current = scanner;
                await scanner.start({ facingMode: "environment" }, { fps: 10, qrbox: 250 }, onScanSuccess, () => {});
            }
        } catch (error) {
            setHasCameraPermission(false);
        }
    }
    startScanner();
    return () => {
        if (scannerRef.current?.isScanning) {
            scannerRef.current.stop().catch(console.error);
        }
    };
  }, [onScanSuccess]);

  useEffect(() => {
    if (scanStatus !== 'scanning') {
      const timer = setTimeout(() => {
        setScanStatus('scanning');
        setScannedData(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [scanStatus]);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md mx-auto relative overflow-hidden">
        <CardContent className="p-0">
          <div className="relative aspect-square w-full bg-black">
             <div id="reader" className="w-full h-full" />
            {!hasCameraPermission && (
              <div className="absolute inset-0 flex items-center justify-center p-4 bg-black/80">
                <Alert variant="destructive">
                  <AlertTitle>Camera Access Required</AlertTitle>
                  <AlertDescription>Please allow camera access to use the scanner.</AlertDescription>
                </Alert>
              </div>
            )}
            <div className={cn(
                "absolute inset-0 flex flex-col items-center justify-center p-4 text-center text-white transition-all duration-300",
                scanStatus === 'scanning' && 'bg-black/50 pointer-events-none',
                scanStatus === 'success' && 'bg-green-500/90',
                scanStatus === 'failure' && 'bg-destructive/90',
                scanStatus === 'loading' && 'bg-black/80 backdrop-blur-sm'
            )}>
                 {scanStatus === 'scanning' && hasCameraPermission && (
                    <>
                        <div className="w-2/3 h-2/3 border-4 border-dashed border-white/50 rounded-lg" />
                        <ScanLine className="absolute w-2/3 h-10 text-primary animate-pulse" />
                        <p className="absolute bottom-4 text-lg font-semibold">Scan Ticket QR Code</p>
                    </>
                 )}
                 {scanStatus === 'loading' && <Loader2 className="h-24 w-24 animate-spin" />}
                 {scanStatus === 'success' && (
                    <>
                        <CircleCheck className="h-32 w-32" />
                        <h2 className="text-4xl font-bold mt-4">Verified</h2>
                        <p className="text-xl mt-2">{scannedData?.name}</p>
                    </>
                 )}
                 {scanStatus === 'failure' && (
                    <>
                        <CircleX className="h-32 w-32" />
                        <h2 className="text-4xl font-bold mt-4">Denied</h2>
                        <p className="text-xl mt-2">{scannedData?.message}</p>
                    </>
                 )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
