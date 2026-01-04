
'use client';

import { useState, useRef, useEffect } from 'react';
import { ScanLine, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useFirestore } from '@/firebase';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { type Guest } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

type ScanStatus = 'scanning' | 'success' | 'failure' | 'loading';
type ScannedGuest = {
    name: string;
    category: string;
    message?: string;
}

export default function ScannerPage({ params }: { params: { eventId: string } }) {
  const { eventId } = params;
  const router = useRouter();
  const [scanStatus, setScanStatus] = useState<ScanStatus>('scanning');
  const [scannedData, setScannedData] = useState<ScannedGuest | null>(null);
  const firestore = useFirestore();
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
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

  useEffect(() => {
    const getCameraPermission = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setHasCameraPermission(true);
      } catch (error) {
        console.error('Error accessing camera:', error);
        setHasCameraPermission(false);
        toast({
          variant: 'destructive',
          title: 'Camera Access Denied',
          description: 'Please enable camera permissions in your browser settings to use this feature.',
        });
      }
    };
    getCameraPermission();
  }, []);

  useEffect(() => {
    if (scanStatus !== 'scanning') {
      const timer = setTimeout(() => {
        setScanStatus('scanning');
        setScannedData(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [scanStatus]);
  
  // MOCK SCAN FUNCTIONALITY
  const handleScanResult = async (guestIdToSimulate: string) => {
    if (scanStatus === 'scanning') {
      setScanStatus('loading');
      try {
        const guestRef = doc(firestore, 'events', eventId, guestIdToSimulate);
        const guestSnap = await getDoc(guestRef);

        if (!guestSnap.exists()) {
          throw new Error('Guest not found on the guest list.');
        }

        const guest = guestSnap.data() as Guest;
        
        if (guest.hasCheckedIn) {
             setScannedData({ name: guest.name, category: guest.category, message: 'Already Checked In' });
             setScanStatus('failure');
             return;
        }

        await updateDoc(guestRef, {
            hasCheckedIn: true,
            checkInTime: serverTimestamp(),
        });
        
        setScannedData({ name: guest.name, category: guest.category });
        setScanStatus('success');

      } catch (error: any) {
        console.error("Scan validation error:", error);
        setScannedData({ name: 'Invalid Scan', category: '', message: error.message || 'Could not validate ticket.' });
        setScanStatus('failure');
      }
    }
  };
  
  // SIMULATE SCANNING A VALID GUEST
  const simulateValidScan = () => {
    // In a real app, you would have a way to select a guest. For this mock, we'll hardcode one.
    // Replace 'FIRST_GUEST_ID' with an actual guest ID from your Firestore `guests` subcollection for the demo event.
    handleScanResult('GUEST_ID_PLACEHOLDER');
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md mx-auto relative overflow-hidden">
        <CardContent className="p-0">
          <div className="relative aspect-square w-full bg-black">
             <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted playsInline />

            {!hasCameraPermission && (
              <div className="absolute inset-0 flex items-center justify-center p-4 bg-black/80">
                <Alert variant="destructive">
                  <AlertTitle>Camera Access Required</AlertTitle>
                  <AlertDescription>
                    Please allow camera access in your browser settings to use the scanner.
                  </AlertDescription>
                </Alert>
              </div>
            )}

            <div className={cn(
                "absolute inset-0 flex flex-col items-center justify-center p-4 text-center text-white transition-all duration-300",
                scanStatus === 'scanning' && 'bg-black/50',
                scanStatus === 'success' && 'bg-green-500/90',
                scanStatus === 'failure' && 'bg-destructive/90',
                scanStatus === 'loading' && 'bg-black/80 backdrop-blur-sm'
            )}>
                 {scanStatus === 'scanning' && hasCameraPermission && (
                    <>
                        <div className="w-2/3 h-2/3 border-4 border-dashed border-white/50 rounded-lg" />
                        <ScanLine className="absolute w-2/3 h-10 text-primary animate-pulse" />
                        <p className="absolute bottom-4 text-lg font-semibold">Scan Guest's QR Code</p>
                    </>
                 )}
                 {scanStatus === 'loading' && <Loader2 className="h-24 w-24 animate-spin" />}
                 {scanStatus === 'success' && (
                    <>
                        <CheckCircle className="h-32 w-32" />
                        <h2 className="text-4xl font-bold mt-4">Access Granted</h2>
                        <p className="text-xl mt-2">{scannedData?.name}</p>
                        <p className="text-md text-white/80">{scannedData?.category}</p>
                    </>
                 )}
                 {scanStatus === 'failure' && (
                    <>
                        <XCircle className="h-32 w-32" />
                        <h2 className="text-4xl font-bold mt-4">Access Denied</h2>
                        <p className="text-xl mt-2">{scannedData?.message || 'Invalid Ticket'}</p>
                        <p className="text-md text-white/80">{scannedData?.name}</p>
                    </>
                 )}
            </div>
          </div>
        </CardContent>
      </Card>
      {/* Remove this button in a real application */}
      <Button onClick={simulateValidScan} className="mt-4" variant="secondary">Simulate Valid Scan (for testing)</Button>
    </div>
  );
}
