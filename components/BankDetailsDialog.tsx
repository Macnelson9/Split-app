import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Bank {
  code: string;
  name: string;
}

interface BankDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  theme: "dark" | "light";
  accountNumber: string;
  setAccountNumber: (value: string) => void;
  selectedBank: Bank | null;
  setSelectedBank: (bank: Bank | null) => void;
  banks: Bank[];
  banksLoading: boolean;
  onSend: () => void;
  accountName?: string;
}

export default function BankDetailsDialog({
  open,
  onOpenChange,
  theme,
  accountNumber,
  setAccountNumber,
  selectedBank,
  setSelectedBank,
  banks,
  banksLoading,
  onSend,
  accountName,
}: BankDetailsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={
          theme === "dark"
            ? "bg-black/95 border-white/20 text-white"
            : "bg-white border-black/20 text-black"
        }
      >
        <DialogHeader>
          <DialogTitle>Enter Bank Details</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label
              className={`text-sm ${
                theme === "dark" ? "text-white/70" : "text-black/70"
              }`}
            >
              Account Number
            </label>
            <Input
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              placeholder="Enter account number"
              className={
                theme === "dark"
                  ? "bg-black/50 border-white/20"
                  : "bg-white/50 border-black/20"
              }
              maxLength={10}
            />
          </div>
          <div>
            <label
              className={`text-sm ${
                theme === "dark" ? "text-white/70" : "text-black/70"
              }`}
            >
              Bank
            </label>
            <Select
              onValueChange={(value) => {
                const bank = banks.find((b) => b.code === value);
                if (bank) setSelectedBank(bank);
              }}
            >
              <SelectTrigger
                className={
                  theme === "dark"
                    ? "bg-black/50 border-white/20"
                    : "bg-white/50 border-black/20"
                }
              >
                <SelectValue placeholder="Select bank" />
              </SelectTrigger>
              <SelectContent>
                {banks.map((bank) => (
                  <SelectItem key={bank.code} value={bank.code}>
                    {bank.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {banksLoading && (
            <p
              className={`text-sm ${
                theme === "dark" ? "text-white/70" : "text-black/70"
              }`}
            >
              Loading banks...
            </p>
          )}
          {accountNumber && selectedBank && (
            <div
              className={`p-3 border rounded-lg ${
                theme === "dark"
                  ? "border-white/20 bg-white/10"
                  : "border-black/20 bg-black/10"
              }`}
            >
              {accountName && <p>Name: {accountName}</p>}
              <p>Account: {accountNumber}</p>
              <p>Bank: {selectedBank.name}</p>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button
            onClick={onSend}
            disabled={!accountNumber || !selectedBank || banksLoading}
            className="network-accent w-full"
          >
            Send
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
