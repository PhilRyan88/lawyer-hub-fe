import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Scale, Eye, EyeOff } from "lucide-react";

const formSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

  import { useLoginMutation } from "./loginApi";

  export default function Login() {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [login, { isLoading }] = useLoginMutation();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const data = await login(values).unwrap();
      
      // Store token (basic implementation)
      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.role);
      
      navigate("/calendar");
    } catch (err: any) {
      setError(err?.data?.message || err.message || "Login failed");
    }
  }

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center p-4 overflow-hidden bg-[#030712]">
      {/* Luxury Dark Mirror Background */}
      <div className="absolute inset-0 z-0 select-none">
        {/* Base Slate Texture */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,#0f172a_0%,#030712_100%)]" />
        
        {/* High-Clarity Reflective Glass Beams */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Main Reflective Streak */}
          <div className="absolute top-[30%] -left-[20%] w-[140%] h-[1px] bg-gradient-to-r from-transparent via-primary/30 to-transparent rotate-[-5deg] animate-[reflect_15s_ease-in-out_infinite]" />
          {/* Secondary Accent Streak */}
          <div className="absolute top-[60%] -right-[20%] w-[140%] h-[1px] bg-gradient-to-l from-transparent via-sky-500/20 to-transparent rotate-[-5deg] animate-[reflect_12s_ease-in-out_infinite_reverse]" />
          
          {/* Moving Light Polish - High Clarity */}
          <div className="absolute inset-0 bg-[linear-gradient(115deg,transparent_30%,rgba(255,255,255,0.02)_45%,rgba(255,255,255,0.05)_50%,rgba(255,255,255,0.02)_55%,transparent_70%)] bg-[length:200%_100%] animate-[sheen_20s_linear_infinite]" />
        </div>

        {/* Ultra-Fine Pinstripe Grid - Professional & Sharp */}
        <div className="absolute inset-0 opacity-[0.15] bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:100%_40px]" />
        
        {/* Subtle sharp grain for premium finish */}
        <div className="absolute inset-0 opacity-[0.02] mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
        
        {/* Corner Depth Shadows */}
        <div className="absolute inset-0 shadow-[inset_0_0_150px_rgba(0,0,0,0.8)]" />
      </div>

      <div className="relative z-10 w-full max-w-[440px] animate-in fade-in slide-in-from-bottom-8 duration-1000">
        <Card className="w-full border-white/5 bg-[#0f172a]/40 backdrop-blur-2xl shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] rounded-[2.5rem] p-2">
          <div className="rounded-[2.25rem] border border-white/10 bg-gradient-to-b from-white/5 to-transparent">
            <CardHeader className="pt-12 pb-6 text-center">
              <div className="flex justify-center mb-8">
                <div className="relative">
                  <div className="absolute -inset-4 bg-primary/20 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition duration-1000"></div>
                  <div className="relative w-20 h-20 flex items-center justify-center bg-transparent border-2 border-primary/30 rounded-full shadow-[inset_0_0_20px_rgba(var(--primary),0.1)]">
                      <Scale className="w-10 h-10 text-primary animate-in zoom-in spin-in-12 duration-1000" />
                  </div>
                </div>
              </div>
              <CardTitle className="text-3xl font-black tracking-tight mb-2 text-white">
                Z.A Sukul Khadar &
                <span className="block text-primary/80 text-lg mt-1 font-semibold uppercase tracking-[0.2em]">Associates</span>
              </CardTitle>
              <div className="h-px w-12 bg-primary/30 mx-auto my-4" />
              <CardDescription className="text-xs font-bold uppercase tracking-widest text-slate-400">
                Secure Professional Access
              </CardDescription>
            </CardHeader>
            <CardContent className="px-8 pb-12">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Username</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Enter Username" 
                              className="h-12 bg-white/5 border-white/10 rounded-2xl focus:bg-white/10 focus:ring-primary/20 focus:border-primary/40 transition-all font-medium text-white placeholder:text-slate-600"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage className="text-[10px] font-bold uppercase text-destructive/80" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Password</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input 
                                type={showPassword ? "text" : "password"} 
                                placeholder="••••••••" 
                                className="h-12 bg-white/5 border-white/10 rounded-2xl focus:bg-white/10 focus:ring-primary/20 focus:border-primary/40 transition-all font-medium text-white placeholder:text-slate-600 pr-10"
                                {...field} 
                              />
                              <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500  transition-colors"
                              >
                                {showPassword ? (
                                  <EyeOff className="h-5 w-5" />
                                ) : (
                                  <Eye className="h-5 w-5" />
                                )}
                              </button>
                            </div>
                          </FormControl>
                          <FormMessage className="text-[10px] font-bold uppercase text-destructive/80" />
                        </FormItem>
                      )}
                    />
                  </div>

                  {error && (
                    <div className="p-3 rounded-2xl bg-destructive/10 border border-destructive/20 animate-shake">
                      <p className="text-[10px] font-black text-destructive text-center uppercase tracking-widest">{error}</p>
                    </div>
                  )}

                  <Button 
                    type="submit" 
                    className="w-full h-14 rounded-2xl bg-primary text-primary-foreground shadow-2xl shadow-primary/20 font-black text-xs uppercase tracking-[0.3em] transition-all hover:brightness-110 active:scale-[0.98] group" 
                    disabled={isLoading}
                  >
                    {isLoading ? (
                       <div className="flex items-center gap-3">
                           <div className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                           <span>Verifying...</span>
                       </div>
                    ) : (
                      <span className="flex items-center gap-2">
                        Enter Chamber
                      </span>
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </div>
        </Card>
      </div>

      {/* Classy Fixed Footer */}
      <footer className="fixed bottom-0 left-0 w-full p-8 text-center z-20 pointer-events-none">
        <p className="text-[9px] font-black uppercase tracking-[0.5em] text-slate-600">
          DEVELOPED BY ADITYA SOORAJ
        </p>
      </footer>
    </div>
  );
}
