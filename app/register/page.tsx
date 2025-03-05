"use client"
import { useState } from "react"
import "/styles/RegistrationPage.css";
import type React from "react"
import { FaEye, FaEyeSlash, FaGoogle } from "react-icons/fa"
import Image from "next/image"
import Link from "next/link"
import { registerWithEmail} from "../firebase/authService"
import { useRouter } from "next/navigation"
import dynamic from "next/dynamic"

const PageTransition = dynamic(() => import("../components/PageTransition"), { ssr: false })

export default function Register() {
  const [email, setEmail] = useState("")
  const [passwordVisible, setPasswordVisible] = useState(false)
  const [password, setPassword] = useState("")
  const [username, setUsername] = useState("")
  const [gender, setGender] = useState<"Male" | "Female">("Male")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()

    if (username.length >= 10 || username.length === 0) {
      setError("Името може да е между 1 и 10 знака")
      return
    }

    if (!/^[^\s@]+@(gmail\.com|abv\.bg)$/.test(email)) {
      setError("Моля въведете валиден имейл")
      return
    }

    if (!/^[a-zA-Z0-9]+$/.test(username)) {
      setError("Името може да съдържа замо номера и букви")
      return
    }

    const isValidPassword = (password: string): string | null => {
      const minLength = 6
      const pattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*(\d|[@$!%*?&])).{6,}$/

      if (password.length < minLength) {
        return "Паролата трябва да е поне 6 знака"
      }
      if (!pattern.test(password)) {
        return "Паролата е прекалено слаба"
      }
      return null // No error, valid password
    }

    const passwordError = isValidPassword(password)
    if (passwordError) {
      setError(passwordError)
      return
    }

    setError(null)

    try {
      setIsLoading(true)
      const registeredUser = await registerWithEmail(email, password, username, gender)
      console.log("User registered successfully:", registeredUser)
      router.push("/")
    } catch (error) {
      console.error("Registration error:", error)
      if (error instanceof Error) {
        if (error.message.includes("auth/email-already-in-use")) {
          setError("Този имейл е вече изпозлван")
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

  // Reset error when typing in the inputs
  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value)
    setError(null) // Reset error when the user types
  }

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value)
    setError(null) // Reset error when the user types
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value)
    setError(null) // Reset error when the user types
  }

  const handleGenderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setGender(e.target.value as "Male" | "Female")
    setError(null) // Reset error when the user changes gender
  }

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible)
  }

  return (
    <div id="page_RegistrationForm">
      <PageTransition>
        <Image src="/Pics/HFit logo.png" width={500} height={100} className="HFit Logo" alt="HFLogo" priority />
        <form className="registerform" onSubmit={handleRegister}>
          <h1>Регистрация</h1>
          {error && <p className="error-message">{error}</p>}
          <input type="text" value={username} onChange={handleUsernameChange} placeholder="Име" required />
          <input type="email" value={email} onChange={handleEmailChange} placeholder="Имейл" required />
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
          <select value={gender} onChange={handleGenderChange}>
            <option value="Male">Мъж</option>
            <option value="Female">Жена</option>
          </select>
          <label>
            Вече имате акаунт? Тогава <Link href="/login">Влез</Link>
          </label>
          <button type="submit" disabled={isLoading}>
            <span></span>
            {isLoading ? "Зареждане..." : "Регистрация"}
          </button>

          <div className="divider"></div>

          <button type="button" className="google-button" disabled={isLoading}>
            <FaGoogle className="google-icon" />
            <span></span>
            {isLoading ? "Зареждане..." : "Регистрация с Google"}
          </button>
        </form>
      </PageTransition>
    </div>
  )
}

