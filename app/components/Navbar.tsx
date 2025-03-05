"use client"

import Link from "next/link"
import Image from "next/image"
import { onAuthStateChanged, type User, signInWithEmailAndPassword } from "firebase/auth"
import { FirebaseError } from "firebase/app"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { auth, db } from "../firebase/firebaseConfig"
import { doc, getDoc } from "firebase/firestore"
import { logout } from "../firebase/authService"

function NavBar() {
  const [user, setUser] = useState<User | null>(null)
  const [gender, setGender] = useState<"Male" | "Female" | null>(null)
  const [loading, setLoading] = useState(true)
  const [isPopupVisible, setIsPopupVisible] = useState(false)
  const [accounts, setAccounts] = useState<{ email: string }[]>([])
  const [activeAccount, setActiveAccount] = useState<string | null>(null)
  const [password, setPassword] = useState<string>("")
  const [errorMessage, setErrorMessage] = useState<string>("")
  const router = useRouter()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setLoading(true)
      if (user) {
        await user.reload()
        setUser(user)

        try {
          const previousAccounts = JSON.parse(localStorage.getItem("accounts") || "[]")
          const filteredAccounts = previousAccounts.filter((account: { email: string }) => account.email !== user.email)
          setAccounts(filteredAccounts)

          if (!previousAccounts.some((account: { email: string }) => account.email === user.email)) {
            previousAccounts.push({ email: user.email })
            localStorage.setItem("accounts", JSON.stringify(previousAccounts))
          }
        } catch (error) {
          console.error("Error handling accounts in localStorage:", error)
        }

        try {
          const userDocRef = doc(db, "users", user.uid)
          const userDoc = await getDoc(userDocRef)
          if (userDoc.exists()) {
            setGender(userDoc.data().gender)
          } else {
            console.warn("User document does not exist")
          }
        } catch (error) {
          console.error("Error fetching user gender:", error)
        }
      } else {
        setUser(null)
        setGender(null)
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const handleLogout = async () => {
    await logout()
    router.push("/")
  }

  const handleSwitchAccount = async (email: string) => {
    if (!password) {
      setErrorMessage("A password is needed!")
      return
    }

    try {
      await signInWithEmailAndPassword(auth, email, password)
      // Reset error message, but don't close the popup yet
      await setErrorMessage("")
      await setPassword("")
      // Attempt to sign in with email and password
      // If sign-in is successful, close the popup and log out the previous user
      await closePopup()

      router.push("/")
    } catch (error: unknown) {
      if (error instanceof FirebaseError) {
        if (error.code === "auth/wrong-password") {
          setErrorMessage("Incorrect password")
        } else {
          setErrorMessage("Incorrect password")
        }
      } else if (error instanceof Error) {
        setErrorMessage("An unexpected error occurred.")
      }
    }
  }

  const handleRemoveAccount = (email: string) => {
    const updatedAccounts = accounts.filter((account) => account.email !== email)
    setAccounts(updatedAccounts)
    localStorage.setItem("accounts", JSON.stringify(updatedAccounts))
  }

  const handleCancel = () => {
    setActiveAccount(null)
    setPassword("")
    setErrorMessage("") // Clear the error message when canceling
  }

  const togglePopup = () => {
    setIsPopupVisible((prev) => !prev)
  }

  const closePopup = () => {
    setPassword("")
    setErrorMessage("")
    setIsPopupVisible(false) // Close the main popup
    setActiveAccount(null) // Close the password popup
  }

  return (
    <header>
      <nav className="navbar" onClick={closePopup}>
        <Link href="/">
        <Image src="/Pics/HFit logo.png" width={1000} height={40} className="logo" alt="HF_logo" />
        </Link>
        {loading ? (
          <div className="auth-container">{/* Show a subtle loading indicator or nothing while loading */}</div>
        ) : !user ? (
          <div className="auth-container">
            <div className="buttons-container">
              <Link href="/register">
                <button className="register-button">
                  <span></span> Регистрация
                </button>
              </Link>
              <Link href="/login">
                <button className="login-button">
                  <span></span> Влизане
                </button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="user-container" onClick={(e) => e.stopPropagation()}>
            <div className="avatar-container" onClick={togglePopup}>
              <p className="greeting">Здравей, {user.displayName?.split(" ")[0]}</p>
              {gender === "Male" && (
                <Image src="/Pics/male_pfp.png" className="avatar" width={45} height={45} alt="Male Avatar" />
              )}
              {gender === "Female" && (
                <Image src="/Pics/femal_pfp.png" className="avatar" width={45} height={45} alt="Female Avatar" />
              )}
            </div>
            {isPopupVisible && (
              <div className="popup">
                <button onClick={closePopup} className="close-popup">
                  ×
                </button>
                <div className="accounts-list">
                  <p>Използвани акаунти:</p>
                  <ul>
                    {accounts.map((account, index) => (
                      <li
                        key={index}
                        className={`account-item ${activeAccount === account.email ? "active" : ""}`}
                        onClick={() => {
                          if (activeAccount !== account.email) {
                            // Reset password and error message when selecting a different account
                            setPassword("")
                            setErrorMessage("")
                          }
                          setActiveAccount(activeAccount === account.email ? null : account.email)
                        }}
                      >
                        <span>{account.email}</span>
                        <button
                          className="remove-account-button"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleRemoveAccount(account.email)
                          }}
                        >
                          ×
                        </button>
                        {activeAccount === account.email && (
                          <div className="password-popup" onClick={(e) => e.stopPropagation()}>
                            {errorMessage && <p className="error-message">{errorMessage}</p>}
                            <input
                              type="password"
                              value={password}
                              onChange={(e) => {
                                setPassword(e.target.value)
                                setErrorMessage("")
                              }}
                              placeholder="Password"
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  handleSwitchAccount(account.email)
                                }
                              }}
                            />
                            <div className="popup-buttons">
                              <button className="confirm-button" onClick={() => handleSwitchAccount(account.email)}>
                                <span></span> Confirm
                              </button>
                              <button className="cancel-button" onClick={handleCancel}>
                                <span></span> Cancel
                              </button>
                            </div>
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                  <button onClick={handleLogout} className="logout-button">
                    <span></span> Излез от акаунт
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
        <div className="redirects">
          <ul>
            <li>
              <Link href="/" className="active-link">
                Начало
              </Link>
            </li>
            <li>
              <Link href="/calorie_calculator" className="active-link">
                Калкулатор
              </Link>
            </li>
            <li>
              <Link
                href="/weight_progress"
                className={loading ? "active-link" : user ? "active-link" : "inactive-link"}
              >
                Теглови прогрес
              </Link>
            </li>
            <li>
              <Link
                href="/training_sessions"
                className={loading ? "active-link" : user ? "active-link" : "inactive-link"}
              >
                Тренировачни упражнения
              </Link>
            </li>
          </ul>
        </div>
      </nav>
    </header>
  )
}

export default NavBar

