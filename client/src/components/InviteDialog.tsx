import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Check, Copy, Share2, Users, Gift } from 'lucide-react';

/**
 * InviteDialog Component
 *
 * Provides social invite functionality for the billiards training platform.
 * Features:
 * - Generate unique invite link for current user
 * - Copy link to clipboard with visual feedback
 * - Display invite statistics (total invites, accepted)
 * - Social sharing capabilities
 *
 * @param {boolean} open - Controls dialog visibility
 * @param {function} onOpenChange - Callback when dialog open state changes
 */

interface InviteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function InviteDialog({ open, onOpenChange }: InviteDialogProps) {
  const [copied, setCopied] = useState(false);
  const [inviteStats, setInviteStats] = useState({
    totalInvites: 0,
    acceptedInvites: 0,
  });

  // Generate invite link with user's unique referral code
  // TODO: Replace with actual user ID from auth context
  const inviteCode = 'DEMO123'; // Placeholder - should be fetched from backend
  const inviteLink = `${window.location.origin}/register?ref=${inviteCode}`;

  /**
   * Copy invite link to clipboard with visual feedback
   * Uses Clipboard API with fallback error handling
   */
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);

      // Reset copied state after 2 seconds
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error('Failed to copy invite link:', error);
      // Fallback: Select text for manual copy
      const input = document.querySelector('input[value="' + inviteLink + '"]') as HTMLInputElement;
      if (input) {
        input.select();
      }
    }
  };

  /**
   * Share invite link via native share API (mobile-friendly)
   * Falls back to copy if share API unavailable
   */
  const handleShare = async () => {
    const shareData = {
      title: '三个月一杆清台',
      text: '加入我一起练习台球，三个月实现一杆清台！',
      url: inviteLink,
    };

    try {
      // Check if native share is available (primarily mobile)
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback to copy on desktop
        await handleCopyLink();
      }
    } catch (error) {
      // User cancelled share or error occurred
      console.log('Share cancelled or failed:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-emerald-600" />
            邀请好友
          </DialogTitle>
          <DialogDescription>
            邀请好友一起练习，共同进步！每成功邀请一位好友注册，双方都将获得奖励。
          </DialogDescription>
        </DialogHeader>

        {/* Invite Statistics */}
        <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-lg p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">已邀请好友</span>
            <span className="text-lg font-bold text-emerald-700">
              {inviteStats.totalInvites} 人
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">已接受邀请</span>
            <span className="text-lg font-bold text-emerald-700">
              {inviteStats.acceptedInvites} 人
            </span>
          </div>
          <div className="flex items-center gap-2 pt-2 border-t border-emerald-200">
            <Gift className="h-4 w-4 text-amber-600" />
            <span className="text-xs text-gray-600">
              每成功邀请1人，双方各获得 100 经验值奖励
            </span>
          </div>
        </div>

        {/* Invite Link */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-gray-700">
            您的专属邀请链接
          </label>
          <div className="flex gap-2">
            <Input
              value={inviteLink}
              readOnly
              className="flex-1 bg-gray-50 text-sm"
              onClick={(e) => (e.target as HTMLInputElement).select()}
            />
            <Button
              onClick={handleCopyLink}
              variant={copied ? "default" : "outline"}
              size="sm"
              className={copied ? "bg-emerald-600 hover:bg-emerald-700" : ""}
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 mr-1" />
                  已复制
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-1" />
                  复制
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Share Actions */}
        <div className="space-y-2">
          <Button
            onClick={handleShare}
            variant="outline"
            className="w-full"
          >
            <Share2 className="h-4 w-4 mr-2" />
            分享邀请链接
          </Button>

          <p className="text-xs text-center text-gray-500">
            好友通过您的链接注册后，双方都将获得经验值奖励
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
