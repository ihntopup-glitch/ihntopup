'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { SavedUid } from "@/lib/data";
import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { Label } from "./ui/label";

interface SavedUidsCardProps {
    savedUids: SavedUid[];
}

export default function SavedUidsCard({ savedUids }: SavedUidsCardProps) {
    const [uids, setUids] = useState<SavedUid[]>(savedUids);
    const [newGame, setNewGame] = useState('');
    const [newUid, setNewUid] = useState('');

    const handleAddUid = () => {
        if (newGame && newUid) {
            setUids([...uids, { game: newGame, uid: newUid }]);
            setNewGame('');
            setNewUid('');
            // In a real app, you would also update this in Firestore
        }
    };

    const handleRemoveUid = (index: number) => {
        setUids(uids.filter((_, i) => i !== index));
        // In a real app, you would also update this in Firestore
    };
    
    return (
        <div className="pt-2">
            <CardDescription className="mb-4 text-center">Manage your frequently used game IDs for faster checkout.</CardDescription>
            <div className="space-y-3 max-h-60 overflow-y-auto p-1">
                {uids.map((item, index) => (
                    <div key={index} className="flex items-center gap-2 p-3 rounded-lg bg-muted border">
                        <div className="flex-grow">
                            <p className="font-semibold">{item.game}</p>
                            <p className="text-sm text-muted-foreground font-mono">{item.uid}</p>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => handleRemoveUid(index)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                    </div>
                ))}
                {uids.length === 0 && (
                    <p className="text-center text-muted-foreground text-sm py-4">No UIDs saved yet.</p>
                )}
            </div>
             <div className="mt-4 pt-4 border-t space-y-4">
                <p className="font-medium text-center">Add New UID</p>
                <div className="space-y-2">
                    <Label htmlFor="new-game-name">Game Name</Label>
                    <Input id="new-game-name" placeholder="e.g. Free Fire" value={newGame} onChange={(e) => setNewGame(e.target.value)} />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="new-game-uid">Game UID</Label>
                    <Input id="new-game-uid" placeholder="Enter Game UID" value={newUid} onChange={(e) => setNewUid(e.target.value)} />
                </div>
                <Button onClick={handleAddUid} className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Add UID
                </Button>
            </div>
        </div>
    );
}
