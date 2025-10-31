"use client"

import { cn } from "@/lib/utils";
import  Link from "next/link";
import { usePathname } from "next/navigation";
import { ComponentProps, ReactNode } from "react";

export function Nav( {children}: {children: ReactNode}){
    return <nav className="hidden lg:flex bg-primary ml-auto text-sm text-primary-foreground gap-1 px-4">{children}</nav>
}
export function NavLink (props: ComponentProps<typeof Link>){
    const pathname = usePathname()
    return <Link {...props} className={cn("p-3 hover:bg-secondary hover:text-secondary-foreground focus-visible:bg-secondary focus-visible:text-secondary", pathname === props.href && "bg-background text-foreground")}/> 
}    