"use client";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { useTransition } from "react";
import {
  DeleteProduct,
  ToggleProductAvailability,
} from "../../_action/product";
import { useRouter } from "next/navigation";

export function ActiveToggeDropdownItem({
  id,
  isAvailableForPurchase,
}: {
  id: string;
  isAvailableForPurchase: boolean;
}) {
  const [isPending, startTransition] = useTransition();
const router = useRouter();
  return (
    <DropdownMenuItem
      disabled={isPending}
      onClick={() => {
        startTransition(
          async () =>{
            await ToggleProductAvailability(id, !isAvailableForPurchase)
          router.refresh()
      });
      }}
    >
      {isAvailableForPurchase ? "Deactivate" : "Activate"}
    </DropdownMenuItem>
  );
}
export function DeleteDropdownItem({
  id,
  disabled,
}: {
  id: string;
  disabled: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <DropdownMenuItem
      className="text-red-600 focus:text-white focus:bg-red-600 data-[disabled]:opacity-50"
      disabled={disabled || isPending}
      onClick={() => {
        startTransition(async () => {
          await DeleteProduct(id);
          router.refresh();
        });
      }}
    >
      Delete
    </DropdownMenuItem>
  );
}
