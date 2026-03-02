"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import MalaabiLogo from "@/public/malaabi-logo.png";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
            console.log("Login submitted", { email, password });
        }, 1000);
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-[#0B1511] relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=2727&auto=format&fit=crop')] bg-cover bg-center opacity-20"></div>

            {/* Login Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 relative z-10">
                <div className="max-w-md w-full p-8 sm:p-12">
                    <div className="mb-10 flex justify-center">
                        <Image
                            src={MalaabiLogo}
                            alt="Malaabi Logo"
                            width={100}
                            height={100}
                        />
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6">
                        <Input
                            label="Email Address"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="name@example.com"
                            required
                        />

                        <Input
                            label="Password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                        />

                        <Button type="submit" isLoading={isLoading}>
                            {isLoading ? "Signing in..." : "Sign In"}
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
}
