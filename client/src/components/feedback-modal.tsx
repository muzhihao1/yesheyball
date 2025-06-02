import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface FeedbackData {
  feedback: string;
  encouragement: string;
  tips: string;
  rating: number;
}

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  feedback: FeedbackData | null;
  taskTitle?: string;
  userRating?: number;
  expGained?: number;
}

export default function FeedbackModal({ 
  isOpen, 
  onClose, 
  feedback, 
  taskTitle, 
  userRating = 0,
  expGained = 0 
}: FeedbackModalProps) {
  if (!feedback) return null;

  const renderStars = (rating: number) => {
    return [...Array(5)].map((_, index) => (
      <span 
        key={index}
        className={`text-xl ${index < rating ? 'text-trophy-gold' : 'text-gray-300'}`}
      >
        ⭐
      </span>
    ));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto">
        <div className="text-center">
          <div className="w-16 h-16 gradient-billiards rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-2xl">🏆</span>
          </div>
          
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-green-700 mb-2">
              任务完成！
            </DialogTitle>
          </DialogHeader>
          
          {taskTitle && (
            <p className="text-sm text-gray-600 mb-4">{taskTitle}</p>
          )}
          
          {/* User Rating */}
          <div className="flex justify-center mb-4">
            {renderStars(userRating)}
          </div>
          
          {/* AI Feedback */}
          <div className="bg-green-50 rounded-lg p-4 mb-6 text-left">
            <h4 className="font-bold text-green-700 mb-2 flex items-center">
              <span className="mr-2">🤖</span>AI 训练师点评
            </h4>
            <p className="text-gray-700 text-sm mb-3">{feedback.feedback}</p>
            <p className="text-green-600 text-sm font-medium mb-2">{feedback.encouragement}</p>
            <p className="text-blue-600 text-sm">💡 {feedback.tips}</p>
          </div>
          
          {/* Rewards */}
          <div className="flex justify-center space-x-6 mb-6">
            <div className="text-center">
              <div className="text-lg font-bold text-trophy-gold">+{expGained}</div>
              <div className="text-xs text-gray-500">经验值</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-green-600">+1</div>
              <div className="text-xs text-gray-500">任务完成</div>
            </div>
          </div>
          
          <Button 
            onClick={onClose}
            className="w-full bg-billiards-green hover:bg-green-700 text-white"
          >
            继续训练
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
