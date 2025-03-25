import Link from "next/link";

function Footer() {
  return (
    <footer className="footer">
      <p>
        &copy; {new Date().getFullYear()} HFit - Home Fitness. Този сайт е създаден изцяло за учебни цели и не е
        предназначен за търговска употреба.
      </p>
    </footer>
  );
}

export default Footer;
