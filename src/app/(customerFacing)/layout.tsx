import { Nav, NavLink } from "@/components/Nav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, User } from "lucide-react";
import Link from "next/link";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center justify-between gap-2 p-2 bg-primary text-primary-foreground">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8"></div>
          <span className="font-serif text-orange-500 text-xs">myShoop</span>
        </div>

        <Nav>
          <NavLink href="/">Home</NavLink>
          <NavLink href="/products">My Product</NavLink>
          <NavLink href="/orders">Orders</NavLink>
        </Nav>

        <div className="flex items-center ml-auto space-x-2 py-1">
          <Button
            asChild
            className="text-white text-xs border-2 rounded-3xl hover:text-blue-600 "
          >
            <Link href="/login">Login</Link>
          </Button>
          <Button className="bg-blue-600 text-white text-xs  border-2 border-white px-4 py-2 rounded-3xl hover:bg-blue-700">
            <Link
              href="/register
              "
            >
              Sign up
            </Link>
          </Button>
        </div>

        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input type="search" placeholder="Search..." className="pl-10 rounded-full bg-white text-black" />
        </div>

        <div>
          <User className=""></User>
        </div>

        <Button className="flex lg:hidden text-gray-700 hover:text-blue-600">
          ☰
        </Button>
      </div>
      <div className="h-[60px] bg-white flex items-center">category</div>
      <div className="w-screen flex justify-center bg-slate-500">
        <div className="container bg-white p-6">{children}</div>
      </div>
    </div>
  );
}
