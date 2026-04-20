'use client';

import { useState, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Send, FileText, Film, StickyNote } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

interface RequestDialogProps {
  children: ReactNode;
}

const contentTypeOptions = [
  { value: 'movie', label: 'فيلم' },
  { value: 'series', label: 'مسلسل' },
  { value: 'anime', label: 'أنمي' },
];

export default function RequestDialog({ children }: RequestDialogProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [type, setType] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !type) {
      toast.error('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    setIsSubmitting(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSubmitting(false);

    toast.success('تم إرسال الطلب بنجاح!', {
      description: 'سنحاول إضافة المحتوى المطلوب في أقرب وقت.',
    });

    setTitle('');
    setType('');
    setNotes('');
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-md border-white/10 bg-[#12121a]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-white">
            <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-600/20">
              <FileText className="size-4 text-emerald-400" />
            </div>
            طلب فيلم أو مسلسل
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            لا تجد ما تبحث عنه؟ أرسل طلبك وسنضيفه لك
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="request-title" className="text-sm text-gray-300">
              <Film className="ml-1 inline size-3" />
              اسم الفيلم أو المسلسل
            </Label>
            <Input
              id="request-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="مثال: Inception - بداية"
              className="border-white/10 bg-[#0a0a0f] text-white placeholder:text-gray-600 focus:border-emerald-500/50 focus:ring-emerald-500/20"
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label className="text-sm text-gray-300">
              <Film className="ml-1 inline size-3" />
              نوع المحتوى
            </Label>
            <Select value={type} onValueChange={setType} required>
              <SelectTrigger className="w-full border-white/10 bg-[#0a0a0f] text-white focus:border-emerald-500/50 focus:ring-emerald-500/20">
                <SelectValue placeholder="اختر النوع" />
              </SelectTrigger>
              <SelectContent className="border-white/10 bg-[#12121a]">
                {contentTypeOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value} className="text-gray-300 focus:bg-emerald-600/20 focus:text-white">
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="request-notes" className="text-sm text-gray-300">
              <StickyNote className="ml-1 inline size-3" />
              ملاحظات إضافية (اختياري)
            </Label>
            <Textarea
              id="request-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="أي معلومات إضافية مثل السنة، الممثلين..."
              rows={3}
              className="border-white/10 bg-[#0a0a0f] text-white placeholder:text-gray-600 focus:border-emerald-500/50 focus:ring-emerald-500/20 resize-none"
            />
          </div>

          <motion.div whileTap={{ scale: 0.97 }}>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-emerald-600 text-white hover:bg-emerald-700"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <div className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  جارٍ الإرسال...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Send className="size-4" />
                  إرسال الطلب
                </span>
              )}
            </Button>
          </motion.div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
