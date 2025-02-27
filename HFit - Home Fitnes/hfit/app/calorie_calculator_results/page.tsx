"use client";
import { useEffect, useState } from "react";
import "/styles/CalculatorResultsPage.css";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";

const PageTransition = dynamic(() => import("../components/PageTransition"));

const CalorieCalculatorResults = () => {
  const router = useRouter();
  const [maintenance, setMaintenance] = useState<number | null>(null);
  const [deficit, setDeficit] = useState<number | null>(null);
  const [surplus, setSurplus] = useState<number | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setMaintenance(Number(params.get("maintenance")));
    setDeficit(Number(params.get("deficit")));
    setSurplus(Number(params.get("surplus")));
  }, [router]);

  return (
    <div id="page_CalorieCalculatorResult">
      <PageTransition>
        <div className="rectangle_result">
          <div className="rectangle_maintenance">
            <div className="maintenance_separation"></div>
            <p className="maintenance_text">
              Калории за поддръжка<span id="maintenance">{maintenance}</span>
            </p>
            <Image
              src="/Pics/same.png"
              width={100}
              height={100}
              className="maintain_box_pic"
              alt="MB_image"
            />
          </div>
          <div className="rectangle_deficit">
            <div className="deficit_separation"></div>
            <p className="deficit_text">
              Калориен дефицит<span id="deficit">{deficit}</span>
            </p>
            <Image
              src="/Pics/down.png"
              width={100}
              height={100}
              className="deficit_box_pic"
              alt="DB_image"
            />
          </div>
          <div className="rectangle_surplus">
            <div className="surplus_separation"></div>
            <p className="surplus_text">
              Калориен излишък<span id="surplus">{surplus}</span>
            </p>
            <Image
              src="/Pics/up.png"
              width={100}
              height={100}
              className="surplus_box_pic"
              alt="SB_image"
            />
          </div>
          <Link href="/calorie_calculator">
            <button>
              <span />
              <div className="text">Калориен Калкулатор</div>
            </button>
          </Link>
        </div>
      </PageTransition>
    </div>
  );
};

export default CalorieCalculatorResults;
