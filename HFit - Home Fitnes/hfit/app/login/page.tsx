"use client";
import { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import Image from "next/image";
import Link from "next/link";
import "/styles/LoginPage.css";
import { loginWithUsernameOrEmail } from "../firebase/authService";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";

const PageTransition = dynamic(() => import("../components/PageTransition"));

function Login() {
  const [identifier, setIdentifier] = useState(""); // For email or username
  const [password, setPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation for identifier (email or username)
    if (!identifier) {
      setError("Моля въведете име или имейл.");
      return;
    }

    if (!password) {
      setError("Моля въведета вашата парола.");
      return;
    }

    try {
      await loginWithUsernameOrEmail(identifier, password);
      router.push("/");
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes("auth/invalid-credential")) {
          setError("Грешна парола");
        } else {
          setError(error.message);
        }
      } else {
        setError("An unknown error occurred.");
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
    setPasswordVisible(!passwordVisible); // Toggle visibility
  };

  return (
    <div id="page_LogInForm">
      <PageTransition>
        <Image
          src="/Pics/HFit logo.png"
          width={500}
          height={100}
          className="HFit Logo"
          alt="HFLogo"
          priority
        />
        <form className="loginform">
          <h1>Влизане</h1>
          {error && <p className="error-message">{error}</p>}
          <input
            type="text"
            value={identifier}
            onChange={handleIdentifierChange}
            placeholder="Име или Имейл"
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
            />
          </div>
          <label>
            Имате ли акаунт? Тогава се <Link href="/register">Регистрирай</Link>
          </label>
          <button onClick={handleLogin}>
            <span></span>Влизане
          </button>
        </form>
      </PageTransition>
    </div>
  );
}

export default Login;
