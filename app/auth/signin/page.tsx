"use client"

import { AuthScreen } from "@/components/auth/auth-screen"
import { useSearchParams } from "next/navigation"
import { Suspense } from "react"

function AuthPageContent() {
    const searchParams = useSearchParams()
    const initialStep = searchParams.get("step") ? parseInt(searchParams.get("step")!) : 1
    return <AuthScreen initialStep={initialStep} />
}

export default function AuthPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <AuthPageContent />
        </Suspense>
    )
}
