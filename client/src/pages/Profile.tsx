import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { AlertCircle, CheckCircle2, Loader2, ShieldCheck, UserCircle2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

export default function Profile() {
  const { user, loading, refresh } = useAuth({ redirectOnUnauthenticated: true });
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [savedMessage, setSavedMessage] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const utils = trpc.useUtils();

  useEffect(() => {
    if (!user) return;
    setName(user.name ?? "");
    setEmail(user.email ?? "");
  }, [user]);

  const normalizedName = name.trim();
  const normalizedEmail = email.trim();
  const isDirty = useMemo(() => {
    if (!user) return false;
    return normalizedName !== (user.name ?? "") || normalizedEmail !== (user.email ?? "");
  }, [normalizedEmail, normalizedName, user]);

  const updateProfileMutation = trpc.auth.updateProfile.useMutation({
    onSuccess: async () => {
      setSavedMessage("资料已保存，侧边栏与欢迎信息会同步刷新。");
      setFormError(null);
      await utils.auth.me.invalidate();
      await refresh();
    },
    onError: (error) => {
      setFormError(error.message || "保存失败，请稍后重试。");
      setSavedMessage(null);
    },
  });

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSavedMessage(null);

    if (!normalizedName) {
      setFormError("请输入姓名后再保存。");
      return;
    }

    if (normalizedEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setFormError("请输入有效邮箱地址。");
      return;
    }

    await updateProfileMutation.mutateAsync({
      name: normalizedName,
      email: normalizedEmail || null,
    });
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <section className="rounded-3xl border border-emerald-500/20 bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.18),_rgba(15,23,42,0.94)_40%,_rgba(2,6,23,1)_100%)] p-8 shadow-2xl shadow-emerald-950/30">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="space-y-3">
              <p className="text-sm uppercase tracking-[0.3em] text-emerald-300/80">Profile Center</p>
              <h1 className="text-3xl font-semibold tracking-tight text-white">账号资料与身份信息</h1>
              <p className="max-w-2xl text-sm leading-6 text-slate-300">
                在这里可以查看当前登录身份，并更新平台内展示的姓名与邮箱。保存后，项目列表页、侧边栏和后续业务记录会继续复用最新资料。
              </p>
            </div>
            <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-slate-950/40 px-5 py-4 backdrop-blur">
              <div className="rounded-2xl bg-emerald-500/10 p-3 text-emerald-300">
                <UserCircle2 className="h-8 w-8" />
              </div>
              <div className="space-y-1">
                <p className="text-sm text-slate-400">当前角色</p>
                <p className="text-base font-medium text-white">{user.role === "admin" ? "管理员" : "普通用户"}</p>
              </div>
            </div>
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
          <Card className="border-slate-800 bg-slate-950/70 shadow-xl shadow-black/20">
            <CardHeader>
              <CardTitle className="text-white">编辑个人资料</CardTitle>
              <CardDescription className="text-slate-400">
                修改后会通过受保护接口保存到用户表，并同步刷新当前会话中的展示信息。
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="space-y-2">
                  <Label htmlFor="profile-name" className="text-slate-200">姓名</Label>
                  <Input
                    id="profile-name"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="请输入展示名称"
                    className="border-slate-800 bg-slate-900/70 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="profile-email" className="text-slate-200">邮箱</Label>
                  <Input
                    id="profile-email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="name@example.com"
                    className="border-slate-800 bg-slate-900/70 text-white"
                  />
                  <p className="text-xs text-slate-500">
                    邮箱字段可留空。若填写，将用于侧边栏资料展示与后续业务记录。
                  </p>
                </div>

                {formError ? (
                  <Alert variant="destructive" className="border-red-500/40 bg-red-950/30 text-red-100">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>保存失败</AlertTitle>
                    <AlertDescription>{formError}</AlertDescription>
                  </Alert>
                ) : null}

                {savedMessage ? (
                  <Alert className="border-emerald-500/30 bg-emerald-500/10 text-emerald-50">
                    <CheckCircle2 className="h-4 w-4" />
                    <AlertTitle>保存成功</AlertTitle>
                    <AlertDescription>{savedMessage}</AlertDescription>
                  </Alert>
                ) : null}

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm text-slate-500">
                    {isDirty ? "您有未保存的资料修改。" : "当前资料已与数据库中的最新状态保持一致。"}
                  </p>
                  <Button
                    type="submit"
                    disabled={!isDirty || updateProfileMutation.isPending}
                    className="bg-emerald-500 text-slate-950 hover:bg-emerald-400"
                  >
                    {updateProfileMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        保存中...
                      </>
                    ) : (
                      "保存资料"
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="border-slate-800 bg-slate-950/70 shadow-xl shadow-black/20">
              <CardHeader>
                <CardTitle className="text-white">当前账号信息</CardTitle>
                <CardDescription className="text-slate-400">
                  这些字段来自登录态与用户表，可帮助您确认当前会话身份。
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
                  <p className="text-slate-400">账号 ID</p>
                  <p className="mt-1 break-all font-mono text-slate-200">{user.id}</p>
                </div>
                <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
                  <p className="text-slate-400">登录方式</p>
                  <p className="mt-1 text-slate-200">{user.loginMethod || "email"}</p>
                </div>
                <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
                  <p className="text-slate-400">最近登录</p>
                  <p className="mt-1 text-slate-200">
                    {user.lastSignedIn ? new Date(user.lastSignedIn).toLocaleString() : "暂无记录"}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Alert className="border-emerald-500/20 bg-emerald-500/5 text-slate-200">
              <ShieldCheck className="h-4 w-4 text-emerald-300" />
              <AlertTitle>资料修改说明</AlertTitle>
              <AlertDescription className="text-slate-300">
                当前仅开放姓名与邮箱编辑。若后续需要头像、组织信息或偏好设置，可在此页面继续扩展。
              </AlertDescription>
            </Alert>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
