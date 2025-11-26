import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UserPlus, Copy, Check, Gift, Link as LinkIcon } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getAuthHeaders } from '@/lib/auth-headers';

/**
 * InviteCard Component
 *
 * Displays invitation functionality for users to invite friends
 *
 * Features:
 * - Unique invitation link/code
 * - QR code for easy sharing
 * - Reward rules explanation
 * - Copy-to-clipboard functionality
 * - Loading and error states
 *
 * Used in Profile page
 */

interface InviteData {
  inviteCode: string;
  inviteUrl: string;
  rewards: {
    referrer: string;
    referred: string;
  };
}

export function InviteCard() {
  const [copied, setCopied] = useState(false);

  // Fetch user's invite code
  const { data: inviteData, isLoading, error } = useQuery<InviteData>({
    queryKey: ['/api/user/invite-code'],
    queryFn: async () => {
      const authHeaders = await getAuthHeaders();
      const response = await fetch('/api/user/invite-code', {
        headers: {
          ...authHeaders,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch invite code');
      }

      return response.json();
    },
  });

  const handleCopy = async () => {
    if (!inviteData?.inviteUrl) return;

    try {
      await navigator.clipboard.writeText(inviteData.inviteUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy invite link:', error);
      alert('复制失败，请手动复制链接');
    }
  };

  if (isLoading) {
    return (
      <Card className="shadow-lg">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
          <CardTitle className="flex items-center gap-2 text-purple-700 dark:text-purple-300">
            <UserPlus className="w-5 h-5" />
            邀请好友
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !inviteData) {
    return (
      <Card className="shadow-lg">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
          <CardTitle className="flex items-center gap-2 text-purple-700 dark:text-purple-300">
            <UserPlus className="w-5 h-5" />
            邀请好友
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <p className="text-gray-600 dark:text-gray-400 text-center py-4">
            暂时无法加载邀请信息，请稍后再试
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow">
      <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
        <CardTitle className="flex items-center gap-2 text-purple-700 dark:text-purple-300">
          <UserPlus className="w-5 h-5" />
          邀请好友
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {/* Rewards Section */}
        <div className="bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 p-4 rounded-lg border-2 border-yellow-200 dark:border-yellow-800">
          <div className="flex items-start gap-3">
            <Gift className="w-6 h-6 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-1" />
            <div>
              <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">
                邀请奖励
              </h4>
              <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                  好友完成首次训练：您获得 <strong className="text-yellow-600 dark:text-yellow-400">500 XP</strong>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                  好友获得 <strong className="text-yellow-600 dark:text-yellow-400">300 XP</strong> 新手奖励
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                  好友完成 7 天挑战：双方各获得 <strong className="text-yellow-600 dark:text-yellow-400">1000 XP</strong>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Invite Code/Link Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              您的邀请码
            </h4>
            <span className="text-2xl font-bold text-purple-600 dark:text-purple-400 font-mono">
              {inviteData.inviteCode}
            </span>
          </div>

          {/* Invite Link */}
          <div className="flex gap-2">
            <div className="flex-1 bg-gray-100 dark:bg-gray-800 px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 font-mono text-sm text-gray-700 dark:text-gray-300 overflow-hidden text-ellipsis whitespace-nowrap">
              {inviteData.inviteUrl}
            </div>
            <Button
              onClick={handleCopy}
              size="default"
              variant={copied ? 'default' : 'outline'}
              className={copied ? 'bg-green-600 hover:bg-green-700 text-white' : ''}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  已复制
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-2" />
                  复制链接
                </>
              )}
            </Button>
          </div>
        </div>

        {/* QR Code Section */}
        <div className="flex flex-col items-center gap-3 p-6 bg-white dark:bg-gray-800 rounded-lg border-2 border-gray-200 dark:border-gray-700">
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            扫码邀请好友
          </h4>
          <div className="bg-white p-4 rounded-lg">
            <QRCodeSVG
              value={inviteData.inviteUrl}
              size={200}
              level="H"
              includeMargin={true}
              imageSettings={{
                src: '/logo.png', // Optional: Add logo in center (if exists)
                height: 40,
                width: 40,
                excavate: true,
              }}
            />
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            好友扫描二维码即可注册并绑定邀请关系
          </p>
        </div>

        {/* How to Use */}
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="flex items-start gap-3">
            <LinkIcon className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-gray-700 dark:text-gray-300">
              <p className="font-semibold mb-2">如何邀请好友？</p>
              <ol className="list-decimal list-inside space-y-1 text-sm">
                <li>复制邀请链接或保存二维码</li>
                <li>分享给好友（微信、朋友圈、QQ等）</li>
                <li>好友通过链接/二维码注册即可</li>
                <li>好友完成首次训练后，双方都获得奖励</li>
              </ol>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
