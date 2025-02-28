import Link from "next/link";

function Footer() {
  return (
    <footer className="footer">
      <p>
        &copy; {new Date().getFullYear()} HFit - Home Fitness. Всички права са
        запазено.
      </p>
    </footer>
  );
}

export default Footer;
