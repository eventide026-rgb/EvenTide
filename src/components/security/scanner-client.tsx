
'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { ScanLine, CircleCheck, CircleX, Loader2, Armchair, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useFirestore } from '@/firebase';
import { doc, getDoc, updateDoc, serverTimestamp, collection, query, where, getDocs, limit } from 'firebase/firestore';
import { type Guest } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Html5Qrcode } from 'html5-qrcode';

type ScanStatus = 'scanning' | 'success' | 'failure' | 'loading';

type ScannedGuest = {
    name: string;
    category: string;
    tableNumber: string;
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

    let guestIdToVerify: string;
    try {
        const parsed = JSON.parse(scannedText);
        guestIdToVerify = parsed.guestId;
        if(!guestIdToVerify) throw new Error("Invalid format");
    } catch (e) {
        setScannedData({ name: 'Invalid QR', category: '', tableNumber: 'N/A', message: 'Not a valid EvenTide ticket.' });
        setScanStatus('failure');
        return;
    }

    setScanStatus('loading');
    try {
        // 1. Verify Guest and Update Check-in
        const guestRef = doc(firestore, 'events', eventId, 'guests', guestIdToVerify);
        const guestSnap = await getDoc(guestRef);

        if (!guestSnap.exists()) throw new Error('Guest not found in registry.');

        const guest = guestSnap.data() as Guest;
        
        if (guest.hasCheckedIn) {
             setScannedData({ name: guest.name, category: guest.category, tableNumber: 'Unknown', message: 'Already Checked In' });
             setScanStatus('failure');
             return;
        }

        // 2. Fetch Seating Information
        let tableNumber = "Unassigned";
        const seatsQuery = query(
            collection(firestore, 'events', eventId, 'seats'),
            where('guestId', '==', guestIdToVerify),
            limit(1)
        );
        const seatSnap = await getDocs(seatsQuery);
        
        if (!seatSnap.empty) {
            const seatData = seatSnap.docs[0].data();
            const tableRef = doc(firestore, 'events', eventId, 'tables', seatData.tableId);
            const tableSnap = await getDoc(tableRef);
            if (tableSnap.exists()) {
                tableNumber = tableSnap.data().tableName;
            }
        }

        // 3. Mark as Checked In
        await updateDoc(guestRef, { 
            hasCheckedIn: true, 
            checkInTime: serverTimestamp() 
        });

        setScannedData({ 
            name: guest.name, 
            category: guest.category,
            tableNumber: tableNumber
        });
        setScanStatus('success');
        
      } catch (error: any) {
        setScannedData({ name: 'Access Denied', category: '', tableNumber: 'N/A', message: error.message });
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
                await scanner.start(
                    { facingMode: "environment" }, 
                    { fps: 10, qrbox: { width: 250, height: 250 } }, 
                    onScanSuccess, 
                    () => {}
                );
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
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [scanStatus]);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md mx-auto relative overflow-hidden shadow-2xl border-none">
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
                "absolute inset-0 flex flex-col items-center justify-center p-6 text-center text-white transition-all duration-500",
                scanStatus === 'scanning' && 'bg-black/40 pointer-events-none',
                scanStatus === 'success' && 'bg-green-600',
                scanStatus === 'failure' && 'bg-destructive',
                scanStatus === 'loading' && 'bg-black/80 backdrop-blur-md'
            )}>
                 {scanStatus === 'scanning' && hasCameraPermission && (
                    <>
                        <div className="w-64 h-64 border-4 border-dashed border-white/30 rounded-3xl" />
                        <ScanLine className="absolute w-64 h-1 text-primary animate-bounce shadow-[0_0_15px_rgba(var(--primary),0.8)]" />
                        <p className="absolute bottom-8 text-sm font-bold uppercase tracking-[0.2em] opacity-70">Awaiting Guest QR</p>
                    </>
                 )}

                 {scanStatus === 'loading' && (
                    <div className="space-y-4">
                        <Loader2 className="h-16 w-16 animate-spin mx-auto text-primary" />
                        <p className="font-headline font-bold text-xl uppercase tracking-widest">Validating Ticket...</p>
                    </div>
                 )}

                 {scanStatus === 'success' && scannedData && (
                    <div className="space-y-6 animate-in zoom-in-95 duration-300">
                        <div className="bg-white/20 p-4 rounded-full w-fit mx-auto">
                            <CircleCheck className="h-20 w-20" />
                        </div>
                        <div>
                            <h2 className="text-4xl font-headline font-bold">Verified</h2>
                            <p className="text-2xl mt-2 font-medium">{scannedData.name}</p>
                            <Badge variant="outline" className="mt-2 text-white border-white/40 uppercase">{scannedData.category}</Badge>
                        </div>
                        <Card className="bg-white/10 border-white/20 text-white p-4">
                            <div className="flex items-center justify-center gap-3">
                                <Armchair className="h-6 w-6" />
                                <div>
                                    <p className="text-xs uppercase font-bold tracking-widest opacity-70">Table Assignment</p>
                                    <p className="text-xl font-bold">{scannedData.tableNumber}</p>
                                </div>
                            </div>
                        </Card>
                        <p className="text-sm font-bold uppercase tracking-widest animate-pulse">Checked In Successfully</p>
                    </div>
                 )}

                 {scanStatus === 'failure' && scannedData && (
                    <div className="space-y-6 animate-in zoom-in-95 duration-300">
                        <div className="bg-white/20 p-4 rounded-full w-fit mx-auto">
                            <CircleX className="h-20 w-20" />
                        </div>
                        <div>
                            <h2 className="text-4xl font-headline font-bold">Access Denied</h2>
                            <p className="text-xl mt-2 font-medium">{scannedData.name}</p>
                            <p className="text-lg mt-4 bg-black/20 p-2 rounded-lg font-bold">{scannedData.message}</p>
                        </div>
                        <p className="text-sm font-bold uppercase tracking-widest">Entry Refused</p>
                    </div>
                 )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Badge({ children, className, variant }: { children: React.ReactNode, className?: string, variant?: 'outline' | 'default' }) {
    return (
        <div className={cn(
            "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
            variant === 'outline' ? "text-foreground" : "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
            className
        )}>
            {children}
        </div>
    )
}
