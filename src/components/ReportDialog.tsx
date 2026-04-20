'use client';

import { useState, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Send, User, Mail, MessageSquare } from 'lucide-react';
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
import { toast } from 'sonner';

interface ReportDialogProps {
  children: ReactNode;
}

export default function ReportDialog({ children }: ReportDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !email.trim() || !message.trim()) {
      toast.error('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    setIsSubmitting(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSubmitting(false);

    toast.success('تم إرسال البلاغ بنجاح! شكراً لك.', {
      description: 'سنقوم بمراجعة الرابط وإصلاحه في أقرب وقت.',
    });

    setName('');
    setEmail('');
    setMessage('');
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-md border-white/10 bg-[#12121a]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-white">
            <div className="flex size-8 items-center justify-center rounded-lg bg-amber-600/20">
              <MessageSquare className="size-4 text-amber-400" />
            </div>
            إبلاغ عن رابط معطل
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            شاركنا تفاصيل المشكلة وسنعمل على إصلاحها فوراً
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="report-name" className="text-sm text-gray-300">
              <User className="ml-1 inline size-3" />
              الاسم
            </Label>
            <Input
              id="report-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="اسمك"
              className="border-white/10 bg-[#0a0a0f] text-white placeholder:text-gray-600 focus:border-emerald-500/50 focus:ring-emerald-500/20"
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="report-email" className="text-sm text-gray-300">
              <Mail className="ml-1 inline size-3" />
              البريد الإلكتروني
            </Label>
            <Input
              id="report-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="بريدك الإلكتروني"
              className="border-white/10 bg-[#0a0a0f] text-white placeholder:text-gray-600 focus:border-emerald-500/50 focus:ring-emerald-500/20"
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="report-message" className="text-sm text-gray-300">
              <MessageSquare className="ml-1 inline size-3" />
              تفاصيل المشكلة
            </Label>
            <Textarea
              id="report-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="صف المشكلة التي تواجهها..."
              rows={4}
              className="border-white/10 bg-[#0a0a0f] text-white placeholder:text-gray-600 focus:border-emerald-500/50 focus:ring-emerald-500/20 resize-none"
              required
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
                  إرسال البلاغ
                </span>
              )}
            </Button>
          </motion.div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
