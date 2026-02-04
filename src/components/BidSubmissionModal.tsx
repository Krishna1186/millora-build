
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DollarSign } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface BidSubmissionModalProps {
  projectId: string;
  projectName: string;
  onBidSubmitted: () => void;
  hasExistingBid?: boolean;
}

const BidSubmissionModal = ({ projectId, projectName, onBidSubmitted, hasExistingBid }: BidSubmissionModalProps) => {
  const [open, setOpen] = useState(false);
  const [price, setPrice] = useState("");
  const [deliveryTime, setDeliveryTime] = useState("");
  const [expectedDate, setExpectedDate] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!price || !deliveryTime || !user) {
      toast({
        title: "Missing information",
        description: "Please fill in price and delivery time",
        variant: "destructive"
      });
      return;
    }

    setSubmitting(true);

    try {
      console.log('Submitting bid:', { projectId, manufacturerId: user.id, price, deliveryTime, expectedDate });
      
      const bidData: any = {
        project_id: projectId,
        manufacturer_id: user.id,
        price: parseFloat(price),
        estimated_delivery_time: parseInt(deliveryTime),
        notes: notes || null
      };

      // Add expected delivery date if provided
      if (expectedDate) {
        bidData.expected_delivery_date = expectedDate;
      }

      const { error } = await supabase
        .from('bids')
        .insert(bidData);

      if (error) throw error;

      toast({
        title: "Bid submitted successfully!",
        description: "The customer will review your bid and get back to you."
      });

      // Reset form
      setPrice("");
      setDeliveryTime("");
      setExpectedDate("");
      setNotes("");
      setOpen(false);
      onBidSubmitted();
      
    } catch (error: any) {
      console.error('Error submitting bid:', error);
      toast({
        title: "Failed to submit bid",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (hasExistingBid) {
    return (
      <Button variant="outline" size="sm" disabled>
        Bid Already Submitted
      </Button>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="luxury-button luxury-button-primary">
          <DollarSign className="w-4 h-4 mr-2" />
          Submit Bid
        </Button>
      </DialogTrigger>
      
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Submit Bid for {projectName}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="price">Price ($)</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0.00"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="deliveryTime">Delivery Time (Days)</Label>
              <Input
                id="deliveryTime"
                type="number"
                value={deliveryTime}
                onChange={(e) => setDeliveryTime(e.target.value)}
                placeholder="e.g., 14"
                required
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="expectedDate">Expected Delivery Date (Optional)</Label>
            <Input
              id="expectedDate"
              type="date"
              value={expectedDate}
              onChange={(e) => setExpectedDate(e.target.value)}
            />
          </div>
          
          <div>
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any additional information about your bid..."
              rows={3}
            />
          </div>
          
          <Button 
            type="submit"
            className="w-full luxury-button luxury-button-primary"
            disabled={submitting}
          >
            {submitting ? "Submitting..." : "Submit Bid"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default BidSubmissionModal;
