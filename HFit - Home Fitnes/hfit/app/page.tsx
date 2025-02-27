import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import "../styles/IndexPage.css";
import "../styles/Footer.css";

const Footer = dynamic(() => import("./components/Footer")); // Faster rendering
const PageTransition = dynamic(() => import("./components/PageTransition")); // Faster rendering
const Arrow = dynamic(() => import("./components/Arrow")); // Faster rendering

export default function Home() {
  return (
    <div id="page_Index">
      <PageTransition>
        <div className="banner">
          <Image
            src="/Pics/Index_background.png"
            alt="Background"
            fill
            priority
            quality={80}
          />
        </div>
        <section className="content">
          <h1>HFit - Get Fit At Home</h1>
          <p className="index_text">
            Всички знаем колко страшно може да бъде да отидеш във фитнеса за
            <br />
            първи път. Мислиш, че всички те гледат, съдят те и се смеят зад
            гърба ти.
            <br />
            Фитнесът е безопасно място за мнозина и може да бъде такова и за
            теб.
            <br />
            Обаче не ти е нужен, за да започнеш своето пътешествие — можеш да
            стартираш сега!
            <br />
            Следвай стъпките по-долу и скоро ще влизаш във фитнеса с пълна
            увереност!
          </p>

          <div className="animation">
            <div className="calorie-section">
              <div className="calorie_rectangle">
                <p className="calorie_text">
                  Затова първо е добра идея да изчислиш колко калории
                  <br />
                  трябва да консумираш през деня.
                  <br />
                  В зависимост от твоята цел имаш три възможности:
                  <br />
                  <strong>Поддържане на теглото</strong> - Не променяш
                  килограмите си;
                  <br />
                  <strong>Калориен дефицит</strong> - Ядеш по-малко, намаляш
                  килограмите си;
                  <br />
                  <strong>Калориен излишък</strong> - Ядеш повече, увелиичаваш
                  килограмите си.
                </p>
              </div>
              <Image
                src="/Pics/calorie_calculator.png"
                width={100}
                height={100}
                className="calorie_image"
                alt="CC_image"
                loading="lazy"
              />
              <Link href="/calorie_calculator">
                <button type="button" id="calorie_button">
                  <span></span>Калкулатор
                </button>
              </Link>
            </div>
          </div>

          <div className="animation">
            <div className="weight-section">
              <div className="weight_rectangle">
                <p className="weight_text">
                  <strong>Проследяването на теглото</strong> е важна част от
                  всяко фитнес пътешествие. Наблюдавайки промените, можеш да
                  останеш мотивиран и да коригираш диетата и тренировките си.
                  Независимо дали искаш да <strong>отслабнеш</strong>, <strong>качиш мускули</strong> или <strong>поддържаш</strong> форма, следенето на напредъка ти помага да останеш на правилния път.
                </p>
              </div>
              <Image
                src="/Pics/weight_progress.png"
                width={100}
                height={100}
                className="weight_image"
                alt="WP_image"
                loading="lazy"
              />
              <Link href="/weight_progress">
                <button type="button" id="weight_button">
                  <span></span>Тегло
                </button>
              </Link>
            </div>
          </div>

          <div className="animation">
            <div className="train-section">
              <div className="train_rectangle">
                <p className="train_text">
                  В началото на твоето фитнес пътешествие не ти е нужен <strong>фитнес</strong> или <strong>специално оборудване</strong>. Можеш да тренираш всяка част от тялото си в комфорта на своя <strong>дом</strong>. Създадохме <strong>персонализирани тренировъчни програми</strong>, които лесно можеш да следваш. Така че разгледай ги и започни своето пътуване към <strong>HFit - Home Fitness</strong>!
                </p>
              </div>
              <Image
                src="/Pics/training.png"
                width={100}
                height={100}
                className="train_image"
                alt="TR_image"
                loading="lazy"
              />
              <Link href="/training_sessions">
                <button type="button" id="train_button">
                  <span></span>Тренировки
                </button>
              </Link>
            </div>
          </div>
          <Arrow />
        </section>
        <Footer />
      </PageTransition>
    </div>
  );
}
