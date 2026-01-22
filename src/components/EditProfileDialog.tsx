import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Save } from "lucide-react";

interface EditProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentYears: number | null;
  onSave: (years: number) => Promise<void>;
}

const EditProfileDialog = ({
  open,
  onOpenChange,
  currentYears,
  onSave,
}: EditProfileDialogProps) => {
  const [years, setYears] = useState<string>(String(currentYears ?? 0));
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    const numYears = parseInt(years, 10);
    if (isNaN(numYears) || numYears < 0) return;
    
    setIsSaving(true);
    try {
      await onSave(numYears);
      onOpenChange(false);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="font-serif text-navy">Edit Profile</DialogTitle>
          <DialogDescription>
            Update your years of experience. This affects your professional tier badge and case creation permissions.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="years" className="text-navy font-medium">
              Years of Experience
            </Label>
            <Input
              id="years"
              type="number"
              min="0"
              max="60"
              value={years}
              onChange={(e) => setYears(e.target.value)}
              className="border-navy/20 focus:border-gold focus:ring-gold"
            />
            <p className="text-sm text-muted-foreground">
              {parseInt(years) > 5 
                ? "✓ You can add new cases to the database" 
                : "Note: 5+ years required to add cases"}
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={isSaving}
            className="bg-navy hover:bg-navy/90"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditProfileDialog;
