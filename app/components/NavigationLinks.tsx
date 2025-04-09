"use client"

import Link from "next/link"
import { User } from "firebase/auth"

interface NavigationLinksProps {
  loading: boolean
  user: User | null
  closeMobileMenu: () => void
}

const NavigationLinks = ({ loading, user, closeMobileMenu }: NavigationLinksProps) => {
  return (
    <div className="redirects">
      <ul>
        <li>
          <Link href="/" className="active-link" onClick={closeMobileMenu}>
            Начало
          </Link>
        </li>
        <li>
          <Link href="/calorie_calculator" className="active-link" onClick={closeMobileMenu}>
            Калкулатор
          </Link>
        </li>
        <li>
          <Link
            href="/weight_progress"
            className={loading ? "active-link" : user ? "active-link" : "inactive-link"}
            onClick={closeMobileMenu}
          >
            Теглови прогрес
          </Link>
        </li>
        <li>
          <Link
            href="/training_sessions"
            className={loading ? "active-link" : user ? "active-link" : "inactive-link"}
            onClick={closeMobileMenu}
          >
            Тренировачни упражнения
          </Link>
        </li>
      </ul>
    </div>
  )
}

export default NavigationLinks
