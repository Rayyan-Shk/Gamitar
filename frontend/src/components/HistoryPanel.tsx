
import * as React from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { ScrollArea } from "@/components/ui/scroll-area";
import { HistoryEntry } from '../types';
import { History, Clock } from 'lucide-react';

interface HistoryPanelProps {
  history: HistoryEntry[];
  onSelectTimestamp: (timestamp: number) => void;
}

const HistoryPanel: React.FC<HistoryPanelProps> = ({ history, onSelectTimestamp }) => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline"
          className="bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600"
        >
          <History className="mr-2" /> View History
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-white">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-purple-600 flex items-center gap-2">
            <Clock /> Grid History
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            Explore previous moves and states of the grid
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className=" flex h-[300px] w-full pr-4">
          <div className="space-y-2">
            {history.length === 0 ? (
              <p className="text-center text-gray-500 p-4">No moves recorded yet</p>
            ) : (
              history.sort((a, b) => b.timestamp - a.timestamp).map((entry) => {
                const updates = entry.updates[0];
                return (
                  <Button
                    key={entry.timestamp}
                    variant="ghost"
                    className="w-full p-4 hover:bg-purple-50 transition-colors duration-200 border border-gray-100 rounded-lg"
                    onClick={() => {
                      onSelectTimestamp(entry.timestamp);
                      setIsOpen(false);
                    }}
                  >
                    <div className="flex justify-between items-start gap-2 w-full">
                      <span className="text-sm font-medium text-purple-600">
                        {new Date(entry.timestamp).toLocaleString()}
                      </span>
                      <span className="text-xs text-gray-600">
                        Player {updates.playerId.slice(0, 8)} placed "{updates.value}"
                        <br />
                        Position: ({updates.row}, {updates.col})
                      </span>
                    </div>
                  </Button>
                );
              })
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default HistoryPanel;