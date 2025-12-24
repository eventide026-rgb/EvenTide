
'use client';

import { useState, useRef, useEffect } from 'react';
import { QrCode, ScanLine, CheckCircle, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';

type ScanStatus = 'scanning' | 'success' | 'failure';

export default function ScannerPage({ params }: { params: { eventId: string } }) {
  const [scanStatus, setScanStatus] = useState<ScanStatus>('scanning');
  const [scannedData, setScannedData] = useState<string | null>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    const getCameraPermission = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        setHasCameraPermission(true);

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error('Error accessing camera:', error);
        setHasCameraPermission(false);
        toast({
          variant: 'destructive',
          title: 'Camera Access Denied',
          description: 'Please enable camera permissions in your browser settings to use the scanner.',
        });
      }
    };

    getCameraPermission();

    // Cleanup: Stop the camera stream when the component unmounts
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [toast]);

  // Mock scanning logic for demonstration
  useEffect(() => {
    if (scanStatus !== 'scanning') {
      const timer = setTimeout(() => {
        setScanStatus('scanning');
        setScannedData(null);
      }, 3000); // Reset after 3 seconds
      return () => clearTimeout(timer);
    }
  }, [scanStatus]);

  // This would be replaced with a real QR code scanning library
  const handleMockScan = (result: 'success' | 'failure') => {
    if (result === 'success') {
      setScannedData('Guest: Adebayo Tunde');
      setScanStatus('success');
    } else {
      setScannedData('Reason: Already Checked In');
      setScanStatus('failure');
    }
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md mx-auto relative overflow-hidden">
        <CardContent className="p-0">
          <div className="relative aspect-square w-full bg-black">
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              autoPlay
              playsInline
              muted
            />

            {/* Scanning overlay */}
            {scanStatus === 'scanning' && hasCameraPermission && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50">
                <div className="w-2/3 h-2/3 border-4 border-dashed border-white/50 rounded-lg" />
                <ScanLine className="absolute w-2/3 h-10 text-primary animate-pulse" />
                <p className="absolute bottom-4 text-white text-lg font-semibold">Position QR Code in Frame</p>
              </div>
            )}

             {/* No Camera Permission Overlay */}
            {hasCameraPermission === false && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 text-white p-4">
                    <Alert variant="destructive" className='text-center'>
                        <AlertTitle>Camera Access Required</AlertTitle>
                        <AlertDescription>
                            Please grant camera permissions in your browser settings to activate the scanner.
                        </AlertDescription>
                    </Alert>
                </div>
            )}

            {/* Success Overlay */}
            {scanStatus === 'success' && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-green-500/90 text-white">
                <CheckCircle className="h-32 w-32" />
                <h2 className="text-4xl font-bold mt-4">Access Granted</h2>
                <p className="text-xl mt-2">{scannedData}</p>
              </div>
            )}

            {/* Failure Overlay */}
            {scanStatus === 'failure' && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-destructive/90 text-white">
                <XCircle className="h-32 w-32" />
                <h2 className="text-4xl font-bold mt-4">Access Denied</h2>
                <p className="text-xl mt-2">{scannedData}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Mock controls for demo */}
      <div className="mt-4 flex gap-4">
        <Button onClick={() => handleMockScan('success')}>Simulate Success</Button>
        <Button variant="destructive" onClick={() => handleMockScan('failure')}>Simulate Failure</Button>
      </div>
    </div>
  );
}
