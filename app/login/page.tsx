"use client"
import { useState, useEffect } from "react"
import "/styles/LoginPage.css";
import type React from "react"
import { FaEye, FaEyeSlash, FaGoogle } from "react-icons/fa"
import Image from "next/image"
import Link from "next/link"
import { loginWithUsernameOrEmail, signInWithGoogle, handleRedirectResult, getCurrentUser } from "../firebase/authService"
import { useRouter } from "next/navigation"
import dynamic from "next/dynamic"

const PageTransition = dynamic(() => import("../components/PageTransition"), { ssr: false })

export default function Login() {
  const [identifier, setIdentifier] = useState("") 
  const [password, setPassword] = useState("")
  const [passwordVisible, setPasswordVisible] = useState(false)
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
          console.log("Google redirect login successful");
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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Form validation
    if (!identifier) {
      setError("Моля въведете име или имейл.");
      return;
    }
    
    if (!password) {
      setError("Моля въведета вашата парола.");
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      const userCredential = await loginWithUsernameOrEmail(identifier, password);
      console.log("Login successful:", userCredential);
      router.push("/");
    } catch (error) {
      console.error("Login error:", error);
      
      // Error handling for different cases
      if (error instanceof Error) {
        if (error.message.includes("auth/invalid-credential") ||
            error.message.includes("auth/invalid-email") ||
            error.message.includes("auth/user-not-found") ||
            error.message.includes("auth/wrong-password")) {
          setError("Грешно име/имейл или парола");
        } else if (error.message === "Username not found") {
          setError("Потребителското име не е намерено");
        } else {
          setError(error.message);
        }
      } else {
        setError("An unknown error occurred.");
      }
    } finally {
      setIsLoading(false);
    }
  };

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
        console.log("Google login successful:", user.uid);
        router.push("/");
      }
      // If null is returned, a redirect has been initiated and 
      // we'll handle it in the useEffect
      
    } catch (error) {
      console.error("Google login error:", error);
      setGoogleLoading(false);
      setIsLoading(false);
      
      // Show error message for most errors, except expected popup behaviors
      if (error instanceof Error && 
          !error.message.includes("auth/popup-closed-by-user") &&
          !error.message.includes("auth/cancelled-popup-request")) {
        setError("Възникна грешка при влизане с Google. Моля, опитайте отново.");
      }
    }
  };

  const handleIdentifierChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIdentifier(e.target.value);
    setError(null);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    setError(null);
  };

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  // Replace with your JSX
  return (
    <div id="page_LogInForm">
      <PageTransition>
        <Image src="/Pics/HFit logo.png" width={500} height={100} className="HFit Logo" alt="HFLogo" priority />
        <form className="loginform" onSubmit={handleLogin}>
          <h1>Влизане</h1>
          {error && <p className="error-message">{error}</p>}
          
          {/* Username/email field with properly associated label */}
          <label htmlFor="login-identifier" className="form-label"></label>
          <input
            type="text"
            id="login-identifier"
            name="identifier"
            value={identifier}
            onChange={handleIdentifierChange}
            placeholder="Име или Имейл"
            autoComplete="username"
            required
          />
          
          {/* Password field with properly associated label */}
          <label htmlFor="login-password" className="form-label"></label>
          <div className="password-container">
            <span className="eye-icon" onClick={togglePasswordVisibility}>
              {passwordVisible ? <FaEyeSlash /> : <FaEye />}
            </span>
            <input
              type={passwordVisible ? "text" : "password"}
              id="login-password"
              name="password"
              value={password}
              onChange={handlePasswordChange}
              placeholder="Парола"
              autoComplete="current-password"
              required
            />
          </div>
          
          {/* Registration link - not associated with any input */}
          <p className="registration-link">
            Нямате акаунт? Тогава се <Link href="/register">Регистрирай</Link>
          </p>
          
          <button 
            type="submit" 
            id="login-submit"
            name="login-submit"
            disabled={isLoading || checkingAuth}
          >
            <span></span>
            {isLoading ? "Зареждане..." : "Влизане"}
          </button>

          <div className="divider"></div>

          <button 
            type="button" 
            className="google-button"
            id="google-sign-in"
            name="google-sign-in"
            disabled={isLoading || checkingAuth || googleLoading}
            onClick={handleGoogleSignIn}
          >
            <FaGoogle className="google-icon" />
            {checkingAuth ? "Проверка..." : 
             googleLoading ? "Зареждане..." : 
             "Влизане с Google"}
          </button>
        </form>
      </PageTransition>
    </div>
  );
}

