
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, User, FileText } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Event {
  id: string;
  title: string;
  community: string;
  type: string;
  description: string;
  status: 'pending' | 'approved' | 'rejected';
  datetime: string;
  poster_url?: string;
  created_by: string;
}

interface EventModalProps {
  event: Event;
  onClose: () => void;
  onUpdate: () => void;
}

export const EventModal = ({ event, onClose, onUpdate }: EventModalProps) => {
  const { profile } = useAuth();
  const { toast } = useToast();

  const updateEventStatus = async (newStatus: 'pending' | 'approved' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('events')
        .update({ status: newStatus })
        .eq('id', event.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Event ${newStatus} successfully!`,
      });

      onUpdate();
      onClose();
    } catch (error) {
      console.error('Error updating event:', error);
      toast({
        title: "Error",
        description: "Failed to update event status",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{event.title}</span>
            <Badge className={getStatusColor(event.status)}>
              {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {event.poster_url && (
            <div className="w-full">
              <img
                src={event.poster_url}
                alt="Event Poster"
                className="w-full h-64 object-cover rounded-lg"
              />
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span>{new Date(event.datetime).toLocaleString()}</span>
            </div>

            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-muted-foreground" />
              <span>{event.community}</span>
            </div>

            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-muted-foreground" />
              <span>{event.type}</span>
            </div>
          </div>

          {event.description && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium">Description</span>
              </div>
              <p className="text-muted-foreground">{event.description}</p>
            </div>
          )}

          {profile?.role === 'hod' && (
            <div className="flex gap-2 pt-4 border-t">
              <Button
                onClick={() => updateEventStatus('approved')}
                className="bg-green-600 hover:bg-green-700"
                disabled={event.status === 'approved'}
              >
                Approve
              </Button>
              <Button
                onClick={() => updateEventStatus('rejected')}
                variant="destructive"
                disabled={event.status === 'rejected'}
              >
                Reject
              </Button>
              <Button
                onClick={() => updateEventStatus('pending')}
                variant="outline"
                disabled={event.status === 'pending'}
              >
                Mark Pending
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
