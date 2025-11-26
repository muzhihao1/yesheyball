import { useState, useCallback } from 'react';
import html2canvas from 'html2canvas';

/**
 * useShareTraining Hook
 *
 * Handles sharing training achievements using html2canvas and Web Share API
 *
 * Features:
 * - Captures ShareCard component as image using html2canvas
 * - Uses Web Share API for native sharing (mobile-friendly)
 * - Fallback to download/save prompt if Web Share API unavailable
 * - Loading and error states
 *
 * Usage:
 * ```tsx
 * const shareCardRef = useRef<HTMLDivElement>(null);
 * const { shareTraining, isSharing, shareError } = useShareTraining();
 *
 * <ShareCard ref={shareCardRef} {...data} />
 * <Button onClick={() => shareTraining(shareCardRef, userData)}>分享成绩</Button>
 * ```
 */

interface ShareTrainingOptions {
  userName: string;
  title?: string;
  text?: string;
}

interface ShareTrainingReturn {
  shareTraining: (
    cardRef: React.RefObject<HTMLDivElement>,
    options: ShareTrainingOptions
  ) => Promise<void>;
  isSharing: boolean;
  shareError: string | null;
  clearError: () => void;
}

export function useShareTraining(): ShareTrainingReturn {
  const [isSharing, setIsSharing] = useState(false);
  const [shareError, setShareError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setShareError(null);
  }, []);

  const shareTraining = useCallback(
    async (
      cardRef: React.RefObject<HTMLDivElement>,
      options: ShareTrainingOptions
    ) => {
      if (!cardRef.current) {
        setShareError('分享卡片未就绪，请稍后再试');
        return;
      }

      setIsSharing(true);
      setShareError(null);

      try {
        // Step 1: Capture the card as canvas
        const canvas = await html2canvas(cardRef.current, {
          scale: 2, // Higher quality
          useCORS: true, // Allow cross-origin images
          backgroundColor: null, // Transparent background
          logging: false, // Disable console logs
        });

        // Step 2: Convert canvas to blob
        const blob = await new Promise<Blob>((resolve, reject) => {
          canvas.toBlob(
            (blob) => {
              if (blob) {
                resolve(blob);
              } else {
                reject(new Error('Failed to convert canvas to blob'));
              }
            },
            'image/png',
            1.0 // Maximum quality
          );
        });

        // Step 3: Try Web Share API (if available)
        if (navigator.share && navigator.canShare) {
          const file = new File([blob], 'training-achievement.png', {
            type: 'image/png',
          });

          const shareData = {
            title: options.title || `${options.userName}的训练成果`,
            text: options.text || `我在"三个月一杆清台"完成了今天的训练！💪`,
            files: [file],
          };

          // Check if sharing is supported
          if (navigator.canShare(shareData)) {
            await navigator.share(shareData);
            console.log('Training achievement shared successfully');
          } else {
            // Fallback: Download the image
            downloadImage(canvas, options.userName);
          }
        } else {
          // Fallback: Download the image
          downloadImage(canvas, options.userName);
        }
      } catch (error: any) {
        // User cancelled share dialog - not an error
        if (error.name === 'AbortError') {
          console.log('Share cancelled by user');
          setShareError(null);
        } else {
          console.error('Error sharing training:', error);
          setShareError(
            error.message || '分享失败，请稍后再试'
          );
        }
      } finally {
        setIsSharing(false);
      }
    },
    []
  );

  return {
    shareTraining,
    isSharing,
    shareError,
    clearError,
  };
}

/**
 * Fallback: Download the canvas as an image file
 */
function downloadImage(canvas: HTMLCanvasElement, userName: string) {
  const link = document.createElement('a');
  const timestamp = new Date().toISOString().slice(0, 10);
  link.download = `${userName}-训练成果-${timestamp}.png`;
  link.href = canvas.toDataURL('image/png', 1.0);
  link.click();

  // Show user-friendly message
  alert(
    '分享图片已保存到下载文件夹！\n您可以在微信、朋友圈等平台分享这张图片。'
  );
}
