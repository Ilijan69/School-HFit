"use client"
import { useState, useEffect } from "react"
import "/styles/RegistrationPage.css";
import type React from "react"
import { FaEye, FaEyeSlash, FaGoogle } from "react-icons/fa"
import Image from "next/image"
import Link from "next/link"
import { registerWithEmail, signInWithGoogle, handleRedirectResult, getCurrentUser } from "../firebase/authService"
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
  const [checkingAuth, setCheckingAuth] = useState(true)
  const [googleLoading, setGoogleLoading] = useState(false)
  const router = useRouter()

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // First check for redirect result
        const redirectUser = await handleRedirectResult();
        if (redirectUser) {
          console.log("Google redirect registration successful");
          router.push("/");
          return;
        }

        // Then check if already signed in
        const user = await getCurrentUser();
        if (user) {
          console.log("User already signed in");
          router.push("/");
          return;
        }
        
        // Check for stored errors
        const storedError = localStorage.getItem('googleAuthError');
        if (storedError) {
          console.error("Found stored auth error:", storedError);
          setError(`Възникна грешка: ${storedError}`);
          localStorage.removeItem('googleAuthError');
        }
      } catch (error) {
        console.error("Auth check error:", error);
      } finally {
        setCheckingAuth(false);
      }
    };
    
    checkAuth();
  }, [router]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()

    // Form validation
    if (username.length >= 10 || username.length === 0) {
      setError("Името може да е между 1 и 10 знака")
      return
    }

    if (!/^[^\s@]+@(gmail\.com|abv\.bg)$/.test(email)) {
      setError("Моля въведете валиден имейл")
      return
    }

    if (!/^[\p{L}0-9]+$/u.test(username)) {
      setError("Името може да съдържа само букви и числа");
      return;
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

    try {
      setIsLoading(true)
      setError(null)
      
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

  const handleGoogleSignIn = async () => {
    try {
      // Prevent multiple clicks
      if (googleLoading) return;
      
      setGoogleLoading(true);
      setIsLoading(true);
      setError(null);
      
      const user = await signInWithGoogle();
      
      // If we get a user back, popup succeeded and we can redirect
      if (user) {
        console.log("Google registration successful:", user.uid);
        router.push("/");
      }
      // If null is returned, a redirect has been initiated and 
      // we'll handle it in the useEffect
      
    } catch (error) {
      console.error("Google registration error:", error);
      setGoogleLoading(false);
      setIsLoading(false);
      
      // Show error message for most errors, except expected popup behaviors
      if (error instanceof Error && 
          !error.message.includes("auth/popup-closed-by-user") &&
          !error.message.includes("auth/cancelled-popup-request")) {
        setError("Възникна грешка при регистрацията с Google. Моля, опитайте отново.");
      }
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
          
          {/* Username field with properly associated label */}
          <label htmlFor="register-username" className="form-label"></label>
          <input 
            type="text" 
            id="register-username" 
            name="username"
            value={username} 
            onChange={handleUsernameChange} 
            placeholder="Име" 
            autoComplete="username"
            required 
          />
          
          {/* Email field with properly associated label */}
          <label htmlFor="register-email" className="form-label"></label>
          <input 
            type="email" 
            id="register-email" 
            name="email"
            value={email} 
            onChange={handleEmailChange} 
            placeholder="Имейл" 
            autoComplete="email"
            required 
          />
          
          {/* Password field with properly associated label */}
          <label htmlFor="register-password" className="form-label"></label>
          <div className="password-container">
            <span className="eye-icon" onClick={togglePasswordVisibility}>
              {passwordVisible ? <FaEyeSlash /> : <FaEye />}
            </span>
            <input
              type={passwordVisible ? "text" : "password"}
              id="register-password"
              name="password"
              value={password}
              onChange={handlePasswordChange}
              placeholder="Парола"
              autoComplete="new-password"
              required
            />
          </div>
          
          {/* Gender field with properly associated label */}
          <label htmlFor="register-gender" className="form-label"></label>
          <select 
            id="register-gender" 
            name="gender"
            value={gender} 
            onChange={handleGenderChange}
            autoComplete="sex"
          >
            <option value="Male">Мъж</option>
            <option value="Female">Жена</option>
          </select>
          
          {/* Login link - not associated with any input */}
          <p className="login-link">
            Вече имате акаунт? Тогава <Link href="/login">Влез</Link>
          </p>
          
          <button 
            type="submit" 
            id="register-submit"
            name="register-submit"
            disabled={isLoading || checkingAuth}
          >
            <span></span>
            {isLoading ? "Зареждане..." : "Регистрация"}
          </button>
          
          <div className="divider"></div>
          
          <button 
            type="button" 
            className="google-button"
            id="google-register"
            name="google-register"
            disabled={isLoading || checkingAuth || googleLoading}
            onClick={handleGoogleSignIn}
          >
            <FaGoogle className="google-icon" />
            {checkingAuth ? "Проверка..." : 
             googleLoading ? "Зареждане..." : 
             "Регистрация с Google"}
          </button>
        </form>
      </PageTransition>
    </div>
  )
}

