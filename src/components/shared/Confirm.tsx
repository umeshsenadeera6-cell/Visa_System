import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Trash2 } from "lucide-react";

interface ConfirmOptions {
  title: string;
  description?: string;
  confirmLabel?: string;
  onConfirm: () => void;
}

const ConfirmContext = createContext<(o: ConfirmOptions) => void>(() => {});

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [opts, setOpts] = useState<ConfirmOptions | null>(null);
  const confirm = useCallback((o: ConfirmOptions) => setTimeout(() => setOpts(o), 0), []);
  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <AlertDialog open={!!opts} onOpenChange={(o) => !o && setOpts(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="mb-1 flex size-11 items-center justify-center rounded-xl bg-[#fdeeec] text-[#b4321f]">
              <Trash2 className="size-5" />
            </div>
            <AlertDialogTitle>{opts?.title}</AlertDialogTitle>
            <AlertDialogDescription>{opts?.description ?? "This action cannot be undone."}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                opts?.onConfirm();
                setOpts(null);
              }}
            >
              {opts?.confirmLabel ?? "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </ConfirmContext.Provider>
  );
}

export const useConfirm = () => useContext(ConfirmContext);
