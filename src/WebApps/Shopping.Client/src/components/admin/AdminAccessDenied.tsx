"use client";

import React from "react";
import Link from "next/link";
import { ShieldAlert, ArrowLeft, LogOut, CheckCircle2, Terminal, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SignOutButton } from "@clerk/nextjs";

interface Props {
  user: any;
}

export function AdminAccessDenied({ user }: Props) {
  const email = user?.primaryEmailAddress?.emailAddress || user?.emailAddresses?.[0]?.emailAddress || "Chưa xác định";
  const displayName = user?.fullName || user?.firstName || user?.username || "Tài khoản";
  const currentRole = (user?.publicMetadata?.role as string) || (user?.unsafeMetadata?.role as string) || "Customer (Khách hàng)";

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-amber-500 to-rose-500 p-6 text-white flex items-center gap-4">
          <div className="p-3 bg-white/20 backdrop-blur rounded-xl">
            <ShieldAlert className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Yêu cầu quyền Quản trị viên (Admin Access Required)</h1>
            <p className="text-amber-100 text-xs mt-0.5">
              Tài khoản hiện tại không có quyền truy cập vào cổng quản trị Microservices.
            </p>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 md:p-8 space-y-6">
          {/* User Profile Info Card */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Thông tin tài khoản đang đăng nhập
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
              <div>
                <span className="text-xs text-muted-foreground block">Tên người dùng:</span>
                <span className="font-semibold text-slate-800">{displayName}</span>
              </div>
              <div>
                <span className="text-xs text-muted-foreground block">Email:</span>
                <span className="font-semibold text-slate-800 break-all">{email}</span>
              </div>
              <div>
                <span className="text-xs text-muted-foreground block">Vai trò hiện tại:</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-200 text-slate-700">
                  {currentRole}
                </span>
              </div>
            </div>
          </div>

          {/* How to get Admin rights */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              Cách cấp quyền Quản trị viên (Admin) cho tài khoản này:
            </h3>

            <div className="space-y-3 text-xs text-slate-700">
              {/* Option 1: .env.local */}
              <div className="p-3.5 rounded-lg border border-amber-200 bg-amber-50/60 space-y-1.5">
                <div className="font-bold text-amber-900 flex items-center gap-1.5">
                  <Terminal className="h-3.5 w-3.5" />
                  Cách 1 (Nhanh nhất khi chạy Local): Cấu hình file .env.local
                </div>
                <p className="text-slate-600">
                  Mở file <code className="px-1.5 py-0.5 bg-amber-100 rounded text-amber-900 font-mono font-bold">WebApps/Shopping.Client/.env.local</code> và thêm dòng:
                </p>
                <div className="p-2 bg-slate-900 text-amber-300 font-mono text-[11px] rounded select-all break-all">
                  ADMIN_EMAILS={email}
                </div>
                <p className="text-slate-500 text-[11px]">
                  Sau đó lưu file và khởi động lại dev server (nếu cần).
                </p>
              </div>

              {/* Option 2: Clerk Dashboard */}
              <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50 space-y-1.5">
                <div className="font-bold text-slate-800 flex items-center gap-1.5">
                  <ExternalLink className="h-3.5 w-3.5 text-primary" />
                  Cách 2 (Chuẩn Clerk): Cấp role trong Clerk Dashboard
                </div>
                <p className="text-slate-600">
                  Vào <strong>Clerk Dashboard</strong> &gt; <strong>Users</strong> &gt; Chọn tài khoản <strong>{email}</strong> &gt; mục <strong>Metadata</strong> &gt; <strong>Public metadata</strong>, điền:
                </p>
                <div className="p-2 bg-slate-900 text-emerald-400 font-mono text-[11px] rounded select-all">
                  {`{ "role": "admin" }`}
                </div>
              </div>

              {/* Option 3: Admin email */}
              <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50 space-y-1">
                <span className="font-bold text-slate-800">
                  Cách 3: Đăng nhập bằng tài khoản có email quản trị
                </span>
                <p className="text-slate-600">
                  Tài khoản có email bắt đầu bằng <code className="px-1 py-0.5 bg-slate-200 rounded font-mono">admin@...</code> (ví dụ: <code className="px-1 py-0.5 bg-slate-200 rounded font-mono">admin@eshop.com</code>) sẽ tự động được nhận diện là Admin.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t flex flex-col sm:flex-row items-center justify-between gap-3">
            <Link href="/" className="w-full sm:w-auto">
              <Button variant="outline" className="w-full sm:w-auto gap-2 text-xs font-semibold">
                <ArrowLeft className="h-3.5 w-3.5" />
                Quay lại Cửa hàng
              </Button>
            </Link>

            <SignOutButton redirectUrl="/sign-in?redirect_url=/admin">
              <Button variant="destructive" className="w-full sm:w-auto gap-2 text-xs font-semibold">
                <LogOut className="h-3.5 w-3.5" />
                Đăng xuất / Đổi tài khoản khác
              </Button>
            </SignOutButton>
          </div>
        </div>
      </div>
    </div>
  );
}

