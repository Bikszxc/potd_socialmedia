"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { signIn, signOut, useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ServerShowcase } from "@/components/auth/server-showcase"
import { Check, Clipboard, Gamepad2 } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"

interface AuthScreenProps {
    initialStep?: number
}

export function AuthScreen({ initialStep = 1 }: AuthScreenProps) {
    const { data: session, status } = useSession()
    const [step, setStep] = useState(initialStep)
    const [verificationCode, setVerificationCode] = useState("")
    const [isLoading, setIsLoading] = useState(false)

    const handleDiscordLogin = async () => {
        signIn("discord", { callbackUrl: "/?new_user=true" })
    }

    const copyCommand = () => {
        navigator.clipboard.writeText("/dc verify 123456")
        toast.success("Command copied to clipboard!")
    }

    const handleVerifyCode = async () => {
        setIsLoading(true)
        try {
            const response = await fetch("/api/auth/verify-code", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ code: verificationCode }),
            })

            if (!response.ok) {
                const text = await response.text()
                toast.error(text || "Verification failed")
                setIsLoading(false)
                return
            }

            const data = await response.json()
            toast.success(`Verified as ${data.username}!`)
            setStep(3)
        } catch (error) {
            toast.error("Something went wrong")
            console.error(error)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen w-full lg:grid lg:grid-cols-2 bg-background">
            {/* Left Side - Showcase */}
            <div className="hidden lg:block h-full bg-muted/40 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-background/0 to-background/0 opacity-50" />
                <ServerShowcase />
            </div>

            {/* Right Side - Auth */}
            <div className="flex items-center justify-center p-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="mx-auto w-full max-w-[450px] space-y-6"
                >
                    <Tabs defaultValue={initialStep === 1 ? "login" : "signup"} className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="login">Log In</TabsTrigger>
                            <TabsTrigger value="signup">Sign Up</TabsTrigger>
                        </TabsList>

                        <AnimatePresence mode="wait">
                            <TabsContent key="login" value="login" asChild>
                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                                        <CardHeader>
                                            <CardTitle>Welcome Back</CardTitle>
                                            <CardDescription>
                                                Sign in with your Discord account to continue.
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <Button
                                                className="w-full bg-[#5865F2] hover:bg-[#4752C4] text-white transition-transform active:scale-95"
                                                onClick={handleDiscordLogin}
                                            >
                                                <Gamepad2 className="mr-2 h-4 w-4" />
                                                Login with Discord
                                            </Button>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            </TabsContent>

                            <TabsContent key="signup" value="signup" asChild>
                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                                        <CardHeader>
                                            <CardTitle>Create Account</CardTitle>
                                            <CardDescription>
                                                {step === 1 && "Step 1: Link your Discord account"}
                                                {step === 2 && "Step 2: Verify in-game"}
                                                {step === 3 && "Step 3: Confirm Details"}
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            {/* Stepper Dots */}
                                            <div className="flex justify-center gap-2 mb-6">
                                                {[1, 2, 3].map((s) => (
                                                    <motion.div
                                                        key={s}
                                                        layout
                                                        initial={false}
                                                        className={`h-2.5 rounded-full transition-colors ${s === step ? "w-8 bg-primary" : "w-2.5 bg-muted-foreground/30"
                                                            }`}
                                                    />
                                                ))}
                                            </div>

                                            {/* Signed In Indicator */}
                                            <AnimatePresence>
                                                {status === "authenticated" && session?.user && (
                                                    <motion.div
                                                        initial={{ opacity: 0, height: 0 }}
                                                        animate={{ opacity: 1, height: "auto" }}
                                                        exit={{ opacity: 0, height: 0 }}
                                                        className="overflow-hidden"
                                                    >
                                                        <div className="flex items-center gap-3 p-3 mb-4 bg-muted/30 rounded-lg border border-border/50">
                                                            <Avatar className="w-10 h-10 border border-border">
                                                                <AvatarImage src={session.user.image || ""} />
                                                                <AvatarFallback>{session.user.name?.[0] || "?"}</AvatarFallback>
                                                            </Avatar>
                                                            <div className="flex-1 overflow-hidden">
                                                                <p className="text-sm font-medium truncate">
                                                                    Signed in as <span className="text-primary">{session.user.name}</span>
                                                                </p>
                                                                <p className="text-xs text-muted-foreground truncate">{session.user.email}</p>
                                                            </div>
                                                            <Button variant="ghost" size="sm" onClick={() => signOut()} className="text-xs h-8">
                                                                Sign Out
                                                            </Button>
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>

                                            <AnimatePresence mode="wait">
                                                {step === 1 && (
                                                    <motion.div
                                                        key="step1"
                                                        initial={{ opacity: 0, x: 20 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        exit={{ opacity: 0, x: -20 }}
                                                        transition={{ duration: 0.2 }}
                                                        className="space-y-4"
                                                    >
                                                        <p className="text-sm text-muted-foreground">
                                                            To join Pinya of The Dead social, you need to link your Discord account first.
                                                        </p>
                                                        <Button
                                                            className="w-full bg-[#5865F2] hover:bg-[#4752C4] text-white transition-transform active:scale-95"
                                                            onClick={() => handleDiscordLogin()}
                                                        >
                                                            <Gamepad2 className="mr-2 h-4 w-4" />
                                                            Connect Discord
                                                        </Button>

                                                        <Button variant="ghost" size="sm" onClick={() => setStep(2)} className="text-xs w-full text-muted-foreground">
                                                            (Demo: Skip to Step 2)
                                                        </Button>
                                                    </motion.div>
                                                )}

                                                {step === 2 && (
                                                    <motion.div
                                                        key="step2"
                                                        initial={{ opacity: 0, x: 20 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        exit={{ opacity: 0, x: -20 }}
                                                        transition={{ duration: 0.2 }}
                                                        className="space-y-4"
                                                    >
                                                        <div className="p-4 bg-muted/50 rounded-lg border border-border">
                                                            <p className="text-sm font-medium mb-2">Verification Code</p>
                                                            <div className="flex items-center justify-between bg-background p-2 rounded border border-input">
                                                                <code className="text-primary font-mono font-bold">/dc verify 123456</code>
                                                                <Button size="icon" variant="ghost" onClick={copyCommand}>
                                                                    <Clipboard className="h-4 w-4" />
                                                                </Button>
                                                            </div>
                                                            <p className="text-xs text-muted-foreground mt-2">
                                                                Run this command in the in-game chat to link your survivor.
                                                            </p>
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label>Or enter code manually if provided:</Label>
                                                            <Input
                                                                placeholder="e.g. 123456"
                                                                value={verificationCode}
                                                                onChange={(e) => setVerificationCode(e.target.value)}
                                                            />
                                                        </div>
                                                        <Button className="w-full transition-transform active:scale-95" onClick={handleVerifyCode} disabled={isLoading}>
                                                            {isLoading ? "Verifying..." : "Verify Code"}
                                                        </Button>
                                                        <Button variant="ghost" className="w-full" onClick={() => setStep(1)}>
                                                            Back
                                                        </Button>
                                                    </motion.div>
                                                )}

                                                {step === 3 && (
                                                    <motion.div
                                                        key="step3"
                                                        initial={{ opacity: 0, scale: 0.9 }}
                                                        animate={{ opacity: 1, scale: 1 }}
                                                        transition={{ type: "spring", bounce: 0.5 }}
                                                        className="space-y-4 text-center"
                                                    >
                                                        <div className="mx-auto w-12 h-12 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mb-4">
                                                            <Check className="h-6 w-6" />
                                                        </div>
                                                        <h3 className="text-lg font-bold">Successfully Verified!</h3>
                                                        <p className="text-sm text-muted-foreground">
                                                            Your account is now linked to <strong>Survivor_01</strong>.
                                                        </p>
                                                        <Button className="w-full transition-transform active:scale-95" onClick={() => window.location.reload()}>
                                                            Go to Feed
                                                        </Button>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            </TabsContent>
                        </AnimatePresence>
                    </Tabs>
                </motion.div>
            </div>
        </div>
    )
}
