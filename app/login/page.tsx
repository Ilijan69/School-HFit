"use client"
import { useState } from "react"
import "/styles/LoginPage.css";
import type React from "react"
import { FaEye, FaEyeSlash, FaGoogle } from "react-icons/fa"
import Image from "next/image"
import Link from "next/link"
import { loginWithUsernameOrEmail} from "../firebase/authService"
import { useRouter } from "next/navigation"
import dynamic from "next/dynamic"

const PageTransition = dynamic(() => import("../components/PageTransition"), { ssr: false })

export default function Login() {
  const [identifier, setIdentifier] = useState("") // For email or username
  const [password, setPassword] = useState("")
  const [passwordVisible, setPasswordVisible] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    // Basic validation for identifier (email or username)
    if (!identifier) {
      setError("Моля въведете име или имейл.")
      return
    }

    if (!password) {
      setError("Моля въведета вашата парола.")
      return
    }

    try {
      setIsLoading(true)
      const userCredential = await loginWithUsernameOrEmail(identifier, password)
      console.log("Login successful:", userCredential)
      router.push("/")
    } catch (error) {
      console.error("Login error:", error)
      if (error instanceof Error) {
        if (
          error.message.includes("auth/invalid-credential") ||
          error.message.includes("auth/invalid-email") ||
          error.message.includes("auth/user-not-found") ||
          error.message.includes("auth/wrong-password")
        ) {
          setError("Грешно име/имейл или парола")
        } else if (error.message === "Username not found") {
          setError("Потребителското име не е намерено")
        } else {
          setError(error.message)
        }
      } else {
        setError("An unknown error occurred.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleIdentifierChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIdentifier(e.target.value)
    setError(null)
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value)
    setError(null)
  }

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible) // Toggle visibility
  }

  return (
    <div id="page_LogInForm">
      <PageTransition>
        <Image src="/Pics/HFit logo.png" width={500} height={100} className="HFit Logo" alt="HFLogo" priority />
        <form className="loginform" onSubmit={handleLogin}>
          <h1>Влизане</h1>
          {error && <p className="error-message">{error}</p>}
          <input
            type="text"
            value={identifier}
            onChange={handleIdentifierChange}
            placeholder="Име или Имейл"
            required
          />
          <div className="password-container">
            <span className="eye-icon" onClick={togglePasswordVisibility}>
              {passwordVisible ? <FaEyeSlash /> : <FaEye />}
            </span>
            <input
              type={passwordVisible ? "text" : "password"}
              value={password}
              onChange={handlePasswordChange}
              placeholder="Парола"
              required
            />
          </div>
          <label>
            Нямате акаунт? Тогава се <Link href="/register">Регистрирай</Link>
          </label>
          <button type="submit" disabled={isLoading}>
            <span></span>
            {isLoading ? "Зареждане..." : "Влизане"}
          </button>

          <div className="divider"></div>

          <button type="button" className="google-button" disabled={isLoading}>
            <FaGoogle className="google-icon" />
            {isLoading ? "Зареждане..." : "Влизане с Google"}
          </button>
        </form>
      </PageTransition>
    </div>
  )
}

