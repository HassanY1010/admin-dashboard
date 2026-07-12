import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Copy, Key } from "lucide-react";
import adminApi from "@/lib/admin-api";
import { formatDate } from "@/lib/utils";

interface User {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  isActive: boolean;
  lastLoginAt?: string;
  role?: string;
  passwordResetCount?: number;
  lastPasswordResetAt?: string;
  lastPasswordResetById?: string;
  tempPasswordExpiry?: string;
  tempPasswordHash?: string;
}

interface ResetPasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
  onSuccess?: () => void;
}

export function ResetPasswordDialog({
  open,
  onOpenChange,
  user,
  onSuccess,
}: ResetPasswordDialogProps) {
  const [passwordType, setPasswordType] = useState<"random" | "manual">("random");
  const [customPassword, setCustomPassword] = useState("");
  const [forceChange, setForceChange] = useState(true);
  const [expiryHours, setExpiryHours] = useState(24);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState("");

  if (!user) return null;

  // Generate random 8 character alphanumeric password
  const generateRandomPassword = () => {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$";
    let pass = "";
    for (let i = 0; i < 8; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return pass;
  };

  const handleReset = async () => {
    let finalPassword = "";
    if (passwordType === "random") {
      finalPassword = generateRandomPassword();
    } else {
      if (customPassword.trim().length < 6) {
        toast.error("يجب أن تكون كلمة المرور 6 خانات على الأقل");
        return;
      }
      finalPassword = customPassword.trim();
    }

    setIsSubmitting(true);
    try {
      await adminApi.resetUserPassword(user.id, {
        customPassword: finalPassword,
        forcePasswordChange: forceChange,
        expiryHours: expiryHours,
      });

      setGeneratedPassword(finalPassword);
      toast.success("تم تعيين كلمة المرور المؤقتة بنجاح");
      if (onSuccess) onSuccess();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "فشل إعادة تعيين كلمة المرور");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedPassword);
    toast.success("تم نسخ كلمة المرور");
  };

  // Determine temp password status
  const getTempPasswordStatus = () => {
    if (!user.tempPasswordExpiry) return "غير نشطة (لم يتم التعيين)";
    const expiry = new Date(user.tempPasswordExpiry);
    const now = new Date();
    if (now > expiry) return "منتهية الصلاحية 🔴";
    return "فعالة ونشطة 🟢";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md text-right">
        <div dir="rtl" className="space-y-4">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl font-bold text-teal-800">
              <Key className="w-5 h-5 text-teal-600" />
              إعادة تعيين كلمة مرور المستخدم
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              تحديث وإدارة كلمات المرور المؤقتة للمستخدمين مع تدقيق الحسابات
            </DialogDescription>
          </DialogHeader>

          {/* User Metadata */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2 text-sm text-slate-700">
            <div className="flex justify-between">
              <span className="font-semibold text-slate-500">الاسم:</span>
              <span>{user.fullName}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold text-slate-500">رقم الهاتف:</span>
              <span dir="ltr">{user.phoneNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold text-slate-500">البريد الإلكتروني:</span>
              <span>{user.email}</span>
            </div>
            <div className="border-t border-slate-200/60 my-2 pt-2 flex justify-between">
              <span className="font-semibold text-slate-500">حالة كلمة المرور المؤقتة:</span>
              <span>{getTempPasswordStatus()}</span>
            </div>
            {user.lastPasswordResetAt && (
              <div className="flex justify-between text-xs text-slate-500">
                <span>آخر تصفير:</span>
                <span>{formatDate(user.lastPasswordResetAt)}</span>
              </div>
            )}
          </div>

          {generatedPassword ? (
            /* Success State showing generated password */
            <div className="bg-teal-50 p-5 rounded-xl border border-teal-200 text-center space-y-4">
              <h4 className="font-bold text-teal-900 text-base">تم تعيين كلمة المرور بنجاح!</h4>
              <p className="text-sm text-teal-700">
                يرجى نسخ كلمة المرور المؤقتة وإرسالها للمستخدم. تنتهي صلاحية الكلمة بعد {expiryHours} ساعة.
              </p>
              <div className="flex items-center justify-between bg-white border border-teal-200 rounded-lg p-3 max-w-xs mx-auto">
                <span className="font-mono font-bold text-lg text-teal-950 tracking-wider">
                  {generatedPassword}
                </span>
                <Button size="icon" variant="ghost" className="h-8 w-8 text-teal-600 hover:bg-teal-50" onClick={handleCopy}>
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
              <div className="text-xs text-teal-600/80">
                * سيُطلب من المستخدم تغيير كلمة المرور عند أول تسجيل دخول.
              </div>
            </div>
          ) : (
            /* Settings Form */
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="font-semibold text-slate-700 text-sm">طريقة إنشاء كلمة المرور:</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer text-sm">
                    <input
                      type="radio"
                      checked={passwordType === "random"}
                      onChange={() => setPasswordType("random")}
                    />
                    <span>توليد عشوائي آمن</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-sm">
                    <input
                      type="radio"
                      checked={passwordType === "manual"}
                      onChange={() => setPasswordType("manual")}
                    />
                    <span>إدخال يدوي</span>
                  </label>
                </div>
              </div>

              {passwordType === "manual" && (
                <div className="space-y-2">
                  <label htmlFor="custom-password" className="text-sm font-medium text-slate-700">كلمة المرور المؤقتة:</label>
                  <input
                    id="custom-password"
                    value={customPassword}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCustomPassword(e.target.value)}
                    placeholder="مثال: TempPass123"
                    className="w-full p-2 border rounded-md font-mono text-left"
                  />
                </div>
              )}

              {/* Checkboxes */}
              <div className="space-y-3 border-t pt-3">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="force-change"
                    checked={forceChange}
                    onChange={(e) => setForceChange(e.target.checked)}
                    className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                  />
                  <label htmlFor="force-change" className="text-sm cursor-pointer text-slate-700">
                    إجبار المستخدم على تغيير كلمة المرور عند أول تسجيل دخول
                  </label>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">مدة صلاحية الكلمة المؤقتة:</label>
                  <select
                    value={expiryHours}
                    onChange={(e) => setExpiryHours(Number(e.target.value))}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 text-sm"
                  >
                    <option value={24}>24 ساعة (يوم واحد)</option>
                    <option value={48}>48 ساعة (يومين)</option>
                    <option value={72}>72 ساعة (3 أيام)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="mt-4 flex gap-2">
            {generatedPassword ? (
              <Button className="w-full" onClick={() => onOpenChange(false)}>
                إغلاق
              </Button>
            ) : (
              <>
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                  إلغاء
                </Button>
                <Button
                  className="bg-teal-700 hover:bg-teal-800 text-white flex-1"
                  disabled={isSubmitting}
                  onClick={handleReset}
                >
                  {isSubmitting ? "جاري التعيين..." : "إعادة التعيين والتوليد"}
                </Button>
              </>
            )}
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
