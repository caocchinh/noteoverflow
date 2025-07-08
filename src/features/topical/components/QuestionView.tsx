import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const QuestionView = ({
  isOpen,
  setIsOpen,
}: {
  isOpen: {
    isOpen: boolean;
    questionId: string;
  };
  setIsOpen: (open: { isOpen: boolean; questionId: string }) => void;
}) => {
  return (
    <Dialog
      open={isOpen.isOpen}
      onOpenChange={(open) =>
        setIsOpen({ isOpen: open, questionId: isOpen.questionId })
      }
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Question {isOpen.questionId}</DialogTitle>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

export default QuestionView;
