import { useEffect, useState, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { getAuth, onAuthStateChanged } from "firebase/auth";

interface WithAuthProps {
  children: ReactNode;
}

const withAuth = (Component: React.ComponentType) => {
  const AuthenticatedComponent: React.FC = (props) => {
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
      const auth = getAuth();
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        if (!user) {
          router.push("/register"); // Redirect to register if not authenticated
        } else {
          setIsLoading(false); // Authentication confirmed, stop loading
        }
      });

      return () => unsubscribe();
    }, [router]);

    if (isLoading) {
      return null;
    }

    return <Component {...props} />;
  };

  return AuthenticatedComponent;
};

export default withAuth;
