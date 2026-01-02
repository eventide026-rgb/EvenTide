
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useFirestore, useUser } from '@/firebase';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { getStorage, ref, uploadString, getDownloadURL } from 'firebase/storage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Upload, Image as ImageIcon } from 'lucide-react';
import { Progress } from './ui/progress';
import Image from 'next/image';

type ImageUploaderProps = {
  eventId: string;
};

export function ImageUploader({ eventId }: ImageUploaderProps) {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [preview, setPreview] = useState<string | null>(null);
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFileToUpload(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    if (!fileToUpload || !user || !firestore) {
      toast({
        variant: 'destructive',
        title: 'Upload failed',
        description: 'No file selected or user not logged in.',
      });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    const storage = getStorage();
    const filePath = `events/${eventId}/media/${user.uid}_${Date.now()}_${fileToUpload.name}`;
    const storageRef = ref(storage, filePath);

    const reader = new FileReader();
    reader.readAsDataURL(fileToUpload);
    reader.onload = async (event) => {
        const dataUrl = event.target?.result as string;

        try {
            // Upload the file as a data URL string.
            const uploadTask = await uploadString(storageRef, dataUrl, 'data_url');
            setUploadProgress(100); // Simulate completion after uploadString finishes

            const downloadURL = await getDownloadURL(uploadTask.ref);

            // Add media document to Firestore
            await addDoc(collection(firestore, 'events', eventId, 'media'), {
                fileUrl: downloadURL,
                uploaderId: user.uid,
                uploaderName: user.displayName || user.email,
                uploadTimestamp: serverTimestamp(),
                mediaType: fileToUpload.type.startsWith('image/') ? 'photo' : 'video',
            });

            toast({
                title: 'Upload complete!',
                description: 'Your photo has been added to the gallery.',
            });

            // Reset state
            setPreview(null);
            setFileToUpload(null);

        } catch (error) {
            console.error('Error uploading file:', error);
            toast({
                variant: 'destructive',
                title: 'Upload failed',
                description: 'Could not upload your file. Please try again.',
            });
        } finally {
            setIsUploading(false);
        }
    };
  };

  return (
    <div className="space-y-4">
      <Input id="image-upload" type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
      <label htmlFor="image-upload" className="cursor-pointer">
        <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary transition-colors">
            {preview ? (
                <div className="relative w-32 h-32 mx-auto">
                     <Image src={preview} alt="Image preview" fill className="object-cover rounded-md" />
                </div>
            ) : (
                <div className="flex flex-col items-center text-muted-foreground">
                    <ImageIcon className="h-10 w-10 mb-2" />
                    <p>Click or tap to select a photo</p>
                </div>
            )}
        </div>
      </label>

      {isUploading && (
        <div className="flex items-center gap-2">
            <Progress value={uploadProgress} className="w-full" />
            <span>{uploadProgress}%</span>
        </div>
      )}
      
      {fileToUpload && !isUploading && (
        <div className="flex gap-2">
            <Button onClick={handleUpload} className="w-full">
                <Upload className="mr-2 h-4 w-4" /> Upload Photo
            </Button>
             <Button variant="outline" onClick={() => { setPreview(null); setFileToUpload(null); }}>
                Cancel
            </Button>
        </div>
      )}
    </div>
  );
}
