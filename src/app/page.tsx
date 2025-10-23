"use client";

import { Nav, NavLink } from "@/components/Nav";
import { useState, useEffect } from "react";

export default function CarSelector() {
  const [result, setResult] = useState<string>("select a car");
  const [color, setColor] = useState<string>("bg-white");

  const dataValue: { name: string; color: string }[] = [
    { name: "volvo", color: "bg-red-500" },
    { name: "saab", color: "bg-yellow-500" },
    { name: "mercedes", color: "bg-blue-500" },
    { name: "audi", color: "bg-green-500" },
    { name: "select", color: "bg-white" },
  ];

  useEffect(() => {
    const matchedColor = dataValue.find((item) => item.name === result);
    if (matchedColor) {
      setColor(matchedColor.color);
    }
  }, [result]); // Runs when result changes

  return (
    <>
      <NavHomepage />
      <div className="container h-[100vh] flex justify-center gap-2 items-center">
        <div
          className={`${color} ${
            color === "bg-white" ? "text-black" : "text-white"
          } p-4 rounded`}
        >
          {result}
        </div>
        <form>
          <select
            onChange={(e) => setResult(e.target.value)}
            name="cars"
            id="cars"
            className="p-2 border rounded"
          >
            <option value="select">-- Select a car --</option>
            <option value="volvo">Volvo</option>
            <option value="saab">Saab</option>
            <option value="mercedes">Mercedes</option>
            <option value="audi">Audi</option>
          </select>
        </form>
      </div>
    </>
  );
}

function NavHomepage() {
  return (
    <Nav>
      <NavLink href={"/admin"}>Admin</NavLink>
      <NavLink href={"/"}>Home</NavLink>
    </Nav>
  );
}
