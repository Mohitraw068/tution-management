'use client';

import { useState, useRef, useEffect } from 'react';

interface MobileQRScannerProps {
  onScan: (data: string) => void;
  onClose: () => void;
  isOpen: boolean;
}

export function MobileQRScanner({ onScan, onClose, isOpen }: MobileQRScannerProps) {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [error, setError] = useState<string>('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isOpen]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment', // Use back camera on mobile
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setHasPermission(true);
        setError('');
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      setHasPermission(false);
      setError('Camera access denied or not available');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const handleManualEntry = () => {
    const data = prompt('Enter attendance code manually:');
    if (data) {
      onScan(data);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-black text-white">
        <h2 className="text-lg font-semibold">Scan QR Code</h2>
        <button
          onClick={onClose}
          className="p-2 rounded-lg hover:bg-gray-800 min-h-[44px] min-w-[44px]"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Scanner Area */}
      <div className="flex-1 relative">
        {hasPermission === null && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-white text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
              <p>Requesting camera access...</p>
            </div>
          </div>
        )}

        {hasPermission === false && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-white text-center p-6">
              <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9l18-6m0 0v6m0-6h-6" />
              </svg>
              <h3 className="text-lg font-semibold mb-2">Camera Access Required</h3>
              <p className="text-gray-300 mb-4">{error}</p>
              <button
                onClick={startCamera}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 min-h-[44px]"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {hasPermission && (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />

            {/* Scanner Overlay */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative">
                {/* Scanner Frame */}
                <div className="w-64 h-64 border-2 border-white rounded-lg relative">
                  {/* Corner indicators */}
                  <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-blue-500 rounded-tl-lg"></div>
                  <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-blue-500 rounded-tr-lg"></div>
                  <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-blue-500 rounded-bl-lg"></div>
                  <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-blue-500 rounded-br-lg"></div>

                  {/* Scanning line animation */}
                  <div className="absolute top-0 left-0 w-full h-1 bg-blue-500 animate-pulse"></div>
                </div>

                <p className="text-white text-center mt-4">
                  Position the QR code within the frame
                </p>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Bottom Actions */}
      <div className="p-4 bg-black">
        <div className="flex justify-center space-x-4">
          <button
            onClick={handleManualEntry}
            className="flex items-center px-6 py-3 bg-gray-800 text-white rounded-lg font-medium hover:bg-gray-700 min-h-[44px]"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
            Manual Entry
          </button>

          <button
            onClick={() => {
              // Toggle flashlight (if supported)
              if (streamRef.current) {
                const track = streamRef.current.getVideoTracks()[0];
                if (track && 'torch' in track.getCapabilities()) {
                  const constraints = track.getConstraints();
                  track.applyConstraints({
                    ...constraints,
                    advanced: [{ torch: !constraints.advanced?.[0]?.torch }]
                  });
                }
              }
            }}
            className="flex items-center px-6 py-3 bg-gray-800 text-white rounded-lg font-medium hover:bg-gray-700 min-h-[44px]"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            Flash
          </button>
        </div>

        <p className="text-gray-400 text-sm text-center mt-3">
          Scan the QR code displayed by your teacher to mark attendance
        </p>
      </div>
    </div>
  );
}