import { Loader2 } from "lucide-react";

export default function adminLoading(){
    return <div className="h-[100vh] flex justify-center items-center">
        <Loader2 className="size-24 animate-spin"/>
    </div>
}